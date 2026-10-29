package com.doctorpanic.app

import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.Uri
import android.app.AlertDialog
import android.content.ClipData
import android.content.ClipboardManager
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.RenderProcessGoneDetail
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.webkit.WebViewAssetLoader
import java.io.ByteArrayInputStream
import java.util.Locale

/**
 * Hosts the web game from the APK assets. Adds what the browser version
 * cannot do: keep the screen on during an operation and dismiss the
 * cardiac-arrest screen when the player slaps the table.
 */
class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView
    private lateinit var slapListener: SlapListener

    /** The page asked to listen; survives onPause so we can resume. */
    private var slapRequested = false

    private val micPermission = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted && slapRequested) startSlap()
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        CrashLog.install(this)

        val root = FrameLayout(this)
        root.setBackgroundColor(ContextCompat.getColor(this, R.color.theme_green))
        webView = WebView(this)
        webView.overScrollMode = View.OVER_SCROLL_NEVER
        root.addView(webView)
        setContentView(root)

        // Android 15 draws edge to edge; keep the game clear of the system bars
        ViewCompat.setOnApplyWindowInsetsListener(root) { v, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout())
            v.setPadding(bars.left, bars.top, bars.right, bars.bottom)
            WindowInsetsCompat.CONSUMED
        }
        WindowCompat.getInsetsController(window, root).isAppearanceLightStatusBars = false

        slapListener = SlapListener(this, onLevel = { level, jolted ->
            webView.evaluateJavascript(
                String.format(
                    Locale.US, "window.gameplay && gameplay.onMicLevel && gameplay.onMicLevel(%.3f, %.3f, %b)",
                    level, SlapDetector.MIN_PEAK, jolted
                ),
                null
            )
        }, onSlap = {
            slapRequested = false
            webView.evaluateJavascript("window.gameplay && gameplay.onSlap && gameplay.onSlap()", null)
        })

        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            // The alarm and phone ring start from game timers, not taps
            mediaPlaybackRequiresUserGesture = false
            allowFileAccess = false
            // Same layout whatever the system font size
            textZoom = 100
        }
        webView.addJavascriptInterface(Bridge(), "DPNative")
        // Needed for alert() (the debug toggle uses it)
        webView.webChromeClient = WebChromeClient()
        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? {
                // Pages still include cordova.js from the old Cordova build; serve it empty
                if (request.url.path?.endsWith("/cordova.js") == true) {
                    return WebResourceResponse("text/javascript", "utf-8", ByteArrayInputStream(ByteArray(0)))
                }
                return assetLoader.shouldInterceptRequest(request.url)
            }

            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                if (request.url.host == HOST) return false
                startActivity(Intent(Intent.ACTION_VIEW, request.url))
                return true
            }

            // Without this a crashed or killed renderer (e.g. out of memory)
            // takes the whole app down; start over with a fresh WebView instead
            override fun onRenderProcessGone(view: WebView, detail: RenderProcessGoneDetail): Boolean {
                val reason = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && detail.didCrash()) "crashed" else "was killed"
                CrashLog.write(this@MainActivity, "WebView renderer $reason on ${view.url}")
                finish()
                startActivity(Intent(this@MainActivity, MainActivity::class.java))
                return true
            }

            override fun onPageStarted(view: WebView, url: String, favicon: Bitmap?) {
                stopSlap()
                setKeepScreenOn(isOperation(url))
            }
        }

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() = goBack()
        })

        if (savedInstanceState == null) {
            webView.loadUrl(START_URL)
        } else {
            webView.restoreState(savedInstanceState)
        }

        val crash = CrashLog.take(this)
        if (crash != null) {
            showCrash(crash)
        } else if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            micPermission.launch(Manifest.permission.RECORD_AUDIO)
        }
    }

    /** Shows what went wrong last time, so it can be reported without adb. */
    private fun showCrash(report: String) {
        AlertDialog.Builder(this)
            .setTitle("Doctor Panic crashed last time")
            .setMessage(report)
            .setPositiveButton("Copy") { _, _ ->
                val clipboard = getSystemService(CLIPBOARD_SERVICE) as ClipboardManager
                clipboard.setPrimaryClip(ClipData.newPlainText("Doctor Panic crash", report))
            }
            .setNegativeButton("Close", null)
            .show()
    }

    private fun goBack() {
        val url = webView.url.orEmpty()
        when {
            // Mid-operation: open the pause menu like tapping the header,
            // unless a popup (defibrillator, call, event) is showing
            isOperation(url) -> webView.evaluateJavascript(
                "if (!$('.ui-popup-active').length) { $('header').first().trigger('click'); }", null
            )
            // Going back from the result would restart the finished operation
            url.contains("/victory.html") || url.contains("/defeat.html") -> {
                webView.loadUrl(START_URL)
                webView.clearHistory()
            }
            webView.canGoBack() -> webView.goBack()
            else -> finish()
        }
    }

    private fun isOperation(url: String) = Uri.parse(url).lastPathSegment?.startsWith("operation-") == true

    private fun setKeepScreenOn(on: Boolean) {
        if (on) {
            window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        } else {
            window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        }
    }

    private fun startSlap() {
        slapRequested = true
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
            slapListener.start()
        }
    }

    private fun stopSlap() {
        slapRequested = false
        slapListener.stop()
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
        if (slapRequested) slapListener.start()
    }

    override fun onPause() {
        // Background microphone use needs a foreground service; just stop
        slapListener.stop()
        webView.onPause()
        super.onPause()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }

    override fun onDestroy() {
        slapListener.stop()
        webView.destroy()
        super.onDestroy()
    }

    /** Exposed to the page as window.DPNative. Calls arrive on a binder thread. */
    inner class Bridge {
        @JavascriptInterface
        fun startSlap() = runOnUiThread { this@MainActivity.startSlap() }

        @JavascriptInterface
        fun stopSlap() = runOnUiThread { this@MainActivity.stopSlap() }
    }

    companion object {
        private const val HOST = "appassets.androidplatform.net"
        private const val START_URL = "https://$HOST/assets/pages/homepage.html"
    }
}
