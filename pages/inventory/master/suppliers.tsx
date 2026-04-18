import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useMasterCRUD, useMasterSummary, useSuppliers } from '@/hooks/useInventoryMaster';
import {
  ArrowLeft,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Truck,
  Users,
} from 'lucide-react';

type StatusFilter = 'all' | 'active' | 'inactive';

export type MasterSupplierRow = {
  id: number;
  code: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  country: string | null;
  tax_id: string | null;
  payment_terms: string | null;
  credit_limit: string | number | null;
  notes: string | null;
  is_active: boolean;
};

const emptyForm = () => ({
  code: '',
  name: '',
  contact_person: '',
  email: '',
  phone: '',
  mobile: '',
  address: '',
  city: '',
  province: '',
  postal_code: '',
  country: 'Indonesia',
  tax_id: '',
  payment_terms: '',
  credit_limit: 0 as number,
  notes: '',
  is_active: true,
});

const InventoryMasterSuppliersPage: React.FC = () => {
  const router = useRouter();
  const { status } = useSession();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const isActiveParam =
    statusFilter === 'all' ? undefined : statusFilter === 'active';

  const { suppliers, isLoading, refresh: refreshSuppliers } = useSuppliers(
    debouncedSearch || undefined,
    isActiveParam
  );
  const { refresh: refreshSummary } = useMasterSummary();
  const { create, update, remove, loading: crudLoading } = useMasterCRUD('suppliers');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MasterSupplierRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<MasterSupplierRow | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const stats = useMemo(() => {
    const list = (suppliers || []) as MasterSupplierRow[];
    return {
      total: list.length,
      active: list.filter((s) => s.is_active).length,
    };
  }, [suppliers]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (row: MasterSupplierRow) => {
    setEditing(row);
    setForm({
      code: row.code || '',
      name: row.name || '',
      contact_person: row.contact_person || '',
      email: row.email || '',
      phone: row.phone || '',
      mobile: row.mobile || '',
      address: row.address || '',
      city: row.city || '',
      province: row.province || '',
      postal_code: row.postal_code || '',
      country: row.country || 'Indonesia',
      tax_id: row.tax_id || '',
      payment_terms: row.payment_terms || '',
      credit_limit:
        row.credit_limit === null || row.credit_limit === undefined
          ? 0
          : Number(row.credit_limit),
      notes: row.notes || '',
      is_active: row.is_active !== false,
    });
    setDialogOpen(true);
  };

  const afterMutation = async () => {
    await refreshSuppliers();
    await refreshSummary();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) return;

    const payload = {
      ...form,
      credit_limit: Number(form.credit_limit) || 0,
    };

    try {
      if (editing) {
        await update({ id: editing.id, ...payload });
      } else {
        await create(payload);
      }
      setDialogOpen(false);
      setEditing(null);
      await afterMutation();
    } catch {
      /* toast in hook */
    }
  };

  const handleToggleActive = async (row: MasterSupplierRow) => {
    try {
      await update({ id: row.id, is_active: !row.is_active });
      await afterMutation();
    } catch {
      /* toast */
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await remove(deleteTarget.id);
      setDeleteTarget(null);
      await afterMutation();
    } catch {
      /* toast */
    }
  };

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-green-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Master Supplier | Inventory | BEDAGANG</title>
      </Head>

      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 p-8 text-white shadow-xl">
          <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-white/10" />
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <Link
                href="/inventory/master"
                className="mb-4 inline-flex items-center text-sm text-green-100 hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Master Data
              </Link>
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Truck className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Master Supplier</h1>
                  <p className="text-sm text-green-100">
                    Kelola vendor dan pemasok untuk pembelian, penerimaan barang, dan produk
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <div className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-right backdrop-blur-sm">
                <p className="text-xs text-green-100">Total (filter)</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-right backdrop-blur-sm">
                <p className="text-xs text-green-100">Aktif</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5 text-green-600" />
              Daftar Supplier
            </CardTitle>
            <Button
              onClick={openCreate}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Supplier
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari kode, nama, atau kontak..."
                  className="pl-9"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as StatusFilter)}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua status</SelectItem>
                  <SelectItem value="active">Aktif saja</SelectItem>
                  <SelectItem value="inactive">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead className="hidden md:table-cell">Kontak</TableHead>
                    <TableHead className="hidden lg:table-cell">Kota</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-green-600" />
                      </TableCell>
                    </TableRow>
                  ) : !suppliers?.length ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        Belum ada supplier. Tambahkan untuk digunakan di penerimaan barang dan produk.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (suppliers as MasterSupplierRow[]).map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-xs font-medium">{row.code}</TableCell>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell className="hidden max-w-[200px] truncate text-muted-foreground md:table-cell">
                          {row.contact_person || row.phone || row.email || '—'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{row.city || '—'}</TableCell>
                        <TableCell>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(row)}
                            className="cursor-pointer"
                            disabled={crudLoading}
                          >
                            <Badge
                              variant={row.is_active ? 'default' : 'secondary'}
                              className={
                                row.is_active
                                  ? 'bg-green-600 hover:bg-green-700'
                                  : 'text-muted-foreground'
                              }
                            >
                              {row.is_active ? 'Aktif' : 'Nonaktif'}
                            </Badge>
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEdit(row)}
                              disabled={crudLoading}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => setDeleteTarget(row)}
                              disabled={crudLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Ubah Supplier' : 'Tambah Supplier'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">Kode *</Label>
                <Input
                  id="code"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  required
                  disabled={!!editing}
                  placeholder="SUP-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nama *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="PT / CV / nama supplier"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_person">PIC / Kontak</Label>
                <Input
                  id="contact_person"
                  value={form.contact_person}
                  onChange={(e) => setForm((f) => ({ ...f, contact_person: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telepon</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">HP</Label>
                <Input
                  id="mobile"
                  value={form.mobile}
                  onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Textarea
                id="address"
                rows={2}
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">Kota</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Provinsi</Label>
                <Input
                  id="province"
                  value={form.province}
                  onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">Kode pos</Label>
                <Input
                  id="postal_code"
                  value={form.postal_code}
                  onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country">Negara</Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_id">NPWP / Tax ID</Label>
                <Input
                  id="tax_id"
                  value={form.tax_id}
                  onChange={(e) => setForm((f) => ({ ...f, tax_id: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_terms">Syarat pembayaran</Label>
                <Input
                  id="payment_terms"
                  placeholder="NET 30, COD, ..."
                  value={form.payment_terms}
                  onChange={(e) => setForm((f) => ({ ...f, payment_terms: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credit_limit">Batas kredit (IDR)</Label>
                <Input
                  id="credit_limit"
                  type="number"
                  min={0}
                  step="1000"
                  value={form.credit_limit}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, credit_limit: Number(e.target.value) || 0 }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Supplier aktif</p>
                <p className="text-xs text-muted-foreground">
                  Supplier nonaktif disembunyikan di filter default beberapa layar
                </p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={crudLoading}>
                {crudLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan
                  </>
                ) : editing ? (
                  'Simpan perubahan'
                ) : (
                  'Simpan'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus supplier?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  Supplier <strong>{deleteTarget.name}</strong> ({deleteTarget.code}) akan dihapus
                  permanen. Pastikan tidak ada referensi pembelian yang masih membutuhkan data ini.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleConfirmDelete}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default InventoryMasterSuppliersPage;
