// ui.js - Render, modal, dan event handler DompetRantau

import { KATEGORI, buatId } from './data.js';
import {
  formatRupiah, formatTanggal, hitungSaldo, getDaftarBulan,
  filterPerBulan, hitungRingkasan, hitungPerKategori,
  hitungStatusBudget, estimasiHari, getBulanDariTanggal,
} from './calc.js';
import { generateInsights } from './insights.js';
import { updateChartDoughnut, updateChartTren, updateChartTheme } from './charts.js';
import { setTransaksi, setSaldo, setBudget, setTema, getTema } from './storage.js';

// =====================================================================
// STATE LOKAL UI
// =====================================================================
let state = {
  transaksi:    [],
  riwayatSaldo: [],
  budget:       {},
  bulanDipilih: '',
  // Filter tabel
  filterKat:    '',
  filterBulanAwal: '',
  filterBulanAkhir: '',
  cariTeks:     '',
  urutKolom:    'tanggal',
  urutAsc:      false,
};

// =====================================================================
// INISIALISASI STATE
// =====================================================================
export function initState(transaksi, riwayatSaldo, budget) {
  state.transaksi    = transaksi;
  state.riwayatSaldo = riwayatSaldo;
  state.budget       = budget;
  // Set bulan default = bulan terbaru
  const daftarBulan  = getDaftarBulan(transaksi);
  state.bulanDipilih = daftarBulan[0] || '';
}

// =====================================================================
// ESCAPE HTML — hindari XSS
// =====================================================================
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// =====================================================================
// RENDER UTAMA — render ulang seluruh halaman
// =====================================================================
export function renderSemua() {
  renderSaldo();
  renderRiwayatSaldo();
  renderPemilihBulan();
  renderRingkasan();
  renderBudget();
  renderInsight();
  renderTabel();
  updateChartDoughnut(state.transaksi, state.bulanDipilih);
  updateChartTren(state.transaksi);
}

// =====================================================================
// RENDER SALDO
// =====================================================================
export function renderSaldo() {
  const saldo  = hitungSaldo(state.transaksi, state.riwayatSaldo);
  const estHari = estimasiHari(saldo, state.transaksi);
  const negatif = saldo < 0;

  const elNominal = document.getElementById('saldo-nominal');
  const elEst     = document.getElementById('saldo-estimasi');
  const elWarn    = document.getElementById('saldo-warning');

  if (elNominal) {
    elNominal.textContent = formatRupiah(saldo);
    elNominal.className = negatif
      ? 'text-4xl font-bold text-red-500'
      : 'text-4xl font-bold text-emerald-500';
  }
  if (elEst) {
    elEst.textContent = estHari !== null
      ? `Estimasi cukup untuk ±${estHari} hari`
      : 'Belum ada data pengeluaran bulan ini';
  }
  if (elWarn) {
    // Gunakan toggle class Tailwind agar tidak bentrok dengan class 'flex'
    elWarn.classList.toggle('hidden', !negatif);
    elWarn.classList.toggle('flex', negatif);
  }
}

// =====================================================================
// RENDER RIWAYAT SALDO
// =====================================================================
export function renderRiwayatSaldo() {
  const el = document.getElementById('riwayat-saldo-list');
  if (!el) return;

  if (!state.riwayatSaldo.length) {
    el.innerHTML = '<p class="text-sm text-slate-400 dark:text-slate-500 py-2">Belum ada riwayat penyesuaian saldo.</p>';
    return;
  }

  // Urutkan terbaru di atas
  const sorted = [...state.riwayatSaldo].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  let html = '';
  for (const r of sorted) {
    const tandaWarna = r.tipe === 'tambah'
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-red-500 dark:text-red-400';
    const tanda = r.tipe === 'tambah' ? '+' : '−';
    html += `
      <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0 group">
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">${esc(r.catatan)}</p>
          <p class="text-xs text-slate-400 dark:text-slate-500">${formatTanggal(r.tanggal)}</p>
        </div>
        <span class="font-semibold ${tandaWarna} mr-3">${tanda}${formatRupiah(r.jumlah)}</span>
        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onclick="window.__drEditSaldo('${esc(r.id)}')" class="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600">Edit</button>
          <button onclick="window.__drHapusSaldo('${esc(r.id)}')" class="text-xs px-2 py-1 rounded bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100">Hapus</button>
        </div>
      </div>`;
  }
  el.innerHTML = html;
}

