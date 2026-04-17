import {
  LayoutDashboard,
  Building2,
  Package,
  Users,
  FileText,
  Settings,
  ShoppingCart,
  TrendingUp,
  Bell,
  Shield,
  ClipboardList,
  Truck,
  BarChart3,
  History,
  Globe,
  DollarSign,
  Layers,
  Store,
  UserCog,
  FileBarChart,
  AlertCircle,
  UserCheck,
  Target,
  CalendarCheck,
  Award,
  Wallet,
  Banknote,
  PiggyBank,
  Receipt,
  CreditCard,
  Calculator,
  ArrowRightLeft,
  FileSpreadsheet,
  Plug,
  MapPin,
  Navigation,
  Wrench,
  Fuel,
  Fingerprint,
  Utensils,
  Calendar,
  ChefHat,
  Ticket,
  CalendarDays,
  MessageCircle,
  ShoppingBag,
  Network,
  Heart,
  Clock,
  KeyRound,
  Plane,
  Briefcase,
  Megaphone,
  Gift,
  UserPlus,
  Crosshair,
  Zap,
  Disc,
  Activity,
  AlertTriangle,
  Send,
  Star,
  Timer,
  GitBranch,
  Rocket,
  Warehouse,
  Gauge,
  Factory,
  Cog,
  Brain,
  HardHat,
  Scan,
  GraduationCap,
  PenTool,
  Ship,
  Anchor,
  BookOpen,
  Car,
  Code2,
  Smartphone,
  QrCode,
  Percent,
  Sparkles,
  type LucideIcon
} from 'lucide-react';

// Types
export type UserRole = 
  | 'super_admin' 
  | 'owner' 
  | 'admin'
  | 'manager'
  | 'staff'
  | 'hq_admin' 
  | 'branch_manager' 
  | 'cashier' 
  | 'inventory_staff'
  | 'kitchen_staff'
  | 'finance_staff'
  | 'hr_staff';

export type ModuleCode = 
  | 'dashboard'
  | 'pos'
  | 'inventory'
  | 'customers'
  | 'employees'
  | 'loyalty'
  | 'tables'
  | 'reservations'
  | 'kitchen'
  | 'promo'
  | 'finance'
  | 'finance_lite'
  | 'finance_pro'
  | 'reports'
  | 'settings'
  | 'hris'
  | 'branches'
  | 'supply_chain'
  | 'products'
  | 'users'
  | 'audit'
  | 'integrations'
  | 'fleet'
  | 'whatsapp_business'
  | 'marketplace_integration'
  | 'crm'
  | 'sfa'
  | 'marketing'
  | 'tms'
  | 'fms'
  | 'manufacturing'
  | 'asset_management'
  | 'project_management'
  | 'e_procurement'
  | 'export_import'
  | 'knowledge_base'
  | 'requisitions'
  | 'billing'
  | 'website_builder';

export type LayoutType = 'hq' | 'branch' | 'admin';

export interface MenuItem {
  id: string;
  name: string;
  href?: string;
  icon: LucideIcon;
  badge?: number;
  badgeColor?: string;
  children?: MenuItem[];
  // Access control
  roles?: UserRole[];
  modules?: ModuleCode[];
  permissions?: string[];
  // Visibility
  hidden?: boolean;
  comingSoon?: boolean;
}

export interface MenuGroup {
  id: string;
  title: string;
  items: MenuItem[];
  roles?: UserRole[];
  collapsed?: boolean;
}

export interface SidebarConfig {
  layout: LayoutType;
  groups: MenuGroup[];
  logo: {
    icon: LucideIcon;
    title: string;
    subtitle?: string;
    href: string;
  };
}

