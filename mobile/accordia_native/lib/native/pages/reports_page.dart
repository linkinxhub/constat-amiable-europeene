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
      onAuthentication: sessions || api.pairing == null
          ? null
          : (reload) => MobilePairingPanel(
              copy: copy,
              pairing: api.pairing!,
              onConnected: reload,
            ),
      content: (data, reload) {
        final rows = (data[sessions ? 'sessions' : 'reports'] as List?) ?? [];
        return RefreshIndicator(
          onRefresh: () async => reload(),
          child: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              if (!sessions && api.pairing != null)
                OutlinedButton(
                  onPressed: () async {
                    try {
                      await api.pairing!.disconnect();
                    } catch (error) {
                      if (context.mounted) nativeMessage(context, copy, error);
                    }
                    if (context.mounted) reload();
                  },
                  child: Text(pairingText(copy, 'disconnect')),
                ),
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
