import React, { useState, useEffect, useMemo } from 'react';
import HQLayout from '../../components/hq/HQLayout';
import { StatsCard, StatusBadge } from '../../components/hq/ui';
import Modal from '../../components/hq/ui/Modal';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  MapPin,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  Filter,
  Download,
  Bell,
  ChevronRight,
  Store,
  Wallet,
  Box,
  UserCheck,
  Zap,
  Target,
  Award,
  Calendar,
  Eye,
  Edit,
  Check,
  X,
  ExternalLink,
  Settings,
  MoreVertical,
  Briefcase,
  CreditCard,
  Receipt,
  Truck,
  LayoutGrid,
  LineChart as LineChartIcon,
  Globe,
  Layers,
  Coffee,
  Utensils,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Percent,
  Hash,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
  ComposedChart,
  RadialBarChart,
  RadialBar,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

interface BranchData {
  id: string;
  code: string;
  name: string;
  type: 'main' | 'branch' | 'warehouse' | 'kiosk';
  city: string;
  province: string;
  isActive: boolean;
  manager: string;
  todaySales: number;
  yesterdaySales: number;
  monthSales: number;
  transactionCount: number;
  avgTicketSize: number;
  stockValue: number;
  lowStockItems: number;
  employeeCount: number;
  activeEmployees: number;
  lastSync: string;
  status: 'online' | 'offline' | 'warning';
  performanceScore: number;
}

