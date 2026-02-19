# LesGo MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build MVP marketplace platform jasa les private dengan geospatial search, booking system, dan Midtrans payment.

**Architecture:** Next.js 14 PWA dengan Supabase backend. Single codebase untuk parent dan tutor views (role-based routing). PostgreSQL dengan PostGIS extension untuk geospatial queries.

**Tech Stack:** Next.js 14, Tailwind CSS, Supabase (Auth, DB, Realtime, Storage), Midtrans, Google Maps API

---

## Prerequisites

### Task 0: Setup Project

**Step 1: Create project with shadcn/ui**

```bash
cd /home/ubuntu/.openclaw/workspace
npx shadcn@latest init --yes --template next --base-color slate
```

**Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/auth-ui-react
npm install @midtrans/midtrans-node-client
npm install @googlemaps/js-api-loader
npm install lucide-react
npm install zustand
npm install react-hook-form zod @hookform/resolvers
npm install date-fns
```

**Step 3: Setup environment variables**

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

**Step 4: Initialize git**

```bash
git init
git add .
git commit -m "chore: initial setup with shadcn/ui"
```

---

## Phase 1: Database Schema & Supabase Setup

### Task 1: Create Database Tables

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

**Step 1: Write migration file**

```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('parent', 'tutor')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tutor profiles
CREATE TABLE public.tutor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  bio TEXT,
  subjects TEXT[] NOT NULL DEFAULT '{}',
  hourly_rate INTEGER NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(2,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  address TEXT,
  id_card_url TEXT,
  selfie_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  duration_hours INTEGER DEFAULT 1,
  address TEXT NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  status TEXT DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'paid', 'confirmed', 'in_progress', 'completed', 'cancelled', 'declined')),
  hourly_rate INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  commission_amount INTEGER NOT NULL,
  tutor_earnings INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  midtrans_order_id TEXT UNIQUE,
  midtrans_transaction_id TEXT,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'expired', 'refunded')),
  payment_type TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tutor availability
CREATE TABLE public.availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  UNIQUE(tutor_id, day_of_week, start_time)
);

-- Tutor wallet/earnings
CREATE TABLE public.tutor_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet transactions
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('earning', 'withdrawal')),
  amount INTEGER NOT NULL,
  booking_id UUID REFERENCES public.bookings(id),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
```

**Step 2: Apply migration di Supabase Dashboard**

Go to SQL Editor → New query → Paste → Run

**Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: initial database schema with PostGIS"
```

---

### Task 2: Setup RLS Policies

**Files:**
- Create: `supabase/migrations/002_rls_policies.sql`

**Step 1: Write RLS policies**

```sql
-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Tutor profiles policies
CREATE POLICY "Tutor profiles are viewable by everyone"
  ON public.tutor_profiles FOR SELECT USING (true);

CREATE POLICY "Tutors can insert own profile"
  ON public.tutor_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Tutors can update own profile"
  ON public.tutor_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Bookings policies
CREATE POLICY "Parents can view own bookings"
  ON public.bookings FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Tutors can view bookings assigned to them"
  ON public.bookings FOR SELECT USING (auth.uid() = tutor_id);

CREATE POLICY "Parents can create bookings"
  ON public.bookings FOR INSERT WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Both parties can update booking status"
  ON public.bookings FOR UPDATE USING (
    auth.uid() = parent_id OR auth.uid() = tutor_id
  );

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Parents can create reviews for their bookings"
  ON public.reviews FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- Availability policies
CREATE POLICY "Availability is viewable by everyone"
  ON public.availability FOR SELECT USING (true);

CREATE POLICY "Tutors can manage own availability"
  ON public.availability FOR ALL USING (auth.uid() = tutor_id);
```

**Step 2: Apply in Supabase Dashboard**

**Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: add RLS policies"
```

---

## Phase 2: Core Components & Types

### Task 3: Setup TypeScript Types

**Files:**
- Create: `src/types/index.ts`

**Step 1: Write types**

```typescript
export type UserRole = 'parent' | 'tutor';

