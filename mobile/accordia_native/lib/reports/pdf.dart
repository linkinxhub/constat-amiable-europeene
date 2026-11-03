import 'dart:typed_data';

import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;

import 'copy.dart';
import 'model.dart';

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
  ByteData fontBytes,
) async {
  if ((source['photos'] as List? ?? []).isNotEmpty ||
      (source['strokes'] as List? ?? []).isNotEmpty)
    throw StateError('Evidence preserved; native PDF support pending');
  final report = cloneReport(source),
      font = pw.Font.ttf(fontBytes),
      doc = pw.Document(
        title: 'Accordia',
        author: 'Accordia',
        subject: copy.n('unsigned'),
      );
  final active = vehiclesOf(report).take(activeVehicles(report)).toList();
  final theme = pw.ThemeData.withFont(base: font, bold: font);
  pw.Widget line(String label, Object? value, {bool brief = false}) {
    var text = value?.toString() ?? '';
    if (brief && text.runes.length > 65) text = copy.n('annex');
    return pw.Padding(
      padding: const pw.EdgeInsets.only(bottom: 5),
      child: pw.Text(
        '$label : ${wrapPdfText(text)}',
        style: const pw.TextStyle(fontSize: 9),
      ),
    );
  }

  pw.Widget vehicle(int side, bool brief) {
    final v = active[side], extra = (v['extra'] as Map?) ?? {};
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        pw.Text(
          '${copy.text('vehicle')} ${side == 0 ? 'A' : 'B'}',
          style: pw.TextStyle(fontSize: 15, color: PdfColors.blue800),
        ),
        line(
          copy.data['vehicleKindCopy'][copy.language.name]['title'] as String,
          copy.kinds[v['kind']] ?? '',
          brief: brief,
        ),
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
        ])
          line(copy.text(name), v[name], brief: brief),
        for (final entry in extra.entries.where(
          (e) => e.value.toString().isNotEmpty,
        ))
          if (!brief || ['trailerPlate', 'trailerCountry'].contains(entry.key))
            line(copy.extra(entry.key.toString()), entry.value, brief: brief),
        pw.Text(
          copy.finalText('standard'),
          style: const pw.TextStyle(fontSize: 9),
        ),
        pw.Text(
          (v['standardCircumstances'] as List? ?? [])
              .map((i) => '${(i as int) + 1}')
              .join(', '),
          style: const pw.TextStyle(fontSize: 9),
        ),
      ],
    );
  }

  doc.addPage(
    pw.Page(
      pageFormat: PdfPageFormat.a4,
      theme: theme,
      margin: const pw.EdgeInsets.all(30),
      build: (context) => pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Text(
            'Accordia',
            style: pw.TextStyle(fontSize: 24, color: PdfColors.blue800),
          ),
          pw.Text(copy.n('unsigned'), style: const pw.TextStyle(fontSize: 10)),
          pw.Text(
            copy.finalText('disclaimer'),
            style: const pw.TextStyle(fontSize: 8),
          ),
          pw.SizedBox(height: 12),
          line(
            copy.text('date'),
            '${report['date']}  ${report['time']}',
            brief: true,
          ),
          line(
            copy.text('place'),
            '${report['place']} ${report['city'] ?? ''} (${report['country']})',
            brief: true,
          ),
          line(
            copy.text('injured'),
            report['injured'] == 'no'
                ? copy.text('no')
                : report['injured'] == 'yes'
                ? copy.text('yes')
                : '',
          ),
          pw.SizedBox(height: 10),
          pw.Row(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              for (var i = 0; i < active.length; i++)
                pw.Expanded(
                  child: pw.Padding(
                    padding: const pw.EdgeInsets.only(right: 12),
                    child: vehicle(i, true),
                  ),
                ),
            ],
          ),
          pw.Spacer(),
          pw.Text(copy.n('annex'), style: const pw.TextStyle(fontSize: 9)),
        ],
      ),
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
