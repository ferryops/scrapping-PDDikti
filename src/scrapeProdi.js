#!/usr/bin/env node

/**
 * Script untuk Scraping Data Program Studi dari API PDDIKTI
 * 
 * Penggunaan:
 *   npm run scrape:prodi
 *   npm run scrape:prodi -- --id "ID_SP" --nama "Nama Kampus"
 */

require('dotenv').config();
const scraperService = require('./scraperService');
const readline = require('readline');

// Banner
const banner = `
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   📚 PDDIKTI DATA SCRAPER - Scrape Program Studi      ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
`;

// Create readline interface untuk user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function untuk ask user
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Tampilkan opsi menu
async function showMenu() {
  console.log(`
📋 PILIH MODE:

1. ✅ Scrape Program Studi Satu Kampus
2. 📚 Scrape Program Studi Multiple Kampus
3. ❌ Keluar

`);
}

// Option 1: Scrape program studi dari satu kampus
async function scrapeSingleProdi() {
  try {
    console.log(`\n📚 SCRAPE PROGRAM STUDI SATU KAMPUS\n`);
    console.log('─'.repeat(50));

    console.log('\nUntuk mendapatkan ID_SP:');
    console.log('  1. Jalankan: npm run scrape:kampus');
    console.log('  2. Buka file Excel output');
    console.log('  3. Salin nilai dari kolom "ID SP"\n');

    const idSp = await askQuestion('Masukkan ID_SP kampus: ');
    
    if (!idSp.trim()) {
      console.log('\n❌ ID_SP tidak boleh kosong\n');
      return false;
    }

    const namaPt = await askQuestion('Masukkan Nama Kampus (untuk filename): ');
    const campusName = namaPt.trim() || 'kampus';

    console.log(`\n🚀 Memulai scraping program studi...\n`);

    const result = await scraperService.scrapeProdiFromCampus(idSp, campusName);

    console.log(`\n✅ ${result.message}`);
    console.log(`📊 Total program studi: ${result.dataCount}`);
    console.log(`📁 File disimpan di: ${result.filepath}\n`);

    return true;
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    return false;
  }
}

// Option 2: Scrape program studi dari multiple kampus
async function scrapeMultipleProdi() {
  try {
    console.log(`\n📚 SCRAPE PROGRAM STUDI MULTIPLE KAMPUS\n`);
    console.log('─'.repeat(50));
    console.log('Masukkan data kampus (tekan Enter kosong untuk selesai)\n');

    const kampusList = [];
    let counter = 1;

    while (true) {
      console.log(`\n🏫 Kampus #${counter}:`);
      
      const idSp = await askQuestion('  ID_SP (atau Enter untuk selesai): ');
      
      if (!idSp.trim()) {
        if (kampusList.length === 0) {
          console.log('\n❌ Minimal harus ada 1 kampus\n');
          continue;
        }
        break;
      }

      const namaPt = await askQuestion('  Nama Kampus: ');
      
      if (!namaPt.trim()) {
        console.log('  ❌ Nama kampus tidak boleh kosong\n');
        continue;
      }

      kampusList.push({
        id_sp: idSp.trim(),
        nama_pt: namaPt.trim()
      });

      console.log(`  ✅ Ditambahkan: ${namaPt.trim()}`);
      counter++;
    }

    if (kampusList.length === 0) {
      console.log('\n❌ Tidak ada kampus yang ditambahkan\n');
      return false;
    }

    console.log(`\n📋 Total kampus yang akan di-scrape: ${kampusList.length}`);
    console.log('Daftar kampus:');
    kampusList.forEach((k, idx) => {
      console.log(`  ${idx + 1}. ${k.nama_pt}`);
    });

    const confirm = await askQuestion('\n👉 Lanjutkan scraping? (y/n): ');
    
    if (confirm.toLowerCase() !== 'y') {
      console.log('\n❌ Dibatalkan\n');
      return false;
    }

    console.log(`\n🚀 Memulai scraping...\n`);

    const result = await scraperService.scrapeCampusesWithProdi(
      kampusList,
      `kampus_prodi_${new Date().toISOString().split('T')[0]}.xlsx`
    );

    console.log(`\n✅ ${result.message}`);
    console.log(`📊 Total kampus diproses: ${result.dataCount}`);

    console.log('\n📋 Summary per Kampus:');
    console.log('─'.repeat(50));
    result.results.forEach((item, idx) => {
      const prodiCount = item.prodiData ? item.prodiData.length : 0;
      const status = item.error ? '❌ Error' : '✅ Sukses';
      console.log(`${idx + 1}. ${status} ${item.nama_pt}: ${prodiCount} program studi`);
    });

    console.log(`\n📁 File disimpan di: ${result.filepath || 'output/'}\n`);

    return true;
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    return false;
  }
}

// Main function
async function main() {
  console.log(banner);

  // Check untuk command line arguments
  const args = process.argv.slice(2);
  
  // Jika ada argument, gunakan mode non-interactive
  if (args.includes('--id')) {
    try {
      const idIndex = args.indexOf('--id');
      const idSp = args[idIndex + 1];

      let namaPt = 'kampus';
      if (args.includes('--nama')) {
        const namaIndex = args.indexOf('--nama');
        namaPt = args[namaIndex + 1];
      }

      if (!idSp) {
        console.error('❌ Error: --id parameter diperlukan\n');
        process.exit(1);
      }

      console.log(`🚀 Memulai scraping program studi dari: ${namaPt}\n`);

      const result = await scraperService.scrapeProdiFromCampus(idSp, namaPt);

      console.log(`\n✅ ${result.message}`);
      console.log(`📊 Total program studi: ${result.dataCount}`);
      console.log(`📁 File disimpan di: ${result.filepath}\n`);

      process.exit(0);
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}\n`);
      process.exit(1);
    }
  }

  // Interactive mode
  let running = true;
  
  while (running) {
    await showMenu();
    
    const choice = await askQuestion('Pilih opsi (1-3): ').catch(() => '3');

    switch (choice.trim()) {
      case '1':
        const result1 = await scrapeSingleProdi();
        if (result1) {
          const ask = await askQuestion('\n👉 Lanjut ke menu? (y/n): ').catch(() => 'n');
          if (ask.toLowerCase() !== 'y') running = false;
        }
        break;

      case '2':
        const result2 = await scrapeMultipleProdi();
        if (result2) {
          const ask = await askQuestion('\n👉 Lanjut ke menu? (y/n): ').catch(() => 'n');
          if (ask.toLowerCase() !== 'y') running = false;
        }
        break;

      case '3':
        console.log('\n👋 Terima kasih! Sampai jumpa.\n');
        running = false;
        break;

      default:
        console.log('\n❌ Opsi tidak valid. Silakan pilih 1-3.\n');
    }
  }

  rl.close();
  process.exit(0);
}

// Run the script
main().catch((error) => {
  console.error('Fatal Error:', error.message);
  rl.close();
  process.exit(1);
});