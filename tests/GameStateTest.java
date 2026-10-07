import com.enisyergok.primalcrafting.GameState;

public class GameStateTest {
    static void check(boolean value,String message){if(!value)throw new AssertionError(message);}
    static void sustain(GameState g){if(g.energy<30)g.rest();if(g.water<50)g.drink();if(g.food<50){if(g.inventory[9]==0)g.craft(0);g.eat();}}
    static void supply(GameState g,int item,int amount){for(int i=0;g.inventory[item]<amount&&i<300;i++){sustain(g);g.gather();}check(g.inventory[item]>=amount,"Resource reachable "+item);}
    static void craft(GameState g,int r){sustain(g);String result=g.craft(r);check(result.startsWith("Üretildi"),result);}
    static GameState play(int path){
        GameState g=new GameState();check(g.travel(1).contains("Önce"),"region locked");check(g.choose(0).contains("Önce"),"chapter gated");
        craft(g,0);g.eat();craft(g,4);craft(g,3);g.choose(path);check(g.chapter==1,"chapter two");g.drink();g.rest();g.travel(1);g.explore();
        supply(g,0,2);craft(g,1);craft(g,2);supply(g,1,2);craft(g,5);
        supply(g,4,6);craft(g,2);craft(g,2);supply(g,1,6);supply(g,3,4);craft(g,6);g.choose(path);check(g.chapter==2,"chapter three");
        g.choose(path);int chosen=path==0?2:3;check(g.travel(chosen).contains("gerekli"),"equipment gate");
        if(path==0){supply(g,4,12);craft(g,2);craft(g,2);supply(g,3,4);craft(g,8);}else{ supply(g,1,2);supply(g,4,1);craft(g,7);}
        sustain(g);g.travel(chosen);sustain(g);g.explore();GameState restored=GameState.load(g.save());check(restored.expeditions==1,"mid quest save");g=restored;g.gather();sustain(g);g.explore();check(g.chapter==2,"gather does not progress quest");sustain(g);g.explore();check(g.chapter==3,"chapter four");
        sustain(g);g.travel(0);supply(g,1,5);supply(g,4,6);craft(g,2);craft(g,2);craft(g,9);g.choose(path);check(g.chapter==4&&g.ended,"ending reachable");return g;
    }
    public static void main(String[] args){
        GameState together=play(0),alone=play(1);check(together.dialogue().contains("Birlikte doğan"),"good ending");check(alone.dialogue().contains("Yalnız ufuk"),"solitary ending");
        GameState g=new GameState();int wood=g.inventory[1];g.craft(6);check(g.inventory[1]==wood,"failed crafting doesn't consume");g.energy=0;g.gather();check(g.inventory[1]==wood,"exhaustion blocks actions");g.health=0;g.rest();g.eat();check(g.health==0,"death cannot silently recover");
        check(GameState.load(together.save()).dialogue().equals(together.dialogue()),"ending persists");
        boolean rejected=false;try{GameState.load("broken");}catch(IllegalArgumentException e){rejected=true;}check(rejected,"corrupt save rejected");System.out.println("PASS: both full story paths, crafting, gates, survival, save/load, corruption");
    }
}
