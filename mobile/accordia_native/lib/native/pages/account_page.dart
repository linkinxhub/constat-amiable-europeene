part of '../pages.dart';

class NativeAccountPage extends StatelessWidget {
  const NativeAccountPage({
    super.key,
    required this.api,
    required this.copy,
    required this.open,
  });
  final NativeApi api;
  final NativeCopy copy;
  final NativeOpen open;
  @override
  Widget build(BuildContext context) => NativePage(
    title: copy.t('account'),
    child: ApiPanel(
      copy: copy,
      load: api.account,
      content: (data, reload) => ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const Icon(Icons.account_circle_outlined, size: 64),
          const SizedBox(height: 16),
          Text(
            copy.t('account'),
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          if (data['account'] is Map)
            Text(
              '${((data['account']['budget_bytes'] as num?) ?? 0) / 1048576} MiB',
            ),
          for (final page in ['cloud', 'session', 'local', 'pricing', 'admin'])
            ListTile(
              title: Text(copy.t(page)),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => open(page),
            ),
          OutlinedButton(onPressed: reload, child: Text(copy.t('retry'))),
        ],
      ),
    ),
  );
}