// =====================================================================
// RENDER PEMILIH BULAN
// =====================================================================
export function renderPemilihBulan() {
  const el = document.getElementById('pilih-bulan');
  if (!el) return;
  const daftarBulan = getDaftarBulan(state.transaksi);
  let html = '<option value="">Semua Bulan</option>';
  for (const bln of daftarBulan) {
    const label = formatBulanLabelLokal(bln);
    const sel   = bln === state.bulanDipilih ? ' selected' : '';
    html += `<option value="${esc(bln)}"${sel}>${esc(label)}</option>`;
  }
  el.innerHTML = html;
}

function formatBulanLabelLokal(bulanStr) {
  if (!bulanStr) return 'Semua Bulan';
  const [tahun, bln] = bulanStr.split('-');
  const d = new Date(Number(tahun), Number(bln) - 1, 1);
  return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(d);
}

// =====================================================================
// RENDER RINGKASAN
// =====================================================================
export function renderRingkasan() {
  const filtered = filterPerBulan(state.transaksi, state.bulanDipilih);
  const r = hitungRingkasan(filtered);

  setText('ringkasan-total',          formatRupiah(r.total));
  setText('ringkasan-rata-hari',      formatRupiah(r.rataHari));
  setText('ringkasan-kat-terbesar',   r.kategoriTerbesar);
  setText('ringkasan-jml-transaksi',  String(r.jumlahTransaksi));
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// =====================================================================
// RENDER BUDGET
// =====================================================================
export function renderBudget() {
  const el = document.getElementById('budget-list');
  if (!el) return;

  const perKat    = hitungPerKategori(state.transaksi, state.bulanDipilih);
  const status    = hitungStatusBudget(perKat, state.budget);
  const totalKeluar = Object.values(perKat).reduce((s, v) => s + v, 0);
  const totalBudget = Object.values(state.budget).reduce((s, v) => s + v, 0);

  // Total
  setText('budget-total-pengeluaran', formatRupiah(totalKeluar));
  setText('budget-total-budget',      formatRupiah(totalBudget));

  let html = '';
  for (const kat of KATEGORI) {
    const s = status[kat];
    const pct = Math.min(s.persen, 100);
    let barColor, textColor;
    if (s.warna === 'merah')       { barColor = 'bg-red-500';    textColor = 'text-red-600 dark:text-red-400'; }
    else if (s.warna === 'kuning') { barColor = 'bg-amber-400';  textColor = 'text-amber-600 dark:text-amber-400'; }
    else                           { barColor = 'bg-emerald-500'; textColor = 'text-emerald-600 dark:text-emerald-400'; }

    html += `
      <div class="mb-4">
        <div class="flex justify-between items-center mb-1">
          <span class="text-sm font-medium text-slate-700 dark:text-slate-200">${esc(kat)}</span>
          <div class="flex items-center gap-2">
            <span class="text-xs ${textColor} font-semibold">${s.persen}%</span>
            <input type="number" data-kat="${esc(kat)}" value="${s.batas}"
              class="w-24 text-xs border border-slate-200 dark:border-slate-600 rounded px-1 py-0.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-right"
              onchange="window.__drUbahBudget('${esc(kat)}', this.value)"
              aria-label="Budget ${esc(kat)}">
          </div>
        </div>
        <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
          <div class="${barColor} h-2.5 rounded-full transition-all duration-300" style="width:${pct}%"></div>
        </div>
        <div class="flex justify-between mt-1">
          <span class="text-xs text-slate-400 dark:text-slate-500">${formatRupiah(s.terpakai)} terpakai</span>
          <span class="text-xs text-slate-400 dark:text-slate-500">Budget: ${formatRupiah(s.batas)}</span>
        </div>
      </div>`;
  }
  el.innerHTML = html;
}

// =====================================================================
// RENDER INSIGHT
// =====================================================================
export function renderInsight() {
  const el = document.getElementById('insight-list');
  if (!el) return;

  const insights = generateInsights(state.transaksi, state.riwayatSaldo, state.budget, state.bulanDipilih);

  if (!insights.length) {
    el.innerHTML = '<p class="text-sm text-slate-400 dark:text-slate-500">Belum ada insight untuk ditampilkan. Tambahkan lebih banyak transaksi!</p>';
    return;
  }

  const styleMap = {
    merah:  'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800',
    kuning: 'border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800',
    hijau:  'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800',
    info:   'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800',
  };
  const judul_color = {
    merah:  'text-red-700 dark:text-red-300',
    kuning: 'text-amber-700 dark:text-amber-300',
    hijau:  'text-emerald-700 dark:text-emerald-300',
    info:   'text-blue-700 dark:text-blue-300',
  };

  let html = '';
  for (const ins of insights) {
    html += `
      <div class="border rounded-xl p-4 ${styleMap[ins.tipe] || styleMap.info}">
        <div class="flex items-start gap-3">
          <span class="text-2xl" aria-hidden="true">${ins.ikon}</span>
          <div>
            <p class="font-semibold text-sm mb-1 ${judul_color[ins.tipe] || ''}">${esc(ins.judul)}</p>
            <p class="text-sm text-slate-600 dark:text-slate-300 mb-1">${esc(ins.temuan)}</p>
            <p class="text-sm font-medium text-slate-700 dark:text-slate-200"><span class="text-emerald-600 dark:text-emerald-400">💡 Saran:</span> ${esc(ins.saran)}</p>
          </div>
        </div>
      </div>`;
  }
  el.innerHTML = html;
}

// =====================================================================
// RENDER TABEL TRANSAKSI
// =====================================================================
export function renderTabel() {
  // Terapkan filter
  let data = [...state.transaksi];

  if (state.filterKat) {
    data = data.filter(t => t.kategori === state.filterKat);
  }
  if (state.filterBulanAwal) {
    data = data.filter(t => getBulanDariTanggal(t.tanggal) >= state.filterBulanAwal);
  }
  if (state.filterBulanAkhir) {
    data = data.filter(t => getBulanDariTanggal(t.tanggal) <= state.filterBulanAkhir);
  }
  if (state.cariTeks) {
    const q = state.cariTeks.toLowerCase();
    data = data.filter(t => t.deskripsi.toLowerCase().includes(q));
  }

  // Urut
  data.sort((a, b) => {
    let va = a[state.urutKolom], vb = b[state.urutKolom];
    if (state.urutKolom === 'jumlah') { va = Number(va); vb = Number(vb); }
    if (va < vb) return state.urutAsc ? -1 : 1;
    if (va > vb) return state.urutAsc ? 1 : -1;
    return 0;
  });

  // Hitung total
  const totalFiltered = data.reduce((s, t) => s + t.jumlah, 0);
  setText('tabel-jumlah',  `${data.length} transaksi`);
  setText('tabel-total',   formatRupiah(totalFiltered));

  // Simpan data terfilter ke state untuk export
  state._dataFiltered = data;

  // Update header sort
  ['tanggal', 'deskripsi', 'kategori', 'jumlah'].forEach(k => {
    const el = document.querySelector(`[data-sortkey="${k}"]`);
    if (el) {
      const ind = state.urutKolom === k ? (state.urutAsc ? ' ▲' : ' ▼') : ' ⇅';
      el.querySelector('.sort-ind').textContent = ind;
    }
  });

  const tbody = document.getElementById('tabel-body');
  if (!tbody) return;

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-400 dark:text-slate-500">Tidak ada transaksi yang cocok.</td></tr>`;
    return;
  }

  let html = '';
  for (const t of data) {
    html += `
      <tr class="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
        <td class="py-2 px-3 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">${esc(formatTanggal(t.tanggal))}</td>
        <td class="py-2 px-3 text-sm text-slate-700 dark:text-slate-200">${esc(t.deskripsi)}</td>
        <td class="py-2 px-3 text-sm">
          <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">${esc(t.kategori)}</span>
        </td>
        <td class="py-2 px-3 text-sm font-semibold text-slate-700 dark:text-slate-200 text-right whitespace-nowrap">${esc(formatRupiah(t.jumlah))}</td>
        <td class="py-2 px-3 text-sm text-right whitespace-nowrap">
          <button onclick="window.__drEditTransaksi('${esc(t.id)}')" class="text-xs px-2 py-1 mr-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600">Edit</button>
          <button onclick="window.__drHapusTransaksi('${esc(t.id)}')" class="text-xs px-2 py-1 rounded bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50">Hapus</button>
        </td>
      </tr>`;
  }
  tbody.innerHTML = html;
}

