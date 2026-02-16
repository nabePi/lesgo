import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as readline from 'readline';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

  let inInsertBlock = false;
  let currentValues: string[] = [];

  for await (const line of rl) {
    const trimmed = line.trim();

    // Start of INSERT block
    if (trimmed.startsWith("INSERT INTO wilayah")) {
      inInsertBlock = true;
      currentValues = [];
      continue;
    }

    // VALUES line
    if (trimmed === 'VALUES') continue;

    // End of INSERT block (semicolon)
    if (inInsertBlock && trimmed.endsWith(';')) {
      inInsertBlock = false;
      // Process collected values
      const valueLine = trimmed.replace(/,$/, '').replace(/;$/, '');
      currentValues.push(valueLine);

      // Parse all collected values
      for (const val of currentValues) {
        const match = val.match(/\('([^']+)','([^']+)'\)/);
        if (match) {
          const kode = match[1];
          const nama = match[2];
          const len = kode.length;

          if (len === 2) {
            provinces.push({ id: kode, name: nama });
          } else if (len === 5) {
            const cityCode = parseInt(kode.slice(3, 5));
            const type = cityCode >= 71 ? 'city' : 'regency';
            cities.push({
              id: kode,
              province_id: kode.slice(0, 2),
              name: nama,
              type
            });
          } else if (len === 8) {
            districts.push({
              id: kode,
              city_id: kode.slice(0, 5),
              name: nama
            });
          } else if (len === 13) {
            const villageTypeChar = kode[9];
            const type = villageTypeChar === '1' ? 'urban' :
                        villageTypeChar === '2' ? 'rural' : 'customary';
            villages.push({
              id: kode,
              district_id: kode.slice(0, 8),
              name: nama,
              type
            });
          }
        }
      }
      currentValues = [];
      continue;
    }

    // Collect value lines
    if (inInsertBlock && trimmed.startsWith("('")) {
      currentValues.push(trimmed.replace(/,$/, ''));
    }
  }

  console.log(`Parsed ${provinces.length} provinces`);
  console.log(`Parsed ${cities.length} cities`);
  console.log(`Parsed ${districts.length} districts`);
  console.log(`Parsed ${villages.length} villages\n`);

  // Batch insert with chunking
  const chunkSize = 1000;

  console.log('Inserting provinces...');
  const { error: provError } = await supabase.from('provinces').insert(provinces);
  if (provError) console.error('Province error:', provError.message);

  console.log('Inserting cities...');
  for (let i = 0; i < cities.length; i += chunkSize) {
    const chunk = cities.slice(i, i + chunkSize);
    const { error } = await supabase.from('cities').insert(chunk);
    if (error) console.error(`Cities chunk ${i} error:`, error.message);
    process.stdout.write(`  ${Math.min(i + chunkSize, cities.length)}/${cities.length}\r`);
  }
  console.log('');

  console.log('Inserting districts...');
  for (let i = 0; i < districts.length; i += chunkSize) {
    const chunk = districts.slice(i, i + chunkSize);
    const { error } = await supabase.from('districts').insert(chunk);
    if (error) console.error(`Districts chunk ${i} error:`, error.message);
    process.stdout.write(`  ${Math.min(i + chunkSize, districts.length)}/${districts.length}\r`);
  }
  console.log('');

  console.log('Inserting villages...');
  for (let i = 0; i < villages.length; i += chunkSize) {
    const chunk = villages.slice(i, i + chunkSize);
    const { error } = await supabase.from('villages').insert(chunk);
    if (error) console.error(`Villages chunk ${i} error:`, error.message);
    process.stdout.write(`  ${Math.min(i + chunkSize, villages.length)}/${villages.length}\r`);
  }
  console.log('');

  console.log('\nImport completed!');
}

importWilayah().catch(console.error);
