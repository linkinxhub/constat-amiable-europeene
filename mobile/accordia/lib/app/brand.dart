import 'package:flutter/material.dart';

/// Reuses the ShieldCheck mark currently displayed on the Accordia website.
class AccordiaBrand extends StatelessWidget {
  const AccordiaBrand({super.key, required this.title, this.inverted = false});
  final String title;
  final bool inverted;
  @override
  Widget build(BuildContext context) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      ExcludeSemantics(
        child: Container(
          width: 36,
          height: 36,
          padding: const EdgeInsets.all(5),
          decoration: BoxDecoration(
            color: inverted ? Colors.transparent : const Color(0xff064cec),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Image.asset('assets/brand/shield-white.png'),
        ),
      ),
      const SizedBox(width: 8),
      Flexible(
        child: Text(
          title,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            color: inverted ? Colors.white : const Color(0xff101e3c),
            fontSize: 24,
            letterSpacing: -.8,
            fontWeight: FontWeight.w800,
          ),
        ),
      ),
    ],
  );
}
