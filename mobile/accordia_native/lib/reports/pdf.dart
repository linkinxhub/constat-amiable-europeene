import 'package:flutter/services.dart';

import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;

import 'copy.dart';
import 'model.dart';
import 'sketch.dart';
import 'reference_pdf.dart';

String wrapPdfText(Object? value) {
  final runes = (value?.toString() ?? '').runes.toList();
  return [
    for (var i = 0; i < runes.length; i += 80)
      String.fromCharCodes(runes.sublist(i, (i + 80).clamp(0, runes.length))),
  ].join('\n');
}

Future<Uint8List> buildLocalPdf(
  Map<String, dynamic> source,
  ReportCopy copy,
  ByteData fontBytes, {
  NativePdfStyle style = NativePdfStyle.keyboard,
}) async {
  if ((source['photos'] as List? ?? []).isNotEmpty)
    throw StateError('Evidence preserved; native PDF support pending');
  validatedSketch(source['strokes']);
  final reference = await rootBundle.load('assets/pdf/reference.jpg');
  final regularBytes = await rootBundle.load('assets/pdf/web-regular.ttf');
  final handBytes = await rootBundle.load('assets/pdf/web-hand.ttf');
  final report = cloneReport(source),
      font = pw.Font.ttf(regularBytes),
      writing = style == NativePdfStyle.keyboard
          ? pw.Font.ttf(regularBytes)
          : pw.Font.ttf(handBytes),
      doc = pw.Document(
        title: 'Accordia',
        author: 'Accordia',
        subject: copy.n('unsigned'),
      );
  final active = vehiclesOf(report).take(activeVehicles(report)).toList();
  final theme = pw.ThemeData.withFont(
    base: writing,
    bold: font,
    fontFallback: [font],
  );
  doc.addPage(
    referencePdfPage(
      report,
      copy,
      font,
      writing,
      reference.buffer.asUint8List(
        reference.offsetInBytes,
        reference.lengthInBytes,
      ),
      style,
    ),
  );
  List<pw.Widget> fullField(String label, Object? value) {
    final runes = (value?.toString() ?? '').runes.toList();
    return [
      pw.Text(label, style: const pw.TextStyle(fontSize: 10)),
      for (var j = 0; j < runes.length; j += 500)
        pw.Text(
          wrapPdfText(
            String.fromCharCodes(
              runes.sublist(j, (j + 500).clamp(0, runes.length)),
            ),
          ),
          style: const pw.TextStyle(fontSize: 9),
        ),
    ];
  }

  final annex = <pw.Widget>[
    pw.Text(copy.finalText('annex'), style: const pw.TextStyle(fontSize: 18)),
    for (final name in [
      'date',
      'time',
      'place',
      'city',
      'country',
      'witnesses',
      'otherVehiclesDamage',
      'otherObjectsDamage',
    ])
      if (report[name] != null)
        ...fullField(
          name == 'otherVehiclesDamage'
              ? copy.finalText('thirdVehicles')
              : name == 'otherObjectsDamage'
              ? copy.finalText('thirdObjects')
              : name == 'city'
              ? copy.extra('city')
              : copy.text(name),
          report[name],
        ),
  ];
  for (var i = 0; i < active.length; i++) {
    final v = active[i];
    if (v['kind'] != null)
      annex.addAll(
        fullField(
          copy.data['vehicleKindCopy'][copy.language.name]['title'] as String,
          copy.kinds[v['kind']],
        ),
      );
    annex.add(
      pw.Header(
        level: 1,
        text: '${copy.text('vehicle')} ${i == 0 ? 'A' : 'B'}',
      ),
    );
    // Split long fields into separate paragraphs so no large indivisible widget
    // exceeds a page. Original report strings are never changed.
    for (final name in [
      'driver',
      'policyholder',
      'plate',
      'model',
      'insurer',
      'policy',
      'email',
      'address',
      'damage',
      'observations',
    ]) {
      final text = (v[name] ?? '').toString(), runes = text.runes.toList();
      annex.add(
        pw.Text(copy.text(name), style: const pw.TextStyle(fontSize: 10)),
      );
      for (var j = 0; j < runes.length; j += 500)
        annex.add(
          pw.Text(
            wrapPdfText(
              String.fromCharCodes(
                runes.sublist(j, (j + 500).clamp(0, runes.length)),
              ),
            ),
            style: const pw.TextStyle(fontSize: 9),
          ),
        );
    }
    for (final e in ((v['extra'] as Map?) ?? {}).entries) {
      final runes = e.value.toString().runes.toList();
      annex.add(
        pw.Text(
          copy.extra(e.key.toString()),
          style: const pw.TextStyle(fontSize: 10),
        ),
      );
      for (var j = 0; j < runes.length; j += 500)
        annex.add(
          pw.Text(
            wrapPdfText(
              String.fromCharCodes(
                runes.sublist(j, (j + 500).clamp(0, runes.length)),
              ),
            ),
            style: const pw.TextStyle(fontSize: 9),
          ),
        );
    }
    if ((v['circumstances'] as List? ?? []).isNotEmpty)
      annex.addAll(
        fullField(
          copy.finalText('legacy'),
          (v['circumstances'] as List)
              .map((i) => (copy.dict['circumstances'] as List)[i as int])
              .join('\n'),
        ),
      );
    for (final selected in v['standardCircumstances'] as List? ?? [])
      annex.add(
        pw.Text(
          '${(selected as int) + 1}. ${copy.standard[selected]}',
          style: const pw.TextStyle(fontSize: 9),
        ),
      );
  }
  doc.addPage(
    pw.MultiPage(
      pageFormat: PdfPageFormat.a4,
      theme: theme,
      margin: const pw.EdgeInsets.all(30),
      maxPages: 100,
      footer: (_) =>
          pw.Text(copy.n('unsigned'), style: const pw.TextStyle(fontSize: 8)),
      build: (_) => annex,
    ),
  );
  return doc.save();
}
