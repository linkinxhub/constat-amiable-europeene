part of '../pages.dart';

class ReportFacts extends StatelessWidget {
  const ReportFacts({super.key, required this.report});
  final Map<String, dynamic> report;
  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      Text(
        '${report['date'] ?? ''} · ${report['time'] ?? ''}',
        style: Theme.of(context).textTheme.titleLarge,
      ),
      Text('${report['place'] ?? ''} ${report['city'] ?? ''}'),
      for (final (i, v) in ((report['vehicles'] as List?) ?? []).indexed)
        if (v is Map)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    i == 0 ? 'A' : 'B',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  for (final key in [
                    'driver',
                    'policyholder',
                    'plate',
                    'model',
                    'insurer',
                    'policy',
                    'damage',
                    'observations',
                  ])
                    if (v[key]?.toString().isNotEmpty == true)
                      Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Text(v[key].toString()),
                      ),
                ],
              ),
            ),
          ),
    ],
  );
}
