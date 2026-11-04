import 'dart:typed_data';

import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;

import 'copy.dart';
import 'model.dart';
import 'sketch.dart';

enum NativePdfStyle { keyboard, bluePen, blackPen }

/// Same supplied background and 1085×1536 coordinates as server/reference-page.ts.
/// This local preparation never imports or invents a participant signature.
pw.Page referencePdfPage(
  Map<String, dynamic> report,
  ReportCopy copy,
  pw.Font regular,
  pw.Font writing,
  Uint8List image,
  NativePdfStyle style,
) {
  const w = 595.28, h = 841.89, sx = w / 1085, sy = h / 1536;
  final uri =
      'https://accordia-constat.adil-btp.chatgpt.site/account?lang=${copy.language.name}';
  final qr = pw.Barcode.qrCode(
    errorCorrectLevel: pw.BarcodeQRCorrectionLevel.medium,
  );
  final moduleHeight = qr
      .make(uri, width: 43, height: 43, drawText: false)
      .whereType<pw.BarcodeBar>()
      .first
      .height;
  final qrPadding = 43 * 4 / (43 / moduleHeight + 8);
  final access = copy.data['pdfAccessCopy']?[copy.language.name] as Map?;
  final lines = validatedSketch(report['strokes']);
  return pw.Page(
    pageFormat: const PdfPageFormat(w, h),
    margin: pw.EdgeInsets.zero,
    build: (context) {
      final font = writing.getFont(context),
          fallback = regular.getFont(context);
      final color = style == NativePdfStyle.bluePen
          ? const PdfColor(.05, .18, .65)
          : const PdfColor(.05, .05, .05);
      return pw.Stack(
        children: [
          pw.Image(
            pw.MemoryImage(image),
            width: w,
            height: h,
            fit: pw.BoxFit.fill,
          ),
          pw.CustomPaint(
            size: const PdfPoint(w, h),
            painter: (canvas, size) {
              final overflow = <String>[];
              void fill(
                Object? value,
                num x,
                num y,
                num width, [
                num height = 19,
                String label = '',
              ]) {
                if (value == null || value.toString().isEmpty) return;
                final text = value
                    .toString()
                    .replaceAll(
                      RegExp(r'[\u0000-\u0008\u000b\u000c\u000e-\u001f]'),
                      '',
                    )
                    .replaceAll(RegExp(r'\s+'), ' ')
                    .trim();
                final selected = text.runes.every(font.isRuneSupported)
                    ? font
                    : fallback;
                List<String> wrap(double fs) {
                  final rows = <String>[];
                  var row = '';
                  for (final word in text.split(' ')) {
                    final candidate = row.isEmpty ? word : '$row $word';
                    if (selected.stringMetrics(candidate).width * fs <=
                        width * sx) {
                      row = candidate;
                      continue;
                    }
                    if (row.isNotEmpty) {
                      rows.add(row);
                      row = '';
                    }
                    for (final rune in word.runes) {
                      final ch = String.fromCharCode(rune);
                      if (row.isNotEmpty &&
                          selected.stringMetrics(row + ch).width * fs >
                              width * sx) {
                        rows.add(row);
                        row = '';
                      }
                      row += ch;
                    }
                  }
                  if (row.isNotEmpty) rows.add(row);
                  return rows;
                }

                var fs = 8.0;
                while (fs > 5.5 && wrap(fs).length * (fs + 1) > height * sy) {
                  fs -= .25;
                }
                final rows = wrap(fs),
                    max = (height * sy / (fs + 1)).floor().clamp(1, 10000);
                if (rows.length > max)
                  overflow.add(
                    label.isEmpty
                        ? text.substring(0, text.length.clamp(0, 40))
                        : label,
                  );
                canvas.setColor(color);
                for (var i = 0; i < rows.length && i < max; i++) {
                  var row = rows[i];
                  if (i == max - 1 && rows.length > max) {
                    row =
                        '${row.substring(0, (row.length - 2).clamp(0, row.length))} *';
                  }
                  canvas.drawString(
                    selected,
                    fs,
                    row,
                    x * sx,
                    h - y * sy - fs - i * (fs + 1),
                  );
                }
              }

              void check(num x, num y) => fill('X', x, y, 15, 22);
              final r = report;
              fill(r['date'], 60, 86, 145);
              fill(r['time'], 224, 86, 60);
              fill(r['country'], 330, 94, 75);
              fill(
                [r['place'], r['city']]
                    .where((v) => v != null && v.toString().isNotEmpty)
                    .join(' · '),
                460,
                69,
                156,
                32,
                'Lieu',
              );
              if ((r['injured'] ?? '') != '')
                check(r['injured'] == 'yes' ? 782 : 690, 85);
              if ((r['otherVehiclesDamage'] ?? '') != '')
                check(r['otherVehiclesDamage'] == 'yes' ? 174 : 77, 160);
              if ((r['otherObjectsDamage'] ?? '') != '')
                check(r['otherObjectsDamage'] == 'yes' ? 337 : 249, 160);
              fill(r['witnesses'], 405, 136, 640, 46, 'Témoins');
              for (var i = 0; i < 2; i++) {
                final dx = i == 0 ? 0 : 665;
                final v = report['count'] == '1' && i == 1
                    ? vehiclesOf(newReport(copy.language.name))[1]
                    : vehiclesOf(report)[i];
                final e = (v['extra'] as Map?) ?? {};
                fill(v['policyholder'], 84 + dx, 264, 300, 19, 'Assuré');
                fill(e['policyholderFirstName'], 94 + dx, 287, 290);
                fill(e['policyholderAddress'], 96 + dx, 310, 288);
                fill(e['policyholderPostcode'], 122 + dx, 333, 79);
                fill(e['policyholderCountry'], 240 + dx, 333, 142);
                fill(e['policyholderPhone'], 124 + dx, 356, 259);
                if (v['kind'] != null)
                  fill(
                    copy.data['vehicleKindCopy']['fr']['pdfTypes'][v['kind']],
                    135 + dx,
                    389,
                    249,
                    18,
                    'Type de véhicule',
                  );
                fill(v['model'], 45 + dx, 449, 162);
                fill(v['plate'], 45 + dx, 490, 162);
                fill(e['registrationCountry'], 45 + dx, 530, 162);
                fill(e['trailerPlate'], 226 + dx, 490, 158);
                fill(e['trailerCountry'], 226 + dx, 530, 158);
                fill(v['insurer'], 82 + dx, 588, 300);
                fill(v['policy'], 130 + dx, 610, 254);
                fill(e['greenCard'], 142 + dx, 632, 242);
                fill(e['insuranceFrom'], 174 + dx, 674, 95);
                fill(e['insuranceUntil'], 302 + dx, 674, 82);
                fill(e['agency'], 84 + dx, 717, 300);
                fill(e['agencyAddress'], 106 + dx, 739, 277, 37);
                fill(e['agencyPhone'], 120 + dx, 781, 264);
                final comprehensive = e['comprehensive']?.toString() ?? '';
                if (RegExp(
                  r'^(oui|yes|ja)$',
                  caseSensitive: false,
                ).hasMatch(comprehensive)) {
                  check(310 + dx, 822);
                } else if (RegExp(
                  r'^(non|no|nee|nein)$',
                  caseSensitive: false,
                ).hasMatch(comprehensive)) {
                  check(201 + dx, 822);
                } else {
                  fill(e['comprehensive'], 75 + dx, 806, 110);
                }
                fill(v['driver'], 90 + dx, 889, 294);
                fill(e['driverFirstName'], 100 + dx, 912, 284);
                fill(e['driverBirthDate'], 157 + dx, 934, 227);
                fill(v['address'], 101 + dx, 956, 283);
                fill(e['driverPostcode'], 65 + dx, 978, 135);
                fill(e['driverCountry'], 238 + dx, 978, 146);
                fill(
                  [e['driverPhone'], v['email']]
                      .where((s) => s != null && s.toString().isNotEmpty)
                      .join(' / '),
                  125 + dx,
                  1001,
                  259,
                );
                fill(e['licenceNumber'], 162 + dx, 1023, 222);
                fill(e['licenceCategory'], 144 + dx, 1046, 240);
                fill(e['licenceUntil'], 182 + dx, 1069, 202);
                final x = i == 0 ? 43 : 875;
                fill(e['impact'], x, 1156, 168, 24, 'Point de choc');
                fill(v['damage'], x, 1338, 173, 54, 'Dégâts');
                fill(
                  v['observations'],
                  i == 0 ? 44 : 744,
                  1426,
                  i == 0 ? 308 : 305,
                  67,
                  'Observations',
                );
                const ys = [
                  292,
                  314,
                  358,
                  389,
                  440,
                  477,
                  521,
                  565,
                  624,
                  667,
                  698,
                  730,
                  761,
                  792,
                  818,
                  876,
                  920,
                ];
                final selected = v['standardCircumstances'] as List? ?? [];
                for (final k in selected) {
                  if (k is! int || k < 0 || k >= ys.length)
                    throw const FormatException('Invalid circumstances');
                  check(i == 0 ? 412 : 669, ys[k]);
                }
                fill('${selected.length}', i == 0 ? 412 : 669, 973, 15);
              }
              canvas.setColor(color);
              canvas.setLineWidth(.8);
              for (final stroke in lines)
                for (var i = 1; i < stroke.length; i++) {
                  final a = stroke[i - 1], b = stroke[i];
                  canvas.drawLine(
                    (237 + a.dx * .77) * sx,
                    h - (1110 + a.dy * .88) * sy,
                    (237 + b.dx * .77) * sx,
                    h - (1110 + b.dy * .88) * sy,
                  );
                  canvas.strokePath();
                }
              fill('Accordia — document non signé', 400, 1503, 490, 20);
              if (overflow.isNotEmpty)
                fill(
                  '* Suite intégrale en annexes : ${overflow.toSet().join(', ')}',
                  39,
                  1519,
                  995,
                  16,
                );
              // Match the website: replace the printed barcode, never expose report data.
              canvas.setColor(PdfColors.white);
              canvas.drawRect(461, 780, 121, 56);
              canvas.fillPath();
              canvas.setColor(const PdfColor(.08, .16, .26));
              final labels = [
                access?['local']?.toString() ?? 'Accordia',
                access?['offline']?.toString() ?? '',
              ];
              for (var i = 0; i < labels.length; i++) {
                final text = labels[i];
                canvas.drawString(
                  fallback,
                  4.3,
                  text,
                  461 + (121 - fallback.stringMetrics(text).width * 4.3) / 2,
                  i == 0 ? 785 : 780.5,
                );
              }
            },
          ),
          pw.Positioned(
            left: 500,
            top: h - 834,
            child: pw.UrlLink(
              destination: uri,
              child: pw.Container(
                width: 43,
                height: 43,
                padding: pw.EdgeInsets.all(qrPadding),
                child: pw.BarcodeWidget(
                  barcode: qr,
                  data: uri,
                  width: 43 - 2 * qrPadding,
                  height: 43 - 2 * qrPadding,
                  drawText: false,
                ),
              ),
            ),
          ),
        ],
      );
    },
  );
}