// ============================================
// HQ SIDEBAR CONFIGURATION
// ============================================
export const hqSidebarConfig: SidebarConfig = {
  layout: 'hq',
  logo: {
    icon: Building2,
    title: 'Bedagang',
    subtitle: 'Platform Pusat',
    href: '/hq/home'
  },
  groups: [
    {
      id: 'main',
      title: 'Utama',
      items: [
        { 
          id: 'home',
          name: 'Beranda', 
          href: '/hq/home', 
          icon: LayoutDashboard,
          modules: ['dashboard']
        },
        { 
          id: 'dashboard',
          name: 'Dasbor Operasional', 
          href: '/hq/dashboard', 
          icon: BarChart3,
          modules: ['dashboard']
        }
      ]
    },
    {
      id: 'operations',
      title: 'Operasional',
      items: [
        { 
          id: 'branches',
          name: 'Cabang', 
          icon: Building2,
          modules: ['branches'],
          children: [
            { id: 'branch-list', name: 'Daftar Cabang', href: '/hq/branches', icon: Store },
            { id: 'branch-performance', name: 'Performa Cabang', href: '/hq/branches/performance', icon: TrendingUp },
            { id: 'branch-settings', name: 'Pengaturan Cabang', href: '/hq/branches/settings', icon: Settings },
          ]
        },
        { 
          id: 'warehouse-inventory',
          name: 'Gudang & Inventori', 
          icon: Package,
          modules: ['inventory', 'products'],
          children: [
            { id: 'wh-dashboard', name: 'Dasbor', href: '/hq/inventory', icon: LayoutDashboard },
            { id: 'wh-products', name: 'Produk Utama', href: '/hq/products', icon: Package },
            { id: 'wh-stock', name: 'Stok Global', href: '/hq/inventory/stock', icon: Package },
            { id: 'wh-categories', name: 'Kategori Produk', href: '/hq/inventory/categories', icon: Layers },
            { id: 'wh-pricing', name: 'Harga & Penetapan Harga', href: '/hq/inventory/pricing', icon: DollarSign },
            { id: 'wh-transfers', name: 'Transfer & Permintaan', href: '/hq/inventory/transfers', icon: ArrowRightLeft },
            { id: 'wh-po', name: 'Pesanan Pembelian', href: '/hq/purchase-orders', icon: ShoppingCart },
            { id: 'wh-suppliers', name: 'Pemasok', href: '/hq/suppliers', icon: Truck },
            { id: 'wh-receipts', name: 'Penerimaan Barang', href: '/hq/inventory/receipts', icon: FileText },
            { id: 'wh-stocktake', name: 'Stock Opname', href: '/hq/inventory/stocktake', icon: ClipboardList },
            { id: 'wh-alerts', name: 'Peringatan', href: '/hq/inventory/alerts', icon: AlertCircle },
            { id: 'wh-fleet-link', name: 'Armada & Dispatch', href: '/hq/fleet?tab=inventory', icon: Truck },
            { id: 'wh-supply-chain', name: 'Supply Chain Terpadu', href: '/hq/fleet?tab=supply-chain', icon: ArrowRightLeft },
          ]
        },
        {
          // ════════════════════════════════════════════════════════════════
          // PUSAT KENDALI ARMADA & TRANSPORTASI (Unified Super Module)
          // Menggabungkan Fleet Legacy + FMS + TMS menjadi satu modul
          // dengan integrasi cross-module ke Driver App, HRIS, Finance,
          // dan Inventory.
          // ════════════════════════════════════════════════════════════════
          id: 'fleet-command',
          name: 'Pusat Kendali Armada',
          icon: Truck,
          modules: ['fms', 'tms', 'fleet'],
          children: [
            // — Entry utama Command Center —
            { id: 'fc-command', name: 'Pusat Kendali (Unified)', href: '/hq/fleet', icon: LayoutDashboard },
            { id: 'fc-fms-dashboard', name: 'Dasbor FMS', href: '/hq/fms', icon: Gauge },
            { id: 'fc-tms-dashboard', name: 'Dasbor TMS', href: '/hq/tms', icon: Send },

            // — Operasional (FMS) —
            { id: 'fc-vehicles', name: 'Kendaraan', href: '/hq/fms?tab=vehicles', icon: Truck },
            { id: 'fc-drivers', name: 'Pengemudi', href: '/hq/fms?tab=drivers', icon: Users },
            { id: 'fc-maintenance', name: 'Pemeliharaan', href: '/hq/fms?tab=maintenance', icon: Wrench },
            { id: 'fc-fuel', name: 'BBM / Bahan Bakar', href: '/hq/fms?tab=fuel', icon: Fuel },
            { id: 'fc-rentals', name: 'Penyewaan Kendaraan', href: '/hq/fms?tab=rentals', icon: KeyRound },
            { id: 'fc-inspections', name: 'Inspeksi Kendaraan', href: '/hq/fms?tab=inspections', icon: ClipboardList },
            { id: 'fc-incidents', name: 'Insiden & Kecelakaan', href: '/hq/fms?tab=incidents', icon: AlertTriangle },
            { id: 'fc-tires', name: 'Manajemen Ban', href: '/hq/fms?tab=tires', icon: Disc },

            // — Pelacakan & GPS —
            { id: 'fc-gps', name: 'GPS Live', href: '/hq/fms?tab=gps', icon: Navigation },
            { id: 'fc-live-map', name: 'Peta Live', href: '/hq/fleet/live', icon: Zap },
            { id: 'fc-geofences', name: 'Geofence', href: '/hq/fms?tab=geofences', icon: Crosshair },
            { id: 'fc-violations', name: 'Pelanggaran', href: '/hq/fms?tab=violations', icon: Zap },

            // — Transportasi (TMS) —
            { id: 'fc-shipments', name: 'Pengiriman', href: '/hq/tms?tab=shipments', icon: Package },
            { id: 'fc-trips', name: 'Perjalanan', href: '/hq/tms?tab=trips', icon: Navigation },
            { id: 'fc-dispatch', name: 'Dispatch Barang', href: '/hq/tms?tab=dispatch', icon: Send },
            { id: 'fc-tracking', name: 'Pelacakan Pengiriman', href: '/hq/tms?tab=tracking', icon: Activity },
            { id: 'fc-carriers', name: 'Pengangkut / Vendor', href: '/hq/tms?tab=carriers', icon: Building2 },
            { id: 'fc-routes', name: 'Rute & Perencanaan', href: '/hq/tms?tab=routes', icon: MapPin },
            { id: 'fc-warehouses', name: 'Gudang Logistik', href: '/hq/tms?tab=warehouses', icon: Warehouse },

            // — Analitik & KPI —
            { id: 'fc-analytics', name: 'Analitik Armada', href: '/hq/fms?tab=analytics', icon: BarChart3 },
            { id: 'fc-kpi-fleet', name: 'KPI Armada', href: '/hq/fleet/kpi', icon: Target },
            { id: 'fc-leaderboard', name: 'Leaderboard Driver', href: '/hq/fleet/leaderboard', icon: Award },
            { id: 'fc-logistics-kpi', name: 'KPI Logistik', href: '/hq/tms?tab=logistics-analytics', icon: BarChart3 },
            { id: 'fc-carrier-scores', name: 'Skor Pengangkut', href: '/hq/tms?tab=carrier-scores', icon: Star },
            { id: 'fc-sla', name: 'SLA Pengiriman', href: '/hq/tms?tab=delivery-sla', icon: Timer },

            // — Keuangan Armada —
            { id: 'fc-costs', name: 'Biaya Armada', href: '/hq/fms?tab=costs', icon: DollarSign },
            { id: 'fc-expenses', name: 'Reimbursement Driver', href: '/hq/fleet/expenses', icon: Wallet },
            { id: 'fc-billing', name: 'Freight Billing', href: '/hq/tms?tab=billing', icon: Receipt },
            { id: 'fc-rate-cards', name: 'Daftar Tarif', href: '/hq/tms?tab=rate-cards', icon: CreditCard },
            { id: 'fc-zones', name: 'Zona Pengiriman', href: '/hq/tms?tab=zones', icon: Globe },

            // — Supply Chain: Inventory, Manufaktur & Procurement —
            { id: 'fc-supply-chain', name: 'Supply Chain Command', href: '/hq/fleet?tab=supply-chain', icon: ArrowRightLeft },
            { id: 'fc-manufacturing', name: 'Integrasi Manufaktur', href: '/hq/fleet?tab=manufacturing', icon: Factory },
            { id: 'fc-inventory-link', name: 'Integrasi Inventory', href: '/hq/fleet?tab=inventory', icon: Warehouse },
            { id: 'fc-transfers', name: 'Transfer Antar Gudang', href: '/hq/inventory/transfers', icon: ArrowRightLeft },
            { id: 'fc-po-pickup', name: 'Pickup Pesanan Pembelian', href: '/hq/purchase-orders', icon: ShoppingCart },
            { id: 'fc-production', name: 'Manufaktur', href: '/hq/manufacturing', icon: Factory },

            // — Admin & Compliance —
            { id: 'fc-documents', name: 'Dokumen Armada', href: '/hq/fms?tab=documents', icon: FileText },
            { id: 'fc-reminders', name: 'Pengingat', href: '/hq/fms?tab=reminders', icon: Bell },
          ]
        },
        {
          id: 'requisitions',
          name: 'Permintaan Barang',
          icon: ClipboardList,
          modules: ['requisitions'],
          roles: ['super_admin', 'owner', 'hq_admin', 'admin', 'manager'],
          children: [
            { id: 'req-list', name: 'Daftar Permintaan', href: '/hq/requisitions', icon: ClipboardList },
          ]
        }
      ]
    },
    {
      id: 'asset-management',
      title: 'Manajemen Aset',
      items: [
        {
          id: 'assets',
          name: 'Manajemen Aset',
          icon: HardHat,
          modules: ['asset_management'],
          roles: ['super_admin', 'owner', 'hq_admin', 'admin', 'manager'],
          children: [
            { id: 'asset-dashboard', name: 'Dasbor', href: '/hq/assets', icon: LayoutDashboard },
            { id: 'asset-registry', name: 'Daftar Aset', href: '/hq/assets?tab=registry', icon: Package },
            { id: 'asset-categories', name: 'Kategori', href: '/hq/assets?tab=categories', icon: Layers },
            { id: 'asset-movements', name: 'Mutasi & Transfer', href: '/hq/assets?tab=movements', icon: ArrowRightLeft },
            { id: 'asset-depreciation', name: 'Penyusutan', href: '/hq/assets?tab=depreciation', icon: TrendingUp },
            { id: 'asset-maintenance', name: 'Pemeliharaan', href: '/hq/assets?tab=maintenance', icon: Wrench },
            { id: 'asset-licenses', name: 'Lisensi Perangkat Lunak', href: '/hq/assets?tab=licenses', icon: Shield },
            { id: 'asset-tenancy', name: 'Penyewaan', href: '/hq/assets?tab=tenancy', icon: Building2 },
            { id: 'asset-alerts', name: 'Peringatan', href: '/hq/assets?tab=alerts', icon: AlertCircle },
            { id: 'asset-settings', name: 'Pengaturan', href: '/hq/assets?tab=settings', icon: Settings },
          ]
        }
      ]
    },
    {
      id: 'manufacturing',
      title: 'Manufaktur',
      items: [
        {
          id: 'manufacturing',
          name: 'Manufaktur',
          icon: Factory,
          modules: ['manufacturing'],
          roles: ['super_admin', 'owner', 'hq_admin', 'admin', 'manager'],
          children: [
            { id: 'mfg-dashboard', name: 'Dasbor', href: '/hq/manufacturing', icon: LayoutDashboard },
            { id: 'mfg-work-orders', name: 'Perintah Kerja', href: '/hq/manufacturing?tab=work-orders', icon: ClipboardList },
            { id: 'mfg-bom', name: 'Daftar Material (BOM)', href: '/hq/manufacturing?tab=bom', icon: Layers },
            { id: 'mfg-routings', name: 'Routing Produksi', href: '/hq/manufacturing?tab=routings', icon: Activity },
            { id: 'mfg-work-centers', name: 'Pusat Kerja', href: '/hq/manufacturing?tab=work-centers', icon: Building2 },
            { id: 'mfg-machines', name: 'Mesin & Peralatan', href: '/hq/manufacturing?tab=machines', icon: Cog },
            { id: 'mfg-quality', name: 'Kontrol Kualitas', href: '/hq/manufacturing?tab=quality', icon: Shield },
            { id: 'mfg-planning', name: 'Rencana Produksi', href: '/hq/manufacturing?tab=planning', icon: Calendar },
            { id: 'mfg-oee', name: 'Analitik OEE', href: '/hq/manufacturing?tab=oee', icon: Gauge },
            { id: 'mfg-costs', name: 'Biaya Produksi', href: '/hq/manufacturing?tab=costs', icon: DollarSign },
            { id: 'mfg-maintenance', name: 'Pemeliharaan', href: '/hq/manufacturing?tab=maintenance', icon: Wrench },
            { id: 'mfg-plm', name: 'PLM (Siklus Hidup)', href: '/hq/manufacturing?tab=plm', icon: Layers },
            { id: 'mfg-cogm', name: 'COGM', href: '/hq/manufacturing?tab=cogm', icon: DollarSign },
            { id: 'mfg-subcontract', name: 'Subkontrak', href: '/hq/manufacturing?tab=subcontracting', icon: Truck },
            { id: 'mfg-waste', name: 'Limbah & Sisa', href: '/hq/manufacturing?tab=waste', icon: AlertTriangle },
            { id: 'mfg-fleet-link', name: 'Armada & Distribusi', href: '/hq/fleet?tab=manufacturing', icon: Truck },
            { id: 'mfg-supply-chain', name: 'Supply Chain Terpadu', href: '/hq/fleet?tab=supply-chain', icon: ArrowRightLeft },
            { id: 'mfg-settings', name: 'Pengaturan', href: '/hq/manufacturing?tab=settings', icon: Settings },
          ]
        }
      ]
    },
    {
      id: 'project-management',
      title: 'Manajemen Proyek',
      items: [
        {
          id: 'project-management',
          name: 'Manajemen Proyek',
          icon: Briefcase,
          modules: ['project_management'],
          roles: ['super_admin', 'owner', 'hq_admin', 'admin', 'manager'],
          children: [
            { id: 'pjm-dashboard', name: 'Dasbor', href: '/hq/project-management', icon: LayoutDashboard },
            { id: 'pjm-projects', name: 'Proyek', href: '/hq/project-management?tab=projects', icon: Briefcase },
            { id: 'pjm-tasks', name: 'Tugas', href: '/hq/project-management?tab=tasks', icon: ClipboardList },
            { id: 'pjm-gantt', name: 'Gantt Chart', href: '/hq/project-management/gantt', icon: GitBranch },
            { id: 'pjm-calendar', name: 'Kalender', href: '/hq/project-management?tab=calendar', icon: Calendar },
            { id: 'pjm-sprints', name: 'Sprint', href: '/hq/project-management?tab=sprints', icon: Rocket },
            { id: 'pjm-milestones', name: 'Milestone', href: '/hq/project-management?tab=milestones', icon: Target },
            { id: 'pjm-timesheets', name: 'Lembar Waktu', href: '/hq/project-management?tab=timesheets', icon: Timer },
            { id: 'pjm-workload', name: 'Workload Tim', href: '/hq/project-management?tab=workload', icon: Users },
            { id: 'pjm-resources', name: 'Sumber Daya', href: '/hq/project-management?tab=resources', icon: Layers },
            { id: 'pjm-risks', name: 'Risiko', href: '/hq/project-management?tab=risks', icon: AlertTriangle },
            { id: 'pjm-budgets', name: 'Anggaran', href: '/hq/project-management?tab=budgets', icon: DollarSign },
            { id: 'pjm-evm', name: 'EVM Analytics', href: '/hq/project-management?tab=evm', icon: Activity },
            { id: 'pjm-documents', name: 'Dokumen', href: '/hq/project-management?tab=documents', icon: FileText },
          ]
        }
      ]
    },
    {
      id: 'e-procurement',
      title: 'E-Pengadaan',
      items: [
        {
          id: 'e-procurement',
          name: 'E-Pengadaan',
          icon: ShoppingCart,
          modules: ['e_procurement'],
          roles: ['super_admin', 'owner', 'hq_admin', 'admin', 'manager'],
          children: [
            { id: 'epr-dashboard', name: 'Dasbor', href: '/hq/e-procurement', icon: LayoutDashboard },
            { id: 'epr-vendors', name: 'Vendor', href: '/hq/e-procurement?tab=vendors', icon: Building2 },
            { id: 'epr-requests', name: 'Permintaan', href: '/hq/e-procurement?tab=procurement-requests', icon: ClipboardList },
            { id: 'epr-rfqs', name: 'RFQ', href: '/hq/e-procurement?tab=rfqs', icon: Send },
            { id: 'epr-tenders', name: 'Tender', href: '/hq/e-procurement?tab=tenders', icon: Award },
            { id: 'epr-contracts', name: 'Kontrak', href: '/hq/e-procurement?tab=contracts', icon: FileText },
            { id: 'epr-evaluations', name: 'Evaluasi Vendor', href: '/hq/e-procurement?tab=evaluations', icon: Star },
            { id: 'epr-analytics', name: 'Analitik', href: '/hq/e-procurement?tab=analytics', icon: BarChart3 },
          ]
        }
      ]
    },
    {
      id: 'export-import',
      title: 'Ekspor & Impor',
      items: [
        {
          id: 'export-import',
          name: 'Ekspor-Impor',
          icon: Ship,
          modules: ['export_import'],
          roles: ['super_admin', 'owner', 'hq_admin', 'admin', 'manager'],
          children: [
            { id: 'exim-dashboard', name: 'Dasbor', href: '/hq/export-import', icon: LayoutDashboard },
            { id: 'exim-shipments', name: 'Pengiriman', href: '/hq/export-import?tab=shipments', icon: Ship },
            { id: 'exim-customs', name: 'Kepabeanan', href: '/hq/export-import?tab=customs', icon: Shield },
            { id: 'exim-lcs', name: 'Surat Kredit (L/C)', href: '/hq/export-import?tab=lcs', icon: CreditCard },
            { id: 'exim-containers', name: 'Kontainer', href: '/hq/export-import?tab=containers', icon: Package },
            { id: 'exim-documents', name: 'Dokumen', href: '/hq/export-import?tab=documents', icon: FileText },
            { id: 'exim-partners', name: 'Mitra', href: '/hq/export-import?tab=partners', icon: Building2 },
            { id: 'exim-costs', name: 'Biaya', href: '/hq/export-import?tab=costs', icon: DollarSign },
            { id: 'exim-hs-codes', name: 'Kode HS', href: '/hq/export-import?tab=hs-codes', icon: Scan },
            { id: 'exim-analytics', name: 'Analitik', href: '/hq/export-import?tab=analytics', icon: BarChart3 },
          ]
        }
      ]
    },
    {
      id: 'hr',
      title: 'SDM & HRIS',
      items: [
        { 
          id: 'users',
          name: 'Pengguna', 
          icon: Users,
          modules: ['users'],
          roles: ['super_admin', 'owner', 'hq_admin'],
          children: [
            { id: 'user-all', name: 'Semua Pengguna', href: '/hq/users', icon: Users },
            { id: 'user-roles', name: 'Role & Akses', href: '/hq/users/roles', icon: Shield },
            { id: 'user-perm-explorer', name: 'Permission Explorer', href: '/hq/users/permissions-explorer', icon: Sparkles },
            { id: 'user-managers', name: 'Manajer Cabang', href: '/hq/users/managers', icon: UserCog },
          ]
        },
        { 
          id: 'hris',
          name: 'HRIS', 
          icon: UserCheck,
          modules: ['hris'],
          roles: ['super_admin', 'owner', 'hq_admin', 'hr_staff'],
          children: [
            { id: 'hris-dashboard', name: 'Dasbor HRIS', href: '/hq/hris', icon: LayoutDashboard },
            { id: 'hris-calendar', name: 'Kalender HR', href: '/hq/hris/calendar', icon: Calendar },
            { id: 'hris-announcements', name: 'Pengumuman', href: '/hq/hris/announcements', icon: Megaphone },
            // Database & struktur
            { id: 'hris-employees', name: 'Database Karyawan', href: '/hq/hris/employees', icon: Users },
            { id: 'hris-organization', name: 'Struktur Organisasi', href: '/hq/hris/organization', icon: Network },
            { id: 'hris-onboarding', name: 'Onboarding', href: '/hq/hris/onboarding', icon: UserPlus },
            { id: 'hris-offboarding', name: 'Offboarding / Exit', href: '/hq/hris/offboarding', icon: KeyRound },
            { id: 'hris-contracts', name: 'Kontrak & Reminder', href: '/hq/hris/contracts', icon: FileText },
            // Kehadiran & shift
            { id: 'hris-attendance', name: 'Kehadiran & Absensi', href: '/hq/hris/attendance', icon: CalendarCheck },
            { id: 'hris-attendance-mgmt', name: 'Jadwal & Shift', href: '/hq/hris/attendance-management', icon: Timer },
            { id: 'hris-attendance-devices', name: 'Kelola Perangkat', href: '/hq/hris/attendance/devices', icon: Fingerprint },
            { id: 'hris-leave', name: 'Manajemen Cuti', href: '/hq/hris/leave', icon: CalendarDays },
            // Kinerja
            { id: 'hris-kpi', name: 'KPI Karyawan', href: '/hq/hris/kpi', icon: Target },
            { id: 'hris-kpi-settings', name: 'Pengaturan KPI', href: '/hq/hris/kpi-settings', icon: Settings },
            { id: 'hris-performance', name: 'Penilaian Kinerja', href: '/hq/hris/performance', icon: Award },
            { id: 'hris-engagement', name: 'Keterlibatan & Budaya', href: '/hq/hris/engagement', icon: MessageCircle },
            // Payroll
            { id: 'hris-payroll', name: 'Penggajian', href: '/hq/hris/payroll', icon: Banknote },
            { id: 'hris-payroll-main', name: 'Proses Gaji', href: '/hq/hris/payroll/main', icon: Calculator },
            { id: 'hris-payroll-slip', name: 'Slip Gaji', href: '/hq/hris/payroll/slip-gaji', icon: FileText },
            { id: 'hris-payroll-thr', name: 'THR', href: '/hq/hris/payroll/thr', icon: Gift },
            { id: 'hris-payroll-pph21', name: 'PPh 21', href: '/hq/hris/payroll/pph21', icon: Percent },
            { id: 'hris-payroll-bpjs', name: 'BPJS', href: '/hq/hris/payroll/bpjs', icon: Shield },
            { id: 'hris-payroll-lembur', name: 'Lembur', href: '/hq/hris/payroll/lembur', icon: Clock },
            { id: 'hris-payroll-laporan', name: 'Laporan Gaji', href: '/hq/hris/payroll/laporan', icon: BarChart3 },
            // Self-service
            { id: 'hris-ess', name: 'Layanan Mandiri Karyawan', href: '/hq/hris/ess', icon: Heart },
            { id: 'hris-mss', name: 'Layanan Mandiri Manajer', href: '/hq/hris/mss', icon: Shield },
            // Rekrutmen & training
            { id: 'hris-recruitment', name: 'Rekrutmen', href: '/hq/hris/recruitment', icon: UserPlus },
            { id: 'hris-training', name: 'Program Training', href: '/hq/hris/training', icon: GraduationCap },
            { id: 'hris-training-dev', name: 'Pelatihan & Pengembangan', href: '/hq/hris/training-development', icon: BookOpen },
            { id: 'hris-training-scoring', name: 'Skor & Penilaian Training', href: '/hq/hris/training-scoring', icon: PenTool },
            // Lainnya
            { id: 'hris-travel', name: 'Perjalanan & Biaya', href: '/hq/hris/travel-expense', icon: Plane },
            { id: 'hris-project', name: 'Manajemen Proyek', href: '/hq/hris/project-management', icon: Briefcase },
            { id: 'hris-ir', name: 'Hubungan Industrial', href: '/hq/hris/industrial-relations', icon: AlertTriangle },
            { id: 'hris-workforce', name: 'Analitik Tenaga Kerja', href: '/hq/hris/workforce-analytics', icon: BarChart3 },
          ]
        }
      ]
    },
    {
      id: 'sales-marketing',
      title: 'Penjualan & Pemasaran',
      items: [
        {
          id: 'sfa',
          name: 'CRM & Tenaga Penjualan',
          icon: Briefcase,
          modules: ['crm', 'sfa'],
          roles: ['super_admin', 'owner', 'hq_admin', 'admin', 'manager', 'staff'],
          children: [
            { id: 'sfa-dashboard', name: 'Dasbor CRM', href: '/hq/sfa', icon: LayoutDashboard, modules: ['crm', 'sfa'] },
            { id: 'sfa-leads', name: 'Prospek & Pipeline', href: '/hq/sfa', icon: TrendingUp, modules: ['sfa'] },
            { id: 'crm-customers', name: 'Pelanggan 360°', href: '/hq/sfa', icon: Heart, modules: ['crm'] },
            { id: 'crm-communications', name: 'Komunikasi', href: '/hq/sfa', icon: MessageCircle, modules: ['crm'] },
            { id: 'crm-tasks', name: 'Tugas & Kalender', href: '/hq/sfa', icon: CalendarCheck, modules: ['crm'] },
            { id: 'crm-forecasting', name: 'Peramalan', href: '/hq/sfa', icon: TrendingUp, modules: ['crm'] },
            { id: 'crm-tickets', name: 'Tiket & SLA', href: '/hq/sfa', icon: Ticket, modules: ['crm'] },
            { id: 'crm-automation', name: 'Otomasi', href: '/hq/sfa', icon: Network, modules: ['crm'], roles: ['super_admin', 'owner', 'hq_admin', 'admin', 'manager'] },
            { id: 'sfa-teams', name: 'Tim & Wilayah', href: '/hq/sfa', icon: Users, modules: ['sfa'] },
            { id: 'sfa-visits', name: 'Kunjungan & Cakupan', href: '/hq/sfa', icon: Navigation, modules: ['sfa'] },
            { id: 'sfa-orders', name: 'Pesanan & Penawaran', href: '/hq/sfa', icon: ShoppingCart, modules: ['sfa'] },
            { id: 'sfa-sales-mgmt', name: 'Manajemen Penjualan', href: '/hq/sfa', icon: ShoppingCart, modules: ['sfa'] },
            { id: 'sfa-targets', name: 'Target & Pencapaian', href: '/hq/sfa', icon: Target, modules: ['sfa'], roles: ['super_admin', 'owner', 'hq_admin', 'admin', 'manager'] },
            { id: 'sfa-incentives', name: 'Insentif & Komisi', href: '/hq/sfa', icon: Award, modules: ['sfa'], roles: ['super_admin', 'owner', 'hq_admin', 'admin', 'manager'] },
            { id: 'sfa-intelligence', name: 'Merchandising & Kompetitor', href: '/hq/sfa', icon: ClipboardList, modules: ['sfa'] },
            { id: 'sfa-approval', name: 'Survei & Persetujuan', href: '/hq/sfa', icon: Shield, modules: ['sfa'], roles: ['super_admin', 'owner', 'hq_admin', 'admin', 'manager'] },
            { id: 'sfa-settings', name: 'Pengaturan', href: '/hq/sfa', icon: Settings, modules: ['crm', 'sfa'], roles: ['super_admin', 'owner', 'hq_admin', 'admin', 'manager'] },
            { id: 'sfa-import-export', name: 'Impor / Ekspor', href: '/hq/sfa', icon: FileSpreadsheet, modules: ['crm', 'sfa'] },
          ]
        },
        {
          id: 'marketing',
          name: 'Pemasaran & Kampanye',
          icon: Megaphone,
          modules: ['marketing'],
          roles: ['super_admin', 'owner', 'hq_admin'],
          children: [
            { id: 'mkt-dashboard', name: 'Dasbor Pemasaran', href: '/hq/marketing', icon: LayoutDashboard },
            { id: 'mkt-campaigns', name: 'Kampanye', href: '/hq/marketing', icon: Megaphone },
            { id: 'mkt-promotions', name: 'Promosi', href: '/hq/marketing', icon: Gift },
            { id: 'mkt-segments', name: 'Segmentasi Pelanggan', href: '/hq/marketing', icon: Users },
            { id: 'mkt-budgets', name: 'Anggaran Pemasaran', href: '/hq/marketing', icon: DollarSign },
          ]
        }
      ]
    },
    {
      id: 'finance',
      title: 'Keuangan',
      items: [
        { 
          id: 'finance-lite',
          name: 'Keuangan Ringkas', 
          icon: Wallet,
          modules: ['finance_lite'],
          roles: ['super_admin', 'owner', 'hq_admin', 'finance_staff'],
          children: [
            { id: 'finlite-transactions', name: 'Daftar Transaksi', href: '/hq/finance/transactions', icon: Receipt },
            { id: 'finlite-daily', name: 'Ringkasan Harian', href: '/hq/finance/daily', icon: BarChart3 },
          ]
        },
        { 
          id: 'finance-pro',
          name: 'Keuangan Lengkap', 
          icon: Wallet,
          modules: ['finance_pro'],
          roles: ['super_admin', 'owner', 'hq_admin', 'finance_staff'],
          children: [
            { id: 'fin-dashboard', name: 'Dasbor Keuangan', href: '/hq/finance', icon: LayoutDashboard },
            { id: 'fin-revenue', name: 'Analisis Pendapatan', href: '/hq/finance/revenue', icon: TrendingUp },
            { id: 'fin-expenses', name: 'Pengeluaran', href: '/hq/finance/expenses', icon: CreditCard },
            { id: 'fin-pl', name: 'Laba Rugi', href: '/hq/finance/profit-loss', icon: FileSpreadsheet },
            { id: 'fin-cashflow', name: 'Arus Kas', href: '/hq/finance/cash-flow', icon: ArrowRightLeft },
            { id: 'fin-invoices', name: 'Faktur', href: '/hq/finance/invoices', icon: FileText },
            { id: 'fin-accounts', name: 'Piutang & Hutang', href: '/hq/finance/accounts', icon: Receipt },
            { id: 'fin-budget', name: 'Anggaran', href: '/hq/finance/budget', icon: PiggyBank },
            { id: 'fin-tax', name: 'Pajak', href: '/hq/finance/tax', icon: Calculator },
            { id: 'fin-ai-guardian', name: 'Penjaga AI', href: '/hq/finance/ai-guardian', icon: Brain },
          ]
        }
      ]
    },
    {
      id: 'reports',
      title: 'Laporan & Audit',
      items: [
        { 
          id: 'reports',
          name: 'Laporan', 
          icon: BarChart3,
          modules: ['reports'],
          children: [
            { id: 'rep-hub', name: 'Pusat Laporan', href: '/hq/reports', icon: BarChart3 },
            { id: 'rep-sales', name: 'Laporan Penjualan', href: '/hq/reports/sales', icon: TrendingUp },
            { id: 'rep-consolidated', name: 'Laporan Konsolidasi', href: '/hq/reports/consolidated', icon: FileBarChart },
            { id: 'rep-inventory', name: 'Laporan Stok', href: '/hq/reports/inventory', icon: Package },
            { id: 'rep-finance', name: 'Laporan Keuangan', href: '/hq/reports/finance', icon: DollarSign },
            { id: 'rep-customers', name: 'Laporan Pelanggan', href: '/hq/reports/customers', icon: Users },
            { id: 'rep-hris', name: 'Laporan SDM', href: '/hq/reports/hris', icon: UserCheck },
            { id: 'rep-procurement', name: 'Laporan Pengadaan', href: '/hq/reports/procurement', icon: Truck },
            { id: 'rep-data-analysis', name: 'Olah Data & Analisis', href: '/hq/reports/data-analysis', icon: Activity },
          ]
        },
        { 
          id: 'audit',
          name: 'Log Audit', 
          href: '/hq/audit-logs', 
          icon: History,
          modules: ['audit'],
          roles: ['super_admin', 'owner', 'hq_admin']
        }
      ]
    },
    {
      id: 'integrations',
      title: 'Integrasi',
      items: [
        {
          id: 'whatsapp',
          name: 'WhatsApp Bisnis',
          icon: MessageCircle,
          modules: ['whatsapp_business'],
          roles: ['super_admin', 'owner', 'hq_admin'],
          children: [
            { id: 'wa-dashboard', name: 'Dasbor WA', href: '/hq/whatsapp', icon: LayoutDashboard },
            { id: 'wa-broadcast', name: 'Siaran', href: '/hq/whatsapp/broadcast', icon: Bell },
            { id: 'wa-templates', name: 'Templat Pesan', href: '/hq/whatsapp/templates', icon: FileText },
            { id: 'wa-settings', name: 'Pengaturan WA', href: '/hq/whatsapp/settings', icon: Settings },
          ]
        },
        {
          id: 'marketplace',
          name: 'Marketplace',
          icon: ShoppingBag,
          modules: ['marketplace_integration'],
          roles: ['super_admin', 'owner', 'hq_admin'],
          children: [
            { id: 'mp-dashboard', name: 'Dasbor Marketplace', href: '/hq/marketplace', icon: LayoutDashboard },
            { id: 'mp-channels', name: 'Kanal Toko', href: '/hq/marketplace/channels', icon: Store },
            { id: 'mp-products', name: 'Sinkron Produk', href: '/hq/marketplace/products', icon: Package },
            { id: 'mp-orders', name: 'Pesanan Marketplace', href: '/hq/marketplace/orders', icon: ShoppingCart },
            { id: 'mp-settings', name: 'Pengaturan', href: '/hq/marketplace/settings', icon: Settings },
          ]
        }
      ]
    },
    {
      id: 'website-builder',
      title: 'Website Builder',
      items: [
        {
          id: 'website-builder',
          name: 'Website Builder',
          icon: Code2,
          modules: ['website_builder'],
          roles: ['super_admin', 'owner', 'hq_admin', 'admin', 'manager'],
          children: [
            { id: 'wb-pages', name: 'Halaman Saya', href: '/hq/website-builder', icon: FileText },
            { id: 'wb-editor', name: 'Buka Editor', href: '/hq/website-builder/editor', icon: PenTool },
          ]
        }
      ]
    },
    {
      id: 'knowledge',
      title: 'Basis Pengetahuan',
      items: [
        {
          id: 'knowledge-base',
          name: 'Basis Pengetahuan',
          icon: BookOpen,
          modules: ['knowledge_base'],
          roles: ['super_admin', 'owner', 'hq_admin', 'admin', 'manager', 'staff'],
          children: [
            { id: 'kb-index', name: 'Daftar Artikel', href: '/hq/knowledge-base', icon: BookOpen },
          ]
        }
      ]
    },
    {
      id: 'settings',
      title: 'Pengaturan',
      items: [
        { 
          id: 'settings',
          name: 'Pengaturan', 
          icon: Settings,
          modules: ['settings'],
          children: [
            { id: 'set-modules', name: 'Kelola Modul', href: '/hq/settings/modules', icon: Package },
            { id: 'set-global', name: 'Pengaturan Global', href: '/hq/settings', icon: Globe },
            { id: 'set-integrations', name: 'Integrasi Pihak Ketiga', href: '/hq/settings/integrations', icon: Plug },
            { id: 'set-taxes', name: 'Pajak & Biaya', href: '/hq/settings/taxes', icon: FileText },
            { id: 'set-notifications', name: 'Notifikasi', href: '/hq/settings/notifications', icon: Bell },
            { id: 'set-billing', name: 'Info Tagihan', href: '/hq/billing-info', icon: CreditCard },
          ]
        },
        {
          id: 'module-management',
          name: 'Manajemen Modul',
          icon: Package,
          modules: ['settings'],
          roles: ['super_admin', 'owner', 'hq_admin'],
          children: [
            { id: 'mod-analytics', name: 'Analitik Modul', href: '/hq/modules/analytics', icon: BarChart3 },
            { id: 'mod-config', name: 'Konfigurasi', href: '/hq/modules/configuration', icon: Settings },
            { id: 'mod-features', name: 'Fitur', href: '/hq/modules/features', icon: Layers },
            { id: 'mod-flows', name: 'Alur Kerja', href: '/hq/modules/flows', icon: Activity },
          ]
        }
      ]
    }
  ]
};

