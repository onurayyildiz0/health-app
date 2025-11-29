# Sağlık ve Randevu Yönetim Sistemi

## Node.js Bootcamp Bitirme Projesi

**Geliştirici:** İsmail Onur Ayyıldız

---

## Proje Tanımı

Bu proje, hastalar ve doktorlar için randevu planlaması, değerlendirme ve sağlık geçmişi yönetimi sağlayan, JWT tabanlı kimlik doğrulama ve rol tabanlı yetkilendirme içeren bir Node.js/Express API uygulamasıdır.  
Doktorlar uygun saatlerini belirleyebilir, hastalar randevu alabilir, değerlendirme bırakabilir ve favori doktorlarını yönetebilir.

---

## Özellikler

- **Kullanıcı Yönetimi:** Hasta, doktor ve admin rolleriyle kayıt, giriş, profil güncelleme, şifre değiştirme
- **JWT ile Kimlik Doğrulama:** Güvenli giriş, token yenileme ve çıkış
- **Rol Tabanlı Yetkilendirme:** Hasta, doktor, admin için farklı erişim hakları
- **Doktor Yönetimi:** Uzmanlık alanı, çalışma saatleri, profil oluşturma/güncelleme, en yüksek puanlı doktorlar
- **Randevu Yönetimi:** Randevu oluşturma, iptal etme, detay görüntüleme, doktorun randevuları yönetmesi
- **Değerlendirme Sistemi:** Hastaların doktorlara puan ve yorum bırakabilmesi, değerlendirme listeleme/silme
- **Favori Doktorlar:** Hastaların favori doktor listesi oluşturabilmesi
- **Sağlık Geçmişi:** Hastaların sağlık geçmişi kaydı ve görüntülemesi
- **Otomatik Randevu Hatırlatma:** Randevudan 24 saat önce e-posta ile otomatik hatırlatma
- **Güvenlik:** CORS, Helmet, Rate Limiting, HPP, XSS/NoSQL Injection koruması, bcrypt ile şifreleme
- **Swagger ile API Dokümantasyonu**

---

## Kurulum

1. **Projeyi klonla:**

   ```bash
   git clone <repo-url>
   cd healthAndAppointmentSystem
   ```

2. **Bağımlılıkları yükle:**

   ```bash
   npm install
   ```

3. **.env dosyasını oluştur ve doldur:**

   ```env
   PORT=3000
   MONGO_URL=<MongoDB bağlantı adresin>
   JWT_ACCESS_SECRET=<gizli anahtar>
   JWT_REFRESH_SECRET=<gizli anahtar>
   JWT_ACCESS_EXPIRES=15m
   JWT_REFRESH_EXPIRES=7d
   NODE_ENV=development
   CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   EMAIL_USER=<e-posta adresin>
   EMAIL_PASS=<e-posta şifren>
   ```

4. **Uygulamayı başlat:**
   ```bash
   npm start
   ```

---

## API Dokümantasyonu

Tüm endpoint’leri ve örnek istekleri görmek için:  
[http://localhost:3000/api-docs](http://localhost:3000/api-docs)  
Swagger arayüzü ile API’yi test edebilir ve dökümantasyona ulaşabilirsin.

---

## Temel API Endpoint’leri

- **/api/auth/** → Kayıt, giriş, çıkış, e-posta doğrulama, token yenileme
- **/api/users/** → Profil görüntüleme/güncelleme, favori doktorlar, sağlık geçmişi
- **/api/doctors/** → Doktor listeleme, profil, çalışma saatleri, en yüksek puanlı doktorlar
- **/api/appointments/** → Randevu oluşturma, iptal, detay, doktorun randevuları
- **/api/reviews/** → Doktor değerlendirme ekleme, listeleme, silme
- **/api/admin/** → Admin işlemleri, kullanıcı yönetimi, doktor onayı

---

## Güvenlik ve Orta Katmanlar

- **CORS:** Sadece izin verilen origin’lere erişim
- **Helmet:** HTTP başlık güvenliği
- **Rate Limiting:** DDoS ve brute-force koruması
- **HPP:** HTTP parametre kirlenmesi koruması
- **XSS/NoSQL Injection:** Input sanitizasyonu
- **bcrypt:** Şifrelerin güvenli saklanması

---

## Otomatik Randevu Hatırlatma

- Randevudan 24 saat önce hastaya otomatik e-posta gönderilir.
- `node-cron` ile saatlik kontrol yapılır.
- E-posta ayarlarını `.env` dosyasında yapılandırmalısın.

---

## Katkı ve Lisans

Katkıda bulunmak için PR gönderebilirsin.  
MIT Lisansı ile lisanslanmıştır.

---

**Not:**

- E-posta doğrulama ve randevu hatırlatma için SMTP bilgilerini `.env` dosyanda doğru girdiğinden emin ol!
- Swagger arayüzünde korumalı endpoint’ler için “Authorize” butonunu kullanarak JWT access token’ını eklemelisin.
