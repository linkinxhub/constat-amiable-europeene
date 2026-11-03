import 'dart:convert';
import 'dart:io';

import 'package:cryptography/cryptography.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:accordia_mobile/reports/model.dart';
import 'package:accordia_mobile/reports/store.dart';
import 'package:accordia_mobile/reports/copy.dart';
import 'package:accordia_mobile/reports/pdf.dart';
import 'package:accordia_mobile/reports/editor.dart';
import 'package:accordia_mobile/design/horizon/copy.dart';

class TestKey implements DraftKey {
  @override
  Future<SecretKey> read() async => SecretKey(List<int>.generate(32, (i) => i));
}

class EditorTestStore implements DraftStore {
  EditorTestStore(this.draft);
  LocalDraft draft;
  @override
  Future<DraftListing> list() async => DraftListing([draft], 0);
  @override
  Future<LocalDraft> save(
    Map<String, dynamic> report, {
    required int expectedRevision,
  }) async {
    if (expectedRevision != draft.revision)
      throw StateError('Revision conflict');
    draft = LocalDraft(cloneReport(report), expectedRevision + 1);
    return draft;
  }

  @override
  Future<void> delete(String id, {required int expectedRevision}) async {}
}

Map<String, dynamic> fixture() {
  final r = newReport('fr');
  r.addAll({
    'date': '2026-01-01',
    'time': '12:30',
    'place': 'TEST FICTIF Bruxelles',
    'injured': 'no',
    'count': '2',
    'otherVehiclesDamage': 'no',
    'otherObjectsDamage': 'no',
  });
  for (var i = 0; i < 2; i++) {
    final v = vehiclesOf(r)[i];
    v.addAll({
      'kind': i == 0 ? 'truck-trailer' : 'car',
      'driver': i == 0 ? 'ACTIVE_A Émile Müller' : 'PRIVATE_B FICTIF',
      'policyholder': 'ASSURÉ $i',
      'plate': 'FICTIF-$i',
      'model': 'TEST',
      'insurer': 'TEST ASSURANCE',
      'policy': 'TEST-POLICE',
      'damage': 'TEST DEGATS',
      'observations': 'TEST OBSERVATIONS',
      'standardCircumstances': [0, 7],
      'standardConfirmed': true,
    });
    if (i == 0)
      v['extra'] = {'trailerPlate': 'TEST-REMORQUE', 'trailerCountry': 'BE'};
  }
  return r;
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  test('native model separates parties, enforces dates/trailers and preserves inactive B', () {
    final report = fixture();
    expect(situationIssues(report), isEmpty);
    expect(vehicleIssues(report), isEmpty);
    report['date'] = '2026-02-31';
    expect(situationIssues(report), contains('date'));
    report['count'] = '1';
    vehiclesOf(report)[1]['driver'] = '';
    expect(vehicleIssues(report), isEmpty);
    final v = vehiclesOf(report)[0];
    v['kind'] = 'truck';
    expect(vehicleIssues(report), contains('0.vehicleConfiguration'));
    expect(v['extra']['trailerPlate'], 'TEST-REMORQUE');
    v['kind'] = 'truck-trailer';
    v['extra']['trailerPlate'] = '';
    expect(vehicleIssues(report), contains('0.trailerPlate'));
  });
  test('encrypted storage roundtrips full source, rejects stale writers and deletes only confirmed revision', () async {
    final dir = await Directory.systemTemp.createTemp('accordia-vault-test-');
    addTearDown(() => dir.delete(recursive: true));
    final store = EncryptedDraftStore(dir, TestKey()), report = fixture();
    report['futureField'] = {'original': 'keep'};
    final saved = await store.save(report, expectedRevision: 0);
    expect(saved.revision, 1);
    final disk = await File('${dir.path}/${saved.id}.enc').readAsString();
    expect(disk.contains('ACTIVE_A'), false);
    expect(disk.contains('TEST-POLICE'), false);
    final list = await store.list();
    expect(list.items.single.report['futureField'], {'original': 'keep'});
    final results = await Future.wait([
      store
          .save(report, expectedRevision: 1)
          .then<Object>((v) => v, onError: (Object e) => e),
      store
          .save(report, expectedRevision: 1)
          .then<Object>((v) => v, onError: (Object e) => e),
    ]);
    expect(results.whereType<LocalDraft>().length, 1);
    expect(results.whereType<StateError>().length, 1);
    await expectLater(
      store.delete(saved.id, expectedRevision: 1),
      throwsStateError,
    );
    await store.delete(saved.id, expectedRevision: 2);
    expect((await store.list()).items, isEmpty);
  });
  test(
    'tampered ciphertext stays on disk and is never silently replaced',
    () async {
      final dir = await Directory.systemTemp.createTemp(
        'accordia-tamper-test-',
      );
      addTearDown(() => dir.delete(recursive: true));
      final store = EncryptedDraftStore(dir, TestKey()),
          saved = await store.save(fixture(), expectedRevision: 0);
      final file = File('${dir.path}/${saved.id}.enc');
      final obj = jsonDecode(await file.readAsString());
      obj['mac'] = base64Encode(List<int>.filled(16, 0));
      await file.writeAsString(jsonEncode(obj));
      final list = await store.list();
      expect(list.unreadable, 1);
      expect(list.items, isEmpty);
      expect(await file.exists(), true);
      await expectLater(
        store.save(saved.report, expectedRevision: 1),
        throwsA(anything),
      );
      expect(await file.exists(), true);
    },
  );
  test('native PDFs preserve originals and can be generated offline in all four languages', () async {
    final data = await ReportCopy.load(),
        font = await rootBundle.load('assets/fonts/DejaVuSans.ttf');
    final directory = Platform.environment['ACCORDIA_PDF_PROBE_DIR'];
    for (final language in HorizonLanguage.values) {
      final r = fixture();
      r['count'] = '1';
      vehiclesOf(r)[0]['observations'] = 'LONG_' + ('M' * 3900) + '_END';
      final before = jsonEncode(r);
      final bytes = await buildLocalPdf(r, ReportCopy(data, language), font);
      expect(ascii.decode(bytes.take(4).toList()), '%PDF');
      expect(bytes.length, greaterThan(10000));
      expect(jsonEncode(r), before);
      if (directory != null) {
        await Directory(directory).create(recursive: true);
        await File('$directory/${language.name}.pdf').writeAsBytes(bytes);
        await File('$directory/report.json').writeAsString(before);
      }
    }
  });
  testWidgets(
    'native editor saves and resumes data without invoking an external website',
    (tester) async {
      final data = (await tester.runAsync(ReportCopy.load))!;
      final saved = LocalDraft(fixture(), 1);
      final store = EditorTestStore(saved);
      await tester.pumpWidget(
        MaterialApp(
          home: ReportEditor(
            copy: ReportCopy(data, HorizonLanguage.fr),
            store: store,
            initial: saved,
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('TEST FICTIF Bruxelles'), findsOneWidget);
      final fields = find.byType(TextFormField);
      expect(fields, findsWidgets);
      await tester.enterText(fields.at(2), 'NOUVEAU LIEU TEST');
      await tester.tap(find.byTooltip('Enregistrer le brouillon'));
      await tester.pumpAndSettle();
      expect(
        (await store.list()).items.single.report['place'],
        'NOUVEAU LIEU TEST',
      );
      expect(tester.takeException(), isNull);
    },
  );
  for (final language in HorizonLanguage.values) {
    testWidgets('internal report reaches review at 320px in ${language.name}', (
      tester,
    ) async {
      tester.view.physicalSize = const Size(320, 780);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      final data = (await tester.runAsync(ReportCopy.load))!;
      final copy = ReportCopy(data, language);
      final original = fixture();
      final store = EditorTestStore(LocalDraft(original, 1));
      await tester.pumpWidget(
        MaterialApp(
          home: ReportEditor(copy: copy, store: store, initial: store.draft),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.byType(CheckboxListTile).first);
      await tester.pumpAndSettle();
      for (var i = 0; i < 3; i++) {
        await tester.tap(find.text(copy.text('next')));
        await tester.pumpAndSettle();
        expect(find.text(copy.steps[i + 1]), findsOneWidget);
        expect(tester.takeException(), isNull);
      }
      expect(find.text(copy.n('pdf')), findsOneWidget);
      expect(store.draft.report['vehicles'], original['vehicles']);
    });
  }
}
