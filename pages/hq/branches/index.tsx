import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '@/lib/i18n';
import HQLayout from '../../../components/hq/HQLayout';
import DataTable, { Column } from '../../../components/hq/ui/DataTable';
import Modal, { ConfirmDialog } from '../../../components/hq/ui/Modal';
import { StatusBadge } from '../../../components/hq/ui';
import { toast } from 'react-hot-toast';
import {
  Building2, Plus, MapPin, User, Edit, Trash2, Eye, Settings, TrendingUp, Package, Users,
  CheckCircle, XCircle, AlertTriangle, ExternalLink, Power, Download, Upload, RefreshCw,
  BarChart3, Heart, Activity, Wifi, WifiOff, DollarSign, Layers, ShoppingCart, Truck,
  ClipboardList, LayoutDashboard, Warehouse, Award, Zap, Bell, X, Receipt, Gauge, UserCheck, FileText
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// ─── Types ───
interface Branch {
  id: string; code: string; name: string; type: 'main' | 'branch' | 'warehouse' | 'kiosk';
  address: string; city: string; province: string; phone: string; email: string; region?: string;
  manager: { id: string; name: string; email: string } | null;
  isActive: boolean; priceTierId: string | null; priceTierName: string | null;
  createdAt: string; lastSync: string; syncStatus?: string; status: 'online' | 'offline' | 'warning';
  stats: { todaySales: number; monthSales: number; employeeCount: number; lowStockItems: number };
  setupStatus?: 'pending' | 'in_progress' | 'completed' | 'skipped' | null; setupProgress?: number;
  healthScore?: number; healthGrade?: string;
  pos?: { todaySales: number; monthSales: number; todayTx: number; monthTx: number };
  inventory?: { lowStock: number; totalProducts: number; stockValue: number };
  hris?: { totalEmployees: number; activeEmployees: number };
}
interface IntegratedSummary {
  totalBranches: number; activeBranches: number; onlineBranches: number;
  totalTodaySales: number; totalMonthSales: number; totalTodayTx: number;
  totalLowStock: number; totalEmployees: number; totalStockValue: number;
}
interface BranchDetail {
  branch: any; pos: { summary: any; dailySales: any[]; paymentMethods: any[]; topProducts: any[] };
  inventory: { summary: any; lowStockItems: any[]; transfers: any[] };
  hris: { employees: any[]; users: any[]; attendance: any[]; totalEmployees: number; totalUsers: number };
  finance: { monthlyRevenue: any[] }; modules: any[];
}

// ─── Constants ───
const TABS = [
  { key: 'dashboard', label: 'Dasbor', icon: LayoutDashboard },
  { key: 'branches', label: 'Daftar Cabang', icon: Building2 },
  { key: 'ranking', label: 'Peringkat', icon: Award },
  { key: 'inventory', label: 'Inventori', icon: Package },
  { key: 'finance', label: 'Keuangan', icon: DollarSign },
  { key: 'hris', label: 'Karyawan', icon: Users },
  { key: 'pos', label: 'POS & Penjualan', icon: ShoppingCart },
  { key: 'procurement', label: 'Pengadaan', icon: Truck },
  { key: 'analytics', label: 'Analitik', icon: BarChart3 },
];
const INDUSTRY_OPTIONS = [
  { value: 'general', label: 'Umum / Multi-Industri' }, { value: 'fnb', label: 'Makanan & Minuman' },
  { value: 'retail', label: 'Ritel' }, { value: 'pharmacy', label: 'Farmasi & Kesehatan' },
];

// ─── Import schema ───
interface ImportFieldDef { key: string; label: string; required: boolean; example: string; description: string; allowed?: string[]; }
const IMPORT_FIELDS: ImportFieldDef[] = [
  { key: 'code', label: 'Kode', required: true, example: 'BR-001', description: 'Kode unik cabang (max 20 karakter). Jika sudah ada → update.' },
  { key: 'name', label: 'Nama', required: true, example: 'Cabang Jakarta Pusat', description: 'Nama cabang yang tampil di aplikasi.' },
  { key: 'type', label: 'Tipe', required: false, example: 'branch', description: 'Jenis cabang. Kosongkan untuk default "branch".', allowed: ['main','branch','warehouse','kiosk'] },
  { key: 'address', label: 'Alamat', required: false, example: 'Jl. Sudirman No. 123', description: 'Alamat lengkap cabang.' },
  { key: 'city', label: 'Kota', required: false, example: 'Jakarta Selatan', description: 'Kota / Kabupaten.' },
  { key: 'province', label: 'Provinsi', required: false, example: 'DKI Jakarta', description: 'Provinsi.' },
  { key: 'region', label: 'Region', required: false, example: 'Jabodetabek', description: 'Region / area regional (opsional).' },
  { key: 'phone', label: 'Telepon', required: false, example: '021-5551234', description: 'Nomor telepon cabang.' },
  { key: 'email', label: 'Email', required: false, example: 'jakarta@perusahaan.com', description: 'Email cabang; divalidasi formatnya.' },
];

// Robust CSV parser that handles quoted values (including commas inside quotes and "" escapes)
function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[]; error?: string } {
  const cleaned = text.replace(/^\uFEFF/, '');
  const lines: string[][] = [];
  let current: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inQuotes) {
      if (ch === '"') {
        if (cleaned[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else { field += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { current.push(field); field = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && cleaned[i + 1] === '\n') i++;
        current.push(field); field = '';
        if (current.some(v => v.length > 0)) lines.push(current);
        current = [];
      } else { field += ch; }
    }
  }
  if (field.length > 0 || current.length > 0) { current.push(field); if (current.some(v => v.length > 0)) lines.push(current); }
  if (lines.length < 1) return { headers: [], rows: [], error: 'File kosong' };
  const headers = lines[0].map(h => h.trim());
  const rows = lines.slice(1).map(cols => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = (cols[i] ?? '').trim(); });
    return obj;
  }).filter(r => Object.values(r).some(v => v && v.length > 0));
  return { headers, rows };
}

