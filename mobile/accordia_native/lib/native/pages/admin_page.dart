part of '../pages.dart';

class NativeAdminPage extends StatelessWidget {
  const NativeAdminPage({super.key, required this.api, required this.copy});
  final NativeApi api;
  final NativeCopy copy;
  @override
  Widget build(BuildContext context) => NativePage(
    title: copy.t('admin'),
    child: ApiPanel(
      copy: copy,
      load: api.mobileSettings,
      content: (view, reload) => ListView(
        padding: const EdgeInsets.all(24),
        children: [
          NativeMobileSettings(
            key: ValueKey(view['revision']),
            api: api,
            copy: copy,
            view: view,
            onUpdated: reload,
          ),
          for (final item in [
            ('ai', 'ai-settings'),
            ('retention', 'retention'),
            ('feedbackAdmin', 'feedback'),
          ])
            ListTile(
              title: Text(copy.t(item.$1)),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => NativePage(
                    title: copy.t(item.$1),
                    child: ApiPanel(
                      copy: copy,
                      load: () => api.object('GET', '/api/admin/${item.$2}'),
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
