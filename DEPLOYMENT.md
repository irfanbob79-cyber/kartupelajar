# 🚀 Panduan Deployment KartuPelajar PRO (Untuk Hermes / Server Operator)

Aplikasi ini dibangun menggunakan **Next.js (App Router, React 19, Tailwind CSS v4, SQLite + Prisma ORM)** standar kartu ID CR80 (54 × 86 mm).

---

## 📋 Prasyarat di Server (Linux / VPS):
- **Node.js**: Versi `18.18+` atau `20.x+` (rekomendasi LTS)
- **Git**
- **PM2** (opsional tapi sangat direkomendasikan): `npm install -g pm2`

---

## ⚡ Langkah Cepat Deployment (1-Liner / Step-by-Step):

### 1. Clone Repository & Masuk Direktori
```bash
git clone <URL_REPOSITORY_ANDA> kartupelajar
cd kartupelajar
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Siapkan Environment & Basis Data SQLite
```bash
cp .env.example .env
npx prisma generate
npm run db:push
npm run db:seed
```
*(Perintah di atas akan membuat file database `dev.db` SQLite otomatis dan mengisinya dengan profil SMKN 1 Labuhan Maringgai, jurusan DKV, PBS, TSM, TKJ, dan contoh data siswa).*

### 4. Build Proyek untuk Produksi
```bash
npm run build
```

### 5. Jalankan Aplikasi di Server

#### Opsi A: Menggunakan PM2 (Rekomendasi untuk VPS / Linux Production)
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```
*Aplikasi akan berjalan di background pada port 3000 secara otomatis saat server reboot.*

#### Opsi B: Menggunakan Systemd / Standalone
```bash
npm run start
```

---

## 🌐 Konfigurasi Nginx (Reverse Proxy)

Jika Anda ingin mengakses aplikasi via domain atau IP publik (port 80 / 443):

```nginx
server {
    listen 80;
    server_name kartu.sekolahanda.sch.id;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## 📂 Struktur Penting:
- **Port Default**: `3000`
- **Direktori Upload Siswa**: `./public/uploads/students/`
- **Direktori Aset Sekolah**: `./public/uploads/assets/`
- **File Database**: `./prisma/dev.db`

