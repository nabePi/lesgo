# LesGo - AI Knowledge Base

> Comprehensive documentation for AI assistants working with the LesGo codebase.
> Last updated: 2026-02-16

---

## 1. Project Identity & Purpose

**LesGo** is an Indonesian private tutoring marketplace platform. The name combines "Les" (Indonesian for "tutoring") with "Let's Go".

**Core Value Proposition**: Connects parents/students with private tutors based on:
- Geographical proximity (geospatial search)
- Subject expertise
- Verified tutor credentials

**Business Model**:
- Commission-based: 15% platform fee per booking
- Escrow payment flow: Parent pays LesGo → LesGo pays tutor (minus commission)
- Two-sided marketplace: Parents (demand) and Tutors (supply)

---

## 2. Architecture Deep Dive

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Parent App  │  │  Tutor App   │  │   PWA (Mobile)       │  │
│  │  (/parent/*) │  │  (/tutor/*)  │  │   (manifest.json)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                      NEXT.JS 16 APP ROUTER                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Server Components (default)                             │  │
│  │  - Server-side data fetching with supabaseServer         │  │
│  │  - Async/await at component level                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Client Components ('use client')                        │  │
│  │  - Interactive UI (forms, buttons, state)                │  │
│  │  - Browser APIs (geolocation, payments)                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                        API LAYER                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌──────────────────┐  │
│  │ /api/tutors/    │ │ /api/payments/  │ │  (extensible)    │  │
│  │    search       │ │ create/webhook  │ │                  │  │
│  └─────────────────┘ └─────────────────┘ └──────────────────┘  │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                     SUPABASE (PostgreSQL)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Auth      │  │  Database   │  │  PostGIS (Geospatial)   │ │
│  │  (OTP/Phone)│  │   (RLS)     │  │  ST_DWithin, ST_Distance│ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Midtrans   │  │ Google Maps │  │   (future: OneSignal)   │  │
│  │  (Payments) │  │  (Geocode)  │  │   (Push Notifications)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow Patterns

#### Authentication Flow
```
1. User enters phone number
2. Supabase Auth sends OTP via WhatsApp
3. User enters OTP
4. Supabase verifies OTP → creates/updates auth.users record
5. Triggers creation of profiles record (via trigger or app logic)
6. Redirect based on role: /parent/dashboard or /tutor/dashboard
```

#### Booking Flow (Critical Path)
```
1. Parent searches tutors → /api/tutors/search (geospatial query)
2. Parent selects tutor → /parent/tutor/[id]
3. Parent fills booking form → BookingForm component
4. Booking created with status: 'pending_payment'
   - commission_amount = total_amount * 0.15
   - tutor_earnings = total_amount - commission_amount
5. Redirect to /parent/payment/[bookingId]
6. Payment page creates Midtrans transaction → /api/payments/create
7. Midtrans Snap.js popup displayed
8. Parent completes payment on Midtrans
9. Midtrans calls webhook → /api/payments/webhook
10. Webhook updates:
    - payments.status = 'success'
    - bookings.status = 'paid'
    - (Future: tutor_wallets.balance += tutor_earnings)
11. Tutor sees booking with 'paid' status in dashboard
12. Tutor accepts → status: 'confirmed'
13. Session happens
14. Tutor marks complete → status: 'completed'
```

#### Geospatial Search Flow
```
1. Parent grants location permission OR enters manual address
2. Browser geolocation API → lat/lng
3. (Optional) Google Maps reverse geocoding → address
4. Client calls /api/tutors/search?subject=X&lat=Y&lng=Z&radius=10
5. Server calls Supabase RPC: search_tutors(params)
6. PostgreSQL/PostGIS executes:
   - ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
   - ST_DWithin to filter by radius (in meters)
   - ST_Distance to calculate exact distance
   - ORDER BY distance
7. Returns tutors with distance (km) appended
```

---

## 3. Database Schema (Comprehensive)

### 3.1 Table Relationships

```
auth.users (Supabase managed)
    │
    ▼
profiles (1:1 with auth.users)
    │
    ├──► tutor_profiles (1:1, only if role='tutor')
    │       ├──► availability (1:N)
    │       └──► tutor_wallets (1:1)
    │               └──► wallet_transactions (1:N)
    │
    ├──► bookings (as parent_id, 1:N)
    │       ├──► payments (1:1)
    │       └──► reviews (1:1)
    │
    └──► bookings (as tutor_id, 1:N)
```

### 3.2 Field Specifications

**profiles table**:
```sql
id: UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
name: TEXT NOT NULL
phone: TEXT UNIQUE NOT NULL  -- Used for OTP auth
email: TEXT UNIQUE NOT NULL
role: TEXT CHECK (role IN ('parent', 'tutor'))
avatar_url: TEXT
created_at: TIMESTAMPTZ DEFAULT NOW()
updated_at: TIMESTAMPTZ DEFAULT NOW()
```

**tutor_profiles table**:
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id: UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE
bio: TEXT
subjects: TEXT[] NOT NULL DEFAULT '{}'  -- Array of subjects
hourly_rate: INTEGER NOT NULL  -- In IDR
is_verified: BOOLEAN DEFAULT FALSE  -- KYC verification flag
rating: DECIMAL(2,1) DEFAULT 0  -- e.g., 4.5
total_reviews: INTEGER DEFAULT 0
location_lat: DECIMAL(10, 8)  -- Precision for GPS
location_lng: DECIMAL(11, 8)
address: TEXT
id_card_url: TEXT  -- KTP upload
selfie_url: TEXT   -- Selfie with KTP
is_active: BOOLEAN DEFAULT TRUE
created_at: TIMESTAMPTZ DEFAULT NOW()
updated_at: TIMESTAMPTZ DEFAULT NOW()
```

**bookings table** (Core business entity):
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
parent_id: UUID REFERENCES profiles(id) ON DELETE CASCADE
tutor_id: UUID REFERENCES profiles(id) ON DELETE CASCADE
subject: TEXT NOT NULL
session_date: DATE NOT NULL
session_time: TIME NOT NULL
duration_hours: INTEGER DEFAULT 1
address: TEXT NOT NULL  -- Where the session happens
lat: DECIMAL(10, 8)     -- Geocoded address
lng: DECIMAL(11, 8)
status: TEXT DEFAULT 'pending_payment' CHECK (
  status IN ('pending_payment', 'paid', 'confirmed', 'in_progress', 'completed', 'cancelled', 'declined')
)
hourly_rate: INTEGER NOT NULL      -- Snapshot at booking time
total_amount: INTEGER NOT NULL     -- hourly_rate * duration_hours
commission_amount: INTEGER NOT NULL -- 15% of total
tutor_earnings: INTEGER NOT NULL    -- total - commission
notes: TEXT
created_at: TIMESTAMPTZ DEFAULT NOW()
updated_at: TIMESTAMPTZ DEFAULT NOW()
```

**payments table**:
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
booking_id: UUID REFERENCES bookings(id) ON DELETE CASCADE
midtrans_order_id: TEXT UNIQUE  -- Format: LESGO-{bookingId}-{timestamp}
midtrans_transaction_id: TEXT
amount: INTEGER NOT NULL
status: TEXT DEFAULT 'pending' CHECK (
  status IN ('pending', 'success', 'failed', 'expired', 'refunded')
)
payment_type: TEXT  -- e.g., 'credit_card', 'bank_transfer'
paid_at: TIMESTAMPTZ
created_at: TIMESTAMPTZ DEFAULT NOW()
```

### 3.3 RLS Policies Summary

| Table | Select | Insert | Update | Delete |
|-------|--------|--------|--------|--------|
| profiles | Public | Own record | Own record | - |
| tutor_profiles | Public | Own record | Own record | - |
| bookings | Parent/Tutor involved | Parent owns | Both parties | - |
| payments | Parent/Tutor via booking join | System only | System only | - |
| reviews | Public | Parent owns | - | - |
| availability | Public | Tutor owns | Tutor owns | Tutor owns |
| tutor_wallets | Tutor owns | System only | System only | - |

**Critical Pattern**: Always use `supabaseServer` (service role) for:
- Webhook handlers
- Background jobs
- Any cross-user data operations
- Bypassing RLS when necessary

---

## 4. Code Patterns & Conventions

### 4.1 Supabase Client Pattern

**Client-side** (`src/lib/supabase.ts`):
```typescript
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
// Respects RLS, uses user's JWT
```

**Server-side** (`src/lib/supabase-server.ts`):
```typescript
import { createClient } from '@supabase/supabase-js';
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Bypasses RLS
);
// Full database access, use with caution
```

**Server Component Auth** (`src/app/tutor/dashboard/page.tsx`):
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const cookieStore = await cookies();
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  }
);
const { data: { session } } = await supabase.auth.getSession();
```

### 4.2 Component Patterns

**Server Component** (default):
```typescript
// Data fetching at build/request time
// No interactivity
// Can access backend resources directly

import { supabaseServer } from '@/lib/supabase-server';

export default async function Page() {
  const { data } = await supabaseServer.from('table').select();
  return <div>{data}</div>;
}
```

**Client Component**:
```typescript
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';  // Client client

export function InteractiveComponent() {
  const [state, setState] = useState();
  // Can use browser APIs, React hooks
  // Must use client-side supabase
}
```

### 4.3 API Route Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const param = searchParams.get('key');

  const { data, error } = await supabaseServer...

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Process...
}
```

### 4.4 TypeScript Patterns

**Type Definitions** (`src/types/index.ts`):
```typescript
// All types centralized here
// Database types should be generated via:
// npx supabase gen types typescript --project-id <id> --schema public > src/types/database.ts

export type UserRole = 'parent' | 'tutor';

export interface TutorProfile {
  id: string;
  user_id: string;
  // ... fields
  distance?: number;  // Computed field from search
}
```

**Using Types**:
```typescript
import { TutorProfile, BookingStatus } from '@/types';

const tutor: TutorProfile = {...};
const status: BookingStatus = 'pending_payment';
```

### 4.5 Form Handling Pattern

Using React Hook Form + Zod (implied by dependencies):
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

type FormData = z.infer<typeof schema>;

export function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    // Handle submission
  };

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

---

## 5. Business Logic & Rules

### 5.1 Commission Calculation
```typescript
const PLATFORM_COMMISSION_RATE = 0.15;

const totalAmount = hourlyRate * durationHours;
const commissionAmount = Math.round(totalAmount * PLATFORM_COMMISSION_RATE);
const tutorEarnings = totalAmount - commissionAmount;
```

### 5.2 Booking Status Transitions

```
pending_payment
    │ (payment received via webhook)
    ▼
  paid
    │ (tutor accepts)
    ▼
confirmed ───────► declined (tutor rejects)
    │
    ▼ (session starts)
in_progress
    │
    ▼ (session ends)
completed
    │
    ▼ (parent reviews)
  review

Alternative paths:
- pending_payment ──► cancelled (parent cancels before payment)
- paid ──► cancelled (parent cancels within policy)
- confirmed ──► cancelled (emergency, admin intervention)
```

### 5.3 Geospatial Search Parameters

Default search radius: **10 km**
Maximum practical radius: **50 km** (Jakarta metro area)

Coordinate precision:
- `DECIMAL(10, 8)` for latitude (-90 to +90)
- `DECIMAL(11, 8)` for longitude (-180 to +180)

SRID: **4326** (WGS 84 - standard GPS coordinate system)

### 5.4 Indonesian Localization

- Language: Bahasa Indonesia
- Currency: Indonesian Rupiah (IDR)
- Date format: `EEEE, d MMMM yyyy` (e.g., "Senin, 16 Februari 2026")
- Time format: 24-hour (e.g., "14:30")
- Phone format: International (+6281234567890)

Using date-fns with Indonesian locale:
```typescript
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

format(date, 'EEEE, d MMMM yyyy', { locale: id });
```

---

## 6. External Integrations

### 6.1 Midtrans Payment Flow

**Environment**: Sandbox (isProduction: false in dev)
**Payment Methods**: Credit card, bank transfer, e-wallet, QRIS

**Order ID Format**: `LESGO-{bookingId}-{timestamp}`
Example: `LESGO-550e8400-e29b-41d4-a716-446655440000-1708089600000`

**Transaction Status Mapping**:
| Midtrans Status | Internal Status |
|-----------------|-----------------|
| capture | success |
| settlement | success |
| deny | failed |
| cancel | failed |
| expire | expired |
| pending | pending |

**Webhook Security**: Currently no signature verification implemented. For production:
```typescript
// Verify Midtrans webhook signature
const signature = request.headers.get('x-signature');
// Validate against SHA512 hash
```

### 6.2 Google Maps API

**Used For**:
1. Reverse geocoding (lat/lng → address)
2. (Future) Forward geocoding (address → lat/lng)
3. (Future) Distance matrix API
4. (Future) Static maps

**API Key**: Client-side only (`NEXT_PUBLIC_` prefix)
**Restrictions**: Should be restricted to HTTP referrers in production

### 6.3 Supabase Auth

**Method**: Phone OTP (SMS/WhatsApp)
**Provider**: Supabase built-in (uses Twilio or custom provider)

**Auth Flow**:
```typescript
// Send OTP
await supabase.auth.signInWithOtp({ phone });

// Verify OTP
await supabase.auth.verifyOtp({
  phone,
  token: otpCode,
  type: 'sms',
});
```

---

## 7. Known Limitations & Technical Debt

### 7.1 Current Limitations

1. **No Middleware**: Auth protection missing in middleware.ts
   - Currently using server-side auth checks
   - Should implement middleware for route protection

2. **Payment Webhook**: No idempotency check
   - Risk of double-processing payments
   - Should track processed order IDs

3. **Wallet System**: Incomplete
   - tutor_wallets table exists
   - No RPC function `add_tutor_earning` implemented
   - No withdrawal flow

4. **Image Uploads**: Placeholder only
   - Avatar uploads not implemented
   - KTP document upload not implemented
   - Need Supabase Storage integration

5. **Real-time Updates**: Not implemented
   - Supabase Realtime subscriptions not set up
   - Tutor dashboard doesn't auto-refresh on new bookings

6. **Search Limitations**:
   - No pagination on tutor search
   - No sorting options (price, rating, distance)
   - No filters (availability, verification status)

7. **Manual Address Entry**: Not geocoded
   - Only GPS location is geocoded
   - Manual address entry doesn't convert to lat/lng

### 7.2 Security Considerations

1. **Service Role Key Exposure**: Ensure `SUPABASE_SERVICE_ROLE_KEY` never leaks to client
2. **No Rate Limiting**: API routes vulnerable to abuse
3. **No Input Sanitization**: SQL injection risk mitigated by parameterized queries but needs validation
4. **No CSRF Protection**: Needed for non-GET routes
5. **CORS**: Default Next.js CORS settings

### 7.3 Performance Considerations

1. **Geospatial Index**: Ensure GIST index on tutor_profiles location:
   ```sql
   CREATE INDEX idx_tutor_location ON tutor_profiles
   USING GIST (ST_SetSRID(ST_MakePoint(location_lng, location_lat), 4326));
   ```

2. **N+1 Queries**: Current implementation may have N+1 in some joins

3. **No Caching**: No Redis/memory caching implemented

---

## 8. Testing Strategy

### 8.1 Manual Testing Checklist

**Authentication**:
- [ ] Register as parent
- [ ] Register as tutor
- [ ] Login with OTP
- [ ] Logout

**Parent Flow**:
- [ ] Search tutors by subject
- [ ] Grant location permission
- [ ] View tutor profile
- [ ] Create booking
- [ ] Complete payment (use Midtrans sandbox credentials)
- [ ] View booking status

**Tutor Flow**:
- [ ] View dashboard
- [ ] See booking requests
- [ ] Accept/decline booking
- [ ] View earnings

**Payment Webhook**:
- [ ] Simulate success webhook
- [ ] Verify booking status updated

### 8.2 Midtrans Sandbox Testing

Use these test credentials:
- **Credit Card**: 4811 1111 1111 1114, any CVV, any future date
- **Bank Transfer**: Select any bank, simulate in Midtrans dashboard
- **E-wallet**: Use test accounts

Webhook simulation via Midtrans dashboard or curl:
```bash
curl -X POST http://localhost:3000/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "LESGO-xxx-xxx",
    "transaction_status": "settlement",
    "payment_type": "credit_card"
  }'
```

---

## 9. Deployment & Environment

### 9.1 Environment Variables

Required:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Midtrans
MIDTRANS_SERVER_KEY=SB-Mid-server-...
MIDTRANS_CLIENT_KEY=SB-Mid-client-...

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
```

### 9.2 Build Configuration

**next.config.ts**:
```typescript
const nextConfig: NextConfig = {
  devIndicators: false,
  // Add for production:
  // output: 'standalone',  // For Docker deployment
};
```

### 9.3 Database Migrations

Apply migrations in order:
1. `001_initial_schema.sql` - Tables and RLS enable
2. `002_rls_policies.sql` - RLS policies
3. `003_search_function.sql` - Geospatial search function

### 9.4 PWA Configuration

Files:
- `public/manifest.json` - Web app manifest
- `public/icon-192x192.png` - Android icon (currently empty)
- `public/icon-512x512.png` - iOS icon (currently empty)
- `src/app/layout.tsx` - Meta tags for PWA

---

## 10. Common Tasks & Code Snippets

### 10.1 Add New API Route

```typescript
// src/app/api/my-resource/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const { data, error } = await supabaseServer.from('my_table').select();
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ data });
}
```

### 10.2 Add New shadcn Component

```bash
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
```

### 10.3 Database Query Patterns

**Join with foreign table**:
```typescript
const { data } = await supabaseServer
  .from('bookings')
  .select('*, parent:profiles!parent_id(*), tutor:profiles!tutor_id(*)')
  .eq('id', bookingId)
  .single();
```

**Array contains**:
```typescript
const { data } = await supabaseServer
  .from('tutor_profiles')
  .select()
  .contains('subjects', ['Matematika']);
```

**Geospatial filter** (client-side, use RPC for server):
```typescript
const { data } = await supabaseServer.rpc('search_tutors', {
  p_subject: 'Matematika',
  p_lat: -6.2088,
  p_lng: 106.8456,
  p_radius: 10,
});
```

### 10.4 Form Validation with Zod

```typescript
import { z } from 'zod';

const bookingSchema = z.object({
  subject: z.string().min(1, 'Mata pelajaran wajib diisi'),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid'),
  duration: z.number().min(1).max(4),
  address: z.string().min(10, 'Alamat minimal 10 karakter'),
});

type BookingFormData = z.infer<typeof bookingSchema>;
```

---

## 11. File Structure Reference

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with PWA meta
│   ├── login/page.tsx           # Login page (server)
│   ├── register/page.tsx        # Registration page (server)
│   ├── parent/
│   │   ├── page.tsx             # Redirects to /search
│   │   ├── search/page.tsx      # Tutor search (client)
│   │   ├── tutor/[id]/page.tsx  # Tutor profile (server)
│   │   └── payment/[id]/page.tsx # Payment page (client)
│   ├── tutor/
│   │   └── dashboard/page.tsx   # Tutor dashboard (server)
│   └── api/
│       ├── tutors/search/route.ts   # GET - Geospatial search
│       ├── payments/create/route.ts # POST - Create Midtrans txn
│       └── payments/webhook/route.ts # POST - Midtrans callback
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx        # OTP login (client)
│   │   ├── RegisterForm.tsx     # Registration (client)
│   │   └── RoleSelector.tsx     # Parent/Tutor toggle
│   ├── booking/
│   │   └── BookingForm.tsx      # Create booking (client)
│   ├── search/
│   │   ├── SubjectSelector.tsx  # Subject chips
│   │   ├── LocationPicker.tsx   # GPS/manual location
│   │   └── TutorCard.tsx        # Tutor result card
│   ├── tutor/
│   │   ├── BookingRequests.tsx  # List + accept/decline
│   │   └── EarningsCard.tsx     # Wallet display
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── supabase.ts              # Browser client
│   ├── supabase-server.ts       # Service role client
│   ├── midtrans.ts              # Midtrans Snap client
│   └── utils.ts                 # cn() Tailwind helper
└── types/
    ├── index.ts                 # App types
    └── midtrans.d.ts            # Midtrans type defs
```

---

## 12. Troubleshooting Guide

### 12.1 Common Errors

**"Failed to fetch" on search**:
- Check Google Maps API key
- Verify browser location permission granted

**"Payment creation failed"**:
- Verify Midtrans credentials
- Check booking exists in database

**"RLS policy violation"**:
- Ensure using correct client (anon vs service role)
- Check policy allows the operation

**"Type error: Property X does not exist"**:
- Regenerate database types: `npx supabase gen types ...`

### 12.2 Debug Techniques

**Enable Supabase logging**:
```typescript
const supabase = createClient(url, key, {
  auth: { debug: true }
});
```

**Check RLS policies**:
```sql
-- List all policies on a table
SELECT * FROM pg_policies WHERE tablename = 'bookings';
```

**Test geospatial query**:
```sql
-- Direct SQL test
SELECT * FROM search_tutors('Matematika', -6.2088, 106.8456, 10);
```

---

## 13. Future Roadmap (Post-MVP)

1. **Real-time**: Supabase Realtime for live booking updates
2. **Chat**: In-app messaging between parent and tutor
3. **Notifications**: Push notifications via OneSignal/FCM
4. **Admin Dashboard**: Tutor verification, dispute resolution
5. **Withdrawal**: Bank transfer integration for tutors
6. **Reviews**: Full rating and review system
7. **Availability**: Calendar integration for tutors
8. **Analytics**: Booking trends, revenue reports

---

*This document is living documentation. Update it as the codebase evolves.*