export interface Profile {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface TutorProfile {
  id: string;
  user_id: string;
  bio?: string;
  subjects: string[];
  hourly_rate: number;
  is_verified: boolean;
  rating: number;
  total_reviews: number;
  location_lat?: number;
  location_lng?: number;
  address?: string;
  is_active: boolean;
  user?: Profile;
}

export type BookingStatus = 
  | 'pending_payment' 
  | 'paid' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'declined';

export interface Booking {
  id: string;
  parent_id: string;
  tutor_id: string;
  subject: string;
  session_date: string;
  session_time: string;
  duration_hours: number;
  address: string;
  lat?: number;
  lng?: number;
  status: BookingStatus;
  hourly_rate: number;
  total_amount: number;
  commission_amount: number;
  tutor_earnings: number;
  notes?: string;
  created_at: string;
  parent?: Profile;
  tutor?: Profile;
}

export interface Review {
  id: string;
  booking_id: string;
  tutor_id: string;
  parent_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  parent?: Profile;
}

export interface Availability {
  id: string;
  tutor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export const SUBJECTS = [
  'Matematika',
  'Fisika',
  'Kimia',
  'Biologi',
  'Bahasa Inggris',
  'Bahasa Indonesia',
  'Sejarah',
  'Geografi',
  'Ekonomi',
  'IPS',
  'IPA',
  'Calistung',
  'Komputer',
  'Musik',
  'Mengaji',
] as const;
```

**Step 2: Commit**

```bash
git add src/types/
git commit -m "feat: add TypeScript types"
```

---

### Task 4: Setup Supabase Client

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `src/lib/supabase-server.ts`

**Step 1: Create client-side Supabase**

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

**Step 2: Create server-side Supabase**

```typescript
// src/lib/supabase-server.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseServer = createClient<Database>(supabaseUrl, serviceRoleKey);
```

**Step 3: Generate Database types**

```bash
npx supabase gen types typescript --project-id your-project-id --schema public > src/types/database.ts
```

**Step 4: Commit**

```bash
git add src/lib/
git commit -m "feat: setup Supabase clients"
```

---

## Phase 3: Authentication Flow

### Task 5: Create Auth Components

**Files:**
- Create: `src/components/auth/LoginForm.tsx`
- Create: `src/components/auth/RegisterForm.tsx`
- Create: `src/components/auth/RoleSelector.tsx`

**Step 1: Create LoginForm component**

```tsx
// src/components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });
    if (error) {
      alert(error.message);
    } else {
      setStep('otp');
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    });
    if (error) {
      alert(error.message);
    } else {
      window.location.href = '/onboarding';
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {step === 'phone' ? (
        <>
          <div>
            <Label htmlFor="phone">Nomor WhatsApp</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+6281234567890"
            />
          </div>
          <Button onClick={sendOtp} disabled={loading}>
            {loading ? 'Mengirim...' : 'Kirim Kode OTP'}
          </Button>
        </>
      ) : (
        <>
          <div>
            <Label htmlFor="otp">Kode OTP</Label>
            <Input
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
            />
          </div>
          <Button onClick={verifyOtp} disabled={loading}>
            {loading ? 'Memverifikasi...' : 'Verifikasi'}
          </Button>
        </>
      )}
    </div>
  );
}
```

**Step 2: Create RegisterForm component**

```tsx
// src/components/auth/RegisterForm.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RoleSelector } from './RoleSelector';
import { UserRole } from '@/types';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('parent');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      phone,
      password: Math.random().toString(36).slice(-8), // Random password
    });
    
    if (authError || !authData.user) {
      alert(authError?.message || 'Failed to create user');
      setLoading(false);
      return;
    }
    
    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      name,
      email,
      phone,
      role,
    });
    
    if (profileError) {
      alert(profileError.message);
    } else {
      if (role === 'tutor') {
        window.location.href = '/tutor/onboarding';
      } else {
        window.location.href = '/parent/dashboard';
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <RoleSelector value={role} onChange={setRole} />
      
      <div>
        <Label htmlFor="name">Nama Lengkap</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="phone">Nomor WhatsApp</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+6281234567890"
        />
      </div>
      
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Mendaftar...' : 'Daftar'}
      </Button>
    </div>
  );
}
```

**Step 3: Create RoleSelector**

```tsx
// src/components/auth/RoleSelector.tsx
import { UserRole } from '@/types';

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="flex gap-4">
      <button
        onClick={() => onChange('parent')}
        className={`flex-1 p-4 border rounded-lg ${
          value === 'parent' ? 'border-primary bg-primary/10' : 'border-gray-200'
        }`}
      >
        <div className="font-semibold">Siswa</div>
        <div className="text-sm text-gray-500">Cari guru les private</div>
      </button>
      <button
        onClick={() => onChange('tutor')}
        className={`flex-1 p-4 border rounded-lg ${
          value === 'tutor' ? 'border-primary bg-primary/10' : 'border-gray-200'
        }`}
      >
        <div className="font-semibold">Guru</div>
        <div className="text-sm text-gray-500">Daftar sebagai pengajar</div>
      </button>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add src/components/auth/
