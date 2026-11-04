import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';

import 'copy.dart';
import 'form_design.dart';

/// Canonical web geometry. Reading never rewrites the source report.
List<List<Offset>> validatedSketch(Object? value) {
  if (value == null) return [];
  if (value is! List || value.length > 500)
    throw const FormatException('Invalid sketch');
  return [for (final stroke in value) _stroke(stroke)];
}

List<Offset> _stroke(Object? value) {
  if (value is! List || value.length > 5000)
    throw const FormatException('Invalid stroke');
  return [for (final point in value) _point(point)];
}

Offset _point(Object? value) {
  if (value is! Map || value['x'] is! num || value['y'] is! num)
    throw const FormatException('Invalid point');
  final x = (value['x'] as num).toDouble(), y = (value['y'] as num).toDouble();
  if (!x.isFinite || !y.isFinite || x < 0 || x > 800 || y < 0 || y > 320)
    throw const FormatException('Invalid coordinate');
  return Offset(x, y);
}

String sketchSvg(Object? value) {
  final lines = validatedSketch(value);
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 320"><rect width="800" height="320" fill="white"/>'
      '${lines.where((s) => s.isNotEmpty).map((s) => s.length == 1 ? '<circle cx="${s.first.dx}" cy="${s.first.dy}" r="2" fill="#122442"/>' : '<polyline points="${s.map((p) => '${p.dx},${p.dy}').join(' ')}" fill="none" stroke="#122442" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>').join()}'
      '</svg>';
}

class NativeSketch extends StatefulWidget {
  const NativeSketch({
    super.key,
    required this.value,
    required this.copy,
    required this.onChanged,
  });
  final Object? value;
  final ReportCopy copy;
  final ValueChanged<List<dynamic>> onChanged;
  @override
  State<NativeSketch> createState() => _NativeSketchState();
}

class _NativeSketchState extends State<NativeSketch> {
  bool drawing = false;
  late List<dynamic> working;
  @override
  void initState() {
    super.initState();
    working = widget.value is List
        ? List<dynamic>.from(widget.value as List)
        : <dynamic>[];
  }

  @override
  void didUpdateWidget(covariant NativeSketch oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!drawing)
      working = widget.value is List
          ? List<dynamic>.from(widget.value as List)
          : <dynamic>[];
  }

  void publish(List<dynamic> next) {
    working = next;
    widget.onChanged(next);
  }

  FormWords get words => FormWords(widget.copy.language);
  List<dynamic> get source => List<dynamic>.from(working);
  void point(Offset position, Size size, {bool start = false}) {
    final strokes = source;
    if (start) {
      if (strokes.length >= 500) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(words.t('limit'))));
        return;
      }
      strokes.add(<dynamic>[]);
      drawing = true;
    }
    if (!drawing || strokes.isEmpty) return;
    final stroke = List<dynamic>.from(strokes.last as List);
    if (stroke.length >= 5000) {
      drawing = false;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(words.t('limit'))));
      return;
    }
    stroke.add({
      'x': (position.dx / size.width * 800).clamp(0.0, 800.0),
      'y': (position.dy / size.height * 320).clamp(0.0, 320.0),
    });
    strokes[strokes.length - 1] = stroke;
    publish(strokes);
  }

  Future<void> clear() async {
    final yes = await showDialog<bool>(
      context: context,
      builder: (d) => AlertDialog(
        title: Text(words.t('clearAsk')),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(d, false),
            child: Text(widget.copy.text('cancel')),
          ),
          TextButton(
            onPressed: () => Navigator.pop(d, true),
            child: Text(words.t('clear')),
          ),
        ],
      ),
    );
    if (yes == true && mounted) {
      drawing = false;
      publish([]);
    }
  }

  @override
  Widget build(BuildContext context) {
    List<List<Offset>> lines;
    try {
      lines = validatedSketch(widget.value);
    } catch (_) {
      return FormPanel(child: Text(widget.copy.text('readError')));
    }
    return FormPanel(
      title: widget.copy.text('sketch'),
      icon: Icons.draw_outlined,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            words.t('sketchHelp'),
            style: const TextStyle(color: formInk, height: 1.45),
          ),
          const SizedBox(height: 16),
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: DecoratedBox(
              decoration: BoxDecoration(
                color: const Color(0xfff7faff),
                border: Border.all(color: const Color(0xffc5d3e6)),
              ),
              child: AspectRatio(
                aspectRatio: 800 / 320,
                child: LayoutBuilder(
                  builder: (context, constraints) {
                    final size = Size(
                      constraints.maxWidth,
                      constraints.maxHeight,
                    );
                    return Semantics(
                      label: widget.copy.text('sketchHint'),
                      child: GestureDetector(
                        key: const ValueKey('native-sketch-canvas'),
                        behavior: HitTestBehavior.opaque,
                        dragStartBehavior: DragStartBehavior.down,
                        onTapUp: (d) {
                          point(d.localPosition, size, start: true);
                          drawing = false;
                        },
                        onPanStart: (d) =>
                            point(d.localPosition, size, start: true),
                        onPanUpdate: (d) => point(d.localPosition, size),
                        onPanEnd: (_) => drawing = false,
                        onPanCancel: () => drawing = false,
                        child: CustomPaint(
                          painter: SketchPainter(lines),
                          size: size,
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              OutlinedButton.icon(
                onPressed: lines.isEmpty
                    ? null
                    : () {
                        drawing = false;
                        final next = source..removeLast();
                        publish(next);
                      },
                icon: const Icon(Icons.undo),
                label: Text(widget.copy.text('undo')),
              ),
              TextButton.icon(
                onPressed: lines.isEmpty ? null : clear,
                icon: const Icon(Icons.delete_outline),
                label: Text(words.t('clear')),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class SketchPainter extends CustomPainter {
  SketchPainter(this.lines);
  final List<List<Offset>> lines;
  @override
  void paint(Canvas canvas, Size size) {
    final grid = Paint()
      ..color = const Color(0xffe6edf6)
      ..strokeWidth = .6;
    for (var x = 0.0; x < size.width; x += 20)
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), grid);
    for (var y = 0.0; y < size.height; y += 20)
      canvas.drawLine(Offset(0, y), Offset(size.width, y), grid);
    final ink = Paint()
      ..color = formInk
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..style = PaintingStyle.stroke;
    Offset map(Offset p) =>
        Offset(p.dx * size.width / 800, p.dy * size.height / 320);
    for (final line in lines) {
      if (line.isEmpty) continue;
      if (line.length == 1) {
        canvas.drawCircle(map(line.first), 1.5, Paint()..color = formInk);
        continue;
      }
      final path = Path()..moveTo(map(line.first).dx, map(line.first).dy);
      for (final p in line.skip(1)) {
        final q = map(p);
        path.lineTo(q.dx, q.dy);
      }
      canvas.drawPath(path, ink);
    }
  }

  @override
  bool shouldRepaint(covariant SketchPainter oldDelegate) => true;
}
