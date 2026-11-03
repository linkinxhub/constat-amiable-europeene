part of '../pages.dart';

class NativeCloudReportPage extends StatelessWidget {
  const NativeCloudReportPage({
    super.key,
    required this.api,
    required this.copy,
    required this.id,
  });
  final NativeApi api;
  final NativeCopy copy;
  final String id;
  @override
  Widget build(BuildContext context) => NativePage(
    title: copy.t('report'),
    child: ApiPanel(
      copy: copy,
      load: () => api.report(id),
      content: (data, reload) => ListView(
        padding: const EdgeInsets.all(20),
        children: [
          ReportFacts(
            report: Map<String, dynamic>.from(data['report'] as Map? ?? {}),
          ),
          ListTile(
            leading: const Icon(Icons.history),
            title: Text(copy.t('history')),
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => NativePage(
                  title: copy.t('history'),
                  child: ApiPanel(
                    copy: copy,
                    load: () => api.history(id),
                    content: (v, r) => _JsonFacts(v),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    ),
  );
}
