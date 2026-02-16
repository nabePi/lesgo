# Wilayah Hierarchical Location Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace free-text location input with hierarchical Indonesian region picker (Province → City → District → Village) and implement proximity-based tutor search.

**Architecture:** Create normalized wilayah tables in Supabase, build cascading dropdown UI with shadcn/ui Select components, and implement tiered search algorithm that finds tutors in same village first, then expands to district level.

**Tech Stack:** Next.js 16, Supabase PostgreSQL, TypeScript, shadcn/ui, React Hook Form

---

## Prerequisites

- [ ] Clone cahyadsn/wilayah repository data
- [ ] Understand the kode wilayah format (2-5-8-13 digit hierarchy)

---

## Task 1: Create Database Schema for Wilayah Tables

**Files:**
- Create: `supabase/migrations/20250216000001_create_wilayah_tables.sql`

**Step 1: Write the SQL migration**

```sql
-- Provinces (Level 1) - 2 digits
CREATE TABLE provinces (
    id CHAR(2) PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Cities/Regencies (Level 2) - 5 digits (XX.XX)
CREATE TABLE cities (
    id CHAR(5) PRIMARY KEY,
    province_id CHAR(2) REFERENCES provinces(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('city', 'regency'))
);

-- Districts (Kecamatan) (Level 3) - 8 digits (XX.XX.XX)
CREATE TABLE districts (
    id CHAR(8) PRIMARY KEY,
    city_id CHAR(5) REFERENCES cities(id),
    name VARCHAR(255) NOT NULL
);

-- Villages (Desa/Kelurahan) (Level 4) - 13 digits (XX.XX.XX.XXXX)
CREATE TABLE villages (
    id CHAR(13) PRIMARY KEY,
    district_id CHAR(8) REFERENCES districts(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('urban', 'rural', 'customary'))
);

-- Indexes for performance
CREATE INDEX idx_cities_province ON cities(province_id);
CREATE INDEX idx_districts_city ON districts(city_id);
CREATE INDEX idx_villages_district ON villages(district_id);

-- Enable RLS
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE villages ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read" ON provinces FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON cities FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON districts FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON villages FOR SELECT USING (true);
```

**Step 2: Apply migration to Supabase**

Run via Supabase Dashboard SQL Editor or:
```bash
supabase db push
```

**Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: create wilayah tables for hierarchical location"
```

---

## Task 2: Create Wilayah Data Import Script

**Files:**
- Create: `scripts/import-wilayah.ts`

**Step 1: Download wilayah.sql from GitHub**

```bash
curl -L https://raw.githubusercontent.com/cahyadsn/wilayah/master/db/wilayah.sql -o scripts/wilayah_raw.sql
```

**Step 2: Write import script**

```typescript
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as readline from 'readline';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface WilayahRow {
  kode: string;
  nama: string;
}

