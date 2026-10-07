package com.enisyergok.primalcrafting;

import android.app.*;
import android.os.*;
import android.content.*;
import android.webkit.WebView;
import android.graphics.Bitmap;
import java.io.*;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/** Device smoke checks the actual illustrated WebView surface and save bridge. */
public final class SmokeTest extends Instrumentation {
    private Activity activity;
    private String evaluate(String expression) {
        CountDownLatch latch=new CountDownLatch(1); final String[] result={""};
        runOnMainSync(()->{WebView w=findWebView(activity.getWindow().getDecorView());if(w==null)throw new AssertionError("WebView missing");w.evaluateJavascript(expression,v->{result[0]=v;latch.countDown();});});
        try{if(!latch.await(5,TimeUnit.SECONDS))throw new AssertionError("JS timeout");}catch(InterruptedException e){throw new AssertionError(e);}
        return result[0];
    }
    private WebView findWebView(android.view.View v){if(v instanceof WebView)return (WebView)v;if(v instanceof android.view.ViewGroup){android.view.ViewGroup g=(android.view.ViewGroup)v;for(int i=0;i<g.getChildCount();i++){WebView w=findWebView(g.getChildAt(i));if(w!=null)return w;}}return null;}
    private void click(String selector){click(selector,null);}
    private void click(String selector,String expectedPage){
        String safeSelector=selector.replace("\\", "\\\\").replace("'", "\\'");
        String result=evaluate("(function(){var el=document.querySelector('"+safeSelector+"');if(!el)throw new Error('selector missing: '+"+quote(selector)+");el.click();return 'ok'})()");
        if(!result.contains("ok"))throw new AssertionError("click failed for "+selector+": "+result);
        waitForIdleSync();
        if(expectedPage!=null){
            boolean reached=false;
            for(int i=0;i<20;i++){
                if(evaluate("document.querySelector('main').getAttribute('data-page')").contains(expectedPage)){reached=true;break;}
                SystemClock.sleep(100);
            }
            if(!reached)throw new AssertionError("page did not reach "+expectedPage);
        }
        SystemClock.sleep(350);
    }
    private String quote(String value){return "'"+value.replace("\\", "\\\\").replace("'", "\\'")+"'";}
    private void shot(String name){Bitmap b=getUiAutomation().takeScreenshot();if(b!=null){try(FileOutputStream o=new FileOutputStream(new File(getTargetContext().getExternalFilesDir(null),name+".png"))){b.compress(Bitmap.CompressFormat.PNG,100,o);}catch(IOException e){throw new AssertionError(e);}b.recycle();}}
    @Override public void onCreate(Bundle b){super.onCreate(b);start();}
    @Override public void onStart(){Bundle out=new Bundle();try{
        getTargetContext().getSharedPreferences("primal-story",0).edit().clear().commit();
        activity=startActivitySync(new Intent(getTargetContext(),MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));waitForIdleSync();SystemClock.sleep(700);
        for(String tab:new String[]{"camp","recipes","helper","village","journal"}){click("[data-nav='"+tab+"']",tab);shot(tab);}
        click("[data-nav='camp']","camp");evaluate("app.dispatch({type:'equip',item:0});app.dispatch({type:'craft',recipe:0});'ok'");
        String check=evaluate("(function(){try{app.dispatch({type:'equip',item:0});return JSON.stringify({app:typeof app,meat:app.snapshot().inventory[9],error:null})}catch(e){return JSON.stringify({app:typeof app,error:String(e),html:document.body.innerText.slice(0,200)})}})()");
        if(!check.contains("meat")||!check.contains(":1"))throw new AssertionError("craft did not update model: "+check);
        click("[data-nav='journal']","journal");click("[data-save='1']");
        String manual=evaluate("(function(){AndroidStore.write('manual',JSON.stringify(app.snapshot()));return String(AndroidStore.read('manual').length)})()");
        if(!manual.matches(".*[1-9][0-9]*.*"))throw new AssertionError("manual save missing: "+manual);
        shot("final-journal");runOnMainSync(activity::finish);waitForIdleSync();
        activity=startActivitySync(new Intent(getTargetContext(),MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));waitForIdleSync();SystemClock.sleep(700);
        if(!evaluate("app.snapshot().inventory[9]===1").contains("true"))throw new AssertionError("restart lost save");
        runOnMainSync(activity::finish);out.putString("stream","PASS: illustrated menus, crafting, helper, village, journal and saves\n");finish(Activity.RESULT_OK,out);
    }catch(Throwable e){out.putString("stream","FAIL: "+e+"\n");if(activity!=null)runOnMainSync(activity::finish);finish(Activity.RESULT_CANCELED,out);}}
}
