/**
 * Seed script for LesGo - Populate database with sample tutors
 *
 * Usage: npx tsx scripts/seed-tutors.ts
 */

import { config } from 'dotenv';
config(); // Load .env file

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please set:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample tutor data around Jakarta area with wilayah codes
// Province: DKI Jakarta (31)
const sampleTutors = [
  {
    email: 'budi.santoso@example.com',
    name: 'Budi Santoso',
    phone: '081234567001',
    bio: 'Guru matematika berpengalaman 10 tahun. Mengajar SD sampai SMA dengan metode yang mudah dipahami. Siswa saya rata-rata naik nilai 20-30 poin.',
    subjects: ['Matematika', 'Fisika'],
    hourly_rate: 75000,
    lat: -6.2088,
    lng: 106.8456,
    address: 'Jl. Sudirman No. 123, Jakarta Pusat',
    rating: 4.9,
    total_reviews: 28,
    is_verified: true,
    // Jakarta Pusat - Gambir - Gambir
    province_id: '31',
    city_id: '31.71',
    district_id: '31.71.01',
    village_id: '31.71.01.1001',
  },
  {
    email: 'siti.aminah@example.com',
    name: 'Siti Aminah',
    phone: '081234567002',
    bio: 'Lulusan S1 Bahasa Inggris Universitas Indonesia. Spesialis TOEFL dan conversation. Mengajar dengan pendekatan fun dan interactive.',
    subjects: ['Bahasa Inggris'],
    hourly_rate: 85000,
    lat: -6.2150,
    lng: 106.8500,
    address: 'Jl. Thamrin No. 45, Jakarta Pusat',
    rating: 4.8,
    total_reviews: 42,
    is_verified: true,
    // Jakarta Pusat - Menteng - Menteng
    province_id: '31',
    city_id: '31.71',
    district_id: '31.71.04',
    village_id: '31.71.04.1001',
  },
  {
    email: 'ahmad.fauzi@example.com',
    name: 'Ahmad Fauzi',
    phone: '081234567003',
    bio: 'Dokter hewan yang juga gemar mengajar biologi. Metode pengajaran dengan eksperimen praktis dan visualisasi yang menarik.',
    subjects: ['Biologi', 'Kimia'],
    hourly_rate: 90000,
    lat: -6.2200,
    lng: 106.8320,
    address: 'Jl. Palmerah No. 78, Jakarta Barat',
    rating: 4.7,
    total_reviews: 19,
    is_verified: true,
    // Jakarta Barat - Palmerah - Palmerah
    province_id: '31',
    city_id: '31.73',
    district_id: '31.73.05',
    village_id: '31.73.05.1001',
  },
  {
    email: 'dewi.kusuma@example.com',
    name: 'Dewi Kusuma',
    phone: '081234567004',
    bio: 'Guru SD kelas 3-6 semua mata pelajaran. Sabar dan menyukai anak-anak. Membantu siswa yang kesulitan membaca dan berhitung.',
    subjects: ['Matematika', 'Bahasa Indonesia', 'Calistung'],
    hourly_rate: 60000,
    lat: -6.1950,
    lng: 106.8230,
    address: 'Jl. Slipi No. 15, Jakarta Barat',
    rating: 4.9,
    total_reviews: 35,
    is_verified: true,
    // Jakarta Barat - Palmerah - Slipi
    province_id: '31',
    city_id: '31.73',
    district_id: '31.73.05',
    village_id: '31.73.05.1003',
  },
  {
    email: 'eko.prasetyo@example.com',
    name: 'Eko Prasetyo',
    phone: '081234567005',
    bio: 'Programmer profesional yang mengajar coding untuk anak dan dewasa. Bahasa: Python, JavaScript, HTML/CSS. Project-based learning.',
    subjects: ['Komputer'],
    hourly_rate: 120000,
    lat: -6.2300,
    lng: 106.8160,
    address: 'Jl. Kebon Jeruk No. 88, Jakarta Barat',
    rating: 4.8,
    total_reviews: 23,
    is_verified: true,
    // Jakarta Barat - Kebon Jeruk - Kebon Jeruk
    province_id: '31',
    city_id: '31.73',
    district_id: '31.73.03',
    village_id: '31.73.03.1001',
  },
  {
    email: 'rina.wulandari@example.com',
    name: 'Rina Wulandari',
    phone: '081234567006',
    bio: 'Guru IPS yang suka traveling. Mengajar sejarah dan geografi dengan cerita pengalaman pribadi. Membuat pelajaran jadi hidup.',
    subjects: ['Sejarah', 'Geografi', 'IPS'],
    hourly_rate: 70000,
    lat: -6.2000,
    lng: 106.8600,
    address: 'Jl. Kuningan No. 33, Jakarta Selatan',
    rating: 4.6,
    total_reviews: 15,
    is_verified: true,
    // Jakarta Selatan - Setiabudi - Kuningan
    province_id: '31',
    city_id: '31.74',
    district_id: '31.74.02',
    village_id: '31.74.02.1002',
  },
  {
    email: 'yusuf.maulana@example.com',
    name: 'Yusuf Maulana',
    phone: '081234567007',
    bio: 'Ustadz muda yang mengajar mengaji dan ilmu agama Islam. Metode Iqro dan tilawah. Sabar dengan anak-anak dan pemula.',
    subjects: ['Mengaji'],
    hourly_rate: 55000,
    lat: -6.2400,
    lng: 106.9100,
    address: 'Jl. Tebet Raya No. 55, Jakarta Selatan',
    rating: 5.0,
    total_reviews: 31,
    is_verified: true,
    // Jakarta Selatan - Tebet - Tebet
    province_id: '31',
    city_id: '31.74',
    district_id: '31.74.07',
    village_id: '31.74.07.1001',
  },
  {
    email: 'maya.anggraini@example.com',
    name: 'Maya Anggraini',
    phone: '081234567008',
    bio: 'Pianist profesional. Mengajar piano klasik dan pop untuk semua usia. Bisa datang ke rumah atau online.',
    subjects: ['Musik'],
    hourly_rate: 150000,
    lat: -6.1800,
    lng: 106.7900,
    address: 'Jl. Puri Indah No. 99, Jakarta Barat',
    rating: 4.9,
    total_reviews: 26,
    is_verified: true,
    // Jakarta Barat - Kembangan - Kembangan
    province_id: '31',
    city_id: '31.73',
    district_id: '31.73.10',
    village_id: '31.73.10.1001',
  },
  {
    email: 'fajar.hidayat@example.com',
    name: 'Fajar Hidayat',
    phone: '081234567009',
    bio: 'Guru fisika dengan pendekatan matematis. Cocok untuk persiapan OSN dan masuk PTN. Alumni Olimpiade Fisika.',
    subjects: ['Fisika', 'Matematika'],
    hourly_rate: 100000,
    lat: -6.2600,
    lng: 106.7800,
    address: 'Jl. Ciledug Raya No. 22, Jakarta Selatan',
    rating: 4.7,
    total_reviews: 18,
    is_verified: true,
    // Jakarta Selatan - Cilandak - Cilandak
    province_id: '31',
    city_id: '31.74',
    district_id: '31.74.05',
    village_id: '31.74.05.1001',
  },
  {
    email: 'lena.susanti@example.com',
    name: 'Lena Susanti',
    phone: '081234567010',
    bio: 'Akuntan yang mengajar ekonomi. Praktis dengan contoh kasus nyata. Membantu siswa memahami konsep dasar ekonomi.',
    subjects: ['Ekonomi', 'Matematika'],
    hourly_rate: 80000,
    lat: -6.2100,
    lng: 106.8800,
    address: 'Jl. Pancoran No. 66, Jakarta Selatan',
    rating: 4.8,
    total_reviews: 22,
    is_verified: true,
    // Jakarta Selatan - Pancoran - Pancoran
    province_id: '31',
    city_id: '31.74',
    district_id: '31.74.08',
    village_id: '31.74.08.1001',
  },
  {
    email: 'adi.nugroho@example.com',
    name: 'Adi Nugroho',
    phone: '081234567011',
    bio: 'Fresh graduate Teknik Informatika. Mengajar IPA dan komputer untuk SD-SMP. Friendly dan bisa menjelaskan dengan bahasa sederhana.',
    subjects: ['IPA', 'Komputer', 'Matematika'],
    hourly_rate: 50000,
    lat: -6.1650,
    lng: 106.8350,
    address: 'Jl. Sunter No. 44, Jakarta Utara',
    rating: 4.5,
    total_reviews: 12,
    is_verified: false,
    // Jakarta Utara - Tanjung Priok - Tanjung Priok
    province_id: '31',
    city_id: '31.72',
    district_id: '31.72.05',
    village_id: '31.72.05.1001',
  },
  {
    email: 'sari.putri@example.com',
    name: 'Sari Putri',
    phone: '081234567012',
    bio: 'Guru TK yang kini fokus les private. Mengajar calistung dengan metode permainan. Anak-anak senang belajar dengannya.',
    subjects: ['Calistung', 'Bahasa Inggris'],
    hourly_rate: 65000,
    lat: -6.1450,
    lng: 106.8600,
    address: 'Jl. Kelapa Gading No. 77, Jakarta Utara',
    rating: 4.9,
    total_reviews: 38,
    is_verified: true,
    // Jakarta Utara - Kelapa Gading - Kelapa Gading
    province_id: '31',
    city_id: '31.72',
    district_id: '31.72.06',
    village_id: '31.72.06.1001',
  },
];

