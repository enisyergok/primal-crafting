package com.enisyergok.primalcrafting;

import android.app.Activity;
import android.os.Bundle;
import android.os.Build;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.view.Window;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/** Local interactive illustrated game surface. Game rules live in the asset model. */
public final class MainActivity extends Activity {
    private WebView web;
    private SharedPreferences saves;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        if(Build.VERSION.SDK_INT>=30)getWindow().setDecorFitsSystemWindows(true);
        getWindow().setStatusBarColor(Color.rgb(38,28,18));
        getWindow().setNavigationBarColor(Color.rgb(38,28,18));
        saves=getSharedPreferences("primal-story",MODE_PRIVATE);
        web=new WebView(this);
        WebSettings settings=web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(false);
        settings.setBuiltInZoomControls(false);
        settings.setTextZoom(100);
        web.setBackgroundColor(Color.rgb(38,28,18));
        web.setFitsSystemWindows(true);
        if(Build.VERSION.SDK_INT>=30)web.setOnApplyWindowInsetsListener((view,insets)->{
            WindowInsets.Insets bars=insets.getInsets(WindowInsets.Type.systemBars());
            view.setPadding(0,bars.top,0,bars.bottom);
            return insets;
        });
        web.setWebViewClient(new WebViewClient());
        web.addJavascriptInterface(new AndroidStore(),"AndroidStore");
        setContentView(web);
        web.loadUrl("file:///android_asset/index.html");
    }

    private final class AndroidStore {
        @JavascriptInterface public String read(String slot) { return saves.getString(slot,""); }
        @JavascriptInterface public boolean write(String slot,String value) { return saves.edit().putString(slot,value).commit(); }
    }
}
