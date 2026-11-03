import 'package:flutter/material.dart';

import '../../config/mobile_config.dart';
import 'copy.dart';

/// Presentation only: every action must be supplied by the real app router.
/// Does not create sessions, grant rights or claim that a draft is saved.
class HorizonHome extends StatelessWidget {
  const HorizonHome({
    super.key,
    required this.config,
    required this.language,
    required this.onLanguageChanged,
    required this.onStart,
    required this.onJoin,
    required this.onDrafts,
    required this.onReports,
    required this.onAccount,
    required this.onHelp,
    this.officialLogo,
    this.onSettings,
  });
  final MobileConfig config;
  final HorizonLanguage language;
  final ValueChanged<HorizonLanguage> onLanguageChanged;
  final VoidCallback onStart, onJoin, onDrafts, onReports, onAccount, onHelp;
  final Widget? officialLogo;
  final VoidCallback? onSettings;

  @override
  Widget build(BuildContext context) {
    final copy = HorizonCopy.values[language]!;
    final primary = Color(config.primaryColor);
    final colors = Theme.of(context).colorScheme;
    return Scaffold(
      bottomNavigationBar: NavigationBar(
        selectedIndex: 0,
        onDestinationSelected: (index) {
          if (index == 1) onReports();
          if (index == 2) onAccount();
        },
        destinations: [
          NavigationDestination(
            icon: const Icon(Icons.home_outlined),
            selectedIcon: const Icon(Icons.home_rounded),
            label: copy.home,
          ),
          NavigationDestination(
            icon: const Icon(Icons.description_outlined),
            label: copy.reports,
          ),
          NavigationDestination(
            icon: const Icon(Icons.person_outline),
            label: copy.account,
          ),
        ],
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 560),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(24, 12, 12, 12),
                    child: Row(
                      children: [
                        Expanded(
                          child:
                              officialLogo ??
                              Text(
                                config.title,
                                style: const TextStyle(
                                  fontSize: 28,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xff101e3c),
                                  letterSpacing: -1,
                                ),
                              ),
                        ),
                        Semantics(
                          label: copy.language,
                          child: DropdownButton<HorizonLanguage>(
                            value: language,
                            underline: const SizedBox.shrink(),
                            onChanged: (value) {
                              if (value != null) onLanguageChanged(value);
                            },
                            items: HorizonLanguage.values
                                .map(
                                  (value) => DropdownMenuItem(
                                    value: value,
                                    child: Text(value.name.toUpperCase()),
                                  ),
                                )
                                .toList(),
                          ),
                        ),
                        IconButton(
                          onPressed: onHelp,
                          tooltip: copy.help,
                          icon: const Icon(Icons.help_outline),
                        ),
                        if (onSettings != null)
                          IconButton(
                            onPressed: onSettings,
                            tooltip: copy.settings,
                            icon: const Icon(Icons.settings_outlined),
                          ),
                      ],
                    ),
                  ),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(30),
                    child: Stack(
                      children: [
                        Positioned.fill(
                          child: ExcludeSemantics(
                            child: Image.asset(
                              'assets/horizon/hero.webp',
                              fit: BoxFit.cover,
                              alignment: Alignment.bottomCenter,
                              errorBuilder: (_, error, stack) =>
                                  const ColoredBox(color: Color(0xff064cec)),
                            ),
                          ),
                        ),
                        Positioned.fill(
                          child: DecoratedBox(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                                  const Color(0xff052a90)
                                      .withValues(alpha: .96),
                                  const Color(0xff052a90)
                                      .withValues(alpha: .72),
                                  Colors.transparent,
                                ],
                                stops: const [0, .43, .82],
                              ),
                            ),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.fromLTRB(26, 28, 26, 182),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                copy.headline,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 32,
                                  height: 1.12,
                                  letterSpacing: -.8,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                copy.guidance,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        FilledButton(
                          onPressed: onStart,
                          child: Row(
                            children: [
                              const Icon(Icons.directions_car_outlined),
                              const SizedBox(width: 12),
                              Expanded(child: Text(copy.start)),
                              const Icon(Icons.chevron_right),
                            ],
                          ),
                        ),
                        const SizedBox(height: 14),
                        LayoutBuilder(
                          builder: (context, constraints) {
                            final actions = [
                              _Action(
                                label: copy.join,
                                icon: Icons.qr_code_scanner,
                                onTap: onJoin,
                                color: primary,
                              ),
                              _Action(
                                label: copy.drafts,
                                icon: Icons.drafts_outlined,
                                onTap: onDrafts,
                                color: primary,
                              ),
                            ];
                            if (constraints.maxWidth < 300 ||
                                MediaQuery.textScalerOf(context).scale(16) >
                                    22) {
                              return Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  actions[0],
                                  const SizedBox(height: 12),
                                  actions[1],
                                ],
                              );
                            }
                            return Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Expanded(child: actions[0]),
                                const SizedBox(width: 12),
                                Expanded(child: actions[1]),
                              ],
                            );
                          },
                        ),
                        const SizedBox(height: 16),
                        Divider(color: colors.outlineVariant),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _Action extends StatelessWidget {
  const _Action({
    required this.label,
    required this.icon,
    required this.onTap,
    required this.color,
  });
  final String label;
  final IconData icon;
  final VoidCallback onTap;
  final Color color;
  @override
  Widget build(BuildContext context) => OutlinedButton(
    onPressed: onTap,
    style: OutlinedButton.styleFrom(
      padding: const EdgeInsets.all(20),
      foregroundColor: const Color(0xff101e3c),
      backgroundColor: Colors.white,
      side: const BorderSide(color: Color(0xffe3eaf6)),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
    ),
    child: Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: color, size: 28),
        const SizedBox(height: 10),
        Text(label, textAlign: TextAlign.center),
      ],
    ),
  );
}
