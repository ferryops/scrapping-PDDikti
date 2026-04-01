# 📚 PDDIKTI Data Scraper

Script Node.js untuk scrapping data kampus dan program studi dari API PDDIKTI (Platform Data Pendidikan Tinggi) Indonesia dan mengexport hasilnya ke file Excel.

## 📋 Daftar Isi

- [Fitur](#fitur)
- [Persyaratan](#persyaratan)
- [Instalasi](#instalasi)
- [Penggunaan](#penggunaan)
- [Struktur Project](#struktur-project)
- [Dokumentasi API](#dokumentasi-api)
- [Contoh Penggunaan](#contoh-penggunaan)
- [Troubleshooting](#troubleshooting)
- [Script Scrape Semua Prodi](#script-scrape-semua-prodi)

## ✨ Fitur

- ✅ Scrape semua data kampus di Indonesia
- ✅ Scrape data program studi per kampus
- ✅ **SCRAPE SEMUA PRODI dari seluruh kampus Indonesia** ⭐ FITUR BARU
- ✅ Export data ke file Excel dengan formatting yang rapi
- ✅ Grouping data per provinsi
- ✅ Support filter (akreditasi, jenis, provinsi, status)
- ✅ Automatic retry dan delay untuk menghindari rate limiting
- ✅ CLI interface yang user-friendly
- ✅ Error handling yang robust

## 📦 Persyaratan

- **Node.js** v14 atau lebih tinggi
- **npm** v6 atau lebih tinggi
- Internet connection untuk akses API

## 🚀 Instalasi

### 1. Clone atau setup project

```bash
cd /Users/a1234/Dev/node/scrapping-pddikti
```

### 2. Install dependencies

```bash
npm install
```

Dependencies yang akan diinstall:
- **axios** - HTTP client untuk API requests
- **exceljs** - Library untuk membuat file Excel
- **dotenv** - Load environment variables

## 📖 Penggunaan

### 🚀 Quick Start - 4 Perintah Utama

```bash
# 1. Scrape semua kampus
npm run scrape:kampus

# 2. Scrape program studi satu kampus
npm run scrape:prodi

# 3. ⭐ SCRAPE SEMUA PRODI dari SEMUA kampus (FITUR BARU!)
npm run scrape:all-prodi

# 4. Lihat bantuan
npm start
```

### 1. Scrape Semua Data Kampus

Mengambil semua data kampus di Indonesia (6670 kampus) dan mengexport ke Excel.

**Interactive Mode:**
```bash
npm run scrape:kampus
```

**Command Line Mode:**
```bash
npm run scrape:kampus -- --jenis Negeri
npm run scrape:kampus -- --provinsi "Prov. Jawa Barat"
npm run scrape:kampus -- --jenis Negeri --provinsi "Prov. Jawa Barat"
npm run scrape:kampus -- --filename custom.xlsx
```

**Output:** `kampus_indonesia_YYYY-MM-DD.xlsx`

**Yang diambil:**
- ID Kampus (ID SP)
- Nama Lengkap Kampus
- Nama Singkat
- Jenis (Negeri/Swasta)
- Status Kampus
- Provinsi
- Kab/Kota
- Jumlah Program Studi
- Akreditasi
- Range Biaya Kuliah

---

### 2. Scrape Data Kampus by Provinsi

Mengambil semua kampus dan mengelompokkannya per provinsi dalam sheet yang berbeda.

```bash
npm run scrape:provinsi
```

**Output:** `kampus_by_provinsi_YYYY-MM-DD.xlsx` (dengan multiple sheets)

---

### 3. Scrape Program Studi dari Satu Kampus

Mengambil data program studi dari kampus tertentu berdasarkan ID_SP.

```bash
node index.js scrape:prodi <ID_SP> [NAMA_KAMPUS]
```

**Contoh:**

```bash
node index.js scrape:prodi "VXXgSp6KsRtr6UcyeW7lGZHnxDCcstultx8_291FhFZXv54rqHnVJnWCJTiyq6Egmpad9A==" "ITB"
```

**Output:** `ITB_prodi_YYYY-MM-DD.xlsx`

**Yang diambil:**
- Kode Program Studi
- Nama Program Studi
- Jenjang (D1, D2, D3, D4, S1, S2, S3)
- Status
- Akreditasi
- Jumlah Dosen (NIDN, NIDK, Total)
- Jumlah Dosen Ajar
- Jumlah Mahasiswa
- Rasio Dosen:Mahasiswa

---

### 4. Scrape Multiple Kampus dengan Program Studi

Mengambil data kampus beserta program studi mereka sekaligus.

```bash
npm run scrape:multi
```

*Edit file `index.js` untuk menambahkan kampus yang ingin di-scrape di dalam function `scrape:multi`*

---

### 5. Tampilkan Bantuan

```bash
node index.js help
npm start
```

## 📁 Struktur Project

```
scrapping-pddikti/
├── index.js                    # Entry point & CLI handler
├── package.json                # Dependencies & scripts
├── readme.md                   # Documentation
├── src/
│   ├── apiClient.js            # API request handler
│   ├── excelExporter.js        # Excel export functions
│   └── scraperService.js       # Main scraper service
└── output/                     # Folder untuk file Excel hasil
    ├── kampus_indonesia_2024-01-15.xlsx
    ├── kampus_by_provinsi_2024-01-15.xlsx
    └── ITB_prodi_2024-01-15.xlsx
```

## 🔌 Dokumentasi API

### API Endpoint 1: List Kampus

```
GET https://api-pddikti.kemdiktisaintek.go.id/v2/pt/search/filter
```

**Parameters:**
- `limit` (number) - Jumlah data per page (default: 15, max: 50)
- `page` (number) - Nomor halaman
- `akreditasi` (string) - Filter akreditasi
- `jenis` (string) - Filter jenis (Negeri/Swasta)
- `provinsi` (string) - Filter provinsi
- `status` (string) - Filter status

**Response Example:**
```json
{
  "data": [
    {
      "id_sp": "BibdbmVxooet6XQNXiQ5G4BCHGInmeEjZyLxeY_6_6vv3RsXcuWKjuc6De2e1YXnBUxKwQ==",
      "kab_kota_pt": "Kab. Deli Serdang",
      "provinsi_pt": "Prov. Sumatera Utara",
      "akreditasi": "",
      "nama_singkat": "",
      "status_pt": "Alih Bentuk",
      "nama_pt": "Akademi Keperawatan Binalita Sudama",
      "jenis_pt": "Swasta",
      "jumlah_prodi": 1,
      "range_biaya_kuliah": ""
    }
  ],
  "page": 1,
  "limit": 15,
  "totalItems": 6670,
  "totalPages": 445
}
```

---

### API Endpoint 2: Program Studi

```
GET https://api-pddikti.kemdiktisaintek.go.id/pt/prodi/{ID_SP}/{YEARMONTH}
```

**Parameters:**
- `ID_SP` (string) - ID kampus yang di-encode
- `YEARMONTH` (string) - Tahun bulan (contoh: 20251)

**Response Example:**
```json
[
  {
    "id_sms": "3AsBsBR7Vy-31cY48w-UPw6sTGXOTmvJWV9VgvkUj4Waznp1gYr1doH4cUzTjWkd3pXLhg==",
    "kode_prodi": "92304",
    "nama_prodi": "Ketatalaksanaan Angkutan Laut dan Kepelabuhanan",
    "akreditasi": "Unggul",
    "jenjang_prodi": "D4",
    "status_prodi": "Aktif",
    "jumlah_dosen_nidn": 25,
    "jumlah_dosen_nidk": 3,
    "jumlah_dosen": 28,
    "jumlah_dosen_ajar": 44,
    "jumlah_mahasiswa": 510,
    "rasio": "1:11.59",
    "indikator_kelengkapan_data": 0
  }
]
```

## 🎓 Script Scrape Semua Prodi

### ⭐ FITUR TERBARU: Scrape Semua Program Studi dari Seluruh Kampus Indonesia

Script baru ini memungkinkan Anda untuk **mengambil semua program studi dari seluruh kampus di Indonesia dalam satu kali eksekusi**. Script akan:

1. ✅ Mengambil data semua kampus (6670+ kampus)
2. ✅ Untuk setiap kampus, mengambil semua program studi-nya
3. ✅ Menyimpan ke Excel dengan multiple sheets (Summary, Semua Prodi, Per Kampus)
4. ✅ Automatic retry jika ada error
5. ✅ Progress bar dan logging yang informatif

**Penggunaan:**

```bash
npm run scrape:all-prodi
```

**Waktu Eksekusi:** Sekitar 30-45 menit (tergantung kecepatan internet)

**Output File:** `semua_prodi_YYYY-MM-DD.xlsx`

**Yang Dihasilkan dalam Excel:**

**Sheet 1: Summary**
- Total kampus
- Total program studi
- Statistik per jenjang (D3, S1, S2, S3)
- Rata-rata prodi per kampus
- Waktu eksekusi

**Sheet 2: Semua Prodi** (Data lengkap kombinasi dari semua kampus)
- Nomor urut
- Nama kampus
- Kode prodi
- Nama program studi
- Jenjang
- Status prodi
- Akreditasi
- Jumlah dosen
- Jumlah mahasiswa

**Sheet 3: Per Kampus** (Ringkasan per kampus)
- Nomor urut
- Nama kampus
- Total prodi
- Jumlah S1, S2, S3
- Status (Sukses/Gagal/Kosong)

**Contoh Output:**

Jika Anda menjalankan:
```bash
npm run scrape:all-prodi
```

Anda akan melihat output seperti ini:

```
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   📚 PDDIKTI DATA SCRAPER - Scrape SEMUA Program Studi   ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝

[HH:MM:SS] 🚀 Mengambil data semua kampus...
[HH:MM:SS] ℹ️  Halaman 1/134 - Total: 50/6670
[HH:MM:SS] ℹ️  Halaman 2/134 - Total: 100/6670
...
[HH:MM:SS] ✅ Selesai mengambil 6670 kampus

[HH:MM:SS] 🚀 Memulai scraping program studi dari 6670 kampus...
───────────────────────────────────────────────────────────
[HH:MM:SS] ✅ [1/6670] Institut Teknologi Bandung: 45 prodi
[HH:MM:SS] ✅ [2/6670] Universitas Indonesia: 67 prodi
...
[HH:MM:SS] 🚀 Menyimpan data ke Excel...

════════════════════════════════════════════════════════════
📊 SUMMARY HASIL SCRAPING
════════════════════════════════════════════════════════════
✅ Kampus berhasil  : 6670/6670
❌ Kampus gagal     : 0/6670
📚 Total program studi: 84,562
⏱️  Waktu proses     : 38m 24s
📁 Output file      : semua_prodi_2024-01-15.xlsx
════════════════════════════════════════════════════════════

✨ SCRAPING SELESAI!
```

**Keuntungan menggunakan script ini:**

✨ **Hemat Waktu** - Tidak perlu menjalankan command berulang kali untuk setiap kampus
✨ **Lengkap** - Mendapatkan semua prodi dari semua kampus sekaligus
✨ **Terstruktur** - Data tersimpan dalam Excel dengan multiple sheets yang rapi
✨ **Robust** - Automatic retry jika ada error pada kampus tertentu
✨ **Progress Tracking** - Bisa melihat progress scraping secara real-time

**Tips Penggunaan:**

1. **Jalankan di latar belakang** - Script berjalan 30-45 menit, bisa dijalankan sambil melakukan pekerjaan lain
2. **Jangan matikan program** - Biarkan script berjalan sampai selesai
3. **File akan disimpan di folder `output/`** - Cek folder tersebut setelah selesai
4. **Jika ada error**, script akan membuat file `scrape_summary_YYYY-MM-DD.json` dengan detail error

---

## 💡 Contoh Penggunaan

### Contoh 1: Scrape Kampus dengan Filter Provinsi

Edit file `index.js` dan ubah command `scrape:kampus`:

```javascript
'scrape:kampus': async () => {
  try {
    const result = await scraperService.scrapeCampuses({
      filters: {
        provinsi: 'Prov. Jawa Barat'
      },
      filename: `kampus_jabar_${new Date().toISOString().split('T')[0]}.xlsx`
    });

    console.log(`\n✨ ${result.message}`);
    console.log(`📁 File disimpan di: ${result.filepath}\n`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}
```

Kemudian jalankan:
```bash
npm run scrape:kampus
```

---

### Contoh 2: Scrape Kampus Negeri Saja

```javascript
const result = await scraperService.scrapeCampuses({
  filters: {
    jenis: 'Negeri'
  }
});
```

---

### Contoh 3: Scrape Program Studi Multiple Kampus

Edit command `scrape:multi` di `index.js`:

```javascript
'scrape:multi': async () => {
  try {
    const kampusList = [
      {
        id_sp: 'VXXgSp6KsRtr6UcyeW7lGZHnxDCcstultx8_291FhFZXv54rqHnVJnWCJTiyq6Egmpad9A==',
        nama_pt: 'Institut Teknologi Bandung'
      },
      {
        id_sp: 'ANOTHER_ID_SP',
        nama_pt: 'Universitas Indonesia'
      }
    ];

    const result = await scraperService.scrapeCampusesWithProdi(kampusList);
    console.log(`\n✨ ${result.message}`);
    console.log(`📊 Total kampus: ${result.dataCount}\n`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}
```

---

### Contoh 4: Custom Script

Buat file baru `custom-scrape.js`:

```javascript
const scraperService = require('./src/scraperService');

async function main() {
  try {
    // Scrape kampus Jawa Timur dengan akreditasi A
    const result = await scraperService.scrapeCampuses({
      filters: {
        provinsi: 'Prov. Jawa Timur',
        akreditasi: 'A'
      },
      filename: 'kampus_jatim_akreditasi_a.xlsx'
    });

    console.log(result);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

Jalankan dengan:
```bash
node custom-scrape.js
```

## 🔧 Konfigurasi

### Mengubah Output Filename

Di `index.js`, ubah parameter `filename` di setiap command:

```javascript
filename: `kampus_custom_${new Date().toISOString().split('T')[0]}.xlsx`
```

### Mengubah Limit Data Per Request

Default limit adalah 50 (maksimal API). Jika ingin mengubah:

```javascript
const result = await scraperService.scrapeCampuses({
  limit: 30  // Ubah ini
});
```

### Mengubah Delay Antar Request

Di `src/apiClient.js`, ubah nilai delay:

```javascript
await new Promise(resolve => setTimeout(resolve, 500)); // Ubah 500 ke nilai lain (ms)
```

## 🐛 Troubleshooting

### Error: "Cannot find module 'axios'"

**Solusi:** Install dependencies terlebih dahulu
```bash
npm install
```

---

### Error: "Connection timeout"

**Penyebab:** API server tidak merespons atau internet connection bermasalah

**Solusi:**
1. Cek koneksi internet
2. Tunggu beberapa saat dan coba lagi
3. Cek status API di https://pddikti.kemdiktisaintek.go.id

---

### Error: "Rate limit exceeded"

**Penyebab:** Terlalu banyak request dalam waktu singkat

**Solusi:**
1. Script sudah dilengkapi dengan automatic delay
2. Jika masih error, tambah delay di `src/apiClient.js`:

```javascript
await new Promise(resolve => setTimeout(resolve, 1000)); // Ubah 500 menjadi 1000
```

---

### File Excel tidak bisa dibuka

**Solusi:**
1. Pastikan file tidak sedang dibuka di aplikasi lain
2. Coba buka dengan Microsoft Excel versi terbaru atau LibreOffice
3. Jika masih error, coba jalankan scraper lagi

---

### ID_SP dari halaman web berbeda dari API

**Penyebab:** ID_SP di halaman web adalah ID terenkripsi

**Solusi:**
1. Ambil ID_SP dari response API scraper
2. Jangan copy manual dari halaman web

## 📊 Contoh Output Excel

### Sheet: Data Kampus

| No | Nama Kampus | Jenis | Provinsi | Status | Jumlah Prodi |
|----|-------------|-------|----------|--------|--------------|
| 1  | ITB | Negeri | Jawa Barat | Aktif | 45 |
| 2  | UI | Negeri | Jawa Barat | Aktif | 67 |

### Sheet: Data Program Studi

| No | Nama Kampus | Program Studi | Jenjang | Status | Mahasiswa |
|----|-------------|---------------|--------|--------|-----------|
| 1  | ITB | Teknik Informatika | S1 | Aktif | 450 |
| 2  | ITB | Magister Teknik Komputer | S2 | Aktif | 120 |

## 📝 Notes

- ⚠️ **Respect API Rate Limiting**: Jangan jalankan script terlalu sering untuk menghindari IP ban
- 📌 **Data Accuracy**: Data diperoleh langsung dari API resmi PDDIKTI
- 🔄 **Update**: Untuk data terbaru, jalankan script lagi
- 💾 **Backup**: Jangan lupa backup file Excel penting
- ⭐ **Script Scrape All Prodi**: Untuk hasil terlengkap, gunakan `npm run scrape:all-prodi`
- ⏱️ **Waktu Eksekusi**: Script besar bisa memakan waktu 30-45 menit, ini normal

## 📄 License

ISC

## 👨‍💻 Author

Created for scraping PDDIKTI data

---

Selamat menggunakan PDDIKTI Data Scraper! 🚀

Jika ada pertanyaan atau masalah, periksa kembali panduan ini atau jalankan `npm start` untuk melihat bantuan.