async function importWilayah() {
  console.log('Starting wilayah import...\n');

  const fileStream = fs.createReadStream('scripts/wilayah_raw.sql');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const provinces: { id: string; name: string }[] = [];
  const cities: { id: string; province_id: string; name: string; type: string }[] = [];
  const districts: { id: string; city_id: string; name: string }[] = [];
  const villages: { id: string; district_id: string; name: string; type: string }[] = [];

  for await (const line of rl) {
    const match = line.match(/INSERT INTO `wilayah` VALUES \((.+)\);/);
    if (match) {
      const values = match[1].split('),(').map(v => {
        const clean = v.replace(/'/g, '');
        const [kode, nama] = clean.split(',');
        return { kode, nama };
      });

      for (const row of values) {
        const len = row.kode.length;

        if (len === 2) {
          provinces.push({ id: row.kode, name: row.nama });
        } else if (len === 5) {
          const cityCode = parseInt(row.kode.slice(2, 4));
          const type = cityCode >= 71 ? 'city' : 'regency';
          cities.push({
            id: row.kode,
            province_id: row.kode.slice(0, 2),
            name: row.nama,
            type
          });
        } else if (len === 8) {
          districts.push({
            id: row.kode,
            city_id: row.kode.slice(0, 5),
            name: row.nama
          });
        } else if (len === 13) {
          const villageTypeChar = row.kode[8];
          const type = villageTypeChar === '1' ? 'urban' :
                      villageTypeChar === '2' ? 'rural' : 'customary';
          villages.push({
            id: row.kode,
            district_id: row.kode.slice(0, 8),
            name: row.nama,
            type
          });
        }
      }
    }
  }

  console.log(`Parsed ${provinces.length} provinces`);
  console.log(`Parsed ${cities.length} cities`);
  console.log(`Parsed ${districts.length} districts`);
  console.log(`Parsed ${villages.length} villages\n`);

  // Batch insert with chunking
  const chunkSize = 1000;

  console.log('Inserting provinces...');
  await supabase.from('provinces').insert(provinces);

  console.log('Inserting cities...');
  for (let i = 0; i < cities.length; i += chunkSize) {
    const chunk = cities.slice(i, i + chunkSize);
    await supabase.from('cities').insert(chunk);
    process.stdout.write(`  ${Math.min(i + chunkSize, cities.length)}/${cities.length}\r`);
  }
  console.log('');

  console.log('Inserting districts...');
  for (let i = 0; i < districts.length; i += chunkSize) {
    const chunk = districts.slice(i, i + chunkSize);
    await supabase.from('districts').insert(chunk);
    process.stdout.write(`  ${Math.min(i + chunkSize, districts.length)}/${districts.length}\r`);
  }
  console.log('');

  console.log('Inserting villages...');
  for (let i = 0; i < villages.length; i += chunkSize) {
    const chunk = villages.slice(i, i + chunkSize);
    await supabase.from('villages').insert(chunk);
    process.stdout.write(`  ${Math.min(i + chunkSize, villages.length)}/${villages.length}\r`);
  }
  console.log('');

  console.log('\nImport completed!');
}

importWilayah().catch(console.error);
```

**Step 3: Add npm script**

Edit `package.json`:
```json
"scripts": {
  ...
  "import:wilayah": "npx tsx scripts/import-wilayah.ts"
}
```

**Step 4: Run import**

```bash
npm run import:wilayah
```

Expected output:
```
Parsed 34 provinces
Parsed 514 cities
Parsed 7234 districts
Parsed 74754 villages

Import completed!
```

**Step 5: Commit**

```bash
git add scripts/import-wilayah.ts package.json
git commit -m "feat: add wilayah data import script"
```

---

## Task 3: Create API Routes for Cascading Dropdowns

**Files:**
- Create: `src/app/api/wilayah/provinces/route.ts`
- Create: `src/app/api/wilayah/cities/route.ts`
- Create: `src/app/api/wilayah/districts/route.ts`
- Create: `src/app/api/wilayah/villages/route.ts`

**Step 1: Create provinces API**

```typescript
// src/app/api/wilayah/provinces/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  const { data, error } = await supabaseServer
    .from('provinces')
    .select('*')
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

**Step 2: Create cities API**

```typescript
// src/app/api/wilayah/cities/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provinceId = searchParams.get('provinceId');

  if (!provinceId) {
    return NextResponse.json(
      { error: 'provinceId is required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from('cities')
    .select('*')
    .eq('province_id', provinceId)
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

**Step 3: Create districts API**

```typescript
// src/app/api/wilayah/districts/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityId = searchParams.get('cityId');

  if (!cityId) {
    return NextResponse.json(
      { error: 'cityId is required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from('districts')
    .select('*')
    .eq('city_id', cityId)
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

**Step 4: Create villages API**

```typescript
// src/app/api/wilayah/villages/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const districtId = searchParams.get('districtId');

  if (!districtId) {
    return NextResponse.json(
      { error: 'districtId is required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from('villages')
    .select('*')
    .eq('district_id', districtId)
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

**Step 5: Test APIs**

```bash
curl http://localhost:3000/api/wilayah/provinces | head -20
```

Expected: JSON array of 34 provinces

**Step 6: Commit**

```bash
git add src/app/api/wilayah/
git commit -m "feat: add wilayah API routes for cascading dropdowns"
```

---

## Task 4: Create Hierarchical LocationPicker Component

**Files:**
- Create: `src/components/search/WilayahLocationPicker.tsx`

**Step 1: Create types**

```typescript
// src/types/wilayah.ts
export interface Province {
  id: string;
  name: string;
}

export interface City {
  id: string;
  province_id: string;
  name: string;
  type: 'city' | 'regency';
}

export interface District {
  id: string;
  city_id: string;
  name: string;
}

export interface Village {
  id: string;
  district_id: string;
  name: string;
  type: 'urban' | 'rural' | 'customary';
}

export interface SelectedLocation {
  province?: Province;
  city?: City;
  district?: District;
  village?: Village;
}
```

**Step 2: Create the component**

```typescript
// src/components/search/WilayahLocationPicker.tsx
'use client';

import { useState, useEffect } from 'react';
import { MapPin, Loader2, Check, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Province, City, District, Village, SelectedLocation } from '@/types/wilayah';

interface WilayahLocationPickerProps {
  onChange: (location: SelectedLocation) => void;
  value?: SelectedLocation;
}

export function WilayahLocationPicker({ onChange, value }: WilayahLocationPickerProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<Province | undefined>(value?.province);
  const [selectedCity, setSelectedCity] = useState<City | undefined>(value?.city);
  const [selectedDistrict, setSelectedDistrict] = useState<District | undefined>(value?.district);
  const [selectedVillage, setSelectedVillage] = useState<Village | undefined>(value?.village);

  const [loading, setLoading] = useState({
    provinces: false,
    cities: false,
    districts: false,
    villages: false,
  });

  // Load provinces on mount
  useEffect(() => {
    setLoading(prev => ({ ...prev, provinces: true }));
    fetch('/api/wilayah/provinces')
      .then(res => res.json())
      .then(data => {
        setProvinces(data);
        setLoading(prev => ({ ...prev, provinces: false }));
      });
  }, []);

  // Load cities when province changes
  useEffect(() => {
    if (!selectedProvince) {
      setCities([]);
      return;
    }
    setLoading(prev => ({ ...prev, cities: true }));
    fetch(`/api/wilayah/cities?provinceId=${selectedProvince.id}`)
      .then(res => res.json())
      .then(data => {
        setCities(data);
        setLoading(prev => ({ ...prev, cities: false }));
      });
  }, [selectedProvince]);

  // Load districts when city changes
  useEffect(() => {
    if (!selectedCity) {
      setDistricts([]);
      return;
    }
    setLoading(prev => ({ ...prev, districts: true }));
    fetch(`/api/wilayah/districts?cityId=${selectedCity.id}`)
      .then(res => res.json())
      .then(data => {
        setDistricts(data);
        setLoading(prev => ({ ...prev, districts: false }));
      });
  }, [selectedCity]);

  // Load villages when district changes
  useEffect(() => {
    if (!selectedDistrict) {
      setVillages([]);
      return;
    }
    setLoading(prev => ({ ...prev, villages: true }));
    fetch(`/api/wilayah/villages?districtId=${selectedDistrict.id}`)
      .then(res => res.json())
      .then(data => {
        setVillages(data);
        setLoading(prev => ({ ...prev, villages: false }));
      });
  }, [selectedDistrict]);

  // Notify parent of changes
  useEffect(() => {
    onChange({
      province: selectedProvince,
      city: selectedCity,
      district: selectedDistrict,
      village: selectedVillage,
    });
  }, [selectedProvince, selectedCity, selectedDistrict, selectedVillage]);

  const handleProvinceChange = (value: string) => {
    const province = provinces.find(p => p.id === value);
    setSelectedProvince(province);
    setSelectedCity(undefined);
    setSelectedDistrict(undefined);
    setSelectedVillage(undefined);
  };

  const handleCityChange = (value: string) => {
    const city = cities.find(c => c.id === value);
    setSelectedCity(city);
    setSelectedDistrict(undefined);
    setSelectedVillage(undefined);
  };

  const handleDistrictChange = (value: string) => {
    const district = districts.find(d => d.id === value);
    setSelectedDistrict(district);
    setSelectedVillage(undefined);
  };

  const handleVillageChange = (value: string) => {
    const village = villages.find(v => v.id === value);
    setSelectedVillage(village);
  };

  const isComplete = selectedProvince && selectedCity && selectedDistrict && selectedVillage;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Navigation className="w-5 h-5 text-indigo-600" />
        <label className="font-semibold text-slate-900">Lokasi</label>
      </div>

      {/* Province */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Provinsi
        </label>
        <Select
          value={selectedProvince?.id}
          onValueChange={handleProvinceChange}
          disabled={loading.provinces}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder={loading.provinces ? 'Memuat...' : 'Pilih Provinsi'} />
          </SelectTrigger>
          <SelectContent>
            {provinces.map(province => (
              <SelectItem key={province.id} value={province.id}>
                {province.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Kota/Kabupaten
        </label>
        <Select
          value={selectedCity?.id}
          onValueChange={handleCityChange}
          disabled={!selectedProvince || loading.cities}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder={
              !selectedProvince ? 'Pilih provinsi dulu' :
              loading.cities ? 'Memuat...' :
              'Pilih Kota/Kabupaten'
            } />
          </SelectTrigger>
          <SelectContent>
            {cities.map(city => (
              <SelectItem key={city.id} value={city.id}>
                {city.type === 'city' ? 'Kota ' : 'Kabupaten '}{city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* District */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Kecamatan
        </label>
        <Select
          value={selectedDistrict?.id}
          onValueChange={handleDistrictChange}
          disabled={!selectedCity || loading.districts}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder={
              !selectedCity ? 'Pilih kota dulu' :
              loading.districts ? 'Memuat...' :
              'Pilih Kecamatan'
            } />
          </SelectTrigger>
          <SelectContent>
            {districts.map(district => (
              <SelectItem key={district.id} value={district.id}>
                {district.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Village */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Kelurahan/Desa
        </label>
        <Select
          value={selectedVillage?.id}
          onValueChange={handleVillageChange}
          disabled={!selectedDistrict || loading.villages}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder={
              !selectedDistrict ? 'Pilih kecamatan dulu' :
              loading.villages ? 'Memuat...' :
              'Pilih Kelurahan/Desa'
            } />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {villages.map(village => (
              <SelectItem key={village.id} value={village.id}>
                {village.type === 'urban' ? 'Kel. ' : 'Desa '}{village.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selected Summary */}
      {isComplete && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-900">Lokasi lengkap dipilih</p>
            <p className="text-sm text-emerald-700">
              {selectedVillage?.name}, {selectedDistrict?.name}
            </p>
            <p className="text-xs text-emerald-600">
              {selectedCity?.type === 'city' ? 'Kota ' : 'Kabupaten '}{selectedCity?.name}, {selectedProvince?.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/search/WilayahLocationPicker.tsx src/types/wilayah.ts
git commit -m "feat: add WilayahLocationPicker component with cascading dropdowns"
```

---

## Task 5: Update Tutor Profiles Table with Location Fields

**Files:**
- Create: `supabase/migrations/20250216000002_add_location_to_tutor_profiles.sql`

**Step 1: Write migration**

```sql
-- Add location hierarchy fields to tutor_profiles
ALTER TABLE tutor_profiles
ADD COLUMN province_id CHAR(2) REFERENCES provinces(id),
ADD COLUMN city_id CHAR(5) REFERENCES cities(id),
ADD COLUMN district_id CHAR(8) REFERENCES districts(id),
ADD COLUMN village_id CHAR(13) REFERENCES villages(id);

-- Create indexes for efficient searching
CREATE INDEX idx_tutor_profiles_village ON tutor_profiles(village_id);
CREATE INDEX idx_tutor_profiles_district ON tutor_profiles(district_id);
CREATE INDEX idx_tutor_profiles_city ON tutor_profiles(city_id);
CREATE INDEX idx_tutor_profiles_province ON tutor_profiles(province_id);

-- Create composite index for common search pattern
CREATE INDEX idx_tutor_profiles_location_search ON tutor_profiles(village_id, district_id, is_active, is_verified);
```

**Step 2: Apply migration**

```bash
supabase db push
```

**Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: add location hierarchy fields to tutor_profiles"
```

---

## Task 6: Update Search Page to Use New Location Picker

**Files:**
- Modify: `src/app/parent/search/page.tsx`

**Step 1: Update imports and types**

```typescript
import { WilayahLocationPicker } from '@/components/search/WilayahLocationPicker';
import type { SelectedLocation } from '@/types/wilayah';
```

**Step 2: Update state and search logic**

Replace the location state:
```typescript
const [location, setLocation] = useState<SelectedLocation | null>(null);

const searchTutors = async () => {
  if (!subject || !location?.village) return;

  setLoading(true);
  setSearched(true);
  try {
    const response = await fetch(
      `/api/tutors/search?subject=${encodeURIComponent(subject)}&villageId=${location.village.id}&districtId=${location.district?.id}`
    );
    const data = await response.json();
    setTutors(data.tutors || []);
  } catch (error) {
    console.error('Search error:', error);
  } finally {
    setLoading(false);
  }
};
```

**Step 3: Replace LocationPicker with WilayahLocationPicker**

```tsx
<WilayahLocationPicker
  onChange={setLocation}
  value={location || undefined}
/>
```

**Step 4: Update button disabled state**

```typescript
disabled={loading || !subject || !location?.village}
```

**Step 5: Commit**

```bash
git add src/app/parent/search/page.tsx
git commit -m "feat: integrate WilayahLocationPicker into search page"
```

---

## Task 7: Update Search API for Hierarchical Search

**Files:**
- Modify: `src/app/api/tutors/search/route.ts`

**Step 1: Update search logic**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subject = searchParams.get('subject');
  const villageId = searchParams.get('villageId');
  const districtId = searchParams.get('districtId');

  if (!subject || !villageId) {
    return NextResponse.json(
      { error: 'subject and villageId are required' },
      { status: 400 }
    );
  }

  // Step 1: Search for tutors in the same village
  let { data: tutors, error } = await supabaseServer
    .from('tutor_profiles')
    .select('*, user:profiles(*)')
    .eq('village_id', villageId)
    .eq('is_active', true)
    .contains('subjects', [subject])
    .order('rating', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Step 2: If no tutors found in village, expand to district
  if ((!tutors || tutors.length === 0) && districtId) {
    const { data: districtTutors, error: districtError } = await supabaseServer
      .from('tutor_profiles')
      .select('*, user:profiles(*)')
      .eq('district_id', districtId)
      .eq('is_active', true)
      .contains('subjects', [subject])
      .order('rating', { ascending: false });

    if (districtError) {
      return NextResponse.json({ error: districtError.message }, { status: 500 });
    }

    tutors = districtTutors || [];

    // Mark these as "nearby" (expanded search)
    if (tutors.length > 0) {
      tutors = tutors.map(t => ({ ...t, isExpandedSearch: true }));
    }
  }

  return NextResponse.json({
    tutors: tutors || [],
    expanded: tutors?.some((t: any) => t.isExpandedSearch) || false
  });
}
```

**Step 2: Commit**

```bash
git add src/app/api/tutors/search/route.ts
git commit -m "feat: implement hierarchical search (village first, then district)"
```

---

## Task 8: Update Tutor Registration/Profile with Location

**Files:**
- Modify: `src/app/register/page.tsx` (or tutor profile form)

**Step 1: Add WilayahLocationPicker to registration form**

```typescript
import { WilayahLocationPicker } from '@/components/search/WilayahLocationPicker';
import type { SelectedLocation } from '@/types/wilayah';

// In form state
const [location, setLocation] = useState<SelectedLocation | null>(null);

// In submit handler
const onSubmit = async (data: any) => {
  await supabase.from('tutor_profiles').insert({
    ...data,
    province_id: location?.province?.id,
    city_id: location?.city?.id,
    district_id: location?.district?.id,
    village_id: location?.village?.id,
  });
};
```

**Step 2: Commit**

```bash
git add src/app/register/page.tsx
git commit -m "feat: add hierarchical location to tutor registration"
```

---

## Task 9: Update Seed Data with Location Codes

**Files:**
- Modify: `scripts/seed-tutors.ts`

**Step 1: Add location codes to sample tutors**

```typescript
const sampleTutors = [
  {
    email: 'budi.santoso@example.com',
    name: 'Budi Santoso',
    // ... other fields
    // Jakarta Pusat - Gambir - Gambir
    province_id: '31',
    city_id: '31.71',
    district_id: '31.71.01',
    village_id: '31.71.01.1001',
  },
  // ... add location codes for other tutors
];
```

**Step 2: Update insert logic**

```typescript
await supabase
  .from('tutor_profiles')
  .upsert({
    user_id: userId,
    bio: tutor.bio,
    subjects: tutor.subjects,
    hourly_rate: tutor.hourly_rate,
    is_verified: tutor.is_verified,
    rating: tutor.rating,
    total_reviews: tutor.total_reviews,
    province_id: tutor.province_id,
    city_id: tutor.city_id,
    district_id: tutor.district_id,
    village_id: tutor.village_id,
    is_active: true,
  }, { onConflict: 'user_id' });
```

**Step 3: Commit**

```bash
git add scripts/seed-tutors.ts
git commit -m "feat: add location codes to seed data"
```

---

## Task 10: Update Search Results UI

**Files:**
- Modify: `src/app/parent/search/page.tsx`

**Step 1: Show expanded search indicator**

```tsx
{tutors.length > 0 && (
  <span className="text-sm text-slate-500">
    {expanded ? 'Dalam kecamatan yang sama' : 'Dalam kelurahan yang sama'}
  </span>
)}
```

**Step 2: Show "no tutors in village" message**

```tsx
{tutors.length === 0 && expanded && (
  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
    <p className="text-sm text-amber-800">
      Tidak ada guru di kelurahan Anda. Menampilkan guru di kecamatan terdekat.
    </p>
  </div>
)}
```

**Step 3: Commit**

```bash
git add src/app/parent/search/page.tsx
git commit -m "feat: add expanded search indicator in UI"
```

---

## Task 11: Test End-to-End

**Files:**
- All modified files

**Step 1: Run build**

```bash
npm run build
```

**Step 2: Test search flow**

1. Open http://localhost:3000/parent/search
2. Select subject: Matematika
3. Select location: DKI Jakarta → Kota Jakarta Pusat → Gambir → Gambir
4. Click Cari Guru
5. Verify tutors are found

**Step 3: Test expanded search**

1. Search for subject with no tutors in specific village
2. Verify search expands to district level
3. Verify "nearby" indicator is shown

**Step 4: Commit any fixes**

```bash
git commit -m "fix: address review feedback"
```

---

## Summary

This implementation:

1. **Creates 4 wilayah tables** (provinces, cities, districts, villages) with ~74k villages
2. **Builds cascading dropdown UI** that loads children on-demand
3. **Implements tiered search** (village → district expansion)
4. **Stores location hierarchy** in tutor_profiles for efficient querying
5. **Updates seed data** with realistic Jakarta location codes

**Key Benefits:**
- Precise location matching (village level)
- Automatic expansion when no local tutors
- No travel waste - tutors are nearby
- Standard Indonesian government region codes

**Files Created:**
- `supabase/migrations/*_create_wilayah_tables.sql`
- `scripts/import-wilayah.ts`
- `src/app/api/wilayah/*/route.ts` (4 files)
- `src/components/search/WilayahLocationPicker.tsx`
- `src/types/wilayah.ts`

**Files Modified:**
- `src/app/parent/search/page.tsx`
- `src/app/api/tutors/search/route.ts`
- `scripts/seed-tutors.ts`
- `package.json`
