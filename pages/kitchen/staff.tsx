import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Search, Plus, Users, Clock, Award, 
  Calendar, ChefHat, Edit, Trash2, Eye, X,
  TrendingUp, TrendingDown, Utensils
} from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  role: 'head_chef' | 'sous_chef' | 'line_cook' | 'prep_cook';
  shift: 'morning' | 'afternoon' | 'night';
  status: 'active' | 'off' | 'leave';
  performance: number;
  ordersCompleted: number;
  avgPrepTime: number;
  joinDate: Date;
}

const KitchenStaffPage: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const MOCK_K_STAFF: StaffMember[] = [
    { id: 'ks1', name: 'Chef Andi', role: 'head_chef', shift: 'morning', status: 'active', performance: 95, ordersCompleted: 425, avgPrepTime: 15, joinDate: new Date('2024-01-15') },
    { id: 'ks2', name: 'Budi Prasetyo', role: 'sous_chef', shift: 'morning', status: 'active', performance: 88, ordersCompleted: 380, avgPrepTime: 18, joinDate: new Date('2024-06-01') },
    { id: 'ks3', name: 'Dewi Sartika', role: 'line_cook', shift: 'afternoon', status: 'active', performance: 82, ordersCompleted: 290, avgPrepTime: 20, joinDate: new Date('2025-01-10') },
    { id: 'ks4', name: 'Eko Susanto', role: 'prep_cook', shift: 'morning', status: 'off', performance: 75, ordersCompleted: 180, avgPrepTime: 22, joinDate: new Date('2025-06-15') },
  ];
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_K_STAFF);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPerformanceDialog, setShowPerformanceDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'line_cook' as 'head_chef' | 'sous_chef' | 'line_cook' | 'prep_cook',
    shift: 'morning' as 'morning' | 'afternoon' | 'night',
    status: 'active' as 'active' | 'off' | 'leave',
    phone: '',
    email: '',
    performance: 0
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Fetch staff from API
  useEffect(() => {
    if (status === 'authenticated') {
      fetchStaff();
    }
  }, [status]);

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/kitchen/staff');
      const result = await response.json();
      
      if (result.success) {
        // Transform data to match interface
        const transformedStaff = result.data.map((s: any) => ({
          id: s.id,
          name: s.name,
          role: s.role,
          shift: s.shift,
          status: s.status,
          performance: parseFloat(s.performance) || 0,
          ordersCompleted: s.total_orders_assigned || 0,
          avgPrepTime: s.avg_prep_time || 0,
          joinDate: new Date(s.join_date)
        }));
        setStaff(transformedStaff);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaff(MOCK_K_STAFF);
    }
  };

  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const styles = {
      head_chef: 'bg-purple-100 text-purple-800 border-purple-200',
      sous_chef: 'bg-blue-100 text-blue-800 border-blue-200',
      line_cook: 'bg-green-100 text-green-800 border-green-200',
      prep_cook: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    const labels = {
      head_chef: 'Head Chef',
      sous_chef: 'Sous Chef',
      line_cook: 'Line Cook',
      prep_cook: 'Prep Cook'
    };
    return (
      <Badge className={`${styles[role as keyof typeof styles]} border`}>
        {labels[role as keyof typeof labels]}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      off: 'bg-gray-100 text-gray-800 border-gray-200',
      leave: 'bg-amber-100 text-amber-800 border-amber-200'
    };
    const labels = {
      active: 'Aktif',
      off: 'Off',
      leave: 'Cuti'
    };
    return (
      <Badge className={`${styles[status as keyof typeof styles]} border`}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getShiftLabel = (shift: string) => {
    const labels = {
      morning: 'Pagi (06:00-14:00)',
      afternoon: 'Siang (14:00-22:00)',
      night: 'Malam (22:00-06:00)'
    };
    return labels[shift as keyof typeof labels];
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.role || !formData.shift) {
      alert('Mohon lengkapi nama, role, dan shift');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/kitchen/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.success) {
        setShowAddDialog(false);
        resetForm();
        fetchStaff();
        alert('Staff berhasil ditambahkan!');
      } else {
        alert('Gagal menambah staff: ' + result.message);
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      alert('Terjadi kesalahan saat menambah staff');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: 'line_cook',
      shift: 'morning',
      status: 'active',
      phone: '',
      email: '',
      performance: 0
    });
  };

  const handleEdit = (member: StaffMember) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      role: member.role,
      shift: member.shift,
      status: member.status,
      phone: '',
      email: '',
      performance: member.performance
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!editingStaff || !formData.name || !formData.role || !formData.shift) {
      alert('Mohon lengkapi nama, role, dan shift');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/kitchen/staff/${editingStaff.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.success) {
        setShowEditDialog(false);
        setEditingStaff(null);
        resetForm();
        fetchStaff();
        alert('Staff berhasil diperbarui!');
      } else {
        alert('Gagal memperbarui staff: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating staff:', error);
      alert('Terjadi kesalahan saat memperbarui staff');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (member: StaffMember) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ${member.name}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/kitchen/staff/${member.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        fetchStaff();
        alert('Staff berhasil dihapus!');
      } else {
        alert('Gagal menghapus staff: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('Terjadi kesalahan saat menghapus staff');
    }
  };

  const handleViewPerformance = async (member: StaffMember) => {
    setSelectedStaff(member);
    setShowPerformanceDialog(true);
    
    try {
      const response = await fetch(`/api/kitchen/staff/${member.id}/performance`);
      const result = await response.json();
      
      if (result.success) {
        setPerformanceData(result.data);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    }
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

  const stats = {
    total: staff.length,
    active: staff.filter(s => s.status === 'active').length,
    avgPerformance: Math.round(staff.reduce((acc, s) => acc + s.performance, 0) / staff.length)
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Tim Dapur | BEDAGANG</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-1.5 bg-gradient-to-b from-sky-400 to-blue-500 rounded-full mr-3"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Tim Dapur</h1>
              <p className="text-gray-600">Kelola staff dan shift dapur</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Staff
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Staff</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-sky-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Staff Aktif</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg. Performance</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.avgPerformance}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((member) => (
            <Card key={member.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <p className="text-sm text-gray-600">{getShiftLabel(member.shift)}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    {getRoleBadge(member.role)}
                    {getStatusBadge(member.status)}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Performance</span>
                      <span className="text-sm font-bold text-purple-600">{member.performance}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                        style={{ width: `${member.performance}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-sky-50 rounded-lg p-3">
                      <div className="flex items-center text-sky-600 mb-1">
                        <Award className="w-4 h-4 mr-1" />
                        <span className="text-xs">Orders</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{member.ordersCompleted}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center text-blue-600 mb-1">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-xs">Avg. Time</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{member.avgPrepTime}m</p>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    Bergabung: {member.joinDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleViewPerformance(member)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Detail
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(member)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(member)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Staff Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Staff Dapur</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Masukkan nama staff"
              />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="head_chef">Head Chef</option>
                <option value="sous_chef">Sous Chef</option>
                <option value="line_cook">Line Cook</option>
                <option value="prep_cook">Prep Cook</option>
              </select>
            </div>

            <div>
              <Label htmlFor="shift">Shift</Label>
              <select
                id="shift"
                value={formData.shift}
                onChange={(e) => setFormData({...formData, shift: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="morning">Pagi (06:00-14:00)</option>
                <option value="afternoon">Siang (14:00-22:00)</option>
                <option value="night">Malam (22:00-06:00)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="active">Aktif</option>
                <option value="off">Off</option>
                <option value="leave">Cuti</option>
              </select>
            </div>

            <div>
              <Label htmlFor="phone">No. Telepon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Masukkan nomor telepon"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Masukkan email"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-sky-500 to-blue-600"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Staff Dapur</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nama Lengkap</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Masukkan nama staff"
              />
            </div>

            <div>
              <Label htmlFor="edit-role">Role</Label>
              <select
                id="edit-role"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="head_chef">Head Chef</option>
                <option value="sous_chef">Sous Chef</option>
                <option value="line_cook">Line Cook</option>
                <option value="prep_cook">Prep Cook</option>
              </select>
            </div>

            <div>
              <Label htmlFor="edit-shift">Shift</Label>
              <select
                id="edit-shift"
                value={formData.shift}
                onChange={(e) => setFormData({...formData, shift: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="morning">Pagi (06:00-14:00)</option>
                <option value="afternoon">Siang (14:00-22:00)</option>
                <option value="night">Malam (22:00-06:00)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="active">Aktif</option>
                <option value="off">Off</option>
                <option value="leave">Cuti</option>
              </select>
            </div>

            <div>
              <Label htmlFor="edit-performance">Performance (%)</Label>
              <Input
                id="edit-performance"
                type="number"
                min="0"
                max="100"
                value={formData.performance}
                onChange={(e) => setFormData({...formData, performance: parseInt(e.target.value) || 0})}
                placeholder="0-100"
              />
            </div>

            <div>
              <Label htmlFor="edit-phone">No. Telepon</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Masukkan nomor telepon"
              />
            </div>

            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Masukkan email"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={loading}
              className="bg-gradient-to-r from-sky-500 to-blue-600"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Performance Dialog */}
      <Dialog open={showPerformanceDialog} onOpenChange={setShowPerformanceDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Performance Detail - {selectedStaff?.name}
            </DialogTitle>
          </DialogHeader>
          
          {performanceData ? (
            <div className="space-y-6">
              {/* Performance Score Card */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {performanceData.performance.score}%
                    </div>
                    <div className="text-sm text-gray-600">Performance Score</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {performanceData.performance.totalOrders}
                    </div>
                    <div className="text-sm text-gray-600">Total Orders</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {performanceData.performance.completionRate}%
                    </div>
                    <div className="text-sm text-gray-600">Completion Rate</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-amber-600">
                      {performanceData.performance.avgPrepTime}m
                    </div>
                    <div className="text-sm text-gray-600">Avg. Prep Time</div>
                  </CardContent>
                </Card>
              </div>

              {/* Popular Dishes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="w-5 h-5" />
                    Popular Dishes (Last 30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {performanceData.popularDishes.map((dish: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <span className="font-medium">{dish.dish_name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{dish.times_prepared} kali</span>
                          <span>Avg: {dish.avg_quantity} pcs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Daily Performance (Last 30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {performanceData.dailyData.map((day: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 border-b">
                        <span className="text-sm text-gray-600">
                          {new Date(day.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex items-center gap-4 text-sm">
                          <span>{day.total_orders} orders</span>
                          <span className={day.avg_preparation_time < 20 ? 'text-green-600' : 'text-amber-600'}>
                            {Math.round(day.avg_preparation_time || 0)}m avg
                          </span>
                          <span className="text-green-600">{day.completed_orders} done</span>
                          {day.cancelled_orders > 0 && (
                            <span className="text-red-600">{day.cancelled_orders} cancelled</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-sky-600 border-t-transparent rounded-full"></div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPerformanceDialog(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default KitchenStaffPage;
