#!/usr/bin/env node

require('dotenv').config();
const scraperService = require('./src/scraperService');

// ASCII Banner
const banner = `
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║        PDDIKTI DATA SCRAPER - Indonesia              ║
║        Scraping Data Kampus & Program Studi          ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
`;

console.log(banner);

const args = process.argv.slice(2);
const command = args[0] || 'help';

// Command handler
const commands = {
  /**
   * Scrape semua data kampus
   * Usage: npm run scrape:kampus
   */
  'scrape:kampus': async () => {
    try {
      const result = await scraperService.scrapeCampuses({
        filters: {
          // Anda bisa menambahkan filter di sini
          // akreditasi: '',
          // jenis: '', // 'Negeri' atau 'Swasta'
          // provinsi: '',
          // status: ''
        },
        filename: `kampus_indonesia_${new Date().toISOString().split('T')[0]}.xlsx`
      });

      console.log(`\n✨ ${result.message}`);
      console.log(`📁 File disimpan di: ${result.filepath}\n`);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  },

  /**
   * Scrape data kampus by provinsi
   * Usage: npm run scrape:provinsi
   */
  'scrape:provinsi': async () => {
    try {
      const result = await scraperService.scrapeCampusesByProvinsi({
        filename: `kampus_by_provinsi_${new Date().toISOString().split('T')[0]}.xlsx`
      });

      console.log(`\n✨ ${result.message}`);
      console.log(`📁 File disimpan di: ${result.filepath}`);
      console.log(`\n📍 Jumlah provinsi: ${result.provinsiCount}\n`);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  },

  /**
   * Scrape data program studi dari satu kampus
   * Usage: node index.js scrape:prodi <ID_SP> <NAMA_KAMPUS>
   * Contoh: node index.js scrape:prodi "VXXgSp6KsRtr6UcyeW7lGZHnxDCcstultx8_291FhFZXv54rqHnVJnWCJTiyq6Egmpad9A==" "ITB"
   */
  'scrape:prodi': async () => {
    const idSp = args[1];
    const namaPt = args[2] || 'kampus';

    if (!idSp) {
      console.error('❌ Error: ID_SP diperlukan');
      console.log('\nPenggunaan: node index.js scrape:prodi <ID_SP> [NAMA_KAMPUS]');
      console.log('Contoh: node index.js scrape:prodi "VXXgSp6KsRtr6UcyeW7lGZHnxDCcstultx8_291FhFZXv54rqHnVJnWCJTiyq6Egmpad9A==" "ITB"\n');
      process.exit(1);
    }

    try {
      const result = await scraperService.scrapeProdiFromCampus(idSp, namaPt);
      console.log(`\n✨ ${result.message}`);
      console.log(`📁 File disimpan di: ${result.filepath}\n`);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  },

  /**
   * Contoh scraping dengan multiple kampus
   * Usage: npm run scrape:multi
   */
  'scrape:multi': async () => {
    try {
      // Contoh: scrape program studi dari beberapa kampus
      const kampusList = [
        {
          id_sp: 'VXXgSp6KsRtr6UcyeW7lGZHnxDCcstultx8_291FhFZXv54rqHnVJnWCJTiyq6Egmpad9A==',
          nama_pt: 'Institut Teknologi Bandung'
        }
        // Tambahkan kampus lainnya di sini
      ];

      const result = await scraperService.scrapeCampusesWithProdi(kampusList);
      console.log(`\n✨ ${result.message}`);
      console.log(`📊 Total kampus: ${result.dataCount}\n`);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  },

  /**
   * Tampilkan bantuan
   */
  'help': () => {
    console.log(`
📖 Panduan Penggunaan

Perintah-perintah yang tersedia:

1. 🏫 Scrape Semua Data Kampus
   npm run scrape:kampus
   
   Deskripsi: Mengambil semua data kampus di Indonesia dan mengexport ke Excel

2. 📍 Scrape Data Kampus by Provinsi
   npm run scrape:provinsi
   
   Deskripsi: Mengambil semua data kampus dan mengelompokkan per provinsi

3. 📚 Scrape Program Studi dari Satu Kampus
   node index.js scrape:prodi <ID_SP> [NAMA_KAMPUS]
   
   Contoh: node index.js scrape:prodi "VXXgSp6KsRtr..." "ITB"
   Deskripsi: Mengambil data program studi dari kampus tertentu

4. 🔄 Scrape Multiple Kampus dengan Program Studi
   npm run scrape:multi
   
   Deskripsi: Mengambil data kampus beserta program studi mereka

5. ℹ️  Tampilkan Bantuan
   node index.js help
   npm start

🔧 Tips Penggunaan:

- Untuk mengganti nama file output, edit script di index.js
- File output tersimpan di folder 'output/'
- Untuk filter khusus (provinsi, jenis, akreditasi), edit opsi di command handler
- Delay otomatis 300-500ms ditambahkan untuk menghindari rate limiting

📝 Contoh Filter:

  const result = await scraperService.scrapeCampuses({
    filters: {
      provinsi: 'Prov. Jawa Barat',
      jenis: 'Negeri',
      akreditasi: 'A'
    }
  });

    `);
  }
};

// Execute command
if (commands[command]) {
  commands[command]();
} else {
  console.error(`❌ Perintah tidak dikenali: ${command}\n`);
  commands['help']();
  process.exit(1);
}