// =====================================================================
// MODAL TAMBAH/EDIT TRANSAKSI
// =====================================================================
export function bukaModalTransaksi(transaksiEdit = null) {
  const modal   = document.getElementById('modal-transaksi');
  const form    = document.getElementById('form-transaksi');
  const judul   = document.getElementById('modal-transaksi-judul');
  if (!modal || !form) return;

  form.reset();
  form.dataset.editId = '';

  if (transaksiEdit) {
    judul.textContent               = 'Edit Transaksi';
    form.elements['tanggal'].value  = transaksiEdit.tanggal;
    form.elements['deskripsi'].value = transaksiEdit.deskripsi;
    form.elements['kategori'].value = transaksiEdit.kategori;
    form.elements['jumlah'].value   = transaksiEdit.jumlah;
    form.dataset.editId             = transaksiEdit.id;
  } else {
    judul.textContent = 'Tambah Transaksi';
    // Default tanggal hari ini
    form.elements['tanggal'].value = new Date().toISOString().slice(0, 10);
  }

  modal.hidden = false;
  modal.querySelector('input,select').focus();
}

export function tutupModalTransaksi() {
  const modal = document.getElementById('modal-transaksi');
  if (modal) modal.hidden = true;
}

// =====================================================================
// MODAL PENYESUAIAN SALDO
// =====================================================================
export function bukaModalSaldo(tipe, saldoEdit = null) {
  const modal  = document.getElementById('modal-saldo');
  const form   = document.getElementById('form-saldo');
  const judul  = document.getElementById('modal-saldo-judul');
  if (!modal || !form) return;

  form.reset();
  form.dataset.editId = '';
  form.dataset.tipe   = tipe;

  if (saldoEdit) {
    judul.textContent                 = `Edit Penyesuaian Saldo`;
    form.elements['tanggal'].value    = saldoEdit.tanggal;
    form.elements['jumlah'].value     = saldoEdit.jumlah;
    form.elements['catatan'].value    = saldoEdit.catatan;
    form.dataset.editId               = saldoEdit.id;
    form.dataset.tipe                 = saldoEdit.tipe;
  } else {
    judul.textContent = tipe === 'tambah' ? 'Tambah Saldo' : 'Kurangi Saldo';
    form.elements['tanggal'].value = new Date().toISOString().slice(0, 10);
  }

  modal.hidden = false;
  modal.querySelector('input').focus();
}