git commit -m "feat: add auth components"
```

---

### Task 6: Create Auth Pages

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/app/register/page.tsx`
- Create: `src/app/onboarding/page.tsx`
- Create: `src/middleware.ts`

**Step 1: Create login page**

```tsx
// src/app/login/page.tsx
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Masuk ke LesGo</h1>
          <p className="text-gray-500">Masukkan nomor WhatsApp Anda</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
```

**Step 2: Create register page**

```tsx
// src/app/register/page.tsx
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Daftar LesGo</h1>
          <p className="text-gray-500">Buat akun baru</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
```

**Step 3: Create middleware for auth protection**

```typescript
// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith('/parent') || 
      req.nextUrl.pathname.startsWith('/tutor')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  
  return res;
}

export const config = {
  matcher: ['/parent/:path*', '/tutor/:path*'],
};
```

**Step 4: Install auth helpers**

```bash
npm install @supabase/auth-helpers-nextjs
```

**Step 5: Commit**

```bash
git add src/app/login/ src/app/register/ src/app/onboarding/ src/middleware.ts
git commit -m "feat: add auth pages and middleware"
```

---

## Phase 4: Parent Flow — Search & Book

### Task 7: Create Search Components

**Files:**
- Create: `src/components/search/SubjectSelector.tsx`
- Create: `src/components/search/LocationPicker.tsx`
- Create: `src/components/search/TutorCard.tsx`

**Step 1: Create SubjectSelector**

```tsx
// src/components/search/SubjectSelector.tsx
import { SUBJECTS } from '@/types';

interface SubjectSelectorProps {
  value: string;
  onChange: (subject: string) => void;
}

export function SubjectSelector({ value, onChange }: SubjectSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="font-medium">Mata Pelajaran</label>
      <div className="flex flex-wrap gap-2">
        {SUBJECTS.map((subject) => (
          <button
            key={subject}
            onClick={() => onChange(subject)}
            className={`px-4 py-2 rounded-full border ${
              value === subject
                ? 'bg-primary text-white border-primary'
                : 'border-gray-200 hover:border-primary'
            }`}
          >
            {subject}
          </button>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Create LocationPicker**

```tsx
// src/components/search/LocationPicker.tsx
'use client';

import { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

export function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  const [loading, setLoading] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  const getCurrentLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // Reverse geocode to get address
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        const address = data.results[0]?.formatted_address || '';
        onLocationSelect(latitude, longitude, address);
        setLoading(false);
      },
      (error) => {
        alert('Gagal mendapatkan lokasi: ' + error.message);
        setLoading(false);
      }
    );
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={getCurrentLocation}
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <MapPin className="mr-2 h-4 w-4" />
        )}
        Gunakan Lokasi Saat Ini
      </Button>
      
      <div className="text-center text-gray-500">atau</div>
      
      <div>
        <label className="font-medium">Masukkan Alamat Manual</label>
        <textarea
          value={manualAddress}
          onChange={(e) => setManualAddress(e.target.value)}
          className="w-full p-3 border rounded-lg mt-1"
          rows={3}
          placeholder="Jl. Mawar No. 123, Jakarta Selatan"
        />
        <Button 
          onClick={() => {
            // Geocode manual address
          }}
          variant="outline"
          className="mt-2"
        >
          Cari Alamat
        </Button>
      </div>
    </div>
  );
}
```

**Step 3: Create TutorCard**

```tsx
// src/components/search/TutorCard.tsx
import { TutorProfile } from '@/types';
import { Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface TutorCardProps {
  tutor: TutorProfile;
  distance?: number;
}

export function TutorCard({ tutor, distance }: TutorCardProps) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 bg-gray-200 rounded-full" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{tutor.user?.name}</h3>
            {tutor.is_verified && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                Terverifikasi
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{tutor.rating || 'Baru'}</span>
            <span>({tutor.total_reviews || 0} ulasan)</span>
          </div>
          {distance && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>{distance.toFixed(1)} km</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1">
        {tutor.subjects.slice(0, 3).map((subject) => (
          <span
            key={subject}
            className="text-xs bg-gray-100 px-2 py-1 rounded"
          >
            {subject}
          </span>
        ))}
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <span className="text-lg font-bold">Rp {tutor.hourly_rate.toLocaleString()}</span>
          <span className="text-gray-500">/jam</span>
        </div>
        <Link href={`/parent/tutor/${tutor.user_id}`}>
          <Button>Lihat Profil</Button>
        </Link>
      </div>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add src/components/search/
git commit -m "feat: add search components"
```

---

### Task 8: Create Search Page with Geospatial Query

**Files:**
- Create: `src/app/parent/search/page.tsx`
- Create: `src/app/api/tutors/search/route.ts`

**Step 1: Create search API endpoint**

```typescript
// src/app/api/tutors/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subject = searchParams.get('subject');
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const radius = parseFloat(searchParams.get('radius') || '10'); // km

  const { data, error } = await supabaseServer.rpc('search_tutors', {
    p_subject: subject,
    p_lat: lat,
    p_lng: lng,
    p_radius: radius,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tutors: data });
}
```

**Step 2: Create Supabase function for geospatial search**

Add to Supabase SQL Editor:

```sql
CREATE OR REPLACE FUNCTION search_tutors(
  p_subject TEXT,
  p_lat DECIMAL,
  p_lng DECIMAL,
  p_radius DECIMAL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  bio TEXT,
  subjects TEXT[],
  hourly_rate INTEGER,
  is_verified BOOLEAN,
  rating DECIMAL,
  total_reviews INTEGER,
  location_lat DECIMAL,
  location_lng DECIMAL,
  address TEXT,
  distance DECIMAL,
  user JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tp.id,
    tp.user_id,
    tp.bio,
    tp.subjects,
    tp.hourly_rate,
    tp.is_verified,
    tp.rating,
    tp.total_reviews,
    tp.location_lat,
    tp.location_lng,
    tp.address,
    (ST_Distance(
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(tp.location_lng, tp.location_lat), 4326)::geography
    ) / 1000)::DECIMAL as distance,
    jsonb_build_object(
      'name', p.name,
      'avatar_url', p.avatar_url
    ) as user
  FROM tutor_profiles tp
  JOIN profiles p ON p.id = tp.user_id
  WHERE 
    tp.is_active = true
    AND (p_subject IS NULL OR p_subject = ANY(tp.subjects))
    AND ST_DWithin(
      ST_SetSRID(ST_MakePoint(tp.location_lng, tp.location_lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius * 1000
    )
  ORDER BY distance;
END;
$$ LANGUAGE plpgsql;
```

**Step 3: Create search page**

```tsx
// src/app/parent/search/page.tsx
'use client';

import { useState } from 'react';
import { SubjectSelector } from '@/components/search/SubjectSelector';
import { LocationPicker } from '@/components/search/LocationPicker';
import { TutorCard } from '@/components/search/TutorCard';
import { TutorProfile } from '@/types';
import { Button } from '@/components/ui/button';

export default function SearchPage() {
  const [subject, setSubject] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const searchTutors = async () => {
    if (!subject || !location) {
      alert('Pilih mata pelajaran dan lokasi');
      return;
    }
    
    setLoading(true);
    const response = await fetch(
      `/api/tutors/search?subject=${subject}&lat=${location.lat}&lng=${location.lng}&radius=10`
    );
    const data = await response.json();
    setTutors(data.tutors || []);
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Cari Guru Les</h1>
      
      <SubjectSelector value={subject} onChange={setSubject} />
      
      <LocationPicker 
        onLocationSelect={(lat, lng, address) => setLocation({ lat, lng, address })} 
      />
      
      <Button 
        onClick={searchTutors} 
        disabled={loading || !subject || !location}
        className="w-full"
      >
        {loading ? 'Mencari...' : 'Cari Guru'}
      </Button>
      
      {tutors.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold">{tutors.length} guru ditemukan</h2>
          {tutors.map((tutor) => (
            <TutorCard 
              key={tutor.id} 
              tutor={tutor} 
              distance={tutor.distance}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add src/app/parent/search/ src/app/api/tutors/
git commit -m "feat: add tutor search with geospatial query"
```

---

### Task 9: Create Booking Flow

**Files:**
- Create: `src/app/parent/tutor/[id]/page.tsx`
- Create: `src/components/booking/BookingForm.tsx`
- Create: `src/app/api/bookings/route.ts`

**Step 1: Create tutor profile page**

```tsx
// src/app/parent/tutor/[id]/page.tsx
import { supabaseServer } from '@/lib/supabase-server';
import { BookingForm } from '@/components/booking/BookingForm';
import { Star, MapPin, CheckCircle } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function TutorProfilePage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const { data: tutor } = await supabaseServer
    .from('tutor_profiles')
    .select('*, user:profiles(*)')
    .eq('user_id', params.id)
    .single();

  if (!tutor) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-24 h-24 bg-gray-200 rounded-full" />
        <div>
          <h1 className="text-2xl font-bold">{tutor.user.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{tutor.rating || 'Baru'}</span>
            <span className="text-gray-500">({tutor.total_reviews} ulasan)</span>
          </div>
          {tutor.is_verified && (
            <div className="flex items-center gap-1 text-green-600 mt-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Guru Terverifikasi</span>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Tentang</h2>
        <p className="text-gray-600">{tutor.bio || 'Belum ada deskripsi'}</p>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Mata Pelajaran</h2>
        <div className="flex flex-wrap gap-2">
          {tutor.subjects.map((subject: string) => (
            <span key={subject} className="bg-gray-100 px-3 py-1 rounded-full">
              {subject}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Lokasi</h2>
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{tutor.address}</span>
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold">Rp {tutor.hourly_rate.toLocaleString()}</span>
            <span className="text-gray-500">/jam</span>
          </div>
        </div>
        <BookingForm tutorId={tutor.user_id} hourlyRate={tutor.hourly_rate} />
      </div>
    </div>
  );
}
```

**Step 2: Create BookingForm component**

```tsx
// src/components/booking/BookingForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

interface BookingFormProps {
  tutorId: string;
  hourlyRate: number;
}

export function BookingForm({ tutorId, hourlyRate }: BookingFormProps) {
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const totalAmount = hourlyRate * duration;
  const commission = Math.round(totalAmount * 0.15);
  const tutorEarnings = totalAmount - commission;

  const handleSubmit = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert('Silakan login terlebih dahulu');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        parent_id: user.id,
        tutor_id: tutorId,
        subject,
        session_date: date,
        session_time: time,
        duration_hours: duration,
        address,
        hourly_rate: hourlyRate,
        total_amount: totalAmount,
        commission_amount: commission,
        tutor_earnings: tutorEarnings,
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
    } else {
      // Redirect to payment
      window.location.href = `/parent/payment/${data.id}`;
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Mata Pelajaran</Label>
        <Input 
          value={subject} 
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Contoh: Matematika"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tanggal</Label>
          <Input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <Label>Waktu</Label>
          <Input 
            type="time" 
            value={time} 
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>Durasi (jam)</Label>
        <Input 
          type="number" 
          min={1} 
          max={4}
          value={duration} 
          onChange={(e) => setDuration(parseInt(e.target.value))}
        />
      </div>

      <div>
        <Label>Alamat Lengkap</Label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full p-3 border rounded-lg"
          rows={3}
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <div className="flex justify-between">
          <span>Tarif per jam</span>
          <span>Rp {hourlyRate.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Durasi</span>
          <span>{duration} jam</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-semibold">
          <span>Total</span>
          <span>Rp {totalAmount.toLocaleString()}</span>
        </div>
        <div className="text-xs text-gray-500">
          (Termasuk biaya platform Rp {commission.toLocaleString()})
        </div>
      </div>

      <Button 
        onClick={handleSubmit} 
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Memproses...' : 'Lanjut ke Pembayaran'}
      </Button>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/app/parent/tutor/ src/components/booking/
git commit -m "feat: add booking flow"
```

---

## Phase 5: Payment Integration (Midtrans)

### Task 10: Setup Midtrans Payment

**Files:**
- Create: `src/app/parent/payment/[id]/page.tsx`
- Create: `src/app/api/payments/create/route.ts`
- Create: `src/app/api/payments/webhook/route.ts`

**Step 1: Create Midtrans utility**

```typescript
// src/lib/midtrans.ts
import midtransClient from '@midtrans/midtrans-node-client';

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

export { snap };
```

**Step 2: Create payment creation API**

```typescript
// src/app/api/payments/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { snap } from '@/lib/midtrans';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const { bookingId } = await request.json();

  // Get booking details
  const { data: booking } = await supabaseServer
    .from('bookings')
    .select('*, parent:profiles!parent_id(*), tutor:profiles!tutor_id(*)')
    .eq('id', bookingId)
    .single();

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  // Create Midtrans transaction
  const orderId = `LESGO-${bookingId}-${Date.now()}`;
  
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: booking.total_amount,
    },
    customer_details: {
      first_name: booking.parent.name,
      email: booking.parent.email,
      phone: booking.parent.phone,
    },
    item_details: [
      {
        id: bookingId,
        price: booking.total_amount,
        quantity: 1,
        name: `Les ${booking.subject} - ${booking.tutor.name}`,
      },
    ],
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    
    // Save payment record
    await supabaseServer.from('payments').insert({
      booking_id: bookingId,
      midtrans_order_id: orderId,
      amount: booking.total_amount,
      status: 'pending',
    });

    return NextResponse.json({ 
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Payment creation failed' }, { status: 500 });
  }
}
```

**Step 3: Create webhook handler**

```typescript
// src/app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const { order_id, transaction_status, payment_type } = body;

  // Find payment by order_id
  const { data: payment } = await supabaseServer
    .from('payments')
    .select('*, booking:bookings(*)')
    .eq('midtrans_order_id', order_id)
    .single();

  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  // Update payment status
  let status: string;
  if (transaction_status === 'capture' || transaction_status === 'settlement') {
    status = 'success';
  } else if (transaction_status === 'deny' || transaction_status === 'cancel') {
    status = 'failed';
  } else if (transaction_status === 'expire') {
    status = 'expired';
  } else {
    status = 'pending';
  }

  await supabaseServer
    .from('payments')
    .update({
      status,
      payment_type,
      paid_at: status === 'success' ? new Date().toISOString() : null,
    })
    .eq('id', payment.id);

  // If successful, update booking status
  if (status === 'success') {
    await supabaseServer
      .from('bookings')
      .update({ status: 'paid' })
      .eq('id', payment.booking_id);

    // Add to tutor wallet
    await supabaseServer.rpc('add_tutor_earning', {
      p_tutor_id: payment.booking.tutor_id,
      p_amount: payment.booking.tutor_earnings,
      p_booking_id: payment.booking_id,
    });
  }

  return NextResponse.json({ success: true });
}
```

**Step 4: Create payment page**

```tsx
// src/app/parent/payment/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function PaymentPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [snapToken, setSnapToken] = useState('');

  useEffect(() => {
    createPayment();
  }, []);

  const createPayment = async () => {
    const response = await fetch('/api/payments/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: params.id }),
    });
    const data = await response.json();
    setSnapToken(data.token);
    setLoading(false);
  };

  const pay = () => {
    if (typeof window !== 'undefined' && (window as any).snap) {
      (window as any).snap.pay(snapToken, {
        onSuccess: () => {
          window.location.href = '/parent/bookings';
        },
        onPending: () => {
          alert('Menunggu pembayaran...');
        },
        onError: () => {
          alert('Pembayaran gagal');
        },
        onClose: () => {
          console.log('Payment popup closed');
        },
      });
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 text-center space-y-6">
      <h1 className="text-2xl font-bold">Pembayaran</h1>
      
      {loading ? (
        <p>Memuat...</p>
      ) : (
        <>
          <p>Silakan lanjutkan pembayaran Anda</p>
          <Button onClick={pay} className="w-full">
            Bayar Sekarang
          </Button>
        </>
      )}
      
      {/* Load Midtrans Snap.js */}
      <script 
        src={`https://app.sandbox.midtrans.com/snap/snap.js`} 
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
      />
    </div>
  );
}
```

**Step 5: Commit**

```bash
git add src/app/parent/payment/ src/app/api/payments/ src/lib/midtrans.ts
git commit -m "feat: add Midtrans payment integration"
```

---

## Phase 6: Tutor Dashboard

### Task 11: Create Tutor Dashboard

**Files:**
- Create: `src/app/tutor/dashboard/page.tsx`
- Create: `src/components/tutor/BookingRequests.tsx`
- Create: `src/components/tutor/EarningsCard.tsx`

**Step 1: Create tutor dashboard page**

```tsx
// src/app/tutor/dashboard/page.tsx
import { supabaseServer } from '@/lib/supabase-server';
import { BookingRequests } from '@/components/tutor/BookingRequests';
import { EarningsCard } from '@/components/tutor/EarningsCard';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function TutorDashboard() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login');
  }

  const { data: bookings } = await supabaseServer
    .from('bookings')
    .select('*, parent:profiles!parent_id(*)')
    .eq('tutor_id', session.user.id)
    .order('created_at', { ascending: false });

  const { data: wallet } = await supabaseServer
    .from('tutor_wallets')
    .select('*')
    .eq('tutor_id', session.user.id)
    .single();

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Guru</h1>
      
      <EarningsCard 
        balance={wallet?.balance || 0} 
        totalEarned={wallet?.total_earned || 0}
      />
      
      <div>
        <h2 className="font-semibold mb-4">Permintaan Booking</h2>
        <BookingRequests bookings={bookings || []} />
      </div>
    </div>
  );
}
```

**Step 2: Create EarningsCard**

```tsx
// src/components/tutor/EarningsCard.tsx
import { Wallet, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EarningsCardProps {
  balance: number;
  totalEarned: number;
}

export function EarningsCard({ balance, totalEarned }: EarningsCardProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Saat Ini</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Rp {balance.toLocaleString()}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Penghasilan</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Rp {totalEarned.toLocaleString()}</div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 3: Create BookingRequests**

```tsx
// src/components/tutor/BookingRequests.tsx
'use client';

import { Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface BookingRequestsProps {
  bookings: Booking[];
}

export function BookingRequests({ bookings }: BookingRequestsProps) {
  const updateStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (error) {
      alert(error.message);
    } else {
      window.location.reload();
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending_payment: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-blue-100 text-blue-700',
      confirmed: 'bg-green-100 text-green-700',
      in_progress: 'bg-purple-100 text-purple-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
      declined: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      pending_payment: 'Menunggu Pembayaran',
      paid: 'Dibayar - Konfirmasi',
      confirmed: 'Dikonfirmasi',
      in_progress: 'Sedang Berlangsung',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
      declined: 'Ditolak',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (bookings.length === 0) {
    return <p className="text-gray-500">Belum ada booking</p>;
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{booking.subject}</h3>
              <p className="text-sm text-gray-500">{booking.parent?.name}</p>
              <p className="text-sm">
                {format(new Date(booking.session_date), 'EEEE, d MMMM yyyy', { locale: id })}
                {' '}•{' '}
                {booking.session_time.slice(0, 5)}
              </p>
              <p className="text-sm text-gray-500">{booking.address}</p>
            </div>
            {getStatusBadge(booking.status)}
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <span className="font-bold">Rp {booking.tutor_earnings.toLocaleString()}</span>
              <span className="text-sm text-gray-500"> ({booking.duration_hours} jam)</span>
            </div>
            
            {booking.status === 'paid' && (
              <div className="space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => updateStatus(booking.id, 'declined')}
                >
                  Tolak
                </Button>
                <Button 
                  size="sm"
                  onClick={() => updateStatus(booking.id, 'confirmed')}
                >
                  Terima
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add src/app/tutor/dashboard/ src/components/tutor/
git commit -m "feat: add tutor dashboard"
```

---

## Phase 7: Final Polish

### Task 12: Add PWA Support

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `public/manifest.json`
- Create: `public/sw.js`

**Step 1: Update layout with PWA meta tags**

```tsx
// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LesGo - Cari Guru Les Private',
  description: 'Platform jasa les private terdekat',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LesGo',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
```

**Step 2: Create manifest.json**

```json
{
  "name": "LesGo - Guru Les Private",
  "short_name": "LesGo",
  "description": "Cari guru les private terdekat",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Step 3: Commit**

```bash
git add src/app/layout.tsx public/manifest.json public/sw.js
git commit -m "feat: add PWA support"
```

---

## Summary

### MVP Features Implemented:
1. ✅ Auth (OTP/Email) with role selection
2. ✅ Tutor search with geospatial query
3. ✅ Booking system with commission calculation
4. ✅ Midtrans payment integration
5. ✅ Tutor dashboard with booking management
6. ✅ PWA support

### Next Steps (Post-MVP):
- Real-time notifications (Supabase Realtime)
- In-app chat between parent & tutor
- Review & rating system completion
- Withdrawal system for tutors
- Admin dashboard for verification

---

**Plan complete and saved to `docs/plans/2026-02-16-lesgo-implementation.md`.**

## Execution Options:

**1. Subagent-Driven (this session)** — Saya dispatch fresh subagent per task, review tiap task, fast iteration

**2. Parallel Session (separate)** — Buka session baru dengan executing-plans, batch execution dengan checkpoints

**Which approach?**
