part of '../pages.dart';

class NativeLandingPage extends StatelessWidget {
  const NativeLandingPage({super.key, required this.copy, required this.open});
  final NativeCopy copy;
  final NativeOpen open;
  @override
  Widget build(BuildContext context) => NativePage(
    title: copy.t('welcome'),
    child: ListView(
      padding: const EdgeInsets.all(22),
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(28),
          child: Image.asset('assets/horizon/azur-accident.webp'),
        ),
        const SizedBox(height: 20),
        Text('Accordia', style: Theme.of(context).textTheme.headlineLarge),
        Text(copy.t('native')),
        for (final key in [
          'report',
          'join',
          'guide',
          'pricing',
          'account',
          'feedback',
        ])
          Padding(
            padding: const EdgeInsets.only(top: 12),
            child: OutlinedButton(
              onPressed: () => open(key),
              child: Text(copy.t(key)),
            ),
          ),
      ],
    ),
  );
}
