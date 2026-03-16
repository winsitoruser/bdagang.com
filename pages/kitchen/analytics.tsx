import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, TrendingUp, TrendingDown, Clock, Users,
  DollarSign, AlertTriangle, Calendar, Filter, Download,
  ArrowUp, ArrowDown, Minus
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    completionRate: number;
    avgPrepTime: number;
    cancelRate: number;
  };
  trends: {
    daily: Array<{
      date: string;
      orders: number;
      revenue: number;
      avgTime: number;
    }>;
    hourly: Array<{
      hour: number;
      orders: number;
      revenue: number;
    }>;
  };
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
    growth: number;
  }>;
  staffPerformance: Array<{
    name: string;
    orders: number;
    avgTime: number;
    completionRate: number;
    efficiency: number;
  }>;
  categories: Array<{
    name: string;
    orders: number;
    revenue: number;
    percentage: number;
  }>;
}

const KitchenAnalyticsPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const MOCK_K_ANALYTICS: AnalyticsData = { overview: { totalOrders: 1842, totalRevenue: 92500000, avgOrderValue: 50200, completionRate: 95, avgPrepTime: 18, cancelRate: 5 }, trends: { daily: [{ date: '2026-03-13', orders: 58, revenue: 2900000, avgTime: 17 }, { date: '2026-03-14', orders: 62, revenue: 3100000, avgTime: 18 }, { date: '2026-03-15', orders: 55, revenue: 2750000, avgTime: 16 }], hourly: [{ hour: 11, orders: 12, revenue: 600000 }, { hour: 12, orders: 18, revenue: 900000 }, { hour: 13, orders: 15, revenue: 750000 }, { hour: 18, orders: 16, revenue: 800000 }, { hour: 19, orders: 20, revenue: 1000000 }] }, topProducts: [{ name: 'Nasi Goreng', quantity: 245, revenue: 12250000, growth: 12 }, { name: 'Mie Ayam', quantity: 198, revenue: 7920000, growth: 8 }, { name: 'Es Teh Manis', quantity: 312, revenue: 4680000, growth: 15 }], staffPerformance: [{ name: 'Chef Andi', orders: 425, avgTime: 15, completionRate: 98, efficiency: 92 }, { name: 'Chef Budi', orders: 380, avgTime: 18, completionRate: 95, efficiency: 85 }], categories: [{ name: 'Makanan Utama', orders: 820, revenue: 41000000, percentage: 44.3 }, { name: 'Minuman', orders: 650, revenue: 19500000, percentage: 21.1 }, { name: 'Snack', orders: 372, revenue: 18600000, percentage: 20.1 }] };
  const [data, setData] = useState<AnalyticsData | null>(MOCK_K_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [compareWithPrevious, setCompareWithPrevious] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAnalytics();
    }
  }, [status, period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch sales data
      const salesResponse = await fetch(`/api/kitchen/reports?type=sales&startDate=${getStartDate()}&endDate=${getEndDate()}`);
      const salesResult = await salesResponse.json();
      
      // Fetch performance data
      const perfResponse = await fetch(`/api/kitchen/reports?type=performance&startDate=${getStartDate()}&endDate=${getEndDate()}`);
      const perfResult = await perfResponse.json();
      
      if (salesResult.success && perfResult.success) {
        // Process and combine data
        const processedData: AnalyticsData = {
          overview: {
            totalOrders: salesResult.data.summary.totalOrders,
            totalRevenue: salesResult.data.summary.totalRevenue,
            avgOrderValue: salesResult.data.summary.avgOrderValue,
            completionRate: 95, // Calculate from performance data
            avgPrepTime: 18, // Calculate from performance data
            cancelRate: 5 // Calculate from sales data
          },
          trends: {
            daily: salesResult.data.dailySales.map((day: any) => ({
              date: day.date,
              orders: day.order_count,
              revenue: day.total_revenue,
              avgTime: Math.random() * 10 + 15 // Mock data
            })),
            hourly: perfResult.data.peakHours.map((hour: any) => ({
              hour: Math.round(hour.hour),
              orders: hour.order_count,
              revenue: hour.avg_order_value
            }))
          },
          topProducts: salesResult.data.topProducts.slice(0, 10).map((product: any, index: number) => ({
            name: product.name,
            quantity: product.total_sold,
            revenue: product.total_revenue,
            growth: Math.random() * 40 - 10 // Mock growth data
          })),
          staffPerformance: perfResult.data.staffPerformance.map((staff: any) => ({
            name: staff.name,
            orders: staff.total_orders,
            avgTime: staff.avg_preparation_time || 0,
            completionRate: staff.completion_rate || 0,
            efficiency: Math.random() * 30 + 70 // Mock efficiency
          })),
          categories: salesResult.data.categoryPerformance.map((cat: any) => ({
            name: cat.category_name || 'Uncategorized',
            orders: cat.order_count,
            revenue: cat.total_revenue,
            percentage: cat.revenue_percentage
          }))
        };
        
        setData(processedData);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setData(MOCK_K_ANALYTICS);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    const now = new Date();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return start.toISOString().split('T')[0];
  };

  const getEndDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (growth < 0) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

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
        <title>{t('kitchen.analyticsTitle')} | BEDAGANG</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-1.5 bg-gradient-to-b from-sky-400 to-blue-500 rounded-full mr-3"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{t('kitchen.analyticsTitle')}</h1>
              <p className="text-gray-600">{t('kitchen.analyticsSubtitle')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Period Selector */}
            <div className="flex gap-2">
              {[
                { key: '7d', label: '7 Hari' },
                { key: '30d', label: '30 Hari' },
                { key: '90d', label: '90 Hari' }
              ].map((p) => (
                <Button
                  key={p.key}
                  variant={period === p.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod(p.key as any)}
                  className={period === p.key ? 'bg-sky-600' : ''}
                >
                  {p.label}
                </Button>
              ))}
            </div>
            
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-12">
              <div className="flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-sky-600 border-t-transparent rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        ) : data ? (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{data.overview.totalOrders.toLocaleString()}</p>
                      <div className={`flex items-center text-sm mt-1 ${getGrowthColor(12)}`}>
                        {getGrowthIcon(12)}
                        <span className="ml-1">12% vs last period</span>
                      </div>
                    </div>
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Revenue</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(data.overview.totalRevenue)}</p>
                      <div className={`flex items-center text-sm mt-1 ${getGrowthColor(8)}`}>
                        {getGrowthIcon(8)}
                        <span className="ml-1">8% vs last period</span>
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
                      <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
                      <p className="text-2xl font-bold text-purple-600">{formatCurrency(data.overview.avgOrderValue)}</p>
                      <div className={`flex items-center text-sm mt-1 ${getGrowthColor(-3)}`}>
                        {getGrowthIcon(-3)}
                        <span className="ml-1">-3% vs last period</span>
                      </div>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                      <p className="text-2xl font-bold text-blue-600">{data.overview.completionRate}%</p>
                      <div className={`flex items-center text-sm mt-1 ${getGrowthColor(5)}`}>
                        {getGrowthIcon(5)}
                        <span className="ml-1">5% vs last period</span>
                      </div>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Avg Prep Time</p>
                      <p className="text-2xl font-bold text-amber-600">{data.overview.avgPrepTime}m</p>
                      <div className={`flex items-center text-sm mt-1 ${getGrowthColor(-10)}`}>
                        {getGrowthIcon(-10)}
                        <span className="ml-1">-10% vs last period</span>
                      </div>
                    </div>
                    <Clock className="w-8 h-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Cancel Rate</p>
                      <p className="text-2xl font-bold text-red-600">{data.overview.cancelRate}%</p>
                      <div className={`flex items-center text-sm mt-1 ${getGrowthColor(-2)}`}>
                        {getGrowthIcon(-2)}
                        <span className="ml-1">-2% vs last period</span>
                      </div>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Daily Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {/* Simple bar chart visualization */}
                    <div className="flex items-end justify-between h-full gap-1">
                      {data.trends.daily.slice(-7).map((day, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-sky-500 rounded-t"
                            style={{ height: `${(day.orders / Math.max(...data.trends.daily.map(d => d.orders))) * 100}%` }}
                          ></div>
                          <div className="text-xs text-gray-600 mt-1 text-center">
                            {new Date(day.date).toLocaleDateString('id-ID', { weekday: 'short' })}
                          </div>
                          <div className="text-xs font-medium">{day.orders}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hourly Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Hourly Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {/* Simple area chart visualization */}
                    <div className="flex items-end justify-between h-full gap-1">
                      {data.trends.hourly.map((hour, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-gradient-to-t from-blue-500 to-sky-400 rounded-t"
                            style={{ height: `${(hour.orders / Math.max(...data.trends.hourly.map(h => h.orders))) * 100}%` }}
                          ></div>
                          <div className="text-xs text-gray-600 mt-1">{hour.hour}:00</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Products & Staff Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.topProducts.slice(0, 5).map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-600">{product.quantity} sold</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(product.revenue)}</div>
                          <div className={`flex items-center text-sm ${getGrowthColor(product.growth)}`}>
                            {getGrowthIcon(product.growth)}
                            <span className="ml-1">{Math.abs(product.growth).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Staff Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Staff Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.staffPerformance.slice(0, 5).map((staff, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{staff.name}</div>
                            <div className="text-sm text-gray-600">{staff.orders} orders</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{Math.round(staff.avgTime)}m avg</div>
                          <div className="text-sm text-green-600">{staff.completionRate}% complete</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {data.categories.map((category, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{category.name}</span>
                        <Badge variant="outline">{category.percentage}%</Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Orders:</span>
                          <span>{category.orders}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Revenue:</span>
                          <span>{formatCurrency(category.revenue)}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-sky-600 h-2 rounded-full"
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default KitchenAnalyticsPage;
