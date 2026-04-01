#!/usr/bin/env node

require('dotenv').config();
const scraperService = require('./scraperService');

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║        PDDIKTI DATA SCRAPER - Kampus                 ║
║        Scraping Semua Data Kampus Indonesia          ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);

  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    const command = args[0];

    // Parse options
    const options = {
      filters: {},
      filename: `kampus_indonesia_${new Date().toISOString().split('T')[0]}.xlsx`
    };

    // Check for filter arguments
    if (args.includes('--jenis')) {
      const jenisIndex = args.indexOf('--jenis');
      options.filters.jenis = args[jenisIndex + 1];
    }

    if (args.includes('--provinsi')) {
      const provinsiIndex = args.indexOf('--provinsi');
      options.filters.provinsi = args[provinsiIndex + 1];
    }

    if (args.includes('--akreditasi')) {
      const akreditasiIndex = args.indexOf('--akreditasi');
      options.filters.akreditasi = args[akreditasiIndex + 1];
    }

    if (args.includes('--status')) {
      const statusIndex = args.indexOf('--status');
      options.filters.status = args[statusIndex + 1];
    }

    if (args.includes('--filename')) {
      const filenameIndex = args.indexOf('--filename');
      options.filename = args[filenameIndex + 1];
    }

    // Print filter info if any
    if (Object.keys(options.filters).length > 0) {
      console.log('\n🔍 Filter yang digunakan:');
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value) console.log(`   ${key}: ${value}`);
      });
    }

    console.log(`\n📁 Output filename: ${options.filename}\n`);

    // Start scraping
    const result = await scraperService.scrapeCampuses(options);

    console.log(`\n✨ ${result.message}`);
    console.log(`📊 Total kampus: ${result.dataCount}`);
    console.log(`📁 File disimpan di: ${result.filepath}\n`);

    console.log(`
╔═══════════════════════════════════════════════════════╗
║                      SELESAI!                         ║
╚═══════════════════════════════════════════════════════╝
    `);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nPenggunaan:');
    console.error('  npm run scrape:kampus');
    console.error('  npm run scrape:kampus -- --jenis Negeri');
    console.error('  npm run scrape:kampus -- --provinsi "Prov. Jawa Barat"');
    console.error('  npm run scrape:kampus -- --jenis Negeri --provinsi "Prov. Jawa Barat"');
    console.error('  npm run scrape:kampus -- --filename custom.xlsx\n');
    process.exit(1);
  }
}

main();