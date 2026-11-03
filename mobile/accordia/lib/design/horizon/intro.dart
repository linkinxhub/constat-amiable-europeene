import 'package:flutter/material.dart';
import '../../config/mobile_config.dart';

/// Flutter introduction, NOT the Android/iOS native launch screen.
/// Bootstrap owns readiness/navigation and audio policy; no enforced delay here.
class HorizonIntro extends StatelessWidget {
  const HorizonIntro({super.key, required this.config, this.officialLogo});
  final MobileConfig config;
  final Widget? officialLogo;
  @override
  Widget build(BuildContext context) {
    final reduced = MediaQuery.of(context).disableAnimations;
    final primary = Color(config.primaryColor);
    final background = Color.lerp(primary, Colors.black, .56)!;
    return Scaffold(backgroundColor: background, body: DecoratedBox(
      decoration: BoxDecoration(gradient: RadialGradient(
        center: Alignment(.6, .8), radius: 1.3,
        colors: [background, Color.lerp(primary, Colors.black, .65)!,
          Color.lerp(primary, Colors.black, .8)!])),
      child: SizedBox.expand(child: SafeArea(child: Center(
        child: TweenAnimationBuilder<double>(
          tween: Tween(begin: reduced || !config.introEnabled ? 1 : .9, end: 1),
          duration: Duration(milliseconds: reduced || !config.introEnabled
            ? 0 : config.introDurationMs),
          builder: (context, value, child) => Transform.scale(scale: value, child: child),
          child: Semantics(label: config.title, image: true, child: ExcludeSemantics(
            child: Padding(padding: const EdgeInsets.all(32),
              child: officialLogo ?? Text(config.title, textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white, fontSize: 44,
                  fontWeight: FontWeight.w800, letterSpacing: -1.5))))),
        ),
      ))),
    ));
  }
}