export function tutupModalSaldo() {
  const modal = document.getElementById('modal-saldo');
  if (modal) modal.hidden = true;
}

// =====================================================================
// DARK MODE
// =====================================================================
export function inisialisasiTema() {
  const temaSimpan = getTema();
  const temaSystem = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const tema       = temaSimpan || temaSystem;
  terapkanTema(tema);
}

export function toggleTema() {
  const isDark = document.documentElement.classList.contains('dark');
  const tema   = isDark ? 'light' : 'dark';
  terapkanTema(tema);
  setTema(tema);
  updateChartTheme();
}

function terapkanTema(tema) {
  if (tema === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  const btn = document.getElementById('btn-toggle-tema');
  if (btn) btn.textContent = tema === 'dark' ? '☀️ Terang' : '🌙 Gelap';
}

// =====================================================================
// EKSPOR CSV
// =====================================================================
export function eksporCSV() {
  const data = state._dataFiltered || state.transaksi;
  if (!data.length) { alert('Tidak ada data untuk diekspor.'); return; }

  const header = 'tanggal,deskripsi,kategori,jumlah';
  const baris  = data.map(t =>
    `${t.tanggal},"${t.deskripsi.replace(/"/g, '""')}",${t.kategori},${t.jumlah}`
  );
  const csv    = [header, ...baris].join('\n');
  const blob   = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement('a');
  const tgl    = new Date().toISOString().slice(0, 10);
  a.href       = url;
  a.download   = `dompetrantau-laporan-${tgl}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// =====================================================================
// IMPORT CSV
// =====================================================================
export function prosesImportCSV(file, mode, onSuccess, onError) {
  const reader = new FileReader();
  reader.onload = e => {
    const teks  = e.target.result;
    const baris = teks.split(/\r?\n/).filter(b => b.trim());
    if (!baris.length) { onError(['File CSV kosong.']); return; }

    const header = baris[0].trim().toLowerCase();
    if (header !== 'tanggal,deskripsi,kategori,jumlah') {
      onError(['Baris 1: Header tidak sesuai. Harus: tanggal,deskripsi,kategori,jumlah']);
      return;
    }

    const errors = [];
    const hasil  = [];
    for (let i = 1; i < baris.length; i++) {
      const cols = parseCSVLine(baris[i]);
      if (cols.length < 4) {
        errors.push(`Baris ${i + 1}: Kolom tidak lengkap.`);
        continue;
      }
      const [tanggal, deskripsi, kategori, jumlahStr] = cols.map(c => c.trim());
      if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
        errors.push(`Baris ${i + 1}: Format tanggal salah ("${tanggal}"). Harus YYYY-MM-DD.`);
        continue;
      }
      if (!deskripsi) {
        errors.push(`Baris ${i + 1}: Deskripsi kosong.`);
        continue;
      }
      if (!KATEGORI.includes(kategori)) {
        errors.push(`Baris ${i + 1}: Kategori "${kategori}" tidak valid.`);
        continue;
      }
      const jumlah = parseInt(jumlahStr, 10);
      if (isNaN(jumlah) || jumlah <= 0) {
        errors.push(`Baris ${i + 1}: Jumlah harus bilangan bulat positif.`);
        continue;
      }
      hasil.push({ id: buatId('t'), tanggal, deskripsi, kategori, jumlah });
    }

    if (errors.length) { onError(errors); return; }
    onSuccess(hasil, mode);
  };
  reader.readAsText(file);
}

// Parser CSV sederhana yang menangani tanda kutip
function parseCSVLine(line) {
  const result = [];
  let current  = '';
  let inQuote  = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuote) {
      if (c === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (c === '"') inQuote = false;
      else current += c;
    } else {
      if (c === '"') inQuote = true;
      else if (c === ',') { result.push(current); current = ''; }
      else current += c;
    }
  }
  result.push(current);
  return result;
}

// =====================================================================
// BIND EVENT — sambungkan semua event ke elemen DOM
// =====================================================================
export function bindEvents(callbacks) {
  const {
    onTambahTransaksi, onEditTransaksi, onHapusTransaksi,
    onTambahSaldo, onEditSaldo, onHapusSaldo,
    onUbahBulan, onUbahBudget, onReset, onImportCSV,
  } = callbacks;

  // ---- Toggle dark mode ----
  document.getElementById('btn-toggle-tema')?.addEventListener('click', toggleTema);

  // ---- Pemilih bulan ----
  document.getElementById('pilih-bulan')?.addEventListener('change', e => {
    state.bulanDipilih = e.target.value;
    onUbahBulan();
  });

  // ---- Form tambah transaksi ----
  document.getElementById('form-tambah-transaksi')?.addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    const tanggal   = f.elements['tanggal'].value.trim();
    const deskripsi = f.elements['deskripsi'].value.trim();
    const kategori  = f.elements['kategori'].value;
    const jumlah    = parseInt(f.elements['jumlah'].value, 10);
    if (!tanggal || !deskripsi || !kategori || isNaN(jumlah) || jumlah <= 0) {
      tampilkanPesan('form-tambah-pesan', 'Semua field wajib diisi dan jumlah harus lebih dari 0.', 'error');
      return;
    }
    onTambahTransaksi({ id: buatId('t'), tanggal, deskripsi, kategori, jumlah });
    f.reset();
    f.elements['tanggal'].value = new Date().toISOString().slice(0, 10);
    tampilkanPesan('form-tambah-pesan', 'Transaksi berhasil ditambahkan!', 'sukses');
  });

  // ---- Modal edit transaksi ----
  document.getElementById('form-transaksi')?.addEventListener('submit', e => {
    e.preventDefault();
    const f         = e.target;
    const editId    = f.dataset.editId;
    const tanggal   = f.elements['tanggal'].value.trim();
    const deskripsi = f.elements['deskripsi'].value.trim();
    const kategori  = f.elements['kategori'].value;
    const jumlah    = parseInt(f.elements['jumlah'].value, 10);
    if (!tanggal || !deskripsi || !kategori || isNaN(jumlah) || jumlah <= 0) {
      tampilkanPesan('modal-transaksi-pesan', 'Semua field wajib diisi dan jumlah harus lebih dari 0.', 'error');
      return;
    }
    onEditTransaksi({ id: editId, tanggal, deskripsi, kategori, jumlah });
    tutupModalTransaksi();
  });

  document.getElementById('btn-tutup-modal-transaksi')?.addEventListener('click', tutupModalTransaksi);
  document.getElementById('btn-batal-modal-transaksi')?.addEventListener('click', tutupModalTransaksi);

  // ---- Tombol tambah/kurangi saldo ----
  document.getElementById('btn-tambah-saldo')?.addEventListener('click', () => bukaModalSaldo('tambah'));
  document.getElementById('btn-kurang-saldo')?.addEventListener('click', () => bukaModalSaldo('kurang'));

  // ---- Modal saldo ----
  document.getElementById('form-saldo')?.addEventListener('submit', e => {
    e.preventDefault();
    const f       = e.target;
    const editId  = f.dataset.editId;
    const tipe    = f.dataset.tipe;
    const tanggal = f.elements['tanggal'].value.trim();
    const jumlah  = parseInt(f.elements['jumlah'].value, 10);
    const catatan = f.elements['catatan'].value.trim();
    if (!tanggal || isNaN(jumlah) || jumlah <= 0 || !catatan) {
      tampilkanPesan('modal-saldo-pesan', 'Semua field wajib diisi dan jumlah harus lebih dari 0.', 'error');
      return;
    }
    const data = { tanggal, jumlah, catatan, tipe };
    if (editId) { onEditSaldo({ id: editId, ...data }); }
    else        { onTambahSaldo({ id: buatId('s'), ...data }); }
    tutupModalSaldo();
  });

  document.getElementById('btn-tutup-modal-saldo')?.addEventListener('click', tutupModalSaldo);
  document.getElementById('btn-batal-modal-saldo')?.addEventListener('click', tutupModalSaldo);

  // ---- Import CSV ----
  document.getElementById('btn-import-csv')?.addEventListener('click', () => {
    document.getElementById('input-csv')?.click();
  });

  document.getElementById('input-csv')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = ''; // reset agar bisa import file yang sama
    const mode = document.getElementById('mode-import')?.value || 'gabung';

    prosesImportCSV(file, mode,
      (hasil, mode) => onImportCSV(hasil, mode),
      (errors) => {
        tampilkanPesanImport(errors);
      }
    );
  });

  // ---- Filter & cari tabel ----
  document.getElementById('cari-transaksi')?.addEventListener('input', e => {
    state.cariTeks = e.target.value;
    renderTabel();
  });
  document.getElementById('filter-kategori')?.addEventListener('change', e => {
    state.filterKat = e.target.value;
    renderTabel();
  });
  document.getElementById('filter-bulan-awal')?.addEventListener('change', e => {
    state.filterBulanAwal = e.target.value;
    renderTabel();
  });
  document.getElementById('filter-bulan-akhir')?.addEventListener('change', e => {
    state.filterBulanAkhir = e.target.value;
    renderTabel();
  });

  // ---- Header sort tabel ----
  document.querySelectorAll('[data-sortkey]').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sortkey;
      if (state.urutKolom === key) state.urutAsc = !state.urutAsc;
      else { state.urutKolom = key; state.urutAsc = false; }
      renderTabel();
    });
  });

  // ---- Ekspor CSV ----
  document.getElementById('btn-ekspor-csv')?.addEventListener('click', eksporCSV);

  // ---- Reset data ----
  document.getElementById('btn-reset')?.addEventListener('click', () => {
    const konfirm = confirm('⚠️ Yakin ingin mereset ke data awal? Semua data yang kamu masukkan akan hilang!');
    if (konfirm) onReset();
  });

  // ---- Tutup modal dengan Esc ----
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      tutupModalTransaksi();
      tutupModalSaldo();
    }
  });

  // Klik backdrop modal
  document.getElementById('modal-transaksi')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) tutupModalTransaksi();
  });
  document.getElementById('modal-saldo')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) tutupModalSaldo();
  });

  // =====================================================================
  // Global handler (dipanggil dari onclick inline)
  // =====================================================================
  window.__drEditTransaksi = id => {
    const t = state.transaksi.find(x => x.id === id);
    if (t) bukaModalTransaksi(t);
  };
  window.__drHapusTransaksi = id => {
    if (confirm('Hapus transaksi ini?')) onHapusTransaksi(id);
  };
  window.__drEditSaldo = id => {
    const r = state.riwayatSaldo.find(x => x.id === id);
    if (r) bukaModalSaldo(r.tipe, r);
  };
  window.__drHapusSaldo = id => {
    if (confirm('Hapus penyesuaian saldo ini?')) onHapusSaldo(id);
  };
  window.__drUbahBudget = (kat, val) => {
    const angka = parseInt(val, 10);
    if (!isNaN(angka) && angka >= 0) onUbahBudget(kat, angka);
  };
}

// =====================================================================
// UPDATE STATE DARI LUAR
// =====================================================================
export function updateStateTransaksi(transaksi) {
  state.transaksi = transaksi;
  // Pastikan bulan terpilih masih valid
  const daftar = getDaftarBulan(transaksi);
  if (state.bulanDipilih && !daftar.includes(state.bulanDipilih)) {
    state.bulanDipilih = daftar[0] || '';
  }
}
export function updateStateSaldo(riwayatSaldo) { state.riwayatSaldo = riwayatSaldo; }
export function updateStateBudget(budget)       { state.budget       = budget; }

// =====================================================================
// PESAN FEEDBACK FORM
// =====================================================================
function tampilkanPesan(elId, teks, tipe) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = teks;
  el.className = tipe === 'error'
    ? 'text-sm mt-1 text-red-600 dark:text-red-400'
    : 'text-sm mt-1 text-emerald-600 dark:text-emerald-400';
  el.hidden = false;
  setTimeout(() => { if (el) el.hidden = true; }, 4000);
}

function tampilkanPesanImport(errors) {
  const el = document.getElementById('import-error');
  if (!el) return;
  let html = '<p class="font-medium text-red-600 dark:text-red-400 mb-1">Gagal import. Perbaiki baris berikut:</p><ul class="list-disc ml-4 space-y-0.5">';
  for (const err of errors) {
    html += `<li class="text-sm text-red-500 dark:text-red-400">${esc(err)}</li>`;
  }
  html += '</ul>';
  el.innerHTML = html;
  el.hidden = false;
  setTimeout(() => { if (el) el.hidden = true; }, 8000);
}

export function tampilkanPesanImportSukses(jumlah) {
  const el = document.getElementById('import-error');
  if (!el) return;
  el.innerHTML = `<p class="text-sm text-emerald-600 dark:text-emerald-400 font-medium">${jumlah} transaksi berhasil diimpor!</p>`;
  el.hidden = false;
  setTimeout(() => { if (el) el.hidden = true; }, 4000);
}
