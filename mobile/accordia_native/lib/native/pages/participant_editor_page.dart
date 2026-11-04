part of '../pages.dart';

class NativeParticipantEditor extends StatefulWidget {
  const NativeParticipantEditor({
    super.key,
    required this.api,
    required this.copy,
    required this.reportCopy,
    required this.id,
    required this.data,
  });
  final NativeApi api;
  final NativeCopy copy;
  final ReportCopy reportCopy;
  final String id;
  final Map<String, dynamic> data;
  @override
  State<NativeParticipantEditor> createState() =>
      _NativeParticipantEditorState();
}

class _NativeParticipantEditorState extends State<NativeParticipantEditor> {
  late final Map<String, dynamic> report;
  late final int side;
  bool busy = false, dirty = false, allowPop = false;
  @override
  void initState() {
    super.initState();
    report = cloneReport(
      Map<String, dynamic>.from(widget.data['report'] as Map),
    );
    if (widget.data['side'] != 'A' && widget.data['side'] != 'B')
      throw const FormatException('Server side missing');
    side = widget.data['side'] == 'A' ? 0 : 1;
  }

  Future<void> save() async {
    setState(() => busy = true);
    try {
      await widget.api.updateSession(
        widget.id,
        report,
        widget.data['revision'] as int,
      );
      if (mounted) {
        setState(() => allowPop = true);
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) Navigator.pop(context, true);
        });
      }
    } catch (e) {
      if (mounted) nativeMessage(context, widget.copy, e);
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final vehicle = (report['vehicles'] as List)[side] as Map;
    return PopScope(
      canPop: allowPop || (!dirty && !busy),
      onPopInvokedWithResult: (didPop, _) async {
        if (!didPop &&
            !busy &&
            await confirmNative(
              context,
              widget.copy,
              detail: widget.copy.t('unsaved'),
            ) &&
            mounted) {
          setState(() => allowPop = true);
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) Navigator.pop(context);
          });
        }
      },
      child: NativePage(
        title: '${widget.copy.t('edit')} · ${side == 0 ? 'A' : 'B'}',
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            NativeVehicleFields(
              vehicle: vehicle.cast<String, dynamic>(),
              side: side,
              copy: widget.reportCopy,
              requireCore: false,
              onChanged: () => setState(() => dirty = true),
            ),
            NativeCircumstances(
              vehicle: vehicle.cast<String, dynamic>(),
              copy: widget.reportCopy,
              onChanged: () => setState(() => dirty = true),
            ),
            FilledButton(
              onPressed: busy ? null : save,
              child: Text(widget.copy.t('save')),
            ),
          ],
        ),
      ),
    );
  }
}
