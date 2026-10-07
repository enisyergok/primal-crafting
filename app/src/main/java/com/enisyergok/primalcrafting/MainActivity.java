package com.enisyergok.primalcrafting;

import android.app.*;
import android.os.Bundle;
import android.content.SharedPreferences;
import android.graphics.*;
import android.graphics.drawable.GradientDrawable;
import android.view.*;
import android.widget.*;
import java.util.Locale;

/** Responsive native controls with the approved illustration sheet as artwork. */
public class MainActivity extends Activity {
    private GameState game;
    private SharedPreferences saves;
    private Bitmap atlas;
    private LinearLayout root, body;
    private String page="Envanter", notice="";
    private boolean corrupt;
    private final int ink=Color.rgb(55,40,24), parchment=Color.rgb(237,217,172), dark=Color.rgb(57,47,30);
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        saves=getSharedPreferences("primal-story",MODE_PRIVATE);
        atlas=BitmapFactory.decodeResource(getResources(),R.drawable.primal_reference_atlas);
        try {game=saves.contains("auto")?GameState.load(saves.getString("auto","")):new GameState();}
        catch(IllegalArgumentException e){game=new GameState();corrupt=true;notice=e.getMessage();}
        if(state!=null)page=state.getString("page","Envanter");
        getWindow().setStatusBarColor(dark);getWindow().setNavigationBarColor(dark);
        render();
        if(!game.introduced&&!corrupt){game.introduced=true;save(false);new AlertDialog.Builder(this).setTitle("PRIMAL · Kırık pusula").setMessage("Fırtınadan sonra bilinmeyen bir adada uyandın. Mira'nın yardım çağrısı ormandan geliyor. Beş bölüm boyunca hayatta kal, eski kuleyi bul ve bir gemiye işaret ver.\n\nİlk görev: bir cevizi kır, etini ye, kabuğundan su kabı ve bir ateş üret. Görevleri Günlük'ten takip et. Her işlem otomatik kaydedilir.").setPositiveButton("Yolculuğa başla",null).show();}
    }
    @Override protected void onSaveInstanceState(Bundle out){out.putString("page",page);super.onSaveInstanceState(out);}
    @Override protected void onPause(){super.onPause();save(false);}
    private int dp(float n){return Math.round(n*getResources().getDisplayMetrics().density);}
    private GradientDrawable surface(int color){GradientDrawable d=new GradientDrawable();d.setColor(color);d.setCornerRadius(dp(5));d.setStroke(dp(1),Color.rgb(133,108,68));return d;}
    private LinearLayout column(){LinearLayout l=new LinearLayout(this);l.setOrientation(LinearLayout.VERTICAL);return l;}
    private TextView label(String s,int sp){TextView t=new TextView(this);t.setText(s);t.setTextSize(sp);t.setTextColor(ink);t.setPadding(dp(8),dp(5),dp(8),dp(5));return t;}
    private Button button(String s,Runnable action){Button b=new Button(this);b.setText(s);b.setTextSize(14);b.setAllCaps(false);b.setTextColor(ink);b.setMinHeight(dp(48));b.setBackground(surface(Color.rgb(222,202,155)));b.setOnClickListener(v->action.run());return b;}
    private void addButton(String title,Runnable action){LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,-2);p.setMargins(dp(6),dp(4),dp(6),dp(4));body.addView(button(title,action),p);}
    private void open(String next){page=next;notice="";render();}
    private void action(String result){notice=result;save(false);render();}
    private void save(boolean manual){if(corrupt)return;SharedPreferences.Editor e=saves.edit().putString("auto",game.save());if(manual)e.putString("manual",game.save());if(!e.commit())notice="Kayıt yazılamadı. Depolama alanını kontrol et.";}
    private void render(){
        root=column();root.setBackgroundColor(dark);
        root.setOnApplyWindowInsetsListener((v,insets)->{v.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());return insets;});
        setContentView(root);root.requestApplyInsets();
        ScrollView scroll=new ScrollView(this);scroll.setFillViewport(true);root.addView(scroll,new LinearLayout.LayoutParams(-1,0,1));
        LinearLayout centered=column();centered.setGravity(Gravity.CENTER_HORIZONTAL);scroll.addView(centered);
        body=column();body.setBackground(surface(parchment));int width=Math.min(getResources().getDisplayMetrics().widthPixels,dp(620));centered.addView(body,new LinearLayout.LayoutParams(width,-2));
        LinearLayout banner=new LinearLayout(this);banner.setGravity(Gravity.CENTER_VERTICAL);banner.setBackgroundColor(dark);
        int face=game.health<30?6:game.water<25?3:game.food<25?2:game.food>85?1:0;
        banner.addView(new Art(new Rect(334+(face%3)*52,402+(face/3)*72,384+(face%3)*52,452+(face/3)*72),"Karakter portresi"),new LinearLayout.LayoutParams(dp(70),dp(70)));
        TextView title=label("PRIMAL · Gün "+game.day+"  "+String.format(Locale.ROOT,"%02d:%02d",game.minutes/60,game.minutes%60)+"\n"+GameState.CHAPTERS[game.chapter],16);title.setTextColor(parchment);banner.addView(title,new LinearLayout.LayoutParams(0,-2,1));body.addView(banner);
        TextView stats=label("Sağlık "+game.health+" · Tokluk "+game.food+" · Su "+game.water+" · Enerji "+game.energy,13);body.addView(stats);
        body.addView(label(page+" · "+GameState.REGIONS[game.region],20));
        if(!notice.isEmpty()){TextView n=label(notice,15);n.setAccessibilityLiveRegion(View.ACCESSIBILITY_LIVE_REGION_POLITE);body.addView(n);}
        if(corrupt) {body.addView(label("Mevcut kayıt bozuk; üzerine yazılmadı. Kayıt menüsünden elle kaydı yükle veya yeni oyun başlat.",16));}
        if(game.health<=0){body.addView(label("Yolculuk sona erdi. Elle kaydını yükleyebilir veya yeni oyun başlatabilirsin.",18));addButton("Kayıt menüsü",()->open("Kayıt"));}
        switch(page){case "Üretim":crafting();break;case "Günlük":story();break;case "Harita":map();break;case "Kayıt":settings();break;case "Keşif":explore();break;default:inventory();}
        body.addView(label("Görev: "+game.objective(),14));
        HorizontalScrollView navScroll=new HorizontalScrollView(this);LinearLayout nav=new LinearLayout(this);navScroll.addView(nav);for(String name:new String[]{"Envanter","Üretim","Günlük","Harita","Kayıt"})nav.addView(button(name,()->open(name)),new LinearLayout.LayoutParams(dp(92),dp(52)));root.addView(navScroll);
    }
    private void inventory(){
        int columns=getResources().getConfiguration().screenWidthDp<360?2:3;
        LinearLayout row=null;
        for(int i=0;i<game.inventory.length;i++) {if(game.inventory[i]==0)continue;if(row==null||row.getChildCount()==columns){row=new LinearLayout(this);body.addView(row);}
            final int item=i;LinearLayout card=column();card.setGravity(Gravity.CENTER);card.setBackground(surface(Color.rgb(244,226,187)));
            if(i<9){int x=(i%3)*54,y=127+(i/3)*63;card.addView(new Art(new Rect(x+5,y+13,x+49,y+51),GameState.ITEMS[i]),new LinearLayout.LayoutParams(-1,dp(72)));}
            card.addView(label(GameState.ITEMS[i]+" ×"+game.inventory[i],14));card.setMinimumHeight(dp(112));card.setOnClickListener(v->{if(item==9)action(game.eat());else if(item==8)action(game.drink());else open("Üretim");});card.setContentDescription(GameState.ITEMS[i]+", adet "+game.inventory[i]);card.setFocusable(true);
            LinearLayout.LayoutParams cp=new LinearLayout.LayoutParams(0,-2,1);cp.setMargins(dp(3),dp(3),dp(3),dp(3));row.addView(card,cp);
        }
        addButton("Ceviz eti ye",()->action(game.eat()));addButton("Su iç",()->action(game.drink()));addButton("Dinlen (6 saat)",()->action(game.rest()));addButton("Bölgede keşfe çık",()->open("Keşif"));
    }
    private void crafting(){body.addView(label("Eşyaları birleştir · Teknoloji ağacı",18));for(int i=0;i<GameState.RECIPES.length;i++){final int recipe=i;addButton(GameState.RECIPES[i]+"\n"+GameState.COSTS[i],()->action(game.craft(recipe)));}body.addView(label("Bölüm 1: temel ihtiyaçlar → Bölüm 2: balta ve barınak → Bölüm 3: meşale / giysi → Bölüm 4: işaret ateşi",15));}
    private void story(){
        body.addView(label(game.dialogue(),18));
        if(game.chapter==0){addButton("Mira'ya söz ver: Seni bulacağım",()->action(game.choose(0)));addButton("Önce kendimi güvene alacağım",()->action(game.choose(1)));}
        if(game.chapter==1&&game.metMira){addButton("Mira'ya yardım et, birlikte ilerle",()->action(game.choose(0)));addButton("Mira'yı barınakta bırak",()->action(game.choose(1)));}
        if(game.chapter==2&&game.route<0){addButton("Kar geçidi (sıcak giysi)",()->action(game.choose(0)));addButton("Volkan yolu (meşale)",()->action(game.choose(1)));}
        if(game.chapter==3){addButton("Mira ile birlikte işaret ver",()->action(game.choose(0)));addButton("Tek başına gemiye işaret ver",()->action(game.choose(1)));}
        body.addView(label("Mira'nın güveni: "+game.trust+"\nGörev günlüğü",16));for(int i=game.journal.size()-1;i>=0;i--)body.addView(label(game.journal.get(i),14));
    }
    private void map(){body.addView(new Art(new Rect(168,400,326,632),"Ada haritası"),new LinearLayout.LayoutParams(-1,dp(320)));for(int i=0;i<4;i++){final int region=i;addButton(GameState.REGIONS[i]+(game.region==i?" · Buradasın":" · Yolculuk et"),()->action(game.travel(region)));}addButton("Bulunduğun bölgeyi keşfet",()->open("Keşif"));}
    private void explore(){int col=game.region==0?0:game.region==2?2:1;body.addView(new Art(new Rect(col*165+2,651,col*165+162,737),GameState.REGIONS[game.region]),new LinearLayout.LayoutParams(-1,dp(210)));if(game.region==3)body.addView(label("Volkan eteğine orman yolundan yaklaşıyorsun.",14));addButton("Kaynak topla (8 enerji)",()->action(game.gather()));addButton("Görev izini araştır (10 enerji)",()->action(game.explore()));addButton("Dinlen",()->action(game.rest()));addButton("Su iç",()->action(game.drink()));}
    private void settings(){addButton("Şimdi elle kaydet",()->{if(!corrupt){save(true);notice="Elle kayıt alındı.";render();}});addButton("Elle kaydı yükle",()->{if(!saves.contains("manual")){action("Henüz elle kayıt yok.");return;}new AlertDialog.Builder(this).setTitle("Elle kaydı yükle?").setMessage("Sonraki ilerlemenin yerine elle kaydın gelecek.").setNegativeButton("Vazgeç",null).setPositiveButton("Yükle",(d,w)->{try{GameState loaded=GameState.load(saves.getString("manual",""));game=loaded;corrupt=false;action("Kayıt yüklendi.");}catch(Exception e){notice=e.getMessage();render();}}).show();});addButton("Yeni oyun",()->new AlertDialog.Builder(this).setTitle("Yeni yolculuk?").setMessage("Otomatik ilerleme sıfırlanacak. Elle kaydın korunur.").setNegativeButton("Vazgeç",null).setPositiveButton("Başlat",(d,w)->{game=new GameState();game.introduced=true;corrupt=false;page="Günlük";action("Yeni yolculuk başladı.");}).show());body.addView(label("Her işlem ve uygulamadan ayrılma otomatik kaydedilir. Yazılar telefonun yazı boyutunu izler; uzun ekranlar kaydırılabilir. Çizimler oranı korunarak sığdırılır.",15));}
    @Override public void onBackPressed(){if(!page.equals("Envanter"))open("Envanter");else super.onBackPressed();}
    private final class Art extends View {
        final Rect source; final Paint paint=new Paint(Paint.ANTI_ALIAS_FLAG|Paint.FILTER_BITMAP_FLAG);
        Art(Rect r,String description){super(MainActivity.this);source=r;setContentDescription(description);setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_YES);}
        @Override protected void onDraw(Canvas c){super.onDraw(c);if(atlas==null)return;float scale=Math.min((float)getWidth()/source.width(),(float)getHeight()/source.height());float w=source.width()*scale,h=source.height()*scale;c.drawBitmap(atlas,source,new RectF((getWidth()-w)/2,(getHeight()-h)/2,(getWidth()+w)/2,(getHeight()+h)/2),paint);}
    }
}
