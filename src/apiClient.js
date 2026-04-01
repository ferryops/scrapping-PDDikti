const axios = require('axios');

const API_BASE_URL = 'https://api-pddikti.kemdiktisaintek.go.id';

const headers = {
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
  'Connection': 'keep-alive',
  'Origin': 'https://pddikti.kemdiktisaintek.go.id',
  'Referer': 'https://pddikti.kemdiktisaintek.go.id/',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-site',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
  'X-User-IP': '114.10.138.213',
  'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"'
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: headers,
  timeout: 10000
});

// Fungsi untuk scrapping data kampus
async function fetchCampuses(limit = 15, page = 1, filters = {}) {
  try {
    const params = new URLSearchParams({
      limit,
      page,
      akreditasi: filters.akreditasi || '',
      jenis: filters.jenis || '',
      provinsi: filters.provinsi || '',
      status: filters.status || ''
    });

    const response = await apiClient.get(`/v2/pt/search/filter?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching campuses:', error.message);
    throw error;
  }
}

// Fungsi untuk scrapping data program studi
async function fetchProdi(idSp, yearMonth = '20251') {
  try {
    const response = await apiClient.get(`/pt/prodi/${idSp}/${yearMonth}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching prodi for ${idSp}:`, error.message);
    throw error;
  }
}

// Fungsi untuk fetch semua kampus dengan pagination
async function fetchAllCampuses(filters = {}) {
  let allData = [];
  let currentPage = 1;
  let totalPages = 1;
  const limit = 50;

  console.log('🔄 Mulai mengambil data kampus...');

  while (currentPage <= totalPages) {
    try {
      console.log(`📄 Mengambil halaman ${currentPage}/${totalPages}...`);
      const result = await fetchCampuses(limit, currentPage, filters);
      
      allData = allData.concat(result.data);
      totalPages = result.totalPages;
      currentPage++;

      // Delay untuk menghindari rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Gagal mengambil halaman ${currentPage}:`, error.message);
      throw error;
    }
  }

  console.log(`✅ Selesai mengambil ${allData.length} data kampus`);
  return allData;
}

module.exports = {
  fetchCampuses,
  fetchProdi,
  fetchAllCampuses,
  apiClient
};