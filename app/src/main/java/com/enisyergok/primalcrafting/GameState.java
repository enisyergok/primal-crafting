package com.enisyergok.primalcrafting;

import java.util.*;
import java.io.*;

/** Deterministic game rules, independent of Android and rendering. */
public final class GameState {
    public static final String[] ITEMS = {"Taş", "Dal", "Hindistan cevizi", "Yaprak", "Lif", "Keskin taş", "İp", "Ateş", "Su kabı", "Hindistan cevizi eti", "Kabuk", "Taş balta", "Barınak", "Meşale", "Sıcak giysi", "İşaret merceği", "İşaret ateşi"};
    public static final String[] CHAPTERS = {"1 · Kıyıda uyanış", "2 · Ormandaki ses", "3 · Dağın iki yolu", "4 · Son işaret", "5 · Ufuktaki yelken"};
    public static final String[] REGIONS = {"Tropik Ada", "Orman", "Kar Bölgesi", "Volkanik Bölge"};
    public static final String[] RECIPES = {"Hindistan cevizini kır", "Keskin taş", "İp", "Ateş", "Su kabı", "Taş balta", "Barınak", "Meşale", "Sıcak giysi", "İşaret ateşi"};
    public static final String[] COSTS = {"1 ceviz + taş (alet korunur)", "2 taş", "3 lif", "3 dal + 2 taş", "1 kabuk", "1 keskin taş + 2 dal + 1 ip", "6 dal + 4 yaprak + 2 ip", "2 dal + 1 lif · ateş gerekli", "6 lif + 4 yaprak + 2 ip", "5 dal + 2 ip + mercek · ateş gerekli"};
    public int chapter, region, health=100, food=80, water=80, energy=100, minutes=480, day=1, trust, route=-1, searches;
    public boolean introduced, metMira, rescued, lens, ended;
    public int expeditions;
    public final int[] inventory = new int[ITEMS.length];
    public final ArrayList<String> journal = new ArrayList<>();
    public GameState() { inventory[0]=3; inventory[1]=3; inventory[2]=2; inventory[3]=4; inventory[4]=6; note("Fırtına tekneni parçaladı. Kıyıda bir ses duydun. Önce hayatta kalmalısın."); }
    public void note(String text) { journal.add("Gün " + day + " · " + text); if(journal.size()>50) journal.remove(0); }
    public String objective() {
        switch(chapter) {
            case 0: return "Ateş ve su kabı üret, bir ceviz ye. Ardından kıyıdaki çağrıya cevap ver.";
            case 1: return "Ormanda Mira'yı bul. Taş balta ve barınak üret; ona yardım edip etmeyeceğini seç.";
            case 2: return "Mira ile dağ rotasını seç. Kar için sıcak giysi, volkan için meşale üret. Seçtiğin bölgede üç kez keşfet.";
            case 3: return "Merceği kıyıya götür. İşaret ateşi üret ve son konuşmada kurtuluş işaretini ver.";
            default: return "Hikâye tamamlandı. Günlükte finalini okuyabilir, adayı keşfetmeye devam edebilirsin.";
        }
    }
    public String actCost(int amount) {
        if(health<=0) return "Gücün tükendi. Kayıt menüsünden yeni bir yolculuk başlat.";
        if(energy<amount) return "Enerjin yetmiyor. Önce dinlen.";
        energy-=amount; food=Math.max(0,food-2); water=Math.max(0,water-3); minutes+=30;
        if(minutes>=1440) {minutes-=1440; day++;}
        if(food==0 || water==0) health=Math.max(0,health-5);
        return null;
    }
    public String gather() {
        String error=actCost(8); if(error!=null)return error;
        int[][] drops={{0,1,2,3,4},{1,4,3,0,2},{0,1,4},{0,1,0,4}};
        int item=drops[region][searches++%drops[region].length]; inventory[item]+=2;
        if(chapter==1 && region==1 && !metMira) {metMira=true; note("Mira: Bacağım yaralı. Bana bir sığınak yapabilir misin?");}
        return "Toplandı: 2 " + ITEMS[item];
    }
    public String explore() {
        String error=actCost(10); if(error!=null)return error;
        if(chapter==1 && region==1) {metMira=true; note("Mira'yı devrilmiş ağacın yanında buldun."); return "Mira ile konuşmak için Günlük'e git.";}
        if(chapter==2 && route>=0 && region==route) {
            if(++expeditions>=3) {lens=true; inventory[15]=1; chapter=3; note("Eski gözcü kulesinden işaret merceğini aldın. Kıyıya dön."); return "Mercek bulundu! Bölüm 4 açıldı.";}
            return "Gözcü kulesine yaklaşıyorsun: " + expeditions + "/3";
        }
        return "Kıyıda eski bir kule işareti buldun. " + objective();
    }
    public String travel(int to) {
        if(to<0||to>3)return "Bilinmeyen bölge.";
        if(to==region)return "Zaten buradasın.";
        if(to==1 && chapter<1)return "Önce kıyıdaki görevleri tamamla.";
        if(to>=2 && (chapter<2||route!=to))return "Önce Mira ile rotanı seç.";
        if(to==2 && inventory[14]==0)return "Kar bölgesi için sıcak giysi gerekli.";
        if(to==3 && inventory[13]==0)return "Volkan yolu için meşale gerekli.";
        String error=actCost(12); if(error!=null)return error;
        region=to; note(REGIONS[to]+" bölgesine ulaştın."); return REGIONS[to]+" bölgesine geldin.";
    }
    public String craft(int recipe) {
        if(recipe<0||recipe>=RECIPES.length)return "Tarif yok.";
        int[][] ingredients={{2},{0},{4},{1,0},{10},{5,1,6},{1,3,6},{1,4},{4,3,6},{1,6}};
        int[][] amounts={{1},{2},{3},{3,2},{1},{1,2,1},{6,4,2},{2,1},{6,4,2},{5,2}};
        int[] output={9,5,6,7,8,11,12,13,14,16};
        if(recipe==0&&inventory[0]==0)return "Cevizi kırmak için taş gerekli.";
        if((recipe==7||recipe==9)&&inventory[7]==0)return "Önce ateş üret.";
        if(recipe==9&&(!lens||region!=0||chapter<3))return "Merceği bulup kıyıya dönmelisin.";
        if(recipe>=5&&chapter<1)return "Bu tarif Bölüm 2'de açılır.";
        if(recipe>=7&&chapter<2)return "Bu tarif Bölüm 3'te açılır.";
        if((recipe==3||recipe>=4)&&inventory[output[recipe]]>0)return "Bu eşya zaten sende.";
        for(int i=0;i<ingredients[recipe].length;i++)if(inventory[ingredients[recipe][i]]<amounts[recipe][i])return "Malzeme eksik: " + COSTS[recipe];
        String error=actCost(5); if(error!=null)return error;
        for(int i=0;i<ingredients[recipe].length;i++)inventory[ingredients[recipe][i]]-=amounts[recipe][i];
        inventory[output[recipe]]++;
        if(recipe==0)inventory[10]++;
        note("Üretildi: "+RECIPES[recipe]); return "Üretildi: "+RECIPES[recipe];
    }
    public boolean ate;
    public String eat() { if(health<=0)return "Yolculuğun sona erdi."; if(inventory[9]==0)return "Önce bir cevizi kır."; inventory[9]--; food=Math.min(100,food+30); health=Math.min(100,health+5); ate=true; return "Ceviz etini yedin. Tokluk +30, sağlık +5. Kabuk envanterde kaldı."; }
    public String drink() { if(health<=0)return "Yolculuğun sona erdi."; if(inventory[8]==0)return "Önce kabuktan su kabı üret."; water=100; return "Su kabını kaynaktan doldurup içtin."; }
    public String rest() { if(health<=0)return "Yolculuğun sona erdi."; energy=100; minutes+=360; if(minutes>=1440){day++;minutes-=1440;} health=Math.min(100,health+(inventory[12]>0?20:5)); food=Math.max(0,food-5); water=Math.max(0,water-5); return inventory[12]>0?"Barınakta dinlendin. Enerji ve sağlık yenilendi.":"Kıyıda dinlendin. Enerjin yenilendi."; }
    public String dialogue() {
        if(health<=0)return "Yolculuğun burada sona erdi. Yeni oyunla tekrar deneyebilirsin.";
        switch(chapter) {
            case 0:return "Mira (uzaktan): Sesimi duyan var mı? Gece yaklaşmadan ateş yak! Cevizin kabuğunu atma; su taşıyabilirsin.";
            case 1:return metMira?"Mira: Kuledeki mercekle gemilere işaret verebiliriz. Bacağım yaralı. Beni yanında götürecek misin?":"Ormanın içinden bir yardım çağrısı geliyor. Keşfe çık.";
            case 2:return route<0?"Mira: Kuleye iki yol var. Kar geçidi soğuk; volkan yolu karanlık. Hazırlığımızı seçtiğimiz yola göre yapalım.":"Mira: Hazırlan, seçtiğin yolda kuleyi üç adımda bulacağız. Merceği kıyıya götürmeliyiz.";
            case 3:return "Mira: Ufukta bir yelken! Kıyıda işaret ateşini yak. Son karar senin: birlikte mi ayrılacağız?";
            default:return trust>=2?"Birlikte kurtuldunuz. Mira, yeni bir hayatın ilk dostu oldu. SON — Birlikte doğan gün.":"Gemi seni aldı. Geride bıraktığın çağrı hafızanda kaldı. SON — Yalnız ufuk.";
        }
    }
    public String choose(int choice) {
        if(health<=0)return "Yolculuğun sona erdi.";
        if(choice<0||choice>1)return "Geçersiz seçim.";
        if(chapter==0) { if(inventory[7]==0||inventory[8]==0||!ate)return "Önce ateş, su kabı ve yemek görevlerini tamamla."; trust+=choice==0?1:0; chapter=1; note(choice==0?"Mira'ya seslendin: Seni bulacağım!":"Önce kendi güvenliğini seçtin."); return "Bölüm 2 açıldı. Ormana gidebilirsin."; }
        if(chapter==1) {if(!metMira||inventory[11]==0||inventory[12]==0)return "Mira'yı bul; taş balta ve barınak üret."; rescued=choice==0; trust+=rescued?2:-1; chapter=2; note(rescued?"Mira'ya destek oldun. Güveni arttı.":"Mira'yı barınakta bıraktın. Güveni azaldı."); return "Bölüm 3 açıldı. Mira ile rotayı konuş.";}
        if(chapter==2) {if(route>=0)return objective(); route=choice==0?2:3; searches=0; note("Seçilen rota: "+REGIONS[route]); return "Rota seçildi: "+REGIONS[route];}
        if(chapter==3) {if(region!=0||inventory[16]==0)return "Önce kıyıda işaret ateşi üret."; trust+=choice==0?1:-2; ended=true; chapter=4; note(dialogue()); return dialogue();}
        return dialogue();
    }
    public String save() {
        Properties p=new Properties();
        int[] values={chapter,region,health,food,water,energy,minutes,day,trust,route,searches};
        for(int i=0;i<values.length;i++)p.setProperty("v"+i,""+values[i]);
        p.setProperty("flags",introduced+","+metMira+","+rescued+","+lens+","+ended+","+ate);
        for(int i=0;i<inventory.length;i++)p.setProperty("i"+i,""+inventory[i]);
        p.setProperty("journal",String.join("\n",journal)); p.setProperty("version","1");p.setProperty("expeditions",""+expeditions);
        try {StringWriter out=new StringWriter();p.store(out,"PRIMAL");return out.toString();}catch(IOException e){throw new IllegalStateException(e);}
    }
    public static GameState load(String data) {
        try {
            Properties p=new Properties();p.load(new StringReader(data)); if(!"1".equals(p.getProperty("version")))throw new IllegalArgumentException();
            int[] v=new int[11];for(int i=0;i<v.length;i++)v[i]=Integer.parseInt(p.getProperty("v"+i));
            if(v[0]<0||v[0]>4||v[1]<0||v[1]>3||v[7]<1||v[9]<-1||v[9]>3||v[6]<0||v[6]>=1440||v[10]<0)throw new IllegalArgumentException();
            for(int i=2;i<=5;i++)if(v[i]<0||v[i]>100)throw new IllegalArgumentException();
            GameState s=new GameState();s.chapter=v[0];s.region=v[1];s.health=v[2];s.food=v[3];s.water=v[4];s.energy=v[5];s.minutes=v[6];s.day=v[7];s.trust=v[8];s.route=v[9];s.searches=v[10];
            String[] f=p.getProperty("flags").split(",");if(f.length!=6)throw new IllegalArgumentException();s.introduced=Boolean.parseBoolean(f[0]);s.metMira=Boolean.parseBoolean(f[1]);s.rescued=Boolean.parseBoolean(f[2]);s.lens=Boolean.parseBoolean(f[3]);s.ended=Boolean.parseBoolean(f[4]);s.ate=Boolean.parseBoolean(f[5]);
            for(int i=0;i<s.inventory.length;i++){s.inventory[i]=Integer.parseInt(p.getProperty("i"+i));if(s.inventory[i]<0)throw new IllegalArgumentException();}
            s.expeditions=Integer.parseInt(p.getProperty("expeditions","0"));if(s.expeditions<0||s.expeditions>3)throw new IllegalArgumentException();
            s.journal.clear();s.journal.addAll(Arrays.asList(p.getProperty("journal","").split("\n")));return s;
        }catch(Exception e){throw new IllegalArgumentException("Kayıt okunamadı; kayıt dosyası korunuyor.",e);}
    }
}
