import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import '../../config/config_repository.dart';
import '../../config/mobile_config.dart';
import 'intro.dart';
import 'theme.dart';

/// Host composition point; production router/authentication remain external.
/// Remote refresh does not block startup or mutate an active report.
class HorizonBootstrap extends StatefulWidget {
  const HorizonBootstrap(
      {super.key,
      required this.repository,
      required this.reportInProgress,
      required this.contentBuilder,
      required this.locale,
      this.officialLogo});
  final ConfigRepository repository;
  final bool reportInProgress;
  final Widget Function(BuildContext, MobileConfig) contentBuilder;
  final Locale locale;
  final Widget? officialLogo;
  @override
  State<HorizonBootstrap> createState() => _HorizonBootstrapState();
}

class _HorizonBootstrapState extends State<HorizonBootstrap>
    with WidgetsBindingObserver {
  bool _ready = false;
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    unawaited(_start());
  }

  Future<void> _start() async {
    await widget.repository.initialize();
    if (!mounted) return;
    setState(() => _ready = true);
    unawaited(_refresh());
  }

  Future<void> _refresh() async {
    await widget.repository.refresh();
    if (!mounted) return;
    _apply();
  }

  void _apply() {
    final changed =
        widget.repository.apply(reportInProgress: widget.reportInProgress);
    if (mounted && changed) setState(() {});
  }

  @override
  void didUpdateWidget(covariant HorizonBootstrap oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!widget.reportInProgress && oldWidget.reportInProgress) _apply();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && _ready) unawaited(_refresh());
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final config = widget.repository.active;
    return MaterialApp(
        supportedLocales: const [
          Locale('fr'),
          Locale('en'),
          Locale('de'),
          Locale('nl')
        ],
        localizationsDelegates: GlobalMaterialLocalizations.delegates,
        title: config.title,
        locale: widget.locale,
        theme: horizonTheme(config),
        home: _ready
            ? Builder(
                builder: (context) => widget.contentBuilder(context, config))
            : HorizonIntro(config: config, officialLogo: widget.officialLogo));
  }
}
