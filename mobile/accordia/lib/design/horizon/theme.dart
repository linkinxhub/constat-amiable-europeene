import 'package:flutter/material.dart';
import '../../config/mobile_config.dart';

ThemeData horizonTheme(MobileConfig config) {
  final primary = Color(config.primaryColor);
  return ThemeData(
    useMaterial3: true,
    colorScheme:
        ColorScheme.fromSeed(seedColor: primary, brightness: Brightness.light)
            .copyWith(
                primary: primary,
                onPrimary: primary.computeLuminance() > .179
                    ? Colors.black
                    : Colors.white),
    scaffoldBackgroundColor: const Color(0xfff3f6fc),
    filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
      minimumSize: const Size(48, 58),
      padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 18),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
    )),
    navigationBarTheme: const NavigationBarThemeData(
      backgroundColor: Colors.white,
      indicatorColor: Color(0xffe8efff),
    ),
  );
}
