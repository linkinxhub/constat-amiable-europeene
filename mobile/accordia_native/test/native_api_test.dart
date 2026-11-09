import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:accordia_native/native/api.dart';
import 'package:accordia_native/reports/model.dart';
import 'package:accordia_native/reports/copy.dart';
import 'package:accordia_native/native/pages.dart';
import 'package:accordia_native/native/copy.dart';
import 'package:accordia_native/native/routes.dart';
import 'package:accordia_native/design/horizon/copy.dart';

class RecordingTransport implements ApiTransport {
  int status = 401, calls = 0;
  String mime = 'application/json';
  Object value = {'error': 'unauthenticated'};
  Uri? last;
  Map<String, String>? headers;
  Object? body;
  @override
  Future<ApiReply> send(
    String method,
    Uri uri,
    Map<String, String> h,
    Uint8List? b,
  ) async {
    calls++;
    last = uri;
    headers = h;
    body = b == null ? null : jsonDecode(utf8.decode(b));
    return ApiReply(
      status,
      mime,
      Uint8List.fromList(
        value is List<int>
            ? value as List<int>
            : utf8.encode(jsonEncode(value)),
      ),
    );
  }
}

void main() {
  test('native transport targets exact origin and server write guard, never forges identity', () async {
    final t = RecordingTransport()
          ..status = 200
          ..value = {'id': '00000000-0000-4000-8000-000000000001'},
        api = NativeApi(transport: t);
    await api.join(
      '00000000-0000-4000-8000-000000000001',
      'TEST_ONLY_INVITATION',
    );
    expect(t.last!.scheme, 'https');
    expect(t.last!.host, nativeApiHost);
    expect(
      t.last!.path,
      '/api/sessions/00000000-0000-4000-8000-000000000001/invite',
    );
    expect(t.last!.hasFragment, false);
    expect(t.headers!['x-accordia-request'], '1');
    expect(t.headers!['Origin'], 'https://$nativeApiHost');
    expect(
      t.headers!.keys.any(
        (k) => k.startsWith('oai-') || k == 'Authorization' || k == 'Cookie',
      ),
      false,
    );
    expect(t.body, {'token': 'TEST_ONLY_INVITATION'});
  });
  test('401 and HTML or redirect login pages never become a fake signed-in account', () async {
    final t = RecordingTransport(), api = NativeApi(transport: t);
    await expectLater(
      api.account(),
      throwsA(isA<NativeApiError>().having((e) => e.status, 'status', 401)),
    );
    t.status = 302;
    await expectLater(
      api.account(),
      throwsA(
        isA<NativeApiError>().having(
          (e) => e.needsAuthentication,
          'auth',
          true,
        ),
      ),
    );
    t.status = 200;
    t.mime = 'text/html';
    await expectLater(api.account(), throwsA(isA<NativeApiError>()));
  });
  test(
    'session PDF reads the real endpoint and keeps the response bytes',
    () async {
      final bytes = utf8.encode('%PDF-1.7\n');
      final transport = RecordingTransport()
        ..status = 200
        ..mime = 'application/pdf'
        ..value = bytes;
      final api = NativeApi(transport: transport);
      expect(await api.documentPdf('session-id', 'document-id'), bytes);
      expect(transport.last!.host, nativeApiHost);
      expect(
        transport.last!.path,
        '/api/sessions/session-id/final/document-id/pdf',
      );
      expect(transport.headers, {'Accept': 'application/pdf'});
      await expectLater(
        api.documentPdf('session-id', '../other'),
        throwsFormatException,
      );
      expect(transport.calls, 1);
    },
  );

  test('session PDF rejects access failures and invalid bodies', () async {
    final transport = RecordingTransport();
    final api = NativeApi(transport: transport);
    for (final status in [401, 403, 404, 503]) {
      transport.status = status;
      await expectLater(
        api.documentPdf('session', 'document'),
        throwsA(
          isA<NativeApiError>().having((e) => e.status, 'status', status),
        ),
      );
    }
    for (final (status, mime, expected) in [
      (302, 'text/html', 401),
      (200, 'text/html', 401),
      (200, 'application/json', 502),
      (200, 'application/pdf', 502),
      (206, 'application/pdf', 206),
    ]) {
      transport.status = status;
      transport.mime = mime;
      await expectLater(
        api.documentPdf('session', 'document'),
        throwsA(
          isA<NativeApiError>().having((e) => e.status, 'status', expected),
        ),
      );
    }
  });

  for (final language in HorizonLanguage.values) {
    testWidgets('session PDF statuses fit at 320 px in $language', (
      tester,
    ) async {
      tester.view.devicePixelRatio = 1;
      tester.view.physicalSize = const Size(320, 600);
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      final transport = RecordingTransport()
        ..status = 200
        ..value = {
          'documents': [
            {'id': 'review', 'revision': 1, 'lang': 'fr', 'ready': false},
            {'id': 'signed', 'revision': 2, 'lang': 'nl', 'ready': true},
          ],
        };
      final copy = NativeCopy(language);
      await tester.pumpWidget(
        MaterialApp(
          home: NativeSessionDocumentsPage(
            api: NativeApi(transport: transport),
            copy: copy,
            id: 'session',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text(copy.t('reviewPdf')), findsOneWidget);
      expect(find.text(copy.t('signedPdf')), findsOneWidget);
      expect(find.text('NL · v2'), findsOneWidget);
      transport.status = 403;
      await tester.tap(find.text(copy.t('signedPdf')));
      await tester.pumpAndSettle();
      expect(find.text(copy.t('denied')), findsOneWidget);
      expect(transport.last!.path, '/api/sessions/session/final/signed/pdf');
      expect(tester.takeException(), isNull);
    });
  }

  test('arbitrary destinations and record identifiers cannot redirect native requests', () async {
    final t = RecordingTransport(), api = NativeApi(transport: t);
    await expectLater(
      api.request('GET', 'https://evil.example/api/account'),
      throwsFormatException,
    );
    expect(() => NativeApi.id('../admin'), throwsFormatException);
    expect(t.calls, 0);
  });
  test(
    'report updates preserve unknown fields and use actual CAS contract',
    () async {
      final t = RecordingTransport()
            ..status = 200
            ..value = {'revision': 4},
          api = NativeApi(transport: t);
      final report = {
        'id': '00000000-0000-4000-8000-000000000001',
        'extraOriginal': {'value': 'preserved'},
      };
      await api.saveReport('00000000-0000-4000-8000-000000000001', report, 3);
      expect(t.body, {'report': report, 'expectedRevision': 3});
    },
  );
  test('all nine real website routes have a native page entry', () {
    expect(nativeRouteMap.length, 9);
    expect(nativeRouteMap.map((r) => r.webPath).toSet(), {
      '/',
      '/constat',
      '/account',
      '/guide',
      '/pricing',
      '/feedback',
      '/admin',
      '/join',
      '/session/[id]',
    });
  });
  testWidgets(
    'feedback retains user text on server refusal instead of simulating success',
    (tester) async {
      final transport = RecordingTransport(),
          c = NativeCopy(HorizonLanguage.fr);
      await tester.pumpWidget(
        MaterialApp(
          home: NativeFeedbackPage(
            api: NativeApi(transport: transport),
            copy: c,
          ),
        ),
      );
      await tester.enterText(
        find.byType(TextField),
        'TEST FICTIF : retour non transmis.',
      );
      await tester.tap(find.text(c.t('send')));
      await tester.pumpAndSettle();
      await tester.tap(find.text(c.t('continue')));
      await tester.pumpAndSettle();
      expect(transport.calls, 1);
      expect(find.text('TEST FICTIF : retour non transmis.'), findsOneWidget);
      expect(find.text(c.t('saved')), findsNothing);
    },
  );
  testWidgets('foreign invitation is refused before any request', (
    tester,
  ) async {
    final transport = RecordingTransport(), c = NativeCopy(HorizonLanguage.fr);
    await tester.pumpWidget(
      MaterialApp(
        home: NativeJoinPage(
          api: NativeApi(transport: transport),
          copy: c,
          open: (page, {id}) {},
        ),
      ),
    );
    await tester.enterText(
      find.byType(TextField),
      'https://evil.example/session/TEST_ONLY#invite=TEST_ONLY_INVITATION',
    );
    await tester.tap(find.text(c.t('continue')));
    await tester.pumpAndSettle();
    expect(find.text(c.t('invalid')), findsOneWidget);
    expect(transport.calls, 0);
  });
  testWidgets(
    'participant back requires confirmation and preserves unsaved input on cancel',
    (tester) async {
      final transport = RecordingTransport(),
          c = NativeCopy(HorizonLanguage.fr);
      final reportCopy = ReportCopy(
        (await tester.runAsync(ReportCopy.load))!,
        HorizonLanguage.fr,
      );
      await tester.pumpWidget(
        MaterialApp(
          home: Builder(
            builder: (context) => Scaffold(
              body: TextButton(
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute<void>(
                    builder: (_) => NativeParticipantEditor(
                      api: NativeApi(transport: transport),
                      copy: c,
                      reportCopy: reportCopy,
                      id: '00000000-0000-4000-8000-000000000001',
                      data: {
                        'report': newReport('fr'),
                        'side': 'A',
                        'revision': 1,
                      },
                    ),
                  ),
                ),
                child: const Text('Open'),
              ),
            ),
          ),
        ),
      );
      await tester.tap(find.text('Open'));
      await tester.pumpAndSettle();
      await tester.enterText(
        find.byType(TextFormField).first,
        'TEST FICTIF participant',
      );
      await tester.pump();
      await tester.pageBack();
      await tester.pumpAndSettle();
      expect(find.text(c.t('unsaved')), findsOneWidget);
      await tester.tap(find.text(c.t('cancel')));
      await tester.pumpAndSettle();
      expect(find.text('TEST FICTIF participant'), findsOneWidget);
      expect(transport.calls, 0);
    },
  );
}
