# PRIMAL: Crafting

Android için dokunmatik bir hayatta kalma ve crafting prototipi. Oyuncu her gün
jungleden odun, taş ve lif toplar; ateş ve barınak kurarak ilk geceyi atlatır.

## Referans tasarım ekranları

Ekli PRIMAL konsept görseli görsel atlas olarak uygulamaya dahil edilmiştir.
Atlasın 9 paneli gerçek ekranlara ayrılır: envanter, crafting, kullanım,
teknoloji ağacı, harita, karakter durumu, tropik ada, orman ve kar bölgesi.
Her panel dokunmatik olarak ilgili ekrana geçer; böylece referanstaki görünüm
ve menü düzeni korunurken prototip içinde gezilebilir.

## Oynanış döngüsü

- **Gather:** Her dokunuş enerji harcayıp sırayla odun, taş veya lif toplar.
- **Fire:** 3 odun + 2 taş ile ateş yakılır.
- **Shelter:** 6 odun + 4 lif ile barınak kurulur.
- Enerji tükendiğinde yeni gün başlar ve enerji yenilenir.

## Yerel build

Android Studio veya Android SDK kurulu bir makinede:

```text
gradle --no-daemon assembleDebug
```

APK çıktısı: `app/build/outputs/apk/debug/app-debug.apk`

## GitHub Actions

`main` dalına yapılan her push, `.github/workflows/android.yml` workflow'unu
çalıştırır. Başarılı run sonunda Actions sayfasındaki
`primal-crafting-debug-apk` artifact'inden APK doğrudan indirilebilir.
