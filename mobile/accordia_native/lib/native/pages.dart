import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:printing/printing.dart';

import '../reports/model.dart';
import '../reports/copy.dart';
import '../reports/vehicle_fields.dart';
import '../reports/form_design.dart';
import '../platform/scanner.dart';
import '../platform/copy.dart';
import '../platform/policy.dart';
import 'api.dart';
import 'copy.dart';

part 'pages/landing_page.dart';
part 'pages/guide_page.dart';
part 'pages/pricing_page.dart';
part 'pages/join_page.dart';
part 'pages/account_page.dart';
part 'pages/reports_page.dart';
part 'pages/report_detail_page.dart';
part 'pages/report_facts.dart';
part 'pages/session_page.dart';
part 'pages/session_documents_page.dart';
part 'pages/participant_editor_page.dart';
part 'pages/feedback_page.dart';
part 'pages/admin_page.dart';
part 'pages/mobile_settings_page.dart';
part 'pages/json_facts.dart';

typedef NativeOpen = void Function(String page, {String? id});

class NativePage extends StatelessWidget {
  const NativePage({super.key, required this.title, required this.child});
  final String title;
  final Widget child;
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: Text(title)),
    body: SafeArea(
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 720),
          child: child,
        ),
      ),
    ),
  );
}

class RequestFailure extends StatelessWidget {
  const RequestFailure({
    super.key,
    required this.error,
    required this.copy,
    required this.retry,
  });
  final Object error;
  final NativeCopy copy;
  final VoidCallback retry;
  @override
  Widget build(BuildContext context) {
    final e = error is NativeApiError ? error as NativeApiError : null;
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        Icon(
          e?.needsAuthentication == true
              ? Icons.lock_outline
              : Icons.info_outline,
          size: 48,
        ),
        const SizedBox(height: 20),
        Text(
          copy.t(
            e?.needsAuthentication == true
                ? 'auth'
                : e?.status == 403
                ? 'denied'
                : e?.status == 409
                ? 'conflict'
                : 'failure',
          ),
          style: Theme.of(context).textTheme.titleLarge,
        ),
        if (e?.needsAuthentication == true) ...[
          const SizedBox(height: 16),
          Text(copy.t('authHelp')),
        ],
        const SizedBox(height: 20),
        OutlinedButton(onPressed: retry, child: Text(copy.t('retry'))),
      ],
    );
  }
}

class ApiPanel extends StatefulWidget {
  const ApiPanel({
    super.key,
    required this.load,
    required this.copy,
    required this.content,
  });
  final Future<Map<String, dynamic>> Function() load;
  final NativeCopy copy;
  final Widget Function(Map<String, dynamic>, VoidCallback) content;
  @override
  State<ApiPanel> createState() => _ApiPanelState();
}

class _ApiPanelState extends State<ApiPanel> {
  late Future<Map<String, dynamic>> future;
  @override
  void initState() {
    super.initState();
    future = widget.load();
  }

  void reload() => setState(() => future = widget.load());
  @override
  Widget build(BuildContext context) => FutureBuilder<Map<String, dynamic>>(
    future: future,
    builder: (context, s) {
      if (s.hasError)
        return RequestFailure(
          error: s.error!,
          copy: widget.copy,
          retry: reload,
        );
      if (!s.hasData) return const Center(child: CircularProgressIndicator());
      return widget.content(s.data!, reload);
    },
  );
}

Future<bool> confirmNative(
  BuildContext context,
  NativeCopy c, {
  String? detail,
}) async =>
    await showDialog<bool>(
      context: context,
      builder: (d) => AlertDialog(
        title: Text(c.t('confirm')),
        content: detail == null ? null : Text(detail),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(d, false),
            child: Text(c.t('cancel')),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(d, true),
            child: Text(c.t('continue')),
          ),
        ],
      ),
    ) ??
    false;
void nativeMessage(BuildContext context, NativeCopy c, Object error) =>
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          c.t(
            error is NativeApiError && error.status == 409
                ? 'conflict'
                : error is NativeApiError && error.needsAuthentication
                ? 'auth'
                : 'failure',
          ),
        ),
      ),
    );
