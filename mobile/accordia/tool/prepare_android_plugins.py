#!/usr/bin/env python3
"""Minimal, checksum-guarded compatibility patch for the locked WebView plugin.

AGP 9 rejects the legacy default Proguard file even for debug builds. Upstream
1.1.3 still references it twice. Do not change Java, permissions, or TLS settings.
Run after `flutter pub get` and before every Android build. Remove this patch once
an upstream stable version supporting AGP 9 has been reviewed and locked.
"""
import hashlib
import json
from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib.request import url2pathname

root = Path(__file__).resolve().parent.parent
config = root / '.dart_tool/package_config.json'
package = next(p for p in json.loads(config.read_text())['packages']
               if p['name'] == 'flutter_inappwebview_android')
uri = urljoin(config.as_uri(), package['rootUri'])
if urlparse(uri).scheme != 'file':
    raise SystemExit('Expected a local package root')
file = Path(url2pathname(urlparse(uri).path)) / 'android/build.gradle'
original_hash = '82b483da0a2885adb5b5a5601bdad16289a0a68631b596ffb1001b6016fc0690'
old = b"getDefaultProguardFile('proguard-android.txt')"
new = b"getDefaultProguardFile('proguard-android-optimize.txt')"
data = file.read_bytes()
restored = data.replace(new, old)
if hashlib.sha256(restored).hexdigest() != original_hash or restored.count(old) != 2:
    raise SystemExit('Unexpected WebView plugin source; review dependency before patching')
patched = restored.replace(old, new)
if patched != data:
    file.write_bytes(patched)
print('WebView Android compatibility source verified; optimized default Proguard file selected')