interface Alert {
  id: string;
  branchId: string;
  branchName: string;
  type: 'low_stock' | 'high_sales' | 'low_sales' | 'employee' | 'system';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

// Mock data defined outside component to avoid TDZ issues
const mockBranchesData: BranchData[] = [
    {
      id: '1',
      code: 'HQ-001',
      name: 'Cabang Pusat Jakarta',
      type: 'main',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      isActive: true,
      manager: 'Ahmad Wijaya',
      todaySales: 45000000,
      yesterdaySales: 42000000,
      monthSales: 1250000000,
      transactionCount: 156,
      avgTicketSize: 288462,
      stockValue: 850000000,
      lowStockItems: 5,
      employeeCount: 25,
      activeEmployees: 22,
      lastSync: new Date().toISOString(),
      status: 'online',
      performanceScore: 92
    },
    {
      id: '2',
      code: 'BR-002',
      name: 'Cabang Bandung',
      type: 'branch',
      city: 'Bandung',
      province: 'Jawa Barat',
      isActive: true,
      manager: 'Siti Rahayu',
      todaySales: 32000000,
      yesterdaySales: 35000000,
      monthSales: 920000000,
      transactionCount: 98,
      avgTicketSize: 326531,
      stockValue: 450000000,
      lowStockItems: 12,
      employeeCount: 18,
      activeEmployees: 16,
      lastSync: new Date(Date.now() - 300000).toISOString(),
      status: 'online',
      performanceScore: 85
    },
    {
      id: '3',
      code: 'BR-003',
      name: 'Cabang Surabaya',
      type: 'branch',
      city: 'Surabaya',
      province: 'Jawa Timur',
      isActive: true,
      manager: 'Budi Santoso',
      todaySales: 28500000,
      yesterdaySales: 31000000,
      monthSales: 780000000,
      transactionCount: 87,
      avgTicketSize: 327586,
      stockValue: 380000000,
      lowStockItems: 8,
      employeeCount: 15,
      activeEmployees: 14,
      lastSync: new Date(Date.now() - 600000).toISOString(),
      status: 'online',
      performanceScore: 78
    },
    {
      id: '4',
      code: 'BR-004',
      name: 'Cabang Medan',
      type: 'branch',
      city: 'Medan',
      province: 'Sumatera Utara',
      isActive: true,
      manager: 'Dewi Lestari',
      todaySales: 22000000,
      yesterdaySales: 24500000,
      monthSales: 650000000,
      transactionCount: 72,
      avgTicketSize: 305556,
      stockValue: 320000000,
      lowStockItems: 15,
      employeeCount: 12,
      activeEmployees: 10,
      lastSync: new Date(Date.now() - 1800000).toISOString(),
      status: 'warning',
      performanceScore: 72
    },
    {
      id: '5',
      code: 'BR-005',
      name: 'Cabang Yogyakarta',
      type: 'branch',
      city: 'Yogyakarta',
      province: 'DI Yogyakarta',
      isActive: true,
      manager: 'Eko Prasetyo',
      todaySales: 18500000,
      yesterdaySales: 19000000,
      monthSales: 520000000,
      transactionCount: 65,
      avgTicketSize: 284615,
      stockValue: 280000000,
      lowStockItems: 3,
      employeeCount: 10,
      activeEmployees: 10,
      lastSync: new Date(Date.now() - 120000).toISOString(),
      status: 'online',
      performanceScore: 88
    },
    {
      id: '6',
      code: 'WH-001',
      name: 'Gudang Pusat Cikarang',
      type: 'warehouse',
      city: 'Cikarang',
      province: 'Jawa Barat',
      isActive: true,
      manager: 'Hendra Kusuma',
      todaySales: 0,
      yesterdaySales: 0,
      monthSales: 0,
      transactionCount: 45,
      avgTicketSize: 0,
      stockValue: 2500000000,
      lowStockItems: 22,
      employeeCount: 35,
      activeEmployees: 30,
      lastSync: new Date(Date.now() - 60000).toISOString(),
      status: 'online',
      performanceScore: 95
    },
    {
      id: '7',
      code: 'KS-001',
      name: 'Kiosk Mall Taman Anggrek',
      type: 'kiosk',
      city: 'Jakarta Barat',
      province: 'DKI Jakarta',
      isActive: true,
      manager: 'Linda Susanti',
      todaySales: 8500000,
      yesterdaySales: 9200000,
      monthSales: 245000000,
      transactionCount: 45,
      avgTicketSize: 188889,
      stockValue: 85000000,
      lowStockItems: 2,
      employeeCount: 4,
      activeEmployees: 3,
      lastSync: new Date(Date.now() - 180000).toISOString(),
      status: 'online',
      performanceScore: 82
    },
    {
      id: '8',
      code: 'BR-006',
      name: 'Cabang Semarang',
      type: 'branch',
      city: 'Semarang',
      province: 'Jawa Tengah',
      isActive: false,
      manager: 'Agus Hermawan',
      todaySales: 0,
      yesterdaySales: 15000000,
      monthSales: 380000000,
      transactionCount: 0,
      avgTicketSize: 0,
      stockValue: 220000000,
      lowStockItems: 0,
      employeeCount: 8,
      activeEmployees: 0,
      lastSync: new Date(Date.now() - 7200000).toISOString(),
      status: 'offline',
      performanceScore: 0
    }
];

const mockAlertsData: Alert[] = [
    {
      id: '1',
      branchId: '4',
      branchName: 'Cabang Medan',
      type: 'low_stock',
      message: '15 produk mencapai batas minimum stok',
      severity: 'warning',
      timestamp: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: '2',
      branchId: '8',
      branchName: 'Cabang Semarang',
      type: 'system',
      message: 'Tidak ada koneksi selama 2 jam terakhir',
      severity: 'critical',
      timestamp: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: '3',
      branchId: '1',
      branchName: 'Cabang Pusat Jakarta',
      type: 'high_sales',
      message: 'Penjualan hari ini meningkat 25% dari rata-rata',
      severity: 'info',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '4',
      branchId: '6',
      branchName: 'Gudang Pusat Cikarang',
      type: 'low_stock',
      message: '22 produk perlu restocking segera',
      severity: 'warning',
      timestamp: new Date(Date.now() - 5400000).toISOString()
    }
];

interface SalesTrendData {
  date: string;
  day: string;
  sales: number;
  transactions: number;
}

interface RegionData {
  region: string;
  sales: number;
  branches: number;
}

interface TopProduct {
  id: string;
  name: string;
  category: string;
  sold: number;
  revenue: number;
  growth: number;
}

interface RecentTransaction {
  id: string;
  branchName: string;
  amount: number;
  items: number;
  paymentMethod: string;
  timestamp: string;
}

interface EmployeeStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  onLeave: number;
}

interface FinancialMetrics {
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  pendingPayables: number;
  pendingReceivables: number;
}

interface TargetProgress {
  label: string;
  current: number;
  target: number;
  unit: string;
}

const mockTopProducts: TopProduct[] = [
  { id: '1', name: 'Nasi Goreng Spesial', category: 'Makanan', sold: 1250, revenue: 31250000, growth: 15.2 },
  { id: '2', name: 'Es Teh Manis', category: 'Minuman', sold: 2100, revenue: 10500000, growth: 8.5 },
  { id: '3', name: 'Ayam Bakar', category: 'Makanan', sold: 890, revenue: 26700000, growth: 12.3 },
  { id: '4', name: 'Mie Goreng', category: 'Makanan', sold: 780, revenue: 19500000, growth: -2.1 },
  { id: '5', name: 'Kopi Susu', category: 'Minuman', sold: 1450, revenue: 21750000, growth: 22.4 }
];

