import 'dart:async';

import 'package:flutter/material.dart';

import '../config/config_repository.dart';
import '../config/mobile_config.dart';
import '../design/horizon/bootstrap.dart';
import '../design/horizon/copy.dart';
import '../design/horizon/home.dart';
import 'copy.dart';
import 'brand.dart';
import 'preferences.dart';
import 'startup_sound.dart';
import 'web_actions.dart';

class AccordiaApp extends StatefulWidget {
  const AccordiaApp({
    super.key,
    required this.repository,
    required this.preferences,
    required this.initialPreferences,
    required this.sound,
    required this.openWebsite,
  });
  final ConfigRepository repository;
  final PreferenceStore preferences;
  final AppPreferences initialPreferences;
  final StartupSound sound;
  final Future<bool> Function(Uri) openWebsite;
  @override
  State<AccordiaApp> createState() => _AccordiaAppState();
}

class _AccordiaAppState extends State<AccordiaApp> with WidgetsBindingObserver {
  late AppPreferences _preferences;
  bool _opening = false;
  @override
  void initState() {
    super.initState();
    _preferences = widget.initialPreferences;
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state != AppLifecycleState.resumed) unawaited(widget.sound.pause());
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    unawaited(widget.sound.dispose());
    super.dispose();
  }

  Future<bool> _save(AppPreferences value) async {
    setState(() => _preferences = value);
    try {
      await widget.preferences.write(value);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<void> _language(BuildContext context, HorizonLanguage language) async {
    final saved = await _save(
      AppPreferences(language: language, sound: _preferences.sound),
    );
    if (!saved && context.mounted)
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(AppCopy.values[language]!.saveFailed)),
      );
  }

  Future<void> _web(BuildContext context, WebAction action) async {
    if (_opening) return;
    _opening = true;
    final c = AppCopy.values[_preferences.language]!;
    final uri = websiteAction(action, _preferences.language);
    try {
      final accepted = await showModalBottomSheet<bool>(
        context: context,
        useSafeArea: true,
        isScrollControlled: true,
        builder: (sheet) => SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(c.webTitle, style: Theme.of(sheet).textTheme.headlineSmall),
              const SizedBox(height: 12),
              Text(c.webHelp),
              if (action == WebAction.drafts)
                Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: Text(c.webDrafts),
                ),
              const SizedBox(height: 16),
              SelectableText(uri.host),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: () => Navigator.pop(sheet, true),
                child: Text(c.continueWeb),
              ),
              TextButton(
                onPressed: () => Navigator.pop(sheet, false),
                child: Text(c.cancel),
              ),
            ],
          ),
        ),
      );
      if (accepted != true || !mounted) return;
      bool opened;
      try {
        opened = await widget.openWebsite(uri);
      } catch (_) {
        opened = false;
      }
      if (!opened && context.mounted)
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(c.failure)));
    } finally {
      _opening = false;
    }
  }

  void _settings(BuildContext context, MobileConfig config) {
    final c = AppCopy.values[_preferences.language]!;
    showModalBottomSheet<void>(
      context: context,
      useSafeArea: true,
      isScrollControlled: true,
      builder: (sheet) => StatefulBuilder(
        builder: (sheet, update) => SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(c.settings, style: Theme.of(sheet).textTheme.headlineSmall),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(c.sound),
                subtitle: Text(c.soundHelp),
                value: _preferences.sound ?? config.soundDefault,
                onChanged: (value) async {
                  final saved = await _save(
                    AppPreferences(
                      language: _preferences.language,
                      sound: value,
                    ),
                  );
                  if (!sheet.mounted) return;
                  update(() {});
                  if (!saved)
                    ScaffoldMessenger.of(sheet)
                        .showSnackBar(SnackBar(content: Text(c.saveFailed)));
                },
              ),
              const Divider(),
              Text(c.scope),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) => HorizonBootstrap(
    repository: widget.repository,
    reportInProgress: false,
    locale: Locale(_preferences.language.name),
    contentBuilder: (context, config) => _SoundGate(
      sound: widget.sound,
      config: config,
      preference: _preferences.sound,
      child: HorizonHome(
        config: config,
        language: _preferences.language,
        onLanguageChanged: (value) => unawaited(_language(context, value)),
        onStart: () => unawaited(_web(context, WebAction.start)),
        onJoin: () => unawaited(_web(context, WebAction.join)),
        onDrafts: () => unawaited(_web(context, WebAction.drafts)),
        onReports: () => unawaited(_web(context, WebAction.reports)),
        onAccount: () => unawaited(_web(context, WebAction.account)),
        onHelp: () => unawaited(_web(context, WebAction.help)),
        onSettings: () => _settings(context, config),
        officialLogo: AccordiaBrand(title: config.title),
      ),
    ),
  );
}

class _SoundGate extends StatefulWidget {
  const _SoundGate({
    required this.sound,
    required this.config,
    required this.preference,
    required this.child,
  });
  final StartupSound sound;
  final MobileConfig config;
  final bool? preference;
  final Widget child;
  @override
  State<_SoundGate> createState() => _SoundGateState();
}

class _SoundGateState extends State<_SoundGate> {
  bool _started = false;
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_started) {
      _started = true;
      final reduced = MediaQuery.of(context).disableAnimations;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted)
          unawaited(
            widget.sound.start(
              widget.config,
              userPreference: widget.preference,
              reduceMotion: reduced,
            ),
          );
      });
    }
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