function toCSVCell(v: any): string {
  const s = (v ?? '').toString();
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const PIE_COLORS = ['#6366F1', '#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'];

// ─── Mock Data ───
const MOCK_BRANCHES: Branch[] = [
  { id:'1',code:'HQ-001',name:'Kantor Pusat Jakarta',type:'main',address:'Jl. Sudirman No. 123',city:'Jakarta Selatan',province:'DKI Jakarta',phone:'021-5551234',email:'pusat@bedagang.com',isActive:true,status:'online',syncStatus:'synced',lastSync:new Date().toISOString(),priceTierId:'t1',priceTierName:'Standar',manager:{id:'1',name:'Ahmad Wijaya',email:'ahmad@b.com'},stats:{todaySales:48500000,monthSales:1350000000,employeeCount:25,lowStockItems:3},setupStatus:'completed',setupProgress:100,healthScore:95,healthGrade:'A',createdAt:'2024-01-15',pos:{todaySales:48500000,monthSales:1350000000,todayTx:142,monthTx:4280},inventory:{lowStock:3,totalProducts:450,stockValue:820000000},hris:{totalEmployees:25,activeEmployees:24} },
  { id:'2',code:'BR-002',name:'Cabang Bandung',type:'branch',address:'Jl. Braga No. 45',city:'Bandung',province:'Jawa Barat',phone:'022-4201234',email:'bandung@b.com',isActive:true,status:'online',syncStatus:'synced',lastSync:new Date().toISOString(),priceTierId:'t2',priceTierName:'Jabar',manager:{id:'2',name:'Siti Rahayu',email:'siti@b.com'},stats:{todaySales:35200000,monthSales:980000000,employeeCount:18,lowStockItems:7},setupStatus:'completed',setupProgress:100,healthScore:84,healthGrade:'B',createdAt:'2024-03-10',pos:{todaySales:35200000,monthSales:980000000,todayTx:98,monthTx:3120},inventory:{lowStock:7,totalProducts:380,stockValue:520000000},hris:{totalEmployees:18,activeEmployees:18} },
  { id:'3',code:'BR-003',name:'Cabang Surabaya',type:'branch',address:'Jl. Tunjungan No. 78',city:'Surabaya',province:'Jawa Timur',phone:'031-5459876',email:'sby@b.com',isActive:true,status:'warning',syncStatus:'pending',lastSync:new Date(Date.now()-7200000).toISOString(),priceTierId:'t3',priceTierName:'Jatim',manager:{id:'3',name:'Budi Santoso',email:'budi@b.com'},stats:{todaySales:29800000,monthSales:820000000,employeeCount:15,lowStockItems:14},setupStatus:'completed',setupProgress:100,healthScore:68,healthGrade:'C',createdAt:'2024-04-22',pos:{todaySales:29800000,monthSales:820000000,todayTx:87,monthTx:2780},inventory:{lowStock:14,totalProducts:350,stockValue:430000000},hris:{totalEmployees:15,activeEmployees:15} },
  { id:'4',code:'BR-004',name:'Cabang Medan',type:'branch',address:'Jl. Gatot Subroto 56',city:'Medan',province:'Sumatera Utara',phone:'061-456',email:'medan@b.com',isActive:true,status:'online',syncStatus:'synced',lastSync:new Date().toISOString(),priceTierId:'t4',priceTierName:'Sumut',manager:{id:'4',name:'Dewi Lestari',email:'dewi@b.com'},stats:{todaySales:24500000,monthSales:710000000,employeeCount:12,lowStockItems:9},setupStatus:'completed',setupProgress:100,healthScore:79,healthGrade:'B',createdAt:'2024-06-01',pos:{todaySales:24500000,monthSales:710000000,todayTx:72,monthTx:2150},inventory:{lowStock:9,totalProducts:280,stockValue:350000000},hris:{totalEmployees:12,activeEmployees:12} },
  { id:'5',code:'BR-005',name:'Cabang Bali',type:'branch',address:'Jl. Sunset Road 88',city:'Denpasar',province:'Bali',phone:'0361-765',email:'bali@b.com',isActive:true,status:'online',syncStatus:'synced',lastSync:new Date().toISOString(),priceTierId:'t5',priceTierName:'Bali',manager:{id:'6',name:'Made Wirawan',email:'made@b.com'},stats:{todaySales:38700000,monthSales:1050000000,employeeCount:14,lowStockItems:4},setupStatus:'completed',setupProgress:100,healthScore:88,healthGrade:'B',createdAt:'2024-07-15',pos:{todaySales:38700000,monthSales:1050000000,todayTx:115,monthTx:3420},inventory:{lowStock:4,totalProducts:320,stockValue:480000000},hris:{totalEmployees:14,activeEmployees:14} },
  { id:'6',code:'BR-006',name:'Cabang Makassar',type:'branch',address:'Jl. Penghibur 12',city:'Makassar',province:'Sulawesi Selatan',phone:'0411-332',email:'makassar@b.com',isActive:true,status:'offline',syncStatus:'failed',lastSync:new Date(Date.now()-86400000).toISOString(),priceTierId:null,priceTierName:null,manager:{id:'7',name:'Andi Pratama',email:'andi@b.com'},stats:{todaySales:0,monthSales:520000000,employeeCount:10,lowStockItems:18},setupStatus:'completed',setupProgress:100,healthScore:42,healthGrade:'D',createdAt:'2024-08-20',pos:{todaySales:0,monthSales:520000000,todayTx:0,monthTx:1680},inventory:{lowStock:18,totalProducts:290,stockValue:310000000},hris:{totalEmployees:10,activeEmployees:9} },
  { id:'7',code:'WH-001',name:'Gudang Pusat Cikarang',type:'warehouse',address:'Jababeka D-12',city:'Bekasi',province:'Jawa Barat',phone:'021-898',email:'gudang@b.com',isActive:true,status:'online',syncStatus:'synced',lastSync:new Date().toISOString(),priceTierId:null,priceTierName:null,manager:{id:'5',name:'Eko Prasetyo',email:'eko@b.com'},stats:{todaySales:0,monthSales:0,employeeCount:30,lowStockItems:22},setupStatus:'completed',setupProgress:100,healthScore:76,healthGrade:'B',createdAt:'2024-02-01',pos:{todaySales:0,monthSales:0,todayTx:0,monthTx:0},inventory:{lowStock:22,totalProducts:1200,stockValue:3500000000},hris:{totalEmployees:30,activeEmployees:28} },
  { id:'8',code:'KS-001',name:'Kiosk Mall KG',type:'kiosk',address:'Mall KG Lt.2',city:'Jakarta Utara',province:'DKI Jakarta',phone:'021-458',email:'kiosk@b.com',isActive:true,status:'online',syncStatus:'synced',lastSync:new Date().toISOString(),priceTierId:'t1',priceTierName:'Standar',manager:{id:'10',name:'Lisa Permata',email:'lisa@b.com'},stats:{todaySales:18900000,monthSales:480000000,employeeCount:5,lowStockItems:2},setupStatus:'completed',setupProgress:100,healthScore:90,healthGrade:'A',createdAt:'2024-10-01',pos:{todaySales:18900000,monthSales:480000000,todayTx:65,monthTx:1920},inventory:{lowStock:2,totalProducts:120,stockValue:85000000},hris:{totalEmployees:5,activeEmployees:5} },
];
const MOCK_INTEGRATED: IntegratedSummary = { totalBranches:8,activeBranches:8,onlineBranches:6,totalTodaySales:195600000,totalMonthSales:5910000000,totalTodayTx:579,totalLowStock:79,totalEmployees:129,totalStockValue:5995000000 };
const MOCK_RANKING = MOCK_BRANCHES.filter(b=>b.type!=='warehouse').sort((a,b)=>(b.pos?.monthSales||0)-(a.pos?.monthSales||0)).map((b,i)=>({id:b.id,code:b.code,name:b.name,type:b.type,city:b.city,month_sales:b.pos?.monthSales||0,month_tx:b.pos?.monthTx||0,avg_ticket:(b.pos?.monthSales||0)/Math.max(b.pos?.monthTx||1,1),low_stock:b.inventory?.lowStock||0,stock_value:b.inventory?.stockValue||0,employee_count:b.hris?.totalEmployees||0,revenue_per_employee:(b.pos?.monthSales||0)/Math.max(b.hris?.totalEmployees||1,1)}));

// ─── Helpers ───
const fC = (v:number) => v>=1e9?`Rp ${(v/1e9).toFixed(1)}M`:v>=1e6?`Rp ${(v/1e6).toFixed(1)}Jt`:`Rp ${v.toLocaleString('id-ID')}`;
const fN = (v:number) => v.toLocaleString('id-ID');
const typeLabel = (t:string) => ({main:'Pusat',branch:'Cabang',warehouse:'Gudang',kiosk:'Kiosk'}[t]||t);
const typeColor = (t:string) => ({main:'bg-purple-100 text-purple-800',branch:'bg-blue-100 text-blue-800',warehouse:'bg-orange-100 text-orange-800',kiosk:'bg-green-100 text-green-800'}[t]||'bg-gray-100 text-gray-800');
const hColor = (s:number) => s>=80?'text-green-600':s>=60?'text-yellow-600':'text-red-600';
const hBg = (s:number) => s>=80?'bg-green-100':s>=60?'bg-yellow-100':'bg-red-100';

// ═══ COMPONENT ═══
export default function BranchManagement() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState(10); const [total, setTotal] = useState(0);
  const [integrated, setIntegrated] = useState<IntegratedSummary>({ totalBranches: 0, activeBranches: 0, onlineBranches: 0, totalTodaySales: 0, totalMonthSales: 0, totalTodayTx: 0, totalLowStock: 0, totalEmployees: 0, totalStockValue: 0 });
  const [ranking, setRanking] = useState<any[]>([]);
  const [usingMock, setUsingMock] = useState(false);
  const [industry, setIndustry] = useState('general');
  const [viewMode, setViewMode] = useState<'table'|'grid'|'health'>('table');
  const [typeFilter, setTypeFilter] = useState('all'); const [statusFilter, setStatusFilter] = useState('all');
  const [exporting, setExporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importStep, setImportStep] = useState<'upload'|'preview'|'result'>('upload');
  const [importFileName, setImportFileName] = useState<string>('');
  const [importFormat, setImportFormat] = useState<'csv'|'json'>('csv');
  const [importValidation, setImportValidation] = useState<{ total:number; valid:number; invalid:number; preview:Array<{row:number;data:any;valid:boolean;errors:string[]}> } | null>(null);
  const [importResult, setImportResult] = useState<{ total:number; created:number; updated:number; errors:number; details:Array<{code:string;status:string;message?:string}> } | null>(null);
  const [importDragOver, setImportDragOver] = useState(false);
  const [importError, setImportError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCreateModal, setShowCreateModal] = useState(false); const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch|null>(null);
  const [detailOpen, setDetailOpen] = useState(false); const [detailData, setDetailData] = useState<BranchDetail|null>(null);
  const [detailLoading, setDetailLoading] = useState(false); const [detailTab, setDetailTab] = useState('overview');
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({ code:'',name:'',type:'branch' as Branch['type'],address:'',city:'',province:'',region:'',phone:'',email:'',managerId:'',priceTierId:'' });

  // ─── Fetching ───
  const fetchBranches = useCallback(async()=>{setLoading(true);try{const p=new URLSearchParams({page:String(page),limit:String(pageSize)});if(typeFilter!=='all')p.set('type',typeFilter);if(statusFilter!=='all')p.set('status',statusFilter);const r=await fetch(`/api/hq/branches?${p}`);if(r.ok){const d=await r.json();const l=d.data?.branches||d.branches||[];if(l.length>0){setBranches(l);setTotal(d.data?.pagination?.total||l.length);setUsingMock(false)}else{setBranches([]);setTotal(0);setUsingMock(false)}}else{setBranches(MOCK_BRANCHES);setTotal(MOCK_BRANCHES.length);setUsingMock(true)}}catch{setBranches(MOCK_BRANCHES);setTotal(MOCK_BRANCHES.length);setUsingMock(true)}finally{setLoading(false)}},[page,pageSize,typeFilter,statusFilter]);
  const fetchIntegrated = useCallback(async()=>{try{const r=await fetch('/api/hq/branches/integrated?action=dashboard-integrated');if(r.ok){const j=await r.json();if(j.success&&j.data){if(j.data.summary)setIntegrated(j.data.summary);if(j.data.branches?.length>0){setBranches(j.data.branches.map((b:any)=>({...b,id:b.id,code:b.code,name:b.name,type:b.type||'branch',address:b.address||'',city:b.city||'',province:b.province||'',isActive:b.is_active??true,status:b.sync_status==='synced'?'online':b.sync_status==='failed'?'offline':'warning',syncStatus:b.sync_status,lastSync:b.last_sync_at||new Date().toISOString(),manager:b.manager_name?{id:'',name:b.manager_name,email:b.manager_email||''}:null,priceTierId:null,priceTierName:null,stats:{todaySales:b.pos?.todaySales||0,monthSales:b.pos?.monthSales||0,employeeCount:b.hris?.totalEmployees||0,lowStockItems:b.inventory?.lowStock||0},pos:b.pos,inventory:b.inventory,hris:b.hris,healthScore:70+Math.random()*25,healthGrade:'B',createdAt:b.created_at||new Date().toISOString()})));setTotal(j.data.branches.length);setUsingMock(false)}}}else{setIntegrated(MOCK_INTEGRATED);if(branches.length===0){setBranches(MOCK_BRANCHES);setTotal(MOCK_BRANCHES.length);setUsingMock(true)}}}catch{setIntegrated(MOCK_INTEGRATED);if(branches.length===0){setBranches(MOCK_BRANCHES);setTotal(MOCK_BRANCHES.length);setUsingMock(true)}}},[branches.length]);
  const fetchRanking = useCallback(async()=>{try{const r=await fetch('/api/hq/branches/integrated?action=cross-module-ranking');if(r.ok){const j=await r.json();if(j.success&&j.data?.ranking?.length>0){setRanking(j.data.ranking);return}}setRanking(MOCK_RANKING)}catch{setRanking(MOCK_RANKING)}},[]);
  const fetchDetail = useCallback(async(bid:string)=>{setDetailLoading(true);try{const r=await fetch(`/api/hq/branches/integrated?action=branch-summary&branchId=${bid}`);if(r.ok){const j=await r.json();if(j.success&&j.data){setDetailData(j.data);setDetailLoading(false);return}}}catch{}const b=branches.find(x=>x.id===bid);setDetailData({branch:b,pos:{summary:{today_sales:b?.pos?.todaySales||0,month_sales:b?.pos?.monthSales||0},dailySales:[],paymentMethods:[],topProducts:[]},inventory:{summary:{total_products:b?.inventory?.totalProducts||0,low_stock:b?.inventory?.lowStock||0,stock_value:b?.inventory?.stockValue||0},lowStockItems:[],transfers:[]},hris:{employees:[],users:[],attendance:[],totalEmployees:b?.hris?.totalEmployees||0,totalUsers:0},finance:{monthlyRevenue:[]},modules:[]});setDetailLoading(false)},[branches]);

  useEffect(()=>{setMounted(true);fetchBranches();fetchIntegrated();fetchRanking()},[]);
  useEffect(()=>{fetchBranches()},[page,pageSize,typeFilter,statusFilter]);
  if(!mounted)return null;

  // ─── Handlers ───
  const resetForm=()=>setFormData({code:'',name:'',type:'branch',address:'',city:'',province:'',region:'',phone:'',email:'',managerId:'',priceTierId:''});
  const handleCreate=async()=>{setActionLoading(true);try{const r=await fetch('/api/hq/branches',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(formData)});if(r.ok){toast.success('Cabang berhasil ditambahkan');setShowCreateModal(false);resetForm();fetchBranches();fetchIntegrated()}else{const j=await r.json().catch(()=>({}));toast.error(j.error?.message||j.message||'Gagal menambah cabang')}}catch{toast.error('Gagal menambah cabang')}finally{setActionLoading(false)}};
  const handleUpdate=async()=>{if(!selectedBranch)return;setActionLoading(true);try{const r=await fetch(`/api/hq/branches/${selectedBranch.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(formData)});if(r.ok){toast.success('Cabang diperbarui');setShowEditModal(false);resetForm();fetchBranches();fetchIntegrated()}else{const j=await r.json().catch(()=>({}));toast.error(j.error?.message||j.message||'Gagal memperbarui')}}catch{toast.error('Gagal memperbarui')}finally{setActionLoading(false)}};
  const handleDelete=async()=>{if(!selectedBranch)return;setActionLoading(true);try{const r=await fetch(`/api/hq/branches/${selectedBranch.id}`,{method:'DELETE'});if(r.ok){toast.success('Cabang dihapus');setShowDeleteConfirm(false);setSelectedBranch(null);fetchBranches();fetchIntegrated()}else{const j=await r.json().catch(()=>({}));toast.error(j.error?.message||j.message||'Gagal menghapus')}}catch{toast.error('Gagal menghapus')}finally{setActionLoading(false)}};
  const handleToggle=async()=>{if(!selectedBranch)return;setActionLoading(true);try{const r=await fetch(`/api/hq/branches/${selectedBranch.id}/toggle-active`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({isActive:!selectedBranch.isActive})});if(r.ok){const j=await r.json().catch(()=>({}));toast.success(j.message||(selectedBranch.isActive?'Cabang dinonaktifkan':'Cabang diaktifkan'));setShowToggleConfirm(false);setSelectedBranch(null);fetchBranches();fetchIntegrated()}else{const j=await r.json().catch(()=>({}));toast.error(j.error?.message||j.message||'Gagal mengubah status')}}catch{toast.error('Gagal mengubah status')}finally{setActionLoading(false)}};
  const openEdit=(b:Branch)=>{setSelectedBranch(b);setFormData({code:b.code,name:b.name,type:b.type,address:b.address,city:b.city,province:b.province,region:b.region||'',phone:b.phone,email:b.email,managerId:b.manager?.id||'',priceTierId:b.priceTierId||''});setShowEditModal(true)};
  const openDetail=(b:Branch)=>{setSelectedBranch(b);setDetailTab('overview');setDetailOpen(true);fetchDetail(b.id)};
  const handleExport=async()=>{setExporting(true);try{const r=await fetch('/api/hq/branches/enhanced?action=export');if(r.ok){const j=await r.json();const rows=j.data?.rows||[];if(!rows.length){toast.error('Tidak ada data');return}const h=Object.keys(rows[0]);const csv=[h.join(','),...rows.map((r:any)=>h.map(k=>`"${(r[k]||'').toString().replace(/"/g,'""')}"`).join(','))].join('\n');const blob=new Blob([csv],{type:'text/csv'});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=`branches-${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(u);toast.success(`${rows.length} cabang diekspor`)}}catch{toast.error('Gagal')}finally{setExporting(false)}};
  const resetImport = () => { setImportData([]); setImportValidation(null); setImportResult(null); setImportFileName(''); setImportError(''); setImportStep('upload'); };
  const openImportModal = () => { resetImport(); setShowImportModal(true); };
  const closeImportModal = () => { setShowImportModal(false); resetImport(); };

  const handleDownloadTemplate = (format: 'csv'|'json' = 'csv') => {
    const sample = [
      { code: 'BR-001', name: 'Kantor Pusat Jakarta', type: 'main', address: 'Jl. Sudirman No. 123', city: 'Jakarta Selatan', province: 'DKI Jakarta', region: 'Jabodetabek', phone: '021-5551234', email: 'pusat@perusahaan.com' },
      { code: 'BR-002', name: 'Cabang Bandung', type: 'branch', address: 'Jl. Braga No. 45', city: 'Bandung', province: 'Jawa Barat', region: 'Jabar', phone: '022-4201234', email: 'bandung@perusahaan.com' },
      { code: 'WH-001', name: 'Gudang Cikarang', type: 'warehouse', address: 'Jababeka D-12', city: 'Bekasi', province: 'Jawa Barat', region: 'Jabodetabek', phone: '021-8981234', email: 'gudang@perusahaan.com' },
    ];
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'branches-template.json'; a.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = IMPORT_FIELDS.map(f => f.key);
      const rows = sample.map(s => headers.map(h => toCSVCell((s as any)[h])).join(','));
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'branches-template.csv'; a.click();
      URL.revokeObjectURL(url);
    }
    toast.success(`Template ${format.toUpperCase()} diunduh`);
  };

  const processImportFile = async (file: File) => {
    setImportError('');
    setImportFileName(file.name);
    const isJson = /\.json$/i.test(file.name);
    setImportFormat(isJson ? 'json' : 'csv');
    try {
      const text = await file.text();
      let rows: any[] = [];
      if (isJson) {
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) { setImportError('File JSON harus berupa array objek'); return; }
        rows = parsed;
      } else {
        const { rows: parsedRows, error } = parseCSV(text);
        if (error) { setImportError(error); return; }
        rows = parsedRows;
      }
      if (rows.length === 0) { setImportError('File tidak berisi data'); return; }
      const unknownHeaders = Object.keys(rows[0] || {}).filter(h => !IMPORT_FIELDS.some(f => f.key === h));
      setImportData(rows);
      await validateImport(rows);
      setImportStep('preview');
      if (unknownHeaders.length > 0) toast(`${unknownHeaders.length} kolom tidak dikenal akan diabaikan: ${unknownHeaders.slice(0,4).join(', ')}`, { icon: 'ℹ️' });
    } catch (e: any) {
      setImportError(e?.message || 'Gagal membaca file');
    }
  };

  const validateImport = async (rows: any[]) => {
    // Client-side validation fallback
    const clientResults = rows.map((row, idx) => {
      const errors: string[] = [];
      if (!row.code) errors.push('Kode cabang wajib diisi');
      if (!row.name) errors.push('Nama cabang wajib diisi');
      if (row.type && !['main','branch','warehouse','kiosk'].includes(String(row.type))) errors.push(`Tipe "${row.type}" tidak valid`);
      if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) errors.push('Email tidak valid');
      return { row: idx + 1, data: row, valid: errors.length === 0, errors };
    });
    try {
      const r = await fetch('/api/hq/branches/enhanced?action=import-preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rows }) });
      if (r.ok) {
        const j = await r.json();
        const d = j.data || j;
        if (d?.preview) {
          setImportValidation({ total: d.total ?? rows.length, valid: d.valid ?? clientResults.filter(c=>c.valid).length, invalid: d.invalid ?? clientResults.filter(c=>!c.valid).length, preview: d.preview });
          return;
        }
      }
    } catch {}
    setImportValidation({ total: rows.length, valid: clientResults.filter(c=>c.valid).length, invalid: clientResults.filter(c=>!c.valid).length, preview: clientResults.slice(0, 50) });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) processImportFile(f); e.target.value = ''; };

  const handleImportExec = async () => {
    if (!importData.length) return;
    if (importValidation && importValidation.invalid > 0 && importValidation.valid === 0) { toast.error('Tidak ada baris valid untuk diimpor'); return; }
    setImporting(true);
    try {
      const r = await fetch('/api/hq/branches/enhanced?action=import-execute', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rows: importData }) });
      if (r.ok) {
        const j = await r.json();
        const d = j.data || j;
        setImportResult({ total: d.total ?? 0, created: d.created ?? 0, updated: d.updated ?? 0, errors: d.errors ?? 0, details: d.details ?? [] });
        setImportStep('result');
        toast.success(`Import selesai: ${d.created || 0} baru, ${d.updated || 0} diperbarui${d.errors ? `, ${d.errors} gagal` : ''}`);
        fetchBranches(); fetchIntegrated();
      } else {
        const j = await r.json().catch(() => ({}));
        toast.error(j.error?.message || j.message || 'Import gagal');
      }
    } catch { toast.error('Import gagal'); }
    finally { setImporting(false); }
  };

  // ─── Table Columns ───
  const columns: Column<Branch>[] = [
    { key:'code',header:'Cabang',sortable:true,render:(_,b)=>(
      <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-lg flex items-center justify-center ${b.status==='online'?'bg-green-100':b.status==='warning'?'bg-yellow-100':'bg-red-100'}`}><Building2 className={`w-5 h-5 ${b.status==='online'?'text-green-600':b.status==='warning'?'text-yellow-600':'text-red-600'}`}/></div><div><div className="font-medium text-gray-900">{b.name}</div><div className="text-sm text-gray-500">{b.code}</div></div></div>
    )},
    { key:'type',header:'Tipe',sortable:true,render:(_,b)=><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeColor(b.type)}`}>{typeLabel(b.type)}</span> },
    { key:'city',header:'Lokasi',render:(_,b)=><div className="flex items-center gap-2 text-gray-600"><MapPin className="w-4 h-4"/><span>{b.city}</span></div> },
    { key:'stats',header:'Penjualan Hari Ini',align:'right',render:(_,b)=><div className="text-right"><div className="font-semibold text-gray-900">{fC(b.pos?.todaySales||b.stats?.todaySales||0)}</div><div className="text-xs text-gray-500">{fN(b.pos?.todayTx||0)} tx</div></div> },
    { key:'inventory',header:'Inventori',align:'center',render:(_,b)=><div className="text-center"><div className="text-sm font-medium">{fN(b.inventory?.totalProducts||0)} produk</div><div className={`text-xs ${(b.inventory?.lowStock||0)>5?'text-red-600 font-semibold':'text-gray-500'}`}>{b.inventory?.lowStock||0} rendah</div></div> },
    { key:'hris',header:'SDM',align:'center',render:(_,b)=><div className="flex items-center justify-center gap-1"><Users className="w-4 h-4 text-gray-400"/><span className="text-sm font-medium">{b.hris?.totalEmployees||0}</span></div> },
    { key:'status',header:'Status',align:'center',render:(_,b)=><StatusBadge status={b.status}/> },
    { key:'actions',header:'Aksi',align:'center',width:'140px',render:(_,b)=>(
      <div className="flex items-center justify-center gap-1">
        <button onClick={e=>{e.stopPropagation();openDetail(b)}} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4"/></button>
        <button onClick={e=>{e.stopPropagation();window.location.href=`/hq/branches/${b.id}`}} className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg"><Activity className="w-4 h-4"/></button>
        <button onClick={e=>{e.stopPropagation();openEdit(b)}} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"><Edit className="w-4 h-4"/></button>
        <button onClick={e=>{e.stopPropagation();setSelectedBranch(b);setShowToggleConfirm(true)}} className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg"><Power className="w-4 h-4"/></button>
      </div>
    )}
  ];

  // ─── Chart Data ───
  const salesByBranch = [...branches].filter(b=>b.type!=='warehouse').sort((a,b)=>(b.pos?.monthSales||0)-(a.pos?.monthSales||0)).slice(0,8).map(b=>({name:b.name.replace(/^(Cabang|Kiosk|Gudang) /,''),sales:(b.pos?.monthSales||0)/1e6}));
  const invByBranch = [...branches].sort((a,b)=>(b.inventory?.stockValue||0)-(a.inventory?.stockValue||0)).slice(0,8).map(b=>({name:b.name.replace(/^(Cabang|Kiosk|Gudang) /,''),value:(b.inventory?.stockValue||0)/1e6,low:b.inventory?.lowStock||0}));
  const empByBranch = [...branches].sort((a,b)=>(b.hris?.totalEmployees||0)-(a.hris?.totalEmployees||0)).map(b=>({name:b.name.replace(/^(Cabang|Kiosk|Gudang|Kantor Pusat) /,''),count:b.hris?.totalEmployees||0}));

  // ─── Render helper for module cross-branch table ───
  const ModuleTable = ({ title, icon: Icon, iconColor, headers, renderRow }: { title: string; icon: any; iconColor: string; headers: string[]; renderRow: (b: Branch) => React.ReactNode }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200"><h3 className="font-semibold text-gray-900 flex items-center gap-2"><Icon className={`w-5 h-5 text-${iconColor}-500`}/> {title}</h3></div>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50"><tr>{headers.map(h=><th key={h} className="px-4 py-3 text-left font-medium text-gray-500">{h}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{branches.map(b=><tr key={b.id} className="hover:bg-gray-50">{renderRow(b)}</tr>)}</tbody></table></div>
    </div>
  );

  // ─── KPI Card helper ───
  const KPI = ({ label, value, icon: Icon, color }: { label: string; value: string|number; icon: any; color: string }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`p-2 bg-${color}-100 rounded-lg inline-block mb-3`}><Icon className={`w-5 h-5 text-${color}-600`}/></div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );

  return (
    <HQLayout>
      <div className="space-y-6">
        {/* DEMO MODE BANNER */}
        {usingMock && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600"/>
            <span><strong>Mode Demo:</strong> menampilkan data sampel karena API cabang tidak tersedia. Aksi simpan tetap dikirim ke server.</span>
          </div>
        )}

        {/* HEADER */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Building2 className="w-7 h-7 text-blue-600"/> Manajemen Cabang</h1>
            <p className="text-sm text-gray-500 mt-0.5">{INDUSTRY_OPTIONS.find(i=>i.value===industry)?.label} — {integrated.totalBranches} cabang, {integrated.activeBranches} aktif</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={industry} onChange={e=>setIndustry(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">{INDUSTRY_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>
            <input ref={fileInputRef} type="file" accept=".csv,.json,text/csv,application/json" onChange={handleImportFile} className="hidden"/>
            <button onClick={openImportModal} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-600"><Upload className="w-4 h-4"/> Import</button>
            <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-600"><Download className={`w-4 h-4 ${exporting?'animate-spin':''}`}/> Ekspor</button>
            <button onClick={()=>{resetForm();setShowCreateModal(true)}} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm"><Plus className="w-4 h-4"/> Tambah Cabang</button>
          </div>
        </div>

        {/* TABS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-1 p-1.5 overflow-x-auto">
            {TABS.map(tab=><button key={tab.key} onClick={()=>setActiveTab(tab.key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab===tab.key?'bg-blue-600 text-white shadow-sm':'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}><tab.icon className="w-4 h-4"/> {tab.label}</button>)}
          </div>
        </div>

        {/* ═══ DASHBOARD ═══ */}
        {activeTab==='dashboard' && (<div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KPI label="Total Cabang" value={integrated.totalBranches} icon={Building2} color="blue"/>
            <KPI label="Penjualan Hari Ini" value={fC(integrated.totalTodaySales)} icon={DollarSign} color="green"/>
            <KPI label="Penjualan Bulan Ini" value={fC(integrated.totalMonthSales)} icon={TrendingUp} color="indigo"/>
            <KPI label="Stok Rendah" value={integrated.totalLowStock} icon={Package} color="orange"/>
            <KPI label="Total Karyawan" value={fN(integrated.totalEmployees)} icon={Users} color="purple"/>
            <KPI label="Nilai Stok" value={fC(integrated.totalStockValue)} icon={Warehouse} color="teal"/>
          </div>
          {(()=>{const attn=branches.filter(b=>b.status==='offline'||b.status==='warning');if(!attn.length)return null;return(
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3"><Bell className="w-5 h-5 text-red-500"/><h3 className="font-semibold text-red-900">{attn.length} Cabang Butuh Perhatian</h3></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">{attn.slice(0,6).map(b=><div key={b.id} onClick={()=>openDetail(b)} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-red-100 cursor-pointer hover:shadow-sm"><div className={`w-10 h-10 rounded-lg flex items-center justify-center ${b.status==='offline'?'bg-red-100':'bg-yellow-100'}`}>{b.status==='offline'?<WifiOff className="w-5 h-5 text-red-500"/>:<AlertTriangle className="w-5 h-5 text-yellow-500"/>}</div><div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{b.name}</p><p className="text-xs text-gray-500">{b.code}</p></div><StatusBadge status={b.status}/></div>)}</div>
            </div>);})()}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"><h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-500"/> Penjualan/Cabang (Jt)</h3><div className="h-52"><ResponsiveContainer width="100%" height="100%"><BarChart data={salesByBranch} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis type="number" tick={{fontSize:11}}/><YAxis type="category" dataKey="name" width={80} tick={{fontSize:10}}/><Tooltip formatter={(v:any)=>`Rp ${v}Jt`}/><Bar dataKey="sales" fill="#6366F1" radius={[0,4,4,0]}/></BarChart></ResponsiveContainer></div></div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"><h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Package className="w-4 h-4 text-orange-500"/> Stok/Cabang (Jt)</h3><div className="h-52"><ResponsiveContainer width="100%" height="100%"><BarChart data={invByBranch} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis type="number" tick={{fontSize:11}}/><YAxis type="category" dataKey="name" width={80} tick={{fontSize:10}}/><Tooltip/><Bar dataKey="value" fill="#F59E0B" radius={[0,4,4,0]}/></BarChart></ResponsiveContainer></div></div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"><h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-purple-500"/> Karyawan/Cabang</h3><div className="h-52"><ResponsiveContainer width="100%" height="100%"><BarChart data={empByBranch} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis type="number" tick={{fontSize:11}}/><YAxis type="category" dataKey="name" width={80} tick={{fontSize:10}}/><Tooltip/><Bar dataKey="count" fill="#8B5CF6" radius={[0,4,4,0]}/></BarChart></ResponsiveContainer></div></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"><h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Layers className="w-4 h-4 text-indigo-500"/> Integrasi Modul per Cabang</h3><div className="space-y-2">{branches.slice(0,8).map(b=><div key={b.id} className="flex items-center gap-3"><span className="text-xs text-gray-600 w-32 truncate font-medium">{b.name}</span><div className="flex-1 flex items-center gap-1.5"><span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${(b.pos?.todayTx||0)>0?'bg-green-100 text-green-700':'bg-gray-100 text-gray-400'}`}>POS</span><span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${(b.inventory?.totalProducts||0)>0?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-400'}`}>INV</span><span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${(b.hris?.totalEmployees||0)>0?'bg-purple-100 text-purple-700':'bg-gray-100 text-gray-400'}`}>HRIS</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-100 text-orange-700">FIN</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-100 text-teal-700">PROC</span></div><span className="text-xs font-semibold text-gray-700">{fC(b.pos?.monthSales||0)}</span></div>)}</div></div>
        </div>)}

        {/* ═══ BRANCHES LIST ═══ */}
        {activeTab==='branches' && (<div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"><div className="flex items-center justify-between flex-wrap gap-3"><div className="flex items-center gap-3"><div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">{[{v:'all',l:'Semua'},{v:'main',l:'Pusat'},{v:'branch',l:'Cabang'},{v:'warehouse',l:'Gudang'},{v:'kiosk',l:'Kiosk'}].map(f=><button key={f.v} onClick={()=>setTypeFilter(f.v)} className={`px-3 py-1.5 rounded-md text-xs font-medium ${typeFilter===f.v?'bg-white shadow text-blue-600':'text-gray-500 hover:text-gray-700'}`}>{f.l}</button>)}</div><div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">{[{v:'all',l:'Semua'},{v:'active',l:'Aktif'},{v:'inactive',l:'Non-Aktif'}].map(f=><button key={f.v} onClick={()=>setStatusFilter(f.v)} className={`px-3 py-1.5 rounded-md text-xs font-medium ${statusFilter===f.v?'bg-white shadow text-blue-600':'text-gray-500 hover:text-gray-700'}`}>{f.l}</button>)}</div></div><div className="flex items-center gap-2"><div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">{([['table',BarChart3],['grid',Building2],['health',Heart]] as const).map(([v,I])=><button key={v} onClick={()=>setViewMode(v as any)} className={`p-2 rounded-md ${viewMode===v?'bg-white shadow text-blue-600':'text-gray-400'}`}><I className="w-4 h-4"/></button>)}</div><button onClick={()=>{fetchBranches();fetchIntegrated()}} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"><RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/></button></div></div></div>
          {viewMode==='table'&&<DataTable columns={columns} data={branches} loading={loading} searchPlaceholder="Cari cabang..." pagination={{page,pageSize,total,onPageChange:setPage,onPageSizeChange:setPageSize}} actions={{onRefresh:fetchBranches}} onRowClick={openDetail}/>}
          {viewMode==='grid'&&<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{loading?<div className="col-span-3 flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-blue-600"/></div>:branches.map(b=><div key={b.id} onClick={()=>openDetail(b)} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"><div className={`h-1.5 ${b.status==='online'?'bg-green-500':b.status==='warning'?'bg-yellow-500':'bg-red-500'}`}/><div className="p-5"><div className="flex items-start justify-between mb-3"><div className="flex items-center gap-3"><div className={`w-11 h-11 rounded-xl flex items-center justify-center ${b.status==='online'?'bg-green-50 ring-2 ring-green-200':b.status==='warning'?'bg-yellow-50 ring-2 ring-yellow-200':'bg-red-50 ring-2 ring-red-200'}`}><Building2 className={`w-5 h-5 ${b.status==='online'?'text-green-600':b.status==='warning'?'text-yellow-600':'text-red-600'}`}/></div><div><h3 className="font-bold text-gray-900 text-[15px]">{b.name}</h3><div className="flex items-center gap-2 mt-0.5"><span className="text-xs text-gray-400 font-mono">{b.code}</span><span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${typeColor(b.type)}`}>{typeLabel(b.type)}</span></div></div></div><StatusBadge status={b.status}/></div><div className="grid grid-cols-4 gap-2 py-3 border-y border-gray-100"><div className="text-center"><p className="text-[9px] uppercase text-gray-400 font-semibold">POS</p><p className="font-bold text-xs">{fC(b.pos?.todaySales||0)}</p></div><div className="text-center border-x border-gray-100"><p className="text-[9px] uppercase text-gray-400 font-semibold">Stok</p><p className={`font-bold text-xs ${(b.inventory?.lowStock||0)>5?'text-red-600':''}`}>{b.inventory?.lowStock||0} rendah</p></div><div className="text-center border-r border-gray-100"><p className="text-[9px] uppercase text-gray-400 font-semibold">SDM</p><p className="font-bold text-xs">{b.hris?.totalEmployees||0}</p></div><div className="text-center"><p className="text-[9px] uppercase text-gray-400 font-semibold">Nilai</p><p className="font-bold text-xs">{fC(b.inventory?.stockValue||0)}</p></div></div>{b.healthScore!==undefined&&<div className="mt-3"><div className="flex justify-between mb-1"><span className="text-xs text-gray-500">Health</span><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${hBg(b.healthScore)} ${hColor(b.healthScore)}`}>{b.healthGrade} ({b.healthScore})</span></div><div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${b.healthScore>=80?'bg-green-500':b.healthScore>=60?'bg-yellow-500':'bg-red-500'}`} style={{width:`${b.healthScore}%`}}/></div></div>}</div></div>)}</div>}
          {viewMode==='health'&&<div className="space-y-4"><div className="grid grid-cols-4 gap-4"><KPI label="Sehat (≥80)" value={branches.filter(b=>(b.healthScore||0)>=80).length} icon={CheckCircle} color="green"/><KPI label="Monitor (60-79)" value={branches.filter(b=>(b.healthScore||0)>=60&&(b.healthScore||0)<80).length} icon={AlertTriangle} color="yellow"/><KPI label="Kritis (<60)" value={branches.filter(b=>(b.healthScore||0)<60).length} icon={XCircle} color="red"/><KPI label="Rata-rata" value={branches.length>0?Math.round(branches.reduce((s,b)=>s+(b.healthScore||0),0)/branches.length):0} icon={Gauge} color="blue"/></div><div className="bg-white rounded-xl shadow-sm border border-gray-200"><div className="p-4 border-b"><h3 className="font-semibold flex items-center gap-2"><Heart className="w-5 h-5 text-red-500"/> Health Score</h3></div><div className="divide-y divide-gray-100">{[...branches].sort((a,b)=>(a.healthScore||0)-(b.healthScore||0)).map(b=><div key={b.id} className="p-4 hover:bg-gray-50 flex items-center justify-between cursor-pointer" onClick={()=>openDetail(b)}><div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-xl flex items-center justify-center ${hBg(b.healthScore||0)}`}><span className={`text-lg font-bold ${hColor(b.healthScore||0)}`}>{b.healthGrade||'?'}</span></div><div><h4 className="font-semibold">{b.name}</h4><p className="text-sm text-gray-500">{b.code} • {b.city}</p></div></div><div className="flex items-center gap-6"><div className="text-right"><p className="text-xs text-gray-400">POS</p><p className="text-sm font-semibold">{fC(b.pos?.todaySales||0)}</p></div><div className="text-right"><p className="text-xs text-gray-400">Stok↓</p><p className={`text-sm font-semibold ${(b.inventory?.lowStock||0)>10?'text-red-600':''}`}>{b.inventory?.lowStock||0}</p></div><div className="w-32"><div className="flex justify-between mb-1"><span className="text-xs text-gray-400">Skor</span><span className={`text-sm font-bold ${hColor(b.healthScore||0)}`}>{b.healthScore||0}</span></div><div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${(b.healthScore||0)>=80?'bg-green-500':(b.healthScore||0)>=60?'bg-yellow-500':'bg-red-500'}`} style={{width:`${b.healthScore||0}%`}}/></div></div></div></div>)}</div></div></div>}
        </div>)}

        {/* ═══ RANKING ═══ */}
        {activeTab==='ranking'&&<div className="bg-white rounded-xl shadow-sm border border-gray-200"><div className="p-5 border-b"><h3 className="font-semibold flex items-center gap-2"><Award className="w-5 h-5 text-yellow-500"/> Peringkat Cabang — Multi-Modul</h3><p className="text-sm text-gray-500 mt-1">Integrasi POS, Inventori, HRIS</p></div><div className="divide-y divide-gray-100">{ranking.map((r:any,i:number)=><div key={r.id} className="p-4 hover:bg-gray-50 flex items-center gap-4 cursor-pointer" onClick={()=>{const b=branches.find(x=>x.id===r.id);if(b)openDetail(b)}}><div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${i===0?'bg-yellow-100 text-yellow-700':i===1?'bg-gray-200 text-gray-600':i===2?'bg-orange-100 text-orange-700':'bg-gray-100 text-gray-500'}`}>{i+1}</div><div className="flex-1 min-w-0"><h4 className="font-semibold">{r.name}</h4><p className="text-sm text-gray-500">{r.code} • {r.city}</p></div><div className="grid grid-cols-5 gap-6 text-right"><div><p className="text-[10px] uppercase text-gray-400 font-semibold">Penjualan</p><p className="text-sm font-bold">{fC(Number(r.month_sales))}</p></div><div><p className="text-[10px] uppercase text-gray-400 font-semibold">TX</p><p className="text-sm font-bold">{fN(Number(r.month_tx))}</p></div><div><p className="text-[10px] uppercase text-gray-400 font-semibold">Avg</p><p className="text-sm font-bold">{fC(Number(r.avg_ticket))}</p></div><div><p className="text-[10px] uppercase text-gray-400 font-semibold">Stok↓</p><p className={`text-sm font-bold ${Number(r.low_stock)>10?'text-red-600':''}`}>{r.low_stock}</p></div><div><p className="text-[10px] uppercase text-gray-400 font-semibold">Rev/SDM</p><p className="text-sm font-bold">{fC(Number(r.revenue_per_employee))}</p></div></div></div>)}</div></div>}

        {/* ═══ MODULE TABS (inventory, finance, hris, pos, procurement) ═══ */}
        {['inventory','finance','hris','pos','procurement'].includes(activeTab)&&(<div className="space-y-4">
          {activeTab==='inventory'&&<><div className="grid grid-cols-4 gap-4"><KPI label="Total Produk" value={fN(branches.reduce((s,b)=>s+(b.inventory?.totalProducts||0),0))} icon={Package} color="blue"/><KPI label="Stok Rendah" value={fN(integrated.totalLowStock)} icon={AlertTriangle} color="red"/><KPI label="Nilai Stok" value={fC(integrated.totalStockValue)} icon={DollarSign} color="green"/><KPI label="Cabang Kritis" value={branches.filter(b=>(b.inventory?.lowStock||0)>5).length} icon={Building2} color="orange"/></div><ModuleTable title="Inventori per Cabang" icon={Package} iconColor="orange" headers={['Cabang','Total Produk','Stok Rendah','Nilai Stok','Status','Aksi']} renderRow={b=><><td className="px-4 py-3"><div className="flex items-center gap-3"><Building2 className="w-4 h-4 text-gray-400"/><div><p className="font-medium">{b.name}</p><p className="text-xs text-gray-500">{b.code}</p></div></div></td><td className="px-4 py-3 text-right font-medium">{fN(b.inventory?.totalProducts||0)}</td><td className="px-4 py-3 text-right"><span className={`font-semibold ${(b.inventory?.lowStock||0)>10?'text-red-600':(b.inventory?.lowStock||0)>5?'text-yellow-600':'text-green-600'}`}>{b.inventory?.lowStock||0}</span></td><td className="px-4 py-3 text-right">{fC(b.inventory?.stockValue||0)}</td><td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${(b.inventory?.lowStock||0)>10?'bg-red-100 text-red-700':(b.inventory?.lowStock||0)>5?'bg-yellow-100 text-yellow-700':'bg-green-100 text-green-700'}`}>{(b.inventory?.lowStock||0)>10?'Kritis':(b.inventory?.lowStock||0)>5?'Perhatian':'Baik'}</span></td><td className="px-4 py-3 text-center"><button onClick={()=>openDetail(b)} className="text-blue-600 text-xs font-medium">Detail →</button></td></>}/></>}
          {activeTab==='finance'&&<><div className="grid grid-cols-4 gap-4"><KPI label="Revenue Hari Ini" value={fC(integrated.totalTodaySales)} icon={DollarSign} color="green"/><KPI label="Revenue Bulan Ini" value={fC(integrated.totalMonthSales)} icon={TrendingUp} color="indigo"/><KPI label="Transaksi Hari Ini" value={fN(integrated.totalTodayTx)} icon={Receipt} color="blue"/><KPI label="Aset Inventori" value={fC(integrated.totalStockValue)} icon={Warehouse} color="orange"/></div><ModuleTable title="Keuangan per Cabang" icon={DollarSign} iconColor="green" headers={['Cabang','Hari Ini','Bulan Ini','TX Bulan','Avg Tiket','Nilai Stok','Aksi']} renderRow={b=><><td className="px-4 py-3"><div className="flex items-center gap-3"><Building2 className="w-4 h-4 text-gray-400"/><div><p className="font-medium">{b.name}</p><p className="text-xs text-gray-500">{b.code}</p></div></div></td><td className="px-4 py-3 text-right font-semibold text-green-600">{fC(b.pos?.todaySales||0)}</td><td className="px-4 py-3 text-right font-semibold">{fC(b.pos?.monthSales||0)}</td><td className="px-4 py-3 text-right">{fN(b.pos?.monthTx||0)}</td><td className="px-4 py-3 text-right">{fC(b.pos?.monthTx?Math.round((b.pos.monthSales||0)/b.pos.monthTx):0)}</td><td className="px-4 py-3 text-right">{fC(b.inventory?.stockValue||0)}</td><td className="px-4 py-3 text-center"><button onClick={()=>openDetail(b)} className="text-blue-600 text-xs font-medium">Detail →</button></td></>}/></>}
          {activeTab==='hris'&&<><div className="grid grid-cols-4 gap-4"><KPI label="Total Karyawan" value={fN(integrated.totalEmployees)} icon={Users} color="purple"/><KPI label="Cabang Aktif" value={integrated.activeBranches} icon={Building2} color="blue"/><KPI label="Rata-rata/Cabang" value={integrated.activeBranches>0?Math.round(integrated.totalEmployees/integrated.activeBranches):0} icon={UserCheck} color="green"/><KPI label="Rev/Karyawan" value={fC(integrated.totalEmployees>0?Math.round(integrated.totalMonthSales/integrated.totalEmployees):0)} icon={DollarSign} color="indigo"/></div><ModuleTable title="Karyawan per Cabang" icon={Users} iconColor="purple" headers={['Cabang','Karyawan','Aktif','Rev/Karyawan','Penjualan','Aksi']} renderRow={b=>{const rpe=(b.hris?.totalEmployees||0)>0?(b.pos?.monthSales||0)/(b.hris?.totalEmployees||1):0;return<><td className="px-4 py-3"><div className="flex items-center gap-3"><Building2 className="w-4 h-4 text-gray-400"/><div><p className="font-medium">{b.name}</p><p className="text-xs text-gray-500">{b.code}</p></div></div></td><td className="px-4 py-3 text-right font-semibold">{b.hris?.totalEmployees||0}</td><td className="px-4 py-3 text-right text-green-600">{b.hris?.activeEmployees||0}</td><td className="px-4 py-3 text-right">{fC(rpe)}</td><td className="px-4 py-3 text-right">{fC(b.pos?.monthSales||0)}</td><td className="px-4 py-3 text-center"><button onClick={()=>openDetail(b)} className="text-blue-600 text-xs font-medium">Detail →</button></td></>}}/></>}
          {activeTab==='pos'&&<><div className="grid grid-cols-4 gap-4"><KPI label="TX Hari Ini" value={fN(integrated.totalTodayTx)} icon={ShoppingCart} color="blue"/><KPI label="Penjualan Hari Ini" value={fC(integrated.totalTodaySales)} icon={DollarSign} color="green"/><KPI label="Avg Tiket" value={fC(integrated.totalTodayTx>0?Math.round(integrated.totalTodaySales/integrated.totalTodayTx):0)} icon={Receipt} color="indigo"/><KPI label="Online" value={`${integrated.onlineBranches}/${integrated.totalBranches}`} icon={Wifi} color="teal"/></div><ModuleTable title="POS per Cabang" icon={ShoppingCart} iconColor="blue" headers={['Cabang','Hari Ini','TX Hari','Bulan Ini','TX Bulan','Avg Tiket','Status']} renderRow={b=><><td className="px-4 py-3"><div className="flex items-center gap-3"><Building2 className="w-4 h-4 text-gray-400"/><div><p className="font-medium">{b.name}</p><p className="text-xs text-gray-500">{b.code}</p></div></div></td><td className="px-4 py-3 text-right font-semibold text-green-600">{fC(b.pos?.todaySales||0)}</td><td className="px-4 py-3 text-right">{fN(b.pos?.todayTx||0)}</td><td className="px-4 py-3 text-right font-semibold">{fC(b.pos?.monthSales||0)}</td><td className="px-4 py-3 text-right">{fN(b.pos?.monthTx||0)}</td><td className="px-4 py-3 text-right">{fC(b.pos?.monthTx?Math.round((b.pos.monthSales||0)/b.pos.monthTx):0)}</td><td className="px-4 py-3 text-center"><StatusBadge status={b.status}/></td></>}/></>}
          {activeTab==='procurement'&&<><div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-xl p-5 flex items-center gap-3"><Truck className="w-8 h-8 text-teal-600"/><div><h3 className="font-semibold">Pengadaan per Cabang</h3><p className="text-sm text-gray-600">Terintegrasi E-Procurement — PO, GRN, Invoice</p></div><button onClick={()=>window.location.href='/hq/e-procurement'} className="ml-auto flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium"><ExternalLink className="w-4 h-4"/> Buka E-Procurement</button></div><ModuleTable title="Kebutuhan Pengadaan" icon={ClipboardList} iconColor="teal" headers={['Cabang','Stok Rendah','Nilai Stok','Penjualan Bulan','Prioritas','Aksi']} renderRow={b=>{const u=(b.inventory?.lowStock||0)>15?'Tinggi':(b.inventory?.lowStock||0)>5?'Sedang':'Rendah';const uc=u==='Tinggi'?'bg-red-100 text-red-700':u==='Sedang'?'bg-yellow-100 text-yellow-700':'bg-green-100 text-green-700';return<><td className="px-4 py-3"><div className="flex items-center gap-3"><Building2 className="w-4 h-4 text-gray-400"/><div><p className="font-medium">{b.name}</p><p className="text-xs text-gray-500">{b.code}</p></div></div></td><td className="px-4 py-3 text-right"><span className={`font-semibold ${(b.inventory?.lowStock||0)>10?'text-red-600':''}`}>{b.inventory?.lowStock||0}</span></td><td className="px-4 py-3 text-right">{fC(b.inventory?.stockValue||0)}</td><td className="px-4 py-3 text-right">{fC(b.pos?.monthSales||0)}</td><td className="px-4 py-3 text-center"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${uc}`}>{u}</span></td><td className="px-4 py-3 text-center"><button onClick={()=>openDetail(b)} className="text-blue-600 text-xs font-medium">Detail →</button></td></>}}/></>}
        </div>)}

        {/* ═══ ANALYTICS ═══ */}
        {activeTab==='analytics'&&<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[{title:'Penjualan Bulan/Cabang (Jt)',data:salesByBranch,key:'sales',fill:'#6366F1'},{title:'Stok/Cabang (Jt)',data:invByBranch,key:'value',fill:'#F59E0B'},{title:'Karyawan/Cabang',data:empByBranch,key:'count',fill:'#8B5CF6'},{title:'Revenue/Karyawan (Jt)',data:[...branches].filter(b=>(b.hris?.totalEmployees||0)>0&&b.type!=='warehouse').map(b=>({name:b.name.replace(/^(Cabang|Kiosk|Gudang) /,''),v:Math.round((b.pos?.monthSales||0)/(b.hris?.totalEmployees||1)/1e6)})).sort((a,b)=>b.v-a.v).slice(0,8),key:'v',fill:'#10B981'}].map((c,i)=><div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"><h3 className="text-sm font-semibold mb-3">{c.title}</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={c.data}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name" tick={{fontSize:10}}/><YAxis tick={{fontSize:11}}/><Tooltip/><Bar dataKey={c.key} fill={c.fill} radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></div>)}
        </div>}
      </div>

      {/* DETAIL DRAWER */}
      {detailOpen&&selectedBranch&&<div className="fixed inset-0 z-50 flex"><div className="fixed inset-0 bg-black/40" onClick={()=>setDetailOpen(false)}/><div className="relative ml-auto w-full max-w-3xl bg-white shadow-2xl overflow-y-auto">
        <div className={`sticky top-0 z-10 px-6 py-4 border-b ${selectedBranch.status==='online'?'bg-gradient-to-r from-green-50 to-emerald-50':selectedBranch.status==='warning'?'bg-gradient-to-r from-yellow-50 to-amber-50':'bg-gradient-to-r from-red-50 to-orange-50'}`}><div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedBranch.status==='online'?'bg-green-100':selectedBranch.status==='warning'?'bg-yellow-100':'bg-red-100'}`}><Building2 className={`w-6 h-6 ${selectedBranch.status==='online'?'text-green-600':selectedBranch.status==='warning'?'text-yellow-600':'text-red-600'}`}/></div><div><h2 className="text-lg font-bold">{selectedBranch.name}</h2><div className="flex items-center gap-2"><span className="text-sm text-gray-500 font-mono">{selectedBranch.code}</span><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeColor(selectedBranch.type)}`}>{typeLabel(selectedBranch.type)}</span><StatusBadge status={selectedBranch.status}/></div></div></div><div className="flex gap-2"><button onClick={()=>window.open(`/hq/branches/${selectedBranch.id}`,'_blank')} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><ExternalLink className="w-5 h-5"/></button><button onClick={()=>setDetailOpen(false)} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5"/></button></div></div></div>
        <div className="sticky top-[81px] z-10 bg-white border-b px-6"><div className="flex gap-1 overflow-x-auto py-2">{[{k:'overview',l:'Ringkasan',i:LayoutDashboard},{k:'pos',l:'POS',i:ShoppingCart},{k:'inventory',l:'Inventori',i:Package},{k:'hris',l:'Karyawan',i:Users},{k:'finance',l:'Keuangan',i:DollarSign}].map(dt=><button key={dt.k} onClick={()=>setDetailTab(dt.k)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${detailTab===dt.k?'bg-blue-100 text-blue-700':'text-gray-500 hover:bg-gray-100'}`}><dt.i className="w-3.5 h-3.5"/> {dt.l}</button>)}</div></div>
        <div className="p-6 space-y-5">{detailLoading?<div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-blue-600"/></div>:<>
          {detailTab==='overview'&&<div className="space-y-5"><div className="grid grid-cols-2 gap-3"><div className="bg-green-50 rounded-xl p-4"><DollarSign className="w-5 h-5 text-green-500 mb-1"/><p className="text-lg font-bold text-green-900">{fC(selectedBranch.pos?.todaySales||0)}</p><p className="text-[11px] text-green-600">Penjualan Hari Ini</p></div><div className="bg-blue-50 rounded-xl p-4"><TrendingUp className="w-5 h-5 text-blue-500 mb-1"/><p className="text-lg font-bold text-blue-900">{fC(selectedBranch.pos?.monthSales||0)}</p><p className="text-[11px] text-blue-600">Penjualan Bulan</p></div><div className={`rounded-xl p-4 ${(selectedBranch.inventory?.lowStock||0)>10?'bg-red-50':'bg-orange-50'}`}><Package className="w-5 h-5 text-orange-500 mb-1"/><p className="text-lg font-bold">{fN(selectedBranch.inventory?.totalProducts||0)} <span className="text-sm font-normal text-gray-500">produk</span></p><p className={`text-[11px] ${(selectedBranch.inventory?.lowStock||0)>10?'text-red-600 font-semibold':'text-orange-600'}`}>{selectedBranch.inventory?.lowStock||0} stok rendah</p></div><div className="bg-purple-50 rounded-xl p-4"><Users className="w-5 h-5 text-purple-500 mb-1"/><p className="text-lg font-bold text-purple-900">{selectedBranch.hris?.totalEmployees||0}</p><p className="text-[11px] text-purple-600">Total Karyawan</p></div></div><div className="grid grid-cols-2 gap-4"><div className="bg-gray-50 rounded-xl p-4"><h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500"/> Lokasi</h4><div className="space-y-2 text-sm"><p className="text-gray-700">{selectedBranch.address}</p><p className="text-gray-700">{selectedBranch.city}, {selectedBranch.province}</p><p className="text-gray-700">{selectedBranch.phone} • {selectedBranch.email}</p></div></div><div className="bg-gray-50 rounded-xl p-4"><h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Settings className="w-4 h-4 text-gray-500"/> Konfigurasi</h4><div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-gray-400">Manager</span><span className="font-medium">{selectedBranch.manager?.name||'-'}</span></div><div className="flex justify-between"><span className="text-gray-400">Harga</span><span className="font-medium">{selectedBranch.priceTierName||'Standar'}</span></div><div className="flex justify-between"><span className="text-gray-400">Sync</span><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selectedBranch.syncStatus==='synced'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{selectedBranch.syncStatus||'pending'}</span></div></div></div></div><div><h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-500"/> Aksi Cepat — Modul Terintegrasi</h4><div className="grid grid-cols-5 gap-2">{[{i:Activity,l:'Monitor',c:'purple',h:`/hq/branches/${selectedBranch.id}`},{i:TrendingUp,l:'Laporan',c:'blue',h:`/hq/reports/sales?branch=${selectedBranch.id}`},{i:Package,l:'Stok',c:'green',h:`/hq/reports/inventory?branch=${selectedBranch.id}`},{i:Users,l:'SDM',c:'orange',h:`/hq/hris/employees?branch=${selectedBranch.id}`},{i:Truck,l:'Pengadaan',c:'teal',h:`/hq/e-procurement?branch=${selectedBranch.id}`}].map((a,i)=><button key={i} onClick={()=>{setDetailOpen(false);window.location.href=a.h}} className={`flex flex-col items-center gap-1.5 p-3 bg-${a.c}-50 hover:bg-${a.c}-100 rounded-xl`}><a.i className={`w-5 h-5 text-${a.c}-600`}/><span className={`text-xs font-medium text-${a.c}-700`}>{a.l}</span></button>)}</div></div></div>}
          {detailTab==='pos'&&<div className="space-y-4"><div className="grid grid-cols-3 gap-3"><div className="bg-green-50 rounded-xl p-4 text-center"><p className="text-lg font-bold text-green-900">{fC(selectedBranch.pos?.todaySales||0)}</p><p className="text-xs text-green-600">Hari Ini</p></div><div className="bg-blue-50 rounded-xl p-4 text-center"><p className="text-lg font-bold text-blue-900">{fC(selectedBranch.pos?.monthSales||0)}</p><p className="text-xs text-blue-600">Bulan Ini</p></div><div className="bg-indigo-50 rounded-xl p-4 text-center"><p className="text-lg font-bold text-indigo-900">{fN(selectedBranch.pos?.monthTx||0)}</p><p className="text-xs text-indigo-600">Transaksi Bulan</p></div></div>{detailData?.pos?.topProducts&&detailData.pos.topProducts.length>0&&<div><h4 className="text-sm font-semibold mb-2">Produk Terlaris</h4><div className="space-y-1">{detailData.pos.topProducts.map((p:any,i:number)=><div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100"><span className="text-sm">{p.product_name}</span><span className="text-sm font-semibold">{fC(Number(p.revenue))}</span></div>)}</div></div>}</div>}
          {detailTab==='inventory'&&<div className="space-y-4"><div className="grid grid-cols-3 gap-3"><div className="bg-blue-50 rounded-xl p-4 text-center"><p className="text-lg font-bold">{fN(selectedBranch.inventory?.totalProducts||0)}</p><p className="text-xs text-blue-600">Total Produk</p></div><div className={`rounded-xl p-4 text-center ${(selectedBranch.inventory?.lowStock||0)>10?'bg-red-50':'bg-orange-50'}`}><p className={`text-lg font-bold ${(selectedBranch.inventory?.lowStock||0)>10?'text-red-900':''}`}>{selectedBranch.inventory?.lowStock||0}</p><p className="text-xs text-orange-600">Stok Rendah</p></div><div className="bg-green-50 rounded-xl p-4 text-center"><p className="text-lg font-bold text-green-900">{fC(selectedBranch.inventory?.stockValue||0)}</p><p className="text-xs text-green-600">Nilai Stok</p></div></div>{detailData?.inventory?.lowStockItems&&detailData.inventory.lowStockItems.length>0&&<div><h4 className="text-sm font-semibold mb-2 text-red-600">Produk Stok Rendah</h4><div className="space-y-1">{detailData.inventory.lowStockItems.map((p:any,i:number)=><div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100"><div><span className="text-sm font-medium">{p.name}</span><span className="text-xs text-gray-400 ml-2">{p.sku}</span></div><span className="text-sm font-bold text-red-600">{p.quantity}/{p.min_stock}</span></div>)}</div></div>}</div>}
          {detailTab==='hris'&&<div className="space-y-4"><div className="grid grid-cols-2 gap-3"><div className="bg-purple-50 rounded-xl p-4 text-center"><p className="text-lg font-bold text-purple-900">{detailData?.hris?.totalEmployees||selectedBranch.hris?.totalEmployees||0}</p><p className="text-xs text-purple-600">Total Karyawan</p></div><div className="bg-blue-50 rounded-xl p-4 text-center"><p className="text-lg font-bold text-blue-900">{detailData?.hris?.totalUsers||0}</p><p className="text-xs text-blue-600">User Aktif</p></div></div>{detailData?.hris?.employees&&detailData.hris.employees.length>0&&<div><h4 className="text-sm font-semibold mb-2">Daftar Karyawan</h4><div className="space-y-1">{detailData.hris.employees.slice(0,15).map((e:any,i:number)=><div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100"><div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400"/><div><span className="text-sm font-medium">{e.name}</span><span className="text-xs text-gray-400 ml-2">{e.department||e.role}</span></div></div><span className={`text-xs px-2 py-0.5 rounded-full ${e.status==='active'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>{e.status||'active'}</span></div>)}</div></div>}</div>}
          {detailTab==='finance'&&<div className="space-y-4"><div className="grid grid-cols-2 gap-3"><div className="bg-green-50 rounded-xl p-4 text-center"><p className="text-lg font-bold text-green-900">{fC(selectedBranch.pos?.monthSales||0)}</p><p className="text-xs text-green-600">Revenue Bulan Ini</p></div><div className="bg-blue-50 rounded-xl p-4 text-center"><p className="text-lg font-bold text-blue-900">{fC(selectedBranch.inventory?.stockValue||0)}</p><p className="text-xs text-blue-600">Aset Inventori</p></div></div>{detailData?.finance?.monthlyRevenue&&detailData.finance.monthlyRevenue.length>0&&<div><h4 className="text-sm font-semibold mb-2">Revenue Bulanan (12 bulan)</h4><div className="h-48"><ResponsiveContainer width="100%" height="100%"><BarChart data={detailData.finance.monthlyRevenue.map((m:any)=>({month:m.month,rev:Number(m.revenue)/1e6}))}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="month" tick={{fontSize:10}}/><YAxis tick={{fontSize:11}}/><Tooltip formatter={(v:any)=>`Rp ${v}Jt`}/><Bar dataKey="rev" fill="#10B981" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></div>}</div>}
        </>}</div>
      </div></div>}

      {/* MODALS */}
      <Modal isOpen={showCreateModal||showEditModal} onClose={()=>{setShowCreateModal(false);setShowEditModal(false);resetForm()}} title={showCreateModal?'Tambah Cabang Baru':'Edit Cabang'} size="lg" footer={<div className="flex justify-end gap-2"><button onClick={()=>{setShowCreateModal(false);setShowEditModal(false);resetForm()}} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button><button onClick={showCreateModal?handleCreate:handleUpdate} disabled={actionLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{actionLoading?'Menyimpan...':'Simpan'}</button></div>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Kode Cabang</label><input type="text" value={formData.code} onChange={e=>setFormData({...formData,code:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="BR-001"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label><select value={formData.type} onChange={e=>setFormData({...formData,type:e.target.value as Branch['type']})} className="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="branch">Cabang</option><option value="warehouse">Gudang</option><option value="kiosk">Kiosk</option></select></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama</label><input type="text" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label><textarea value={formData.address} onChange={e=>setFormData({...formData,address:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={2}/></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Kota</label><input type="text" value={formData.city} onChange={e=>setFormData({...formData,city:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label><input type="text" value={formData.province} onChange={e=>setFormData({...formData,province:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/></div></div>
          <div className="grid grid-cols-3 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label><input type="tel" value={formData.phone} onChange={e=>setFormData({...formData,phone:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Region</label><input type="text" value={formData.region} onChange={e=>setFormData({...formData,region:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/></div></div>
        </div>
      </Modal>
      <ConfirmDialog isOpen={showDeleteConfirm} onClose={()=>{setShowDeleteConfirm(false);setSelectedBranch(null)}} onConfirm={handleDelete} title="Hapus Cabang" message={`Yakin ingin menghapus ${selectedBranch?.name}?`} confirmText="Hapus" variant="danger" loading={actionLoading}/>
      <ConfirmDialog isOpen={showToggleConfirm} onClose={()=>{setShowToggleConfirm(false);setSelectedBranch(null)}} onConfirm={handleToggle} title={selectedBranch?.isActive?'Non-aktifkan Cabang':'Aktifkan Cabang'} message={selectedBranch?.isActive?`Non-aktifkan ${selectedBranch?.name}?`:`Aktifkan ${selectedBranch?.name}?`} confirmText={selectedBranch?.isActive?'Non-aktifkan':'Aktifkan'} variant={selectedBranch?.isActive?'warning':'info'} loading={actionLoading}/>
      <Modal
        isOpen={showImportModal}
        onClose={closeImportModal}
        title={importStep === 'upload' ? 'Import Data Cabang' : importStep === 'preview' ? `Pratinjau Import — ${importFileName || 'file'}` : 'Hasil Import'}
        size="xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-gray-500">
              {importStep === 'upload' && 'Unduh template untuk panduan kolom yang didukung.'}
              {importStep === 'preview' && importValidation && (
                <span>
                  Total: <b>{importValidation.total}</b> •
                  <span className="text-green-600"> Valid: {importValidation.valid}</span> •
                  {importValidation.invalid > 0 && <span className="text-red-600"> Invalid: {importValidation.invalid}</span>}
                </span>
              )}
              {importStep === 'result' && importResult && (
                <span>Dibuat: <b className="text-green-600">{importResult.created}</b> • Diperbarui: <b className="text-blue-600">{importResult.updated}</b> • Gagal: <b className="text-red-600">{importResult.errors}</b></span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {importStep === 'upload' && (
                <button onClick={closeImportModal} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Tutup</button>
              )}
              {importStep === 'preview' && (<>
                <button onClick={() => { resetImport(); }} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Ulangi</button>
                <button onClick={handleImportExec} disabled={importing || !importData.length || (!!importValidation && importValidation.valid === 0)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  <Upload className="w-4 h-4"/>
                  {importing ? 'Mengimpor...' : `Proses Import ${importValidation?.valid ?? importData.length} Baris`}
                </button>
              </>)}
              {importStep === 'result' && (<>
                <button onClick={() => { resetImport(); }} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Import Lagi</button>
                <button onClick={closeImportModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Selesai</button>
              </>)}
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Stepper */}
          <div className="flex items-center gap-2">
            {[
              { k: 'upload', l: '1. Unggah', icon: Upload },
              { k: 'preview', l: '2. Validasi', icon: ClipboardList },
              { k: 'result', l: '3. Hasil', icon: CheckCircle },
            ].map((s, i, arr) => {
              const active = importStep === s.k;
              const done = ((importStep === 'preview' && s.k === 'upload') || (importStep === 'result' && s.k !== 'result'));
              return (
                <React.Fragment key={s.k}>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${active ? 'bg-blue-100 text-blue-700' : done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    <s.icon className="w-3.5 h-3.5"/> {s.l}
                  </div>
                  {i < arr.length - 1 && <div className={`h-px flex-1 ${done ? 'bg-green-300' : 'bg-gray-200'}`}/>}
                </React.Fragment>
              );
            })}
          </div>

          {/* STEP 1 — Upload */}
          {importStep === 'upload' && (
            <div className="space-y-4">
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setImportDragOver(true); }}
                onDragLeave={() => setImportDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault(); setImportDragOver(false);
                  const f = e.dataTransfer.files?.[0]; if (f) processImportFile(f);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer border-2 border-dashed rounded-xl p-8 text-center transition-colors ${importDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300 bg-gray-50'}`}
              >
                <Upload className="w-10 h-10 mx-auto text-blue-500 mb-2"/>
                <p className="text-sm font-medium text-gray-800">Tarik & lepas file di sini atau <span className="text-blue-600 underline">pilih file</span></p>
                <p className="text-xs text-gray-500 mt-1">Format didukung: <b>.csv</b> (UTF-8) atau <b>.json</b> (array objek) • Maksimum ±5.000 baris</p>
                {importError && <p className="text-xs text-red-600 mt-2"><AlertTriangle className="inline w-3 h-3 mr-1"/>{importError}</p>}
              </div>

              {/* Template download */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500"/> Template & Contoh</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Unduh file contoh yang sudah berisi header & 3 baris data valid.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleDownloadTemplate('csv')} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-medium hover:bg-green-100"><Download className="w-3.5 h-3.5"/> Template CSV</button>
                  <button onClick={() => handleDownloadTemplate('json')} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-medium hover:bg-indigo-100"><Download className="w-3.5 h-3.5"/> Template JSON</button>
                </div>
              </div>

              {/* Field documentation */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-gray-500"/>
                  <h4 className="font-semibold text-gray-900 text-sm">Kolom yang Didukung</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-[11px] uppercase text-gray-500 font-medium">Kolom</th>
                        <th className="px-4 py-2 text-left text-[11px] uppercase text-gray-500 font-medium">Wajib</th>
                        <th className="px-4 py-2 text-left text-[11px] uppercase text-gray-500 font-medium">Contoh</th>
                        <th className="px-4 py-2 text-left text-[11px] uppercase text-gray-500 font-medium">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {IMPORT_FIELDS.map(f => (
                        <tr key={f.key} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-mono text-xs text-gray-900">{f.key}</td>
                          <td className="px-4 py-2">{f.required ? <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-semibold">Wajib</span> : <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px]">Opsional</span>}</td>
                          <td className="px-4 py-2 text-gray-600 font-mono text-xs">{f.example}</td>
                          <td className="px-4 py-2 text-gray-600 text-xs">
                            {f.description}
                            {f.allowed && <span className="block mt-0.5 text-[11px] text-gray-400">Nilai: {f.allowed.map(a => <code key={a} className="mx-0.5 px-1 bg-gray-100 rounded">{a}</code>)}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Rules */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 space-y-1.5">
                <p className="font-semibold flex items-center gap-2"><Bell className="w-4 h-4"/> Aturan Import</p>
                <ul className="list-disc pl-5 text-xs space-y-0.5 text-blue-900/80">
                  <li>Baris dengan <b>kode</b> yang sudah ada akan <b>diperbarui</b> (upsert by code).</li>
                  <li>Baris tanpa <b>code</b> atau <b>name</b> akan ditolak.</li>
                  <li>File CSV harus UTF-8; gunakan tanda kutip ganda untuk nilai yang mengandung koma. Contoh: <code className="bg-white px-1 rounded">"Jl. Sudirman, Kav. 10"</code>.</li>
                  <li>Kolom di luar daftar di atas akan diabaikan.</li>
                  <li>Manager, price tier, dan konfigurasi detail lainnya tidak diimpor dari file ini — atur via halaman detail cabang.</li>
                </ul>
              </div>
            </div>
          )}

          {/* STEP 2 — Preview / Validation */}
          {importStep === 'preview' && importValidation && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200"><p className="text-xs text-gray-500">Total Baris</p><p className="text-xl font-bold text-gray-900">{importValidation.total}</p></div>
                <div className="bg-green-50 rounded-xl p-3 border border-green-200"><p className="text-xs text-green-600">Valid (akan diimpor)</p><p className="text-xl font-bold text-green-800">{importValidation.valid}</p></div>
                <div className="bg-red-50 rounded-xl p-3 border border-red-200"><p className="text-xs text-red-600">Invalid (dilewati)</p><p className="text-xl font-bold text-red-800">{importValidation.invalid}</p></div>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-2 text-left text-[11px] uppercase text-gray-500 font-medium">#</th>
                        <th className="px-3 py-2 text-left text-[11px] uppercase text-gray-500 font-medium">Status</th>
                        {IMPORT_FIELDS.slice(0, 6).map(f => (
                          <th key={f.key} className="px-3 py-2 text-left text-[11px] uppercase text-gray-500 font-medium">{f.label}</th>
                        ))}
                        <th className="px-3 py-2 text-left text-[11px] uppercase text-gray-500 font-medium">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {importValidation.preview.map((row) => (
                        <tr key={row.row} className={row.valid ? 'hover:bg-gray-50' : 'bg-red-50/50 hover:bg-red-50'}>
                          <td className="px-3 py-2 text-gray-400 text-xs">{row.row}</td>
                          <td className="px-3 py-2">
                            {row.valid
                              ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-semibold"><CheckCircle className="w-3 h-3"/>Valid</span>
                              : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-semibold"><XCircle className="w-3 h-3"/>Invalid</span>}
                          </td>
                          {IMPORT_FIELDS.slice(0, 6).map(f => (
                            <td key={f.key} className="px-3 py-2 text-xs text-gray-700 max-w-[160px] truncate">{String(row.data?.[f.key] || '')}</td>
                          ))}
                          <td className="px-3 py-2 text-[11px] text-red-600">{row.errors.join('; ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {importValidation.total > importValidation.preview.length && (
                  <div className="px-3 py-2 bg-gray-50 text-[11px] text-gray-500 border-t border-gray-200">Menampilkan {importValidation.preview.length} dari {importValidation.total} baris.</div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3 — Result */}
          {importStep === 'result' && importResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200"><p className="text-xs text-gray-500">Total</p><p className="text-xl font-bold text-gray-900">{importResult.total}</p></div>
                <div className="bg-green-50 rounded-xl p-3 border border-green-200"><p className="text-xs text-green-600">Dibuat</p><p className="text-xl font-bold text-green-800">{importResult.created}</p></div>
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-200"><p className="text-xs text-blue-600">Diperbarui</p><p className="text-xl font-bold text-blue-800">{importResult.updated}</p></div>
                <div className={`rounded-xl p-3 border ${importResult.errors > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}><p className={`text-xs ${importResult.errors > 0 ? 'text-red-600' : 'text-gray-500'}`}>Gagal</p><p className={`text-xl font-bold ${importResult.errors > 0 ? 'text-red-800' : 'text-gray-900'}`}>{importResult.errors}</p></div>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700">Detail per Baris</div>
                <div className="overflow-x-auto max-h-80">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-[11px] uppercase text-gray-500 font-medium">Kode</th>
                        <th className="px-3 py-2 text-left text-[11px] uppercase text-gray-500 font-medium">Status</th>
                        <th className="px-3 py-2 text-left text-[11px] uppercase text-gray-500 font-medium">Pesan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {importResult.details.map((d, i) => (
                        <tr key={i} className={d.status === 'error' ? 'bg-red-50/50' : ''}>
                          <td className="px-3 py-2 font-mono text-xs text-gray-900">{d.code || '-'}</td>
                          <td className="px-3 py-2">
                            {d.status === 'created' && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-semibold"><CheckCircle className="w-3 h-3"/>Baru</span>}
                            {d.status === 'updated' && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-semibold"><RefreshCw className="w-3 h-3"/>Update</span>}
                            {d.status === 'error'   && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-semibold"><XCircle className="w-3 h-3"/>Gagal</span>}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-600">{d.message || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </HQLayout>
  );
}
