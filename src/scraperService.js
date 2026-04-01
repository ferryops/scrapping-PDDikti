const { fetchCampuses, fetchProdi, fetchAllCampuses } = require('./apiClient');
const { exportKampusToExcel, exportProdiToExcel, exportKampusByProvinsi } = require('./excelExporter');

/**
 * Service untuk melakukan scraping kampus dan export ke Excel
 */
class ScraperService {
  /**
   * Scrape semua data kampus dan export ke Excel
   * @param {Object} options - Opsi scraping
   * @param {Object} options.filters - Filter untuk API (akreditasi, jenis, provinsi, status)
   * @param {string} options.filename - Nama file output
   * @param {number} options.limit - Jumlah data per request (default: 50)
   * @returns {Promise<string>} Path file yang dibuat
   */
  async scrapeCampuses(options = {}) {
    try {
      console.log('🚀 Memulai scraping data kampus...');
      
      const {
        filters = {},
        filename = `kampus_${new Date().toISOString().split('T')[0]}.xlsx`,
        limit = 50
      } = options;

      // Fetch semua data kampus
      let allData = [];
      let currentPage = 1;
      let totalPages = 1;

      while (currentPage <= totalPages) {
        try {
          console.log(`📄 Mengambil halaman ${currentPage}...`);
          const result = await fetchCampuses(limit, currentPage, filters);
          
          allData = allData.concat(result.data);
          totalPages = result.totalPages;
          
          console.log(`   ✓ Halaman ${currentPage} selesai (total: ${allData.length}/${result.totalItems})`);
          
          currentPage++;
          
          // Delay untuk menghindari rate limiting
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error(`⚠️  Error di halaman ${currentPage}:`, error.message);
          throw error;
        }
      }

      console.log(`\n✅ Selesai mengambil ${allData.length} data kampus`);

      // Export ke Excel
      const filepath = await exportKampusToExcel(allData, filename);
      
      return {
        success: true,
        message: `Berhasil scrape ${allData.length} kampus`,
        filepath,
        dataCount: allData.length
      };
    } catch (error) {
      console.error('❌ Error scraping campuses:', error.message);
      throw error;
    }
  }

  /**
   * Scrape data program studi dari satu kampus
   * @param {string} idSp - ID kampus yang di-encode
   * @param {string} namaPt - Nama kampus
   * @param {string} filename - Nama file output
   * @returns {Promise<string>} Path file yang dibuat
   */
  async scrapeProdiFromCampus(idSp, namaPt = 'kampus', filename = null) {
    try {
      console.log(`🚀 Memulai scraping program studi dari ${namaPt}...`);

      if (!filename) {
        filename = `${namaPt.replace(/\s+/g, '_')}_prodi_${new Date().toISOString().split('T')[0]}.xlsx`;
      }

      // Fetch data prodi
      const prodiData = await fetchProdi(idSp);
      
      if (!Array.isArray(prodiData)) {
        throw new Error('Format data prodi tidak valid');
      }

      console.log(`✅ Selesai mengambil ${prodiData.length} program studi`);

      // Export ke Excel
      const filepath = await exportProdiToExcel(prodiData, namaPt, filename);
      
      return {
        success: true,
        message: `Berhasil scrape ${prodiData.length} program studi dari ${namaPt}`,
        filepath,
        dataCount: prodiData.length
      };
    } catch (error) {
      console.error('❌ Error scraping prodi:', error.message);
      throw error;
    }
  }

  /**
   * Scrape data kampus dan program studi untuk beberapa kampus
   * @param {Array<Object>} kampusList - List kampus dengan id_sp dan nama_pt
   * @param {string} filename - Nama file output
   * @returns {Promise<Object>} Hasil scraping
   */
  async scrapeCampusesWithProdi(kampusList, filename = null) {
    try {
      console.log('🚀 Memulai scraping kampus dengan program studi...');

      if (!filename) {
        filename = `kampus_dengan_prodi_${new Date().toISOString().split('T')[0]}.xlsx`;
      }

      const results = [];

      for (let i = 0; i < kampusList.length; i++) {
        const kampus = kampusList[i];
        console.log(`\n📚 Scraping kampus ${i + 1}/${kampusList.length}: ${kampus.nama_pt}`);

        try {
          const prodiData = await fetchProdi(kampus.id_sp);
          
          results.push({
            ...kampus,
            prodiData: Array.isArray(prodiData) ? prodiData : []
          });

          console.log(`   ✓ ${kampus.nama_pt}: ${prodiData.length || 0} program studi`);
          
          // Delay untuk menghindari rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`   ⚠️  Error pada ${kampus.nama_pt}:`, error.message);
          results.push({
            ...kampus,
            prodiData: [],
            error: error.message
          });
        }
      }

      console.log(`\n✅ Selesai scraping ${results.length} kampus`);

      return {
        success: true,
        message: `Berhasil scrape ${results.length} kampus dengan program studi mereka`,
        results,
        dataCount: results.length
      };
    } catch (error) {
      console.error('❌ Error scraping campuses with prodi:', error.message);
      throw error;
    }
  }

  /**
   * Scrape kampus dengan filter dan export by provinsi
   * @param {Object} options - Opsi scraping
   * @returns {Promise<Object>} Hasil scraping
   */
  async scrapeCampusesByProvinsi(options = {}) {
    try {
      console.log('🚀 Memulai scraping data kampus by provinsi...');

      const {
        filters = {},
        filename = `kampus_by_provinsi_${new Date().toISOString().split('T')[0]}.xlsx`,
        limit = 50
      } = options;

      // Fetch semua data kampus
      let allData = [];
      let currentPage = 1;
      let totalPages = 1;

      while (currentPage <= totalPages) {
        try {
          console.log(`📄 Mengambil halaman ${currentPage}...`);
          const result = await fetchCampuses(limit, currentPage, filters);
          
          allData = allData.concat(result.data);
          totalPages = result.totalPages;
          currentPage++;
          
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error(`⚠️  Error di halaman ${currentPage}:`, error.message);
          throw error;
        }
      }

      console.log(`\n✅ Selesai mengambil ${allData.length} data kampus`);

      // Group by provinsi
      const provinsiMap = {};
      allData.forEach(kampus => {
        const provinsi = kampus.provinsi_pt || 'Unknown';
        if (!provinsiMap[provinsi]) {
          provinsiMap[provinsi] = 0;
        }
        provinsiMap[provinsi]++;
      });

      console.log('\n📊 Ringkasan by Provinsi:');
      Object.entries(provinsiMap).forEach(([provinsi, count]) => {
        console.log(`   - ${provinsi}: ${count} kampus`);
      });

      // Export ke Excel
      const filepath = await exportKampusByProvinsi(allData, filename);
      
      return {
        success: true,
        message: `Berhasil scrape ${allData.length} kampus (${Object.keys(provinsiMap).length} provinsi)`,
        filepath,
        dataCount: allData.length,
        provinsiCount: Object.keys(provinsiMap).length,
        provinsiMap
      };
    } catch (error) {
      console.error('❌ Error scraping campuses by provinsi:', error.message);
      throw error;
    }
  }
}

module.exports = new ScraperService();