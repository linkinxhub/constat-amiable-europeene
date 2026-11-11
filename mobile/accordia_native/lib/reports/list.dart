import 'package:flutter/material.dart';

import 'copy.dart';
import 'editor.dart';
import 'store.dart';

class DraftsPage extends StatefulWidget {
  const DraftsPage({super.key, required this.copy, required this.store});
  final ReportCopy copy;
  final DraftStore store;
  @override
  State<DraftsPage> createState() => _DraftsPageState();
}

class _DraftsPageState extends State<DraftsPage> {
  late Future<DraftListing> _listing;
  bool _busy = false;
  @override
  void initState() {
    super.initState();
    _listing = widget.store.list();
  }

  void _reload() => setState(() => _listing = widget.store.list());
  Future<void> _open(LocalDraft item) async {
    if (_busy) return;
    _busy = true;
    await Navigator.push(
      context,
      MaterialPageRoute<void>(
        builder: (_) =>
            ReportEditor(copy: widget.copy, store: widget.store, initial: item),
      ),
    );
    _busy = false;
    if (mounted) _reload();
  }

  Future<void> _delete(LocalDraft item) async {
    if (_busy) return;
    _busy = true;
    final c = widget.copy;
    final yes = await showDialog<bool>(
      context: context,
      builder: (d) => AlertDialog(
        title: Text(c.n('delete')),
        content: Text('${c.n('deleteConfirm')}\n${item.report['place']}'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(d, false),
            child: Text(c.text('cancel')),
          ),
          TextButton(
            onPressed: () => Navigator.pop(d, true),
            child: Text(c.n('delete')),
          ),
        ],
      ),
    );
    try {
      if (yes == true)
        await widget.store.delete(item.id, expectedRevision: item.revision);
      if (mounted) _reload();
    } catch (_) {
      if (mounted)
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(c.text('saveError'))));
    } finally {
      _busy = false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.copy;
    return Scaffold(
      appBar: AppBar(
        title: Text(c.text('drafts')),
        actions: [
          IconButton(
            onPressed: _reload,
            tooltip: c.text('open'),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: FutureBuilder<DraftListing>(
        future: _listing,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done)
            return const Center(child: CircularProgressIndicator());
          if (snapshot.hasError)
            return Padding(
              padding: const EdgeInsets.all(24),
              child: Text(c.n('secureError')),
            );
          final data = snapshot.data!;
          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              Text(c.n('encrypted')),
              if (data.unreadable > 0) Text(c.n('unreadable')),
              if (data.items.isEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 24),
                  child: Text(c.text('noData')),
                ),
              for (final item in data.items)
                ListTile(
                  title: Text(
                    item.report['place'].toString().isEmpty
                        ? c.text('draft')
                        : item.report['place'].toString(),
                  ),
                  subtitle: Text(
                    '${item.report['date']} · ${item.report['updated']}',
                  ),
                  onTap: () => _open(item),
                  trailing: IconButton(
                    tooltip: c.n('delete'),
                    icon: const Icon(Icons.delete_outline),
                    onPressed: () => _delete(item),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}