// ============================================
// BRANCH SIDEBAR CONFIGURATION
// ============================================
export const branchSidebarConfig: SidebarConfig = {
  layout: 'branch',
  logo: {
    icon: Store,
    title: 'BEDAGANG',
    href: '/dashboard'
  },
  groups: [
    {
      id: 'outlet',
      title: 'OUTLET',
      items: [
        { id: 'dashboard', name: 'Dasbor', href: '/dashboard', icon: LayoutDashboard, modules: ['dashboard'] },
        { id: 'pos', name: 'Kasir', href: '/pos', icon: ShoppingCart, modules: ['pos'] },
        { id: 'inventory', name: 'Inventori', href: '/inventory', icon: Package, modules: ['inventory'] },
        { id: 'customers', name: 'Pelanggan', href: '/customers', icon: Users, modules: ['customers'] },
        {
          id: 'employees',
          name: 'Karyawan',
          icon: Users,
          modules: ['employees'],
          children: [
            { id: 'employees-schedules', name: 'Jadwal & Shift', href: '/employees/schedules', icon: CalendarDays },
            { id: 'employees-mobile', name: 'Aplikasi Mobile Karyawan', href: '/employee', icon: Smartphone },
          ]
        },
        { id: 'loyalty', name: 'Program Loyalitas', href: '/loyalty-program', icon: Award, modules: ['loyalty'] },
      ]
    },
    {
      id: 'operations',
      title: 'OPERASIONAL',
      items: [
        { id: 'tables', name: 'Manajemen Meja', href: '/tables', icon: Utensils, modules: ['tables'] },
        { id: 'reservations', name: 'Reservasi', href: '/reservations', icon: Calendar, modules: ['reservations'] },
        { id: 'kitchen', name: 'Manajemen Dapur', href: '/kitchen', icon: ChefHat, modules: ['kitchen'] },
        { id: 'promo', name: 'Promo & Voucher', href: '/promo-voucher', icon: Ticket, modules: ['promo'] },
        {
          id: 'fleet',
          name: 'Pusat Kendali Armada',
          icon: Truck,
          modules: ['fms', 'tms', 'fleet'],
          roles: ['super_admin', 'owner', 'admin', 'manager'],
          children: [
            { id: 'fleet-command', name: 'Pusat Kendali Unified', href: '/hq/fleet', icon: LayoutDashboard },
            { id: 'fleet-fms', name: 'FMS Operasional', href: '/hq/fms', icon: Gauge },
            { id: 'fleet-tms', name: 'TMS Transportasi', href: '/hq/tms', icon: Send },
            { id: 'fleet-vehicles', name: 'Kendaraan', href: '/hq/fms?tab=vehicles', icon: Truck },
            { id: 'fleet-drivers', name: 'Pengemudi', href: '/hq/fms?tab=drivers', icon: Users },
            { id: 'fleet-shipments', name: 'Pengiriman', href: '/hq/tms?tab=shipments', icon: Package },
            { id: 'fleet-gps', name: 'GPS Live', href: '/hq/fms?tab=gps', icon: Navigation },
            { id: 'fleet-costs', name: 'Biaya & Billing', href: '/hq/fms?tab=costs', icon: DollarSign },
            { id: 'fleet-supply-chain', name: 'Supply Chain Armada', href: '/hq/fleet?tab=supply-chain', icon: ArrowRightLeft },
            { id: 'fleet-manufacturing', name: 'Integrasi Manufaktur', href: '/hq/fleet?tab=manufacturing', icon: Factory },
            { id: 'fleet-inventory-link', name: 'Integrasi Inventory', href: '/hq/fleet?tab=inventory', icon: Warehouse },
          ]
        },
      ]
    },
    {
      id: 'backoffice',
      title: 'KANTOR BELAKANG',
      items: [
        { id: 'finance', name: 'Keuangan', href: '/finance', icon: Wallet, modules: ['finance'] },
        { id: 'reports', name: 'Laporan', href: '/reports', icon: BarChart3, modules: ['reports'] },
        { id: 'settings', name: 'Pengaturan', href: '/settings', icon: Settings, modules: ['settings'] },
      ]
    }
  ]
};

