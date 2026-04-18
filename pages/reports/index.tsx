import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, TrendingUp, TrendingDown, DollarSign,
  Users, ShoppingCart, Calendar, Download, Filter,
  FileText, PieChart, Activity
} from 'lucide-react';

interface ReportSummary {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
  salesChange: number;
  ordersChange: number;
  customersChange: number;
}

const ReportsPage: React.FC = () => {
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [summary, setSummary] = useState<ReportSummary>({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
    salesChange: 0,
    ordersChange: 0,
    customersChange: 0
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const fetchReportSummary = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/summary?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      const result = await response.json();
      
      if (result.success) {
        setSummary(result.data);
      }
    } catch (error) {
      console.error('Error fetching report summary:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchReportSummary();
    }
  }, [status, fetchReportSummary]);

  const downloadJson = (filename: string, payload: unknown) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportBundle = async () => {
    setExporting(true);
    try {
      const q = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      const [summaryRes, salesRes, invRes, custRes, finRes, staffRes] = await Promise.all([
        fetch(`/api/reports/summary?${q}`),
        fetch(`/api/reports/comprehensive?reportType=sales&${q}&groupBy=day`),
        fetch(`/api/reports/comprehensive?reportType=inventory&${q}`),
        fetch(`/api/reports/comprehensive?reportType=customers&${q}`),
        fetch(`/api/reports/comprehensive?reportType=financial&${q}`),
        fetch(`/api/reports/comprehensive?reportType=staff&${q}`),
      ]);
      const [summaryJson, salesJson, invJson, custJson, finJson, staffJson] = await Promise.all([
        summaryRes.json(),
        salesRes.json(),
        invRes.json(),
        custRes.json(),
        finRes.json(),
        staffRes.json(),
      ]);
      downloadJson(`laporan-bundle-${dateRange.startDate}_${dateRange.endDate}.json`, {
        exportedAt: new Date().toISOString(),
        period: dateRange,
        summary: summaryJson,
        sales: salesJson,
        inventory: invJson,
        customers: custJson,
        financial: finJson,
        staff: staffJson,
      });
    } catch (e) {
      console.error('Export bundle failed:', e);
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const getChangeIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (value < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <div className="w-4 h-4" />;
  };

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const reportTypes = [
    {
      title: 'Laporan Penjualan',
      description: 'Tren penjualan, metode bayar, dan produk terlaris',
      icon: DollarSign,
      href: '/reports/sales',
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Laporan Dapur',
      description: 'Performa dapur & efisiensi (Kitchen)',
      icon: BarChart3,
      href: '/kitchen/reports',
      color: 'from-orange-500 to-red-600'
    },
    {
      title: 'Laporan Inventori',
      description: 'Stok, pergerakan, dan nilai persediaan',
      icon: ShoppingCart,
      href: '/inventory/reports',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Analitik Pelanggan',
      description: 'Perilaku dan segmentasi pelanggan',
      icon: Users,
      href: '/customers/reports',
      color: 'from-purple-500 to-pink-600'
    },
    {
      title: 'Performa Staff / Kasir',
      description: 'Transaksi per staff dari data POS',
      icon: Activity,
      href: '/reports/staff',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      title: 'Laporan Keuangan',
      description: 'Ringkasan pendapatan, biaya, dan laporan keuangan',
      icon: PieChart,
      href: '/finance/reports',
      color: 'from-amber-500 to-orange-600'
    }
  ];

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin h-12 w-12 border-4 border-sky-600 border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Laporan & Analitik | BEDAGANG</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-1.5 bg-gradient-to-b from-sky-400 to-blue-500 rounded-full mr-3"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Laporan &amp; Analitik</h1>
              <p className="text-gray-600">Ringkasan bisnis dan pintu masuk ke semua laporan</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Date Range */}
            <div id="report-period-filter" className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <span className="text-gray-500">s/d</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            
            <Button variant="outline" disabled={exporting || loading} onClick={handleExportBundle}>
              <Download className="w-4 h-4 mr-2" />
              {exporting ? 'Mengekspor…' : 'Export JSON'}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total penjualan</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalSales)}</p>
                  <div className={`flex items-center text-sm mt-1 ${getChangeColor(summary.salesChange)}`}>
                    {getChangeIcon(summary.salesChange)}
                    <span className="ml-1">{Math.abs(summary.salesChange)}%</span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Jumlah transaksi</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalOrders.toLocaleString()}</p>
                  <div className={`flex items-center text-sm mt-1 ${getChangeColor(summary.ordersChange)}`}>
                    {getChangeIcon(summary.ordersChange)}
                    <span className="ml-1">{Math.abs(summary.ordersChange)}%</span>
                  </div>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pelanggan (unik)</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalCustomers.toLocaleString()}</p>
                  <div className={`flex items-center text-sm mt-1 ${getChangeColor(summary.customersChange)}`}>
                    {getChangeIcon(summary.customersChange)}
                    <span className="ml-1">{Math.abs(summary.customersChange)}%</span>
                  </div>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nilai rata-rata per transaksi</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.avgOrderValue)}</p>
                  <div className="text-sm text-gray-500 mt-1">Per transaksi</div>
                </div>
                <BarChart3 className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Types Grid */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Jenis laporan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTypes.map((report, index) => {
              const Icon = report.icon;
              return (
                <Link key={index} href={report.href} className="block">
                  <Card className="hover:shadow-xl transition-all cursor-pointer group h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`bg-gradient-to-br ${report.color} w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <FileText className="text-gray-400 group-hover:text-sky-600 transition-colors" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {report.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {report.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center" disabled={exporting || loading} onClick={handleExportBundle}>
                <Download className="text-xl mb-1" />
                <span className="text-sm">Export semua (JSON)</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center" asChild>
                <Link href="/settings/notifications">
                  <Calendar className="text-xl mb-1" />
                  <span className="text-sm">Notifikasi &amp; jadwal</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center" type="button" onClick={() => document.getElementById('report-period-filter')?.scrollIntoView({ behavior: 'smooth' })}>
                <Filter className="text-xl mb-1" />
                <span className="text-sm">Filter periode</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center" asChild>
                <Link href="/reports/sales">
                  <FileText className="text-xl mb-1" />
                  <span className="text-sm">Laporan penjualan</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
