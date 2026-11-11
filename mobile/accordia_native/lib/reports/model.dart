import 'dart:convert';
import 'dart:math';

String newReportId() {
  final b = List<int>.generate(16, (_) => Random.secure().nextInt(256));
  b[6] = (b[6] & 15) | 64;
  b[8] = (b[8] & 63) | 128;
  final s = b.map((v) => v.toRadixString(16).padLeft(2, '0')).join();
  return '${s.substring(0, 8)}-${s.substring(8, 12)}-${s.substring(12, 16)}-${s.substring(16, 20)}-${s.substring(20)}';
}

Map<String, dynamic> cloneReport(Map<String, dynamic> report) =>
    jsonDecode(jsonEncode(report)) as Map<String, dynamic>;
Map<String, dynamic> newReport(String language) => {
  'id': newReportId(),
  'updated': DateTime.now().toUtc().toIso8601String(),
  'readingLanguages': [language, language],
  'date': '',
  'time': '',
  'place': '',
  'country': 'BE',
  'injured': '',
  'otherVehiclesDamage': '',
  'otherObjectsDamage': '',
  'count': '',
  'witnesses': '',
  'photos': <dynamic>[],
  'strokes': <dynamic>[],
  'vehicles': List.generate(
    2,
    (_) => <String, dynamic>{
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
        name: '',
      'circumstances': <int>[],
      'standardCircumstances': <int>[],
      'standardConfirmed': false,
      'extra': <String, dynamic>{},
    },
  ),
};
const vehicleKinds = [
  'car',
  'van',
  'truck',
  'truck-trailer',
  'car-trailer',
  'other',
];
bool hasTrailer(Map<String, dynamic> vehicle) =>
    ['truck-trailer', 'car-trailer'].contains(vehicle['kind']);
int activeVehicles(Map<String, dynamic> report) =>
    report['count'] == '1' ? 1 : 2;
List<Map<String, dynamic>> vehiclesOf(Map<String, dynamic> report) =>
    (report['vehicles'] as List).cast<Map<String, dynamic>>();
List<String> situationIssues(Map<String, dynamic> report) {
  final issues = <String>[];
  final date = report['date'] as String? ?? '',
      time = report['time'] as String? ?? '';
  final d = DateTime.tryParse(date);
  final now = DateTime.now();
  if (!RegExp(r'^\d{4}-\d{2}-\d{2}$').hasMatch(date) ||
      d == null ||
      d.toIso8601String().substring(0, 10) != date ||
      d.isAfter(DateTime(now.year, now.month, now.day)))
    issues.add('date');
  if (!RegExp(r'^(?:[01]\d|2[0-3]):[0-5]\d$').hasMatch(time))
    issues.add('time');
  if ((report['place']?.toString().trim().length ?? 0) < 3) issues.add('place');
  if (report['injured'] != 'no') issues.add('injured');
  if (!['1', '2'].contains(report['count'])) issues.add('count');
  for (final key in ['otherVehiclesDamage', 'otherObjectsDamage'])
    if (!['yes', 'no'].contains(report[key])) issues.add(key);
  return issues;
}

List<String> vehicleIssues(Map<String, dynamic> report) {
  final issues = <String>[];
  for (var side = 0; side < activeVehicles(report); side++) {
    final v = vehiclesOf(report)[side];
    for (final field in [
      'driver',
      'policyholder',
      'plate',
      'model',
      'insurer',
      'policy',
    ]) {
      if ((v[field]?.toString().trim() ?? '').isEmpty)
        issues.add('$side.$field');
    }
    if (!vehicleKinds.contains(v['kind'])) issues.add('$side.kind');
    final extra = (v['extra'] as Map?) ?? {};
    final trailer =
        (extra['trailerPlate']?.toString().trim() ?? '').isNotEmpty ||
        (extra['trailerCountry']?.toString().trim() ?? '').isNotEmpty;
    if (hasTrailer(v) &&
        (extra['trailerPlate']?.toString().trim() ?? '').isEmpty)
      issues.add('$side.trailerPlate');
    if (['car', 'van', 'truck'].contains(v['kind']) && trailer)
      issues.add('$side.vehicleConfiguration');
    final email = v['email']?.toString() ?? '';
    if (email.isNotEmpty &&
        !RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(email))
      issues.add('$side.email');
  }
  return issues;
}

void validateReportShape(Map<String, dynamic> data) {
  if (data['id'] is! String ||
      !RegExp(r'^[a-f0-9-]{36}$').hasMatch(data['id']) ||
      data['vehicles'] is! List ||
      (data['vehicles'] as List).length != 2)
    throw const FormatException('Invalid report');
  for (final vehicle in data['vehicles']) {
    if (vehicle is! Map<String, dynamic>)
      throw const FormatException('Invalid vehicle');
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
      if (vehicle[name] is! String || (vehicle[name] as String).length > 4000)
        throw const FormatException('Invalid field');
    }
  }
}
