# Wilayah Hierarchical Location Implementation Status

## Summary

The hierarchical location picker feature has been fully implemented. This replaces the free-text location input with a structured Indonesian region selector (Province → City/Regency → District → Village).

## What Has Been Implemented

### 1. Database Schema (✅ Complete)
- **File**: `supabase/migrations/20250216000001_create_wilayah_tables.sql`
- Creates 4 tables: `provinces`, `cities`, `districts`, `villages`
- Includes indexes and RLS policies

### 2. Tutor Profile Location Fields (✅ Complete)
- **File**: `supabase/migrations/20250216000002_add_location_to_tutor_profiles.sql`
- Adds `province_id`, `city_id`, `district_id`, `village_id` to `tutor_profiles`
- Creates indexes for efficient searching

### 3. Data Import Script (✅ Complete)
- **File**: `scripts/import-wilayah.ts`
- Parses `wilayah_raw.sql` from cahyadsn/wilayah
- Inserts ~34 provinces, ~514 cities, ~7,234 districts, ~74,754 villages
- **NPM Script**: `npm run import:wilayah`

### 4. API Routes (✅ Complete)
- **Files**: `src/app/api/wilayah/*/route.ts`
  - `provinces/route.ts` - List all provinces
  - `cities/route.ts` - List cities by province
  - `districts/route.ts` - List districts by city
  - `villages/route.ts` - List villages by district

### 5. Types (✅ Complete)
- **File**: `src/types/wilayah.ts`
- TypeScript interfaces for Province, City, District, Village, SelectedLocation

### 6. LocationPicker Component (✅ Complete)
- **File**: `src/components/search/WilayahLocationPicker.tsx`
- Cascading dropdowns using shadcn/ui Select
- Loads children on-demand via API calls
- Shows loading states and selected summary

### 7. Search Page Integration (✅ Complete)
- **File**: `src/app/parent/search/page.tsx`
- Uses WilayahLocationPicker for location selection
- Shows expanded search indicator when searching district level

### 8. Search API (✅ Complete)
- **File**: `src/app/api/tutors/search/route.ts`
- Tiered search: Village first, then expands to District if no results
- Returns `expanded` flag to indicate when district-level search was used

### 9. Seed Data (✅ Complete)
- **File**: `scripts/seed-tutors.ts`
- 12 sample tutors with realistic Jakarta location codes
- Includes wallet creation for each tutor

## What Needs To Be Done (Deployment Steps)

### Step 1: Apply Database Migrations

Option A - Using Supabase Dashboard:
1. Go to Supabase Dashboard → SQL Editor
2. Run the contents of:
   - `supabase/migrations/20250216000001_create_wilayah_tables.sql`
   - `supabase/migrations/20250216000002_add_location_to_tutor_profiles.sql`

Option B - Using Supabase CLI:
```bash
supabase db push
```

### Step 2: Import Wilayah Data

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

### Step 3: Seed Tutors with Location Data

```bash
npm run seed
```

This will create 12 sample tutors with location codes across Jakarta.

### Step 4: Test the Feature

1. Start the dev server: `npm run dev`
2. Open http://localhost:3000/parent/search
3. Select subject: "Matematika"
4. Select location: DKI Jakarta → Kota Jakarta Pusat → Gambir → Gambir
5. Click "Cari Guru"
6. Verify tutors are found

## How the Search Works

1. **Village-Level Search**: First searches for tutors in the exact same village (kelurahan/desa)
2. **District Expansion**: If no tutors found, automatically expands to search the entire district (kecamatan)
3. **UI Indicator**: Shows "Dalam kecamatan yang sama" when expanded search is used
4. **No Tutors Message**: Shows helpful message when no tutors available

## Key Files

| Component | File |
|-----------|------|
| Database Migrations | `supabase/migrations/20250216000001_create_wilayah_tables.sql` |
| Tutor Profile Migration | `supabase/migrations/20250216000002_add_location_to_tutor_profiles.sql` |
| Import Script | `scripts/import-wilayah.ts` |
| Seed Script | `scripts/seed-tutors.ts` |
| Wilayah Types | `src/types/wilayah.ts` |
| Location Picker | `src/components/search/WilayahLocationPicker.tsx` |
| Search Page | `src/app/parent/search/page.tsx` |
| Search API | `src/app/api/tutors/search/route.ts` |
| Province API | `src/app/api/wilayah/provinces/route.ts` |
| City API | `src/app/api/wilayah/cities/route.ts` |
| District API | `src/app/api/wilayah/districts/route.ts` |
| Village API | `src/app/api/wilayah/villages/route.ts` |

## Build Status

✅ Build passes successfully
```
npm run build
```

All components compile without errors.
