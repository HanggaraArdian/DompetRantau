// storage.js - Wrapper akses localStorage dengan prefix dompetrantau_

const KEYS = {
  transaksi: 'dompetrantau_transaksi',
  saldo:     'dompetrantau_saldo',
  budget:    'dompetrantau_budget',
  tema:      'dompetrantau_tema',
};

// Simpan data ke localStorage
function simpan(kunci, data) {
  try {
    localStorage.setItem(kunci, JSON.stringify(data));
  } catch (e) {
    console.error('Gagal menyimpan ke localStorage:', e);
  }
}

// Ambil data dari localStorage; kembalikan null jika tidak ada/error
function ambil(kunci) {
  try {
    const raw = localStorage.getItem(kunci);
    return raw !== null ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Gagal membaca dari localStorage:', e);
    return null;
  }
}

// Hapus satu kunci
function hapus(kunci) {
  try {
    localStorage.removeItem(kunci);
  } catch (e) {
    console.error('Gagal menghapus dari localStorage:', e);
  }
}

// --- Transaksi ---
export function getTransaksi() {
  return ambil(KEYS.transaksi) || null;
}
export function setTransaksi(data) {
  simpan(KEYS.transaksi, data);
}

// --- Riwayat saldo ---
export function getSaldo() {
  return ambil(KEYS.saldo) || null;
}
export function setSaldo(data) {
  simpan(KEYS.saldo, data);
}

// --- Budget ---
export function getBudget() {
  return ambil(KEYS.budget) || null;
}
export function setBudget(data) {
  simpan(KEYS.budget, data);
}

// --- Tema ---
export function getTema() {
  return ambil(KEYS.tema);
}
export function setTema(tema) {
  simpan(KEYS.tema, tema);
}

// Cek apakah localStorage sudah ada data (inisialisasi pertama kali)
export function sudahAdaData() {
  return ambil(KEYS.transaksi) !== null;
}

// Reset semua data ke null (hapus semua kunci)
export function resetSemua() {
  hapus(KEYS.transaksi);
  hapus(KEYS.saldo);
  hapus(KEYS.budget);
}