async function seedTutors() {
  console.log('Starting seed process...\n');

  for (const tutor of sampleTutors) {
    try {
      console.log(`Creating tutor: ${tutor.name}`);

      // 1. Create auth user
      let userId: string | null = null;

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: tutor.email,
        password: 'password123', // Default password for testing
        email_confirm: true,
      });

      if (authError) {
        if (authError.message.includes('already been registered')) {
          console.log(`  User ${tutor.email} already exists, fetching...`);
          // Get existing user
          const { data: users } = await supabase.auth.admin.listUsers();
          const existingUser = users?.users.find(u => u.email === tutor.email);
          if (existingUser) {
            userId = existingUser.id;
          }
        } else {
          console.error(`  Error creating auth user: ${authError.message}`);
          continue;
        }
      } else if (authData?.user) {
        userId = authData.user.id;
      }

      if (!userId) {
        console.error(`  Failed to get/create user for ${tutor.email}`);
        continue;
      }

      // 2. Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name: tutor.name,
          phone: tutor.phone,
          email: tutor.email,
          role: 'tutor',
        }, { onConflict: 'id' });

      if (profileError) {
        console.error(`  Error creating profile: ${profileError.message}`);
        continue;
      }

      // 3. Create tutor profile
      const { error: tutorProfileError } = await supabase
        .from('tutor_profiles')
        .upsert({
          user_id: userId,
          bio: tutor.bio,
          subjects: tutor.subjects,
          hourly_rate: tutor.hourly_rate,
          is_verified: tutor.is_verified,
          rating: tutor.rating,
          total_reviews: tutor.total_reviews,
          location_lat: tutor.lat,
          location_lng: tutor.lng,
          address: tutor.address,
          province_id: tutor.province_id,
          city_id: tutor.city_id,
          district_id: tutor.district_id,
          village_id: tutor.village_id,
          is_active: true,
        }, { onConflict: 'user_id' });

      if (tutorProfileError) {
        console.error(`  Error creating tutor profile: ${tutorProfileError.message}`);
        continue;
      }

      // 4. Create wallet for tutor
      const { error: walletError } = await supabase
        .from('tutor_wallets')
        .upsert({
          tutor_id: userId,
          balance: 0,
          total_earned: Math.floor(Math.random() * 5000000), // Random earnings
        }, { onConflict: 'tutor_id' });

      if (walletError) {
        console.error(`  Error creating wallet: ${walletError.message}`);
        // Non-fatal, continue
      }

      console.log(`  ✓ Created successfully (ID: ${userId})\n`);
    } catch (error) {
      console.error(`  Unexpected error: ${error}\n`);
    }
  }

  console.log('\nSeed process completed!');
  console.log('\nSample tutor accounts (password: password123):');
  sampleTutors.forEach(t => console.log(`  - ${t.email} (${t.name})`));
}

seedTutors().catch(console.error);
