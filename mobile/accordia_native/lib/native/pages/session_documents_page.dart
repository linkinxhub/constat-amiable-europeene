part of '../pages.dart';

class NativeSessionDocumentsPage extends StatelessWidget {
  const NativeSessionDocumentsPage({
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
    title: copy.t('documents'),
    child: ApiPanel(
      copy: copy,
      load: () => api.documents(id),
      content: (data, reload) {
        final documents = data['documents'];
        if (documents is! List) {
          return RequestFailure(
            error: const NativeApiError(502, 'invalid_response'),
            copy: copy,
            retry: reload,
          );
        }
        return ListView(
          children: [
            if (documents.isEmpty)
              ListTile(title: Text(copy.t('noSessionDocuments'))),
            for (final document in documents)
              if (document case {
                'id': final String key,
                'revision': final int revision,
                'lang': final String language,
                'ready': final bool ready,
              })
                ListTile(
                  leading: Icon(
                    ready
                        ? Icons.verified_outlined
                        : Icons.description_outlined,
                  ),
                  title: Text(copy.t(ready ? 'signedPdf' : 'reviewPdf')),
                  subtitle: Text('${language.toUpperCase()} · v$revision'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => Navigator.push<void>(
                    context,
                    MaterialPageRoute(
                      builder: (_) => NativePage(
                        title: copy.t('documents'),
                        child: ApiPanel(
                          copy: copy,
                          load: () async => {
                            'bytes': await api.documentPdf(id, key),
                          },
                          content: (pdf, _) => PdfPreview(
                            build: (_) => pdf['bytes'] as Uint8List,
                            canChangeOrientation: false,
                            canChangePageFormat: false,
                            canDebug: false,
                            pdfFileName: 'Accordia-$key.pdf',
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
            TextButton(onPressed: reload, child: Text(copy.t('retry'))),
          ],
        );
      },
    ),
  );
}
