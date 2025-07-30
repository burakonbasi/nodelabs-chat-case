# Nodelabs Sohbet Uygulaması - Gerçek Zamanlı Mesajlaşma Sistemi

Node.js v22 ile geliştirilmiş, otomatik mesaj planlama, gerçek zamanlı iletişim ve kapsamlı izleme özellikleri sunan ölçeklenebilir, güvenli ve yüksek performanslı bir gerçek zamanlı mesajlaşma arka ucu.

## 🚀 Özellikler

- **Gerçek Zamanlı Mesajlaşma**: Socket.IO destekli anlık mesajlaşma
- **Kimlik Doğrulama**: Yenileme tokenlı JWT tabanlı kimlik doğrulama
- **Otomatik Mesajlaşma**: Cron tabanlı otomatik mesaj planlama
- **Mesaj Kuyruğu**: Güvenilir mesaj iletimi için RabbitMQ
- **Arama**: Mesaj araması için Elasticsearch entegrasyonu
- **Önbellek**: Çevrimiçi durum ve performans için Redis
- **İzleme**: Sentry hata takibi ve Winston loglama
- **API Belgeleri**: Swagger/OpenAPI dokümantasyonu
- **Güvenlik**: Helmet, CORS, hız sınırlama, girdi doğrulama

## 📋 Ön Gereksinimler

- Node.js v22+
- MongoDB
- Redis
- RabbitMQ
- Elasticsearch (isteğe bağlı)
- Sentry hesabı (isteğe bağlı)

## 🛠️ Kurulum

1. Depoyu klonlayın:
```bash
git clone https://github.com/burakonbasi/nodelabs-chat-case.git
cd nodelabs-chat-case
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Ortam değişkenlerini kopyalayın:
```bash
cp .env.example .env
```

4. `.env` dosyasını kendi yapılandırmanızla güncelleyin

5. Servisleri başlatın (MongoDB, Redis, RabbitMQ):
```bash
# Docker Compose kullanarak (isteğe bağlı)
docker-compose up -d mongodb redis rabbitmq Elasticsearch
# Sadece servisler için Docker kullanarak
docker run -d -p 27017:27017 --name mongodb mongo
docker run -d -p 6379:6379 --name redis redis
docker run -d -p 5672:5672 -p 15672:15672 --name rabbitmq rabbitmq:management

# veya
docker-compose up -d
# veya
make docker-up
# Servis sağlığını kontrol edin:
docker-compose ps
# Günlükleri görüntüleyin:
docker-compose logs -f app
```

6. Uygulamayı çalıştırın:
```bash
# Geliştirme
npm run dev

# Üretim
npm start
```

## 🏗️ Proje Yapısı

```
src/
├── config/         # Yapılandırma dosyaları
├── controllers/    # Rota kontrolcüleri
├── cron/          # Zamanlanmış görevler
├── middlewares/   # Express ara yazılımları
├── models/        # MongoDB modelleri
├── queues/        # RabbitMQ tüketicileri/üreticileri
├── routes/        # API rotaları
├── services/      # İş mantığı
├── sockets/       # Socket.IO işleyicileri
├── swagger/       # API dokümantasyonu
├── utils/         # Yardımcı fonksiyonlar
├── validators/    # Girdi doğrulayıcıları
├── app.js         # Express uygulama kurulumu
└── server.js      # Sunucu başlatma
```

## 📡 API Uç Noktaları

### Kimlik Doğrulama
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/refresh` - Erişim tokenini yenile
- `POST /api/auth/logout` - Kullanıcı çıkışı
- `GET /api/auth/me` - Mevcut kullanıcıyı al

### Kullanıcılar
- `GET /api/user/list` - Tüm kullanıcıları listele
- `GET /api/user/online` - Çevrimiçi kullanıcıları al
- `GET /api/user/online/:userId` - Kullanıcı çevrimiçi durumunu kontrol et

### Mesajlar
- `POST /api/messages/send` - Mesaj gönder
- `GET /api/messages/conversations` - Konuşmaları al
- `GET /api/messages/conversations/:id` - Mesajları al
- `GET /api/messages/search` - Mesaj ara
- `PATCH /api/messages/:id/read` - Okundu olarak işaretle

