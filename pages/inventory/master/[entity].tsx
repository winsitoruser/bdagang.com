import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
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
import { useMasterCRUD, useMasterSummary } from '@/hooks/useInventoryMaster';
import {
  ArrowLeft,
  Factory,
  Layers,
  Loader2,
  MapPin,
  Package,
  Pencil,
  Plus,
  Search,
  Tag as TagIcon,
  Trash2,
  Warehouse,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export const MASTER_ENTITIES = [
  'categories',
  'units',
  'brands',
  'warehouses',
  'locations',
  'manufacturers',
  'tags',
] as const;

export type MasterEntitySlug = (typeof MASTER_ENTITIES)[number];

const ENTITY_UI: Record<
  MasterEntitySlug,
  { title: string; description: string; accent: string }
> = {
  categories: {
    title: 'Kategori Produk',
    description: 'Struktur kategori untuk klasifikasi produk',
    accent: 'from-blue-500 to-blue-700',
  },
  units: {
    title: 'Satuan',
    description: 'PCS, KG, box, dan konversi antar satuan',
    accent: 'from-purple-500 to-purple-700',
  },
  brands: {
    title: 'Brand / Merek',
    description: 'Merek dagang untuk produk',
    accent: 'from-orange-500 to-orange-700',
  },
  warehouses: {
    title: 'Gudang',
    description: 'Lokasi penyimpanan utama',
    accent: 'from-indigo-500 to-indigo-700',
  },
  locations: {
    title: 'Lokasi Rak',
    description: 'Rak, aisle, dan bin di dalam gudang',
    accent: 'from-cyan-500 to-cyan-700',
  },
  manufacturers: {
    title: 'Manufacturer',
    description: 'Pabrik / produsen barang',
    accent: 'from-pink-500 to-rose-600',
  },
  tags: {
    title: 'Tags',
    description: 'Label tambahan untuk pencarian dan filter produk',
    accent: 'from-amber-500 to-yellow-600',
  },
};

function defaultForm(entity: MasterEntitySlug): Record<string, unknown> {
  switch (entity) {
    case 'categories':
      return {
        name: '',
        description: '',
        parent_id: '',
        icon: '',
        color: '',
        sort_order: 0,
        is_active: true,
      };
    case 'units':
      return {
        code: '',
        name: '',
        description: '',
        base_unit_id: '',
        conversion_factor: 1,
        is_base_unit: false,
        is_active: true,
      };
    case 'brands':
      return {
        code: '',
        name: '',
        description: '',
        logo_url: '',
        website: '',
        country: '',
        is_active: true,
      };
    case 'warehouses':
      return {
        code: '',
        name: '',
        description: '',
        address: '',
        city: '',
        province: '',
        manager_name: '',
        phone: '',
        email: '',
        is_main: false,
        is_active: true,
      };
    case 'locations':
      return {
        warehouse_id: '',
        code: '',
        name: '',
        aisle: '',
        rack: '',
        shelf: '',
        bin: '',
        description: '',
        capacity: '',
        capacity_unit: '',
        is_active: true,
      };
    case 'manufacturers':
      return {
        code: '',
        name: '',
        description: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        province: '',
        country: 'Indonesia',
        website: '',
        is_active: true,
      };
    case 'tags':
      return {
        name: '',
        slug: '',
        description: '',
        color: '',
        icon: '',
        is_active: true,
      };
    default:
      return { is_active: true };
  }
}

function populateForm(entity: MasterEntitySlug, row: Record<string, unknown>): Record<string, unknown> {
  const d = defaultForm(entity);
  if (entity === 'categories') {
    return {
      ...d,
      name: row.name ?? '',
      description: row.description ?? '',
      parent_id: row.parent_id != null ? String(row.parent_id) : '',
      icon: row.icon ?? '',
      color: row.color ?? '',
      sort_order: row.sort_order ?? 0,
      is_active: row.is_active !== false,
    };
  }
  if (entity === 'units') {
    return {
      ...d,
      code: row.code ?? '',
      name: row.name ?? '',
      description: row.description ?? '',
      base_unit_id: row.base_unit_id != null ? String(row.base_unit_id) : '',
      conversion_factor: row.conversion_factor ?? 1,
      is_base_unit: !!row.is_base_unit,
      is_active: row.is_active !== false,
    };
  }
  if (entity === 'brands') {
    return {
      ...d,
      code: row.code ?? '',
      name: row.name ?? '',
      description: row.description ?? '',
      logo_url: row.logo_url ?? '',
      website: row.website ?? '',
      country: row.country ?? '',
      is_active: row.is_active !== false,
    };
  }
  if (entity === 'warehouses') {
    return {
      ...d,
      code: row.code ?? '',
      name: row.name ?? '',
      description: row.description ?? '',
      address: row.address ?? '',
      city: row.city ?? '',
      province: row.province ?? '',
      manager_name: row.manager_name ?? '',
      phone: row.phone ?? '',
      email: row.email ?? '',
      is_main: !!row.is_main,
      is_active: row.is_active !== false,
    };
  }
  if (entity === 'locations') {
    return {
      ...d,
      warehouse_id: row.warehouse_id != null ? String(row.warehouse_id) : '',
      code: row.code ?? '',
      name: row.name ?? '',
      aisle: row.aisle ?? '',
      rack: row.rack ?? '',
      shelf: row.shelf ?? '',
      bin: row.bin ?? '',
      description: row.description ?? '',
      capacity: row.capacity ?? '',
      capacity_unit: row.capacity_unit ?? '',
      is_active: row.is_active !== false,
    };
  }
  if (entity === 'manufacturers') {
    return {
      ...d,
      code: row.code ?? '',
      name: row.name ?? '',
      description: row.description ?? '',
      contact_person: row.contact_person ?? '',
      email: row.email ?? '',
      phone: row.phone ?? '',
      address: row.address ?? '',
      city: row.city ?? '',
      province: row.province ?? '',
      country: row.country ?? 'Indonesia',
      website: row.website ?? '',
      is_active: row.is_active !== false,
    };
  }
  if (entity === 'tags') {
    return {
      ...d,
      name: row.name ?? '',
      slug: row.slug ?? '',
      description: row.description ?? '',
      color: row.color ?? '',
      icon: row.icon ?? '',
      is_active: row.is_active !== false,
    };
  }
  return d;
}

function buildPayload(
  entity: MasterEntitySlug,
  form: Record<string, unknown>,
  editingId: number | null
): Record<string, unknown> {
  if (entity === 'categories') {
    const parent = form.parent_id === '' || form.parent_id === '__none__' ? null : Number(form.parent_id);
    return {
      ...(editingId ? { id: editingId } : {}),
      name: form.name,
      description: form.description || null,
      parent_id: parent,
      icon: form.icon || null,
      color: form.color || null,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };
  }
  if (entity === 'units') {
    return {
      ...(editingId ? { id: editingId } : {}),
      code: form.code,
      name: form.name,
      description: form.description || null,
      base_unit_id: form.base_unit_id === '' ? null : Number(form.base_unit_id),
      conversion_factor: Number(form.conversion_factor) || 1,
      is_base_unit: form.is_base_unit,
      is_active: form.is_active,
    };
  }
  if (entity === 'brands') {
    return {
      ...(editingId ? { id: editingId } : {}),
      code: form.code,
      name: form.name,
      description: form.description || null,
      logo_url: form.logo_url || null,
      website: form.website || null,
      country: form.country || null,
      is_active: form.is_active,
    };
  }
  if (entity === 'warehouses') {
    return {
      ...(editingId ? { id: editingId } : {}),
      code: form.code,
      name: form.name,
      description: form.description || null,
      address: form.address || null,
      city: form.city || null,
      province: form.province || null,
      manager_name: form.manager_name || null,
      phone: form.phone || null,
      email: form.email || null,
      is_main: form.is_main,
      is_active: form.is_active,
    };
  }
  if (entity === 'locations') {
    return {
      ...(editingId ? { id: editingId } : {}),
      warehouse_id: Number(form.warehouse_id),
      code: form.code,
      name: form.name,
      aisle: form.aisle || null,
      rack: form.rack || null,
      shelf: form.shelf || null,
      bin: form.bin || null,
      description: form.description || null,
      capacity: form.capacity === '' ? null : Number(form.capacity),
      capacity_unit: form.capacity_unit || null,
      is_active: form.is_active,
    };
  }
  if (entity === 'manufacturers') {
    return {
      ...(editingId ? { id: editingId } : {}),
      code: form.code,
      name: form.name,
      description: form.description || null,
      contact_person: form.contact_person || null,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      city: form.city || null,
      province: form.province || null,
      country: form.country || null,
      website: form.website || null,
      is_active: form.is_active,
    };
  }
  if (entity === 'tags') {
    return {
      ...(editingId ? { id: editingId } : {}),
      name: form.name,
      slug: form.slug || String(form.name).toLowerCase().replace(/\s+/g, '-'),
      description: form.description || null,
      color: form.color || null,
      icon: form.icon || null,
      is_active: form.is_active,
    };
  }
  return {};
}

const InventoryMasterEntityPage: React.FC = () => {
  const router = useRouter();
  const { status } = useSession();
  const raw = router.query.entity;
  const entity = typeof raw === 'string' && MASTER_ENTITIES.includes(raw as MasterEntitySlug) ? (raw as MasterEntitySlug) : null;

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [deleteTarget, setDeleteTarget] = useState<Record<string, unknown> | null>(null);

  const { refresh: refreshSummary } = useMasterSummary();
  const { create, update, remove, loading: crudLoading } = useMasterCRUD(entity || 'categories');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
  }, [status, router]);

  const listParams = useMemo(() => {
    const p = new URLSearchParams();
    if (debouncedSearch) p.append('search', debouncedSearch);
    if (statusFilter !== 'all') p.append('is_active', statusFilter === 'active' ? 'true' : 'false');
    if (entity === 'locations' && warehouseFilter !== 'all') p.append('warehouse_id', warehouseFilter);
    return p.toString();
  }, [debouncedSearch, statusFilter, warehouseFilter, entity]);

  const listKey =
    router.isReady && entity ? `/api/inventory/master/${entity}${listParams ? `?${listParams}` : ''}` : null;
  const { data: listData, mutate: refreshList, isLoading: listLoading } = useSWR(listKey, fetcher);

  const { data: catPick } = useSWR(entity === 'categories' ? '/api/inventory/master/categories' : null, fetcher);
  const { data: whPick } = useSWR(
    entity === 'locations' ? '/api/inventory/master/warehouses' : null,
    fetcher
  );
  const { data: unitPick } = useSWR(entity === 'units' ? '/api/inventory/master/units' : null, fetcher);

  const rows = (listData?.data || []) as Record<string, unknown>[];
  const meta = entity ? ENTITY_UI[entity] : null;

  const openCreate = () => {
    if (!entity) return;
    setEditingId(null);
    setForm(defaultForm(entity));
    setDialogOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    if (!entity) return;
    setEditingId(Number(row.id));
    setForm(populateForm(entity, row));
    setDialogOpen(true);
  };

  const afterMutation = async () => {
    await refreshList();
    await refreshSummary();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entity) return;
    const payload = buildPayload(entity, form, editingId);
    try {
      if (editingId) {
        await update(payload);
      } else {
        await create(payload);
      }
      setDialogOpen(false);
      setEditingId(null);
      await afterMutation();
    } catch {
      /* toast in hook */
    }
  };

  const handleToggleActive = async (row: Record<string, unknown>) => {
    if (!entity) return;
    try {
      await update({ id: row.id, is_active: !row.is_active });
      await afterMutation();
    } catch {
      /* */
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      await remove(Number(deleteTarget.id));
      setDeleteTarget(null);
      await afterMutation();
    } catch {
      /* */
    }
  };

  const setF = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  if (!router.isReady || status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-green-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!entity || !meta) {
    return (
      <DashboardLayout>
        <Head>
          <title>Master data | Inventory</title>
        </Head>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
          <p className="text-lg font-medium text-amber-900">Jenis master data tidak dikenal</p>
          <p className="mt-2 text-sm text-amber-800">
            Pilih dari dashboard Master Data Inventory.
          </p>
          <Link href="/inventory/master" className="mt-4 inline-block text-green-700 underline">
            Kembali ke Master Data
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const iconForHeader =
    entity === 'categories' ? (
      <Layers className="h-7 w-7" />
    ) : entity === 'units' ? (
      <Package className="h-7 w-7" />
    ) : entity === 'brands' ? (
      <Factory className="h-7 w-7" />
    ) : entity === 'warehouses' ? (
      <Warehouse className="h-7 w-7" />
    ) : entity === 'locations' ? (
      <MapPin className="h-7 w-7" />
    ) : entity === 'manufacturers' ? (
      <Factory className="h-7 w-7" />
    ) : (
      <TagIcon className="h-7 w-7" />
    );

  const categoriesOptions = (catPick?.data || []) as { id: number; name: string }[];
  const warehousesOptions = (whPick?.data || []) as { id: number; name: string; code: string }[];
  const unitsOptions = (unitPick?.data || []) as { id: number; name: string; code: string }[];

  return (
    <DashboardLayout>
      <Head>
        <title>{meta.title} | Master Inventory</title>
      </Head>

      <div className="space-y-6">
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${meta.accent} p-8 text-white shadow-xl`}>
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <Link
                href="/inventory/master"
                className="mb-4 inline-flex items-center text-sm text-white/90 hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Master Data
              </Link>
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  {iconForHeader}
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{meta.title}</h1>
                  <p className="text-sm text-white/90">{meta.description}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-right backdrop-blur-sm">
              <p className="text-xs text-white/80">Baris (filter)</p>
              <p className="text-2xl font-bold">{rows.length}</p>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-xl">Data</CardTitle>
            <Button
              onClick={openCreate}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Cari..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as 'all' | 'active' | 'inactive')}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
              {entity === 'locations' && (
                <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                  <SelectTrigger className="w-full md:w-[220px]">
                    <SelectValue placeholder="Gudang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua gudang</SelectItem>
                    {warehousesOptions.map((w) => (
                      <SelectItem key={w.id} value={String(w.id)}>
                        {w.code} — {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {entity === 'categories' && (
                      <>
                        <TableHead>Nama</TableHead>
                        <TableHead className="hidden md:table-cell">Induk</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </>
                    )}
                    {entity === 'units' && (
                      <>
                        <TableHead>Kode</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead className="hidden md:table-cell">Konversi</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </>
                    )}
                    {entity === 'brands' && (
                      <>
                        <TableHead>Kode</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead className="hidden lg:table-cell">Negara</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </>
                    )}
                    {entity === 'warehouses' && (
                      <>
                        <TableHead>Kode</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead className="hidden md:table-cell">Kota</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </>
                    )}
                    {entity === 'locations' && (
                      <>
                        <TableHead>Gudang</TableHead>
                        <TableHead>Kode</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead className="hidden lg:table-cell">Rak/Aisle</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </>
                    )}
                    {entity === 'manufacturers' && (
                      <>
                        <TableHead>Kode</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead className="hidden md:table-cell">Kota</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </>
                    )}
                    {entity === 'tags' && (
                      <>
                        <TableHead>Nama</TableHead>
                        <TableHead className="hidden md:table-cell">Slug</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-28 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-green-600" />
                      </TableCell>
                    </TableRow>
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        Tidak ada data.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => (
                      <TableRow key={String(row.id)}>
                        {entity === 'categories' && (
                          <>
                            <TableCell className="font-medium">{String(row.name)}</TableCell>
                            <TableCell className="hidden text-muted-foreground md:table-cell">
                              {row.parent_name ? String(row.parent_name) : '—'}
                            </TableCell>
                            <TableCell>
                              <button type="button" onClick={() => handleToggleActive(row)} disabled={crudLoading}>
                                <Badge className={row.is_active ? 'bg-green-600' : ''}>
                                  {row.is_active ? 'Aktif' : 'Nonaktif'}
                                </Badge>
                              </button>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600"
                                onClick={() => setDeleteTarget(row)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </>
                        )}
                        {entity === 'units' && (
                          <>
                            <TableCell className="font-mono text-xs">{String(row.code)}</TableCell>
                            <TableCell>{String(row.name)}</TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                              {row.base_unit_name ? `↳ ${String(row.base_unit_name)} × ${row.conversion_factor}` : '—'}
                            </TableCell>
                            <TableCell>
                              <button type="button" onClick={() => handleToggleActive(row)} disabled={crudLoading}>
                                <Badge className={row.is_active ? 'bg-green-600' : ''}>
                                  {row.is_active ? 'Aktif' : 'Nonaktif'}
                                </Badge>
                              </button>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600"
                                onClick={() => setDeleteTarget(row)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </>
                        )}
                        {entity === 'brands' && (
                          <>
                            <TableCell className="font-mono text-xs">{String(row.code)}</TableCell>
                            <TableCell>{String(row.name)}</TableCell>
                            <TableCell className="hidden lg:table-cell">{row.country ? String(row.country) : '—'}</TableCell>
                            <TableCell>
                              <button type="button" onClick={() => handleToggleActive(row)} disabled={crudLoading}>
                                <Badge className={row.is_active ? 'bg-green-600' : ''}>
                                  {row.is_active ? 'Aktif' : 'Nonaktif'}
                                </Badge>
                              </button>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600"
                                onClick={() => setDeleteTarget(row)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </>
                        )}
                        {entity === 'warehouses' && (
                          <>
                            <TableCell className="font-mono text-xs">{String(row.code)}</TableCell>
                            <TableCell>{String(row.name)}</TableCell>
                            <TableCell className="hidden md:table-cell">{row.city ? String(row.city) : '—'}</TableCell>
                            <TableCell>
                              <button type="button" onClick={() => handleToggleActive(row)} disabled={crudLoading}>
                                <Badge className={row.is_active ? 'bg-green-600' : ''}>
                                  {row.is_active ? 'Aktif' : 'Nonaktif'}
                                </Badge>
                              </button>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600"
                                onClick={() => setDeleteTarget(row)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </>
                        )}
                        {entity === 'locations' && (
                          <>
                            <TableCell className="text-sm">
                              {row.warehouse_code ? `${String(row.warehouse_code)}` : '—'}
                            </TableCell>
                            <TableCell className="font-mono text-xs">{String(row.code)}</TableCell>
                            <TableCell>{String(row.name)}</TableCell>
                            <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                              {[row.aisle, row.rack, row.shelf].filter(Boolean).join(' / ') || '—'}
                            </TableCell>
                            <TableCell>
                              <button type="button" onClick={() => handleToggleActive(row)} disabled={crudLoading}>
                                <Badge className={row.is_active ? 'bg-green-600' : ''}>
                                  {row.is_active ? 'Aktif' : 'Nonaktif'}
                                </Badge>
                              </button>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600"
                                onClick={() => setDeleteTarget(row)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </>
                        )}
                        {entity === 'manufacturers' && (
                          <>
                            <TableCell className="font-mono text-xs">{String(row.code)}</TableCell>
                            <TableCell>{String(row.name)}</TableCell>
                            <TableCell className="hidden md:table-cell">{row.city ? String(row.city) : '—'}</TableCell>
                            <TableCell>
                              <button type="button" onClick={() => handleToggleActive(row)} disabled={crudLoading}>
                                <Badge className={row.is_active ? 'bg-green-600' : ''}>
                                  {row.is_active ? 'Aktif' : 'Nonaktif'}
                                </Badge>
                              </button>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600"
                                onClick={() => setDeleteTarget(row)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </>
                        )}
                        {entity === 'tags' && (
                          <>
                            <TableCell className="font-medium">{String(row.name)}</TableCell>
                            <TableCell className="hidden md:table-cell font-mono text-xs">{String(row.slug)}</TableCell>
                            <TableCell>
                              <button type="button" onClick={() => handleToggleActive(row)} disabled={crudLoading}>
                                <Badge className={row.is_active ? 'bg-green-600' : ''}>
                                  {row.is_active ? 'Aktif' : 'Nonaktif'}
                                </Badge>
                              </button>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600"
                                onClick={() => setDeleteTarget(row)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </>
                        )}
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
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Ubah data' : 'Tambah data'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            {entity === 'categories' && (
              <>
                <div className="space-y-2">
                  <Label>Nama *</Label>
                  <Input value={String(form.name || '')} onChange={(e) => setF('name', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Textarea value={String(form.description || '')} onChange={(e) => setF('description', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Kategori induk</Label>
                  <Select
                    value={form.parent_id === '' ? '__none__' : String(form.parent_id)}
                    onValueChange={(v) => setF('parent_id', v === '__none__' ? '' : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tanpa induk" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">(root)</SelectItem>
                      {categoriesOptions
                        .filter((c) => !editingId || c.id !== editingId)
                        .map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <Input value={String(form.icon || '')} onChange={(e) => setF('icon', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Warna</Label>
                    <Input value={String(form.color || '')} onChange={(e) => setF('color', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Urutan</Label>
                  <Input
                    type="number"
                    value={String(form.sort_order ?? 0)}
                    onChange={(e) => setF('sort_order', Number(e.target.value))}
                  />
                </div>
                <div className="flex items-center justify-between rounded border p-3">
                  <span className="text-sm">Aktif</span>
                  <Switch checked={!!form.is_active} onCheckedChange={(v) => setF('is_active', v)} />
                </div>
              </>
            )}

            {entity === 'units' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Kode *</Label>
                    <Input value={String(form.code || '')} onChange={(e) => setF('code', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Nama *</Label>
                    <Input value={String(form.name || '')} onChange={(e) => setF('name', e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Textarea value={String(form.description || '')} onChange={(e) => setF('description', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Satuan dasar (opsional)</Label>
                  <Select
                    value={form.base_unit_id === '' ? '__none__' : String(form.base_unit_id)}
                    onValueChange={(v) => setF('base_unit_id', v === '__none__' ? '' : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">—</SelectItem>
                      {unitsOptions
                        .filter((u) => !editingId || u.id !== editingId)
                        .map((u) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.code} — {u.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Faktor konversi</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={String(form.conversion_factor ?? 1)}
                      onChange={(e) => setF('conversion_factor', Number(e.target.value))}
                    />
                  </div>
                  <div className="flex items-end pb-2">
                    <div className="flex w-full items-center justify-between rounded border px-3 py-2">
                      <span className="text-sm">Satuan dasar?</span>
                      <Switch checked={!!form.is_base_unit} onCheckedChange={(v) => setF('is_base_unit', v)} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded border p-3">
                  <span className="text-sm">Aktif</span>
                  <Switch checked={!!form.is_active} onCheckedChange={(v) => setF('is_active', v)} />
                </div>
              </>
            )}

            {entity === 'brands' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Kode *</Label>
                    <Input value={String(form.code || '')} onChange={(e) => setF('code', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Nama *</Label>
                    <Input value={String(form.name || '')} onChange={(e) => setF('name', e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Textarea value={String(form.description || '')} onChange={(e) => setF('description', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Logo URL</Label>
                    <Input value={String(form.logo_url || '')} onChange={(e) => setF('logo_url', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input value={String(form.website || '')} onChange={(e) => setF('website', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Negara</Label>
                  <Input value={String(form.country || '')} onChange={(e) => setF('country', e.target.value)} />
                </div>
                <div className="flex items-center justify-between rounded border p-3">
                  <span className="text-sm">Aktif</span>
                  <Switch checked={!!form.is_active} onCheckedChange={(v) => setF('is_active', v)} />
                </div>
              </>
            )}

            {entity === 'warehouses' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Kode *</Label>
                    <Input
                      value={String(form.code || '')}
                      onChange={(e) => setF('code', e.target.value)}
                      required
                      disabled={!!editingId}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nama *</Label>
                    <Input value={String(form.name || '')} onChange={(e) => setF('name', e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Textarea value={String(form.description || '')} onChange={(e) => setF('description', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Alamat</Label>
                  <Textarea value={String(form.address || '')} onChange={(e) => setF('address', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Kota</Label>
                    <Input value={String(form.city || '')} onChange={(e) => setF('city', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Provinsi</Label>
                    <Input value={String(form.province || '')} onChange={(e) => setF('province', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Manager</Label>
                    <Input value={String(form.manager_name || '')} onChange={(e) => setF('manager_name', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Telepon</Label>
                    <Input value={String(form.phone || '')} onChange={(e) => setF('phone', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={String(form.email || '')} onChange={(e) => setF('email', e.target.value)} />
                </div>
                <div className="flex items-center justify-between rounded border p-3">
                  <span className="text-sm">Gudang utama</span>
                  <Switch checked={!!form.is_main} onCheckedChange={(v) => setF('is_main', v)} />
                </div>
                <div className="flex items-center justify-between rounded border p-3">
                  <span className="text-sm">Aktif</span>
                  <Switch checked={!!form.is_active} onCheckedChange={(v) => setF('is_active', v)} />
                </div>
              </>
            )}

            {entity === 'locations' && (
              <>
                <div className="space-y-2">
                  <Label>Gudang *</Label>
                  <Select
                    value={form.warehouse_id === '' ? '' : String(form.warehouse_id)}
                    onValueChange={(v) => setF('warehouse_id', v)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih gudang" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehousesOptions.map((w) => (
                        <SelectItem key={w.id} value={String(w.id)}>
                          {w.code} — {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Kode lokasi *</Label>
                    <Input value={String(form.code || '')} onChange={(e) => setF('code', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Nama *</Label>
                    <Input value={String(form.name || '')} onChange={(e) => setF('name', e.target.value)} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {(['aisle', 'rack', 'shelf', 'bin'] as const).map((k) => (
                    <div key={k} className="space-y-2">
                      <Label className="capitalize">{k}</Label>
                      <Input value={String(form[k] || '')} onChange={(e) => setF(k, e.target.value)} />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Textarea value={String(form.description || '')} onChange={(e) => setF('description', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Kapasitas</Label>
                    <Input
                      type="number"
                      value={String(form.capacity ?? '')}
                      onChange={(e) => setF('capacity', e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Satuan kapasitas</Label>
                    <Input value={String(form.capacity_unit || '')} onChange={(e) => setF('capacity_unit', e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded border p-3">
                  <span className="text-sm">Aktif</span>
                  <Switch checked={!!form.is_active} onCheckedChange={(v) => setF('is_active', v)} />
                </div>
              </>
            )}

            {entity === 'manufacturers' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Kode *</Label>
                    <Input
                      value={String(form.code || '')}
                      onChange={(e) => setF('code', e.target.value)}
                      required
                      disabled={!!editingId}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nama *</Label>
                    <Input value={String(form.name || '')} onChange={(e) => setF('name', e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Textarea value={String(form.description || '')} onChange={(e) => setF('description', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Kontak</Label>
                    <Input value={String(form.contact_person || '')} onChange={(e) => setF('contact_person', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Telepon</Label>
                    <Input value={String(form.phone || '')} onChange={(e) => setF('phone', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={String(form.email || '')} onChange={(e) => setF('email', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Alamat</Label>
                  <Textarea value={String(form.address || '')} onChange={(e) => setF('address', e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Kota</Label>
                    <Input value={String(form.city || '')} onChange={(e) => setF('city', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Provinsi</Label>
                    <Input value={String(form.province || '')} onChange={(e) => setF('province', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Negara</Label>
                    <Input value={String(form.country || '')} onChange={(e) => setF('country', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input value={String(form.website || '')} onChange={(e) => setF('website', e.target.value)} />
                </div>
                <div className="flex items-center justify-between rounded border p-3">
                  <span className="text-sm">Aktif</span>
                  <Switch checked={!!form.is_active} onCheckedChange={(v) => setF('is_active', v)} />
                </div>
              </>
            )}

            {entity === 'tags' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Nama *</Label>
                    <Input value={String(form.name || '')} onChange={(e) => setF('name', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input value={String(form.slug || '')} onChange={(e) => setF('slug', e.target.value)} placeholder="auto dari nama jika kosong" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Textarea value={String(form.description || '')} onChange={(e) => setF('description', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Warna</Label>
                    <Input value={String(form.color || '')} onChange={(e) => setF('color', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <Input value={String(form.icon || '')} onChange={(e) => setF('icon', e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded border p-3">
                  <span className="text-sm">Aktif</span>
                  <Switch checked={!!form.is_active} onCheckedChange={(v) => setF('is_active', v)} />
                </div>
              </>
            )}

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={crudLoading}>
                {crudLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? 'Simpan' : 'Tambah'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus data ini?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  Item: <strong>{String(deleteTarget.name || deleteTarget.code || deleteTarget.id)}</strong>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600" onClick={confirmDelete}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default InventoryMasterEntityPage;
