package be.adilbtp.accordia

import android.content.Intent
import android.net.Uri
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private var pairingChannel: MethodChannel? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        pairingChannel = MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "accordia/mobile-pairing")
        pairingChannel?.setMethodCallHandler { call, result ->
            if (call.method != "open") {
                result.notImplemented()
                return@setMethodCallHandler
            }
            val uri = (call.arguments as? String)?.let(Uri::parse)
            if (uri == null || !isPairingUri(uri, "accordia-recette.adil-btp.chatgpt.site", "/mobile-pairing")) {
                result.error("invalid_url", null, null)
                return@setMethodCallHandler
            }
            try {
                startActivity(Intent(Intent.ACTION_VIEW, uri).addCategory(Intent.CATEGORY_BROWSABLE))
                result.success(null)
            } catch (_: android.content.ActivityNotFoundException) {
                result.error("no_browser", null, null)
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        val uri = intent.data ?: return
        if (intent.action == Intent.ACTION_VIEW && isPairingUri(uri, "accordia-recette-mobile.onrender.com", "/mobile-pairing/return")) {
            pairingChannel?.invokeMethod("callback", uri.toString())
        }
    }

    private fun isPairingUri(uri: Uri, host: String, path: String): Boolean =
        uri.scheme == "https" &&
            uri.host == host &&
            uri.userInfo == null &&
            (uri.port == -1 || uri.port == 443) &&
            uri.path == path
}
