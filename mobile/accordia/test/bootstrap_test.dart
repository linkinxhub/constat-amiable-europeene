import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:accordia_mobile/config/mobile_config.dart';
import 'package:accordia_mobile/config/config_repository.dart';
import 'package:accordia_mobile/design/horizon/bootstrap.dart';

class Cache implements ConfigCache {
  @override
  Future<Map<String, dynamic>?> read() async => null;
  @override
  Future<void> write(Map<String, dynamic> value) async {}
}

class Source implements ConfigSource {
  final response = Completer<Map<String, dynamic>>();
  @override
  Future<Map<String, dynamic>> fetch() => response.future;
}

void main() {
  testWidgets(
    'startup does not wait for network and does not restyle an active report',
    (tester) async {
      final source = Source();
      final repository = ConfigRepository(source: source, cache: Cache());
      Widget host(bool active) => HorizonBootstrap(
        repository: repository,
        reportInProgress: active,
        locale: const Locale('fr'),
        contentBuilder: (_, config) => Scaffold(body: Text(config.title)),
      );
      await tester.pumpWidget(host(true));
      await tester.pumpAndSettle();
      expect(find.text('Accordia'), findsOneWidget);
      source.response.complete({
        ...MobileConfig.fallback.toJson(),
        'revision': 1,
        'title': 'New published title',
      });
      await tester.pump();
      expect(find.text('New published title'), findsNothing);
      await tester.pumpWidget(host(false));
      await tester.pump();
      expect(find.text('New published title'), findsOneWidget);
      await repository.pendingWrites;
    },
  );
  testWidgets('late configuration completion after disposal is ignored', (
    tester,
  ) async {
    final source = Source();
    final repo = ConfigRepository(source: source, cache: Cache());
    await tester.pumpWidget(
      HorizonBootstrap(
        repository: repo,
        reportInProgress: false,
        locale: const Locale('fr'),
        contentBuilder: (_, config) => Text(config.title),
      ),
    );
    await tester.pump();
    await tester.pumpWidget(const SizedBox.shrink());
    source.response.complete({
      ...MobileConfig.fallback.toJson(),
      'revision': 1,
    });
    await tester.pump();
    expect(tester.takeException(), isNull);
  });
}