const mockRecentTransactions: RecentTransaction[] = [
  { id: 'TRX001', branchName: 'Cabang Pusat Jakarta', amount: 485000, items: 5, paymentMethod: 'QRIS', timestamp: new Date(Date.now() - 120000).toISOString() },
  { id: 'TRX002', branchName: 'Cabang Bandung', amount: 235000, items: 3, paymentMethod: 'Tunai', timestamp: new Date(Date.now() - 300000).toISOString() },
  { id: 'TRX003', branchName: 'Cabang Surabaya', amount: 892000, items: 8, paymentMethod: 'Debit', timestamp: new Date(Date.now() - 480000).toISOString() },
  { id: 'TRX004', branchName: 'Kiosk Mall TA', amount: 156000, items: 2, paymentMethod: 'E-Wallet', timestamp: new Date(Date.now() - 720000).toISOString() },
  { id: 'TRX005', branchName: 'Cabang Medan', amount: 445000, items: 4, paymentMethod: 'Kredit', timestamp: new Date(Date.now() - 900000).toISOString() }
];

const mockEmployeeStats: EmployeeStats = {
  total: 127,
  present: 112,
  absent: 5,
  late: 7,
  onLeave: 3
};

const mockFinancialMetrics: FinancialMetrics = {
  revenue: 4120000000,
  expenses: 2884000000,
  profit: 1236000000,
  profitMargin: 30,
  pendingPayables: 320000000,
  pendingReceivables: 450000000
};

const mockTargets: TargetProgress[] = [
  { label: 'Penjualan Bulanan', current: 4.12, target: 5, unit: 'M' },
  { label: 'Transaksi Harian', current: 523, target: 600, unit: '' },
  { label: 'Pelanggan Baru', current: 1250, target: 1500, unit: '' },
  { label: 'Rating Kepuasan', current: 4.6, target: 4.8, unit: '/5' }
];

