package com.enisyergok.primalcrafting;

import android.app.*;
import android.os.Bundle;
import android.content.*;
import android.view.*;
import android.widget.*;
import android.graphics.Bitmap;
import java.io.FileOutputStream;
import java.io.File;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/** Real device smoke checks, without third-party test dependencies. */
public class SmokeTest extends Instrumentation {
    @Override public void onCreate(Bundle b){super.onCreate(b);start();}
    private View find(View v,String text){if(v instanceof Button&&text.equals(((Button)v).getText().toString()))return v;if(v instanceof ViewGroup){ViewGroup g=(ViewGroup)v;for(int i=0;i<g.getChildCount();i++){View r=find(g.getChildAt(i),text);if(r!=null)return r;}}return null;}
    private void click(Activity a,String text){runOnMainSync(()->{View v=find(a.getWindow().getDecorView(),text);if(v==null)throw new AssertionError("Button missing: "+text);v.performClick();});waitForIdleSync();CountDownLatch frames=new CountDownLatch(1);runOnMainSync(()->a.getWindow().getDecorView().postOnAnimation(()->a.getWindow().getDecorView().postOnAnimation(frames::countDown)));try{if(!frames.await(5,TimeUnit.SECONDS))throw new AssertionError("UI frame timeout");}catch(InterruptedException e){throw new AssertionError(e);}}
    @Override public void onStart(){Bundle result=new Bundle();try{
        GameState initial=new GameState();initial.introduced=true;
        getTargetContext().getSharedPreferences("primal-story",0).edit().clear().putString("auto",initial.save()).commit();
        Activity a=startActivitySync(new Intent(getTargetContext(),MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));waitForIdleSync();
        for(String tab:new String[]{"Üretim","Günlük","Harita","Kayıt","Envanter"}){click(a,tab);Bitmap shot=getUiAutomation().takeScreenshot();if(shot!=null){try(FileOutputStream out=new FileOutputStream(new File(getTargetContext().getExternalFilesDir(null),tab+".png"))){shot.compress(Bitmap.CompressFormat.PNG,100,out);}shot.recycle();}}
        click(a,"Üretim");click(a,GameState.RECIPES[0]+"\n"+GameState.COSTS[0]);click(a,"Envanter");click(a,"Ceviz eti ye");click(a,"Kayıt");click(a,"Şimdi elle kaydet");
        GameState saved=GameState.load(getTargetContext().getSharedPreferences("primal-story",0).getString("manual",""));if(!saved.ate||saved.inventory[2]!=1||saved.inventory[10]!=1)throw new AssertionError("UI actions did not persist");
        runOnMainSync(a::finish);waitForIdleSync();
        Activity reopened=startActivitySync(new Intent(getTargetContext(),MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));waitForIdleSync();click(reopened,"Günlük");
        GameState loaded=GameState.load(getTargetContext().getSharedPreferences("primal-story",0).getString("auto",""));if(!loaded.ate)throw new AssertionError("Restart lost save");
        runOnMainSync(reopened::finish);result.putString("stream","PASS: menus, crafting, eating, manual/auto saves and restart\n");finish(Activity.RESULT_OK,result);
    }catch(Throwable e){result.putString("stream","FAIL: "+e.toString()+"\n");finish(Activity.RESULT_CANCELED,result);}}
}
