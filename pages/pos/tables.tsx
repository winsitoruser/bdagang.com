import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { ModuleGuard } from '@/components/guards/ModuleGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, Plus, Edit, Trash2, Eye,
  Square, Circle, CheckCircle, AlertCircle,
  RefreshCw, Search, Filter, Grid3X3, List
} from 'lucide-react';

interface Table {
  id: string;
  tableNumber: string;
  capacity: number;
  area: string;
  floor: number;
  positionX?: number;
  positionY?: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  isActive: boolean;
  currentOrder?: {
    id: string;
    orderNumber: string;
    customerName?: string;
    orderType: string;
    status: string;
    startTime: string;
  };
}

const TablesPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedArea, setSelectedArea] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tables');
      if (response.ok) {
        const data = await response.json();
        setTables(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const filteredTables = tables.filter(table => {
    const matchesSearch = table.tableNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = selectedArea === 'all' || table.area === selectedArea;
    return matchesSearch && matchesArea;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <Square className="w-4 h-4 text-green-500" />;
      case 'occupied': return <Users className="w-4 h-4 text-red-500" />;
      case 'reserved': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'maintenance': return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default: return <Square className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'occupied': return 'bg-red-100 text-red-800 border-red-200';
      case 'reserved': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'maintenance': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTableClick = (table: Table) => {
    if (table.status === 'occupied' && table.currentOrder) {
      router.push(`/pos/checkout?table=${table.tableNumber}&orderId=${table.currentOrder.id}`);
    } else if (table.status === 'available') {
      router.push(`/pos/new-order?table=${table.tableNumber}`);
    }
  };

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Table Management - Bedagang POS</title>
      </Head>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Grid3X3 className="w-8 h-8 mr-2" />
              Table Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage restaurant tables and seating
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTables}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Table
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tables</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Grid3X3 className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                </div>
                <Square className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Occupied</p>
                  <p className="text-2xl font-bold text-red-600">{stats.occupied}</p>
                </div>
                <Users className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Reserved</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.reserved}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 flex-1">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search table number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>
              
              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  <SelectItem value="indoor">Indoor</SelectItem>
                  <SelectItem value="outdoor">Outdoor</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="smoking">Smoking</SelectItem>
                  <SelectItem value="non-smoking">Non-Smoking</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tables Display */}
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto" />
            <p className="mt-2">Loading tables...</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredTables.map((table) => (
              <Card 
                key={table.id} 
                className={`cursor-pointer hover:shadow-lg transition-shadow ${
                  table.status === 'available' ? 'hover:border-green-500' : 
                  table.status === 'occupied' ? 'hover:border-red-500' : ''
                }`}
                onClick={() => handleTableClick(table)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold">{table.tableNumber}</span>
                    {getStatusIcon(table.status)}
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Capacity:</span>
                      <span>{table.capacity} seats</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Area:</span>
                      <span className="capitalize">{table.area}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Floor:</span>
                      <span>{table.floor}</span>
                    </div>
                  </div>
                  
                  <Badge className={`w-full justify-center mt-3 ${getStatusColor(table.status)}`}>
                    {table.status.toUpperCase()}
                  </Badge>
                  
                  {table.currentOrder && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                      <p className="font-medium">{table.currentOrder.orderNumber}</p>
                      <p className="text-gray-600">{table.currentOrder.customerName}</p>
                      <p className="text-gray-500">
                        {new Date(table.currentOrder.startTime).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTables.map((table) => (
              <Card 
                key={table.id} 
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  table.status === 'available' ? 'hover:border-green-500' : 
                  table.status === 'occupied' ? 'hover:border-red-500' : ''
                }`}
                onClick={() => handleTableClick(table)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(table.status)}
                      <div>
                        <p className="font-semibold text-lg">{table.tableNumber}</p>
                        <p className="text-sm text-gray-600">
                          {table.capacity} seats • {table.area} • Floor {table.floor}
                        </p>
                        {table.currentOrder && (
                          <p className="text-sm text-gray-500">
                            {table.currentOrder.orderNumber} • {table.currentOrder.customerName}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(table.status)}>
                        {table.status.toUpperCase()}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTable(table);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default function TablesPageWithModuleGuard() {
  return (
    <ModuleGuard moduleCode="tables">
      <TablesPage />
    </ModuleGuard>
  );
}
