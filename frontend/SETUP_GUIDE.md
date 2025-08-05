# Modern Chat Application - Kurulum Kılavuzu

## 🚀 Hızlı Başlangıç

### 1. Frontend Bağımlılıklarını Güncelleme

```bash
cd frontend
npm install
```

### 2. Backend Environment Ayarları

Backend'de Docker ile çalışırken `.env.docker` dosyasını kullanın:

```bash
cd backend
cp .env .env.local  # Local development için
cp .env.docker .env  # Docker için
```

### 3. Docker ile Çalıştırma

```bash
# Root dizinde
docker-compose up -d
```

### 4. Frontend'i Başlatma

```bash
cd frontend
npm run dev
```

Uygulama http://localhost:5173 adresinde çalışacaktır.

## 🎨 Yeni Özellikler

### UI/UX Güncellemeleri
- ✅ **Dark/Light Mode**: Sistem tercihine göre otomatik tema
- ✅ **Modern WhatsApp/Telegram Tasarımı**: Gradient avatarlar, smooth animasyonlar
- ✅ **Mobile Responsive**: Tam mobil uyumlu tasarım
- ✅ **Framer Motion Animasyonları**: Smooth geçişler ve micro-interactions

### Chat Özellikleri
- ✅ **Emoji Picker**: @emoji-mart ile zengin emoji desteği
- ✅ **Ses Mesajı**: Kayıt ve oynatma özellikleri
- ✅ **Message Reactions**: 👍❤️😂 tepkileri
- ✅ **Dosya Paylaşımı**: Drag & drop ile dosya yükleme
- ✅ **Resim Önizleme**: Zoom ve fullscreen desteği
- ✅ **Typing Indicators**: Gerçek zamanlı yazıyor göstergesi
- ✅ **Online/Offline Status**: Kullanıcı durumu takibi
- ✅ **Message Search**: Hızlı mesaj arama
- ✅ **Virtual Scrolling**: Binlerce mesajda bile performanslı

### Teknik İyileştirmeler
- ✅ **PWA Desteği**: Offline çalışma, push notifications
- ✅ **Virtual Scrolling**: React Virtual ile performans
- ✅ **Code Splitting**: Lazy loading ile hızlı yükleme
- ✅ **TypeScript**: Tam tip güvenliği
- ✅ **Zustand State Management**: Modern state yönetimi

## 📁 Dosya Yapısı

```
frontend/
├── public/
│   ├── manifest.json         # PWA manifest
│   ├── pwa-192x192.png      # PWA ikonları
│   ├── pwa-512x512.png
│   └── sounds/              # Ses dosyaları
│       ├── message-sent.mp3
│       └── message-received.mp3
├── src/
│   ├── components/
│   │   ├── auth/           # Login, Register
│   │   ├── chat/           # Chat componentleri
│   │   ├── layout/         # Layout componentleri
│   │   ├── modals/         # Modal componentleri
│   │   └── user/           # User profile
│   ├── stores/
│   │   ├── authStore.ts    # Authentication
│   │   ├── chatStore.ts    # Chat state
│   │   ├── themeStore.ts   # Theme management
│   │   └── uiStore.ts      # UI state
│   ├── lib/
│   │   ├── api.ts          # API client
│   │   ├── socket.ts       # Socket.IO client
│   │   └── utils.ts        # Utility functions
│   └── types/
│       └── index.ts        # TypeScript types
```

## 🔧 MongoDB Docker Bağlantı Sorunu Çözümü

Eğer Docker'da MongoDB bağlantı hatası alıyorsanız:

1. **Docker Network Kontrolü**:
```bash
docker network ls
docker network inspect nodelabs-network
```

2. **MongoDB Container Durumu**:
```bash
docker ps
docker logs nodelabs-mongodb
```

3. **Backend .env Dosyası** (Docker için):
```env
MONGODB_URI=mongodb://admin:password123@mongodb:27017/nodelabs-chat?authSource=admin
```

4. **Backend .env.local Dosyası** (Local development için):
```env
MONGODB_URI=mongodb://localhost:27017/nodelabs-chat
```

## 🎨 PWA İkonları Oluşturma

`public/` dizinine şu dosyaları eklemeniz gerekiyor:

1. **pwa-192x192.png**: 192x192 boyutunda uygulama ikonu
2. **pwa-512x512.png**: 512x512 boyutunda uygulama ikonu
3. **favicon.ico**: Browser favicon

İkon oluşturmak için:
- https://favicon.io/favicon-generator/
- https://realfavicongenerator.net/

## 🔊 Ses Dosyaları

`public/sounds/` dizinine şu dosyaları ekleyin:
- **message-sent.mp3**: Mesaj gönderildiğinde çalacak ses
- **message-received.mp3**: Mesaj alındığında çalacak ses

Ücretsiz ses dosyaları:
- https://freesound.org/
- https://www.zapsplat.com/

## 🚀 Production Build

### Frontend Build:
```bash
cd frontend
npm run build
```

### Docker Production:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📱 PWA Test

1. **Chrome DevTools** > Application > Service Workers
2. **Lighthouse** ile PWA skoru kontrolü
3. **Mobile cihazda** "Add to Home Screen" testi

## 🐛 Yaygın Sorunlar ve Çözümleri

### 1. Socket.IO Bağlantı Hatası
- CORS ayarlarını kontrol edin
- Backend `CLIENT_URL` değişkenini kontrol edin

### 2. MongoDB Bağlantı Hatası
- Docker container'ların çalıştığından emin olun
- MongoDB URI'nin doğru olduğunu kontrol edin

### 3. Emoji Picker Görünmüyor
- `@emoji-mart/data` ve `@emoji-mart/react` paketlerinin yüklü olduğundan emin olun

### 4. Dark Mode Çalışmıyor
- `localStorage` temizleyin
- Browser'ı yenileyin

## 🎯 Önerilen Geliştirmeler

1. **Video/Ses Görüşmesi**: WebRTC ile
2. **Grup Sohbetleri**: Çoklu kullanıcı desteği
3. **Dosya Paylaşımı**: S3 veya Cloudinary entegrasyonu
4. **Push Notifications**: Firebase Cloud Messaging
5. **End-to-End Encryption**: Signal Protocol

## 📞 Destek

Sorunlarınız için:
- GitHub Issues
- Discord: [Link]
- Email: support@chatapp.com