part of '../pages.dart';

class NativeJoinPage extends StatefulWidget {
  const NativeJoinPage({
    super.key,
    required this.api,
    required this.copy,
    required this.open,
  });
  final NativeApi api;
  final NativeCopy copy;
  final NativeOpen open;
  @override
  State<NativeJoinPage> createState() => _NativeJoinPageState();
}

class _NativeJoinPageState extends State<NativeJoinPage> {
  final input = TextEditingController();
  bool busy = false;
  String? error;
  @override
  void dispose() {
    input.dispose();
    super.dispose();
  }

  Future<void> join() async {
    final uri = scannedAccordia(input.text), parts = uri?.pathSegments;
    String? token;
    try {
      token = uri == null ? null : Uri.splitQueryString(uri.fragment)['invite'];
    } catch (_) {}
    if (uri == null ||
        parts?.length != 2 ||
        parts![0] != 'session' ||
        token == null ||
        !RegExp(r'^[a-zA-Z0-9-]{16,100}$').hasMatch(token)) {
      setState(() => error = widget.copy.t('invalid'));
      return;
    }
    setState(() => busy = true);
    try {
      await widget.api.join(parts[1], token);
      if (mounted) widget.open('session', id: parts[1]);
    } catch (e) {
      if (mounted) nativeMessage(context, widget.copy, e);
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => NativePage(
    title: widget.copy.t('join'),
    child: ListView(
      padding: const EdgeInsets.all(24),
      children: [
        TextField(
          controller: input,
          maxLength: 8192,
          decoration: InputDecoration(
            labelText: widget.copy.t('paste'),
            errorText: error,
          ),
        ),
        const SizedBox(height: 16),
        OutlinedButton.icon(
          onPressed: busy
              ? null
              : () async {
                  final uri = await Navigator.push<Uri>(
                    context,
                    MaterialPageRoute(
                      builder: (_) => AccordiaScanner(
                        copy: PlatformCopy(widget.copy.language),
                      ),
                    ),
                  );
                  if (uri != null && uri.scheme != 'accordia-paste' && mounted)
                    setState(() => input.text = uri.toString());
                },
          icon: const Icon(Icons.qr_code_scanner),
          label: Text(widget.copy.t('scan')),
        ),
        const SizedBox(height: 12),
        FilledButton(
          onPressed: busy ? null : join,
          child: Text(widget.copy.t('continue')),
        ),
        const SizedBox(height: 20),
        Text(widget.copy.t('authHelp')),
      ],
    ),
  );
}
