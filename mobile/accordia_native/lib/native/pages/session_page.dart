part of '../pages.dart';

class NativeSessionPage extends StatelessWidget {
  const NativeSessionPage({
    super.key,
    required this.api,
    required this.copy,
    required this.reportCopy,
    required this.id,
  });
  final NativeApi api;
  final NativeCopy copy;
  final ReportCopy reportCopy;
  final String id;
  @override
  Widget build(BuildContext context) => NativePage(
    title: copy.t('session'),
    child: ApiPanel(
      copy: copy,
      load: () => api.session(id),
      content: (data, reload) {
        final report = Map<String, dynamic>.from(data['report'] as Map? ?? {}),
            side = data['side'];
        return ListView(
          padding: const EdgeInsets.all(20),
          children: [
            if (side == 'A' || side == 'B')
              Text(
                '${copy.t('session')} · $side',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
            ReportFacts(report: report),
            if (side == 'A' || side == 'B')
              FilledButton(
                onPressed: () async {
                  final changed = await Navigator.push<bool>(
                    context,
                    MaterialPageRoute(
                      builder: (_) => NativeParticipantEditor(
                        api: api,
                        copy: copy,
                        reportCopy: reportCopy,
                        id: id,
                        data: data,
                      ),
                    ),
                  );
                  if (changed == true) reload();
                },
                child: Text(copy.t('edit')),
              ),
            ListTile(
              leading: const Icon(Icons.description_outlined),
              title: Text(copy.t('documents')),
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) =>
                      NativeSessionDocumentsPage(api: api, copy: copy, id: id),
                ),
              ),
            ),
            if (data['isOwner'] == true && data['joined'] != true)
              OutlinedButton(
                onPressed: () async {
                  if (!await confirmNative(context, copy)) return;
                  try {
                    final invite = await api.renewInvite(id);
                    if (!context.mounted) return;
                    final token = invite['token'];
                    if (token is! String)
                      throw const FormatException(
                        'Invalid invitation response',
                      );
                    final uri = Uri.https(nativeApiHost, '/session/$id', {
                      'lang': copy.language.name,
                    }).replace(fragment: 'invite=$token');
                    await showDialog<void>(
                      context: context,
                      builder: (d) => AlertDialog(
                        title: Text(copy.t('invite')),
                        content: SelectableText(uri.toString()),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(d),
                            child: Text(copy.t('cancel')),
                          ),
                        ],
                      ),
                    );
                  } catch (e) {
                    if (context.mounted) nativeMessage(context, copy, e);
                  }
                },
                child: Text(copy.t('invite')),
              ),
            OutlinedButton(onPressed: reload, child: Text(copy.t('retry'))),
          ],
        );
      },
    ),
  );
}
