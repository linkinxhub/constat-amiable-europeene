import 'dart:io';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:accordia_native/config/mobile_config.dart';
import 'package:accordia_native/design/horizon/copy.dart';
import 'package:accordia_native/design/horizon/theme.dart';
import 'package:accordia_native/reports/copy.dart';
import 'package:accordia_native/reports/editor.dart';
import 'package:accordia_native/reports/form_design.dart';
import 'package:accordia_native/reports/model.dart';
import 'package:accordia_native/reports/store.dart';

import 'reports_test.dart' show EditorTestStore;

void main() {
  for (final language in HorizonLanguage.values)
    testWidgets(
      'input design at phone size and enlarged text: ${language.name}',
      (tester) async {
        tester.view.physicalSize = const Size(390, 900);
        tester.view.devicePixelRatio = 1;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);
        final data = (await tester.runAsync(ReportCopy.load))!;
        final font = FontLoader('AccordiaPreview')
          ..addFont(rootBundle.load('assets/fonts/DejaVuSans.ttf'));
        await font.load();
        await (FontLoader(
          'MaterialIcons',
        )..addFont(rootBundle.load('fonts/MaterialIcons-Regular.otf'))).load();
        final theme = horizonTheme(MobileConfig.fallback);
        final key = GlobalKey();
        final report = newReport(language.name)
          ..['date'] = '2026-01-01'
          ..['time'] = '12:30'
          ..['place'] = 'TEST FICTIF Bruxelles'
          ..['count'] = '2'
          ..['injured'] = 'no'
          ..['otherVehiclesDamage'] = 'no'
          ..['otherObjectsDamage'] = 'no';
        final store = EditorTestStore(LocalDraft(report, 1));
        final copy = ReportCopy(data, language);
        debugDisableShadows = false;
        addTearDown(() => debugDisableShadows = true);
        Future<void> capture(String name) async {
          final directory = Platform.environment['ACCORDIA_INPUT_PREVIEWS'];
          if (directory == null || language != HorizonLanguage.fr) return;
          await tester.pumpAndSettle();
          await tester.runAsync(() async {
            final boundary =
                key.currentContext!.findRenderObject()!
                    as RenderRepaintBoundary;
            final image = await boundary.toImage(pixelRatio: 1);
            final bytes = await image.toByteData(
              format: ui.ImageByteFormat.png,
            );
            image.dispose();
            await Directory(directory).create(recursive: true);
            await File('$directory/$name.png')
                .writeAsBytes(bytes!.buffer.asUint8List());
          });
        }

        await tester.pumpWidget(
          RepaintBoundary(
            key: key,
            child: MaterialApp(
              debugShowCheckedModeBanner: false,
              theme: theme.copyWith(
                textTheme: theme.textTheme.apply(fontFamily: 'AccordiaPreview'),
              ),
              home: ReportEditor(
                copy: copy,
                store: store,
                initial: store.draft,
              ),
            ),
          ),
        );
        await tester.pumpAndSettle();
        expect(tester.takeException(), isNull);
        await capture('situation');
        await tester.tap(find.byType(CheckboxListTile).first);
        await tester.pump();
        await tester.tap(find.text(copy.text('next')));
        await tester.pumpAndSettle();
        expect(tester.takeException(), isNull);
        await capture('vehicle');
        debugDisableShadows = true;
        // A separate render at 320 px and 1.6× text checks layout without changing report data.
        tester.view.physicalSize = const Size(320, 780);
        await tester.pumpWidget(
          MaterialApp(
            debugShowCheckedModeBanner: false,
            theme: theme,
            builder: (context, child) => MediaQuery(
              data: MediaQuery.of(context)
                  .copyWith(textScaler: const TextScaler.linear(1.6)),
              child: child!,
            ),
            home: ReportEditor(copy: copy, store: store, initial: store.draft),
          ),
        );
        await tester.pumpAndSettle();
        expect(tester.takeException(), isNull);
        final words = FormWords(language);
        expect(find.text('${words.t('step')} 1 / 5'), findsOneWidget);
        expect(find.text(copy.n('local')), findsOneWidget);
        await tester.tap(find.byType(CheckboxListTile).first);
        await tester.pump();
        await tester.tap(find.text(copy.text('next')));
        await tester.pumpAndSettle();
        expect(tester.takeException(), isNull);
        expect(find.text('${words.t('step')} 2 / 5'), findsOneWidget);
        await tester.tap(
          find.widgetWithText(OutlinedButton, copy.text('back')),
        );
        await tester.pumpAndSettle();
        expect(tester.takeException(), isNull);
        expect(find.text('${words.t('step')} 1 / 5'), findsOneWidget);
        expect(store.draft.report['place'], 'TEST FICTIF Bruxelles');
      },
    );
}
