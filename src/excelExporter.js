const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

/**
 * Export data kampus ke file Excel
 * @param {Array} data - Array data kampus
 * @param {string} filename - Nama file output (default: kampus.xlsx)
 * @returns {Promise<string>} Path file yang dibuat
 */
async function exportKampusToExcel(data, filename = 'kampus.xlsx') {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Kampus');

    // Define columns
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama Kampus', key: 'nama_pt', width: 40 },
      { header: 'Nama Singkat', key: 'nama_singkat', width: 20 },
      { header: 'Jenis', key: 'jenis_pt', width: 15 },
      { header: 'Status', key: 'status_pt', width: 15 },
      { header: 'Provinsi', key: 'provinsi_pt', width: 25 },
      { header: 'Kab/Kota', key: 'kab_kota_pt', width: 25 },
      { header: 'Jumlah Prodi', key: 'jumlah_prodi', width: 12 },
      { header: 'Akreditasi', key: 'akreditasi', width: 15 },
      { header: 'Range Biaya Kuliah', key: 'range_biaya_kuliah', width: 20 },
      { header: 'ID SP', key: 'id_sp', width: 50 }
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'center' };

    // Add data
    data.forEach((item, index) => {
      worksheet.addRow({
        no: index + 1,
        nama_pt: item.nama_pt,
        nama_singkat: item.nama_singkat || '-',
        jenis_pt: item.jenis_pt,
        status_pt: item.status_pt,
        provinsi_pt: item.provinsi_pt,
        kab_kota_pt: item.kab_kota_pt,
        jumlah_prodi: item.jumlah_prodi,
        akreditasi: item.akreditasi || '-',
        range_biaya_kuliah: item.range_biaya_kuliah || '-',
        id_sp: item.id_sp
      });
    });

    // Format data rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { horizontal: 'left', vertical: 'center' };
        row.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    });

    // Freeze panes
    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    // Create output directory if not exists
    const outputDir = path.join(__dirname, '../output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filepath = path.join(outputDir, filename);
    await workbook.xlsx.writeFile(filepath);

    console.log(`✅ File kampus berhasil diexport ke: ${filepath}`);
    return filepath;
  } catch (error) {
    console.error('Error exporting to Excel:', error.message);
    throw error;
  }
}

/**
 * Export data program studi ke file Excel
 * @param {Array} data - Array data program studi
 * @param {string} namaPt - Nama kampus
 * @param {string} filename - Nama file output
 * @returns {Promise<string>} Path file yang dibuat
 */
async function exportProdiToExcel(data, namaPt = 'Kampus', filename = 'prodi.xlsx') {
  console.log(`📊 Exporting ${data.length} program studi ke ${namaPt}...`);
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Prodi');

    // Define columns
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Kampus', key: 'nama_pt', width: 45 },
      { header: 'Kode Prodi', key: 'kode_prodi', width: 12 },
      { header: 'Nama Program Studi', key: 'nama_prodi', width: 45 },
      { header: 'Jenjang', key: 'jenjang_prodi', width: 10 },
      { header: 'Status', key: 'status_prodi', width: 12 },
      { header: 'Akreditasi', key: 'akreditasi', width: 12 },
      { header: 'Jumlah Dosen NIDN', key: 'jumlah_dosen_nidn', width: 15 },
      { header: 'Jumlah Dosen NIDK', key: 'jumlah_dosen_nidk', width: 15 },
      { header: 'Jumlah Dosen', key: 'jumlah_dosen', width: 12 },
      { header: 'Jumlah Dosen Ajar', key: 'jumlah_dosen_ajar', width: 15 },
      { header: 'Jumlah Mahasiswa', key: 'jumlah_mahasiswa', width: 15 },
      { header: 'Rasio', key: 'rasio', width: 10 }
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' }
    };
    worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'center' };

    // Add data
    data.forEach((item, index) => {
      worksheet.addRow({
        no: index + 1,
        nama_pt: namaPt,
        kode_prodi: item.kode_prodi,
        nama_prodi: item.nama_prodi,
        jenjang_prodi: item.jenjang_prodi,
        status_prodi: item.status_prodi,
        akreditasi: item.akreditasi || '-',
        jumlah_dosen_nidn: item.jumlah_dosen_nidn,
        jumlah_dosen_nidk: item.jumlah_dosen_nidk,
        jumlah_dosen: item.jumlah_dosen,
        jumlah_dosen_ajar: item.jumlah_dosen_ajar,
        jumlah_mahasiswa: item.jumlah_mahasiswa,
        rasio: item.rasio || '-'
      });
    });

    // Format data rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { horizontal: 'left', vertical: 'center' };
        row.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    });

    // Freeze panes
    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    // Create output directory if not exists
    const outputDir = path.join(__dirname, '../output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filepath = path.join(outputDir, filename);
    await workbook.xlsx.writeFile(filepath);

    console.log(`✅ File prodi untuk ${namaPt} berhasil diexport ke: ${filepath}`);
    return filepath;
  } catch (error) {
    console.error('Error exporting prodi to Excel:', error.message);
    throw error;
  }
}

