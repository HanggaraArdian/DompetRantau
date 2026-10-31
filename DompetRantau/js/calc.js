// calc.js - Perhitungan saldo, ringkasan, dan budget DompetRantau

import { KATEGORI } from './data.js';

// --- Format Rupiah ---
export function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
}

// --- Format tanggal Indonesia ---
export function formatTanggal(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr + 'T00:00:00');
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
}

// --- Hitung saldo sekarang ---
// Saldo = total penyesuaian saldo - total pengeluaran
export function hitungSaldo(transaksi, riwayatSaldo) {
  const totalKeluar = transaksi.reduce((s, t) => s + t.jumlah, 0);
  const totalMasuk  = riwayatSaldo.reduce((s, r) => {
    return r.tipe === 'tambah' ? s + r.jumlah : s - r.jumlah;
  }, 0);
  return totalMasuk - totalKeluar;
}

// --- Ambil YYYY-MM dari string tanggal ---
export function getBulanDariTanggal(isoStr) {
  return isoStr ? isoStr.slice(0, 7) : '';
}

// --- Daftar bulan unik dari transaksi (diurutkan terbaru ke terlama) ---
export function getDaftarBulan(transaksi) {
  const set = new Set(transaksi.map(t => getBulanDariTanggal(t.tanggal)));
  return Array.from(set).sort((a, b) => b.localeCompare(a));
}

// --- Filter transaksi berdasarkan bulan (YYYY-MM), kosong = semua ---
export function filterPerBulan(transaksi, bulan) {
  if (!bulan) return transaksi;
  return transaksi.filter(t => getBulanDariTanggal(t.tanggal) === bulan);
}

// --- Ringkasan bulan ---
export function hitungRingkasan(transaksi) {
  if (!transaksi.length) return { total: 0, rataHari: 0, kategoriTerbesar: '-', jumlahTransaksi: 0 };

  const total = transaksi.reduce((s, t) => s + t.jumlah, 0);
  const jumlahTransaksi = transaksi.length;

  // Hitung jumlah hari unik
  const hariUnik = new Set(transaksi.map(t => t.tanggal)).size;
  const rataHari = hariUnik > 0 ? Math.round(total / hariUnik) : 0;

  // Kategori terbesar
  const perKategori = {};
  for (const t of transaksi) {
    perKategori[t.kategori] = (perKategori[t.kategori] || 0) + t.jumlah;
  }
  const kategoriTerbesar = Object.entries(perKategori).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  return { total, rataHari, kategoriTerbesar, jumlahTransaksi };
}

// --- Hitung pengeluaran per kategori untuk bulan tertentu ---
export function hitungPerKategori(transaksi, bulan) {
  const filtered = bulan ? filterPerBulan(transaksi, bulan) : transaksi;
  const result = {};
  for (const kat of KATEGORI) result[kat] = 0;
  for (const t of filtered) {
    if (result[t.kategori] !== undefined) result[t.kategori] += t.jumlah;
  }
  return result;
}

// --- Hitung total pengeluaran per bulan (untuk grafik tren) ---
export function hitungTrenBulanan(transaksi) {
  const perBulan = {};
  for (const t of transaksi) {
    const bln = getBulanDariTanggal(t.tanggal);
    perBulan[bln] = (perBulan[bln] || 0) + t.jumlah;
  }
  // Urutkan dari terlama ke terbaru
  const sorted = Object.entries(perBulan).sort((a, b) => a[0].localeCompare(b[0]));
  return sorted;
}

// --- Format label bulan untuk grafik (YYYY-MM → "Jul 2026") ---
export function formatBulanLabel(bulanStr) {
  if (!bulanStr) return '';
  const [tahun, bln] = bulanStr.split('-');
  const d = new Date(Number(tahun), Number(bln) - 1, 1);
  return new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' }).format(d);
}

// --- Hitung status budget (persen, sisa) ---
export function hitungStatusBudget(perKategori, budget) {
  const result = {};
  for (const kat of KATEGORI) {
    const terpakai = perKategori[kat] || 0;
    const batas   = budget[kat] || 0;
    const persen  = batas > 0 ? Math.round((terpakai / batas) * 100) : (terpakai > 0 ? 999 : 0);
    const sisa    = batas - terpakai;
    let warna;
    if (persen >= 100) warna = 'merah';
    else if (persen >= 70) warna = 'kuning';
    else warna = 'hijau';
    result[kat] = { terpakai, batas, persen, sisa, warna };
  }
  return result;
}

// --- Estimasi saldo cukup untuk berapa hari ---
// Berdasarkan rata-rata pengeluaran harian bulan berjalan
export function estimasiHari(saldo, transaksi) {
  const sekarang = new Date();
  const bulanIni = `${sekarang.getFullYear()}-${String(sekarang.getMonth() + 1).padStart(2, '0')}`;
  const txBulanIni = filterPerBulan(transaksi, bulanIni);

  if (!txBulanIni.length) return null;

  // Hari yang sudah berlalu di bulan ini (gunakan hari transaksi terakhir atau hari ini)
  const hariUnik = new Set(txBulanIni.map(t => t.tanggal)).size;
  const totalBulanIni = txBulanIni.reduce((s, t) => s + t.jumlah, 0);
  const rataHarian = hariUnik > 0 ? Math.round(totalBulanIni / hariUnik) : 0;

  if (rataHarian <= 0) return null;
  return Math.floor(saldo / rataHarian);
}
