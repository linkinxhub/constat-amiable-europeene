import 'dart:async';

import 'package:flutter/material.dart';

import '../config/config_repository.dart';
import '../config/mobile_config.dart';
import '../design/horizon/bootstrap.dart';
import '../design/horizon/copy.dart';
import '../design/horizon/home.dart';
import '../design/horizon/splash_copy.dart';
import 'copy.dart';
import 'brand.dart';
import 'preferences.dart';
import 'startup_sound.dart';
import 'web_actions.dart';
import '../reports/copy.dart';
import '../reports/store.dart';
import '../reports/editor.dart';
import '../reports/list.dart';
import '../platform/page.dart';
import '../platform/copy.dart';
import '../platform/policy.dart';
import '../platform/scanner.dart';

class AccordiaApp extends StatefulWidget {
  const AccordiaApp({
    super.key,
    required this.repository,
    required this.preferences,
    required this.initialPreferences,
    required this.sound,
    required this.openWebsite,
    required this.drafts,
    required this.reportData,
    this.platformBuilder,
  });
  final Widget Function(Uri, PlatformCopy, Future<bool> Function(Uri))?
  platformBuilder;
  final DraftStore drafts;
  final Map<String, dynamic> reportData;
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
  bool _reportActive = false;
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

  Future<void> _platform(BuildContext context, Uri uri) async {
    if (_reportActive || !isAccordia(uri)) return;
    setState(() => _reportActive = true);
    final copy = PlatformCopy(_preferences.language);
    try {
      await Navigator.push(
        context,
        MaterialPageRoute<void>(
          builder: (_) =>
              widget.platformBuilder?.call(uri, copy, (_) async => false) ??
              AccordiaPlatformPage(
                uri: uri,
                copy: copy,
                openOutside: (_) async => false,
                onPresentation: (data) async {
                  await widget.repository.stageFromWebView(data);
                },
              ),
        ),
      );
    } finally {
      if (mounted) setState(() => _reportActive = false);
    }
  }

