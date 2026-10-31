// app.js - Inisialisasi dan penghubung modul DompetRantau

import { TRANSAKSI_DEFAULT, SALDO_AWAL_DEFAULT, BUDGET_DEFAULT } from './data.js';
import { getTransaksi, setTransaksi, getSaldo, setSaldo, getBudget, setBudget, sudahAdaData, resetSemua } from './storage.js';
import {
  initState, renderSemua, bindEvents, inisialisasiTema,
  updateStateTransaksi, updateStateSaldo, updateStateBudget,
  tampilkanPesanImportSukses,
} from './ui.js';
import { initChartDoughnut, initChartTren } from './charts.js';

// =====================================================================
// MUAT DATA (dari localStorage atau dataset default)
// =====================================================================
function muatData() {
  let transaksi, riwayatSaldo, budget;

  if (sudahAdaData()) {
    // Muat dari localStorage
    transaksi = getTransaksi();

    // Jika riwayat saldo kosong atau null (migrasi / data lama),
    // seed dengan nilai default agar saldo tidak tampil negatif
    const savedSaldo = getSaldo();
    const saldoValid = Array.isArray(savedSaldo) && savedSaldo.length > 0;
    riwayatSaldo = saldoValid ? savedSaldo : [...SALDO_AWAL_DEFAULT];
    if (!saldoValid) setSaldo(riwayatSaldo);

    const savedBudget = getBudget();
    budget = (savedBudget && typeof savedBudget === 'object') ? savedBudget : { ...BUDGET_DEFAULT };
    if (!savedBudget) setBudget(budget);
  } else {
    // Pertama kali: muat dataset default dan simpan
    transaksi    = [...TRANSAKSI_DEFAULT];
    riwayatSaldo = [...SALDO_AWAL_DEFAULT];
    budget       = { ...BUDGET_DEFAULT };
    setTransaksi(transaksi);
    setSaldo(riwayatSaldo);
    setBudget(budget);
  }

  return { transaksi, riwayatSaldo, budget };
}

// =====================================================================
// CALLBACK — dioper ke bindEvents
// =====================================================================
function buatCallbacks(state) {

  // Tambah transaksi
  function onTambahTransaksi(transaksi) {
    state.transaksi.push(transaksi);
    simpanDanRenderUlang();
  }

  // Edit transaksi
  function onEditTransaksi(transaksiEdit) {
    const idx = state.transaksi.findIndex(t => t.id === transaksiEdit.id);
    if (idx !== -1) state.transaksi[idx] = transaksiEdit;
    simpanDanRenderUlang();
  }

  // Hapus transaksi
  function onHapusTransaksi(id) {
    state.transaksi = state.transaksi.filter(t => t.id !== id);
    updateStateTransaksi(state.transaksi);
    setTransaksi(state.transaksi);
    renderSemua();
  }

  // Tambah penyesuaian saldo
  function onTambahSaldo(saldo) {
    state.riwayatSaldo.push(saldo);
    setSaldo(state.riwayatSaldo);
    updateStateSaldo(state.riwayatSaldo);
    renderSemua();
  }

  // Edit penyesuaian saldo
  function onEditSaldo(saldoEdit) {
    const idx = state.riwayatSaldo.findIndex(s => s.id === saldoEdit.id);
    if (idx !== -1) state.riwayatSaldo[idx] = saldoEdit;
    setSaldo(state.riwayatSaldo);
    updateStateSaldo(state.riwayatSaldo);
    renderSemua();
  }

  // Hapus penyesuaian saldo
  function onHapusSaldo(id) {
    state.riwayatSaldo = state.riwayatSaldo.filter(s => s.id !== id);
    setSaldo(state.riwayatSaldo);
    updateStateSaldo(state.riwayatSaldo);
    renderSemua();
  }

  // Ubah bulan pilihan → render ulang bagian yang terpengaruh
  function onUbahBulan() {
    renderSemua();
  }

  // Ubah budget satu kategori
  function onUbahBudget(kat, nilai) {
    state.budget[kat] = nilai;
    setBudget(state.budget);
    updateStateBudget(state.budget);
    renderSemua();
  }

  // Reset ke data awal
  function onReset() {
    resetSemua();
    state.transaksi    = [...TRANSAKSI_DEFAULT];
    state.riwayatSaldo = [...SALDO_AWAL_DEFAULT];
    state.budget       = { ...BUDGET_DEFAULT };
    setTransaksi(state.transaksi);
    setSaldo(state.riwayatSaldo);
    setBudget(state.budget);
    updateStateTransaksi(state.transaksi);
    updateStateSaldo(state.riwayatSaldo);
    updateStateBudget(state.budget);
    renderSemua();
  }

  // Import CSV
  function onImportCSV(hasilImport, mode) {
    if (mode === 'timpa') {
      state.transaksi = hasilImport;
    } else {
      state.transaksi = [...state.transaksi, ...hasilImport];
    }
    setTransaksi(state.transaksi);
    updateStateTransaksi(state.transaksi);
    renderSemua();
    tampilkanPesanImportSukses(hasilImport.length);
  }

  // Simpan dan render ulang semua
  function simpanDanRenderUlang() {
    setTransaksi(state.transaksi);
    updateStateTransaksi(state.transaksi);
    renderSemua();
  }

  return {
    onTambahTransaksi, onEditTransaksi, onHapusTransaksi,
    onTambahSaldo, onEditSaldo, onHapusSaldo,
    onUbahBulan, onUbahBudget, onReset, onImportCSV,
  };
}

// =====================================================================
// MAIN INIT
// =====================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Tema
  inisialisasiTema();

  // 2. Muat data
  const state = muatData();

  // 3. Inisialisasi state UI
  initState(state.transaksi, state.riwayatSaldo, state.budget);

  // 4. Inisialisasi grafik
  initChartDoughnut('chart-doughnut');
  initChartTren('chart-tren');

  // 5. Bind event dengan callbacks
  bindEvents(buatCallbacks(state));

  // 6. Render awal
  renderSemua();
});
