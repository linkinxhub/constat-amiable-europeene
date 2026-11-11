import 'package:flutter/material.dart';

import '../../config/mobile_config.dart';
import 'copy.dart';
import 'azur_copy.dart';

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
    required this.onTogether,
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
  final VoidCallback onStart,
      onJoin,
      onTogether,
      onDrafts,
      onReports,
      onAccount,
      onHelp;
  final Widget? officialLogo;
  final VoidCallback? onSettings;

  @override
  Widget build(BuildContext context) {
    final copy = HorizonCopy.values[language]!;
    final primary = Color(config.primaryColor);
    final azur = AzurCopy.values[language]!;
    return Scaffold(
      backgroundColor: const Color(0xfff6f7fb),
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
            constraints: const BoxConstraints(maxWidth: 600),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [const Color(0xff092452), primary],
                      ),
                    ),
                    padding: const EdgeInsets.fromLTRB(16, 8, 8, 8),
                    child: IconTheme(
                      data: const IconThemeData(color: Colors.white),
                      child: Row(
                        children: [
                          Expanded(
                            child:
                                officialLogo ??
                                Text(
                                  config.title,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 26,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                          ),
                          Semantics(
                            label: copy.language,
                            child: DropdownButton<HorizonLanguage>(
                              value: language,
                              dropdownColor: const Color(0xff12316a),
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                fontFamily: Theme.of(context)
                                    .textTheme
                                    .bodyMedium
                                    ?.fontFamily,
                              ),
                              iconEnabledColor: Colors.white,
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
                  ),
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(
                      bottom: Radius.circular(32),
                    ),
                    child: Stack(
                      children: [
                        Positioned.fill(
                          child: ExcludeSemantics(
                            child: Image.asset(
                              'assets/horizon/azur-accident.webp',
                              fit: BoxFit.cover,
                              alignment: Alignment.bottomRight,
                              errorBuilder: (_, error, stack) =>
                                  ColoredBox(color: primary),
                            ),
                          ),
                        ),
                        Positioned.fill(
                          child: DecoratedBox(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                                colors: [
                                  const Color(0xff06286a)
                                      .withValues(alpha: .92),
                                  const Color(0xff06286a)
                                      .withValues(alpha: .35),
                                  Colors.transparent,
                                ],
                                stops: const [0, .55, 1],
                              ),
                            ),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.fromLTRB(20, 20, 20, 105),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                copy.headline,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 29,
                                  height: 1.12,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: -.6,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 8,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(0xffd8faf5),
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(
                                      Icons.health_and_safety_outlined,
                                      color: Color(0xff07505a),
                                      size: 20,
                                    ),
                                    const SizedBox(width: 8),
                                    Flexible(
                                      child: Text(
                                        azur.safety,
                                        style: const TextStyle(
                                          color: Color(0xff07505a),
                                          fontWeight: FontWeight.w600,
                                          fontSize: 13,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 20, 16, 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          azur.question,
                          style: const TextStyle(
                            color: Color(0xff101e3c),
                            fontSize: 23,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 16),
                        _ReliefAction(
                          badge: 'A',
                          label: copy.start,
                          hint: azur.create,
                          icon: Icons.note_add_outlined,
                          color: primary,
                          onTap: onStart,
                        ),
                        const SizedBox(height: 14),
                        _ReliefAction(
                          badge: 'B',
                          label: copy.join,
                          hint: azur.joinHint,
                          icon: Icons.qr_code_scanner,
                          color: const Color(0xff007c86),
                          onTap: onJoin,
                        ),
                        const SizedBox(height: 14),
                        _ReliefAction(
                          badge: 'A+B',
                          label: azur.together,
                          hint: azur.togetherHint,
                          icon: Icons.people_alt_outlined,
                          color: const Color(0xff123367),
                          onTap: onTogether,
                        ),
                        const SizedBox(height: 20),
                        _ReliefAction(
                          label: copy.drafts,
                          icon: Icons.drafts_outlined,
                          color: primary,
                          onTap: onDrafts,
                        ),
                        const SizedBox(height: 12),
                        _ReliefAction(
                          label: azur.documents,
                          icon: Icons.folder_outlined,
                          color: primary,
                          onTap: onReports,
                        ),
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

class _ReliefAction extends StatelessWidget {
  const _ReliefAction({
    this.badge,
    required this.label,
    this.hint,
    required this.icon,
    required this.color,
    required this.onTap,
  });
  final String? badge, hint;
  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => DecoratedBox(
    decoration: BoxDecoration(
      borderRadius: BorderRadius.circular(22),
      boxShadow: const [
        BoxShadow(
          color: Color(0x26304263),
          blurRadius: 13,
          offset: Offset(0, 7),
        ),
        BoxShadow(color: Colors.white, blurRadius: 5, offset: Offset(-3, -3)),
      ],
      gradient: const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Colors.white, Color(0xffedf0f6)],
      ),
      border: Border.all(color: Colors.white, width: 1.5),
    ),
    child: Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(22),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
          child: Row(
            children: [
              if (badge != null) ...[
                Container(
                  width: 56,
                  height: 56,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        Color.lerp(color, Colors.white, .2)!,
                        color,
                        Color.lerp(color, Colors.black, .22)!,
                      ],
                    ),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: .5),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: color.withValues(alpha: .3),
                        blurRadius: 6,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Text(
                    badge!,
                    style: TextStyle(
                      color: color.computeLuminance() > .179
                          ? Colors.black
                          : Colors.white,
                      fontSize: badge == 'A+B' ? 20 : 30,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
              ] else ...[
                Icon(icon, color: color, size: 27),
                const SizedBox(width: 12),
              ],
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 18,
                        color: Color(0xff101e3c),
                      ),
                    ),
                    if (hint != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        hint!,
                        style: const TextStyle(
                          color: Color(0xff4c5669),
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(width: 4),
              Icon(Icons.chevron_right, color: color),
            ],
          ),
        ),
      ),
    ),
  );
}
