import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:printing/printing.dart';

import 'copy.dart';
import 'policy.dart';

class AccordiaPlatformPage extends StatefulWidget {
  const AccordiaPlatformPage({
    super.key,
    required this.uri,
    required this.copy,
    required this.openOutside,
    this.onPresentation,
  });
  final Uri uri;
  final PlatformCopy copy;
  final Future<bool> Function(Uri) openOutside;
  final Future<void> Function(Map<String, dynamic>)? onPresentation;
  @override
  State<AccordiaPlatformPage> createState() => _AccordiaPlatformPageState();
}

class _AccordiaPlatformPageState extends State<AccordiaPlatformPage>
    with WidgetsBindingObserver {
  InAppWebViewController? _controller;
  bool _error = false,
      _leaving = false,
      _allowExit = false,
      _downloadBusy = false,
      _externalBusy = false;
  int _progress = 0;
  String _visibleHost = accordiaHost;
  String _errorKey = 'error';
  PlatformCopy get c => widget.copy;
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    PlatformInAppWebViewController.debugLoggingSettings.enabled = false;
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    final ctl = _controller;
    if (ctl == null) return;
    if (state != AppLifecycleState.resumed) {
      unawaited(ctl.pause());
    } else {
      unawaited(ctl.resume());
    }
  }

  void _message(String key) {
    if (mounted)
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(c.t(key))));
  }

  Future<bool> _confirm(String title, String body, String yes) async =>
      await showDialog<bool>(
        context: context,
        builder: (d) => AlertDialog(
          title: Text(c.t(title)),
          content: Text(c.t(body)),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(d, false),
              child: Text(c.t('cancel')),
            ),
            FilledButton(
              onPressed: () => Navigator.pop(d, true),
              child: Text(c.t(yes)),
            ),
          ],
        ),
      ) ??
      false;
  Future<void> _back({bool home = false}) async {
    if (_leaving || _downloadBusy) return;
    _leaving = true;
    try {
      final ctl = _controller;
      if (!home && ctl != null && await ctl.canGoBack()) {
        await ctl.goBack();
        return;
      }
      if (!mounted) return;
      if (await _confirm('close', 'closeHelp', 'leave') && mounted) {
        await _syncPresentation();
        if (!mounted) return;
        setState(() => _allowExit = true);
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) Navigator.pop(context);
        });
      }
    } finally {
      _leaving = false;
    }
  }

  Future<void> _external(Uri uri) async {
    if (_externalBusy) return;
    if (!canOpenOutside(uri)) {
      _message('blocked');
      return;
    }
    _externalBusy = true;
    try {
      if (await _confirm('outside', 'outsideHelp', 'continue')) {
        if (!await widget.openOutside(uri)) _message('unsupported');
      }
    } catch (_) {
      _message('unsupported');
    } finally {
      _externalBusy = false;
    }
  }

  Future<NavigationActionPolicy> _navigate(
    InAppWebViewController ctl,
    NavigationAction action,
  ) async {
    final uri = Uri.tryParse(action.request.url?.toString() ?? '');
    if (action.isForMainFrame == false) return NavigationActionPolicy.ALLOW;
    if (isAccordia(uri) || isTrustedAuthentication(uri))
      return NavigationActionPolicy.ALLOW;
    if (isAccordiaBlob(uri)) {
      unawaited(_pdf(uri!));
      return NavigationActionPolicy.CANCEL;
    }
    if (uri != null) unawaited(_external(uri));
    return NavigationActionPolicy.CANCEL;
  }

  Future<void> _syncPresentation() async {
    final ctl = _controller;
    if (ctl == null || widget.onPresentation == null) return;
    try {
      if (!isAccordia(Uri.tryParse((await ctl.getUrl())?.toString() ?? '')))
        return;
      final result = await ctl
          .callAsyncJavaScript(
            functionBody: r"""
        const abort=new AbortController();const timer=setTimeout(()=>abort.abort(),2000);
        try {const response=await fetch('/api/mobile/config',{credentials:'same-origin',redirect:'error',cache:'no-store',signal:abort.signal});
        if(!response.ok||!response.headers.get('content-type')?.includes('application/json'))return null;
        const text=await response.text();if(new TextEncoder().encode(text).length>4096)return null;return JSON.parse(text);
        } finally {clearTimeout(timer);}
      """,
          )
          .timeout(const Duration(seconds: 3));
      if (result?.value is Map &&
          isAccordia(Uri.tryParse((await ctl.getUrl())?.toString() ?? ''))) {
        await widget.onPresentation!(
          (result!.value as Map).cast<String, dynamic>(),
        );
      }
    } catch (_) {
      /* The last valid presentation and the current form are preserved. */
    }
  }

  Future<void> _pdf(Uri uri) async {
    final ctl = _controller;
    if (_downloadBusy || ctl == null) return;
    if (!(isAccordia(uri) || isAccordiaBlob(uri)) ||
        !isAccordia(Uri.tryParse((await ctl.getUrl())?.toString() ?? ''))) {
      _message('blocked');
      return;
    }
    setState(() => _downloadBusy = true);
    try {
      final fetched = await ctl.callAsyncJavaScript(
        functionBody: r'''
        delete window.__accordiaPdf;
        const response=await fetch(url,{credentials:'same-origin',redirect:'error'});
        if(!response.ok)throw Error('unavailable');
        const reader=response.body.getReader(), parts=[];let size=0;
        while(true){const item=await reader.read();if(item.done)break;size+=item.value.length;
          if(size>67108864){await reader.cancel();throw Error('size');}parts.push(item.value);}
        const bytes=new Uint8Array(size);let position=0;for(const part of parts){bytes.set(part,position);position+=part.length;}
        if(size<5||String.fromCharCode(...bytes.slice(0,5))!=='%PDF-')throw Error('format');
        window.__accordiaPdf=bytes;return size;
      ''',
        arguments: {'url': uri.toString()},
      );
      final size = fetched?.value;
      if (size is! num || size < 5 || size > 67108864)
        throw StateError('PDF unavailable');
      final result = BytesBuilder(copy: false);
      for (var offset = 0; offset < size; offset += 196608) {
        if (!mounted ||
            !isAccordia(Uri.tryParse((await ctl.getUrl())?.toString() ?? '')))
          throw StateError('Navigation changed');
        final chunk = await ctl.callAsyncJavaScript(
          functionBody: r'''
          const bytes=window.__accordiaPdf;if(!bytes)throw Error('missing');
          const end=Math.min(start+196608,bytes.length);let binary='';for(let i=start;i<end;i++)binary+=String.fromCharCode(bytes[i]);return btoa(binary);
        ''',
          arguments: {'start': offset},
        );
        if (chunk?.value is! String) throw StateError('Chunk unavailable');
        result.add(base64Decode(chunk!.value as String));
      }
      final bytes = result.takeBytes();
      if (bytes.length != size ||
          ascii.decode(bytes.take(5).toList()) != '%PDF-')
        throw StateError('Invalid PDF');
      if (!mounted) return;
      await Navigator.push(
        context,
        MaterialPageRoute<void>(
          builder: (_) => Scaffold(
            appBar: AppBar(title: Text(c.t('download'))),
            body: PdfPreview(
              build: (_) => bytes,
              canDebug: false,
              canChangePageFormat: false,
              canChangeOrientation: false,
              pdfFileName: 'Accordia-plateforme.pdf',
            ),
          ),
        ),
      );
    } catch (_) {
      _message('unsupported');
    } finally {
      try {
        await ctl.evaluateJavascript(source: 'delete window.__accordiaPdf;');
      } catch (_) {}
      if (mounted) setState(() => _downloadBusy = false);
    }
  }

  @override
  Widget build(BuildContext context) => PopScope(
    canPop: _allowExit,
    onPopInvokedWithResult: (didPop, _) {
      if (!didPop) unawaited(_back());
    },
    child: Scaffold(
      appBar: AppBar(
        leading: BackButton(onPressed: _back),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Accordia'),
            Text(_visibleHost, style: Theme.of(context).textTheme.labelSmall),
          ],
        ),
        actions: [
          IconButton(
            onPressed: () => _back(home: true),
            tooltip: c.t('close'),
            icon: const Icon(Icons.home_outlined),
          ),
          IconButton(
            onPressed: () async {
              if (await _confirm('close', 'closeHelp', 'continue'))
                await _controller?.reload();
            },
            tooltip: c.t('retry'),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: Column(
        children: [
          if (_progress < 100) LinearProgressIndicator(value: _progress / 100),
          if (_downloadBusy) const LinearProgressIndicator(),
          if (_error)
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text(c.t(_errorKey)),
            ),
          Expanded(
            child: InAppWebView(
              initialUrlRequest: URLRequest(url: WebUri(widget.uri.toString())),
              initialSettings: InAppWebViewSettings(
                javaScriptEnabled: true,
                domStorageEnabled: true,
                incognito: false,
                cacheEnabled: true,
                thirdPartyCookiesEnabled: false,
                sharedCookiesEnabled: true,
                useShouldOverrideUrlLoading: true,
                useOnDownloadStart: true,
                supportMultipleWindows: true,
                javaScriptCanOpenWindowsAutomatically: false,
                mediaPlaybackRequiresUserGesture: true,
                allowsInlineMediaPlayback: true,
                allowFileAccess: false,
                allowContentAccess: true,
                allowFileAccessFromFileURLs: false,
                allowUniversalAccessFromFileURLs: false,
                mixedContentMode: MixedContentMode.MIXED_CONTENT_NEVER_ALLOW,
                isInspectable: false,
                geolocationEnabled: true,
              ),
              onWebViewCreated: (ctl) => _controller = ctl,
              shouldOverrideUrlLoading: _navigate,
              onLoadStart: (ctl, url) {
                final uri = Uri.tryParse(url?.toString() ?? '');
                if (!isAccordia(uri) && !isTrustedAuthentication(uri)) {
                  unawaited(ctl.stopLoading());
                  if (uri != null) unawaited(_external(uri));
                  return;
                }
                if (mounted)
                  setState(() {
                    _error = false;
                    _progress = 0;
                  });
              },
              onUpdateVisitedHistory: (_, url, _) {
                if (mounted)
                  setState(
                    () => _visibleHost =
                        Uri.tryParse(url?.toString() ?? '')?.host ??
                        accordiaHost,
                  );
              },
              onLoadStop: (_, _) async {
                await _syncPresentation();
              },
              onProgressChanged: (_, p) {
                if (mounted) setState(() => _progress = p);
              },
              onReceivedError: (_, request, _) {
                if (request.isForMainFrame == true && mounted)
                  setState(() {
                    _error = true;
                    _errorKey = 'error';
                  });
              },
              onReceivedHttpError: (_, request, response) {
                if (request.isForMainFrame == true && mounted)
                  setState(() {
                    _error = true;
                    _errorKey = [401, 403].contains(response.statusCode)
                        ? 'access'
                        : 'error';
                  });
              },
              onCreateWindow: (ctl, action) async {
                final uri = Uri.tryParse(action.request.url?.toString() ?? '');
                if (isAccordia(uri) || isTrustedAuthentication(uri)) {
                  await ctl.loadUrl(
                    urlRequest: URLRequest(url: WebUri(uri.toString())),
                  );
                } else if (isAccordiaBlob(uri)) {
                  unawaited(_pdf(uri!));
                } else if (uri != null) {
                  unawaited(_external(uri));
                } else {
                  _message('unsupported');
                }
                return false;
              },
              onJsBeforeUnload: (_, _) async => JsBeforeUnloadResponse(
                handledByClient: true,
                action: await _confirm('close', 'closeHelp', 'leave')
                    ? JsBeforeUnloadResponseAction.CONFIRM
                    : JsBeforeUnloadResponseAction.CANCEL,
              ),
              onDownloadStartRequest: (_, request) {
                final uri = Uri.tryParse(request.url.toString());
                if (uri != null) unawaited(_pdf(uri));
              },
              onPermissionRequest: (ctl, request) async {
                final valid = isAccordia(
                  Uri.tryParse(request.origin.toString()),
                );
                final cameraOnly =
                    request.resources.length == 1 &&
                    request.resources.single == PermissionResourceType.CAMERA;
                final allow =
                    valid &&
                    cameraOnly &&
                    await _confirm('permission', 'scope', 'continue') &&
                    await Permission.camera.request().isGranted;
                return PermissionResponse(
                  resources: request.resources,
                  action: allow
                      ? PermissionResponseAction.GRANT
                      : PermissionResponseAction.DENY,
                );
              },
              onGeolocationPermissionsShowPrompt: (ctl, origin) async {
                final valid = isAccordia(Uri.tryParse(origin));
                final allow =
                    valid &&
                    await _confirm('location', 'scope', 'continue') &&
                    await Permission.locationWhenInUse.request().isGranted;
                return GeolocationPermissionShowPromptResponse(
                  origin: origin,
                  allow: allow,
                  retain: false,
                );
              },
            ),
          ),
        ],
      ),
    ),
  );
}
