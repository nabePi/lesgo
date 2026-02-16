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