/**
 * Export data kampus dengan sheet multiple (satu per provinsi)
 * @param {Array} data - Array data kampus
 * @param {string} filename - Nama file output
 * @returns {Promise<string>} Path file yang dibuat
 */
async function exportKampusByProvinsi(data, filename = 'kampus_by_provinsi.xlsx') {
  try {
    const workbook = new ExcelJS.Workbook();

    // Group data by provinsi
    const groupedByProvinsi = {};
    data.forEach(item => {
      const provinsi = item.provinsi_pt || 'Unknown';
      if (!groupedByProvinsi[provinsi]) {
        groupedByProvinsi[provinsi] = [];
      }
      groupedByProvinsi[provinsi].push(item);
    });

    // Create worksheet untuk setiap provinsi
    Object.keys(groupedByProvinsi).forEach(provinsi => {
      const provincialData = groupedByProvinsi[provinsi];
      const sheetName = provinsi.substring(0, 31); // Excel sheet name max 31 chars
      const worksheet = workbook.addWorksheet(sheetName);

      // Define columns
      worksheet.columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Nama Kampus', key: 'nama_pt', width: 40 },
        { header: 'Jenis', key: 'jenis_pt', width: 15 },
        { header: 'Status', key: 'status_pt', width: 15 },
        { header: 'Kab/Kota', key: 'kab_kota_pt', width: 25 },
        { header: 'Jumlah Prodi', key: 'jumlah_prodi', width: 12 }
      ];

      // Style header
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };

      // Add data
      provincialData.forEach((item, index) => {
        worksheet.addRow({
          no: index + 1,
          nama_pt: item.nama_pt,
          jenis_pt: item.jenis_pt,
          status_pt: item.status_pt,
          kab_kota_pt: item.kab_kota_pt,
          jumlah_prodi: item.jumlah_prodi
        });
      });

      // Format
      worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
    });

    // Create output directory if not exists
    const outputDir = path.join(__dirname, '../output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filepath = path.join(outputDir, filename);
    await workbook.xlsx.writeFile(filepath);

    console.log(`✅ File kampus by provinsi berhasil diexport ke: ${filepath}`);
    return filepath;
  } catch (error) {
    console.error('Error exporting to Excel:', error.message);
    throw error;
  }
}

/**
 * Export semua program studi dari semua kampus ke file Excel
 * @param {Array} scrapedData - Array data dari semua kampus beserta prodi
 * @param {string} filename - Nama file output
 * @returns {Promise<string>} Path file yang dibuat
 */
