// data.js - Dataset awal, kategori, dan konfigurasi default DompetRantau

export const KATEGORI = [
  'Makanan',
  'Transportasi',
  'Belanja',
  'Tagihan',
  'Hiburan',
  'Kesehatan',
  'Pendidikan',
  'Lainnya',
];

// Budget default per kategori (dalam Rupiah)
export const BUDGET_DEFAULT = {
  Makanan: 400000,
  Transportasi: 200000,
  Belanja: 300000,
  Tagihan: 900000,
  Hiburan: 150000,
  Kesehatan: 100000,
  Pendidikan: 200000,
  Lainnya: 100000,
};

// Dataset transaksi awal
export const TRANSAKSI_DEFAULT = [
  { id: 't1',  tanggal: '2026-07-01', deskripsi: 'Bayar kos bulanan',            kategori: 'Tagihan',       jumlah: 800000 },
  { id: 't2',  tanggal: '2026-07-02', deskripsi: 'Makan siang warteg',           kategori: 'Makanan',       jumlah: 18000  },
  { id: 't3',  tanggal: '2026-07-04', deskripsi: 'Bensin motor',                 kategori: 'Transportasi',  jumlah: 35000  },
  { id: 't4',  tanggal: '2026-07-06', deskripsi: 'Kuota internet',               kategori: 'Tagihan',       jumlah: 75000  },
  { id: 't5',  tanggal: '2026-07-09', deskripsi: 'Nonton bioskop',               kategori: 'Hiburan',       jumlah: 45000  },
  { id: 't6',  tanggal: '2026-07-12', deskripsi: 'Beli buku kuliah',             kategori: 'Pendidikan',    jumlah: 120000 },
  { id: 't7',  tanggal: '2026-07-15', deskripsi: 'Groceries mingguan',           kategori: 'Makanan',       jumlah: 95000  },
  { id: 't8',  tanggal: '2026-07-20', deskripsi: 'Beli kaos',                    kategori: 'Belanja',       jumlah: 150000 },
  { id: 't9',  tanggal: '2026-07-25', deskripsi: 'Obat flu',                     kategori: 'Kesehatan',     jumlah: 32000  },
  { id: 't10', tanggal: '2026-08-01', deskripsi: 'Bayar kos bulanan',            kategori: 'Tagihan',       jumlah: 800000 },
  { id: 't11', tanggal: '2026-08-03', deskripsi: 'Makan malam bersama teman',   kategori: 'Makanan',       jumlah: 65000  },
  { id: 't12', tanggal: '2026-08-05', deskripsi: 'Ojek online',                  kategori: 'Transportasi',  jumlah: 28000  },
  { id: 't13', tanggal: '2026-08-07', deskripsi: 'Kuota internet',               kategori: 'Tagihan',       jumlah: 75000  },
  { id: 't14', tanggal: '2026-08-10', deskripsi: 'Langganan streaming',          kategori: 'Hiburan',       jumlah: 54000  },
  { id: 't15', tanggal: '2026-08-14', deskripsi: 'Groceries mingguan',           kategori: 'Makanan',       jumlah: 110000 },
  { id: 't16', tanggal: '2026-08-18', deskripsi: 'Servis motor',                 kategori: 'Transportasi',  jumlah: 150000 },
  { id: 't17', tanggal: '2026-08-21', deskripsi: 'Beli sepatu',                  kategori: 'Belanja',       jumlah: 285000 },
  { id: 't18', tanggal: '2026-08-27', deskripsi: 'Fotokopi dan print tugas',     kategori: 'Pendidikan',    jumlah: 25000  },
  { id: 't19', tanggal: '2026-09-01', deskripsi: 'Bayar kos bulanan',            kategori: 'Tagihan',       jumlah: 800000 },
  { id: 't20', tanggal: '2026-09-02', deskripsi: 'Sarapan nasi uduk',            kategori: 'Makanan',       jumlah: 15000  },
  { id: 't21', tanggal: '2026-09-05', deskripsi: 'Bensin motor',                 kategori: 'Transportasi',  jumlah: 40000  },
  { id: 't22', tanggal: '2026-09-08', deskripsi: 'Kuota internet',               kategori: 'Tagihan',       jumlah: 75000  },
  { id: 't23', tanggal: '2026-09-11', deskripsi: 'Konser musik',                 kategori: 'Hiburan',       jumlah: 200000 },
  { id: 't24', tanggal: '2026-09-14', deskripsi: 'Groceries mingguan',           kategori: 'Makanan',       jumlah: 120000 },
  { id: 't25', tanggal: '2026-09-17', deskripsi: 'Periksa dokter',               kategori: 'Kesehatan',     jumlah: 150000 },
  { id: 't26', tanggal: '2026-09-22', deskripsi: 'Kursus online',                kategori: 'Pendidikan',    jumlah: 199000 },
  { id: 't27', tanggal: '2026-09-28', deskripsi: 'Hadiah ulang tahun teman',     kategori: 'Lainnya',       jumlah: 100000 },
  { id: 't28', tanggal: '2026-10-01', deskripsi: 'Bayar kos bulanan',            kategori: 'Tagihan',       jumlah: 800000 },
  { id: 't29', tanggal: '2026-10-03', deskripsi: 'Makan siang ayam geprek',      kategori: 'Makanan',       jumlah: 22000  },
  { id: 't30', tanggal: '2026-10-06', deskripsi: 'Ojek online',                  kategori: 'Transportasi',  jumlah: 32000  },
  { id: 't31', tanggal: '2026-10-08', deskripsi: 'Kuota internet',               kategori: 'Tagihan',       jumlah: 75000  },
  { id: 't32', tanggal: '2026-10-12', deskripsi: 'Groceries mingguan',           kategori: 'Makanan',       jumlah: 105000 },
  { id: 't33', tanggal: '2026-10-15', deskripsi: 'Nonton bioskop',               kategori: 'Hiburan',       jumlah: 50000  },
  { id: 't34', tanggal: '2026-10-19', deskripsi: 'Beli headset',                 kategori: 'Belanja',       jumlah: 175000 },
  { id: 't35', tanggal: '2026-10-23', deskripsi: 'Vitamin',                      kategori: 'Kesehatan',     jumlah: 60000  },
  { id: 't36', tanggal: '2026-10-27', deskripsi: 'Donasi',                       kategori: 'Lainnya',       jumlah: 50000  },
  { id: 't37', tanggal: '2026-10-30', deskripsi: 'Bensin motor',                 kategori: 'Transportasi',  jumlah: 38000  },
];

// Riwayat penyesuaian saldo awal
export const SALDO_AWAL_DEFAULT = [
  { id: 's1', tanggal: '2026-07-01', catatan: 'Kiriman bulanan', jumlah: 2000000, tipe: 'tambah' },
  { id: 's2', tanggal: '2026-08-01', catatan: 'Kiriman bulanan', jumlah: 2000000, tipe: 'tambah' },
  { id: 's3', tanggal: '2026-09-01', catatan: 'Kiriman bulanan', jumlah: 2000000, tipe: 'tambah' },
  { id: 's4', tanggal: '2026-10-01', catatan: 'Kiriman bulanan', jumlah: 2000000, tipe: 'tambah' },
];

// Fungsi bantu: buat ID unik sederhana
export function buatId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
