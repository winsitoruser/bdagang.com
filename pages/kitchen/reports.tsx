import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, TrendingDown, Clock, CheckCircle, 
  ChefHat, Calendar, Download, BarChart3, PieChart
} from 'lucide-react';

const KitchenReportsPage: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin h-12 w-12 border-4 border-sky-600 border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = {
    totalOrders: 156,
    avgPrepTime: 18,
    completionRate: 94,
    efficiency: 87
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Laporan Dapur | BEDAGANG</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <BarChart3 className="w-10 h-10 mr-3" />
                <h1 className="text-3xl font-bold">Laporan Dapur</h1>
              </div>
              <p className="text-sky-100">
                Analisis performa dan efisiensi operasional dapur
              </p>
            </div>
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-sky-600" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Pesanan</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              <p className="text-xs text-green-600 mt-1">+12% dari kemarin</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingDown className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Avg. Prep Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgPrepTime} min</p>
              <p className="text-xs text-green-600 mt-1">-2 min lebih cepat</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
              <p className="text-xs text-green-600 mt-1">+3% improvement</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Efisiensi</p>
              <p className="text-2xl font-bold text-gray-900">{stats.efficiency}%</p>
              <p className="text-xs text-green-600 mt-1">+5% dari target</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pesanan per Jam</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Chart akan ditampilkan di sini</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Menu Terpopuler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Chart akan ditampilkan di sini</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Performa Harian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tanggal</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Pesanan</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Avg. Time</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Completion</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Efisiensi</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { date: 'Hari Ini', orders: 156, time: 18, completion: 94, efficiency: 87 },
                    { date: 'Kemarin', orders: 142, time: 20, completion: 91, efficiency: 82 },
                    { date: '2 Hari Lalu', orders: 138, time: 19, completion: 93, efficiency: 85 },
                    { date: '3 Hari Lalu', orders: 145, time: 21, completion: 89, efficiency: 80 }
                  ].map((row, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">{row.date}</td>
                      <td className="py-4 px-4 text-gray-900">{row.orders}</td>
                      <td className="py-4 px-4 text-gray-900">{row.time} min</td>
                      <td className="py-4 px-4">
                        <span className="text-green-600 font-medium">{row.completion}%</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sky-600 font-medium">{row.efficiency}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default KitchenReportsPage;
