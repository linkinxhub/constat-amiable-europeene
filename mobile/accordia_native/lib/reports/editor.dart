import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:printing/printing.dart';

import 'copy.dart';
import 'model.dart';
import 'pdf.dart';
import 'store.dart';
import 'vehicle_fields.dart';

class ReportEditor extends StatefulWidget {
  const ReportEditor({
    super.key,
    required this.copy,
    required this.store,
    this.initial,
  });
  final ReportCopy copy;
  final DraftStore store;
  final LocalDraft? initial;
  @override
  State<ReportEditor> createState() => _ReportEditorState();
}

class _ReportEditorState extends State<ReportEditor> {
  late Map<String, dynamic> _report;
  int _revision = 0, _step = 0;
  bool _dirty = false, _busy = false, _safe = false, _leaving = false;
  final _form = GlobalKey<FormState>();
  final _scroll = ScrollController();
  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  void _go(int page) {
    FocusScope.of(context).unfocus();
    setState(() => _step = page);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted && _scroll.hasClients) _scroll.jumpTo(0);
    });
  }

  Future<void> _pick(String key) async {
    if (key == 'date') {
      final now = DateTime.now();
      var initial = DateTime.tryParse(_report['date']?.toString() ?? '') ?? now;
      if (initial.isAfter(now)) initial = now;
      if (initial.isBefore(DateTime(1900))) initial = DateTime(1900);
      final date = await showDatePicker(
        context: context,
        initialDate: initial,
        firstDate: DateTime(1900),
        lastDate: now,
      );
      if (date != null)
        _change(
          () => _report['date'] =
              '${date.year.toString().padLeft(4, '0')}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}',
        );
    } else {
      final date = DateTime.tryParse('2000-01-01T${_report['time'] ?? ''}');
      final time = await showTimePicker(
        context: context,
        initialTime: date == null
            ? TimeOfDay.now()
            : TimeOfDay.fromDateTime(date),
      );
      if (time != null)
        _change(
          () => _report['time'] =
              '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}',
        );
    }
  }

  ReportCopy get c => widget.copy;
  @override
  void initState() {
    super.initState();
    _report = cloneReport(widget.initial?.report ?? newReport(c.language.name));
    _revision = widget.initial?.revision ?? 0;
  }

  void _change(void Function() update) {
    setState(() {
      update();
      _dirty = true;
    });
  }

  void _message(String value) {
    if (mounted)
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(value)));
  }

  Future<void> _save() async {
    if (_busy) return;
    setState(() => _busy = true);
    try {
      final saved = await widget.store.save(
        _report,
        expectedRevision: _revision,
      );
      if (!mounted) return;
      setState(() {
        _revision = saved.revision;
        _report = saved.report;
        _dirty = false;
      });
      _message(c.n('saved'));
    } catch (_) {
      _message(c.text('saveError'));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _leave() async {
    if (_leaving) return;
    _leaving = true;
    final yes = await showDialog<bool>(
      context: context,
      builder: (d) => AlertDialog(
        title: Text(c.n('leave')),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(d, false),
            child: Text(c.n('stay')),
          ),
          TextButton(
            onPressed: () => Navigator.pop(d, true),
            child: Text(c.n('leaveYes')),
          ),
        ],
      ),
    );
    _leaving = false;
    if (yes == true && mounted) {
      setState(() => _dirty = false);
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) Navigator.pop(context);
      });
    }
  }

  Widget _text(
    Map<String, dynamic> map,
    String key,
    String label, {
    int lines = 1,
    bool required = false,
    TextInputType? keyboard,
  }) => Padding(
    padding: const EdgeInsets.only(bottom: 14),
    child: TextFormField(
      key: ValueKey(
        '$_step-${identityHashCode(map)}-$key-${['date', 'time'].contains(key) ? map[key] : ''}',
      ),
      readOnly: ['date', 'time'].contains(key),
      onTap: ['date', 'time'].contains(key) ? () => _pick(key) : null,
      initialValue: map[key]?.toString() ?? '',
      maxLength: 4000,
      minLines: lines,
      maxLines: lines == 1 ? 1 : 6,
      keyboardType: keyboard,
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
        counterText: '',
      ),
      validator: (value) => required && (value?.trim().isEmpty ?? true)
          ? c.text('required')
          : null,
      onChanged: (value) => _change(() => map[key] = value),
    ),
  );
  Widget _choice(
    String key,
    String label,
    List<String> values,
    List<String> labels,
  ) => Padding(
    padding: const EdgeInsets.only(bottom: 14),
    child: DropdownButtonFormField<String>(
      key: ValueKey('$_step-$key'),
      initialValue: values.contains(_report[key])
          ? _report[key] as String
          : null,
      isExpanded: true,
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
      ),
      items: [
        for (var i = 0; i < values.length; i++)
          DropdownMenuItem(value: values[i], child: Text(labels[i])),
      ],
      onChanged: (value) => _change(() => _report[key] = value ?? ''),
      validator: (value) => value == null ? c.text('required') : null,
    ),
  );
  Widget _situation() => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      CheckboxListTile(
        contentPadding: EdgeInsets.zero,
        title: Text(c.n('safe')),
        value: _safe,
        onChanged: (v) => setState(() => _safe = v ?? false),
      ),
      Text(c.text('safetyText')),
      const SizedBox(height: 16),
      _text(
        _report,
        'date',
        c.text('date'),
        required: true,
        keyboard: TextInputType.datetime,
      ),
      _text(
        _report,
        'time',
        c.text('time'),
        required: true,
        keyboard: TextInputType.datetime,
      ),
      _text(_report, 'place', c.text('place'), required: true),
      _text(
        _report,
        'city',
        c.data['formParity']['cityLabel'][c.language.name] as String,
      ),
      _choice('country', c.text('country'), [
        'BE',
        'FR',
        'DE',
        'NL',
        'ES',
        'OTHER',
      ], (c.dict['countries'] as List).cast<String>()),
      _choice(
        'injured',
        c.text('injured'),
        ['yes', 'no'],
        [c.text('yes'), c.text('no')],
      ),
      if (_report['injured'] == 'yes')
        Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: Text(
            c.text('injuredNotice'),
            style: const TextStyle(
              color: Colors.red,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      _choice('count', c.text('count'), ['1', '2'], ['1', '2']),
      _text(_report, 'witnesses', c.text('witnesses'), lines: 2),
      _choice(
        'otherVehiclesDamage',
        c.finalText('thirdVehicles'),
        ['yes', 'no'],
        [c.text('yes'), c.text('no')],
      ),
      _choice(
        'otherObjectsDamage',
        c.finalText('thirdObjects'),
        ['yes', 'no'],
        [c.text('yes'), c.text('no')],
      ),
    ],
  );
  Widget _vehicles() => Column(
    children: [
      for (var side = 0; side < activeVehicles(_report); side++) _vehicle(side),
    ],
  );
  Widget _vehicle(int side) => NativeVehicleFields(
    vehicle: vehiclesOf(_report)[side],
    side: side,
    copy: c,
    onChanged: () => _change(() {}),
  );
  Widget _circumstances() => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      for (var side = 0; side < activeVehicles(_report); side++) ...[
        Text(
          '${c.text('vehicle')} ${side == 0 ? 'A' : 'B'}',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        NativeCircumstances(
          vehicle: vehiclesOf(_report)[side],
          copy: c,
          onChanged: () => _change(() {}),
        ),
        const Divider(),
      ],
    ],
  );
  Widget _review() => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      Text(c.n('local')),
      const SizedBox(height: 12),
      Text('${_report['date']} ${_report['time']} — ${_report['place']}'),
      for (var i = 0; i < activeVehicles(_report); i++)
        ListTile(
          contentPadding: EdgeInsets.zero,
          title: Text('${c.text('vehicle')} ${i == 0 ? 'A' : 'B'}'),
          subtitle: Text(
            '${vehiclesOf(_report)[i]['driver']} · ${vehiclesOf(_report)[i]['plate']}',
          ),
        ),
      Text(c.n('later')),
      const SizedBox(height: 16),
      FilledButton.icon(
        onPressed: _busy ? null : _preview,
        icon: const Icon(Icons.picture_as_pdf),
        label: Text(c.n('pdf')),
      ),
    ],
  );
  Future<void> _preview() async {
    if (_busy) return;
    setState(() => _busy = true);
    try {
      final font = await rootBundle.load('assets/fonts/DejaVuSans.ttf');
      final bytes = await buildLocalPdf(_report, c, font);
      if (!mounted) return;
      await Navigator.push(
        context,
        MaterialPageRoute<void>(
          builder: (_) => Scaffold(
            appBar: AppBar(title: Text(c.n('pdf'))),
            body: PdfPreview(
              build: (_) => bytes,
              canChangeOrientation: false,
              canChangePageFormat: false,
              canDebug: false,
              pdfFileName: 'Accordia-preparation.pdf',
            ),
          ),
        ),
      );
    } catch (_) {
      _message(c.text('saveError'));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _next() {
    if (!_form.currentState!.validate()) return;
    if (_step == 0 && (!_safe || situationIssues(_report).isNotEmpty)) {
      _message(c.text('required'));
      return;
    }
    if (_step == 1 && vehicleIssues(_report).isNotEmpty) {
      _message(c.n('trailerConflict') + ' ' + c.text('required'));
      return;
    }
    if (_step == 2 &&
        vehiclesOf(_report)
            .take(activeVehicles(_report))
            .any(
              (v) =>
                  v['standardConfirmed'] != true ||
                  ((v['standardCircumstances'] as List? ?? []).isEmpty &&
                      (v['observations']?.toString().trim() ?? '').isEmpty &&
                      (v['circumstances'] as List? ?? []).isEmpty),
            )) {
      _message(c.text('required'));
      return;
    }
    _go(_step + 1);
  }

  @override
  Widget build(BuildContext context) => PopScope(
    canPop: !_dirty && !_busy,
    onPopInvokedWithResult: (didPop, result) {
      if (!didPop && !_busy) unawaited(_leave());
    },
    child: Scaffold(
      appBar: AppBar(
        title: Text(c.text('new')),
        actions: [
          IconButton(
            onPressed: _busy ? null : _save,
            tooltip: c.text('save'),
            icon: const Icon(Icons.save_outlined),
          ),
        ],
      ),
      body: AbsorbPointer(
        absorbing: _busy,
        child: Form(
          key: _form,
          child: ListView(
            controller: _scroll,
            padding: const EdgeInsets.all(20),
            children: [
              Text(
                c.steps[_step],
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 8),
              Text(c.n('local')),
              const SizedBox(height: 16),
              if (_step == 0)
                _situation()
              else if (_step == 1)
                _vehicles()
              else if (_step == 2)
                _circumstances()
              else
                _review(),
            ],
          ),
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              if (_step > 0)
                TextButton(
                  onPressed: _busy ? null : () => _go(_step - 1),
                  child: Text(c.text('back')),
                ),
              const Spacer(),
              if (_step < 3)
                FilledButton(
                  onPressed: _busy ? null : _next,
                  child: Text(c.text('next')),
                ),
            ],
          ),
        ),
      ),
    ),
  );
}
