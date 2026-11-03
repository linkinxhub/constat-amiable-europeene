part of '../pages.dart';

class NativePricingPage extends StatelessWidget {
  const NativePricingPage({super.key, required this.copy});
  final NativeCopy copy;
  @override
  Widget build(BuildContext context) => NativePage(
    title: copy.t('pricing'),
    child: ListView(
      padding: const EdgeInsets.all(24),
      children: [
        Text(copy.t('planned')),
        const SizedBox(height: 20),
        for (final offer in [
          (copy.t('manual'), '0 €'),
          ('Premium', '6,90 € ${copy.t('taxInc')} / ${copy.t('perReport')}'),
          (
            copy.t('personal'),
            '19,90 € ${copy.t('taxInc')} / ${copy.t('perYear')}',
          ),
          (
            copy.t('fleetStart'),
            '19 € ${copy.t('taxEx')} / ${copy.t('perMonth')} · 190 € / ${copy.t('perYear')}',
          ),
          (
            copy.t('fleetPro'),
            '49 € ${copy.t('taxEx')} / ${copy.t('perMonth')} · 490 € / ${copy.t('perYear')}',
          ),
        ])
          Card(
            child: ListTile(title: Text(offer.$1), subtitle: Text(offer.$2)),
          ),
      ],
    ),
  );
}
