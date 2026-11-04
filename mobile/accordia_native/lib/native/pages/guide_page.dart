part of '../pages.dart';

class NativeGuidePage extends StatelessWidget {
  const NativeGuidePage({
    super.key,
    required this.copy,
    required this.reportCopy,
  });
  final NativeCopy copy;
  final ReportCopy reportCopy;
  @override
  Widget build(BuildContext context) {
    final items = reportCopy.steps;
    return NativePage(
      title: copy.t('guide'),
      child: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          Text(
            reportCopy.text('safety'),
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 10),
          Text(reportCopy.text('safetyText')),
          const SizedBox(height: 20),
          Text(copy.t('offline')),
          const SizedBox(height: 12),
          Text(copy.t('limits')),
          const SizedBox(height: 12),
          Text(FormWords(copy.language).t('sketchGuide')),
          const SizedBox(height: 12),
          Text(FormWords(copy.language).t('pdfTemplate')),
          const SizedBox(height: 12),
          Text(
            reportCopy.data['formParity']['simpleCopy'][copy
                    .language
                    .name]['guide']
                as String,
          ),
          const SizedBox(height: 12),
          Text(
            reportCopy.data['formParity']['suggestionsCopy'][copy
                    .language
                    .name]['guide']
                as String,
          ),
          for (final item in items)
            ListTile(
              leading: const Icon(Icons.check_circle_outline),
              title: Text(item.toString()),
            ),
          const Divider(),
          Text(copy.t('authHelp')),
        ],
      ),
    );
  }
}
