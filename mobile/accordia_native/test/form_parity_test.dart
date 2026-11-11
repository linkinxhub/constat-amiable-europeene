import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:accordia_native/design/horizon/copy.dart';
import 'package:accordia_native/reports/copy.dart';
import 'package:accordia_native/reports/model.dart';
import 'package:accordia_native/reports/vehicle_fields.dart';

void main() {
  late Map<String, dynamic> data;
  setUpAll(() async {
    data = await ReportCopy.load();
  });
  for (final language in HorizonLanguage.values)
    testWidgets(
      'native A/B full text schema, editable lists and no data loss at 320px: ${language.name}',
      (tester) async {
        tester.view.physicalSize = const Size(320, 720);
        tester.view.devicePixelRatio = 1;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);
        final vehicle = vehiclesOf(newReport(language.name))[0];
        vehicle['kind'] = 'truck-trailer';
        vehicle['unknownOriginal'] = {'source': 'preserved'};
        final copy = ReportCopy(data, language);
        await tester.pumpWidget(
          MaterialApp(
            home: Scaffold(
              body: StatefulBuilder(
                builder: (context, refresh) => SingleChildScrollView(
                  child: Form(
                    child: NativeVehicleFields(
                      vehicle: vehicle,
                      side: 0,
                      copy: copy,
                      onChanged: () => refresh(() {}),
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
        final keys = [
          ...(data['formParity']['fields'] as List),
          ...(data['formParity']['detailGroups'] as List).expand(
            (g) => g as List,
          ),
        ];
        for (final key in keys)
          expect(
            find.byKey(ValueKey('0-$key'), skipOffstage: false),
            findsOneWidget,
          );
        final driver = find.descendant(
          of: find.byKey(const ValueKey('0-driver')),
          matching: find.byType(TextFormField),
        );
        await tester.ensureVisible(driver);
        await tester.enterText(driver, 'TEST FICTIF Émile');
        await tester.pump();
        final insurer = find.byKey(const ValueKey('0-insurer'));
        await tester.ensureVisible(insurer);
        await tester.pumpAndSettle();
        await tester.tap(
          find.descendant(
            of: insurer,
            matching: find.byType(PopupMenuButton<String>),
          ),
        );
        await tester.pumpAndSettle();
        await tester.tap(find.text('AXA'));
        await tester.pumpAndSettle();
        expect(vehicle['insurer'], 'AXA');
        final insurerInput = find.descendant(
          of: insurer,
          matching: find.byType(TextFormField),
        );
        await tester.enterText(insurerInput, 'AXA — agence saisie librement');
        await tester.pump();
        expect(vehicle['driver'], 'TEST FICTIF Émile');
        expect(vehicle['insurer'], 'AXA — agence saisie librement');
        expect(vehicle['unknownOriginal'], {'source': 'preserved'});
        expect(tester.takeException(), isNull);
      },
    );
  testWidgets(
    'changing standard circumstances invalidates confirmation and retains historical choices',
    (tester) async {
      final vehicle = vehiclesOf(newReport('fr'))[0]
        ..['circumstances'] = [7]
        ..['standardConfirmed'] = true;
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: StatefulBuilder(
              builder: (context, refresh) => SingleChildScrollView(
                child: NativeCircumstances(
                  vehicle: vehicle,
                  copy: ReportCopy(data, HorizonLanguage.fr),
                  onChanged: () => refresh(() {}),
                ),
              ),
            ),
          ),
        ),
      );
      expect(
        find.textContaining(
          ReportCopy(data, HorizonLanguage.fr).finalText('legacy'),
        ),
        findsOneWidget,
      );
      await tester.tap(find.byType(CheckboxListTile).first);
      await tester.pump();
      expect(vehicle['standardConfirmed'], false);
      expect(vehicle['standardCircumstances'], [0]);
      expect(vehicle['circumstances'], [7]);
    },
  );
  test('damage suggestions preserve narrative, prevent duplicate lines and respect server limit', () {
    expect(
      appendNativeDamage('Récit original', 'Pare-chocs'),
      'Récit original\nPare-chocs',
    );
    expect(
      appendNativeDamage('Récit original\nPare-chocs', 'Pare-chocs'),
      'Récit original\nPare-chocs',
    );
    final full = 'x' * 3999;
    expect(appendNativeDamage(full, 'Pare-chocs'), full);
  });
}
