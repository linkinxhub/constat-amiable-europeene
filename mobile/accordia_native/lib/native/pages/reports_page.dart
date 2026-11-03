part of '../pages.dart';

class NativeReportsPage extends StatelessWidget {
  const NativeReportsPage({
    super.key,
    required this.api,
    required this.copy,
    required this.open,
    this.sessions = false,
  });
  final NativeApi api;
  final NativeCopy copy;
  final NativeOpen open;
  final bool sessions;
  @override
  Widget build(BuildContext context) => NativePage(
    title: copy.t(sessions ? 'session' : 'cloud'),
    child: ApiPanel(
      copy: copy,
      load: sessions ? api.sessions : api.reports,
      content: (data, reload) {
        final rows = (data[sessions ? 'sessions' : 'reports'] as List?) ?? [];
        return RefreshIndicator(
          onRefresh: () async => reload(),
          child: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              if (rows.isEmpty) Text(copy.t('empty')),
              for (final raw in rows)
                if (raw is Map)
                  Card(
                    child: ListTile(
                      title: Text(raw['title']?.toString() ?? copy.t('report')),
                      subtitle: Text(raw['accident_date']?.toString() ?? ''),
                      onTap: () => open(
                        sessions ? 'session' : 'cloudReport',
                        id: raw['id']?.toString(),
                      ),
                    ),
                  ),
            ],
          ),
        );
      },
    ),
  );
}
