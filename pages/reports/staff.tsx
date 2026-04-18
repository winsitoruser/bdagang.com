import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, Users } from 'lucide-react';
import { exportToExcel } from '@/utils/exportUtils';

interface StaffRow {
  name: string;
  totalTransactions: number;
  totalSales: number;
  avgTransaction: number;
}

const StaffReportPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<StaffRow[]>([]);
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        reportType: 'staff',
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      const res = await fetch(`/api/reports/comprehensive?${params}`);
      const json = await res.json();
      if (json.success && json.data?.staffPerformance) {
        setRows(json.data.staffPerformance as StaffRow[]);
      } else {
        setRows([]);
      }
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, fetchData]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  const handleExport = () => {
    if (!rows.length) return;
    const data = rows.map((r) => ({
      Staff: r.name,
      Transaksi: r.totalTransactions,
      'Total Penjualan': r.totalSales,
      'Rata-rata': r.avgTransaction,
    }));
    exportToExcel(data, 'laporan-staff', 'Performa Staff');
  };

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin h-12 w-12 border-4 border-sky-600 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Laporan Performa Staff | BEDAGANG</title>
      </Head>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center">
            <div className="h-8 w-1.5 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Performa Staff / Kasir</h1>
              <p className="text-gray-600">Berdasarkan transaksi POS per periode</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="px-3 py-2 border rounded-md"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="px-3 py-2 border rounded-md"
            />
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleExport} disabled={!rows.length}>
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Ringkasan per staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <p className="text-gray-500 text-sm">Belum ada data transaksi untuk periode ini.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-600">
                      <th className="py-2 pr-4">Nama</th>
                      <th className="py-2 pr-4">Jumlah transaksi</th>
                      <th className="py-2 pr-4">Total penjualan</th>
                      <th className="py-2">Rata-rata per transaksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-3 pr-4 font-medium">{r.name}</td>
                        <td className="py-3 pr-4">{r.totalTransactions}</td>
                        <td className="py-3 pr-4">{formatCurrency(r.totalSales)}</td>
                        <td className="py-3">{formatCurrency(r.avgTransaction)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StaffReportPage;