## 🔌 Socket.IO Olayları

### İstemciden Sunucuya
- `connection` - JWT ile kimlik doğrulama
- `join_room` - Konuşma odasına katıl
- `send_message` - Gerçek zamanlı mesaj gönder
- `typing_start` - Yazma göstergesini başlat
- `typing_stop` - Yazma göstergesini durdur

### Sunucudan İstemciye
- `message_received` - Yeni mesaj bildirimi
- `message_sent` - Mesaj gönderildi onayı
- `user_online` - Kullanıcı çevrimiçi oldu
- `user_offline` - Kullanıcı çevrimdışı oldu
- `user_typing` - Kullanıcı yazıyor
- `error` - Hata bildirimi

## ⚙️ Otomatik Mesaj Sistemi

Sistem üç otomatik süreç içerir:

1. **Mesaj Planlayıcı (Her gün 02:00)**
   - Aktif kullanıcıları karıştırır
   - Rastgele kullanıcı çiftleri oluşturur
   - Sonraki 24 saat için mesajları planlar

2. **Mesaj Kuyruğa Alıcı (Her dakika)**
   - Vadesi gelen mesajları bulur
   - RabbitMQ kuyruğuna ekler
   - Kuyruğa alındı olarak işaretler

3. **Mesaj Tüketici (Sürekli)**
   - Kuyruk mesajlarını işler
   - Gerçek mesajları oluşturur
   - Socket.IO ile gönderir

## 🔒 Güvenlik Özellikleri

- Refresh tokenlı JWT kimlik doğrulama
- bcrypt ile şifre hashleme
- Kimlik doğrulama uç noktalarında hız sınırlama
- Girdi doğrulama ve temizleme
- Helmet.js güvenlik başlıkları
- CORS yapılandırması
- MongoDB enjeksiyon önleme

## 📊 İzleme ve Günlük Tutma

- **Winston**: Dosya ve konsol günlük tutma
- **Sentry**: Hata takibi ve izleme
- **Morgan**: HTTP istek günlük tutma
- **Özel**: Uygulama seviyesi günlük tutma

## 🧪 Test

```bash
# Testleri çalıştır
npm test

# Kapsama ile çalıştır
npm run test:coverage

# İzleme modunda çalıştır
npm run test:watch
```

## 🐳 Docker Komutları
```bash
# Tüm servisleri derle ve başlat
docker-compose up -d --build

# Logs görüntüle
docker-compose logs -f [service-name]

# Tüm servisleri durdur
docker-compose down

# Durdur ve veri birimlerini kaldır
docker-compose down -v

# Uygulama konteynerine eriş
docker-compose exec app sh

# Servis durumunu görüntüle
docker-compose ps

# Bir servisi yeniden başlat
docker-compose restart [service-name]
```

## 🛠️ Faydalı Make Komutları
```bash
# Tüm komutları göster
make help

# Tam geliştirme kurulumu
make setup-dev

# Geliştirmeyi başlat
make dev

# Testleri çalıştır
make test

# Docker işlemleri
make docker-up
make docker-down
make docker-logs
make docker-shell
```

## 📚 API Dokümantasyonu

Swagger dokümantasyonuna şu adresten erişin:
```
http://localhost:3000/api-docs
```

## 🚀 Dağıtım

1. Üretim ortam değişkenlerini ayarlayın
2. Uygulamayı derleyin (gerekirse)
3. PM2 veya benzeri bir süreç yöneticisi kullanın:

```bash
# PM2'yi yükleyin
npm install -g pm2

# Uygulamayı başlatın
pm2 start src/server.js --name nodelabs-chat

# PM2 yapılandırmasını kaydedin
pm2 save
pm2 startup
```

## 🤝 Katkıda Bulunma

1. Depoyu fork edin
2. Özellik dalı oluşturun (`git checkout -b feature/amazing`)
3. Değişiklikleri commit edin (`git commit -m 'Harika özellik eklendi'`)
4. Dalı push edin (`git push origin feature/amazing`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT Lisansı altında lisanslanmıştır.

## 👥 Yazar

- Burak Onbaşıoğlu

## 🙏 Teşekkürler

- Node.js topluluğu
- Tüm katkıda bulunanlar
- Kullanılan açık kaynak paketler