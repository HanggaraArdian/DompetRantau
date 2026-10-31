# DompetRantau 💼

> **Uang rantau, tercatat rapi.**

Aplikasi web front-end untuk mencatat dan menganalisis pengeluaran pribadi, memantau saldo, dan mendapatkan saran hemat otomatis. Dirancang khusus untuk perantau — mahasiswa atau pekerja muda yang ingin tahu ke mana uangnya pergi.

---

## 🚀 Cara Menjalankan

Aplikasi menggunakan ES Modules (`<script type="module">`), sehingga **harus dijalankan lewat server lokal**, bukan dibuka langsung lewat `file://`.

### Opsi 1 — VS Code Live Server
1. Buka folder `DompetRantau` di VS Code.
2. Klik kanan `index.html` → **Open with Live Server**.
3. Browser akan membuka `http://127.0.0.1:5500` secara otomatis.

### Opsi 2 — npx serve
```bash
# Di dalam folder DompetRantau:
npx serve .
# Lalu buka alamat yang tampil di terminal, biasanya http://localhost:3000
```

### Opsi 3 — Python HTTP Server
```bash
python -m http.server 8080
# Buka http://localhost:8080
```

---

## ✨ Fitur

| # | Fitur | Status |
|---|-------|--------|
| 1 | Input pengeluaran manual (form + validasi) | ✅ |
| 2 | Import CSV (validasi per baris + mode gabung/timpa) | ✅ |
| 3 | Dataset awal & tombol Reset ke Data Awal | ✅ |
| 4 | Saldo sekarang, estimasi hari, riwayat edit/hapus | ✅ |
| 5 | Budget bulanan per kategori + progress bar warna | ✅ |
| 6 | Insight otomatis + saran tindakan (rule-based) | ✅ |
| 7 | Grafik doughnut distribusi per kategori | ✅ |
| 8 | Grafik bar tren pengeluaran bulanan | ✅ |
| 9 | Tabel transaksi (search, filter, sort, edit, hapus) | ✅ |
| 10 | Kartu ringkasan (total, rata-rata, kategori terbesar) | ✅ |
| 11 | Export laporan ke CSV (mengikuti filter aktif) | ✅ |
| 12 | Dark mode (toggle + ikuti preferensi sistem) | ✅ |
| 13 | Branding: logo SVG, favicon, tagline, warna aksen teal | ✅ |

---

## 📁 Struktur Folder

```
DompetRantau/
├── index.html              # Halaman utama
├── sample-expenses.csv     # Contoh file untuk uji import
├── README.md               # Dokumentasi ini
├── css/
│   └── style.css           # Kustomisasi di luar Tailwind
└── js/
    ├── data.js             # Dataset awal, kategori, budget default
    ├── storage.js          # Wrapper localStorage (prefix: dompetrantau_)
    ├── calc.js             # Kalkulasi: saldo, ringkasan, budget, tren
    ├── insights.js         # Aturan insight & saran otomatis
    ├── charts.js           # Inisialisasi & update Chart.js
    ├── ui.js               # Render, modal, event handler
    └── app.js              # Inisialisasi & penghubung modul
```

---

## 🧠 Aturan Insight Otomatis

Insight dihasilkan oleh `js/insights.js` secara rule-based tanpa API eksternal. Ditampilkan maksimal **5 insight**, diurutkan dari paling mendesak (merah → kuning → hijau → info).

| Warna | Kondisi | Saran |
|-------|---------|-------|
| 🔴 Merah | Budget kategori terlampaui (>100%) | Sarankan batas harian |
| 🔴 Merah | Saldo negatif | Cek catatan pemasukan |
| 🔴 Merah | Estimasi saldo cukup <15 hari | Kurangi pengeluaran harian |
| 🟡 Kuning | Budget hampir habis (80–100%) | Batas harian sisa bulan |
| 🟡 Kuning | Kategori naik >10% vs bulan lalu | Target pengurangan = ½ dari % kenaikan (min 5%, maks 30%) |
| 🟡 Kuning | Kategori dominan >40% total (non-Tagihan) | Evaluasi alokasi |
| 🟢 Hijau | Kategori turun >10% vs bulan lalu | Apresiasi + saran alihkan ke tabungan |
| ℹ️ Info | Data hanya 1 bulan | Penjelasan butuh minimal 2 bulan |

---

## 🧪 Skenario Uji

1. **Tambah transaksi** → masukkan pengeluaran baru → cek saldo berkurang otomatis.
2. **Ubah budget** → edit nominal budget kategori → cek warna progress bar berubah.
3. **Import CSV** → klik "Pilih File CSV" → pilih `sample-expenses.csv` → pilih mode timpa → konfirmasi data terganti.
4. **Dark mode** → klik tombol 🌙 Gelap → tampilan berubah, grafik ikut menyesuaikan.
5. **Reset data** → klik "Reset ke Data Awal" → konfirmasi → data kembali ke kondisi awal.
6. **Export** → gunakan filter (contoh: kategori Makanan) → klik "Ekspor CSV" → file CSV terunduh sesuai filter.
7. **Sort tabel** → klik header kolom "Jumlah" → tabel diurutkan, klik lagi untuk membalik arah.

---

## 🔑 LocalStorage Keys

| Kunci | Isi |
|-------|-----|
| `dompetrantau_transaksi` | Array transaksi pengeluaran |
| `dompetrantau_saldo` | Array riwayat penyesuaian saldo |
| `dompetrantau_budget` | Objek budget per kategori |
| `dompetrantau_tema` | `"dark"` atau `"light"` |

---

## 🛠 Tech Stack

- **HTML5** + **Tailwind CSS** (via CDN, `darkMode: 'class'`)
- **JavaScript ES6+** (ES Modules)
- **Chart.js** v4 (via CDN)
- Penyimpanan: `localStorage` saja — murni front-end, tanpa backend.