async function exportAllProdiToExcel(scrapedData, filename = 'semua_prodi.xlsx') {
  try {
    const workbook = new ExcelJS.Workbook();

    // Sheet 1: Summary
    const summarySheet = workbook.addWorksheet('Summary', { state: 'visible' });
    setupSummarySheet(summarySheet, scrapedData);

    // Sheet 2: Semua Prodi (kombinasi dari semua kampus)
    const allProdiSheet = workbook.addWorksheet('Semua Prodi');
    setupAllProdiSheet(allProdiSheet, scrapedData);

    // Sheet 3: Per Kampus (ringkasan)
    const perKampusSheet = workbook.addWorksheet('Per Kampus');
    setupPerKampusSheet(perKampusSheet, scrapedData);

    // Create output directory if not exists
    const outputDir = path.join(__dirname, '../output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filepath = path.join(outputDir, filename);
    await workbook.xlsx.writeFile(filepath);

    console.log(`✅ File semua prodi berhasil diexport ke: ${filepath}`);
    return filepath;
  } catch (error) {
    console.error('Error exporting all prodi to Excel:', error.message);
    throw error;
  }
}

/**
 * Setup Summary Sheet
 */
function setupSummarySheet(sheet, scrapedData) {
  // Title
  sheet.mergeCells('A1:D1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = '📊 RINGKASAN SCRAPING SEMUA PRODI';
  titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'center' };
  sheet.getRow(1).height = 25;

  // Calculate statistics
  let totalProdi = 0;
  let totalKampus = 0;
  let successKampus = 0;

  scrapedData.forEach(item => {
    totalKampus++;
    if (item.prodiData && item.prodiData.length > 0) {
      successKampus++;
      totalProdi += item.prodiData.length;
    }
  });

  // Summary data
  const summaryData = [
    ['Total Kampus', totalKampus],
    ['Kampus Berhasil Scrape', successKampus],
    ['Kampus Gagal/Kosong', totalKampus - successKampus],
    ['Total Program Studi', totalProdi],
    ['Rata-rata Prodi per Kampus', (totalProdi / successKampus).toFixed(2)],
    ['Tanggal & Waktu', new Date().toLocaleString('id-ID')]
  ];

  let row = 3;
  summaryData.forEach(([label, value]) => {
    const labelCell = sheet.getCell(row, 1);
    const valueCell = sheet.getCell(row, 2);

    labelCell.value = label;
    labelCell.font = { bold: true, color: { argb: 'FF1F4E78' } };
    
    valueCell.value = value;
    valueCell.alignment = { horizontal: 'right' };

    sheet.getRow(row).height = 20;
    row++;
  });

  sheet.columns = [
    { width: 30 },
    { width: 20 }
  ];
}

/**
 * Setup Sheet dengan semua prodi
 */
function setupAllProdiSheet(sheet, scrapedData) {
  // Headers
  const headers = [
    'No',
    'Kampus',
    'Kode Prodi',
    'Nama Prodi',
    'Jenjang',
    'Status Prodi',
    'Akreditasi',
    'Jumlah Dosen',
    'Jumlah Mahasiswa'
  ];

  const headerRow = sheet.addRow(headers);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'center' };

  // Add data dari semua kampus
  let rowNum = 2;
  let prodiNum = 1;

  scrapedData.forEach(kampusData => {
    if (kampusData.prodiData && kampusData.prodiData.length > 0) {
      kampusData.prodiData.forEach(prodi => {
        const row = sheet.addRow([
          prodiNum++,
          kampusData.nama_pt,
          prodi.kode_prodi || '',
          prodi.nama_prodi || '',
          prodi.jenjang_pendidikan_nama || prodi.jenjang_prodi || '',
          prodi.status_prodi || '',
          prodi.akreditasi_pk || prodi.akreditasi || '',
          prodi.dosen || prodi.jumlah_dosen || 0,
          prodi.mahasiswa || prodi.jumlah_mahasiswa || 0
        ]);

        row.alignment = { vertical: 'top', wrapText: true };
        rowNum++;
      });
    }
  });

  // Styling columns
  sheet.columns = [
    { width: 6, alignment: { horizontal: 'center' } },
    { width: 30 },
    { width: 12 },
    { width: 35 },
    { width: 12 },
    { width: 15 },
    { width: 12 },
    { width: 12, alignment: { horizontal: 'right' } },
    { width: 15, alignment: { horizontal: 'right' } }
  ];

  // Freeze panes
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
}

/**
 * Setup Per Kampus Sheet
 */
function setupPerKampusSheet(sheet, scrapedData) {
  // Headers
  const headers = [
    'No',
    'Nama Kampus',
    'Total Prodi',
    'Jenjang S1',
    'Jenjang S2',
    'Jenjang S3',
    'Status'
  ];

  const headerRow = sheet.addRow(headers);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'center' };

  // Data rows
  scrapedData.forEach((kampusData, index) => {
    const s1Count = (kampusData.prodiData || []).filter(p => 
      (p.jenjang_pendidikan_nama === 'Strata 1' || p.jenjang_prodi === 'S1')
    ).length;
    const s2Count = (kampusData.prodiData || []).filter(p => 
      (p.jenjang_pendidikan_nama === 'Strata 2' || p.jenjang_prodi === 'S2')
    ).length;
    const s3Count = (kampusData.prodiData || []).filter(p => 
      (p.jenjang_pendidikan_nama === 'Strata 3' || p.jenjang_prodi === 'S3')
    ).length;
    
    const status = (kampusData.prodiData && kampusData.prodiData.length > 0) ? 'Sukses' : 'Gagal/Kosong';

    const row = sheet.addRow([
      index + 1,
      kampusData.nama_pt,
      kampusData.prodiCount || 0,
      s1Count,
      s2Count,
      s3Count,
      status
    ]);

    row.alignment = { vertical: 'top' };
    
    // Warning color untuk yang kosong/error
    if (!kampusData.prodiData || kampusData.prodiData.length === 0) {
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE699' } };
    }
  });

  // Styling columns
  sheet.columns = [
    { width: 6, alignment: { horizontal: 'center' } },
    { width: 35 },
    { width: 12, alignment: { horizontal: 'center' } },
    { width: 12, alignment: { horizontal: 'center' } },
    { width: 12, alignment: { horizontal: 'center' } },
    { width: 12, alignment: { horizontal: 'center' } },
    { width: 12, alignment: { horizontal: 'center' } }
  ];

  // Freeze panes
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
}

module.exports = {
  exportKampusToExcel,
  exportProdiToExcel,
  exportKampusByProvinsi,
  exportAllProdiToExcel
};