const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, '0')}:00`,
  sales: Math.floor(Math.random() * 15000000) + 2000000,
  transactions: Math.floor(Math.random() * 50) + 10
}));

export default function HQDashboard() {
  const [mounted, setMounted] = useState(false);
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [salesTrendData, setSalesTrendData] = useState<SalesTrendData[]>([]);
  const [regionData, setRegionData] = useState<RegionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('today');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // New comprehensive dashboard state
  const [topProducts, setTopProducts] = useState<TopProduct[]>(mockTopProducts);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>(mockRecentTransactions);
  const [employeeStats, setEmployeeStats] = useState<EmployeeStats>(mockEmployeeStats);
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics>(mockFinancialMetrics);
  const [targets, setTargets] = useState<TargetProgress[]>(mockTargets);
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'branches' | 'analytics'>('overview');
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [chartView, setChartView] = useState<'daily' | 'hourly' | 'weekly'>('daily');
  
  // Interactive state
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [selectedBranchData, setSelectedBranchData] = useState<BranchData | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  // Current time for live display
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/hq/dashboard?period=${selectedPeriod}`);
      if (response.ok) {
        const data = await response.json();
        setBranches(data.branches || mockBranchesData);
        setAlerts(data.alerts || mockAlertsData);
        if (data.salesTrend) {
          setSalesTrendData(data.salesTrend.map((t: SalesTrendData) => ({
            ...t,
            sales: t.sales / 1000000 // Convert to millions for chart
          })));
        }
        if (data.regionPerformance) {
          setRegionData(data.regionPerformance.map((r: RegionData) => ({
            ...r,
            sales: r.sales / 1000000 // Convert to millions
          })));
        }
      } else {
        setBranches(mockBranchesData);
        setAlerts(mockAlertsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setBranches(mockBranchesData);
      setAlerts(mockAlertsData);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const handleViewBranch = (branch: BranchData) => {
    setSelectedBranchData(branch);
    setShowBranchModal(true);
  };

  const handleEditBranch = (branch: BranchData) => {
    window.location.href = `/hq/branches/${branch.id}/edit`;
  };

  const handleViewAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setShowAlertModal(true);
  };

  const handleDismissAlert = async (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    setShowAlertModal(false);
  };

  const handleResolveAlert = async (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    setShowAlertModal(false);
  };

  if (!mounted) {
    return null;
  }

  // Calculate totals
  const activeBranches = branches.filter(b => b.isActive && b.type !== 'warehouse');
  const totalSalesToday = activeBranches.reduce((sum, b) => sum + b.todaySales, 0);
  const totalSalesYesterday = activeBranches.reduce((sum, b) => sum + b.yesterdaySales, 0);
  const totalSalesMonth = activeBranches.reduce((sum, b) => sum + b.monthSales, 0);
  const totalTransactions = activeBranches.reduce((sum, b) => sum + b.transactionCount, 0);
  const totalStockValue = branches.reduce((sum, b) => sum + b.stockValue, 0);
  const totalLowStockItems = branches.reduce((sum, b) => sum + b.lowStockItems, 0);
  const totalEmployees = branches.reduce((sum, b) => sum + b.employeeCount, 0);
  const totalActiveEmployees = branches.reduce((sum, b) => sum + b.activeEmployees, 0);
  const avgPerformance = activeBranches.length > 0 
    ? Math.round(activeBranches.reduce((sum, b) => sum + b.performanceScore, 0) / activeBranches.length)
    : 0;

  const salesGrowth = totalSalesYesterday > 0 
    ? ((totalSalesToday - totalSalesYesterday) / totalSalesYesterday * 100).toFixed(1)
    : '0';

  // Chart data
  const branchSalesData = activeBranches
    .filter(b => b.type !== 'warehouse')
    .map(b => ({
      name: b.name.replace('Cabang ', '').replace('Kiosk ', ''),
      sales: b.todaySales / 1000000,
      transactions: b.transactionCount
    }))
    .sort((a, b) => b.sales - a.sales);

  const branchTypeData = [
    { name: 'Cabang Utama', value: branches.filter(b => b.type === 'main').length },
    { name: 'Cabang', value: branches.filter(b => b.type === 'branch').length },
    { name: 'Gudang', value: branches.filter(b => b.type === 'warehouse').length },
    { name: 'Kiosk', value: branches.filter(b => b.type === 'kiosk').length }
  ].filter(d => d.value > 0);

  // Use API data if available, otherwise use defaults
  const fallbackSalesTrend = [
    { day: 'Sen', sales: 125 },
    { day: 'Sel', sales: 142 },
    { day: 'Rab', sales: 138 },
    { day: 'Kam', sales: 155 },
    { day: 'Jum', sales: 162 },
    { day: 'Sab', sales: 185 },
    { day: 'Min', sales: 154 }
  ];

  const fallbackRegionData = [
    { region: 'DKI Jakarta', sales: 53.5, branches: 2 },
    { region: 'Jawa Barat', sales: 32, branches: 2 },
    { region: 'Jawa Timur', sales: 28.5, branches: 1 },
    { region: 'Sumatera Utara', sales: 22, branches: 1 },
    { region: 'DI Yogyakarta', sales: 18.5, branches: 1 }
  ];

  const chartSalesTrend = salesTrendData.length > 0 ? salesTrendData : fallbackSalesTrend;
  const chartRegionData = regionData.length > 0 ? regionData : fallbackRegionData;

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `Rp ${(value / 1000000000).toFixed(1)}M`;
    } else if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(1)}Jt`;
    } else if (value >= 1000) {
      return `Rp ${(value / 1000).toFixed(0)}rb`;
    }
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_stock': return <Package className="w-4 h-4" />;
      case 'high_sales': return <TrendingUp className="w-4 h-4" />;
      case 'low_sales': return <TrendingDown className="w-4 h-4" />;
      case 'employee': return <Users className="w-4 h-4" />;
      case 'system': return <AlertTriangle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'main': return 'Pusat';
      case 'branch': return 'Cabang';
      case 'warehouse': return 'Gudang';
      case 'kiosk': return 'Kiosk';
      default: return type;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'main': return 'bg-purple-100 text-purple-800';
      case 'branch': return 'bg-blue-100 text-blue-800';
      case 'warehouse': return 'bg-orange-100 text-orange-800';
      case 'kiosk': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <HQLayout title="HQ Dashboard" subtitle="Pusat Kontrol Bisnis">
      <div className="space-y-6">
        {/* Executive Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Selamat {currentTime.getHours() < 12 ? 'Pagi' : currentTime.getHours() < 18 ? 'Siang' : 'Malam'}!</h1>
                  <p className="text-white/80 text-sm">
                    {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-sm">{isLiveMode ? 'Live Mode' : 'Static Mode'}</span>
                </div>
                <div className="text-sm text-white/80">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {currentTime.toLocaleTimeString('id-ID')}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsLiveMode(!isLiveMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isLiveMode ? 'bg-green-500/20 text-green-100 border border-green-400/30' : 'bg-white/10 text-white/80 border border-white/20'
                }`}
              >
                {isLiveMode ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isLiveMode ? 'Live' : 'Paused'}
              </button>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-sm focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
              >
                <option value="today" className="text-gray-900">Hari Ini</option>
                <option value="week" className="text-gray-900">Minggu Ini</option>
                <option value="month" className="text-gray-900">Bulan Ini</option>
                <option value="year" className="text-gray-900">Tahun Ini</option>
              </select>
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-sm hover:bg-white/20 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-xl text-sm font-medium hover:bg-white/90 transition-all">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
          
          {/* Quick Stats in Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Total Penjualan</span>
                <DollarSign className="w-4 h-4 text-white/50" />
              </div>
              <p className="text-2xl font-bold mt-1">{formatCurrency(totalSalesToday)}</p>
              <div className={`flex items-center gap-1 text-xs mt-1 ${parseFloat(salesGrowth) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {parseFloat(salesGrowth) >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(parseFloat(salesGrowth))}% dari kemarin
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Transaksi</span>
                <Receipt className="w-4 h-4 text-white/50" />
              </div>
              <p className="text-2xl font-bold mt-1">{totalTransactions.toLocaleString('id-ID')}</p>
              <p className="text-xs text-white/70 mt-1">Avg: {formatCurrency(totalSalesToday / (totalTransactions || 1))}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Cabang Aktif</span>
                <Store className="w-4 h-4 text-white/50" />
              </div>
              <p className="text-2xl font-bold mt-1">{branches.filter(b => b.status === 'online').length}/{branches.length}</p>
              <div className="flex items-center gap-2 text-xs mt-1">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full"></span>{branches.filter(b => b.status === 'online').length}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-400 rounded-full"></span>{branches.filter(b => b.status === 'warning').length}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-full"></span>{branches.filter(b => b.status === 'offline').length}</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Performa</span>
                <Target className="w-4 h-4 text-white/50" />
              </div>
              <p className="text-2xl font-bold mt-1">{avgPerformance}%</p>
              <div className="w-full bg-white/20 rounded-full h-1.5 mt-2">
                <div className="bg-white h-1.5 rounded-full" style={{ width: `${avgPerformance}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutGrid },
            { id: 'sales', label: 'Penjualan', icon: LineChartIcon },
            { id: 'branches', label: 'Cabang', icon: Building2 },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column - Main Charts & Data */}
          <div className="xl:col-span-3 space-y-6">
            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    parseFloat(salesGrowth) >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {parseFloat(salesGrowth) >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(parseFloat(salesGrowth))}%
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue Hari Ini</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalSalesToday)}</p>
                  <p className="text-xs text-gray-400 mt-1">vs {formatCurrency(totalSalesYesterday)} kemarin</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                    <Activity className="w-3 h-3" />
                    Live
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Transaksi</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalTransactions.toLocaleString('id-ID')}</p>
                  <p className="text-xs text-gray-400 mt-1">Avg {formatCurrency(totalSalesToday / (totalTransactions || 1))}/trx</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-gradient-to-br from-violet-400 to-violet-600 rounded-xl">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  {totalLowStockItems > 0 && (
                    <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-red-50 text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      {totalLowStockItems}
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai Stok</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalStockValue)}</p>
                  <p className="text-xs text-gray-400 mt-1">Di {branches.length} lokasi</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-50 text-amber-600">
                    Bulan Ini
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Bulan</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalSalesMonth)}</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Target Rp 5M</span>
                      <span className="font-medium text-amber-600">{Math.round((totalSalesMonth / 5000000000) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-1.5 rounded-full" style={{ width: `${Math.min((totalSalesMonth / 5000000000) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Chart with View Toggle */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Tren Penjualan</h3>
                  <p className="text-sm text-gray-500">Analisis penjualan real-time</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                    {['daily', 'hourly', 'weekly'].map(view => (
                      <button
                        key={view}
                        onClick={() => setChartView(view as any)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                          chartView === view ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {view === 'daily' ? 'Harian' : view === 'hourly' ? 'Per Jam' : 'Mingguan'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartView === 'hourly' ? hourlyData.slice(6, 23) : chartSalesTrend}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis 
                      dataKey={chartView === 'hourly' ? 'hour' : 'day'} 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      tickFormatter={(v) => chartView === 'hourly' ? `${(v/1000000).toFixed(0)}Jt` : `${v}Jt`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                        padding: '12px'
                      }}
                      formatter={(value: number) => [
                        chartView === 'hourly' ? `Rp ${(value/1000000).toFixed(1)} Juta` : `Rp ${value} Juta`, 
                        'Penjualan'
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#6366F1" 
                      strokeWidth={2.5}
                      fill="url(#salesGradient)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="transactions" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={false}
                      hide={chartView === 'hourly'}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  <span className="text-sm text-gray-600">Penjualan</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-sm text-gray-600">Transaksi</span>
                </div>
              </div>
            </div>

            {/* Two Column Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Products */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Produk Terlaris</h3>
                      <p className="text-sm text-gray-500">Berdasarkan jumlah terjual</p>
                    </div>
                    <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                      Lihat Semua
                    </button>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-amber-100 text-amber-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-50 text-gray-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{product.sold.toLocaleString()}</p>
                        <p className={`text-xs flex items-center justify-end gap-0.5 ${product.growth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {product.growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {Math.abs(product.growth)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Transaksi Terbaru</h3>
                      <p className="text-sm text-gray-500">Real-time dari semua cabang</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      Live
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  {recentTransactions.map((trx) => (
                    <div key={trx.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 text-sm">{trx.id}</p>
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">{trx.paymentMethod}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{trx.branchName} • {trx.items} item</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(trx.amount)}</p>
                        <p className="text-xs text-gray-400">
                          {Math.round((Date.now() - new Date(trx.timestamp).getTime()) / 60000)} menit lalu
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Branch Performance Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-5 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Performa Cabang</h3>
                    <p className="text-sm text-gray-500">Monitoring real-time semua lokasi</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="all">Semua Tipe</option>
                      <option value="main">Pusat</option>
                      <option value="branch">Cabang</option>
                      <option value="warehouse">Gudang</option>
                      <option value="kiosk">Kiosk</option>
                    </select>
                    <button 
                      onClick={() => window.location.href = '/hq/branches'}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Kelola Cabang
                    </button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cabang</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Penjualan</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaksi</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Performa</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {branches
                      .filter(b => selectedBranch === 'all' || b.type === selectedBranch)
                      .slice(0, 6)
                      .map((branch) => (
                      <tr key={branch.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              branch.type === 'main' ? 'bg-purple-100' :
                              branch.type === 'warehouse' ? 'bg-orange-100' :
                              branch.type === 'kiosk' ? 'bg-green-100' :
                              'bg-blue-100'
                            }`}>
                              {branch.type === 'warehouse' ? <Truck className="w-5 h-5 text-orange-600" /> :
                               branch.type === 'kiosk' ? <Coffee className="w-5 h-5 text-green-600" /> :
                               <Store className="w-5 h-5 text-blue-600" />}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{branch.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTypeBadgeColor(branch.type)}`}>
                                  {getTypeLabel(branch.type)}
                                </span>
                                <span className="text-xs text-gray-500">{branch.city}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              branch.status === 'online' ? 'bg-emerald-50 text-emerald-700' :
                              branch.status === 'warning' ? 'bg-amber-50 text-amber-700' :
                              'bg-red-50 text-red-700'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                branch.status === 'online' ? 'bg-emerald-500' :
                                branch.status === 'warning' ? 'bg-amber-500' :
                                'bg-red-500'
                              }`}></span>
                              {branch.status === 'online' ? 'Online' : branch.status === 'warning' ? 'Warning' : 'Offline'}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(branch.todaySales)}</p>
                          <p className={`text-xs flex items-center justify-end gap-0.5 mt-0.5 ${
                            branch.todaySales >= branch.yesterdaySales ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {branch.todaySales >= branch.yesterdaySales ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {branch.yesterdaySales > 0 ? Math.abs(((branch.todaySales - branch.yesterdaySales) / branch.yesterdaySales * 100)).toFixed(1) : 0}%
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <p className="font-semibold text-gray-900">{branch.transactionCount}</p>
                          {branch.lowStockItems > 0 && (
                            <p className="text-xs text-red-600 mt-0.5">{branch.lowStockItems} low stock</p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-center">
                            <div className="relative w-12 h-12">
                              <svg className="w-12 h-12 transform -rotate-90">
                                <circle cx="24" cy="24" r="20" fill="none" stroke="#E5E7EB" strokeWidth="4" />
                                <circle
                                  cx="24" cy="24" r="20" fill="none"
                                  stroke={branch.performanceScore >= 80 ? '#10B981' : branch.performanceScore >= 60 ? '#F59E0B' : '#EF4444'}
                                  strokeWidth="4"
                                  strokeDasharray={`${branch.performanceScore * 1.256} 126`}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{branch.performanceScore}%</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button 
                            onClick={() => window.location.href = `/hq/branches/${branch.id}`}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Target Progress */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Target & Pencapaian</h3>
                <Target className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {targets.map((target, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">{target.label}</span>
                      <span className="font-medium text-gray-900">
                        {target.current}{target.unit} / {target.target}{target.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          (target.current / target.target) >= 0.9 ? 'bg-emerald-500' :
                          (target.current / target.target) >= 0.7 ? 'bg-amber-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((target.current / target.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Employee Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Kehadiran Karyawan</h3>
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-emerald-600">{employeeStats.present}</p>
                  <p className="text-xs text-emerald-700">Hadir</p>
                </div>
                <div className="p-3 bg-red-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-red-600">{employeeStats.absent}</p>
                  <p className="text-xs text-red-700">Absen</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-amber-600">{employeeStats.late}</p>
                  <p className="text-xs text-amber-700">Terlambat</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-blue-600">{employeeStats.onLeave}</p>
                  <p className="text-xs text-blue-700">Cuti</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Karyawan</span>
                  <span className="font-semibold text-gray-900">{employeeStats.total}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${(employeeStats.present / employeeStats.total) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round((employeeStats.present / employeeStats.total) * 100)}% tingkat kehadiran
                </p>
              </div>
            </div>

            {/* Alerts Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Notifikasi</h3>
                    <p className="text-xs text-gray-500">{alerts.length} alert aktif</p>
                  </div>
                  {alerts.filter(a => a.severity === 'critical').length > 0 && (
                    <span className="flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full">
                      {alerts.filter(a => a.severity === 'critical').length}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-200" />
                    <p className="text-sm">Tidak ada alert</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => handleViewAlert(alert)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${getSeverityColor(alert.severity)}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{alert.branchName}</p>
                          <p className="text-xs mt-0.5 line-clamp-2">{alert.message}</p>
                          <p className="text-xs mt-1.5 opacity-60">
                            {new Date(alert.timestamp).toLocaleString('id-ID', {
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {alerts.length > 0 && (
                <div className="p-4 border-t border-gray-100">
                  <button className="w-full py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    Lihat Semua Alert
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white">
              <h3 className="font-semibold mb-4">Aksi Cepat</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => window.location.href = '/hq/branches/new'}
                  className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-left"
                >
                  <Building2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Tambah Cabang Baru</span>
                </button>
                <button 
                  onClick={() => window.location.href = '/hq/reports/sales'}
                  className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-left"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-sm font-medium">Lihat Laporan</span>
                </button>
                <button 
                  onClick={() => window.location.href = '/hq/requisitions'}
                  className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-left"
                >
                  <Truck className="w-5 h-5" />
                  <span className="text-sm font-medium">Kelola Requisition</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Branch Detail Modal */}
      <Modal
        isOpen={showBranchModal}
        onClose={() => setShowBranchModal(false)}
        title={selectedBranchData?.name || 'Detail Cabang'}
        subtitle={selectedBranchData?.code}
        size="xl"
        footer={
          <div className="flex justify-between">
            <button
              onClick={() => setShowBranchModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Tutup
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => window.open(`/hq/branches/${selectedBranchData?.id}`, '_blank')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ExternalLink className="w-4 h-4" />
                Buka di Tab Baru
              </button>
              <button
                onClick={() => handleEditBranch(selectedBranchData!)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="w-4 h-4" />
                Edit Cabang
              </button>
            </div>
          </div>
        }
      >
        {selectedBranchData && (
          <div className="space-y-6">
            {/* Branch Info */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Informasi Cabang</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <StatusBadge status={selectedBranchData.status} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipe</span>
                    <span className="font-medium">{getTypeLabel(selectedBranchData.type)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lokasi</span>
                    <span className="font-medium">{selectedBranchData.city}, {selectedBranchData.province}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Manager</span>
                    <span className="font-medium">{selectedBranchData.manager}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sinkronisasi Terakhir</span>
                    <span className="font-medium">{new Date(selectedBranchData.lastSync).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Performa Score</h4>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                      <circle 
                        cx="48" cy="48" r="40" 
                        stroke={selectedBranchData.performanceScore >= 80 ? '#10B981' : selectedBranchData.performanceScore >= 60 ? '#F59E0B' : '#EF4444'} 
                        strokeWidth="8" 
                        fill="none"
                        strokeDasharray={`${selectedBranchData.performanceScore * 2.51} 251`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">{selectedBranchData.performanceScore}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className={`text-lg font-semibold ${
                      selectedBranchData.performanceScore >= 80 ? 'text-green-600' : 
                      selectedBranchData.performanceScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {selectedBranchData.performanceScore >= 80 ? 'Sangat Baik' : 
                       selectedBranchData.performanceScore >= 60 ? 'Cukup Baik' : 'Perlu Perbaikan'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Berdasarkan penjualan, stok, dan aktivitas</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-600">Penjualan Hari Ini</p>
                <p className="text-xl font-bold text-blue-900">{formatCurrency(selectedBranchData.todaySales)}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {selectedBranchData.todaySales > selectedBranchData.yesterdaySales ? '↑' : '↓'} 
                  {Math.abs(((selectedBranchData.todaySales - selectedBranchData.yesterdaySales) / selectedBranchData.yesterdaySales * 100)).toFixed(1)}% dari kemarin
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-green-600">Transaksi</p>
                <p className="text-xl font-bold text-green-900">{selectedBranchData.transactionCount}</p>
                <p className="text-xs text-green-600 mt-1">Hari ini</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-sm text-purple-600">Rata-rata Ticket</p>
                <p className="text-xl font-bold text-purple-900">{formatCurrency(selectedBranchData.avgTicketSize)}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4">
                <p className="text-sm text-orange-600">Stok Rendah</p>
                <p className="text-xl font-bold text-orange-900">{selectedBranchData.lowStockItems}</p>
                <p className="text-xs text-orange-600 mt-1">Item perlu restock</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Aksi Cepat</h4>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => window.location.href = `/hq/reports/sales?branch=${selectedBranchData.id}`}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                >
                  <BarChart3 className="w-4 h-4" />
                  Lihat Laporan Penjualan
                </button>
                <button 
                  onClick={() => window.location.href = `/hq/requisitions?branch=${selectedBranchData.id}`}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                >
                  <Package className="w-4 h-4" />
                  Lihat Internal Requisition
                </button>
                <button 
                  onClick={() => window.location.href = `/hq/users?branch=${selectedBranchData.id}`}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                >
                  <Users className="w-4 h-4" />
                  Kelola Karyawan
                </button>
                <button 
                  onClick={() => window.location.href = `/hq/branches/${selectedBranchData.id}/settings`}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                >
                  <Settings className="w-4 h-4" />
                  Pengaturan Cabang
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Alert Detail Modal */}
      <Modal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title="Detail Alert"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => handleDismissAlert(selectedAlert?.id || '')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Abaikan
            </button>
            <button
              onClick={() => handleResolveAlert(selectedAlert?.id || '')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Check className="w-4 h-4" />
              Tandai Selesai
            </button>
          </div>
        }
      >
        {selectedAlert && (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${getSeverityColor(selectedAlert.severity)}`}>
              <div className="flex items-center gap-3">
                {getAlertIcon(selectedAlert.type)}
                <div>
                  <p className="font-medium">{selectedAlert.message}</p>
                  <p className="text-sm opacity-75">{selectedAlert.branchName}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Tipe</span>
                <span className="font-medium capitalize">{selectedAlert.type.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Severity</span>
                <StatusBadge status={selectedAlert.severity} />
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Waktu</span>
                <span className="font-medium">{new Date(selectedAlert.timestamp).toLocaleString('id-ID')}</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Aksi yang Disarankan</h4>
              <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
                {selectedAlert.type === 'low_stock' && 'Buat Internal Requisition untuk restock item yang stoknya rendah.'}
                {selectedAlert.type === 'low_sales' && 'Tinjau strategi penjualan cabang dan jadwalkan evaluasi dengan manager.'}
                {selectedAlert.type === 'high_sales' && 'Pastikan stok mencukupi untuk memenuhi permintaan tinggi.'}
                {selectedAlert.type === 'employee' && 'Hubungi manager cabang untuk mengatasi masalah kepegawaian.'}
                {selectedAlert.type === 'system' && 'Hubungi tim IT untuk menyelesaikan masalah teknis.'}
              </div>
            </div>
          </div>
        )}
      </Modal>
      </div>
    </HQLayout>
  );
}
