import 'package:flutter/material.dart';

import '../../config/mobile_config.dart';

ThemeData horizonTheme(MobileConfig config) {
  final primary = Color(config.primaryColor);
  // Website default commands; a published administrator colour still overrides it.
  final buttonPrimary = config.revision == 0
      ? const Color(0xff1557c0)
      : primary;
  return ThemeData(
    useMaterial3: true,
    colorScheme:
        ColorScheme.fromSeed(
          seedColor: primary,
          brightness: Brightness.light,
        ).copyWith(
          primary: primary,
          onPrimary: primary.computeLuminance() > .179
              ? Colors.black
              : Colors.white,
        ),
    scaffoldBackgroundColor: const Color(0xfff3f6fc),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: buttonPrimary,
        foregroundColor: buttonPrimary.computeLuminance() > .179
            ? Colors.black
            : Colors.white,
        elevation: 2,
        shadowColor: const Color(0x221557c0),
        minimumSize: const Size(48, 48),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        minimumSize: const Size(44, 44),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xff173b69),
        side: const BorderSide(color: Color(0xffacbfd8)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    ),
    navigationBarTheme: const NavigationBarThemeData(
      backgroundColor: Colors.white,
      indicatorColor: Color(0xffe8efff),
    ),
  );
}
