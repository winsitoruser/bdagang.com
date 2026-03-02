import React, { useState, useEffect } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Calendar,
  Building2,
  ChevronLeft,
  FileText,
  Printer,
  ChevronDown,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface PLSummary {
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMargin: number;
  operatingExpenses: number;
  operatingIncome: number;
  operatingMargin: number;
  otherIncome: number;
  otherExpenses: number;
  ebitda: number;
  depreciation: number;
  interestExpense: number;
  taxExpense: number;
  netIncome: number;
  netMargin: number;
  previousNetIncome: number;
  growth: number;
}

interface PLLineItem {
  id: string;
  name: string;
  currentPeriod: number;
  previousPeriod: number;
  change: number;
  changePercent: number;
  isSubtotal?: boolean;
  isTotal?: boolean;
  indent?: number;
}

interface BranchPL {
  id: string;
  name: string;
  code: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  opex: number;
  netIncome: number;
  margin: number;
}

const mockPLSummary: PLSummary = {
  revenue: 4120000000,
  cogs: 2472000000,
  grossProfit: 1648000000,
  grossMargin: 40,
  operatingExpenses: 618000000,
  operatingIncome: 1030000000,
  operatingMargin: 25,
  otherIncome: 45000000,
  otherExpenses: 25000000,
  ebitda: 1050000000,
  depreciation: 85000000,
  interestExpense: 35000000,
  taxExpense: 206000000,
  netIncome: 824000000,
  netMargin: 20,
  previousNetIncome: 735000000,
  growth: 12.1
};

const mockPLItems: PLLineItem[] = [
  { id: '1', name: 'Revenue', currentPeriod: 4120000000, previousPeriod: 3665000000, change: 455000000, changePercent: 12.4, isSubtotal: true },
  { id: '2', name: 'Sales - Dine In', currentPeriod: 2060000000, previousPeriod: 1832500000, change: 227500000, changePercent: 12.4, indent: 1 },
  { id: '3', name: 'Sales - Takeaway', currentPeriod: 1236000000, previousPeriod: 1099500000, change: 136500000, changePercent: 12.4, indent: 1 },
  { id: '4', name: 'Sales - Delivery', currentPeriod: 824000000, previousPeriod: 733000000, change: 91000000, changePercent: 12.4, indent: 1 },
  
  { id: '5', name: 'Cost of Goods Sold', currentPeriod: 2472000000, previousPeriod: 2199000000, change: 273000000, changePercent: 12.4, isSubtotal: true },
  { id: '6', name: 'Raw Materials', currentPeriod: 1854000000, previousPeriod: 1649250000, change: 204750000, changePercent: 12.4, indent: 1 },
  { id: '7', name: 'Packaging', currentPeriod: 247200000, previousPeriod: 219900000, change: 27300000, changePercent: 12.4, indent: 1 },
  { id: '8', name: 'Direct Labor', currentPeriod: 370800000, previousPeriod: 329850000, change: 40950000, changePercent: 12.4, indent: 1 },
  
  { id: '9', name: 'Gross Profit', currentPeriod: 1648000000, previousPeriod: 1466000000, change: 182000000, changePercent: 12.4, isTotal: true },
  
  { id: '10', name: 'Operating Expenses', currentPeriod: 618000000, previousPeriod: 550000000, change: 68000000, changePercent: 12.4, isSubtotal: true },
  { id: '11', name: 'Salaries & Wages', currentPeriod: 309000000, previousPeriod: 275000000, change: 34000000, changePercent: 12.4, indent: 1 },
  { id: '12', name: 'Rent & Utilities', currentPeriod: 123600000, previousPeriod: 110000000, change: 13600000, changePercent: 12.4, indent: 1 },
  { id: '13', name: 'Marketing', currentPeriod: 92700000, previousPeriod: 82500000, change: 10200000, changePercent: 12.4, indent: 1 },
  { id: '14', name: 'Depreciation', currentPeriod: 61800000, previousPeriod: 55000000, change: 6800000, changePercent: 12.4, indent: 1 },
  { id: '15', name: 'Other Operating', currentPeriod: 30900000, previousPeriod: 27500000, change: 3400000, changePercent: 12.4, indent: 1 },
  
  { id: '16', name: 'Operating Income', currentPeriod: 1030000000, previousPeriod: 916000000, change: 114000000, changePercent: 12.4, isTotal: true },
  
  { id: '17', name: 'Other Income', currentPeriod: 45000000, previousPeriod: 40000000, change: 5000000, changePercent: 12.5, indent: 0 },
  { id: '18', name: 'Other Expenses', currentPeriod: 25000000, previousPeriod: 22000000, change: 3000000, changePercent: 13.6, indent: 0 },
  { id: '19', name: 'Interest Expense', currentPeriod: 35000000, previousPeriod: 38000000, change: -3000000, changePercent: -7.9, indent: 0 },
  
  { id: '20', name: 'Income Before Tax', currentPeriod: 1015000000, previousPeriod: 896000000, change: 119000000, changePercent: 13.3, isSubtotal: true },
  { id: '21', name: 'Tax Expense (25%)', currentPeriod: 253750000, previousPeriod: 224000000, change: 29750000, changePercent: 13.3, indent: 1 },
  
  { id: '22', name: 'Net Income', currentPeriod: 761250000, previousPeriod: 672000000, change: 89250000, changePercent: 13.3, isTotal: true }
];

