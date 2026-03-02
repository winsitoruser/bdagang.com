import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import HQLayout from '@/components/hq/HQLayout';
import {
  Package, TrendingUp, Users, Activity, Zap,
  CheckCircle, XCircle, Clock, BarChart3, PieChart,
  ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ModuleStats {
  code: string;
  name: string;
  category: string;
  tenantCount: number;
  activeFlows: number;
  eventsProcessed: number;
  avgResponseTime: number;
  errorRate: number;
  trend: 'up' | 'down' | 'stable';
}

interface SystemMetrics {
  totalModules: number;
  activeModules: number;
  totalTenants: number;
  totalEvents: number;
  avgEventsPerDay: number;
  systemUptime: number;
}

export default function ModuleAnalytics() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [moduleStats, setModuleStats] = useState<ModuleStats[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  
  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);
  
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hq/integrations/configs?category=module_analytics&timeRange=${timeRange}`);
      if (res.ok) { const json = await res.json(); const p = json.data || json; if (p.moduleStats) { setModuleStats(p.moduleStats); setSystemMetrics(p.systemMetrics || {}); setLoading(false); return; } }
    } catch { }
    try {
      const mockModuleStats: ModuleStats[] = [
        {
          code: 'POS_CORE',
          name: 'Point of Sale',
          category: 'core',
          tenantCount: 45,
          activeFlows: 3,
          eventsProcessed: 12500,
          avgResponseTime: 120,
          errorRate: 0.5,
          trend: 'up'
        },
        {
          code: 'INVENTORY_CORE',
          name: 'Inventory Management',
          category: 'core',
          tenantCount: 42,
          activeFlows: 2,
          eventsProcessed: 8900,
          avgResponseTime: 95,
          errorRate: 0.3,
          trend: 'stable'
        },
        {
          code: 'TABLE_MANAGEMENT',
          name: 'Table Management',
          category: 'fnb',
          tenantCount: 28,
          activeFlows: 4,
          eventsProcessed: 5600,
          avgResponseTime: 85,
          errorRate: 0.2,
          trend: 'up'
        },
        {
          code: 'KITCHEN_DISPLAY',
          name: 'Kitchen Display System',
          category: 'fnb',
          tenantCount: 35,
          activeFlows: 3,
          eventsProcessed: 9800,
          avgResponseTime: 110,
          errorRate: 0.4,
          trend: 'up'
        },
        {
          code: 'ONLINE_ORDERING',
          name: 'Online Ordering',
          category: 'optional',
          tenantCount: 18,
          activeFlows: 2,
          eventsProcessed: 4200,
          avgResponseTime: 150,
          errorRate: 1.2,
          trend: 'down'
        }
      ];
      
      const mockSystemMetrics: SystemMetrics = {
        totalModules: 10,
        activeModules: 8,
        totalTenants: 45,
        totalEvents: 41000,
        avgEventsPerDay: 5857,
        systemUptime: 99.8
      };
      
      setModuleStats(mockModuleStats);
      setSystemMetrics(mockSystemMetrics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
    setLoading(false);
  };
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core':
        return 'bg-blue-100 text-blue-700';
      case 'fnb':
        return 'bg-purple-100 text-purple-700';
      case 'optional':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  
  if (loading) {
    return (
      <HQLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </HQLayout>
    );
  }
  
  return (
    <HQLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Module Analytics</h1>
            <p className="text-gray-600 mt-1">Monitor module performance and usage across all tenants</p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex gap-2 bg-white rounded-lg p-1 border border-gray-200">
            {(['24h', '7d', '30d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range === '24h' ? 'Last 24h' : range === '7d' ? 'Last 7 days' : 'Last 30 days'}
              </button>
            ))}
          </div>
        </div>
        
        {/* System Metrics */}
        {systemMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Modules"
              value={systemMetrics.totalModules}
              subtitle={`${systemMetrics.activeModules} active`}
              icon={Package}
              color="blue"
            />
            <MetricCard
              title="Active Tenants"
              value={systemMetrics.totalTenants}
              subtitle="Using modules"
              icon={Users}
              color="green"
            />
            <MetricCard
              title="Events Processed"
              value={systemMetrics.totalEvents.toLocaleString()}
              subtitle={`${systemMetrics.avgEventsPerDay.toLocaleString()}/day avg`}
              icon={Activity}
              color="purple"
            />
            <MetricCard
              title="System Uptime"
              value={`${systemMetrics.systemUptime}%`}
              subtitle="Last 30 days"
              icon={CheckCircle}
              color="emerald"
            />
          </div>
        )}
        
        {/* Module Performance Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Module Performance</h2>
            <p className="text-sm text-gray-600 mt-1">Detailed metrics for each module</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenants
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active Flows
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Events
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Response
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Error Rate
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {moduleStats.map(module => (
                  <tr key={module.code} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{module.name}</div>
                          <div className="text-xs text-gray-500">{module.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(module.category)}`}>
                        {module.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-semibold text-gray-900">{module.tenantCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">{module.activeFlows}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-semibold text-gray-900">
                        {module.eventsProcessed.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">{module.avgResponseTime}ms</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className={`text-sm font-medium ${
                        module.errorRate > 1 ? 'text-red-600' : 
                        module.errorRate > 0.5 ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>
                        {module.errorRate}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getTrendIcon(module.trend)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Module Adoption Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Module Adoption</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {moduleStats.slice(0, 5).map(module => {
                const percentage = (module.tenantCount / (systemMetrics?.totalTenants || 1)) * 100;
                return (
                  <div key={module.code}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{module.name}</span>
                      <span className="text-sm text-gray-600">{module.tenantCount} tenants</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Event Processing Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Event Processing</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {moduleStats.slice(0, 5).map(module => {
                const maxEvents = Math.max(...moduleStats.map(m => m.eventsProcessed));
                const percentage = (module.eventsProcessed / maxEvents) * 100;
                return (
                  <div key={module.code}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{module.name}</span>
                      <span className="text-sm text-gray-600">{module.eventsProcessed.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </HQLayout>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  color: 'blue' | 'green' | 'purple' | 'emerald';
}

function MetricCard({ title, value, subtitle, icon: Icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    emerald: 'from-emerald-500 to-emerald-600'
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}
