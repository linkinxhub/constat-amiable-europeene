import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:cryptography/cryptography.dart';
import 'package:accordia_native/reports/sketch.dart';
import 'package:accordia_native/reports/form_design.dart';
import 'package:accordia_native/reports/copy.dart';
import 'package:accordia_native/reports/model.dart';
import 'package:accordia_native/reports/store.dart';
import 'package:accordia_native/reports/pdf.dart';
import 'package:accordia_native/design/horizon/copy.dart';

class SketchTestKey implements DraftKey {
  @override
  Future<SecretKey> read() async => SecretKey(List<int>.generate(32, (i) => i));
}

void main() {
  late Map<String, dynamic> data;
  setUpAll(() async {
    data = await ReportCopy.load();
  });
  test('canonical geometry is bounded, invalid input is rejected without rewriting it', () {
    final raw = [
      [
        {'x': 0, 'y': 320},
        {'x': 800, 'y': 0},
      ],
    ];
    final before = jsonEncode(raw);
    expect(validatedSketch(raw).first.last, const Offset(800, 0));
    expect(jsonEncode(raw), before);
    for (final bad in [
      [
        [
          {'x': 801, 'y': 0},
        ],
      ],
      [
        [
          {'x': double.nan, 'y': 0},
        ],
      ],
      List.generate(501, (_) => []),
      [
        List.generate(5001, (_) => {'x': 0, 'y': 0}),
      ],
    ])
      expect(() => validatedSketch(bad), throwsFormatException);
  });
  testWidgets(
    'draw, undo and confirmed clear act on actual canonical strokes',
    (tester) async {
      List<dynamic> strokes = [];
      final copy = ReportCopy(data, HorizonLanguage.fr);
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: StatefulBuilder(
              builder: (context, refresh) => SingleChildScrollView(
                child: NativeSketch(
                  value: strokes,
                  copy: copy,
                  onChanged: (v) => refresh(() => strokes = v),
                ),
              ),
            ),
          ),
        ),
      );
      final canvas = find.byKey(const ValueKey('native-sketch-canvas'));
      await tester.drag(canvas, const Offset(90, 25));
      await tester.pump();
      expect(strokes, isNotEmpty);
      expect(validatedSketch(strokes).first.length, greaterThan(1));
      await tester.tap(find.text(copy.text('undo')));
      await tester.pump();
      expect(strokes, isEmpty);
      await tester.drag(canvas, const Offset(70, 10));
      await tester.pump();
      await tester.tap(find.text(FormWords(copy.language).t('clear')));
      await tester.pumpAndSettle();
      await tester.tap(find.text(copy.text('cancel')));
      await tester.pumpAndSettle();
      expect(strokes, isNotEmpty);
      await tester.tap(find.text(FormWords(copy.language).t('clear')));
      await tester.pumpAndSettle();
      await tester.tap(
        find
            .widgetWithText(TextButton, FormWords(copy.language).t('clear'))
            .last,
      );
      await tester.pumpAndSettle();
      expect(strokes, isEmpty);
    },
  );
  testWidgets(
    'malformed historical sketch stays untouched and is never silently replaced',
    (tester) async {
      var changes = 0;
      const original = 'INVALID HISTORICAL PAYLOAD';
      final copy = ReportCopy(data, HorizonLanguage.fr);
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: NativeSketch(
              value: original,
              copy: copy,
              onChanged: (_) => changes++,
            ),
          ),
        ),
      );
      expect(find.text(copy.text('readError')), findsOneWidget);
      expect(changes, 0);
      expect(tester.takeException(), isNull);
    },
  );
  test('sketch survives encrypted draft resume and preparation PDF without changing data', () async {
    final directory = await Directory.systemTemp.createTemp('accordia-sketch-');
    addTearDown(() => directory.delete(recursive: true));
    final store = EncryptedDraftStore(directory, SketchTestKey());
    final report = newReport('fr')
      ..['count'] = '1'
      ..['unknownOriginal'] = {'kept': true}
      ..['strokes'] = [
        [
          {'x': 10, 'y': 20},
          {'x': 760, 'y': 300},
        ],
      ];
    final saved = await store.save(report, expectedRevision: 0),
        resumed = (await store.list()).items.single;
    expect(resumed.report['strokes'], saved.report['strokes']);
    expect(resumed.report['unknownOriginal'], {'kept': true});
    final source = jsonEncode(resumed.report),
        font = await rootBundle.load('assets/fonts/DejaVuSans.ttf');
    final bytes = await buildLocalPdf(
      resumed.report,
      ReportCopy(data, HorizonLanguage.fr),
      font,
    );
    expect(ascii.decode(bytes.take(4).toList()), '%PDF');
    expect(jsonEncode(resumed.report), source);
    expect(
      sketchSvg(resumed.report['strokes']),
      contains('10.0,20.0 760.0,300.0'),
    );
    final out = Platform.environment['ACCORDIA_SKETCH_PDF'];
    if (out != null) await File(out).writeAsBytes(bytes);
  });
}
