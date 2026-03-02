import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import HQLayout from '../../../components/hq/HQLayout';
import {
  Layers,
  Save,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Search,
  FolderTree,
  Package,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  GripVertical,
  Eye,
  X,
  Check,
  Download,
  Upload
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  parentName: string | null;
  level: number;
  productCount: number;
  isActive: boolean;
  sortOrder: number;
  icon: string;
  color: string;
  children?: Category[];
}

const mockCategories: Category[] = [
  {
    id: '1', name: 'Sembako', slug: 'sembako', description: 'Sembilan bahan pokok', parentId: null, parentName: null, level: 0, productCount: 156, isActive: true, sortOrder: 1, icon: '🌾', color: '#F59E0B',
    children: [
      { id: '1-1', name: 'Beras', slug: 'beras', description: 'Berbagai jenis beras', parentId: '1', parentName: 'Sembako', level: 1, productCount: 45, isActive: true, sortOrder: 1, icon: '🍚', color: '#F59E0B' },
      { id: '1-2', name: 'Minyak Goreng', slug: 'minyak-goreng', description: 'Minyak untuk memasak', parentId: '1', parentName: 'Sembako', level: 1, productCount: 28, isActive: true, sortOrder: 2, icon: '🫗', color: '#F59E0B' },
      { id: '1-3', name: 'Gula', slug: 'gula', description: 'Gula pasir dan gula merah', parentId: '1', parentName: 'Sembako', level: 1, productCount: 18, isActive: true, sortOrder: 3, icon: '🍬', color: '#F59E0B' },
      { id: '1-4', name: 'Tepung', slug: 'tepung', description: 'Tepung terigu dan lainnya', parentId: '1', parentName: 'Sembako', level: 1, productCount: 22, isActive: true, sortOrder: 4, icon: '🥖', color: '#F59E0B' }
    ]
  },
  {
    id: '2', name: 'Minuman', slug: 'minuman', description: 'Berbagai jenis minuman', parentId: null, parentName: null, level: 0, productCount: 128, isActive: true, sortOrder: 2, icon: '🥤', color: '#3B82F6',
    children: [
      { id: '2-1', name: 'Air Mineral', slug: 'air-mineral', description: 'Air mineral kemasan', parentId: '2', parentName: 'Minuman', level: 1, productCount: 35, isActive: true, sortOrder: 1, icon: '💧', color: '#3B82F6' },
      { id: '2-2', name: 'Minuman Ringan', slug: 'minuman-ringan', description: 'Soft drink dan soda', parentId: '2', parentName: 'Minuman', level: 1, productCount: 48, isActive: true, sortOrder: 2, icon: '🥤', color: '#3B82F6' },
      { id: '2-3', name: 'Jus', slug: 'jus', description: 'Jus buah kemasan', parentId: '2', parentName: 'Minuman', level: 1, productCount: 25, isActive: true, sortOrder: 3, icon: '🧃', color: '#3B82F6' },
      { id: '2-4', name: 'Kopi & Teh', slug: 'kopi-teh', description: 'Kopi dan teh kemasan', parentId: '2', parentName: 'Minuman', level: 1, productCount: 20, isActive: true, sortOrder: 4, icon: '☕', color: '#3B82F6' }
    ]
  },
  {
    id: '3', name: 'Makanan Ringan', slug: 'makanan-ringan', description: 'Snack dan cemilan', parentId: null, parentName: null, level: 0, productCount: 215, isActive: true, sortOrder: 3, icon: '🍿', color: '#10B981',
    children: [
      { id: '3-1', name: 'Keripik', slug: 'keripik', description: 'Berbagai keripik', parentId: '3', parentName: 'Makanan Ringan', level: 1, productCount: 68, isActive: true, sortOrder: 1, icon: '🥔', color: '#10B981' },
      { id: '3-2', name: 'Biskuit', slug: 'biskuit', description: 'Biskuit dan cookies', parentId: '3', parentName: 'Makanan Ringan', level: 1, productCount: 82, isActive: true, sortOrder: 2, icon: '🍪', color: '#10B981' },
      { id: '3-3', name: 'Cokelat & Permen', slug: 'cokelat-permen', description: 'Cokelat dan permen', parentId: '3', parentName: 'Makanan Ringan', level: 1, productCount: 45, isActive: true, sortOrder: 3, icon: '🍫', color: '#10B981' },
      { id: '3-4', name: 'Kacang', slug: 'kacang', description: 'Kacang-kacangan', parentId: '3', parentName: 'Makanan Ringan', level: 1, productCount: 20, isActive: true, sortOrder: 4, icon: '🥜', color: '#10B981' }
    ]
  },
  {
    id: '4', name: 'Produk Susu', slug: 'produk-susu', description: 'Susu dan olahannya', parentId: null, parentName: null, level: 0, productCount: 85, isActive: true, sortOrder: 4, icon: '🥛', color: '#8B5CF6',
    children: [
      { id: '4-1', name: 'Susu Cair', slug: 'susu-cair', description: 'Susu UHT dan pasteurisasi', parentId: '4', parentName: 'Produk Susu', level: 1, productCount: 32, isActive: true, sortOrder: 1, icon: '🥛', color: '#8B5CF6' },
      { id: '4-2', name: 'Susu Bubuk', slug: 'susu-bubuk', description: 'Susu bubuk dan formula', parentId: '4', parentName: 'Produk Susu', level: 1, productCount: 28, isActive: true, sortOrder: 2, icon: '🍼', color: '#8B5CF6' },
      { id: '4-3', name: 'Yogurt', slug: 'yogurt', description: 'Yogurt dan keju', parentId: '4', parentName: 'Produk Susu', level: 1, productCount: 25, isActive: true, sortOrder: 3, icon: '🧀', color: '#8B5CF6' }
    ]
  },
  {
    id: '5', name: 'Perawatan Pribadi', slug: 'perawatan-pribadi', description: 'Produk perawatan diri', parentId: null, parentName: null, level: 0, productCount: 142, isActive: true, sortOrder: 5, icon: '🧴', color: '#EC4899'
  },
  {
    id: '6', name: 'Kebersihan Rumah', slug: 'kebersihan-rumah', description: 'Produk kebersihan rumah tangga', parentId: null, parentName: null, level: 0, productCount: 98, isActive: true, sortOrder: 6, icon: '🧹', color: '#06B6D4'
  },
  {
    id: '7', name: 'Frozen Food', slug: 'frozen-food', description: 'Makanan beku', parentId: null, parentName: null, level: 0, productCount: 76, isActive: true, sortOrder: 7, icon: '🧊', color: '#0EA5E9'
  },
  {
    id: '8', name: 'Bumbu & Rempah', slug: 'bumbu-rempah', description: 'Bumbu masak dan rempah', parentId: null, parentName: null, level: 0, productCount: 64, isActive: false, sortOrder: 8, icon: '🌶️', color: '#EF4444'
  }
];

