# LesGo Platform Design

> **Date:** 2026-02-16  
> **Status:** Approved  
> **Next Step:** Implementation planning

---

## Overview

LesGo adalah platform marketplace jasa les private yang menghubungkan siswa dengan guru les terdekat berdasarkan lokasi dan mata pelajaran.

---

## Target Market

**Multi-segment approach:**
- Siswa di kota besar (Jakarta, Surabaya, Bandung) yang membutuhkan guru les
- Siswa di seluruh Indonesia termasuk kota kecil
- Siswa SMU/SMP yang cari guru sendiri

---

## Business Model

| Aspek | Detail |
|-------|--------|
| **Guru Model** | Freelance marketplace (guru daftar mandiri) |
| **Monetization** | 15% commission per booking |
| **Payment Flow** | Platform escrow — siswa bayar ke LesGo, LesGo bayar ke guru |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | Next.js 14 (App Router) + Tailwind CSS (PWA) |
| **Backend** | Next.js API Routes + Server Actions |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | Supabase Auth (OTP/Email) |
| **Storage** | Supabase Storage |
| **Payment** | Midtrans (Snap) |
| **Maps** | Google Maps API / Mapbox |
| **Notifications** | OneSignal / Firebase Cloud Messaging |
| **Deployment** | Vercel / Dokploy |

---

## Core User Flows

### For Students (Siswa)
1. Landing → Masukin mata pelajaran
2. Location → Pakai lokasi saat ini / alamat manual
3. Search Results → List guru terdekat (foto, rating, tarif, jarak)
4. Profile Guru → Detail lengkap, reviews, jadwal
5. Booking → Pilih tanggal & waktu, konfirmasi, bayar via Midtrans
6. Session → Notifikasi reminder, live tracking, selesai
7. Review → Rate & review setelah sesi

### For Tutors (Guru)
1. Register → Daftar, upload KTP, verifikasi
2. Dashboard → Lihat request booking, jadwal, earnings
3. Accept/Decline → Terima/tolak booking
4. Go to Session → Navigate ke lokasi, check-in
5. Get Paid → Earnings masuk wallet, withdraw

---

## Database Schema (Simplified)

```sql
users (id, name, phone, email, role, location, created_at)
tutor_profiles (user_id, bio, subjects[], hourly_rate, is_verified, rating)
bookings (id, parent_id, tutor_id, subject, address, lat, lng, status, amount, commission)
payments (id, booking_id, midtrans_order_id, status, amount, paid_at)
reviews (id, booking_id, rating, comment, created_at)
availability (tutor_id, day_of_week, start_time, end_time)
```

---

## Key Features

- **Geospatial search** — Query guru dalam radius X km
- **Real-time updates** — Booking status (Supabase Realtime)
- **Commission calculation** — Auto-calculate saat booking created
- **Push notifications** — PWA push untuk booking updates

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| Payment failed | Auto-cancel after 15 min |
| Tutor no-show | Report → Admin review → Refund |
| Parent cancel < 24h | 50% refund penalty |
| Tutor cancel < 24h | Strike system (3 = suspension) |
| GPS inaccurate | Manual address confirmation |
| Webhook timeout | Retry queue + idempotency |

---

## Security & Testing

### Security
- KYC tutors: KTP + selfie (manual review)
- Parent address: Only visible to confirmed tutor
- Rate limiting, input validation, HTTPS only

### Testing
- Unit: Utility functions
- Integration: Booking flow, payment webhook
- E2E: Critical paths (search → book → pay → complete)

---

## Next Step

Invoke `writing-plans` skill to create detailed implementation plan.
