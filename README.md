# PRIMAL: Crafting

Android için Türkçe hayatta kalma oyunu. Sürüm 0.3.0: beş bölümlük
"Kırık pusula" hikâyesi, iki rota ve seçimlere bağlı iki final.

## Referans tasarım ekranları

Ekli PRIMAL konsept görseli görsel atlas olarak uygulamaya dahil edilmiştir.
Karakter, eşya, harita ve bölge çizimleri bu görselden alınır. Önceki statik
ekran gösterimi yerini canlı envanter, tarifler, görev günlüğü, konuşmalar ve
haritaya bırakmıştır. Çizimler en-boy oranı korunarak sığdırılır; içerik
kaydırılır, dar telefonlarda iki, geniş ekranlarda üç envanter sütunu kullanılır.
Sistem çubukları için boşluk bırakılır; yatay ve dikey kullanım desteklenir.
Kaynak görsel 495×755 pikseldir; yüksek çözünürlüklü çizim kalitesi vaat edilmez.

## Oynanış döngüsü

- Envanter → Üretim: cevizi kır, etini ye, kabuktan su kabı ve ateş üret.
- Günlük: görev koşullarını tamamladıktan sonra Mira'ya cevap ver.
- Harita → Orman: Mira'yı araştır, balta ve barınak yap; yardım kararını ver.
- Günlük: kar veya volkan rotasını seç, giysi veya meşale üret.
- Seçilen bölgede üç araştırma ile merceği bul; kıyıya dönüp işaret ateşi üret.
- Son konuşmadaki karar ve önceki güven puanı kurtuluş finalini belirler.
- Kaynak toplama, üretim, keşif ve yolculuk enerji ve zaman harcar.
- Ceviz yemek, su içmek ve dinlenmek ihtiyaçları karşılar. Sağlık sıfırlanınca
  elle kayıt yüklenebilir veya yeni oyun başlatılabilir.
- Her işlem ve uygulamadan ayrılma otomatik kaydedilir. Kayıt menüsü ayrıca
  ayrı bir elle kayıt yuvası içerir. Yeni oyun elle kaydı silmez.

## Doğrulama

`tests/GameStateTest.java` iki hikâye rotasını başlangıçtan finale oynar;
tarifleri, görev kilitlerini, ölüm durumunu ve kayıt yüklemeyi kontrol eder.
Actions, Android 35 emülatöründe 720×1280, 1080×2400, 1600×2560 ve 1280×720
boyutlarında gerçek menü tıklamaları, üretim, yemek ve uygulamayı yeniden
açınca kayıt korumasını test eder. APK yalnızca testler geçince yüklenir.

## Yerel build

JDK 17, Android SDK 35 ve Gradle 8.11.1 kurulu bir makinede:

```text
gradle --no-daemon assembleDebug
```

APK çıktısı: `app/build/outputs/apk/debug/app-debug.apk`

## GitHub Actions

`main` dalına yapılan her push, `.github/workflows/android.yml` workflow'unu
çalıştırır. Başarılı run sonunda Actions sayfasındaki
`primal-crafting-debug-apk` artifact'inden APK doğrudan indirilebilir.