const iconOptions = ['📦', '🌾', '🍚', '🫗', '🍬', '🥖', '🥤', '💧', '🧃', '☕', '🍿', '🥔', '🍪', '🍫', '🥜', '🥛', '🍼', '🧀', '🧴', '🧹', '🧊', '🌶️', '🍎', '🥕', '🍞', '🥚', '🧈', '🍜', '🍕', '🌭'];
const colorOptions = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#06B6D4', '#0EA5E9', '#EF4444', '#84CC16', '#F97316'];

export default function InventoryCategories() {
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['1', '2', '3', '4']);
  const [viewMode, setViewMode] = useState<'tree' | 'grid'>('tree');
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    icon: '📦',
    color: '#3B82F6',
    isActive: true
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/hq/inventory/categories');
      if (response.ok) {
        const json = await response.json();
        const payload = json.data || json;
        setCategories(payload.categories || mockCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchCategories();
  }, []);

  if (!mounted) return null;

  const handleCreate = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/hq/inventory/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const newCategory: Category = {
        id: Date.now().toString(),
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description,
        parentId: formData.parentId || null,
        parentName: formData.parentId ? categories.find(c => c.id === formData.parentId)?.name || null : null,
        level: formData.parentId ? 1 : 0,
        productCount: 0,
        isActive: formData.isActive,
        sortOrder: categories.length + 1,
        icon: formData.icon,
        color: formData.color
      };
      
      if (formData.parentId) {
        setCategories(prev => prev.map(c => 
          c.id === formData.parentId 
            ? { ...c, children: [...(c.children || []), newCategory] }
            : c
        ));
      } else {
        setCategories(prev => [...prev, newCategory]);
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
    setSaving(false);
    setShowModal(false);
    resetForm();
  };

  const handleUpdate = async () => {
    if (!selectedCategory) return;
    setSaving(true);
    try {
      await fetch('/api/hq/inventory/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedCategory.id, ...formData })
      });
      
      const updateCat = (cats: Category[]): Category[] => cats.map(c => {
        if (c.id === selectedCategory.id) {
          return { ...c, ...formData, slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-') };
        }
        if (c.children) {
          return { ...c, children: updateCat(c.children) };
        }
        return c;
      });
      
      setCategories(updateCat);
    } catch (error) {
      console.error('Error updating category:', error);
    }
    setSaving(false);
    setShowModal(false);
    setIsEditing(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      await fetch('/api/hq/inventory/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedCategory.id })
      });
      
      const deleteCat = (cats: Category[]): Category[] => {
        return cats.filter(c => c.id !== selectedCategory.id).map(c => ({
          ...c,
          children: c.children ? deleteCat(c.children) : undefined
        }));
      };
      
      setCategories(deleteCat);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
    setShowDeleteConfirm(false);
    setSelectedCategory(null);
  };

  const handleToggleStatus = (category: Category) => {
    const toggleStatus = (cats: Category[]): Category[] => cats.map(c => {
      if (c.id === category.id) {
        return { ...c, isActive: !c.isActive };
      }
      if (c.children) {
        return { ...c, children: toggleStatus(c.children) };
      }
      return c;
    });
    setCategories(toggleStatus);
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', parentId: '', icon: '📦', color: '#3B82F6', isActive: true });
    setSelectedCategory(null);
  };

  const openEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId || '',
      icon: category.icon,
      color: category.color,
      isActive: category.isActive
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    );
  };

  const getAllCategories = (): Category[] => {
    const result: Category[] = [];
    const flatten = (cats: Category[]) => {
      cats.forEach(cat => {
        result.push(cat);
        if (cat.children) flatten(cat.children);
      });
    };
    flatten(categories);
    return result;
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: getAllCategories().length,
    parent: categories.length,
    child: getAllCategories().length - categories.length,
    active: getAllCategories().filter(c => c.isActive).length,
    totalProducts: getAllCategories().reduce((sum, c) => sum + c.productCount, 0)
  };

  const renderCategoryTree = (category: Category, level = 0) => {
    const isExpanded = expandedCategories.includes(category.id);
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div key={category.id}>
        <div 
          className={`flex items-center justify-between py-3 px-4 hover:bg-gray-50 border-b border-gray-100 ${!category.isActive ? 'opacity-60' : ''}`}
          style={{ paddingLeft: `${16 + level * 24}px` }}
        >
          <div className="flex items-center gap-3">
            <button className="p-1 text-gray-400 cursor-grab hover:text-gray-600">
              <GripVertical className="w-4 h-4" />
            </button>
            {hasChildren ? (
              <button onClick={() => toggleExpand(category.id)} className="p-1 text-gray-500 hover:text-gray-700">
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <div className="w-6" />
            )}
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: category.color + '20' }}>
              {category.icon}
            </div>
            <div>
              <p className="font-medium text-gray-900">{category.name}</p>
              <p className="text-sm text-gray-500">{category.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Package className="w-4 h-4" />
              <span>{category.productCount} produk</span>
            </div>
            <button
              onClick={() => handleToggleStatus(category)}
              className={`px-2 py-1 rounded text-xs ${category.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
            >
              {category.isActive ? 'Aktif' : 'Nonaktif'}
            </button>
            <div className="flex items-center gap-1">
              <button onClick={() => openEdit(category)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setSelectedCategory(category); setShowDeleteConfirm(true); }}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                disabled={category.productCount > 0 || (category.children && category.children.length > 0)}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="border-l-2 border-gray-200 ml-10">
            {category.children!.map(child => renderCategoryTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <HQLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/hq/inventory" className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kategori Produk</h1>
              <p className="text-gray-500">Kelola kategori dan sub-kategori produk</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchCategories} disabled={loading} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => { resetForm(); setIsEditing(false); setShowModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Tambah Kategori
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Layers className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Kategori</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FolderTree className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.parent}</p>
                <p className="text-sm text-gray-500">Kategori Utama</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ChevronRight className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.child}</p>
                <p className="text-sm text-gray-500">Sub-Kategori</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                <p className="text-sm text-gray-500">Total Produk</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                <p className="text-sm text-gray-500">Aktif</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari kategori..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('tree')}
                  className={`p-2 rounded-lg ${viewMode === 'tree' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                  <FolderTree className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                  <Layers className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : viewMode === 'tree' ? (
            <div>
              {filteredCategories.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Tidak ada kategori ditemukan</div>
              ) : (
                filteredCategories.map(category => renderCategoryTree(category))
              )}
            </div>
          ) : (
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {getAllCategories().map(category => (
                <div
                  key={category.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${!category.isActive ? 'opacity-60' : ''}`}
                  style={{ borderColor: category.color + '40', backgroundColor: category.color + '10' }}
                  onClick={() => openEdit(category)}
                >
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <p className="font-medium text-gray-900 text-sm">{category.name}</p>
                  <p className="text-xs text-gray-500">{category.productCount} produk</p>
                  {category.parentName && (
                    <p className="text-xs text-gray-400 mt-1">↳ {category.parentName}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                    <div className="grid grid-cols-6 gap-1 p-2 border border-gray-300 rounded-lg max-h-32 overflow-y-auto">
                      {iconOptions.map(icon => (
                        <button
                          key={icon}
                          onClick={() => setFormData(prev => ({ ...prev, icon }))}
                          className={`p-2 rounded text-xl hover:bg-gray-100 ${formData.icon === icon ? 'bg-blue-100 ring-2 ring-blue-500' : ''}`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Nama kategori"
                    />
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="nama-kategori"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Induk</label>
                    <select
                      value={formData.parentId}
                      onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Tidak ada (Kategori Utama)</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Warna</label>
                    <div className="flex flex-wrap gap-1">
                      {colorOptions.map(color => (
                        <button
                          key={color}
                          onClick={() => setFormData(prev => ({ ...prev, color }))}
                          className={`w-6 h-6 rounded-full ${formData.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">Aktif</label>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Batal
                </button>
                <button
                  onClick={isEditing ? handleUpdate : handleCreate}
                  disabled={saving || !formData.name}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && selectedCategory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Kategori</h3>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus kategori "{selectedCategory.name}"?
                {selectedCategory.children && selectedCategory.children.length > 0 && (
                  <span className="block mt-2 text-red-600 text-sm">Kategori ini memiliki sub-kategori yang harus dihapus terlebih dahulu.</span>
                )}
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={selectedCategory.children && selectedCategory.children.length > 0}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </HQLayout>
  );
}
