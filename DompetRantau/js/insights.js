// insights.js - Aturan insight & saran otomatis DompetRantau

import { KATEGORI } from './data.js';
import {
  hitungPerKategori,
  hitungStatusBudget,
  getDaftarBulan,
  formatRupiah,
  estimasiHari,
  hitungSaldo,
} from './calc.js';

/**
 * Hasilkan daftar insight berdasarkan aturan.
 * @param {Array}  transaksi     - semua transaksi
 * @param {Array}  riwayatSaldo  - riwayat penyesuaian saldo
 * @param {Object} budget        - budget per kategori
 * @param {string} bulanDipilih  - YYYY-MM bulan yang sedang ditampilkan
 * @returns {Array} daftar insight (maks 5), diurutkan dari paling mendesak
 */
export function generateInsights(transaksi, riwayatSaldo, budget, bulanDipilih) {
  const insights = [];
  const daftarBulan = getDaftarBulan(transaksi);
  const saldo = hitungSaldo(transaksi, riwayatSaldo);

  // Tentukan bulan aktif dan bulan sebelumnya
  const bulanAktif = bulanDipilih || daftarBulan[0] || '';
  const idxBulan   = daftarBulan.indexOf(bulanAktif);
  const bulanLalu  = idxBulan >= 0 && idxBulan < daftarBulan.length - 1
    ? daftarBulan[idxBulan + 1]
    : null;

  const perKategoriBulanIni  = hitungPerKategori(transaksi, bulanAktif);
  const perKategoriBulanLalu = bulanLalu ? hitungPerKategori(transaksi, bulanLalu) : null;
  const statusBudget         = hitungStatusBudget(perKategoriBulanIni, budget);

  const totalBulanIni = Object.values(perKategoriBulanIni).reduce((s, v) => s + v, 0);

  // Hitung sisa hari di bulan ini
  const [tahun, bln] = bulanAktif.split('-').map(Number);
  const hariDalamBulan   = new Date(tahun, bln, 0).getDate();
  const hariIni          = new Date();
  const hariSudahBerlalu = bulanAktif === `${hariIni.getFullYear()}-${String(hariIni.getMonth() + 1).padStart(2, '0')}`
    ? hariIni.getDate()
    : hariDalamBulan;
  const sisaHari = Math.max(hariDalamBulan - hariSudahBerlalu, 1);

  // --- Aturan 1: Budget terlampaui (>100%) - prioritas MERAH ---
  for (const kat of KATEGORI) {
    const s = statusBudget[kat];
    if (s.persen > 100 && s.batas > 0) {
      const selisih = s.terpakai - s.batas;
      const batasHarian = Math.round(s.batas / hariDalamBulan);
      insights.push({
        tipe: 'merah',
        ikon: '🚨',
        judul: `Budget ${kat} Terlampaui`,
        temuan: `Pengeluaran ${kat} sudah ${formatRupiah(s.terpakai)} — melebihi budget ${formatRupiah(s.batas)} sebesar ${formatRupiah(selisih)} (${s.persen}%).`,
        saran: `Hentikan atau kurangi pengeluaran ${kat}. Budget harian ideal untuk bulan ini: ${formatRupiah(batasHarian)}/hari.`,
      });
    }
  }

  // --- Aturan 2: Kesehatan saldo rendah (<15 hari) - prioritas MERAH ---
  const estHari = estimasiHari(saldo, transaksi);
  if (saldo >= 0 && estHari !== null && estHari < 15) {
    const rataHarian = estHari > 0 ? Math.round(saldo / estHari) : 0;
    const targetHarian = Math.round(rataHarian * 0.8); // sarankan kurangi 20%
    insights.push({
      tipe: 'merah',
      ikon: '⚠️',
      judul: 'Saldo Hampir Habis',
      temuan: `Estimasi saldo hanya cukup untuk ±${estHari} hari lagi.`,
      saran: `Coba batasi pengeluaran harian maksimal ${formatRupiah(targetHarian)}/hari agar saldo bertahan lebih lama.`,
    });
  } else if (saldo < 0) {
    insights.push({
      tipe: 'merah',
      ikon: '🔴',
      judul: 'Saldo Negatif',
      temuan: `Saldo saat ini ${formatRupiah(saldo)} — pengeluaran melebihi pemasukan tercatat.`,
      saran: 'Segera tambahkan saldo atau kurangi pengeluaran. Cek kembali apakah ada penyesuaian saldo yang belum dicatat.',
    });
  }

  // --- Aturan 3: Budget hampir habis (80–100%) - prioritas KUNING ---
  for (const kat of KATEGORI) {
    const s = statusBudget[kat];
    if (s.persen >= 80 && s.persen <= 100 && s.batas > 0) {
      const sisaBudget    = Math.max(s.sisa, 0);
      const batasHarianSisa = sisaHari > 0 ? Math.round(sisaBudget / sisaHari) : 0;
      insights.push({
        tipe: 'kuning',
        ikon: '🟡',
        judul: `Budget ${kat} Hampir Habis`,
        temuan: `Pengeluaran ${kat} sudah ${s.persen}% dari budget (sisa ${formatRupiah(sisaBudget)}).`,
        saran: `Tersisa ${sisaHari} hari di bulan ini. Batasi ${kat} maksimal ${formatRupiah(batasHarianSisa)}/hari agar budget tidak jebol.`,
      });
    }
  }

  // --- Aturan 4: Kenaikan kategori >10% vs bulan lalu - prioritas KUNING ---
  if (perKategoriBulanLalu) {
    for (const kat of KATEGORI) {
      const nilaiIni  = perKategoriBulanIni[kat] || 0;
      const nilaiLalu = perKategoriBulanLalu[kat] || 0;
      if (nilaiLalu > 0 && nilaiIni > nilaiLalu) {
        const persen = Math.round(((nilaiIni - nilaiLalu) / nilaiLalu) * 100);
        if (persen > 10) {
          // Target pengurangan: setengah dari persen kenaikan, bulat ke kelipatan 5%, min 5%, maks 30%
          let targetPersen = Math.round(persen / 2 / 5) * 5;
          targetPersen = Math.max(5, Math.min(30, targetPersen));
          const nominalKurang = Math.round(nilaiIni * targetPersen / 100);
          insights.push({
            tipe: 'kuning',
            ikon: '📈',
            judul: `${kat} Naik ${persen}%`,
            temuan: `Pengeluaran ${kat} naik ${persen}% dibanding bulan lalu (${formatRupiah(nilaiLalu)} → ${formatRupiah(nilaiIni)}).`,
            saran: `Coba kurangi sekitar ${targetPersen}% (±${formatRupiah(nominalKurang)}) bulan depan agar pengeluaran ${kat} lebih terkendali.`,
          });
        }
      }
    }
  } else if (daftarBulan.length <= 1) {
    insights.push({
      tipe: 'info',
      ikon: 'ℹ️',
      judul: 'Data Masih Sedikit',
      temuan: 'Perbandingan antar bulan membutuhkan minimal 2 bulan data.',
      saran: 'Terus catat pengeluaran setiap hari agar insight lebih akurat dan personal.',
    });
  }

  // --- Aturan 5: Kategori dominan >40% total (kecuali Tagihan) - prioritas KUNING ---
  if (totalBulanIni > 0) {
    for (const kat of KATEGORI) {
      if (kat === 'Tagihan') continue;
      const nilaiIni = perKategoriBulanIni[kat] || 0;
      const persen   = Math.round((nilaiIni / totalBulanIni) * 100);
      if (persen > 40) {
        insights.push({
          tipe: 'kuning',
          ikon: '🔍',
          judul: `${kat} Mendominasi Pengeluaran`,
          temuan: `${kat} menyumbang ${persen}% dari total pengeluaran bulan ini (${formatRupiah(nilaiIni)} dari ${formatRupiah(totalBulanIni)}).`,
          saran: `Evaluasi pengeluaran ${kat}. Coba alokasikan lebih ke tabungan atau kategori yang lebih produktif.`,
        });
      }
    }
  }

  // --- Aturan 6: Kabar baik — kategori turun >10% - prioritas HIJAU ---
  if (perKategoriBulanLalu) {
    for (const kat of KATEGORI) {
      const nilaiIni  = perKategoriBulanIni[kat] || 0;
      const nilaiLalu = perKategoriBulanLalu[kat] || 0;
      if (nilaiLalu > 0 && nilaiIni < nilaiLalu) {
        const persen = Math.round(((nilaiLalu - nilaiIni) / nilaiLalu) * 100);
        if (persen > 10) {
          insights.push({
            tipe: 'hijau',
            ikon: '🎉',
            judul: `Hemat di ${kat}!`,
            temuan: `Pengeluaran ${kat} turun ${persen}% dibanding bulan lalu (${formatRupiah(nilaiLalu)} → ${formatRupiah(nilaiIni)}).`,
            saran: `Pertahankan! Selisih ${formatRupiah(nilaiLalu - nilaiIni)} bisa kamu alihkan ke tabungan atau darurat.`,
          });
        }
      }
    }
  }

  // Urutkan: merah → kuning → hijau → info
  const urutan = { merah: 0, kuning: 1, hijau: 2, info: 3 };
  insights.sort((a, b) => (urutan[a.tipe] ?? 9) - (urutan[b.tipe] ?? 9));

  // Ambil maksimal 5 insight
  return insights.slice(0, 5);
}
