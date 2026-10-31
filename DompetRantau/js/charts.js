// charts.js - Inisialisasi dan update Chart.js untuk DompetRantau

import { KATEGORI } from './data.js';
import { hitungPerKategori, hitungTrenBulanan, formatBulanLabel, formatRupiah } from './calc.js';

// Warna per kategori (konsisten)
const WARNA_KATEGORI = [
  '#10b981', // Makanan - emerald
  '#3b82f6', // Transportasi - blue
  '#f59e0b', // Belanja - amber
  '#6366f1', // Tagihan - indigo
  '#ec4899', // Hiburan - pink
  '#14b8a6', // Kesehatan - teal
  '#8b5cf6', // Pendidikan - violet
  '#64748b', // Lainnya - slate
];

let chartDoughnut = null;
let chartTren     = null;

// Deteksi dark mode
function isDark() {
  return document.documentElement.classList.contains('dark');
}

function warnaTeks() {
  return isDark() ? '#e2e8f0' : '#374151';
}

function warnaGrid() {
  return isDark() ? '#374151' : '#e5e7eb';
}

// --- Inisialisasi doughnut chart distribusi per kategori ---
export function initChartDoughnut(canvasId) {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;

  chartDoughnut = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: KATEGORI,
      datasets: [{
        data: new Array(KATEGORI.length).fill(0),
        backgroundColor: WARNA_KATEGORI,
        borderWidth: 2,
        borderColor: isDark() ? '#1e293b' : '#ffffff',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: warnaTeks(), font: { size: 12 }, padding: 12 },
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${formatRupiah(ctx.raw)}`,
          },
        },
      },
    },
  });
}

// --- Update doughnut chart ---
export function updateChartDoughnut(transaksi, bulan) {
  if (!chartDoughnut) return;
  const perKat = hitungPerKategori(transaksi, bulan);
  chartDoughnut.data.datasets[0].data = KATEGORI.map(k => perKat[k] || 0);
  chartDoughnut.data.datasets[0].borderColor = isDark() ? '#1e293b' : '#ffffff';
  chartDoughnut.options.plugins.legend.labels.color = warnaTeks();
  chartDoughnut.update();
}

// --- Inisialisasi bar chart tren bulanan ---
export function initChartTren(canvasId) {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;

  chartTren = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: 'Total Pengeluaran',
        data: [],
        backgroundColor: '#10b981cc',
        borderColor: '#10b981',
        borderWidth: 2,
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${formatRupiah(ctx.raw)}`,
          },
        },
      },
      scales: {
        x: {
          ticks:  { color: warnaTeks() },
          grid:   { color: warnaGrid() },
        },
        y: {
          ticks: {
            color: warnaTeks(),
            callback: v => formatRupiah(v),
          },
          grid: { color: warnaGrid() },
        },
      },
    },
  });
}

// --- Update bar chart tren bulanan ---
export function updateChartTren(transaksi) {
  if (!chartTren) return;
  const tren = hitungTrenBulanan(transaksi);
  chartTren.data.labels   = tren.map(([bln]) => formatBulanLabel(bln));
  chartTren.data.datasets[0].data = tren.map(([, val]) => val);
  chartTren.options.scales.x.ticks.color  = warnaTeks();
  chartTren.options.scales.x.grid.color   = warnaGrid();
  chartTren.options.scales.y.ticks.color  = warnaTeks();
  chartTren.options.scales.y.grid.color   = warnaGrid();
  chartTren.update();
}

// Perbarui warna grafik saat tema berubah
export function updateChartTheme() {
  if (chartDoughnut) {
    chartDoughnut.data.datasets[0].borderColor = isDark() ? '#1e293b' : '#ffffff';
    chartDoughnut.options.plugins.legend.labels.color = warnaTeks();
    chartDoughnut.update();
  }
  if (chartTren) {
    chartTren.options.scales.x.ticks.color  = warnaTeks();
    chartTren.options.scales.x.grid.color   = warnaGrid();
    chartTren.options.scales.y.ticks.color  = warnaTeks();
    chartTren.options.scales.y.grid.color   = warnaGrid();
    chartTren.update();
  }
}
