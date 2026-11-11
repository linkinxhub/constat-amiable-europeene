import 'dart:async';

import 'package:flutter/material.dart';

import '../app/brand.dart';
import '../app/preferences.dart';
import '../app/startup_sound.dart';
import '../config/config_repository.dart';
import '../config/mobile_config.dart';
import '../design/horizon/bootstrap.dart';
import '../design/horizon/copy.dart';
import '../design/horizon/home.dart';
import '../reports/copy.dart';
import '../reports/store.dart';
import '../reports/editor.dart';
import '../reports/list.dart';
import '../reports/model.dart';
import 'api.dart';
import 'copy.dart';
import 'pages.dart';

class NativeAccordiaApp extends StatefulWidget {
  const NativeAccordiaApp({
    super.key,
    required this.repository,
    required this.preferences,
    required this.initialPreferences,
    required this.sound,
    required this.drafts,
    required this.reportData,
    required this.api,
  });
  final ConfigRepository repository;
  final PreferenceStore preferences;
  final AppPreferences initialPreferences;
  final StartupSound sound;
  final DraftStore drafts;
  final Map<String, dynamic> reportData;
  final NativeApi api;
  @override
  State<NativeAccordiaApp> createState() => _NativeAccordiaAppState();
}

class _NativeAccordiaAppState extends State<NativeAccordiaApp>
    with WidgetsBindingObserver {
  late AppPreferences prefs;
  int depth = 0;
  @override
  void initState() {
    super.initState();
    prefs = widget.initialPreferences;
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    unawaited(widget.sound.dispose());
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state != AppLifecycleState.resumed) unawaited(widget.sound.pause());
  }

  Future<void> language(HorizonLanguage lang) async {
    setState(() => prefs = AppPreferences(language: lang, sound: prefs.sound));
    try {
      await widget.preferences.write(prefs);
    } catch (_) {}
  }

  Future<void> open(BuildContext context, String page, {String? id}) async {
    final c = NativeCopy(prefs.language),
        r = ReportCopy(widget.reportData, prefs.language);
    void next(String page, {String? id}) =>
        unawaited(open(context, page, id: id));
    Widget target;
    switch (page) {
      case 'welcome':
        target = NativeLandingPage(copy: c, open: next);
      case 'report':
      case 'together':
        final report = newReport(prefs.language.name);
        report['start'] = {
          'ownerSide': 'A',
          'photoOwner': 'both',
          'autoSketch': false,
          'participationMode': page == 'together' ? 'same-device' : 'solo',
        };
        if (page == 'together') report['count'] = '2';
        target = ReportEditor(
          copy: r,
          store: widget.drafts,
          initial: LocalDraft(report, 0),
        );
      case 'local':
        target = DraftsPage(copy: r, store: widget.drafts);
      case 'guide':
        target = NativeGuidePage(copy: c, reportCopy: r);
      case 'pricing':
        target = NativePricingPage(copy: c);
      case 'feedback':
        target = NativeFeedbackPage(api: widget.api, copy: c);
      case 'join':
        target = NativeJoinPage(api: widget.api, copy: c, open: next);
      case 'account':
        target = NativeAccountPage(api: widget.api, copy: c, open: next);
      case 'cloud':
        target = NativeReportsPage(api: widget.api, copy: c, open: next);
      case 'cloudReport':
        if (id == null) return;
        target = NativeCloudReportPage(api: widget.api, copy: c, id: id);
      case 'session':
        target = id == null
            ? NativeReportsPage(
                api: widget.api,
                copy: c,
                open: next,
                sessions: true,
              )
            : NativeSessionPage(
                api: widget.api,
                copy: c,
                reportCopy: r,
                id: id,
              );
      case 'admin':
        target = NativeAdminPage(api: widget.api, copy: c);
      default:
        return;
    }
    setState(() => depth++);
    try {
      await Navigator.push(
        context,
        MaterialPageRoute<void>(builder: (_) => target),
      );
    } finally {
      if (mounted) setState(() => depth--);
    }
  }

  Future<void> settings(BuildContext context, MobileConfig config) async {
    final c = NativeCopy(prefs.language);
    await showModalBottomSheet<void>(
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
              Text(
                c.t('settings'),
                style: Theme.of(sheet).textTheme.headlineSmall,
              ),
              SwitchListTile(
                title: Text(c.t('sound')),
                value: prefs.sound ?? config.soundDefault,
                onChanged: (v) async {
                  setState(
                    () => prefs = AppPreferences(
                      language: prefs.language,
                      sound: v,
                    ),
                  );
                  update(() {});
                  try {
                    await widget.preferences.write(prefs);
                  } catch (e) {
                    if (sheet.mounted) nativeMessage(sheet, c, e);
                  }
                },
              ),
              for (final page in [
                'welcome',
                'guide',
                'pricing',
                'feedback',
                'cloud',
                'session',
                'admin',
              ])
                ListTile(
                  title: Text(c.t(page)),
                  onTap: () {
                    Navigator.pop(sheet);
                    unawaited(open(context, page));
                  },
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
    reportInProgress: depth > 0,
    locale: Locale(prefs.language.name),
    onIntroFinished: () => unawaited(widget.sound.pause()),
    startupBuilder: (context, config, child) => _NativeSoundGate(
      sound: widget.sound,
      config: config,
      preference: prefs.sound,
      child: child,
    ),
    contentBuilder: (context, config) => HorizonHome(
      config: config,
      language: prefs.language,
      onLanguageChanged: (v) => unawaited(language(v)),
      officialLogo: AccordiaBrand(title: config.title, inverted: true),
      onStart: () => unawaited(open(context, 'report')),
      onJoin: () => unawaited(open(context, 'join')),
      onTogether: () => unawaited(open(context, 'together')),
      onDrafts: () => unawaited(open(context, 'local')),
      onReports: () => unawaited(open(context, 'cloud')),
      onAccount: () => unawaited(open(context, 'account')),
      onHelp: () => unawaited(open(context, 'guide')),
      onSettings: () => unawaited(settings(context, config)),
    ),
  );
}

class _NativeSoundGate extends StatefulWidget {
  const _NativeSoundGate({
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
  State<_NativeSoundGate> createState() => _NativeSoundGateState();
}

class _NativeSoundGateState extends State<_NativeSoundGate> {
  bool started = false;
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!started) {
      started = true;
      final reduce = MediaQuery.disableAnimationsOf(context);
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted)
          unawaited(
            widget.sound.start(
              widget.config,
              userPreference: widget.preference,
              reduceMotion: reduce,
            ),
          );
      });
    }
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
