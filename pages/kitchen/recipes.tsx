import React, { useState, useEffect, useMemo } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Search, Plus, Edit, Trash2, ChefHat, Clock,
  Users, DollarSign, Package, BookOpen, Eye, X
} from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
  productId?: number;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  unit: string;
  price: number;
  cost: number;
}

const RecipeManagementPage: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const MOCK_RECIPES: Recipe[] = [
    { id: 'r1', name: 'Nasi Goreng Spesial', category: 'Makanan Utama', description: 'Nasi goreng dengan telur dan ayam', prepTime: 5, cookTime: 15, servings: 1, difficulty: 'easy', cost: 12000, price: 35000, ingredients: [{ id: 'i1', name: 'Nasi', quantity: 200, unit: 'gram', cost: 3000 }, { id: 'i2', name: 'Ayam', quantity: 100, unit: 'gram', cost: 5000 }, { id: 'i3', name: 'Telur', quantity: 1, unit: 'butir', cost: 2500 }], instructions: ['Panaskan minyak', 'Tumis bumbu halus', 'Masukkan nasi dan aduk rata'] },
    { id: 'r2', name: 'Mie Ayam', category: 'Makanan Utama', description: 'Mie dengan topping ayam', prepTime: 5, cookTime: 10, servings: 1, difficulty: 'easy', cost: 8000, price: 25000, ingredients: [{ id: 'i4', name: 'Mie', quantity: 150, unit: 'gram', cost: 3000 }, { id: 'i5', name: 'Ayam', quantity: 80, unit: 'gram', cost: 4000 }], instructions: ['Rebus mie', 'Siapkan topping ayam'] },
  ] as any;
  const [recipes, setRecipes] = useState<Recipe[]>(MOCK_RECIPES);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [recipeVersions, setRecipeVersions] = useState<any[]>([]);
  const MOCK_R_PRODUCTS: Product[] = [{ id: 1, name: 'Nasi', sku: 'NSI-001', unit: 'kg', price: 15000, cost: 12000 }, { id: 2, name: 'Ayam Potong', sku: 'AYM-001', unit: 'kg', price: 45000, cost: 35000 }];
  const [products, setProducts] = useState<Product[]>(MOCK_R_PRODUCTS);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    instructions: [''],
    ingredients: [] as Array<{
      name: string;
      quantity: number;
      unit: string;
      cost: number;
      productId?: number;
    }>
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Fetch recipes from API
  useEffect(() => {
    if (status === 'authenticated') {
      fetchRecipes();
      fetchProducts();
    }
  }, [status]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products/simple');
      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts(MOCK_R_PRODUCTS);
    }
  };

  const calculateTotalCost = useMemo(() => {
    return formData.ingredients.reduce((total, ing) => {
      return total + (ing.cost * ing.quantity);
    }, 0);
  }, [formData.ingredients]);

  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/recipes');
      const result = await response.json();
      
      if (result.success) {
        // Transform data to match interface
        const transformedRecipes = result.data.map((r: any) => ({
          id: r.id.toString(),
          name: r.name,
          category: r.category || 'Uncategorized',
          description: r.description || '',
          prepTime: r.preparation_time_minutes || 0,
          cookTime: r.cooking_time_minutes || 0,
          servings: r.batch_size || 1,
          difficulty: r.difficulty_level || 'medium',
          cost: r.total_cost || 0,
          price: r.product?.price || 0,
          ingredients: r.ingredients?.map((ing: any) => ({
            id: ing.id.toString(),
            name: ing.material?.name || 'Unknown',
            quantity: ing.quantity,
            unit: ing.unit,
            cost: ing.subtotal_cost || 0
          })) || [],
          instructions: r.instructions ? r.instructions.split('\n').filter((i: string) => i.trim()) : []
        }));
        
        setRecipes(transformedRecipes);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setRecipes(MOCK_RECIPES);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category) {
      alert('Mohon lengkapi nama dan kategori resep');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          difficulty: formData.difficulty,
          prepTime: formData.prepTime,
          cookTime: formData.cookTime,
          batchSize: formData.servings,
          batchUnit: 'porsi',
          instructions: formData.instructions.filter(i => i.trim()),
          ingredients: formData.ingredients.map(ing => ({
            productId: ing.productId || null,
            quantity: ing.quantity,
            unit: ing.unit,
            unitCost: ing.cost,
            notes: ''
          }))
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setShowAddDialog(false);
        resetForm();
        fetchRecipes();
        alert('Resep berhasil ditambahkan!');
      } else {
        alert('Gagal menambah resep: ' + result.message);
      }
    } catch (error) {
      console.error('Error adding recipe:', error);
      alert('Terjadi kesalahan saat menambah resep');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      difficulty: 'medium',
      prepTime: 0,
      cookTime: 0,
      servings: 1,
      instructions: [''],
      ingredients: []
    });
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => i === index ? value : inst)
    }));
  };

  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: 0, unit: '', cost: 0 }]
    }));
  };

  const updateIngredient = (index: number, field: string, value: string | number) => {
    setFormData(prev => {
      const newIngredients = [...prev.ingredients];
      newIngredients[index] = { ...newIngredients[index], [field]: value };
      
      // If product is selected, update name, unit, and cost
      if (field === 'productId' && typeof value === 'number') {
        const product = products.find(p => p.id === value);
        if (product) {
          newIngredients[index] = {
            ...newIngredients[index],
            productId: value,
            name: product.name,
            unit: product.unit,
            cost: product.cost || 0
          };
        }
      }
      
      return { ...prev, ingredients: newIngredients };
    });
  };

  const selectProduct = (index: number, product: Product) => {
    updateIngredient(index, 'productId', product.id);
    setShowProductDropdown(null);
    setProductSearch('');
  };

  const filteredProducts = useMemo(() => {
    if (!productSearch) return [];
    return products.filter(p => 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase())
    ).slice(0, 10);
  }, [productSearch, products]);

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const fetchVersionHistory = async (recipeId: string) => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/versions`);
      const result = await response.json();
      
      if (result.success) {
        setRecipeVersions(result.data);
      }
    } catch (error) {
      console.error('Error fetching version history:', error);
    }
  };

  const openVersionDialog = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowVersionDialog(true);
    fetchVersionHistory(recipe.id);
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyBadge = (difficulty: string) => {
    const styles = {
      easy: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-amber-100 text-amber-800 border-amber-200',
      hard: 'bg-red-100 text-red-800 border-red-200'
    };
    const labels = {
      easy: 'Mudah',
      medium: 'Sedang',
      hard: 'Sulit'
    };
    return (
      <Badge className={`${styles[difficulty as keyof typeof styles]} border`}>
        {labels[difficulty as keyof typeof labels]}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateProfit = (price: number, cost: number) => {
    return ((price - cost) / price * 100).toFixed(0);
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
        <title>Manajemen Resep | BEDAGANG</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-1.5 bg-gradient-to-b from-sky-400 to-blue-500 rounded-full mr-3"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Manajemen Resep</h1>
              <p className="text-gray-600">Kelola resep dan komposisi menu</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Resep
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Resep</p>
                  <p className="text-2xl font-bold text-gray-900">{recipes.length}</p>
                </div>
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-sky-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg. Prep Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(recipes.reduce((acc, r) => acc + r.prepTime, 0) / recipes.length)} min
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg. Cost</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(recipes.reduce((acc, r) => acc + r.cost, 0) / recipes.length)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg. Margin</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(recipes.reduce((acc, r) => acc + ((r.price - r.cost) / r.price * 100), 0) / recipes.length)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-purple-600" />
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
                placeholder="Cari resep berdasarkan nama atau kategori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{recipe.name}</CardTitle>
                    <p className="text-sm text-gray-600">{recipe.category}</p>
                  </div>
                  {getDifficultyBadge(recipe.difficulty)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{recipe.description}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center text-gray-600 mb-1">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-xs">Prep + Cook</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {recipe.prepTime + recipe.cookTime} min
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center text-gray-600 mb-1">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="text-xs">Servings</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {recipe.servings} porsi
                    </p>
                  </div>
                </div>

                <div className="bg-sky-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Cost</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(recipe.cost)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Price</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(recipe.price)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-sky-100">
                    <span className="text-xs font-medium text-gray-700">Profit Margin</span>
                    <span className="text-sm font-bold text-green-600">
                      {calculateProfit(recipe.price, recipe.cost)}%
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-2">Ingredients ({recipe.ingredients.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {recipe.ingredients.slice(0, 3).map((ing) => (
                      <Badge key={ing.id} variant="outline" className="text-xs">
                        {ing.name}
                      </Badge>
                    ))}
                    {recipe.ingredients.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{recipe.ingredients.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Lihat
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Recipe Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Tambah Resep Baru</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nama Resep *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Contoh: Nasi Goreng Spesial"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Kategori *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Contoh: Main Course"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Deskripsi singkat tentang resep"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="prepTime">Waktu Persiapan (menit)</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    value={formData.prepTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, prepTime: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="cookTime">Waktu Masak (menit)</Label>
                  <Input
                    id="cookTime"
                    type="number"
                    value={formData.cookTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, cookTime: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="servings">Jumlah Porsi</Label>
                  <Input
                    id="servings"
                    type="number"
                    value={formData.servings}
                    onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="difficulty">Tingkat Kesulitan</Label>
                  <select
                    id="difficulty"
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="easy">Mudah</option>
                    <option value="medium">Sedang</option>
                    <option value="hard">Sulit</option>
                  </select>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-lg font-semibold">Bahan-bahan</Label>
                  <Button type="button" variant="outline" onClick={addIngredient}>
                    <Plus className="w-4 h-4 mr-1" />
                    Tambah Bahan
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {formData.ingredients.map((ingredient, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 relative">
                          <Label className="text-xs text-gray-600">Nama Bahan</Label>
                          <div className="relative">
                            <Input
                              placeholder="Ketik untuk cari bahan..."
                              value={ingredient.name || ''}
                              onChange={(e) => {
                                updateIngredient(index, 'name', e.target.value);
                                setProductSearch(e.target.value);
                                setShowProductDropdown(index);
                              }}
                              onFocus={() => setShowProductDropdown(index)}
                              className="pr-8"
                            />
                            {ingredient.name && (
                              <button
                                type="button"
                                onClick={() => {
                                  updateIngredient(index, 'name', '');
                                  updateIngredient(index, 'productId', 0);
                                  updateIngredient(index, 'unit', '');
                                  updateIngredient(index, 'cost', 0);
                                }}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                            
                            {/* Product Dropdown */}
                            {showProductDropdown === index && productSearch && (
                              <div className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-lg z-10 mt-1 max-h-48 overflow-y-auto">
                                {filteredProducts.length > 0 ? (
                                  filteredProducts.map((product) => (
                                    <button
                                      key={product.id}
                                      type="button"
                                      onClick={() => selectProduct(index, product)}
                                      className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between group"
                                    >
                                      <div>
                                        <div className="font-medium text-sm">{product.name}</div>
                                        <div className="text-xs text-gray-500">{product.sku} • {product.unit}</div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-sm font-medium">{formatCurrency(product.price)}</div>
                                        <div className="text-xs text-gray-500">Cost: {formatCurrency(product.cost || 0)}</div>
                                      </div>
                                    </button>
                                  ))
                                ) : (
                                  <div className="px-3 py-2 text-sm text-gray-500">
                                    Tidak ada produk ditemukan
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="w-20">
                          <Label className="text-xs text-gray-600">Qty</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={ingredient.quantity || ''}
                            onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                            step="0.01"
                          />
                        </div>
                        
                        <div className="w-20">
                          <Label className="text-xs text-gray-600">Unit</Label>
                          <Input
                            placeholder="Unit"
                            value={ingredient.unit || ''}
                            onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                          />
                        </div>
                        
                        <div className="w-24">
                          <Label className="text-xs text-gray-600">Cost/Unit</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={ingredient.cost || ''}
                            onChange={(e) => updateIngredient(index, 'cost', parseFloat(e.target.value) || 0)}
                            step="0.01"
                          />
                        </div>
                        
                        <div className="w-24">
                          <Label className="text-xs text-gray-600">Subtotal</Label>
                          <div className="h-10 px-3 bg-gray-50 rounded-md flex items-center text-sm font-medium">
                            {formatCurrency((ingredient.cost || 0) * (ingredient.quantity || 0))}
                          </div>
                        </div>
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeIngredient(index)}
                          className="text-red-600 hover:text-red-700 mt-5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Total Cost Display */}
                {formData.ingredients.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Cost Bahan:</span>
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(calculateTotalCost)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Per {formData.servings} porsi: {formatCurrency(calculateTotalCost / formData.servings)}
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-lg font-semibold">Cara Memasak</Label>
                  <Button type="button" variant="outline" onClick={addInstruction}>
                    <Plus className="w-4 h-4 mr-1" />
                    Tambah Langkah
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {formData.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-8 h-8 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center text-sm font-medium mt-1">
                        {index + 1}
                      </div>
                      <Textarea
                        value={instruction}
                        onChange={(e) => updateInstruction(index, e.target.value)}
                        placeholder={`Langkah ${index + 1}`}
                        className="flex-1"
                        rows={2}
                      />
                      {formData.instructions.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeInstruction(index)}
                          className="text-red-600 hover:text-red-700 mt-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
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
                {loading ? 'Menyimpan...' : 'Simpan Resep'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Recipe Detail Dialog */}
        <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedRecipe?.name}</DialogTitle>
            </DialogHeader>
            {selectedRecipe && (
              <div className="space-y-6">
                <div>
                  <p className="text-gray-600">{selectedRecipe.description}</p>
                  <div className="flex items-center space-x-4 mt-3">
                    {getDifficultyBadge(selectedRecipe.difficulty)}
                    <Badge variant="outline">{selectedRecipe.category}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Prep Time</p>
                    <p className="text-xl font-bold text-gray-900">{selectedRecipe.prepTime} min</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Cook Time</p>
                    <p className="text-xl font-bold text-gray-900">{selectedRecipe.cookTime} min</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Servings</p>
                    <p className="text-xl font-bold text-gray-900">{selectedRecipe.servings}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Ingredients</h3>
                  <div className="space-y-2">
                    {selectedRecipe.ingredients.map((ing) => (
                      <div key={ing.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="font-medium text-gray-900">{ing.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {ing.quantity} {ing.unit}
                          </p>
                          <p className="text-xs text-gray-500">{formatCurrency(ing.cost)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Instructions</h3>
                  <ol className="space-y-3">
                    {selectedRecipe.instructions.map((instruction, index) => (
                      <li key={index} className="flex">
                        <span className="flex-shrink-0 w-6 h-6 bg-sky-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 pt-0.5">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg p-4 border border-sky-200">
                  <h3 className="font-semibold text-lg mb-3">Cost Analysis</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedRecipe.cost)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Selling Price</p>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedRecipe.price)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Profit</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(selectedRecipe.price - selectedRecipe.cost)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Margin</p>
                      <p className="text-xl font-bold text-green-600">
                        {calculateProfit(selectedRecipe.price, selectedRecipe.cost)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedRecipe(null)}>
                Tutup
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  const printUrl = `/api/recipes/${selectedRecipe.id}/print`;
                  window.open(printUrl, '_blank');
                }}
              >
                <Package className="w-4 h-4 mr-2" />
                Cetak Resep
              </Button>
              <Button 
                variant="outline"
                onClick={() => openVersionDialog(selectedRecipe)}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Riwayat Versi
              </Button>
              <Button className="bg-gradient-to-r from-sky-500 to-blue-600">
                <Edit className="w-4 h-4 mr-2" />
                Edit Resep
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Version History Dialog */}
        <Dialog open={showVersionDialog} onOpenChange={setShowVersionDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Riwayat Versi - {selectedRecipe?.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {recipeVersions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Belum ada riwayat perubahan
                </p>
              ) : (
                recipeVersions.map((version, index) => (
                  <div key={version.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          Versi {version.version}
                        </Badge>
                        <Badge 
                          className={
                            version.change_type === 'created' ? 'bg-green-100 text-green-800' :
                            version.change_type === 'updated' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {version.change_type === 'created' ? 'Dibuat' :
                           version.change_type === 'updated' ? 'Diubah' : 'Lainnya'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(version.createdAt).toLocaleString('id-ID')}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600">
                      {version.changes_summary}
                    </p>
                    
                    {version.user && (
                      <p className="text-xs text-gray-500">
                        Oleh: {version.user.name} ({version.user.email})
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowVersionDialog(false)}>
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default RecipeManagementPage;
