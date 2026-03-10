import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

export interface TransactionItem {
  productId: string;
  productName: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  subtotal: number;
  notes?: string;
}

export interface Transaction {
  id: string;
  transactionNumber: string;
  shiftId?: string;
  customerId?: string;
  customerName?: string;
  cashierId: string;
  transactionDate: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'Cash' | 'Card' | 'Transfer' | 'QRIS' | 'E-Wallet';
  paidAmount: number;
  changeAmount: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  cashier?: {
    id: string;
    name: string;
    position: string;
  };
  customer?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  items?: TransactionItem[];
}

export interface TransactionFilter {
  shiftId?: string;
  cashierId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  search?: string;
  period?: 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom';
}

const useTransactionIntegration = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch transactions with filters
  const fetchTransactions = useCallback(async (filters?: TransactionFilter) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.shiftId) params.append('shiftId', filters.shiftId);
      if (filters?.cashierId) params.append('cashierId', filters.cashierId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());
      if (filters?.search) params.append('search', filters.search);

      const response = await fetch(`/api/pos/transactions?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setTransactions(data.transactions);
        return data;
      } else {
        throw new Error(data.error || 'Failed to fetch transactions');
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Get single transaction by ID
  const fetchTransactionById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/pos/transactions/${id}`);
      const data = await response.json();

      if (response.ok) {
        return data.transaction;
      } else {
        throw new Error(data.error || 'Failed to fetch transaction');
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Create new transaction
  const createTransaction = useCallback(async (transactionData: {
    shiftId?: string;
    customerId?: string;
    customerName?: string;
    cashierId: string;
    items: TransactionItem[];
    paymentMethod: string;
    paidAmount: number;
    discount?: number;
    tax?: number;
    notes?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/pos/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Transaksi Berhasil',
          description: `Transaksi ${data.transaction.transactionNumber} berhasil dibuat`
        });
        return data.transaction;
      } else {
        throw new Error(data.error || 'Failed to create transaction');
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Delete transaction
  const deleteTransaction = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/pos/transactions/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Transaksi Dihapus',
          description: 'Transaksi berhasil dihapus'
        });
        setTransactions(prev => prev.filter(t => t.id !== id));
        return true;
      } else {
        throw new Error(data.error || 'Failed to delete transaction');
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    fetchTransactionById,
    createTransaction,
    deleteTransaction
  };
};

export default useTransactionIntegration;
