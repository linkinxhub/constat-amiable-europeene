part of '../pages.dart';

class _JsonFacts extends StatelessWidget {
  const _JsonFacts(this.data);
  final Map<String, dynamic> data;
  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.all(24),
    children: [
      SelectableText(const JsonEncoder.withIndent('  ').convert(data)),
    ],
  );
}
