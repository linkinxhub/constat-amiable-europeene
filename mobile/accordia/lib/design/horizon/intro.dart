import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../config/mobile_config.dart';
import 'copy.dart';
import 'splash_copy.dart';

/// Native Flutter scene, after the OS launch screen. No network or permissions.
class HorizonIntro extends StatefulWidget {
  const HorizonIntro({
    super.key,
    required this.config,
    this.officialLogo,
    this.language = HorizonLanguage.fr,
    this.onCompleted,
  });
  final MobileConfig config;
  final Widget? officialLogo;
  final HorizonLanguage language;
  final VoidCallback? onCompleted;
  @override
  State<HorizonIntro> createState() => _HorizonIntroState();
}

class _HorizonIntroState extends State<HorizonIntro>
    with SingleTickerProviderStateMixin, WidgetsBindingObserver {
  late final AnimationController _controller;
  bool _started = false, _notified = false;
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _controller =
        AnimationController(
          vsync: this,
          duration: Duration(milliseconds: widget.config.introDurationMs),
        )..addStatusListener((status) {
          if (status == AnimationStatus.completed) _complete();
        });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final reduced = MediaQuery.disableAnimationsOf(context);
    if (reduced ||
        !widget.config.introEnabled ||
        widget.config.introDurationMs == 0) {
      _controller.value = 1;
      _complete();
    } else if (!_started) {
      _controller.forward();
    }
    _started = true;
  }

  void _complete() {
    if (_notified) return;
    _notified = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) widget.onCompleted?.call();
    });
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (_notified) return;
    if (state == AppLifecycleState.resumed) {
      _controller.forward();
    } else {
      _controller.stop(canceled: false);
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _controller.dispose();
    super.dispose();
  }

  double _stage(double value, double start, double end) => Curves.easeOutCubic
      .transform(((value - start) / (end - start)).clamp(0.0, 1.0));
  @override
  Widget build(BuildContext context) {
    final primary = Color(widget.config.primaryColor);
    final c = SplashCopy.values[widget.language]!;
    return Scaffold(
      backgroundColor: const Color(0xff061c4c),
      body: DecoratedBox(
        decoration: BoxDecoration(
          gradient: RadialGradient(
            center: const Alignment(.2, .2),
            radius: 1.2,
            colors: [
              Color.lerp(primary, const Color(0xff061c4c), .35)!,
              const Color(0xff04102d),
            ],
          ),
        ),
        child: SafeArea(
          child: LayoutBuilder(
            builder: (context, size) {
              final emblem = math.min(size.maxWidth * .43, 190.0);
              final sceneHeight = (size.maxHeight * .34).clamp(140.0, 310.0);
              return AnimatedBuilder(
                animation: _controller,
                builder: (context, _) {
                  final value = _controller.value;
                  final logo = _stage(value, .28, .76),
                      text = _stage(value, .48, .92);
                  final scene = _stage(value, 0, .36);
                  return Stack(
                    children: [
                      Positioned.fill(
                        child: ExcludeSemantics(
                          child: CustomPaint(
                            painter: _SerenityTrail(
                              _stage(value, .1, .7),
                              primary,
                            ),
                          ),
                        ),
                      ),
                      Column(
                        children: [
                          Expanded(
                            child: SingleChildScrollView(
                              child: ConstrainedBox(
                                constraints: BoxConstraints(
                                  minHeight: math.max(0, size.maxHeight - 58),
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 24,
                                    vertical: 18,
                                  ),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Opacity(
                                        opacity: logo,
                                        child: Transform.translate(
                                          offset: Offset(0, 18 * (1 - logo)),
                                          child: Transform.scale(
                                            scale: .86 + .14 * logo,
                                            child:
                                                widget.officialLogo ??
                                                Semantics(
                                                  label: widget.config.title,
                                                  image: true,
                                                  child: ExcludeSemantics(
                                                    child: Container(
                                                      width: emblem,
                                                      height: emblem,
                                                      padding:
                                                          const EdgeInsets.all(
                                                            10,
                                                          ),
                                                      decoration: BoxDecoration(
                                                        shape: BoxShape.circle,
                                                        boxShadow: [
                                                          BoxShadow(
                                                            color:
                                                                const Color(
                                                                  0xff35caff,
                                                                ).withValues(
                                                                  alpha:
                                                                      .27 *
                                                                      logo,
                                                                ),
                                                            blurRadius: 48,
                                                            spreadRadius: 4,
                                                          ),
                                                        ],
                                                      ),
                                                      child: Stack(
                                                        children: [
                                                          Positioned.fill(
                                                            top: 5,
                                                            child: Image.asset(
                                                              'assets/brand/shield-relief.png',
                                                              color:
                                                                  const Color(
                                                                    0xff3977b9,
                                                                  ),
                                                            ),
                                                          ),
                                                          Positioned.fill(
                                                            child: Image.asset(
                                                              'assets/brand/shield-relief.png',
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(height: 20),
                                      Opacity(
                                        opacity: text,
                                        child: Transform.translate(
                                          offset: Offset(0, 10 * (1 - text)),
                                          child: Column(
                                            children: [
                                              Text(
                                                widget.config.title,
                                                textAlign: TextAlign.center,
                                                maxLines: 2,
                                                overflow: TextOverflow.ellipsis,
                                                style: const TextStyle(
                                                  color: Colors.white,
                                                  fontSize: 40,
                                                  fontWeight: FontWeight.w800,
                                                  letterSpacing: -1,
                                                ),
                                              ),
                                              const SizedBox(height: 10),
                                              Text(
                                                c.tagline,
                                                textAlign: TextAlign.center,
                                                style: const TextStyle(
                                                  color: Color(0xffdfedff),
                                                  fontSize: 17,
                                                  height: 1.4,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                      const SizedBox(height: 22),
                                      ExcludeSemantics(
                                        child: Opacity(
                                          opacity: scene,
                                          child: Transform.translate(
                                            offset: Offset(0, 24 * (1 - scene)),
                                            child: ClipRRect(
                                              borderRadius:
                                                  BorderRadius.circular(30),
                                              child: ShaderMask(
                                                blendMode: BlendMode.dstIn,
                                                shaderCallback: (bounds) =>
                                                    const LinearGradient(
                                                      begin:
                                                          Alignment.topCenter,
                                                      end: Alignment
                                                          .bottomCenter,
                                                      colors: [
                                                        Colors.transparent,
                                                        Colors.white,
                                                        Colors.white,
                                                      ],
                                                      stops: [0, .16, 1],
                                                    ).createShader(bounds),
                                                child: SizedBox(
                                                  height: sceneHeight,
                                                  width: double.infinity,
                                                  child: Image.asset(
                                                    'assets/horizon/azur-accident.webp',
                                                    fit: BoxFit.cover,
                                                    alignment:
                                                        Alignment.bottomCenter,
                                                    errorBuilder: (
                                                      _,
                                                      error,
                                                      stack,
                                                    ) => const SizedBox.shrink(),
                                                  ),
                                                ),
                                              ),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                          if (widget.onCompleted != null)
                            SizedBox(
                              height: 58,
                              child: Center(
                                child: TextButton(
                                  onPressed: () {
                                    _controller.stop();
                                    _complete();
                                  },
                                  style: TextButton.styleFrom(
                                    foregroundColor: Colors.white,
                                    minimumSize: const Size(100, 48),
                                  ),
                                  child: Text(c.skip),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ],
                  );
                },
              );
            },
          ),
        ),
      ),
    );
  }
}

class _SerenityTrail extends CustomPainter {
  const _SerenityTrail(this.progress, this.primary);
  final double progress;
  final Color primary;
  @override
  void paint(Canvas canvas, Size size) {
    if (progress <= 0 || progress >= 1) return;
    final path = Path()
      ..moveTo(size.width * .48, size.height * .8)
      ..cubicTo(
        size.width * .1,
        size.height * .6,
        size.width * .92,
        size.height * .47,
        size.width * .5,
        size.height * .21,
      );
    final metric = path.computeMetrics().first;
    final trail = metric.extractPath(
      math.max(0, metric.length * (progress - .45)),
      metric.length * progress,
    );
    final fade = (1 - progress).clamp(0.0, 1.0);
    canvas.drawPath(
      trail,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 10
        ..color = const Color(0xff3acfff).withValues(alpha: .5 * fade)
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 9),
    );
    canvas.drawPath(
      trail,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2
        ..color = Colors.white.withValues(alpha: fade),
    );
    final point = metric
        .getTangentForOffset(metric.length * progress)
        ?.position;
    if (point != null)
      canvas.drawCircle(
        point,
        3,
        Paint()..color = Colors.white.withValues(alpha: fade),
      );
  }

  @override
  bool shouldRepaint(_SerenityTrail oldDelegate) =>
      oldDelegate.progress != progress || oldDelegate.primary != primary;
}
