# LesGo - Platform Les Private Indonesia

Platform marketplace untuk menghubungkan siswa dengan guru les private terdekat berdasarkan lokasi dan mata pelajaran.

## 🎯 Fitur

- **Pencarian Guru**: Cari guru les berdasarkan mata pelajaran dan lokasi terdekat
- **Geospatial Search**: Temukan guru dalam radius tertentu dari lokasi Anda
- **Booking System**: Pesan jadwal les dengan mudah
- **Payment Integration**: Pembayaran aman via Midtrans
- **Dashboard Guru**: Kelola jadwal dan penghasilan
- **PWA Ready**: Install sebagai aplikasi mobile

## 🚀 Tech Stack

- **Frontend**: Next.js 16, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL + PostGIS (Supabase)
- **Auth**: Supabase Auth (OTP via WhatsApp)
- **Payment**: Midtrans (Snap)
- **Maps**: Google Maps API

## 📁 Dokumentasi

- [Design Document](./docs/2026-02-16-lesgo-design.md) - Spesifikasi fitur dan arsitektur
- [Implementation Plan](./docs/2026-02-16-lesgo-implementation.md) - Detail implementasi dan tasks

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

## 📱 Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/register` | Register (Parent/Tutor) |
| `/login` | Login with OTP |
| `/parent/search` | Search for tutors |
| `/parent/tutor/[id]` | Tutor profile & booking |
| `/tutor/dashboard` | Tutor dashboard |

## 🗄️ Database Schema

Lihat [migrations](./supabase/migrations/) untuk detail schema:
- `profiles` - User profiles (parent/tutor)
- `tutor_profiles` - Tutor-specific data
- `bookings` - Booking sessions
- `payments` - Payment records
- `reviews` - Tutor reviews

## 📝 License

MIT