const mockBranchPL: BranchPL[] = [
  { id: '1', name: 'Cabang Pusat Jakarta', code: 'HQ-001', revenue: 1250000000, cogs: 750000000, grossProfit: 500000000, opex: 187500000, netIncome: 250000000, margin: 20 },
  { id: '2', name: 'Cabang Bandung', code: 'BR-002', revenue: 920000000, cogs: 552000000, grossProfit: 368000000, opex: 138000000, netIncome: 184000000, margin: 20 },
  { id: '3', name: 'Cabang Surabaya', code: 'BR-003', revenue: 780000000, cogs: 468000000, grossProfit: 312000000, opex: 117000000, netIncome: 156000000, margin: 20 },
  { id: '4', name: 'Cabang Medan', code: 'BR-004', revenue: 650000000, cogs: 390000000, grossProfit: 260000000, opex: 97500000, netIncome: 130000000, margin: 20 },
  { id: '5', name: 'Cabang Yogyakarta', code: 'BR-005', revenue: 520000000, cogs: 312000000, grossProfit: 208000000, opex: 78000000, netIncome: 104000000, margin: 20 }
];

const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 1000000000) {
    return `Rp ${(value / 1000000000).toFixed(2)}M`;
  } else if (Math.abs(value) >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1)}Jt`;
  }
  return `Rp ${value.toLocaleString('id-ID')}`;
};

const formatFullCurrency = (value: number) => {
  return `Rp ${value.toLocaleString('id-ID')}`;
};

export default function ProfitLossReport() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [comparePeriod, setComparePeriod] = useState<'previous' | 'yoy'>('previous');
  const [summary, setSummary] = useState<PLSummary>(mockPLSummary);
  const [plItems, setPLItems] = useState<PLLineItem[]>(mockPLItems);
  const [branchPL, setBranchPL] = useState<BranchPL[]>(mockBranchPL);
  const [expandedSections, setExpandedSections] = useState<string[]>(['revenue', 'cogs', 'opex']);
  const [viewMode, setViewMode] = useState<'statement' | 'branch' | 'trend'>('statement');

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/hq/finance/profit-loss?period=${period}`);
      if (response.ok) {
        const json = await response.json();
        const payload = json.data || json;
        setSummary(payload.summary || mockPLSummary);
        setPLItems(payload.items || mockPLItems);
        setBranchPL(payload.branches || mockBranchPL);
      }
    } catch (error) {
      console.error('Error fetching P&L data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [period]);

  if (!mounted) return null;

  const marginTrendOptions: ApexCharts.ApexOptions = {
    chart: { type: 'line', toolbar: { show: false } },
    stroke: { curve: 'smooth', width: [2, 2, 2] },
    colors: ['#3B82F6', '#10B981', '#8B5CF6'],
    xaxis: { categories: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'] },
    yaxis: { labels: { formatter: (val) => `${val}%` }, max: 50 },
    legend: { position: 'top' }
  };

  const marginTrendSeries = [
    { name: 'Gross Margin', data: [38, 39, 40, 41, 40, 40] },
    { name: 'Operating Margin', data: [23, 24, 25, 26, 25, 25] },
    { name: 'Net Margin', data: [18, 19, 20, 21, 20, 20] }
  ];

  const profitTrendOptions: ApexCharts.ApexOptions = {
    chart: { type: 'area', toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 } },
    colors: ['#10B981'],
    xaxis: { categories: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'] },
    yaxis: { labels: { formatter: (val) => formatCurrency(val * 1000000) } }
  };

  const profitTrendSeries = [{ name: 'Net Income', data: [620, 680, 720, 780, 800, 824] }];

  const revenueVsCostOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
    colors: ['#3B82F6', '#EF4444', '#10B981'],
    xaxis: { categories: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'] },
    yaxis: { labels: { formatter: (val) => formatCurrency(val * 1000000) } },
    legend: { position: 'top' }
  };

  const revenueVsCostSeries = [
    { name: 'Revenue', data: [3200, 3450, 3680, 3900, 4000, 4120] },
    { name: 'Costs', data: [2560, 2760, 2944, 3120, 3200, 3296] },
    { name: 'Profit', data: [640, 690, 736, 780, 800, 824] }
  ];

  const branchPLOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, stacked: false },
    plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
    colors: ['#3B82F6', '#10B981'],
    xaxis: { labels: { formatter: (val) => formatCurrency(Number(val)) } },
    legend: { position: 'top' }
  };

  const branchPLSeries = [
    { name: 'Revenue', data: branchPL.map(b => ({ x: b.code, y: b.revenue })) },
    { name: 'Net Income', data: branchPL.map(b => ({ x: b.code, y: b.netIncome })) }
  ];

  return (
    <HQLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/hq/finance" className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profit & Loss Statement</h1>
              <p className="text-gray-500">Laporan laba rugi konsolidasi</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="month">Bulan Ini</option>
              <option value="quarter">Kuartal Ini</option>
              <option value="year">Tahun Ini</option>
            </select>
            <select
              value={comparePeriod}
              onChange={(e) => setComparePeriod(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="previous">vs Periode Sebelumnya</option>
              <option value="yoy">vs Tahun Lalu</option>
            </select>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
            <p className="text-blue-100 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(summary.revenue)}</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-blue-200">
              <ArrowUpRight className="w-4 h-4" />
              12.4% vs prev
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <p className="text-gray-500 text-sm">Gross Profit</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.grossProfit)}</p>
            <p className="text-sm text-green-600 mt-2">Margin: {summary.grossMargin}%</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <p className="text-gray-500 text-sm">Operating Income</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.operatingIncome)}</p>
            <p className="text-sm text-green-600 mt-2">Margin: {summary.operatingMargin}%</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <p className="text-gray-500 text-sm">EBITDA</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.ebitda)}</p>
            <p className="text-sm text-gray-500 mt-2">{((summary.ebitda / summary.revenue) * 100).toFixed(1)}% of revenue</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
            <p className="text-green-100 text-sm">Net Income</p>
            <p className="text-2xl font-bold">{formatCurrency(summary.netIncome)}</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-200">
              <ArrowUpRight className="w-4 h-4" />
              {summary.growth}% growth
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
          <button
            onClick={() => setViewMode('statement')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${viewMode === 'statement' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <FileText className="w-4 h-4" />
            Statement
          </button>
          <button
            onClick={() => setViewMode('branch')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${viewMode === 'branch' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Building2 className="w-4 h-4" />
            By Branch
          </button>
          <button
            onClick={() => setViewMode('trend')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${viewMode === 'trend' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <TrendingUp className="w-4 h-4" />
            Trend Analysis
          </button>
        </div>

        {viewMode === 'statement' && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-5 gap-4 text-xs font-medium text-gray-500 uppercase">
                <div className="col-span-2">Account</div>
                <div className="text-right">Current Period</div>
                <div className="text-right">Previous Period</div>
                <div className="text-right">Change</div>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {plItems.map((item) => (
                <div
                  key={item.id}
                  className={`grid grid-cols-5 gap-4 px-4 py-3 ${item.isTotal ? 'bg-blue-50 font-bold' : item.isSubtotal ? 'bg-gray-50 font-semibold' : 'hover:bg-gray-50'}`}
                >
                  <div className={`col-span-2 ${item.indent ? `pl-${item.indent * 6}` : ''}`} style={{ paddingLeft: item.indent ? `${item.indent * 24}px` : '0' }}>
                    {item.name}
                  </div>
                  <div className={`text-right ${item.isTotal ? 'text-blue-600' : ''}`}>
                    {formatFullCurrency(item.currentPeriod)}
                  </div>
                  <div className="text-right text-gray-600">
                    {formatFullCurrency(item.previousPeriod)}
                  </div>
                  <div className={`text-right flex items-center justify-end gap-1 ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {item.changePercent.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'branch' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Revenue vs Net Income by Branch</h3>
              <Chart options={branchPLOptions} series={branchPLSeries} type="bar" height={300} />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">COGS</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross Profit</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Opex</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Income</th>
                      <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {branchPL.map((branch) => (
                      <tr key={branch.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-900">{branch.name}</p>
                          <p className="text-xs text-gray-500">{branch.code}</p>
                        </td>
                        <td className="px-5 py-4 text-right font-medium text-gray-900">{formatCurrency(branch.revenue)}</td>
                        <td className="px-5 py-4 text-right text-red-600">{formatCurrency(branch.cogs)}</td>
                        <td className="px-5 py-4 text-right text-green-600">{formatCurrency(branch.grossProfit)}</td>
                        <td className="px-5 py-4 text-right text-red-600">{formatCurrency(branch.opex)}</td>
                        <td className="px-5 py-4 text-right font-bold text-green-600">{formatCurrency(branch.netIncome)}</td>
                        <td className="px-5 py-4 text-center">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            {branch.margin}%
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50 font-bold">
                      <td className="px-5 py-4 text-blue-900">Total Konsolidasi</td>
                      <td className="px-5 py-4 text-right text-blue-900">{formatCurrency(branchPL.reduce((a, b) => a + b.revenue, 0))}</td>
                      <td className="px-5 py-4 text-right text-red-600">{formatCurrency(branchPL.reduce((a, b) => a + b.cogs, 0))}</td>
                      <td className="px-5 py-4 text-right text-green-600">{formatCurrency(branchPL.reduce((a, b) => a + b.grossProfit, 0))}</td>
                      <td className="px-5 py-4 text-right text-red-600">{formatCurrency(branchPL.reduce((a, b) => a + b.opex, 0))}</td>
                      <td className="px-5 py-4 text-right text-green-600">{formatCurrency(branchPL.reduce((a, b) => a + b.netIncome, 0))}</td>
                      <td className="px-5 py-4 text-center">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">20%</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'trend' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Margin Trend</h3>
              <Chart options={marginTrendOptions} series={marginTrendSeries} type="line" height={300} />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Net Income Trend</h3>
              <Chart options={profitTrendOptions} series={profitTrendSeries} type="area" height={300} />
            </div>

            <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Revenue vs Costs vs Profit</h3>
              <Chart options={revenueVsCostOptions} series={revenueVsCostSeries} type="bar" height={350} />
            </div>
          </div>
        )}
      </div>
    </HQLayout>
  );
}
