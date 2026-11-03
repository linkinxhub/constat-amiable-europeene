import 'dart:async';

import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import 'copy.dart';
import 'policy.dart';

class AccordiaScanner extends StatefulWidget {
  const AccordiaScanner({super.key, required this.copy});
  final PlatformCopy copy;
  @override
  State<AccordiaScanner> createState() => _AccordiaScannerState();
}

class _AccordiaScannerState extends State<AccordiaScanner>
    with WidgetsBindingObserver {
  final controller = MobileScannerController(
    autoStart: false,
    formats: [BarcodeFormat.qrCode],
    detectionSpeed: DetectionSpeed.noDuplicates,
  );
  bool _done = false;
  String? _error;
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    unawaited(_start());
  }

  Future<void> _start() async {
    try {
      await controller.start();
    } catch (_) {
      if (mounted) setState(() => _error = widget.copy.t('camera'));
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && !_done) {
      unawaited(_start());
    } else {
      unawaited(controller.stop());
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    unawaited(controller.dispose());
    super.dispose();
  }

  void _found(String? value) {
    if (_done || value == null) return;
    final uri = scannedAccordia(value);
    if (uri == null) {
      setState(() => _error = widget.copy.t('invalid'));
      return;
    }
    _done = true;
    unawaited(controller.stop());
    Navigator.pop(context, uri);
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: Text(widget.copy.t('scan'))),
    body: Column(
      children: [
        Expanded(
          child: MobileScanner(
            controller: controller,
            onDetect: (data) {
              for (final b in data.barcodes) {
                _found(b.rawValue);
                if (_done) break;
              }
            },
            errorBuilder: (_, _) =>
                Center(child: Text(widget.copy.t('camera'))),
          ),
        ),
        if (_error != null)
          Padding(padding: const EdgeInsets.all(20), child: Text(_error!)),
        TextButton(
          onPressed: () =>
              Navigator.pop(context, Uri(scheme: 'accordia-paste')),
          child: Text(widget.copy.t('paste')),
        ),
      ],
    ),
  );
}
