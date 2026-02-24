# LesGo - Platform Les Private Indonesia

Platform marketplace untuk menghubungkan siswa/orang tua dengan guru les private terdekat berdasarkan lokasi dan mata pelajaran. LesGo ("Les" + "Let's Go") memudahkan pencarian dan pemesanan les private berkualitas di seluruh Indonesia.

## 🎯 Fitur

### Untuk Orang Tua/Siswa
- **Pencarian Guru**: Cari guru les berdasarkan mata pelajaran dan lokasi terdekat
- **Geospatial Search**: Temukan guru dalam radius tertentu dengan PostGIS
- **Filter Lanjutan**: Filter berdasarkan mata pelajaran, rentang harga, dan rating
- **Booking System**: Pesan jadwal les dengan mudah dan aman
- **Payment Integration**: Pembayaran aman via Midtrans (Snap)
- **Riwayat Pemesanan**: Lihat dan kelola semua les yang telah dipesan

### Untuk Guru
- **Dashboard Guru**: Kelola profil, jadwal, dan penghasilan
- **Manajemen Ketersediaan**: Atur jadwal yang tersedia untuk les
- **Permintaan Booking**: Terima atau tolak permintaan les dari siswa
- **Dompet Digital**: Pantau penghasilan dan riwayat transaksi
- **Verifikasi Profil**: Sistem verifikasi untuk meningkatkan kepercayaan

### Admin
- **Dashboard Admin**: Kelola semua pengguna dan pemesanan
- **Manajemen Tutor**: Lihat dan kelola data semua tutor
- **Monitoring Transaksi**: Pantau semua transaksi pembayaran

## 🚀 Tech Stack

- **Framework**: Next.js 16.1.6 dengan App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (New York style)
- **Database**: PostgreSQL + PostGIS (Supabase)
- **Authentication**: Supabase Auth dengan OTP via WhatsApp
- **Payment**: Midtrans (Snap)
- **Maps**: Google Maps API
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod

## 📁 Dokumentasi

- [Design Document](./docs/2026-02-16-lesgo-design.md) - Spesifikasi fitur, user flow, dan arsitektur
- [Implementation Plan](./docs/2026-02-16-lesgo-implementation.md) - Detail implementasi dan daftar tasks
- [WhatsApp Login Plan](./docs/WHATSAPP_LOGIN_PLAN.md) - Dokumentasi implementasi login dengan WhatsApp OTP
- [Wilayah Implementation](./docs/WILAYAH_IMPLEMENTATION_STATUS.md) - Status implementasi data wilayah Indonesia
- [Storage Setup](./docs/STORAGE_BUCKET_SETUP.md) - Panduan setup storage untuk foto profil

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- Supabase account
- Midtrans account (sandbox untuk development)
- Google Maps API key

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

### Installation
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Seeding Data (Opsional)
```bash
# Seed sample tutor data untuk testing
npm run seed

# Import data wilayah Indonesia (provinsi, kota, kecamatan)
npm run import:wilayah
```

## 📱 Routes

### Public
| Route | Description |
|-------|-------------|
| `/` | Landing page dengan Warm Modern design |
| `/register` | Registrasi dengan pemilihan role (Parent/Tutor) |
| `/login` | Login dengan OTP via WhatsApp |

### Parent
| Route | Description |
|-------|-------------|
| `/parent/search` | Pencarian guru dengan filter lokasi dan mata pelajaran |
| `/parent/tutor/[id]` | Profil guru dan form pemesanan |
| `/parent/payment/[id]` | Halaman pembayaran via Midtrans |

### Tutor
| Route | Description |
|-------|-------------|
| `/tutor/dashboard` | Dashboard guru dengan statistik dan permintaan booking |
| `/tutor/onboarding` | Form kelengkapan data profil guru |

### Admin
| Route | Description |
|-------|-------------|
| `/admin/dashboard` | Dashboard admin untuk monitoring |
| `/admin/tutors` | Daftar semua tutor |
| `/admin/bookings` | Daftar semua pemesanan |

## 🗄️ Database Schema

Lihat [migrations](./supabase/migrations/) untuk detail lengkap schema. Berikut 7 tabel utama:

| Tabel | Deskripsi |
|-------|-----------|
| `profiles` | User profiles (extends Supabase auth.users) dengan role parent/tutor |
| `tutor_profiles` | Data spesifik guru (subjects, rate, lokasi, verifikasi) |
| `bookings` | Sesi les dengan status tracking |
| `payments` | Records pembayaran terintegrasi dengan Midtrans |
| `reviews` | Rating dan ulasan untuk tutor |
| `availability` | Jadwal ketersediaan tutor |
| `tutor_wallets` + `wallet_transactions` | Tracking penghasilan tutor |

Semua tabel memiliki Row Level Security (RLS) enabled untuk keamanan data.

### Alur Status Booking
```
pending_payment → paid → confirmed → in_progress → completed
                          ↓
                    cancelled / declined
```

### Model Pembayaran (Escrow)
- Komisi platform 15% untuk setiap booking
- Orang tua membayar full amount ke LesGo via Midtrans
- Guru menerima penghasilan dikurangi komisi ke dompet digitalnya
- Webhook handler di `/api/payments/webhook` mengupdate status pembayaran otomatis

## 🎨 Design System

Proyek ini menggunakan **Warm Modern Design System** yang ditandai dengan:
- **Color Palette**: Warm terracotta, soft sage, warm cream, dan charcoal
- **Typography**: Clean sans-serif dengan accent yang lembut
- **Border Radius**: Soft corners (12-16px) untuk tampilan yang ramah
- **Shadows**: Soft, warm-toned shadows untuk kedalaman halus

Lihat implementasi di `src/app/globals.css` untuk custom properties CSS.

## 🏗️ Arsitektur

### Role-Based Routing
Platform memiliki dua role utama: `parent` dan `tutor`. Route diorganisir di bawah `/parent/*` dan `/tutor/*`. Pemilihan role terjadi saat registrasi.

### Supabase Client Pattern
- **Client-side** (`src/lib/supabase.ts`): Menggunakan anon key untuk operasi browser, menghormati RLS policies
- **Server-side** (`src/lib/supabase-server.ts`): Menggunakan service role key untuk API routes, bypass RLS

### Geospatial Search
Menggunakan PostGIS extension dengan `ST_DWithin` untuk radius filtering dan `ST_Distance` untuk perhitungan jarak. Fungsi SQL `search_tutors` menangani query geospatial.

## 📝 License

MIT
