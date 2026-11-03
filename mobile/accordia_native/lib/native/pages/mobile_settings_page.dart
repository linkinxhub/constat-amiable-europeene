part of '../pages.dart';

class NativeMobileSettings extends StatefulWidget {
  const NativeMobileSettings({
    super.key,
    required this.api,
    required this.copy,
    required this.view,
    required this.onUpdated,
  });
  final NativeApi api;
  final NativeCopy copy;
  final Map<String, dynamic> view;
  final VoidCallback onUpdated;
  @override
  State<NativeMobileSettings> createState() => _NativeMobileSettingsState();
}

class _NativeMobileSettingsState extends State<NativeMobileSettings> {
  late final Map<String, dynamic> config;
  late final TextEditingController title, color;
  bool busy = false, dirty = false;
  @override
  void initState() {
    super.initState();
    final history = widget.view['history'] as List? ?? [];
    config = Map<String, dynamic>.from(
      (history.isNotEmpty ? history.first : widget.view['published']) as Map,
    );
    title = TextEditingController(text: config['title']);
    color = TextEditingController(text: config['primaryColor']);
  }

  @override
  void dispose() {
    title.dispose();
    color.dispose();
    super.dispose();
  }

  Future<void> command(String action, {int? sourceRevision}) async {
    if (action == 'draft' &&
        (title.text.trim().isEmpty ||
            title.text.length > 80 ||
            !RegExp(r'^#[0-9a-fA-F]{6}$').hasMatch(color.text))) {
      nativeMessage(
        context,
        widget.copy,
        const FormatException('Invalid configuration'),
      );
      return;
    }
    if (action != 'draft' && dirty) return;
    if (!await confirmNative(context, widget.copy)) return;
    setState(() => busy = true);
    try {
      await widget.api.writeMobileSettings({
        'action': action,
        'expectedRevision': widget.view['revision'],
        if (action == 'draft')
          'config': {
            'title': title.text.trim(),
            'primaryColor': color.text,
            'designId': config['designId'],
            'introEnabled': config['introEnabled'],
            'introDurationMs': config['introDurationMs'],
            'soundDefault': config['soundDefault'],
          },
        if (sourceRevision != null) 'sourceRevision': sourceRevision,
      });
      if (mounted) {
        dirty = false;
        widget.onUpdated();
      }
    } catch (e) {
      if (mounted) nativeMessage(context, widget.copy, e);
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final history = widget.view['history'] as List? ?? [];
    final latest = history.isNotEmpty ? history.first as Map : null;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextFormField(
          controller: title,
          enabled: !busy,
          maxLength: 80,
          decoration: InputDecoration(labelText: widget.copy.t('title')),
          onChanged: (_) => setState(() => dirty = true),
        ),
        TextFormField(
          controller: color,
          enabled: !busy,
          decoration: InputDecoration(labelText: widget.copy.t('color')),
          onChanged: (_) => setState(() => dirty = true),
        ),
        SwitchListTile(
          title: Text(widget.copy.t('intro')),
          value: config['introEnabled'] == true,
          onChanged: busy
              ? null
              : (v) => setState(() {
                  config['introEnabled'] = v;
                  dirty = true;
                }),
        ),
        Text('${widget.copy.t('duration')}: ${config['introDurationMs']}'),
        Slider(
          value: (config['introDurationMs'] as num).toDouble().clamp(0, 1500),
          min: 0,
          max: 1500,
          divisions: 30,
          onChanged: busy
              ? null
              : (v) => setState(() {
                  config['introDurationMs'] = v.round();
                  dirty = true;
                }),
        ),
        SwitchListTile(
          title: Text(widget.copy.t('sound')),
          value: config['soundDefault'] == true,
          onChanged: busy
              ? null
              : (v) => setState(() {
                  config['soundDefault'] = v;
                  dirty = true;
                }),
        ),
        FilledButton(
          onPressed: busy ? null : () => command('draft'),
          child: Text(widget.copy.t('draft')),
        ),
        OutlinedButton(
          onPressed: busy || dirty || latest?['state'] != 'draft'
              ? null
              : () => command(
                  'publish',
                  sourceRevision: latest!['revision'] as int,
                ),
          child: Text(widget.copy.t('publish')),
        ),
      ],
    );
  }
}
