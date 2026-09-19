package com.agtstudio.productai;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.ConsoleMessage;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.TextView;
import androidx.annotation.RequiresApi;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import android.util.Base64;

public class MainActivity extends Activity {
    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;
    private static final int FILE_PICKER = 1001;
    private static final String KEY_ALIAS = "agt_product_ai_vault_v1";

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);

        FrameLayout root = new FrameLayout(this);
        TextView loading = new TextView(this);
        loading.setText("AGT Product AI\n\nUygulama yükleniyor…");
        loading.setTextColor(Color.WHITE);
        loading.setTextSize(18);
        loading.setGravity(17);
        loading.setBackgroundColor(Color.rgb(8, 10, 15));
        root.addView(loading, new FrameLayout.LayoutParams(-1, -1));

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(8, 10, 15));
        webView.setLayerType(View.LAYER_TYPE_SOFTWARE, null);
        webView.setVisibility(View.VISIBLE);

        WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        webView.setWebViewClient(new WebViewClientCompat() {
            @Override
            @RequiresApi(21)
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            @SuppressWarnings("deprecation")
            public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
                return assetLoader.shouldInterceptRequest(Uri.parse(url));
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                loading.setVisibility(View.GONE);
                view.setVisibility(View.VISIBLE);
            }

            @Override
            @SuppressWarnings("deprecation")
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                loading.setText("AGT Product AI\\n\\nYerel arayüz yüklenemedi.\\nLütfen uygulamayı yeniden açın.");
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage message) {
                android.util.Log.d("AGTProductAI", message.message() + " @" + message.lineNumber());
                return true;
            }

            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                filePathCallback = callback;
                Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("image/*");
                startActivityForResult(Intent.createChooser(intent, "Ürün fotoğrafı seç"), FILE_PICKER);
                return true;
            }
        });

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        webView.addJavascriptInterface(new SecureVault(), "AGTNativeVault");
        root.addView(webView, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);

        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html");
    }

    private SecretKey key() throws Exception {
        KeyStore ks = KeyStore.getInstance("AndroidKeyStore");
        ks.load(null);
        if (!ks.containsAlias(KEY_ALIAS)) {
            KeyGenerator generator = KeyGenerator.getInstance("AES", "AndroidKeyStore");
            generator.init(256);
            generator.generateKey();
        }
        return ((KeyStore.SecretKeyEntry) ks.getEntry(KEY_ALIAS, null)).getSecretKey();
    }

    private class SecureVault {
        @android.webkit.JavascriptInterface
        public String get(String name) {
            try {
                String stored = getPreferences(0).getString(name, null);
                if (stored == null) return "";
                byte[] all = Base64.decode(stored, Base64.DEFAULT);
                byte[] iv = new byte[12];
                System.arraycopy(all, 0, iv, 0, 12);
                Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
                cipher.init(Cipher.DECRYPT_MODE, key(), new GCMParameterSpec(128, iv));
                return new String(cipher.doFinal(all, 12, all.length - 12), StandardCharsets.UTF_8);
            } catch (Exception e) {
                return "";
            }
        }

        @android.webkit.JavascriptInterface
        public boolean set(String name, String value) {
            try {
                byte[] iv = new byte[12];
                new java.security.SecureRandom().nextBytes(iv);
                Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
                cipher.init(Cipher.ENCRYPT_MODE, key(), new GCMParameterSpec(128, iv));
                byte[] encrypted = cipher.doFinal(value.getBytes(StandardCharsets.UTF_8));
                byte[] all = new byte[iv.length + encrypted.length];
                System.arraycopy(iv, 0, all, 0, iv.length);
                System.arraycopy(encrypted, 0, all, iv.length, encrypted.length);
                return getPreferences(0).edit()
                        .putString(name, Base64.encodeToString(all, Base64.NO_WRAP))
                        .commit();
            } catch (Exception e) {
                return false;
            }
        }

        @android.webkit.JavascriptInterface
        public boolean remove(String name) {
            return getPreferences(0).edit().remove(name).commit();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != FILE_PICKER || filePathCallback == null) return;
        Uri[] result = null;
        if (resultCode == RESULT_OK && data != null && data.getData() != null) {
            result = new Uri[]{data.getData()};
        }
        filePathCallback.onReceiveValue(result);
        filePathCallback = null;
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
}
