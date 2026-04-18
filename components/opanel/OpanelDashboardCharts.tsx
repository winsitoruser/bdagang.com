import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend, ArcElement);

export type OpanelInsightsPayload = {
  dailySales: { date: string; label: string; sales: number; transactions: number }[];
  todaySales: { total: number; transactions: number; paymentMix: { method: string; count: number; amount: number }[] };
};

const formatRp = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );

function compactAxisRp(value: number | string): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (!Number.isFinite(n)) return '';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}rb`;
  return `${n}`;
}

const CHART_COLORS = ['#0d9488', '#6366f1', '#d97706', '#e11d48', '#8b5cf6', '#0ea5e9', '#64748b'];

function areaDataset(
  label: string,
  data: number[],
  borderRgb: string,
  fillTop: string,
  fillBottom: string
) {
  return {
    label,
    data,
    borderColor: borderRgb,
    borderWidth: 2,
    pointRadius: 3,
    pointHoverRadius: 5,
    pointBackgroundColor: borderRgb,
    pointBorderColor: '#fff',
    pointBorderWidth: 1,
    tension: 0.35,
    fill: true,
    backgroundColor: (context: { chart?: ChartJS }) => {
      const chart = context.chart;
      const { ctx, chartArea } = chart || {};
      if (!ctx || !chartArea) return fillTop;
      const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      g.addColorStop(0, fillTop);
      g.addColorStop(1, fillBottom);
      return g;
    },
  };
}

const baseLineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 10 }, color: '#64748b', maxRotation: 45, minRotation: 0 },
    },
    y: {
      grid: { color: '#e2e8f0', drawBorder: false },
      ticks: {
        font: { size: 10 },
        color: '#64748b',
      },
      border: { display: false },
    },
  },
};

type Props = {
  insights: OpanelInsightsPayload | null;
};

export default function OpanelDashboardCharts({ insights }: Props) {
  const labels = useMemo(() => insights?.dailySales?.map((d) => d.label) ?? [], [insights]);
  const salesValues = useMemo(() => insights?.dailySales?.map((d) => d.sales) ?? [], [insights]);
  const trxValues = useMemo(() => insights?.dailySales?.map((d) => d.transactions) ?? [], [insights]);

  const salesChartData = useMemo(
    () => ({
      labels,
      datasets: [
        areaDataset(
          'Penjualan',
          salesValues,
          '#0f766e',
          'rgba(13, 148, 136, 0.32)',
          'rgba(13, 148, 136, 0.02)'
        ),
      ],
    }),
    [labels, salesValues]
  );

  const trxChartData = useMemo(
    () => ({
      labels,
      datasets: [
        areaDataset(
          'Transaksi',
          trxValues,
          '#4f46e5',
          'rgba(99, 102, 241, 0.28)',
          'rgba(99, 102, 241, 0.02)'
        ),
      ],
    }),
    [labels, trxValues]
  );

  const salesOptions = useMemo(
    () => ({
      ...baseLineOptions,
      plugins: {
        ...baseLineOptions.plugins,
        tooltip: {
          callbacks: {
            label: (ctx: { parsed?: { y: number } }) => `Penjualan: ${formatRp(Number(ctx.parsed?.y ?? 0))}`,
          },
        },
      },
      scales: {
        ...baseLineOptions.scales,
        y: {
          ...baseLineOptions.scales.y,
          ticks: {
            ...baseLineOptions.scales.y.ticks,
            callback: (value: string | number) => compactAxisRp(value),
          },
        },
      },
    }),
    []
  );

  const trxOptions = useMemo(
    () => ({
      ...baseLineOptions,
      plugins: {
        ...baseLineOptions.plugins,
        tooltip: {
          callbacks: {
            label: (ctx: { parsed?: { y: number } }) => `Transaksi: ${ctx.parsed?.y ?? 0}`,
          },
        },
      },
      scales: {
        ...baseLineOptions.scales,
        y: {
          ...baseLineOptions.scales.y,
          ticks: {
            ...baseLineOptions.scales.y.ticks,
            precision: 0,
            maxTicksLimit: 8,
          },
        },
      },
    }),
    []
  );

  const pieData = useMemo(
    () =>
      insights?.todaySales?.paymentMix?.map((p) => ({
        name: p.method,
        value: p.amount,
        count: p.count,
      })) ?? [],
    [insights]
  );

  const doughnutData = useMemo(
    () => ({
      labels: pieData.map((p) => p.name),
      datasets: [
        {
          data: pieData.map((p) => p.value),
          backgroundColor: pieData.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    }),
    [pieData]
  );

  const doughnutOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '58%',
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: { font: { size: 11 }, color: '#475569', padding: 12, usePointStyle: true },
        },
        tooltip: {
          callbacks: {
            label: (ctx: { label?: string; parsed?: number; dataIndex: number }) => {
              const i = ctx.dataIndex;
              const row = pieData[i];
              const amt = formatRp(Number(ctx.parsed ?? 0));
              return `${ctx.label}: ${amt} (${row?.count ?? 0} trx)`;
            },
          },
        },
      },
    }),
    [pieData]
  );

  if (!insights?.dailySales?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-16 text-center text-sm text-slate-500">
        Grafik penjualan akan tampil setelah ada data transaksi di cabang tenant Anda.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Tren 14 hari</p>
            <h3 className="text-lg font-bold text-slate-900">Penjualan harian (area)</h3>
          </div>
          <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-bold text-teal-800">IDR</span>
        </div>
        <div className="relative h-72 w-full min-w-0">
          <Line data={salesChartData} options={salesOptions} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-violet-700">Volume</p>
          <h3 className="text-lg font-bold text-slate-900">Transaksi / hari (area)</h3>
        </div>
        <div className="relative h-72 w-full min-w-0">
          <Line data={trxChartData} options={trxOptions} />
        </div>
      </div>

      {pieData.length > 0 && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Hari ini</p>
              <h3 className="text-lg font-bold text-slate-900">Komposisi penjualan per metode bayar</h3>
              <p className="mt-1 text-xs text-slate-500">
                Total {formatRp(insights.todaySales?.total ?? 0)} · {insights.todaySales?.transactions ?? 0} transaksi
              </p>
            </div>
          </div>
          <div className="relative mx-auto h-72 max-w-md min-w-0">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      )}
    </div>
  );
}
