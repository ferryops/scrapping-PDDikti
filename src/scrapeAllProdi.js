#!/usr/bin/env node

/**
 * Script untuk Scraping SEMUA Data Program Studi dari SEMUA Kampus
 * 
 * Script ini akan:
 * 1. Mengambil semua data kampus dari API
 * 2. Untuk setiap kampus, mengambil semua program studi
 * 3. Export hasil ke Excel dengan sheet per kampus
 * 
 * Penggunaan:
 *   npm run scrape:all-prodi
 *   node src/scrapeAllProdi.js
 */

require('dotenv').config();
const { fetchCampuses, fetchProdi } = require('./apiClient');
const { exportProdiToExcel, exportAllProdiToExcel } = require('./excelExporter');
const fs = require('fs');
const path = require('path');

// Banner
const banner = `
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   📚 PDDIKTI DATA SCRAPER - Scrape SEMUA Program Studi   ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
`;

class AllProdiScraper {
  constructor() {
    this.allCampuses = [];
    this.scrapedData = [];
    this.failedCampuses = [];
    this.startTime = null;
    this.outputDir = path.join(__dirname, '../output');
  }

  /**
   * Format waktu elapsed
   */
  formatElapsedTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Log dengan timestamp
   */
  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString('id-ID');
    const prefix = {
      info: 'ℹ️ ',
      success: '✅',
      error: '❌',
      warning: '⚠️ ',
      loading: '🚀'
    };

    console.log(`[${timestamp}] ${prefix[type] || prefix.info} ${message}`);
  }

  /**
   * Fetch semua kampus dengan pagination
   */
  async fetchAllCampuses() {
    this.log('Mengambil data semua kampus...', 'loading');

    let currentPage = 1;
    let totalPages = 1;
    let totalCampuses = 0;
    const limit = 50;

    while (currentPage <= totalPages) {
      try {
        const result = await fetchCampuses(limit, currentPage, {});

        this.allCampuses = this.allCampuses.concat(result.data);
        totalPages = result.totalPages;
        totalCampuses = result.totalItems;

        this.log(
          `Halaman ${currentPage}/${totalPages} - Total: ${this.allCampuses.length}/${totalCampuses}`,
          'info'
        );

        currentPage++;

        // Delay untuk menghindari rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        this.log(`Error di halaman ${currentPage}: ${error.message}`, 'error');
        throw error;
      }
    }

    this.log(`Selesai mengambil ${this.allCampuses.length} kampus`, 'success');
    return this.allCampuses;
  }

  /**
   * Fetch program studi untuk satu kampus
   */
  async fetchProdiForCampus(idSp, namaPt, index, total) {
    try {
      const prodiData = await fetchProdi(idSp);

      if (!Array.isArray(prodiData)) {
        return {
          success: false,
          error: 'Format data tidak valid',
          prodiCount: 0
        };
      }

      this.scrapedData.push({
        id_sp: idSp,
        nama_pt: namaPt,
        prodiData: prodiData,
        prodiCount: prodiData.length,
        scrapedAt: new Date().toISOString()
      });

      this.log(
        `[${index}/${total}] ${namaPt}: ${prodiData.length} prodi`,
        'success'
      );

      return {
        success: true,
        prodiCount: prodiData.length
      };
    } catch (error) {
      this.failedCampuses.push({
        id_sp: idSp,
        nama_pt: namaPt,
        error: error.message
      });

      this.log(
        `[${index}/${total}] ${namaPt}: GAGAL - ${error.message}`,
        'error'
      );

      return {
        success: false,
        error: error.message,
        prodiCount: 0
      };
    }
  }

  /**
   * Scrape semua prodi dari semua kampus
   */
  async scrapeAllProdi() {
    try {
      // Step 1: Fetch semua kampus
      await this.fetchAllCampuses();

      if (this.allCampuses.length === 0) {
        this.log('Tidak ada kampus yang ditemukan!', 'error');
        return null;
      }

      // Step 2: Scrape prodi untuk setiap kampus
      this.log(`\nMemulai scraping program studi dari ${this.allCampuses.length} kampus...`, 'loading');
      console.log('─'.repeat(60));

      const totalCampuses = this.allCampuses.length;
      let successCount = 0;
      let totalProdi = 0;

      for (let i = 0; i < totalCampuses; i++) {
        const kampus = this.allCampuses[i];
        const idSp = kampus.id_sp;
        const namaPt = kampus.nama_pt;

        const result = await this.fetchProdiForCampus(
          idSp,
          namaPt,
          i + 1,
          totalCampuses
        );

        if (result.success) {
          successCount++;
          totalProdi += result.prodiCount;
        }

        // Delay untuk menghindari rate limiting (500-1000ms)
        const delay = 500 + Math.random() * 500;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      console.log('─'.repeat(60));

      // Step 3: Export ke Excel
      this.log('\nMenyimpan data ke Excel...', 'loading');
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `semua_prodi_${timestamp}.xlsx`;

      const filepath = await exportAllProdiToExcel(this.scrapedData, filename);

      this.log(`Data disimpan ke: ${filepath}`, 'success');

      // Summary
      const elapsedTime = this.formatElapsedTime(
        Date.now() - this.startTime
      );

      console.log('\n' + '═'.repeat(60));
      console.log('📊 SUMMARY HASIL SCRAPING');
      console.log('═'.repeat(60));
      console.log(`✅ Kampus berhasil  : ${successCount}/${totalCampuses}`);
      console.log(`❌ Kampus gagal     : ${this.failedCampuses.length}/${totalCampuses}`);
      console.log(`📚 Total program studi: ${totalProdi}`);
      console.log(`⏱️  Waktu proses     : ${elapsedTime}`);
      console.log(`📁 Output file      : ${filename}`);
      console.log('═'.repeat(60) + '\n');

      // Tampilkan kampus yang gagal jika ada
      if (this.failedCampuses.length > 0) {
        console.log('⚠️  KAMPUS YANG GAGAL:');
        this.failedCampuses.forEach((item, idx) => {
          console.log(`  ${idx + 1}. ${item.nama_pt}`);
          console.log(`     Error: ${item.error}`);
        });
        console.log('');
      }

      return {
        success: true,
        filepath,
        totalCampuses,
        successCount,
        failedCount: this.failedCampuses.length,
        totalProdi,
        scrapedData: this.scrapedData,
        failedCampuses: this.failedCampuses
      };
    } catch (error) {
      this.log(`Fatal Error: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Export summary ke file JSON untuk referensi
   */
  async exportSummary(result) {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const summaryFile = path.join(
        this.outputDir,
        `scrape_summary_${timestamp}.json`
      );

      // Ensure output dir exists
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }

      const summary = {
        timestamp: new Date().toISOString(),
        totalCampuses: result.totalCampuses,
        successCount: result.successCount,
        failedCount: result.failedCount,
        totalProdi: result.totalProdi,
        excelFile: result.filepath,
        failedCampuses: result.failedCampuses
      };

      fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
      this.log(`Summary disimpan ke: ${summaryFile}`, 'success');

      return summaryFile;
    } catch (error) {
      this.log(`Error exporting summary: ${error.message}`, 'warning');
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log(banner);

  const scraper = new AllProdiScraper();
  scraper.startTime = Date.now();

  try {
    const result = await scraper.scrapeAllProdi();

    if (result) {
      // Export summary
      await scraper.exportSummary(result);

      console.log('✨ SCRAPING SELESAI!\n');
      process.exit(0);
    } else {
      console.error('❌ Scraping gagal: Tidak ada data\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ FATAL ERROR:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { AllProdiScraper };