// ============================================
// ADMIN SIDEBAR CONFIGURATION  
// ============================================
export const adminSidebarConfig: SidebarConfig = {
  layout: 'admin',
  logo: {
    icon: Shield,
    title: 'Bedagang',
    subtitle: 'Panel Admin',
    href: '/admin/dashboard'
  },
  groups: [
    {
      id: 'main',
      title: 'Utama',
      items: [
        { id: 'dashboard', name: 'Dasbor', href: '/admin/dashboard', icon: LayoutDashboard },
        { id: 'tenants', name: 'Penyewa', href: '/admin/tenants', icon: Building2 },
        { id: 'users', name: 'Pengguna', href: '/admin/users', icon: Users },
        { id: 'modules', name: 'Modul', href: '/admin/modules', icon: Package },
        { id: 'business-types', name: 'Tipe Bisnis', href: '/admin/business-types', icon: Store },
      ]
    },
    {
      id: 'system',
      title: 'Sistem',
      items: [
        { id: 'logs', name: 'Log Sistem', href: '/admin/logs', icon: FileText },
        { id: 'settings', name: 'Pengaturan', href: '/admin/settings', icon: Settings },
      ]
    }
  ]
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getSidebarConfig(layout: LayoutType): SidebarConfig {
  switch (layout) {
    case 'hq':
      return hqSidebarConfig;
    case 'branch':
      return branchSidebarConfig;
    case 'admin':
      return adminSidebarConfig;
    default:
      return branchSidebarConfig;
  }
}

export function filterMenuByRole(items: MenuItem[], userRole?: UserRole): MenuItem[] {
  if (!userRole) return items;
  
  // Super admin and owner see everything
  if (userRole === 'super_admin' || userRole === 'owner') {
    return items;
  }

  return items.filter(item => {
    // If no roles specified, show to everyone
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    return item.roles.includes(userRole);
  }).map(item => {
    // Recursively filter children
    if (item.children) {
      return {
        ...item,
        children: filterMenuByRole(item.children, userRole)
      };
    }
    return item;
  }).filter(item => {
    // Remove items with no children after filtering
    if (item.children && item.children.length === 0) {
      return false;
    }
    return true;
  });
}

export function filterMenuByModules(
  items: MenuItem[], 
  enabledModules: ModuleCode[],
  userRole?: UserRole
): MenuItem[] {
  // Super admin and owner see everything
  if (userRole === 'super_admin' || userRole === 'owner') {
    return items;
  }

  return items.filter(item => {
    // If no modules specified, show to everyone
    if (!item.modules || item.modules.length === 0) {
      return true;
    }
    // Check if any of the item's modules are enabled
    return item.modules.some(mod => enabledModules.includes(mod));
  }).map(item => {
    // Recursively filter children
    if (item.children) {
      return {
        ...item,
        children: filterMenuByModules(item.children, enabledModules, userRole)
      };
    }
    return item;
  }).filter(item => {
    // Remove items with no children after filtering
    if (item.children && item.children.length === 0) {
      return false;
    }
    return true;
  });
}

export function filterSidebarConfig(
  config: SidebarConfig,
  userRole?: UserRole,
  enabledModules?: ModuleCode[]
): SidebarConfig {
  const filteredGroups = config.groups
    .filter(group => {
      // Filter groups by role if specified
      if (group.roles && group.roles.length > 0 && userRole) {
        if (userRole !== 'super_admin' && userRole !== 'owner') {
          if (!group.roles.includes(userRole)) {
            return false;
          }
        }
      }
      return true;
    })
    .map(group => {
      let filteredItems = group.items;

      // Filter by role
      if (userRole) {
        filteredItems = filterMenuByRole(filteredItems, userRole);
      }

      // Filter by modules
      if (enabledModules && enabledModules.length > 0) {
        filteredItems = filterMenuByModules(filteredItems, enabledModules, userRole);
      }

      return {
        ...group,
        items: filteredItems
      };
    })
    .filter(group => group.items.length > 0); // Remove empty groups

  return {
    ...config,
    groups: filteredGroups
  };
}

export function flattenMenuItems(groups: MenuGroup[]): MenuItem[] {
  const items: MenuItem[] = [];
  
  groups.forEach(group => {
    group.items.forEach(item => {
      items.push(item);
      if (item.children) {
        items.push(...item.children);
      }
    });
  });
  
  return items;
}

export function findActiveMenuItem(groups: MenuGroup[], pathname: string, query?: Record<string, string | string[] | undefined>): MenuItem | undefined {
  const allItems = flattenMenuItems(groups);
  // First try exact match including query params
  if (query) {
    const qMatch = allItems.find(item => {
      if (!item.href || !item.href.includes('?')) return false;
      const [path, qs] = item.href.split('?');
      if (pathname !== path) return false;
      const params = new URLSearchParams(qs);
      for (const [k, v] of params.entries()) {
        if (query[k] !== v) return false;
      }
      return true;
    });
    if (qMatch) return qMatch;
  }
  // Fallback to pathname-only match (no tab query active)
  return allItems.find(item => {
    if (!item.href) return false;
    if (item.href.includes('?')) return false; // skip query-based items for pathname-only match
    return pathname === item.href || pathname.startsWith(item.href + '/');
  });
}

export function getParentMenuItem(groups: MenuGroup[], childId: string): MenuItem | undefined {
  for (const group of groups) {
    for (const item of group.items) {
      if (item.children) {
        const child = item.children.find(c => c.id === childId);
        if (child) {
          return item;
        }
      }
    }
  }
  return undefined;
}
