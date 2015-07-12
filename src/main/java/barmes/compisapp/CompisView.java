package barmes.compisapp;

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.webkit.CookieManager;
import android.webkit.CookieSyncManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

public class CompisView extends Activity {

    private WebView myWebView;
    /** Called when the activity is first created. */
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if ((keyCode == KeyEvent.KEYCODE_BACK) && myWebView.canGoBack()) { // Enables browsing to previous pages with the hardware back button
            myWebView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }


    public void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_compis_view);

        myWebView = (WebView) findViewById(R.id.webview); // Create an instance of WebView and set it to the layout component created with id webview in main.xml
        myWebView.getSettings().setJavaScriptEnabled(true);
        myWebView.loadUrl("file:///android_asset/ComPisApp.html");
        myWebView.setWebViewClient(new WebViewKeep());
        myWebView.setInitialScale(1); // Set the initial zoom scale
        myWebView.getSettings().setBuiltInZoomControls(true); // Initialize zoom controls for your WebView component
        myWebView.getSettings().setUseWideViewPort(true); // Initializes double-tap zoom control
        myWebView.addJavascriptInterface(new webViewInterface(this),"Android");

    }

    private class WebViewKeep extends WebViewClient {
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            view.loadUrl(url);
            return true;
        }
    }
}

