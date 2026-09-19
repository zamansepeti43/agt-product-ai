# AGT Product AI

AGT Studio için bağımsız, mobile-first AI ürün görsel stüdyosu.

## Bağımsız uygulama mimarisi

Uygulama **Netlify, Vercel veya başka bir hosted frontend adresine bağlı değildir.**

- **Android:** yerel WebView + APK
- **Windows:** Tauri 2 + yerel `mobile-dist`
- **Web geliştirme:** Next.js geliştirme sunucusu
- **AI:** kullanıcının bağladığı sağlayıcılar üzerinden doğrudan bağlantı
- **Kimlik bilgileri:** cihazdaki güvenli depolama / HttpOnly server oturumu kullanan ilgili akışlar
- **GitHub Actions:** yalnızca build/release otomasyonu

Dağıtım için zorunlu bir Netlify/Vercel URL'si veya hosted APK proxy'si yoktur.

## Desteklenen AI bağlantıları

- Pollinations
- AI Horde
- Puter AI
- Google Gemini
- OpenAI
- Cloudflare AI
- Özel OpenAI API
- OpenAI uyumlu / Özel API
- Yerel ComfyUI (Windows/masaüstü)

> Not: Uygulamanın bağımsız olması, AI servislerinin internet üzerinden kullanılmasını engellemez. Kullanıcı hangi sağlayıcıyı bağlarsa üretim o sağlayıcının API/servis koşullarına göre çalışır. Yerel ComfyUI ise masaüstünde doğrudan yerel ağa bağlanabilir.

## Ürün özellikleri

- Ürün fotoğrafı yükleme
- JPG / PNG / WEBP
- 12 MB görsel sınırı
- Ticari görsel presetleri
- Hero / marketplace / studio / lifestyle / detail / social sahneleri
- Ürün kimliği ve geometriyi koruyan akıllı prompt sistemi
- 1–10 görsel üretimi
- Batch üretim
- Model seçimi ve sağlayıcı yönetimi
- Türkçe / English arayüz
- Geçmiş ve favoriler
- ZIP/export akışları
- Android APK
- Windows MSI / NSIS

## Güvenlik

Kullanıcının API anahtarları kaynak koda, GitHub'a veya APK içine sabitlenmez. Sağlayıcı anahtarları cihaz tarafındaki güvenli depolama ve mevcut provider-session mimarisi üzerinden yönetilir.

Model ağırlıkları, özel workflow dosyaları ve üçüncü taraf lisanslı varlıklar uygulamaya gömülmez.

## Geliştirme

```bash
npm install
npm run dev
```

Doğrulama:

```bash
npm run typecheck
npm run build
```

## Android

Android build'i GitHub Actions üzerinden oluşturulur. APK sürümleri GitHub Releases'a artifact olarak yayınlanır.

Android uygulaması `mobile-dist` içeriğini yerel olarak paketler; çalışmak için AGT'nin hosted web sitesine ihtiyaç duymaz.

## Windows

`src-tauri` Tauri 2 native shell'idir ve doğrudan `mobile-dist` klasörünü paketler. Hosted frontend URL'si gerektirmez.

## ComfyUI

ComfyUI masaüstünde yerel olarak kullanılabilir:

```text
http://127.0.0.1:8188
```

Mobil Android cihaz, bilgisayardaki localhost'a otomatik olarak erişemez; bu nedenle ComfyUI bağlantısı masaüstü kullanımına özeldir.

## Ticari dağıtım

Üçüncü taraf AI sağlayıcılarının API, model, workflow, LoRA, custom node ve oluşturulan içerik lisansları ayrıca kontrol edilmelidir. AGT Product AI bu varlıkları otomatik olarak uygulamaya gömmez.