  Future<void> _links(BuildContext context) async {
    final c = PlatformCopy(_preferences.language);
    var action = await showModalBottomSheet<int>(
      context: context,
      useSafeArea: true,
      builder: (sheet) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: Text(c.t('join')),
              onTap: () => Navigator.pop(sheet, 0),
            ),
            ListTile(
              leading: const Icon(Icons.qr_code_scanner),
              title: Text(c.t('scan')),
              onTap: () => Navigator.pop(sheet, 1),
            ),
            ListTile(
              leading: const Icon(Icons.link),
              title: Text(c.t('paste')),
              onTap: () => Navigator.pop(sheet, 2),
            ),
          ],
        ),
      ),
    );
    if (action == null || !context.mounted) return;
    Uri? uri;
    if (action == 0) {
      uri = websiteAction(WebAction.join, _preferences.language);
    } else if (action == 1) {
      uri = await Navigator.push<Uri>(
        context,
        MaterialPageRoute(builder: (_) => AccordiaScanner(copy: c)),
      );
      if (uri?.scheme == 'accordia-paste') {
        uri = null;
        action = 2;
      }
    }
    if (action == 2 && context.mounted) {
      final input = TextEditingController();
      String? error;
      uri = await showDialog<Uri>(
        context: context,
        builder: (dialog) => StatefulBuilder(
          builder: (dialog, update) => AlertDialog(
            title: Text(c.t('paste')),
            content: TextField(
              controller: input,
              maxLength: 8192,
              decoration: InputDecoration(
                hintText: c.t('linkHint'),
                errorText: error,
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(dialog),
                child: Text(c.t('cancel')),
              ),
              FilledButton(
                onPressed: () {
                  final parsed = scannedAccordia(input.text);
                  if (parsed == null) {
                    update(() => error = c.t('invalid'));
                  } else {
                    Navigator.pop(dialog, parsed);
                  }
                },
                child: Text(c.t('open')),
              ),
            ],
          ),
        ),
      );
      // The dialog route may still be animating out; dispose after its transition.
      await Future<void>.delayed(const Duration(milliseconds: 350));
      input.dispose();
    }
    if (uri != null && context.mounted) await _platform(context, uri);
  }

  Future<void> _draftChoice(BuildContext context) async {
    final c = PlatformCopy(_preferences.language);
    final local = await showModalBottomSheet<bool>(
      context: context,
      useSafeArea: true,
      builder: (sheet) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(c.t('scope')),
            ListTile(
              title: Text(c.t('online')),
              onTap: () => Navigator.pop(sheet, false),
            ),
            ListTile(
              title: Text(c.t('local')),
              onTap: () => Navigator.pop(sheet, true),
            ),
          ],
        ),
      ),
    );
    if (local == null || !context.mounted) return;
    if (local) {
      await _native(context, 1);
    } else {
      await _platform(
        context,
        websiteAction(WebAction.drafts, _preferences.language),
      );
    }
  }

  Future<void> _native(BuildContext context, int action) async {
    if (_reportActive) return;
    setState(() => _reportActive = true);
    final copy = ReportCopy(widget.reportData, _preferences.language);
    try {
      await Navigator.push(
        context,
        MaterialPageRoute<void>(
          builder: (_) => action == 0
              ? ReportEditor(copy: copy, store: widget.drafts)
              : DraftsPage(copy: copy, store: widget.drafts),
        ),
      );
    } finally {
      if (mounted) setState(() => _reportActive = false);
    }
  }

  void _information(BuildContext context, {bool unavailable = false}) {
    final copy = ReportCopy(widget.reportData, _preferences.language);
    showModalBottomSheet<void>(
      context: context,
      useSafeArea: true,
      isScrollControlled: true,
      builder: (sheet) => SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              copy.text(unavailable ? 'perspectives' : 'guideTitle'),
              style: Theme.of(sheet).textTheme.headlineSmall,
            ),
            const SizedBox(height: 16),
            Text(
              unavailable
                  ? copy.n('account')
                  : PlatformCopy(_preferences.language).t('help'),
            ),
            if (!unavailable) ...[
              const SizedBox(height: 16),
              Text(SplashCopy.values[_preferences.language]!.guide),
              const SizedBox(height: 24),
              Text(copy.n('rescueHelp')),
              OutlinedButton(
                onPressed: () {
                  Navigator.pop(sheet);
                  unawaited(
                    _platform(
                      context,
                      websiteAction(WebAction.help, _preferences.language),
                    ),
                  );
                },
                child: Text(copy.n('rescue')),
              ),
            ],
          ],
        ),
      ),
    );
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
              Text(PlatformCopy(_preferences.language).t('scope')),
              const SizedBox(height: 16),
              OutlinedButton(
                onPressed: () {
                  Navigator.pop(sheet);
                  unawaited(_native(context, 0));
                },
                child: Text(PlatformCopy(_preferences.language).t('offline')),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) => HorizonBootstrap(
    repository: widget.repository,
    reportInProgress: _reportActive,
    locale: Locale(_preferences.language.name),
    onIntroFinished: () => unawaited(widget.sound.pause()),
    startupBuilder: (context, config, child) => _SoundGate(
      sound: widget.sound,
      config: config,
      preference: _preferences.sound,
      child: child,
    ),
    contentBuilder: (context, config) => HorizonHome(
      config: config,
      language: _preferences.language,
      onLanguageChanged: (value) => unawaited(_language(context, value)),
      onStart: () => unawaited(
        _platform(
          context,
          websiteAction(WebAction.start, _preferences.language),
        ),
      ),
      onJoin: () => unawaited(_links(context)),
      onTogether: () => unawaited(
        _platform(
          context,
          websiteAction(WebAction.together, _preferences.language),
        ),
      ),
      onDrafts: () => unawaited(_draftChoice(context)),
      onReports: () => unawaited(
        _platform(
          context,
          websiteAction(WebAction.reports, _preferences.language),
        ),
      ),
      onAccount: () => unawaited(
        _platform(
          context,
          websiteAction(WebAction.account, _preferences.language),
        ),
      ),
      onHelp: () => _information(context),
      onSettings: () => _settings(context, config),
      officialLogo: AccordiaBrand(title: config.title, inverted: true),
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
