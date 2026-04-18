import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import HQLayout from '../../../components/hq/HQLayout';
import { useBusinessType } from '../../../contexts/BusinessTypeContext';
import {
  ArrowLeft, ArrowRight, ChevronDown, ExternalLink,
  LayoutDashboard, ShoppingCart, Package, Users, Wallet, BarChart3,
  Building2, Truck, UserCheck, Settings, MessageCircle, Globe,
  Briefcase, Megaphone, Layers, Send, Shield,
  Star, CheckCircle, Zap, BookOpen, HelpCircle, Target,
  TrendingUp, FileText, Database, Lock, Activity,
  Calendar, CreditCard, Map, Monitor, PieChart, Box,
  Clock, Bell, Tag, Search, Eye, Sparkles, Play
} from 'lucide-react';

// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════
interface ModuleDetail {
  name: string;
  tagline: string;
  longDesc: string;
  icon: any;
  gradient: string;
  gradientBg: string;
  href: string;
  category: string;
  highlights: string[];
  features: { title: string; desc: string; icon: any }[];
  stats: { label: string; value: string }[];
}

interface Article {
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  icon: any;
  color: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

// ═══════════════════════════════════════════════════════
// Module Detail Data
// ═══════════════════════════════════════════════════════
const MODULE_DETAILS: Record<string, ModuleDetail> = {
  dashboard: {
    name: 'Dashboard',
    tagline: 'Pusat Kontrol & Monitoring Bisnis Real-Time',
    longDesc: 'Dashboard HQ menampilkan ringkasan komprehensif dari seluruh operasional bisnis Anda. Monitor penjualan harian, status cabang, KPI karyawan, dan dapatkan insight berbasis data untuk pengambilan keputusan yang lebih cepat dan tepat.',
    icon: LayoutDashboard, gradient: 'from-indigo-500 to-indigo-600', gradientBg: 'from-indigo-900 via-indigo-950 to-violet-950', href: '/hq/home', category: 'Core System',
    highlights: ['Monitoring real-time semua cabang & outlet', 'KPI & analytics cross-module dalam satu layar', 'AI-powered insight & rekomendasi otomatis'],
    features: [
      { title: 'Sales Overview', desc: 'Grafik penjualan harian, mingguan, bulanan dengan perbandingan periode sebelumnya', icon: TrendingUp },
      { title: 'Branch Monitor', desc: 'Status online/offline semua cabang dengan detail operasional real-time', icon: Building2 },
      { title: 'Performance KPI', desc: 'Indikator kinerja utama dengan target, pencapaian, dan tren', icon: Target },
      { title: 'Alert & Notifikasi', desc: 'Peringatan otomatis untuk anomali penjualan, stok rendah, dan events penting', icon: Bell },
    ],
    stats: [{ label: 'Update Interval', value: 'Real-time' }, { label: 'KPI Metrics', value: '50+' }, { label: 'Data Sources', value: 'All Modules' }],
  },
  pos: {
    name: 'Point of Sale',
    tagline: 'Sistem Kasir Modern, Cepat & Terintegrasi',
    longDesc: 'Point of Sale Bedagang dirancang untuk kecepatan dan kemudahan operasional. Mendukung berbagai metode pembayaran digital, split bill, diskon otomatis, dan terintegrasi langsung dengan inventory, keuangan, serta loyalty program pelanggan Anda.',
    icon: ShoppingCart, gradient: 'from-blue-500 to-blue-600', gradientBg: 'from-blue-900 via-blue-950 to-indigo-950', href: '/pos', category: 'Core System',
    highlights: ['Transaksi cepat dengan UI intuitif & touch-friendly', 'Multi-payment: tunai, QRIS, e-wallet, kartu debit/kredit', 'Integrasi otomatis ke inventory, keuangan & loyalty'],
    features: [
      { title: 'Quick Checkout', desc: 'Proses pembayaran cepat dengan barcode scanner, search produk, dan touch screen', icon: Zap },
      { title: 'Multi Payment', desc: 'Tunai, QRIS, GoPay, OVO, Dana, ShopeePay, kartu debit/kredit dalam satu sistem', icon: CreditCard },
      { title: 'Split Bill', desc: 'Bagi tagihan per item atau persentase untuk group dining dan pembayaran bersama', icon: Users },
      { title: 'Diskon & Promo', desc: 'Diskon otomatis berdasarkan promo aktif, membership level, atau kode kupon', icon: Tag },
      { title: 'Cetak & Digital Struk', desc: 'Print thermal receipt atau kirim struk digital via WhatsApp dan email', icon: FileText },
    ],
    stats: [{ label: 'Checkout Speed', value: '<3 detik' }, { label: 'Payment Methods', value: '10+' }, { label: 'Daily Capacity', value: 'Unlimited' }],
  },
  branches: {
    name: 'Cabang',
    tagline: 'Kelola & Monitor Seluruh Cabang dari Satu Tempat',
    longDesc: 'Modul cabang memungkinkan Anda mengelola semua outlet dan cabang bisnis secara terpusat. Monitor performa, atur pengaturan per cabang, kelola karyawan, dan sinkronisasi data secara real-time antar semua lokasi.',
    icon: Building2, gradient: 'from-violet-500 to-violet-600', gradientBg: 'from-violet-900 via-violet-950 to-purple-950', href: '/hq/branches', category: 'Core System',
    highlights: ['Manajemen multi-cabang terpusat', 'Sinkronisasi data real-time antar lokasi', 'Perbandingan performa antar cabang'],
    features: [
      { title: 'Branch Dashboard', desc: 'Overview performa setiap cabang dengan sales, traffic, dan KPI', icon: LayoutDashboard },
      { title: 'Settings per Cabang', desc: 'Konfigurasi pajak, jam operasional, dan preferensi per lokasi', icon: Settings },
      { title: 'Staff Assignment', desc: 'Kelola penempatan karyawan dan shift per cabang', icon: Users },
      { title: 'Data Sync', desc: 'Sinkronisasi produk, harga, dan stok antar cabang otomatis', icon: Activity },
    ],
    stats: [{ label: 'Max Cabang', value: 'Unlimited' }, { label: 'Sync Mode', value: 'Real-time' }, { label: 'Data Isolation', value: 'Per Branch' }],
  },
  inventory: {
    name: 'Inventory',
    tagline: 'Kelola Stok, Gudang & Supply Chain Secara Terpusat',
    longDesc: 'Modul inventory memberikan visibilitas penuh terhadap stok di semua lokasi dan gudang. Fitur transfer antar gudang, stock opname, purchase order, goods receipt, dan alert otomatis memastikan stok Anda selalu optimal.',
    icon: Package, gradient: 'from-emerald-500 to-emerald-600', gradientBg: 'from-emerald-900 via-emerald-950 to-teal-950', href: '/hq/inventory', category: 'Core System',
    highlights: ['Multi-gudang dengan lokasi, zona & rak', 'Auto-alert stok minimum, overstock & expiry', 'Transfer, PO, & goods receipt terintegrasi'],
    features: [
      { title: 'Multi-Warehouse', desc: 'Kelola stok di beberapa gudang dengan zona, rak, dan lokasi detail', icon: Box },
      { title: 'Stock Transfer', desc: 'Transfer antar gudang/cabang dengan workflow approval multi-level', icon: Send },
      { title: 'Purchase Order', desc: 'Buat PO ke supplier dengan tracking status dan penerimaan barang', icon: FileText },
      { title: 'Stock Opname', desc: 'Hitung stok fisik dengan auto-populate item dan adjustment otomatis', icon: Search },
      { title: 'Alert System', desc: 'Notifikasi otomatis untuk stok minimum, overstock, dan mendekati expiry', icon: Bell },
    ],
    stats: [{ label: 'Warehouses', value: 'Unlimited' }, { label: 'SKU Support', value: '100K+' }, { label: 'Alert Types', value: '5' }],
  },
  products: {
    name: 'Produk',
    tagline: 'Master Data Produk Lengkap & Terstruktur',
    longDesc: 'Kelola seluruh master data produk Anda secara terpusat. Kategori, varian, harga bertingkat, barcode, foto produk, dan sinkronisasi otomatis ke semua channel penjualan.',
    icon: Layers, gradient: 'from-teal-500 to-teal-600', gradientBg: 'from-teal-900 via-teal-950 to-emerald-950', href: '/hq/products', category: 'Operasional',
    highlights: ['Kategori & sub-kategori fleksibel', 'Varian produk (ukuran, warna, tipe)', 'Harga bertingkat per cabang & channel'],
    features: [
      { title: 'Product Master', desc: 'Data produk lengkap: nama, SKU, barcode, deskripsi, foto', icon: Package },
      { title: 'Category Tree', desc: 'Struktur kategori hierarkis tanpa batas level', icon: Layers },
      { title: 'Price Tiers', desc: 'Harga berbeda per cabang, customer type, dan quantity', icon: Tag },
      { title: 'Bulk Import', desc: 'Import massal produk dari Excel/CSV dengan validasi otomatis', icon: FileText },
    ],
    stats: [{ label: 'Products', value: 'Unlimited' }, { label: 'Variants', value: 'Multi-level' }, { label: 'Price Tiers', value: 'Flexible' }],
  },
  finance: {
    name: 'Keuangan',
    tagline: 'Akuntansi, Laporan Keuangan & Analisis Finansial',
    longDesc: 'Modul keuangan lengkap dengan chart of accounts, jurnal otomatis dari semua transaksi, neraca, laba rugi, arus kas, dan budgeting. Data dari POS, payroll, dan modul lain otomatis terbukukan sehingga laporan keuangan selalu akurat.',
    icon: Wallet, gradient: 'from-amber-500 to-amber-600', gradientBg: 'from-amber-900 via-amber-950 to-orange-950', href: '/hq/finance', category: 'Keuangan',
    highlights: ['Jurnal otomatis dari semua modul transaksi', 'Laporan: Neraca, P&L, Cash Flow real-time', 'Budget planning & variance analysis'],
    features: [
      { title: 'Chart of Accounts', desc: 'Struktur akun fleksibel sesuai standar akuntansi Indonesia (SAK EMKM)', icon: Database },
      { title: 'Auto Journal', desc: 'Penjurnalan otomatis dari POS, inventory, payroll, dan klaim', icon: Zap },
      { title: 'Financial Reports', desc: 'Neraca, laba rugi, arus kas dengan drill-down ke detail transaksi', icon: PieChart },
      { title: 'Budgeting', desc: 'Perencanaan anggaran per departemen dengan monitoring realisasi', icon: Target },
      { title: 'Invoice & AP/AR', desc: 'Kelola piutang dan hutang usaha dengan aging analysis', icon: FileText },
    ],
    stats: [{ label: 'Report Types', value: '15+' }, { label: 'Auto Entries', value: '100%' }, { label: 'Compliance', value: 'SAK EMKM' }],
  },
  hris: {
    name: 'HRIS',
    tagline: 'HR Lengkap: Karyawan, Payroll, Kehadiran & Performa',
    longDesc: 'HRIS Bedagang mencakup seluruh siklus karyawan dari rekrutmen hingga pensiun. Database karyawan 360°, kontrak, absensi dengan GPS geofencing, payroll otomatis dengan PPh 21 & BPJS, cuti multi-approval, klaim, mutasi, KPI performance, dan employee engagement.',
    icon: UserCheck, gradient: 'from-cyan-500 to-cyan-600', gradientBg: 'from-cyan-900 via-cyan-950 to-blue-950', href: '/hq/hris', category: 'SDM & HR',
    highlights: ['Database karyawan 360° dengan 7 sub-data', 'Payroll otomatis: PPh 21, BPJS, tunjangan', 'Attendance dengan GPS geofencing & shift rotation'],
    features: [
      { title: 'Employee Database', desc: 'Data lengkap: personal, keluarga, pendidikan, sertifikasi, pengalaman, kontrak', icon: Users },
      { title: 'Payroll & PPh 21', desc: 'Hitung gaji, tunjangan, potongan, PPh 21, dan BPJS secara otomatis', icon: Wallet },
      { title: 'Time & Attendance', desc: 'Clock in/out dengan GPS geofencing, 8 template shift, rotasi otomatis', icon: Clock },
      { title: 'Leave Management', desc: 'Pengajuan cuti dengan 10 tipe cuti dan multi-level approval', icon: Calendar },
      { title: 'Performance (KPI)', desc: 'Target, review periode, dan penilaian kinerja komprehensif', icon: Target },
      { title: 'ESS & MSS Portal', desc: 'Self-service portal untuk karyawan dan manajer', icon: Monitor },
    ],
    stats: [{ label: 'HR Modules', value: '14' }, { label: 'Leave Types', value: '10' }, { label: 'Shift Templates', value: '8' }],
  },
  users: {
    name: 'Pengguna',
    tagline: 'Manajemen Akses, Role & Keamanan Sistem',
    longDesc: 'Kelola semua pengguna sistem dengan role-based access control (RBAC). Atur hak akses per modul, per cabang, dan per fitur untuk memastikan keamanan data bisnis Anda.',
    icon: Users, gradient: 'from-sky-500 to-sky-600', gradientBg: 'from-sky-900 via-sky-950 to-blue-950', href: '/hq/users', category: 'SDM & HR',
    highlights: ['Role-based access control (RBAC)', 'Akses per modul dan per cabang', 'Audit trail aktivitas pengguna'],
    features: [
      { title: 'User Management', desc: 'CRUD pengguna dengan profil, kontak, dan foto', icon: Users },
      { title: 'Role & Permission', desc: 'Definisikan role dengan permission granular per modul dan fitur', icon: Shield },
      { title: 'Branch Access', desc: 'Batasi akses pengguna ke cabang tertentu atau semua cabang', icon: Lock },
      { title: 'Activity Log', desc: 'Lacak semua aktivitas login, perubahan data, dan aksi penting', icon: Eye },
    ],
    stats: [{ label: 'Roles', value: 'Custom' }, { label: 'Permissions', value: 'Granular' }, { label: 'Security', value: 'Enterprise' }],
  },
  crm: {
    name: 'CRM & SFA',
    tagline: 'Customer 360°, Sales Pipeline & AI-Powered Insights',
    longDesc: 'Platform CRM dan Sales Force Automation terpadu untuk mengelola seluruh siklus penjualan. Dari lead capture hingga deal closing, customer 360° hingga support ticketing, tim sales lapangan hingga target & insentif — diperkuat dengan 6 model AI.',
    icon: Briefcase, gradient: 'from-pink-500 to-pink-600', gradientBg: 'from-pink-900 via-pink-950 to-rose-950', href: '/hq/sfa', category: 'Sales & Marketing',
    highlights: ['Customer 360° dengan health score & lifecycle', 'Visual sales pipeline drag-and-drop', 'AI: lead scoring, forecasting, email generator'],
    features: [
      { title: 'Lead Management', desc: 'Capture, scoring otomatis, dan tracking konversi lead dari semua sumber', icon: Target },
      { title: 'Sales Pipeline', desc: 'Visual pipeline dengan stage customization dan deal probability', icon: TrendingUp },
      { title: 'Customer 360°', desc: 'Profil pelanggan lengkap: riwayat pembelian, interaksi, health score', icon: Eye },
      { title: 'Field Sales (SFA)', desc: 'Visit tracking, field orders, GPS check-in, coverage planning', icon: Map },
      { title: 'Target & Insentif', desc: 'Set target per tim/individu dan hitung komisi & insentif otomatis', icon: Star },
      { title: 'AI Workflows', desc: 'Lead scoring, sales forecasting, customer segmentation, email AI', icon: Sparkles },
    ],
    stats: [{ label: 'CRM + SFA Features', value: '22+' }, { label: 'AI Models', value: '6' }, { label: 'Integrations', value: '4 Modules' }],
  },
  marketing: {
    name: 'Marketing',
    tagline: 'Kampanye, Promosi & Segmentasi Pelanggan',
    longDesc: 'Kelola kampanye marketing multi-channel, buat promosi yang ditargetkan, segmentasi pelanggan berdasarkan perilaku, dan track ROI setiap campaign untuk memaksimalkan efektivitas budget marketing Anda.',
    icon: Megaphone, gradient: 'from-rose-500 to-rose-600', gradientBg: 'from-rose-900 via-rose-950 to-pink-950', href: '/hq/marketing', category: 'Sales & Marketing',
    highlights: ['Campaign multi-channel management', 'Segmentasi pelanggan berbasis data', 'ROI tracking per campaign'],
    features: [
      { title: 'Campaign Manager', desc: 'Buat dan kelola kampanye marketing dengan timeline dan budget', icon: Megaphone },
      { title: 'Promotions', desc: 'Diskon, voucher, bundle, dan flash sale dengan aturan fleksibel', icon: Tag },
      { title: 'Customer Segments', desc: 'Segmentasi pelanggan berdasarkan pembelian, lokasi, dan perilaku', icon: Users },
      { title: 'Budget Tracking', desc: 'Alokasi dan monitoring budget marketing per channel dan campaign', icon: Wallet },
    ],
    stats: [{ label: 'Campaign Types', value: '8+' }, { label: 'Segments', value: 'Dynamic' }, { label: 'Channels', value: 'Multi' }],
  },
  fms: {
    name: 'Fleet Management',
    tagline: 'Manajemen Armada: Kendaraan, Driver & Operasional',
    longDesc: 'Fleet Management System lengkap untuk mengelola seluruh armada kendaraan. Master data kendaraan, manajemen driver terintegrasi HRIS, maintenance preventif & korektif, pencatatan BBM, inspeksi, rental, dan analisis biaya operasional per kendaraan.',
    icon: Truck, gradient: 'from-orange-500 to-orange-600', gradientBg: 'from-orange-900 via-orange-950 to-amber-950', href: '/hq/fms', category: 'Operasional',
    highlights: ['Master kendaraan & driver terintegrasi HRIS', 'Maintenance preventif terjadwal & work orders', 'Analisis total cost of ownership per kendaraan'],
    features: [
      { title: 'Vehicle Management', desc: 'Master data kendaraan: tipe, plat, status, assignment, dan dokumen', icon: Truck },
      { title: 'Driver Management', desc: 'Data driver, SIM, performa, availability, dan integrasi HRIS', icon: Users },
      { title: 'Maintenance', desc: 'Jadwal service preventif, work order korektif, dan riwayat perbaikan', icon: Settings },
      { title: 'Fuel Tracking', desc: 'Pencatatan BBM per kendaraan dengan analisis efisiensi konsumsi', icon: Activity },
      { title: 'Cost Analysis', desc: 'Total cost of ownership: BBM, maintenance, asuransi, depresiasi', icon: PieChart },
    ],
    stats: [{ label: 'Vehicles', value: 'Unlimited' }, { label: 'Alert Types', value: '8' }, { label: 'Cost Categories', value: '12' }],
  },
  tms: {
    name: 'Transport',
    tagline: 'Shipment, Dispatch & Proof of Delivery',
    longDesc: 'Transportation Management System untuk mengoptimalkan seluruh proses pengiriman. Dari pembuatan shipment, assignment trip, tracking real-time, hingga proof of delivery digital dan freight billing otomatis.',
    icon: Send, gradient: 'from-lime-500 to-lime-600', gradientBg: 'from-lime-900 via-lime-950 to-green-950', href: '/hq/tms', category: 'Operasional',
    highlights: ['Shipment lifecycle management end-to-end', 'Trip planning dengan multi-drop delivery', 'Digital proof of delivery & freight billing'],
    features: [
      { title: 'Shipment Management', desc: 'Order pengiriman dengan tracking status lifecycle lengkap', icon: Package },
      { title: 'Trip Planning', desc: 'Perencanaan trip multi-drop dengan estimasi waktu dan biaya', icon: Map },
      { title: 'Carrier Management', desc: 'Kelola transporter, rating performa, dan rate cards', icon: Truck },
      { title: 'Proof of Delivery', desc: 'Bukti pengiriman digital: tanda tangan, foto, dan catatan', icon: CheckCircle },
      { title: 'Freight Billing', desc: 'Tagihan pengiriman otomatis berdasarkan zone dan rate card', icon: FileText },
    ],
    stats: [{ label: 'Shipments', value: 'Unlimited' }, { label: 'Delivery Proof', value: 'Digital' }, { label: 'Billing', value: 'Auto' }],
  },
  reports: {
    name: 'Laporan',
    tagline: 'Analitik & Reporting Cross-Module',
    longDesc: 'Pusat laporan konsolidasi dari semua modul. Buat laporan kustom, export ke Excel/PDF, schedule report otomatis, dan dapatkan insight mendalam dari data bisnis Anda.',
    icon: BarChart3, gradient: 'from-purple-500 to-purple-600', gradientBg: 'from-purple-900 via-purple-950 to-violet-950', href: '/hq/reports/consolidated', category: 'Analitik',
    highlights: ['Laporan konsolidasi cross-module', 'Export Excel, PDF, dan CSV', 'Scheduled report & auto-email'],
    features: [
      { title: 'Consolidated Reports', desc: 'Gabungan data dari POS, inventory, finance, HR dalam satu laporan', icon: PieChart },
      { title: 'Custom Builder', desc: 'Buat laporan kustom dengan filter, grouping, dan formula', icon: Settings },
      { title: 'Export & Share', desc: 'Export ke Excel, PDF, CSV atau kirim otomatis via email', icon: FileText },
      { title: 'Trend Analysis', desc: 'Analisis tren dengan grafik perbandingan multi-periode', icon: TrendingUp },
    ],
    stats: [{ label: 'Report Templates', value: '30+' }, { label: 'Export Formats', value: '4' }, { label: 'Data Sources', value: 'All Modules' }],
  },
  audit: {
    name: 'Audit Log',
    tagline: 'Riwayat Aktivitas & Keamanan Sistem',
    longDesc: 'Lacak setiap perubahan data dan aktivitas pengguna di seluruh sistem. Audit trail lengkap untuk compliance, investigasi, dan keamanan dengan filter canggih dan export capability.',
    icon: Shield, gradient: 'from-slate-500 to-slate-600', gradientBg: 'from-slate-800 via-slate-900 to-gray-950', href: '/hq/audit-logs', category: 'Sistem',
    highlights: ['Audit trail lengkap setiap aksi pengguna', 'Filter berdasarkan user, modul, tanggal, tipe aksi', 'Compliance-ready untuk audit eksternal'],
    features: [
      { title: 'Activity Tracking', desc: 'Catat setiap create, update, delete di seluruh modul', icon: Eye },
      { title: 'Advanced Filter', desc: 'Filter berdasarkan user, modul, tanggal, IP address, dan tipe aksi', icon: Search },
      { title: 'Data Comparison', desc: 'Lihat before & after setiap perubahan data', icon: Activity },
      { title: 'Export Audit', desc: 'Export log untuk kebutuhan audit eksternal dan compliance', icon: FileText },
    ],
    stats: [{ label: 'Retention', value: '1 Tahun+' }, { label: 'Coverage', value: 'All Modules' }, { label: 'Compliance', value: 'SOX Ready' }],
  },
  whatsapp: {
    name: 'WhatsApp Business',
    tagline: 'Broadcast, Automasi & Customer Communication',
    longDesc: 'Integrasikan WhatsApp Business API untuk komunikasi otomatis dengan pelanggan. Kirim notifikasi order, broadcast promo, dan kelola percakapan customer service langsung dari dashboard ERP.',
    icon: MessageCircle, gradient: 'from-green-500 to-green-600', gradientBg: 'from-green-900 via-green-950 to-emerald-950', href: '/hq/whatsapp', category: 'Integrasi',
    highlights: ['WhatsApp Business API terintegrasi', 'Broadcast promo ke segmen pelanggan', 'Auto-notifikasi order & delivery status'],
    features: [
      { title: 'Broadcast Promo', desc: 'Kirim promosi massal ke segmen pelanggan yang ditargetkan', icon: Megaphone },
      { title: 'Order Notification', desc: 'Notifikasi otomatis: konfirmasi order, pembayaran, dan pengiriman', icon: Bell },
      { title: 'Template Messages', desc: 'Template pesan yang disetujui WhatsApp untuk berbagai skenario', icon: FileText },
      { title: 'Chat Management', desc: 'Kelola percakapan pelanggan dari dashboard terpusat', icon: MessageCircle },
    ],
    stats: [{ label: 'Message Types', value: '10+' }, { label: 'Automation', value: 'Full' }, { label: 'API', value: 'Official' }],
  },
  marketplace: {
    name: 'Marketplace',
    tagline: 'Integrasi Tokopedia, Shopee & Marketplace Lainnya',
    longDesc: 'Sinkronisasi produk, stok, dan pesanan dari marketplace populer Indonesia. Kelola semua channel penjualan dari satu dashboard tanpa perlu buka banyak tab.',
    icon: Globe, gradient: 'from-blue-500 to-cyan-600', gradientBg: 'from-blue-900 via-cyan-950 to-teal-950', href: '/hq/marketplace', category: 'Integrasi',
    highlights: ['Sync produk & stok ke Tokopedia, Shopee, dll', 'Kelola pesanan semua marketplace terpusat', 'Harga & promosi per channel'],
    features: [
      { title: 'Product Sync', desc: 'Sinkronisasi produk, foto, dan deskripsi ke semua marketplace', icon: Package },
      { title: 'Stock Sync', desc: 'Update stok otomatis saat ada penjualan dari channel manapun', icon: Activity },
      { title: 'Order Management', desc: 'Proses pesanan dari semua marketplace dalam satu dashboard', icon: ShoppingCart },
      { title: 'Channel Pricing', desc: 'Atur harga dan promosi berbeda per marketplace', icon: Tag },
    ],
    stats: [{ label: 'Marketplaces', value: '5+' }, { label: 'Sync Mode', value: 'Real-time' }, { label: 'Channels', value: 'Multi' }],
  },
  settings: {
    name: 'Pengaturan',
    tagline: 'Konfigurasi Sistem, Modul & Preferensi',
    longDesc: 'Pusat konfigurasi seluruh sistem ERP Anda. Atur modul aktif, konfigurasi pajak, mata uang, format struk, metode pembayaran, dan preferensi bisnis lainnya.',
    icon: Settings, gradient: 'from-gray-500 to-gray-600', gradientBg: 'from-gray-800 via-gray-900 to-slate-950', href: '/hq/settings', category: 'Sistem',
    highlights: ['Modul management: aktifkan/nonaktifkan modul', 'Konfigurasi pajak, mata uang, dan format', 'Pengaturan struk, payment, dan notifikasi'],
    features: [
      { title: 'Module Management', desc: 'Aktifkan atau nonaktifkan modul sesuai kebutuhan bisnis Anda', icon: Package },
      { title: 'Tax Configuration', desc: 'Atur PPN, pajak layanan, dan aturan pajak per produk', icon: FileText },
      { title: 'Payment Methods', desc: 'Konfigurasi metode pembayaran yang diterima', icon: CreditCard },
      { title: 'Receipt & Branding', desc: 'Desain struk dengan logo, informasi bisnis, dan pesan kustom', icon: FileText },
    ],
    stats: [{ label: 'Config Options', value: '100+' }, { label: 'Module Control', value: 'Full' }, { label: 'Customization', value: 'Flexible' }],
  },
};

// ═══════════════════════════════════════════════════════
// Add-on Recommendations per Module
// ═══════════════════════════════════════════════════════
const ADDON_RECS: Record<string, { code: string; reason: string }[]> = {
  dashboard: [
    { code: 'reports', reason: 'Laporan konsolidasi mendalam dari semua data dashboard' },
    { code: 'finance', reason: 'Analisis keuangan real-time langsung di dashboard' },
    { code: 'hris', reason: 'Monitor KPI karyawan dan kehadiran dari dashboard' },
  ],
  pos: [
    { code: 'inventory', reason: 'Auto-deduct stok setiap transaksi POS' },
    { code: 'finance', reason: 'Jurnal otomatis dari setiap penjualan' },
    { code: 'whatsapp', reason: 'Kirim struk digital via WhatsApp ke pelanggan' },
    { code: 'crm', reason: 'Track pembelian pelanggan untuk loyalty program' },
  ],
  branches: [
    { code: 'dashboard', reason: 'Monitor performa semua cabang dari satu layar' },
    { code: 'hris', reason: 'Kelola karyawan dan shift per cabang' },
    { code: 'inventory', reason: 'Sinkronisasi stok dan transfer antar cabang' },
  ],
  inventory: [
    { code: 'pos', reason: 'Auto-deduct stok saat transaksi penjualan' },
    { code: 'products', reason: 'Master data produk terintegrasi dengan stok' },
    { code: 'marketplace', reason: 'Sync stok ke semua marketplace otomatis' },
    { code: 'tms', reason: 'Tracking pengiriman barang dari gudang' },
  ],
  products: [
    { code: 'inventory', reason: 'Tracking stok untuk setiap produk dan varian' },
    { code: 'pos', reason: 'Produk langsung tampil di kasir' },
    { code: 'marketplace', reason: 'Publish produk ke marketplace otomatis' },
  ],
  finance: [
    { code: 'pos', reason: 'Data penjualan otomatis masuk ke pembukuan' },
    { code: 'hris', reason: 'Payroll otomatis terbukukan di jurnal keuangan' },
    { code: 'reports', reason: 'Laporan keuangan komprehensif dengan drill-down' },
  ],
  hris: [
    { code: 'finance', reason: 'Payroll otomatis terbukukan ke sistem keuangan' },
    { code: 'crm', reason: 'Data karyawan sales terintegrasi dengan SFA' },
    { code: 'fms', reason: 'Data driver terintegrasi dari database karyawan' },
  ],
  users: [
    { code: 'audit', reason: 'Lacak semua aktivitas pengguna untuk keamanan' },
    { code: 'hris', reason: 'Database karyawan terintegrasi dengan akun user' },
  ],
  crm: [
    { code: 'marketing', reason: 'Campaign marketing berdasarkan data CRM' },
    { code: 'whatsapp', reason: 'Komunikasi otomatis dengan pelanggan via WhatsApp' },
    { code: 'pos', reason: 'Track pembelian untuk customer lifetime value' },
  ],
  marketing: [
    { code: 'crm', reason: 'Segmentasi pelanggan dari data CRM untuk targeting' },
    { code: 'whatsapp', reason: 'Broadcast promo langsung ke WhatsApp pelanggan' },
    { code: 'pos', reason: 'Promo otomatis berlaku di kasir saat checkout' },
  ],
  fms: [
    { code: 'tms', reason: 'Armada kendaraan siap diassign untuk pengiriman' },
    { code: 'hris', reason: 'Data driver terintegrasi dari HR database' },
    { code: 'finance', reason: 'Biaya operasional kendaraan masuk pembukuan' },
  ],
  tms: [
    { code: 'fms', reason: 'Kelola kendaraan dan driver untuk setiap trip' },
    { code: 'inventory', reason: 'Tracking pengiriman barang dari warehouse' },
    { code: 'crm', reason: 'Update status pengiriman ke pelanggan otomatis' },
  ],
  reports: [
    { code: 'finance', reason: 'Laporan keuangan komprehensif' },
    { code: 'crm', reason: 'Analisis performa sales dan pipeline' },
    { code: 'hris', reason: 'Laporan HR: kehadiran, turnover, produktivitas' },
  ],
  audit: [
    { code: 'users', reason: 'Monitoring aktivitas berdasarkan role dan user' },
    { code: 'settings', reason: 'Lacak perubahan konfigurasi sistem' },
  ],
  whatsapp: [
    { code: 'crm', reason: 'Database pelanggan untuk broadcast tertarget' },
    { code: 'pos', reason: 'Kirim struk dan notifikasi order otomatis' },
    { code: 'marketing', reason: 'Campaign marketing via WhatsApp channel' },
  ],
  marketplace: [
    { code: 'inventory', reason: 'Sync stok otomatis ke semua channel' },
    { code: 'products', reason: 'Master produk terpusat untuk semua marketplace' },
    { code: 'pos', reason: 'Pesanan marketplace otomatis masuk ke POS' },
  ],
  settings: [
    { code: 'audit', reason: 'Lacak setiap perubahan konfigurasi' },
    { code: 'users', reason: 'Kelola siapa yang bisa mengubah pengaturan' },
  ],
};

// ═══════════════════════════════════════════════════════
// Industry-specific Articles
// ═══════════════════════════════════════════════════════
const INDUSTRY_ARTICLES: Record<string, Article[]> = {
  fnb: [
    { title: '5 Strategi Meningkatkan Revenue Restoran dengan Teknologi POS', excerpt: 'Pelajari bagaimana sistem POS modern dapat meningkatkan efisiensi operasional dan revenue restoran Anda hingga 30% melalui upselling otomatis, analitik menu, dan loyalty program.', category: 'Strategi Bisnis', readTime: '8 menit', icon: ShoppingCart, color: 'bg-blue-50 text-blue-600' },
    { title: 'Cara Efektif Mengelola Food Cost di Bisnis F&B', excerpt: 'Food cost yang tidak terkontrol adalah pembunuh margin terbesar di bisnis F&B. Temukan cara menggunakan recipe management dan inventory tracking untuk menjaga food cost di bawah 35%.', category: 'Operasional', readTime: '6 menit', icon: Package, color: 'bg-emerald-50 text-emerald-600' },
    { title: 'Tren Digital F&B 2026: AI, Automation & Customer Experience', excerpt: 'Industri F&B bergerak cepat ke era digital. Dari AI-powered menu recommendations hingga automated kitchen display, simak tren yang akan mendominasi tahun ini.', category: 'Tren Industri', readTime: '10 menit', icon: Sparkles, color: 'bg-violet-50 text-violet-600' },
  ],
  retail: [
    { title: 'Omnichannel Retail: Strategi Integrasi Online & Offline', excerpt: 'Pelanggan modern berbelanja di mana saja. Pelajari cara mengintegrasikan toko fisik dengan marketplace dan online store untuk pengalaman seamless yang meningkatkan konversi.', category: 'Strategi Bisnis', readTime: '9 menit', icon: Globe, color: 'bg-blue-50 text-blue-600' },
    { title: 'Manajemen Inventory Cerdas untuk Bisnis Retail Modern', excerpt: 'Overstock dan stockout sama-sama merugikan. Gunakan data analytics dan AI forecasting untuk menjaga level stok optimal di setiap lokasi toko Anda.', category: 'Operasional', readTime: '7 menit', icon: Package, color: 'bg-emerald-50 text-emerald-600' },
    { title: 'Loyalty Program yang Efektif: Meningkatkan Repeat Customer', excerpt: 'Akuisisi pelanggan baru 5x lebih mahal dari mempertahankan yang ada. Temukan formula loyalty program yang benar-benar meningkatkan retention rate.', category: 'Customer', readTime: '6 menit', icon: Star, color: 'bg-amber-50 text-amber-600' },
  ],
  distribution: [
    { title: 'Optimalisasi Supply Chain dengan Teknologi ERP', excerpt: 'Supply chain yang efisien adalah competitive advantage utama di bisnis distribusi. Pelajari bagaimana ERP terintegrasi mempercepat fulfillment dan mengurangi biaya logistik.', category: 'Supply Chain', readTime: '8 menit', icon: Truck, color: 'bg-orange-50 text-orange-600' },
    { title: 'Sales Force Automation: Meningkatkan Produktivitas Tim Lapangan', excerpt: 'Tim sales lapangan Anda bisa 40% lebih produktif dengan SFA. Dari route optimization hingga field order digital, simak cara memaksimalkan kunjungan harian.', category: 'Sales', readTime: '7 menit', icon: Map, color: 'bg-blue-50 text-blue-600' },
    { title: 'Fleet Management Best Practices untuk Perusahaan Distribusi', excerpt: 'Armada kendaraan adalah aset terbesar di bisnis distribusi. Optimalkan maintenance schedule, fuel efficiency, dan driver productivity dengan sistem fleet digital.', category: 'Operasional', readTime: '9 menit', icon: Truck, color: 'bg-emerald-50 text-emerald-600' },
  ],
  manufacturing: [
    { title: 'Integrasi Production Planning dengan Inventory Management', excerpt: 'Produksi yang efisien dimulai dari perencanaan material yang akurat. Pelajari cara mengintegrasikan jadwal produksi dengan ketersediaan bahan baku secara real-time.', category: 'Produksi', readTime: '8 menit', icon: Settings, color: 'bg-violet-50 text-violet-600' },
    { title: 'Quality Control Digital: Dari Manual ke Otomatisasi', excerpt: 'Transisi dari checklist kertas ke QC digital meningkatkan akurasi dan traceability. Temukan langkah-langkah implementasi quality control berbasis ERP.', category: 'Quality', readTime: '7 menit', icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
    { title: 'HRIS untuk Manufaktur: Kelola Shift & Overtime Lebih Efisien', excerpt: 'Industri manufaktur dengan shift kompleks membutuhkan HRIS yang mumpuni. Dari rotasi shift otomatis hingga kalkulasi overtime akurat sesuai UU Ketenagakerjaan.', category: 'SDM', readTime: '6 menit', icon: Clock, color: 'bg-cyan-50 text-cyan-600' },
  ],
  services: [
    { title: 'CRM Best Practices untuk Bisnis Jasa Profesional', excerpt: 'Relasi pelanggan adalah segalanya di bisnis jasa. Pelajari cara membangun customer 360° view dan automasi follow-up untuk meningkatkan client retention.', category: 'Customer', readTime: '8 menit', icon: Briefcase, color: 'bg-pink-50 text-pink-600' },
    { title: 'Project Management Terintegrasi dengan ERP', excerpt: 'Kelola proyek, alokasi resource, timesheet, dan billing dalam satu platform. Tingkatkan profitabilitas proyek dengan visibility real-time.', category: 'Project', readTime: '7 menit', icon: Target, color: 'bg-blue-50 text-blue-600' },
    { title: 'Invoice & Billing Automation untuk Efisiensi Keuangan', excerpt: 'Otomatisasi invoice dari timesheet dan kontrak mengurangi errors dan mempercepat cash collection. Simak best practices billing automation.', category: 'Keuangan', readTime: '6 menit', icon: Wallet, color: 'bg-amber-50 text-amber-600' },
  ],
  logistics: [
    { title: 'TMS Modern: Optimalisasi Pengiriman End-to-End', excerpt: 'Transportation Management System yang baik bisa mengurangi biaya pengiriman 15-20%. Dari route optimization hingga carrier management, simak cara implementasinya.', category: 'Transport', readTime: '9 menit', icon: Send, color: 'bg-lime-50 text-lime-600' },
    { title: 'GPS Tracking & Geofencing untuk Armada Pengiriman', excerpt: 'Real-time visibility armada meningkatkan on-time delivery rate. Pelajari cara mengimplementasikan GPS tracking dan geofencing yang efektif.', category: 'Fleet', readTime: '7 menit', icon: Map, color: 'bg-blue-50 text-blue-600' },
    { title: 'Analisis Biaya Operasional Kendaraan yang Akurat', excerpt: 'Mengetahui true cost per km setiap kendaraan adalah kunci profitabilitas bisnis logistik. Gunakan fleet analytics untuk keputusan yang data-driven.', category: 'Keuangan', readTime: '8 menit', icon: PieChart, color: 'bg-emerald-50 text-emerald-600' },
  ],
};

// ═══════════════════════════════════════════════════════
// Industry-specific FAQ
// ═══════════════════════════════════════════════════════
const INDUSTRY_FAQ: Record<string, FAQItem[]> = {
  fnb: [
    { question: 'Apakah Bedagang cocok untuk restoran dengan banyak cabang?', answer: 'Ya, Bedagang dirancang untuk multi-branch operation. Anda bisa mengelola semua cabang dari satu dashboard HQ, dengan data yang tersinkronisasi real-time. Setiap cabang bisa memiliki konfigurasi menu, harga, dan pajak yang berbeda.' },
    { question: 'Bagaimana integrasi POS dengan Kitchen Display System?', answer: 'Order dari POS otomatis masuk ke Kitchen Display System (KDS) berdasarkan station (hot kitchen, cold kitchen, beverage, dll). Setiap station melihat hanya item yang relevan, dan status ready otomatis update ke POS dan pelanggan.' },
    { question: 'Apakah bisa menghitung food cost per menu?', answer: 'Ya, melalui modul Recipe Management yang terintegrasi dengan Inventory. Anda bisa mendefinsikan resep dengan bahan dan porsi, lalu sistem otomatis menghitung food cost berdasarkan harga beli terkini dari supplier.' },
    { question: 'Metode pembayaran apa saja yang didukung?', answer: 'Bedagang POS mendukung tunai, QRIS (semua e-wallet), GoPay, OVO, Dana, ShopeePay, kartu debit/kredit (via payment gateway), dan split payment kombinasi. Anda juga bisa menambahkan metode kustom.' },
    { question: 'Berapa lama proses setup untuk restoran baru?', answer: 'Setup dasar (produk, kategori, pajak, struk) bisa selesai dalam 1-2 hari. Setup lengkap termasuk inventory, karyawan, dan keuangan membutuhkan 3-5 hari kerja dengan pendampingan tim kami.' },
  ],
  retail: [
    { question: 'Bisakah Bedagang terhubung ke Tokopedia dan Shopee?', answer: 'Ya, melalui modul Marketplace Integration. Produk dan stok di-sync otomatis ke Tokopedia, Shopee, dan marketplace lain. Pesanan dari marketplace juga otomatis masuk ke sistem untuk diproses.' },
    { question: 'Bagaimana mengelola stok di beberapa toko?', answer: 'Modul Inventory mendukung multi-warehouse dan multi-branch. Anda bisa melihat stok di setiap lokasi, melakukan transfer antar toko, dan set alert stok minimum per lokasi.' },
    { question: 'Apakah ada fitur loyalty dan membership?', answer: 'Ya, melalui modul Loyalty & CRM. Anda bisa membuat program poin, membership tier, voucher, dan diskon khusus member. Data pembelian pelanggan terekam otomatis untuk personalized offers.' },
    { question: 'Bagaimana menangani return dan refund?', answer: 'POS Bedagang mendukung proses return dan refund langsung. Return bisa berupa tukar barang atau refund uang, dan stok otomatis di-update ke inventory. Semua transaksi return tercatat di audit log.' },
    { question: 'Apakah mendukung barcode dan label printing?', answer: 'Ya, sistem mendukung scan barcode (1D dan 2D/QR), generate barcode untuk produk baru, dan printing label harga. Kompatibel dengan thermal printer dan barcode scanner populer.' },
  ],
  distribution: [
    { question: 'Apakah ada fitur untuk tim sales lapangan?', answer: 'Ya, modul SFA (Sales Force Automation) menyediakan visit tracking dengan GPS check-in, field order creation, target management, route planning, dan coverage monitoring untuk tim sales lapangan.' },
    { question: 'Bagaimana mengelola armada kendaraan distribusi?', answer: 'Modul Fleet Management (FMS) mengelola seluruh armada: master kendaraan, driver, jadwal maintenance, BBM, inspeksi, dan cost analysis. Terintegrasi dengan TMS untuk assignment trip pengiriman.' },
    { question: 'Apakah bisa menghitung komisi dan insentif sales?', answer: 'Ya, modul SFA Enhanced mendukung skema insentif fleksibel: komisi per produk, tier achievement, bonus target, dan plafon per salesperson. Perhitungan otomatis berdasarkan data penjualan aktual.' },
    { question: 'Bagaimana proses purchase order ke supplier?', answer: 'Melalui modul Inventory, Anda bisa membuat PO ke supplier, tracking approval, monitor status pengiriman, dan goods receipt saat barang diterima. Stok otomatis update dan jurnal terbukukan.' },
    { question: 'Apakah ada approval workflow untuk order dan expenses?', answer: 'Ya, sistem mendukung multi-level approval untuk purchase order, field order, expenses, dan dokumen lainnya. Anda bisa konfigurasi approval steps berdasarkan nominal dan tipe transaksi.' },
  ],
  manufacturing: [
    { question: 'Bagaimana Bedagang membantu proses manufaktur?', answer: 'Bedagang menyediakan modul Inventory untuk raw material management, recipe/BOM tracking, purchase order ke supplier, dan stock opname. Terintegrasi dengan Finance untuk costing dan HR untuk manajemen shift produksi.' },
    { question: 'Apakah mendukung multi-gudang untuk raw material dan finished goods?', answer: 'Ya, modul Inventory mendukung unlimited warehouse dengan zona dan lokasi. Anda bisa pisahkan gudang raw material, WIP, finished goods, dan quarantine dengan transfer workflow antar gudang.' },
    { question: 'Bagaimana mengelola shift karyawan produksi?', answer: 'Modul HRIS menyediakan 8 template shift (termasuk shift malam dengan cross-day), rotasi shift otomatis, dan overtime tracking. Absensi bisa menggunakan GPS geofencing di area pabrik.' },
    { question: 'Apakah ada fitur quality control?', answer: 'Melalui stock opname dan goods receipt inspection, Anda bisa melakukan quality check saat penerimaan barang dan selama proses produksi. Compliance checklist juga tersedia melalui modul Industrial Relations.' },
    { question: 'Bisakah menghitung HPP (Harga Pokok Produksi)?', answer: 'Ya, melalui integrasi Inventory (bahan baku) dan Finance (biaya overhead, tenaga kerja), sistem bisa menghitung HPP per produk. Cost history tracking juga tersedia untuk analisis tren biaya.' },
  ],
  services: [
    { question: 'Bagaimana Bedagang cocok untuk bisnis jasa profesional?', answer: 'Bedagang menyediakan CRM untuk client management, Project Management untuk tracking proyek dan timesheet, Finance untuk invoicing dan billing, serta HRIS untuk kelola tim profesional Anda.' },
    { question: 'Apakah ada fitur project management dan timesheet?', answer: 'Ya, modul HRIS Project Management mencakup project planning, worker assignment, timesheet tracking, dan project payroll. Anda bisa menghitung profitabilitas per proyek berdasarkan timesheet vs billing.' },
    { question: 'Bagaimana mengelola invoice ke klien?', answer: 'Modul Finance menyediakan fitur invoice creation, recurring invoices, payment tracking, dan aging analysis untuk piutang. Invoice bisa dikirim otomatis via email atau WhatsApp.' },
    { question: 'Apakah CRM bisa mencatat semua interaksi dengan klien?', answer: 'Ya, CRM 360° mencatat semua interaksi: meeting, call, email, WhatsApp, dan note. Dengan timeline view, tim Anda bisa melihat seluruh riwayat hubungan dengan setiap klien.' },
    { question: 'Bisakah mengelola kontrak dan SLA?', answer: 'Ya, modul CRM menyediakan ticket management dengan SLA tracking, dan modul HRIS Industrial Relations mendukung contract management. Anda bisa set reminder otomatis untuk kontrak yang mendekati expired.' },
  ],
  logistics: [
    { question: 'Apakah Bedagang cocok untuk perusahaan logistik?', answer: 'Sangat cocok. Dengan modul TMS (Transportation Management) dan FMS (Fleet Management), Anda bisa mengelola seluruh operasional logistik: shipment, trip planning, carrier management, armada kendaraan, dan proof of delivery.' },
    { question: 'Bagaimana tracking pengiriman secara real-time?', answer: 'Modul TMS menyediakan shipment lifecycle tracking dari created hingga delivered. Dengan integrasi GPS dari FMS, Anda bisa monitor posisi kendaraan dan estimasi waktu kedatangan secara real-time.' },
    { question: 'Apakah ada fitur rate card dan freight billing?', answer: 'Ya, TMS mendukung rate card per zone, service type, dan tipe kendaraan. Freight billing otomatis digenerate berdasarkan shipment data dan rate card, siap untuk invoicing ke pelanggan.' },
    { question: 'Bagaimana mengelola biaya operasional per kendaraan?', answer: 'FMS mencatat semua biaya: BBM, maintenance, asuransi, ban, dan overhead. Dashboard cost analysis menampilkan total cost of ownership per kendaraan, cost per km, dan perbandingan efisiensi armada.' },
    { question: 'Apakah ada fitur proof of delivery digital?', answer: 'Ya, TMS menyediakan digital proof of delivery (ePOD) dengan tanda tangan digital, foto barang, dan catatan penerima. Data ePOD langsung tersinkronisasi ke sistem untuk proses billing dan reporting.' },
  ],
};

// ═══════════════════════════════════════════════════════
// Helper: Map business type to industry group
// ═══════════════════════════════════════════════════════
function getIndustryGroup(businessType: string | null): string {
  if (!businessType) return 'retail';
  const map: Record<string, string> = {
    fine_dining: 'fnb', cloud_kitchen: 'fnb', qsr: 'fnb', cafe: 'fnb', catering: 'fnb', bakery: 'fnb',
    retail: 'retail', minimarket: 'retail', supermarket: 'retail', fashion: 'retail', electronics: 'retail',
    distribution: 'distribution', wholesale: 'distribution', fmcg: 'distribution',
    manufacturing: 'manufacturing', production: 'manufacturing',
    services: 'services', consulting: 'services', agency: 'services',
    logistics: 'logistics', rental_bus: 'logistics', rental_truck: 'logistics', rental_car: 'logistics', rental_heavy_equipment: 'logistics',
  };
  return map[businessType] || 'retail';
}

function getIndustryLabel(group: string): string {
  const labels: Record<string, string> = {
    fnb: 'Food & Beverage', retail: 'Retail & Commerce', distribution: 'Distribution & Supply Chain',
    manufacturing: 'Manufacturing', services: 'Professional Services', logistics: 'Logistics & Transportation',
  };
  return labels[group] || 'Bisnis Umum';
}

// ═══════════════════════════════════════════════════════
// Page Component
// ═══════════════════════════════════════════════════════
export default function ModuleDetailPage() {
  const router = useRouter();
  const { code } = router.query;
  const { businessType } = useBusinessType();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const moduleCode = typeof code === 'string' ? code : '';
  const mod = MODULE_DETAILS[moduleCode];
  const industryGroup = getIndustryGroup(businessType);
  const industryLabel = getIndustryLabel(industryGroup);
  const articles = INDUSTRY_ARTICLES[industryGroup] || INDUSTRY_ARTICLES['retail'];
  const faqs = INDUSTRY_FAQ[industryGroup] || INDUSTRY_FAQ['retail'];
  const recs = (ADDON_RECS[moduleCode] || [])
    .filter(r => MODULE_DETAILS[r.code])
    .map(r => ({ ...r, mod: MODULE_DETAILS[r.code] }));

  if (!mod) {
    return (
      <HQLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <HelpCircle className="w-16 h-16 text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Modul Tidak Ditemukan</h1>
          <p className="text-gray-500 mb-6">Modul dengan kode &quot;{moduleCode}&quot; tidak tersedia.</p>
          <Link href="/hq/home" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
            Kembali ke Beranda
          </Link>
        </div>
      </HQLayout>
    );
  }

  const Icon = mod.icon;

  return (
    <HQLayout>
      <Head>
        <title>{mod.name} - Bedagang ERP</title>
      </Head>

      <div className="w-full space-y-8">
        {/* ═══ Back Navigation ═══ */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/hq/home')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-400">{mod.category}</span>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-700">{mod.name}</span>
        </div>

        {/* ═══ HERO SECTION ═══ */}
        <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br ${mod.gradientBg} p-6 sm:p-8 lg:p-10`}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          </div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-5">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${mod.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-white/40 uppercase tracking-wider">{mod.category}</span>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">{mod.name}</h1>
                  </div>
                </div>
                <p className="text-lg sm:text-xl text-white/80 font-medium mb-4">{mod.tagline}</p>
                <p className="text-sm sm:text-base text-white/50 leading-relaxed max-w-2xl">{mod.longDesc}</p>

                <div className="flex flex-wrap gap-3 mt-6">
                  <Link
                    href={mod.href}
                    className={`inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg`}
                  >
                    <Play className="w-4 h-4" />
                    Buka {mod.name}
                  </Link>
                  <button
                    onClick={() => {
                      const el = document.getElementById('features-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors border border-white/10"
                  >
                    Lihat Fitur
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-row lg:flex-col gap-4 lg:gap-5 lg:min-w-[200px]">
                {mod.stats.map((s, i) => (
                  <div key={i} className="bg-white/[0.08] backdrop-blur-sm border border-white/[0.08] rounded-xl px-5 py-4 flex-1 lg:flex-none">
                    <p className="text-[11px] uppercase tracking-wider text-white/30 mb-1">{s.label}</p>
                    <p className="text-xl font-bold text-white">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Highlights */}
            <div className="mt-8 pt-6 border-t border-white/[0.06]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {mod.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <p className="text-sm text-white/60">{h}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ FEATURES SECTION ═══ */}
        <div id="features-section">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.gradient} flex items-center justify-center`}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Fitur Unggulan</h2>
              <p className="text-sm text-gray-500">Kemampuan utama modul {mod.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mod.features.map((feat, i) => {
              const FeatIcon = feat.icon;
              return (
                <div key={i} className="group bg-white rounded-xl border border-gray-200/60 p-5 hover:shadow-lg hover:border-gray-300/80 hover:-translate-y-0.5 transition-all duration-200">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <FeatIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{feat.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ ADDON RECOMMENDATIONS ═══ */}
        {recs.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Modul Tambahan yang Direkomendasikan</h2>
                <p className="text-sm text-gray-500">Tingkatkan kemampuan {mod.name} dengan modul pelengkap</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recs.map((rec) => {
                const RecIcon = rec.mod.icon;
                return (
                  <Link
                    key={rec.code}
                    href={`/hq/modules/${rec.code}`}
                    className="group bg-white rounded-xl border border-gray-200/60 p-5 hover:shadow-lg hover:border-gray-300/80 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${rec.mod.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <RecIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-gray-900">{rec.mod.name}</h3>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{rec.reason}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ INDUSTRY ARTICLES ═══ */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Artikel & Insight</h2>
                <p className="text-sm text-gray-500">Konten pilihan untuk industri {industryLabel}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((article, i) => {
              const ArtIcon = article.icon;
              return (
                <div
                  key={i}
                  className="group bg-white rounded-xl border border-gray-200/60 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Article header with gradient */}
                  <div className={`h-32 bg-gradient-to-br ${
                    i === 0 ? 'from-blue-500 to-indigo-600' :
                    i === 1 ? 'from-emerald-500 to-teal-600' :
                    'from-violet-500 to-purple-600'
                  } relative overflow-hidden flex items-center justify-center`}>
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </div>
                    <ArtIcon className="w-12 h-12 text-white/30" />
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${article.color}`}>{article.category}</span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {article.readTime}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{article.excerpt}</p>
                    <div className="flex items-center gap-1.5 mt-4 text-xs font-medium text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      Baca selengkapnya <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ FAQ SECTION ═══ */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Pertanyaan Umum (FAQ)</h2>
              <p className="text-sm text-gray-500">Jawaban untuk pertanyaan yang sering diajukan — industri {industryLabel}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200/60 overflow-hidden divide-y divide-gray-100">
            {faqs.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50/50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900 pr-4">{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 -mt-1">
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ═══ CTA SECTION ═══ */}
        <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r ${mod.gradient} p-8 sm:p-10 text-center`}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          </div>
          <div className="relative z-10">
            <Icon className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Siap Menggunakan {mod.name}?</h2>
            <p className="text-white/70 text-sm mb-6 max-w-lg mx-auto">
              Mulai gunakan modul {mod.name} sekarang dan rasakan peningkatan efisiensi operasional bisnis Anda.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={mod.href}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
              >
                <ExternalLink className="w-4 h-4" />
                Buka {mod.name}
              </Link>
              <Link
                href="/hq/home"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors border border-white/20"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </div>
    </HQLayout>
  );
}
