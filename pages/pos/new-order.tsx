import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Minus, Search, X, Send, User, Clock,
  DollarSign, Receipt, Table, Utensils, Package
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  modifiers?: string[];
}

const NewOrderPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Get table number from query
  useEffect(() => {
    if (router.query.table) {
      setTableNumber(router.query.table as string);
    }
  }, [router.query]);

  // Fetch products
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?isActive=true');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.sku || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToOrder = (product: Product) => {
    const existingItem = orderItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setOrderItems(orderItems.map(item => {
      if (item.productId === productId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean) as OrderItem[]);
  };

  const removeFromOrder = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.productId !== productId));
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.11; // 11% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const createOrder = async () => {
    if (orderItems.length === 0) {
      alert('Please add items to the order');
      return;
    }

    if (orderType === 'dine-in' && !tableNumber) {
      alert('Please select a table for dine-in orders');
      return;
    }

    setCreatingOrder(true);
    
    try {
      const response = await fetch('/api/pos/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderItems.map(item => ({
            productId: item.productId,
            productName: item.name,
            productSku: products.find(p => p.id === item.productId)?.sku,
            quantity: item.quantity,
            unitPrice: item.price,
            notes: item.notes
          })),
          customerName,
          tableNumber: orderType === 'dine-in' ? tableNumber : null,
          orderType,
          paymentMethod: 'cash',
          paidAmount: calculateTotal(),
          tax: calculateTax(),
          notes,
          sendToKitchen: orderType !== 'takeaway',
          cashierId: session?.user?.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert('Order created successfully!');
        
        if (orderType === 'dine-in') {
          router.push('/pos/tables');
        } else {
          router.push('/pos/transactions');
        }
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Create order error:', error);
      alert('Failed to create order');
    } finally {
      setCreatingOrder(false);
    }
  };

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <Head>
        <title>New Order - Bedagang POS</title>
      </Head>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Receipt className="w-8 h-8 mr-2" />
              New Order
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Create a new order
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="space-y-4">
            {/* Order Type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Type</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={orderType} onValueChange={(value: any) => setOrderType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dine-in">
                      <div className="flex items-center">
                        <Utensils className="w-4 h-4 mr-2" />
                        Dine In
                      </div>
                    </SelectItem>
                    <SelectItem value="takeaway">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        Takeaway
                      </div>
                    </SelectItem>
                    <SelectItem value="delivery">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        Delivery
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {orderType === 'dine-in' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Table Number</label>
                    <Input
                      placeholder="e.g., 1, A1, VIP-1"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                    />
                  </div>
                )}

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Customer Name</label>
                  <Input
                    placeholder="Optional"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Order Notes</label>
                  <Input
                    placeholder="Optional notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {orderItems.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No items added</p>
                  ) : (
                    orderItems.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between py-2 border-b">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            Rp {item.price.toLocaleString('id-ID')} x {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromOrder(item.productId)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {orderItems.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between mb-2">
                      <span>Subtotal:</span>
                      <span>Rp {calculateSubtotal().toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Tax (11%):</span>
                      <span>Rp {calculateTax().toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>Rp {calculateTotal().toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Middle & Right Columns - Products */}
          <div className="col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Products</CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 flex-1">
                    <Search className="w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => addToOrder(product)}
                    >
                      <CardContent className="p-4">
                        <div className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-md" />
                          ) : (
                            <Package className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <h3 className="font-medium text-sm truncate">{product.name}</h3>
                        <p className="text-xs text-gray-600 mb-1">{product.category}</p>
                        <p className="font-bold text-sm">Rp {product.price.toLocaleString('id-ID')}</p>
                        <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Actions */}
        {orderItems.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold">Rp {calculateTotal().toLocaleString('id-ID')}</p>
              </div>
              <Button
                onClick={createOrder}
                disabled={creatingOrder}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {creatingOrder ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Send className="w-4 h-4 mr-2" />
                    {orderType === 'dine-in' ? 'Send to Kitchen' : 'Create Order'}
                  </div>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NewOrderPage;
