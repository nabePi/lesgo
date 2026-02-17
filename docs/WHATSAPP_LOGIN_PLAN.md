# WhatsApp Login Implementation Plan

> **Status:** Planned (Not Implemented)
> **Priority:** Medium
> **Created:** 2026-02-16

## Overview

This document outlines the implementation plan for WhatsApp-based authentication that allows users to:
1. Login using their WhatsApp number (OTP-based)
2. View their historical transaction/booking history
3. Link anonymous bookings to their account automatically

## Current State

The database schema already supports this feature:

- `bookings.parent_whatsapp` - stores phone number from booking form
- `bookings.parent_id` - nullable UUID (NULL for anonymous bookings)
- `profiles.phone` - unique phone number for authenticated users

## Implementation Steps

### Step 1: Database Migration

Run this SQL in Supabase Dashboard:

```sql
-- Function to link anonymous bookings to user when they sign up
CREATE OR REPLACE FUNCTION link_bookings_by_whatsapp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.bookings
  SET parent_id = NEW.id
  WHERE parent_whatsapp = NEW.phone
    AND parent_id IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-link bookings when profile is created
CREATE TRIGGER link_bookings_on_profile_create
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION link_bookings_by_whatsapp();

-- Also link when phone number is updated
CREATE OR REPLACE FUNCTION link_bookings_on_phone_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.phone IS DISTINCT FROM NEW.phone THEN
    UPDATE public.bookings
    SET parent_id = NEW.id
    WHERE parent_whatsapp = NEW.phone
      AND parent_id IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER link_bookings_on_phone_update
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION link_bookings_on_phone_update();
```

### Step 2: Supabase Configuration

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable **Phone** provider
3. Configure SMS/WhatsApp gateway:
   - Option A: Twilio (SMS)
   - Option B: MessageBird (WhatsApp)
   - Option C: Vonage (SMS)
   - Option D: Custom webhook with WhatsApp Business API

### Step 3: Frontend Implementation

#### Login Page (`/login`)

```typescript
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        channel: 'whatsapp' // or 'sms' for SMS
      }
    });
    if (!error) setStep('otp');
    setLoading(false);
  };

  const verifyOTP = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms'
    });

    if (data.user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (!profile) {
        // Create new profile
        await supabase.from('profiles').insert({
          id: data.user.id,
          name: 'User', // Get from form or use default
          phone: phone,
          email: `${phone}@placeholder.com`,
          role: 'parent'
        });
        // Historical bookings auto-linked by database trigger!
      }

      window.location.href = '/parent/history';
    }
    setLoading(false);
  };

  return (
    <div>
      {step === 'phone' ? (
        <div>
          <h1>Masuk dengan WhatsApp</h1>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08123456789"
          />
          <button onClick={sendOTP} disabled={loading}>
            Kirim Kode OTP
          </button>
        </div>
      ) : (
        <div>
          <h1>Masukkan Kode OTP</h1>
          <p>Kode dikirim ke {phone}</p>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
          />
          <button onClick={verifyOTP} disabled={loading}>
            Verifikasi
          </button>
        </div>
      )}
    </div>
  );
}
```

#### Transaction History Page (`/parent/history`)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function HistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    // Get user's phone
    const { data: profile } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', user.id)
      .single();

    // Fetch bookings - both linked and by phone match
    const { data } = await supabase
      .from('bookings')
      .select(`
        *,
        tutor:profiles!tutor_id(name, phone),
        payment:payments(status, paid_at)
      `)
      .or(`parent_id.eq.${user.id},parent_whatsapp.eq.${profile.phone}`)
      .order('created_at', { ascending: false });

    setBookings(data || []);
    setLoading(false);
  };

  return (
    <div>
      <h1>Riwayat Transaksi</h1>
      {bookings.map((booking) => (
        <div key={booking.id}>
          <p>Tutor: {booking.tutor.name}</p>
          <p>Mata Pelajaran: {booking.subject}</p>
          <p>Tanggal: {booking.session_date}</p>
          <p>Status: {booking.payment?.status || 'Pending'}</p>
        </div>
      ))}
    </div>
  );
}
```

## Data Flow

```
FIRST BOOKING (No Account)
├── User fills booking form with WhatsApp number
├── Booking saved: parent_whatsapp = "08123456789", parent_id = NULL
└── Booking visible in admin/tutor dashboard

FUTURE LOGIN WITH WHATSAPP
├── User enters WhatsApp number on login page
├── Supabase sends OTP via WhatsApp/SMS
├── User enters OTP and verifies
├── Supabase creates auth.users record
├── App creates profiles record with phone number
├── DATABASE TRIGGER fires:
│   └── UPDATE bookings SET parent_id = user.id
│       WHERE parent_whatsapp = "08123456789" AND parent_id IS NULL
└── All historical bookings now linked!

VIEWING HISTORY
└── Query: SELECT * FROM bookings
    WHERE parent_id = auth.uid()
    OR parent_whatsapp = user.phone
```

## Security Considerations

1. **Phone Number Format**: Normalize phone numbers (e.g., +628123456789) before storage
2. **Rate Limiting**: Implement rate limiting for OTP requests
3. **OTP Expiry**: Default Supabase OTP expires in 60 seconds
4. **RLS Policies**: Ensure users can only view their own bookings

## WhatsApp Business API Options

### Option A: Twilio (Recommended for Start)
- Cost: ~$0.02-0.05 per message
- Easy integration with Supabase
- SMS fallback available

### Option B: MessageBird
- Supports WhatsApp Business API
- Higher cost but better delivery rates

### Option C: Official WhatsApp Business API
- Requires Meta Business verification
- Best for high volume
- Complex setup

## Testing Checklist

- [ ] User can book without login
- [ ] WhatsApp OTP sent successfully
- [ ] OTP verification works
- [ ] Profile created on first login
- [ ] Historical bookings auto-linked
- [ ] User can view all past bookings
- [ ] RLS policies prevent unauthorized access

## Migration for Existing Bookings

If implementing after launch, link existing bookings:

```sql
-- Manual linking for existing users
UPDATE public.bookings b
SET parent_id = p.id
FROM public.profiles p
WHERE b.parent_whatsapp = p.phone
  AND b.parent_id IS NULL;
```

## Files to Create/Modify

### New Files:
- `src/app/login/page.tsx` - WhatsApp login page
- `src/app/parent/history/page.tsx` - Transaction history
- `src/components/auth/PhoneInput.tsx` - Phone input component

### Modified Files:
- `supabase/migrations/` - Add trigger functions
- `src/components/booking/BookingForm.tsx` - Already done
- `src/app/parent/search/page.tsx` - Add login button

## Notes

- Current schema already supports this feature
- No breaking changes required
- Can be implemented incrementally
- User experience: seamless linking of past bookings
