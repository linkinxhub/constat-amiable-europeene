import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:printing/printing.dart';

import 'copy.dart';
import 'model.dart';
import 'pdf.dart';
import 'store.dart';
import 'vehicle_fields.dart';
import 'form_design.dart';
import 'sketch.dart';
import 'reference_pdf.dart';
import '../design/horizon/copy.dart';

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
  NativePdfStyle _pdfStyle = NativePdfStyle.keyboard;
  HorizonLanguage? _pdfLanguage;
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
  FormWords get words => FormWords(c.language);
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
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xffd3deed)),
        ),
        filled: true,
        fillColor: const Color(0xfff8fafd),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 18,
        ),
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
    child: values.length > 2
        ? DropdownButtonFormField<String>(
            key: ValueKey('$_step-$key'),
            initialValue: values.contains(_report[key])
                ? _report[key] as String
                : null,
            isExpanded: true,
            decoration: InputDecoration(
              labelText: label,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              filled: true,
              fillColor: const Color(0xfff8fafd),
            ),
            items: [
              for (var i = 0; i < values.length; i++)
                DropdownMenuItem(value: values[i], child: Text(labels[i])),
            ],
            onChanged: (value) => _change(() => _report[key] = value ?? ''),
            validator: (value) => value == null ? c.text('required') : null,
          )
        : FormField<String>(
            key: ValueKey('$_step-$key'),
            initialValue: values.contains(_report[key])
                ? _report[key] as String
                : null,
            validator: (value) => value == null ? c.text('required') : null,
            builder: (state) => Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  '$label *',
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    color: Color(0xff203b60),
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (var i = 0; i < values.length; i++)
                      FormChoiceButton(
                        label: labels[i],
                        selected: state.value == values[i],
                        onPressed: () {
                          state.didChange(values[i]);
                          _change(() => _report[key] = values[i]);
                        },
                      ),
                  ],
                ),
                if (state.hasError)
                  Text(
                    state.errorText!,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.error,
                    ),
                  ),
              ],
            ),
          ),
  );
  Widget _situation() => FormPanel(
    title: words.t('situation'),
    icon: Icons.place_outlined,
    child: Column(
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
    ),
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
  Widget _evidence() => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      NativeSketch(
        value: _report['strokes'],
        copy: c,
        onChanged: (value) => _change(() => _report['strokes'] = value),
      ),
      FormPanel(
        icon: Icons.info_outline,
        title: c.text('optional'),
        child: Text(words.t('mediaLater')),
      ),
    ],
  );
  Widget _review() => FormPanel(
    title: c.text('reviewTitle'),
    icon: Icons.fact_check_outlined,
    child: Column(
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
        Text(
          c.finalText('format'),
          style: const TextStyle(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 10),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            for (final style in NativePdfStyle.values)
              FormChoiceButton(
                label: c.finalText(
                  style == NativePdfStyle.keyboard
                      ? 'keyboard'
                      : style == NativePdfStyle.bluePen
                      ? 'blue'
                      : 'black',
                ),
                selected: _pdfStyle == style,
                onPressed: _busy
                    ? null
                    : () => setState(() => _pdfStyle = style),
                leading: Text(
                  'Aa',
                  style: TextStyle(
                    fontSize: 24,
                    fontFamily: style == NativePdfStyle.keyboard
                        ? null
                        : 'AccordiaHand',
                    color: style == NativePdfStyle.bluePen
                        ? const Color(0xff0d2ea6)
                        : const Color(0xff142d4f),
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 16),
        DropdownButtonFormField<HorizonLanguage>(
          initialValue: _pdfLanguage ?? c.language,
          isExpanded: true,
          decoration: InputDecoration(
            labelText: c.finalText('language'),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
          ),
          items: [
            for (final language in HorizonLanguage.values)
              DropdownMenuItem(
                value: language,
                child: Text(
                  {
                    'fr': 'Français',
                    'en': 'English',
                    'de': 'Deutsch',
                    'nl': 'Nederlands',
                  }[language.name]!,
                ),
              ),
          ],
          onChanged: _busy
              ? null
              : (value) => setState(() => _pdfLanguage = value),
        ),
        const SizedBox(height: 10),
        Text(FormWords(c.language).t('pdfTemplate')),
        const SizedBox(height: 10),
        Text(c.finalText('full')),
        const SizedBox(height: 16),
        FilledButton.icon(
          onPressed: _busy ? null : _preview,
          icon: const Icon(Icons.picture_as_pdf),
          label: Text(c.n('pdf')),
        ),
      ],
    ),
  );
  Future<void> _preview() async {
    if (_busy) return;
    setState(() => _busy = true);
    try {
      final font = await rootBundle.load('assets/fonts/DejaVuSans.ttf');
      final bytes = await buildLocalPdf(
        _report,
        ReportCopy(c.data, _pdfLanguage ?? c.language),
        font,
        style: _pdfStyle,
      );
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
      backgroundColor: const Color(0xfff3f6fc),
      appBar: AppBar(
        backgroundColor: const Color(0xfff3f6fc),
        surfaceTintColor: Colors.transparent,
        title: Text(
          c.text('new'),
          style: const TextStyle(
            color: formInk,
            fontWeight: FontWeight.w700,
            fontSize: 18,
          ),
        ),
        actions: [
          IconButton(
            onPressed: _busy ? null : _save,
            tooltip: c.text('save'),
            icon: const Icon(Icons.save_outlined, color: formBlue),
          ),
        ],
      ),
      body: AbsorbPointer(
        absorbing: _busy,
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 760),
            child: Form(
              key: _form,
              child: ListView(
                controller: _scroll,
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
                children: [
                  FormStepHeader(
                    labels: c.steps,
                    current: _step,
                    words: words,
                    status: c.n('local'),
                  ),
                  if (_step == 0)
                    _situation()
                  else if (_step == 1)
                    _vehicles()
                  else if (_step == 2)
                    _circumstances()
                  else if (_step == 3)
                    _evidence()
                  else
                    _review(),
                ],
              ),
            ),
          ),
        ),
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Color(0x11132947),
              blurRadius: 18,
              offset: Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          top: false,
          child: Center(
            heightFactor: 1,
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 760),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    if (_step > 0)
                      Expanded(
                        child: OutlinedButton(
                          onPressed: _busy ? null : () => _go(_step - 1),
                          child: Text(c.text('back')),
                        ),
                      ),
                    if (_step > 0) const SizedBox(width: 12),
                    if (_step < c.steps.length - 1)
                      Expanded(
                        child: FilledButton(
                          onPressed: _busy ? null : _next,
                          child: Text(c.text('next')),
                        ),
                      ),
                    if (_step == c.steps.length - 1)
                      Expanded(
                        child: FilledButton.icon(
                          onPressed: _busy ? null : _save,
                          icon: const Icon(Icons.save_outlined),
                          label: Text(c.text('save')),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}
