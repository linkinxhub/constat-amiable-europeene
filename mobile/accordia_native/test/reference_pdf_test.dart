import 'dart:convert';
import 'dart:io';

import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:accordia_native/design/horizon/copy.dart';
import 'package:accordia_native/reports/copy.dart';
import 'package:accordia_native/reports/pdf.dart';
import 'package:accordia_native/reports/model.dart';
import 'package:accordia_native/reports/reference_pdf.dart';

import 'reports_test.dart' show fixture;

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  test('original supplied form, three writing styles, four annex languages preserve original report', () async {
    final data = await ReportCopy.load(),
        font = await rootBundle.load('assets/fonts/DejaVuSans.ttf');
    final report = fixture()
      ..['city'] = 'Bruxelles'
      ..['witnesses'] = 'TEST FICTIF témoin'
      ..['strokes'] = [
        [
          {'x': 40, 'y': 120},
          {'x': 650, 'y': 210},
        ],
      ];
    vehiclesOf(report)[0]['extra'] = {
      'policyholderFirstName': 'TEST Adèle',
      'policyholderAddress': 'RUE FICTIVE 1',
      'policyholderPostcode': '1000',
      'policyholderCountry': 'BE',
      'policyholderPhone': '000000000',
      'registrationCountry': 'BE',
      'trailerPlate': 'TEST-REMORQUE',
      'trailerCountry': 'BE',
      'greenCard': 'TEST-CARTE',
      'insuranceFrom': '2026-01-01',
      'insuranceUntil': '2026-12-31',
      'agency': 'TEST AGENCE',
      'agencyAddress': 'ADRESSE FICTIVE',
      'agencyPhone': '000000000',
      'comprehensive': 'Oui',
      'driverFirstName': 'TEST Émile',
      'driverBirthDate': '1981-01-01',
      'driverPostcode': '1000',
      'driverCountry': 'BE',
      'driverPhone': '000000000',
      'licenceNumber': 'TEST PERMIS',
      'licenceCategory': 'CE',
      'licenceUntil': '2036-01-01',
      'impact': 'Avant droit',
    };
    final before = jsonEncode(report),
        directory = Platform.environment['ACCORDIA_REFERENCE_PDFS'];
    if (directory != null) {
      await Directory(directory).create(recursive: true);
      await File('$directory/report.json').writeAsString(before);
    }
    for (final lang in HorizonLanguage.values)
      for (final style in NativePdfStyle.values) {
        final bytes = await buildLocalPdf(
          report,
          ReportCopy(data, lang),
          font,
          style: style,
        );
        expect(ascii.decode(bytes.take(4).toList()), '%PDF');
        expect(bytes.length, greaterThan(300000));
        expect(jsonEncode(report), before);
        if (directory != null)
          await File('$directory/${lang.name}-${style.name}.pdf')
              .writeAsBytes(bytes);
      }
    report['count'] = '1';
    final source = jsonEncode(report);
    final bytes = await buildLocalPdf(
      report,
      ReportCopy(data, HorizonLanguage.fr),
      font,
    );
    if (directory != null)
      await File('$directory/single-active.pdf').writeAsBytes(bytes);
    expect(jsonEncode(report), source);
  });
}
