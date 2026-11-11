part of '../pages.dart';

class NativeFeedbackPage extends StatefulWidget {
  const NativeFeedbackPage({super.key, required this.api, required this.copy});
  final NativeApi api;
  final NativeCopy copy;
  @override
  State<NativeFeedbackPage> createState() => _NativeFeedbackPageState();
}

class _NativeFeedbackPageState extends State<NativeFeedbackPage> {
  final message = TextEditingController();
  String id = newReportId();
  String category = 'problem';
  bool busy = false;
  String? error;
  @override
  void dispose() {
    message.dispose();
    super.dispose();
  }

  Future<void> send() async {
    if (message.text.trim().length < 10) {
      setState(() => error = widget.copy.t('minMessage'));
      return;
    }
    if (!await confirmNative(context, widget.copy)) return;
    setState(() => busy = true);
    try {
      await widget.api.feedback({
        'id': id,
        'category': category,
        'message': message.text.trim(),
        'lang': widget.copy.language.name,
        'source': 'platform',
        'images': <String>[],
      });
      if (mounted) {
        message.clear();
        id = newReportId();
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(widget.copy.t('saved'))));
      }
    } catch (e) {
      if (mounted) nativeMessage(context, widget.copy, e);
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => NativePage(
    title: widget.copy.t('feedback'),
    child: ListView(
      padding: const EdgeInsets.all(24),
      children: [
        DropdownButtonFormField<String>(
          initialValue: category,
          decoration: InputDecoration(labelText: widget.copy.t('category')),
          items: [
            for (final v in ['problem', 'idea', 'other'])
              DropdownMenuItem(value: v, child: Text(widget.copy.t(v))),
          ],
          onChanged: busy
              ? null
              : (v) {
                  if (v != null) setState(() => category = v);
                },
        ),
        const SizedBox(height: 18),
        TextField(
          controller: message,
          enabled: !busy,
          maxLength: 4000,
          maxLines: 7,
          decoration: InputDecoration(
            labelText: widget.copy.t('message'),
            errorText: error,
          ),
        ),
        FilledButton(
          onPressed: busy ? null : send,
          child: Text(widget.copy.t('send')),
        ),
      ],
    ),
  );
}
