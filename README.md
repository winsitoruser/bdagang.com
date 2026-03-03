<div align="center">

# BEDAGANG ERP

### Enterprise Resource Planning untuk Bisnis Indonesia

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Platform all-in-one untuk mengelola seluruh aspek bisnis — dari operasional outlet hingga manajemen perusahaan skala enterprise.**

[Demo](https://bedagang.com) · [Dokumentasi](https://docs.bedagang.com) · [Laporkan Bug](https://github.com/winsitoruser/bedagang---PoS/issues)

</div>

---

## Tentang Bedagang

**Bedagang** adalah platform ERP (Enterprise Resource Planning) berbasis web yang dirancang khusus untuk pasar Indonesia. Platform ini menyediakan solusi terintegrasi mulai dari Point of Sale, Warehouse & Inventory, HRIS & Payroll, Keuangan Pro, CRM & Sales Force Automation, Fleet Management, Manufacturing, hingga integrasi WhatsApp Business dan Marketplace — semuanya dalam satu ekosistem terpadu.

Platform mendukung arsitektur **multi-tenant** dengan **multi-cabang**, dimana setiap bisnis memiliki tenant terpisah yang bisa mengelola banyak outlet/cabang dari satu HQ dashboard. Sistem role-based access control memastikan setiap pengguna hanya mengakses fitur sesuai perannya.

### Arsitektur Platform

```
┌──────────────────────────────────────────────────────────────────┐
│                        ADMIN PANEL                               │
│  Tenant Management · KYB Review · Module Assignment · Monitoring │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                      HQ PLATFORM                                 │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │Dashboard │ │Warehouse │ │ Finance  │ │   HRIS & SDM     │   │
│  │Operasi-  │ │& Inven-  │ │ Pro /    │ │ Payroll · KPI ·  │   │
│  │onal      │ │tory      │ │ Lite     │ │ Cuti · Attendance│   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │CRM & SFA │ │Fleet &   │ │Manu-     │ │  Integrasi       │   │
│  │Marketing │ │TMS       │ │facturing │ │ WA · Marketplace  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                    BRANCH / OUTLET                                │
│  POS · Inventori · Pelanggan · Kitchen · Meja · Reservasi · Promo│
└──────────────────────────────────────────────────────────────────┘
```

### Jenis Bisnis yang Didukung

| Kategori | Contoh |
|---|---|
| **F&B / Restoran** | Restoran, kafe, katering, cloud kitchen |
| **Retail** | Toko kelontong, minimarket, supermarket |
| **Fashion & Beauty** | Butik, salon, barbershop, spa |
| **Farmasi & Kesehatan** | Apotek, klinik, toko alkes |
| **Elektronik** | Toko gadget, komputer, servis elektronik |
| **Otomotif** | Bengkel, dealer, sparepart |
| **Grocery** | Toko bahan makanan, frozen food |
| **Jasa & Servis** | Laundry, percetakan, rental |

---

## Modul & Fitur

### 1. Onboarding & KYB (Know Your Business)

Proses registrasi dan verifikasi bisnis terotomasi dengan provisioning berdasarkan jenis usaha.

- **Registrasi 4 langkah** — Buat akun, verifikasi email, lengkapi KYB 6 tahap, aktivasi
- **KYB 6 tahap** — Kategori bisnis, data perusahaan, dokumen legal, struktur bisnis, kontak PIC, review & submit
- **Auto-provisioning** — Sistem otomatis membuat tenant, cabang, clone konfigurasi default, dan assign modul berdasarkan jenis bisnis
- **Admin review** — Dashboard khusus admin untuk verifikasi dokumen dan approve/reject KYB
- **Business code** — Setiap bisnis mendapat kode unik (BUS-XXX) yang di-generate otomatis

### 2. Dashboard & Home

Pusat kontrol dan monitoring bisnis real-time dengan widget yang disesuaikan per modul aktif.

- **Home HQ** — Overview semua modul aktif dengan akses cepat, grouped by kategori (Core, Operasional, Keuangan, SDM, Sales, Logistik, Integrasi)
- **Dashboard Operasional** — Metrik penjualan, stok, keuangan, dan karyawan dalam satu tampilan
- **Widget dinamis** — Tampilan dashboard menyesuaikan modul yang diaktifkan tenant
- **Multi-cabang overview** — Perbandingan performa antar cabang
- **Real-time data** — Data terupdate dari semua modul terintegrasi

### 3. Manajemen Cabang

Kelola semua outlet/cabang dari satu dashboard HQ.

- **Daftar Cabang** — CRUD cabang dengan info alamat, kontak, jam operasional, dan status
- **Performa Cabang** — Analisis penjualan, transaksi, dan pertumbuhan per cabang
- **Pengaturan Cabang** — Konfigurasi per-cabang: receipt, pajak, pembayaran, dan preferensi
- **Inisialisasi Cabang** — Setup otomatis untuk cabang baru dengan template konfigurasi
- **Modul per Cabang** — Kontrol modul mana yang aktif di setiap cabang
- **Real-time Sync** — Sinkronisasi data antar HQ dan cabang

### 4. Point of Sale (POS)

Sistem kasir modern untuk transaksi di outlet/cabang.

- **Interface kasir intuitif** — Tampilan grid produk, search, kategori, dan barcode scan
- **Multi-payment** — Cash, kartu debit/kredit, e-wallet (GoPay, OVO, Dana, ShopeePay), QRIS, transfer bank
- **Shift management** — Buka/tutup shift, handover antar kasir, rekap per shift
- **Diskon & promosi** — Diskon per item, diskon total, voucher, promo otomatis
- **Receipt** — Cetak struk thermal, digital invoice via email/WhatsApp
- **Offline mode** — Transaksi tetap berjalan saat koneksi terputus, sync otomatis saat online
- **Kitchen Display System (KDS)** — Integrasi langsung ke dapur untuk bisnis F&B
- **Manajemen meja** — Layout meja visual, status (kosong/terisi/reserved), merge/split bill
- **Reservasi** — Booking meja online dengan konfirmasi otomatis

### 5. Warehouse & Inventory

Manajemen gudang dan stok terpusat dengan tracking real-time.

- **Dashboard Inventory** — Overview stok global, alert, movement, dan valuasi
- **Master Produk** — CRUD produk dengan SKU, barcode, gambar, varian, HPP, dan harga jual
- **Stok Global** — Lihat level stok di semua gudang/cabang dalam satu tampilan
- **Kategori Produk** — Hierarki kategori produk bertingkat (tree structure)
- **Harga & Pricing** — Price tiers per customer group, harga khusus per cabang, promo pricing
- **Transfer & Requisition** — Transfer stok antar gudang/cabang dengan workflow (draft → pending → approved → in transit → received)
- **Purchase Order** — PO ke supplier dengan approval workflow dan tracking status
- **Supplier Management** — Database supplier dengan histori PO dan performa
- **Penerimaan Barang (Goods Receipt)** — Verifikasi penerimaan dengan auto-update stok
- **Stock Opname** — Stok fisik vs sistem, auto-populate items, adjustment otomatis
- **Stock Alerts** — Notifikasi otomatis untuk stok rendah, expired, dan overstock
- **Batch & Expiry Tracking** — Tracking per batch dengan FIFO/FEFO
- **Stock Movement Audit Trail** — Histori lengkap setiap pergerakan stok

### 6. Manufacturing

Modul produksi untuk bisnis manufaktur dan F&B dengan produksi sendiri.

- **Work Orders** — Perintah kerja produksi dengan status tracking (planned → in progress → completed)
- **Bill of Materials (BOM)** — Resep/formula produk dengan komponen, kuantitas, dan biaya
- **Routing** — Urutan proses produksi antar work center
- **Work Centers** — Manajemen area kerja dan kapasitas produksi
- **Mesin & Equipment** — Database mesin dengan jadwal maintenance
- **Quality Control** — Inspeksi kualitas per batch dengan pass/fail/conditional
- **Production Planning** — Perencanaan produksi berdasarkan demand dan kapasitas
- **OEE Analytics** — Overall Equipment Effectiveness monitoring
- **Production Costing** — Kalkulasi biaya produksi per unit (material + labor + overhead)
- **Waste & Scrap Tracking** — Pencatatan dan analisis limbah produksi

### 7. Keuangan Pro

Modul akuntansi dan keuangan lengkap untuk pengelolaan finansial bisnis.

- **Dashboard Keuangan** — Overview revenue, expense, profit, dan cash flow real-time
- **Analisis Revenue** — Breakdown pendapatan per cabang, produk, dan periode
- **Pengeluaran** — Pencatatan dan kategorisasi biaya operasional
- **Laba Rugi (P&L)** — Laporan profit & loss otomatis per periode
- **Arus Kas (Cash Flow)** — Tracking aliran uang masuk dan keluar
- **Invoice** — Pembuatan, pengiriman, dan tracking pembayaran invoice
- **Piutang & Hutang (AR/AP)** — Manajemen accounts receivable dan payable dengan aging analysis
- **Anggaran (Budget)** — Perencanaan dan monitoring budget per departemen/cabang
- **Pajak** — Kalkulasi PPN, PPh, dan pelaporan pajak
- **E-Document** — Generate PDF/Excel untuk invoice, receipt, laporan keuangan (50+ tipe dokumen)

**Keuangan Lite** — Versi ringkas dengan daftar transaksi dan ringkasan harian untuk bisnis kecil.

### 8. HRIS & Sumber Daya Manusia

Sistem manajemen SDM lengkap dari database karyawan hingga payroll.

#### 8.1 Database Karyawan
- **Profil lengkap** — Data personal, keluarga, pendidikan, sertifikasi, keahlian, pengalaman kerja
- **Dokumen digital** — Upload dan kelola KTP, NPWP, BPJS, kontrak (PKWT/PKWTT/Magang/Freelance)
- **Struktur organisasi** — Hierarki organisasi visual (tree view) dengan drag & drop
- **Job grading** — 10 level grade (G1-G10) dengan salary range, benefit, dan leave quota

#### 8.2 Kehadiran & Shift
- **Clock-in/out** — Multi-method: fingerprint, face recognition, GPS, QR code, manual, NFC
- **Geofencing** — Validasi lokasi absensi berdasarkan radius GPS
- **Manajemen shift** — Template shift (pagi/siang/malam/office/split/flex), toleransi keterlambatan
- **Rotasi shift** — Pola rotasi otomatis (mingguan/bi-weekly/bulanan) dengan auto-generate jadwal
- **Live monitoring** — Dashboard real-time kehadiran hari ini
- **Overtime** — Request & approval lembur dengan multiplier konfigurasi
- **Koreksi absensi** — Request koreksi dengan approval workflow

#### 8.3 KPI & Performance
- **Template KPI** — Konfigurasi indikator per posisi/departemen dengan bobot
- **Self-assessment** — Karyawan mengisi pencapaian sendiri
- **Performance review** — Review berkala oleh atasan dengan scoring
- **9-Box Matrix** — Visualisasi talent mapping

#### 8.4 Manajemen Cuti
- **10 tipe cuti** — Tahunan, sakit, melahirkan, menikah, kedukaan, ibadah, dll.
- **Multi-level approval** — Konfigurasi approval bertingkat per tipe cuti
- **Saldo cuti** — Tracking otomatis saldo dan penggunaan per karyawan
- **Kalender cuti** — Visualisasi jadwal cuti tim

#### 8.5 Payroll
- **15 komponen gaji** — Gaji pokok, tunjangan, BPJS, PPh 21, lembur, potongan
- **Payroll run** — Kalkulasi batch per periode dengan draft → approve → pay workflow
- **Slip gaji PDF** — Generate payslip per karyawan
- **Bulk upload** — Import data gaji via Excel/CSV dengan validasi
- **Template download** — Excel template dengan dropdown validation dan petunjuk pengisian

#### 8.6 Employee Self Service (ESS)
- **Dashboard personal** — Overview data diri, saldo cuti, klaim, dan reminder
- **Pengajuan cuti** — Submit request langsung dari portal
- **Klaim reimbursement** — Upload bukti dan tracking status

#### 8.7 Manager Self Service (MSS)
- **Approval center** — Approve/reject cuti, klaim, mutasi dari satu dashboard
- **Team overview** — Lihat data tim, kehadiran, dan performance

#### 8.8 Industrial Relations & Legal
- **Peraturan perusahaan** — Database regulasi internal
- **Surat peringatan** — SP1/SP2/SP3 dengan auto-numbering dan masa berlaku
- **Kasus & investigasi** — Tracking kasus IR dengan timeline
- **PHK** — Workflow terminasi dengan clearance tracking
- **Compliance checklist** — Daftar kepatuhan regulasi ketenagakerjaan

#### 8.9 Workforce Analytics
- **Headcount planning** — Perencanaan kebutuhan tenaga kerja
- **Manpower budget** — Anggaran SDM per departemen
- **Turnover analysis** — Analisis tingkat keluar karyawan per bulan/tipe
- **Productivity metrics** — Metrik produktivitas dari data kehadiran

#### 8.10 Engagement & Culture
- **Survey & Pulse** — Buat survey dengan question builder, publish, dan analisis respons
- **Recognition & Reward** — Kudos, achievement, milestone dengan sistem poin
- **Pengumuman** — Broadcast pengumuman dengan pin dan read tracking

#### 8.11 Travel & Expense
- **Perjalanan dinas** — Request perjalanan dengan auto-numbering dan approval
- **Klaim biaya** — Submit expense dengan auto budget tracking
- **Budget control** — Monitoring penggunaan budget per kategori

#### 8.12 Project Management
- **Proyek** — CRUD proyek dengan auto project code dan progress tracking
- **Tenaga kerja** — Assign karyawan ke proyek, link ke kontrak
- **Timesheet** — Pencatatan jam kerja per proyek dengan approval
- **Payroll proyek** — Kalkulasi gaji berdasarkan timesheet × daily rate

### 9. CRM & Sales Force Automation

Manajemen hubungan pelanggan dan otomasi tim sales lapangan.

#### 9.1 CRM — Customer Relationship Management
- **Customer 360°** — Profil pelanggan lengkap dengan 44 kolom data, histori interaksi, dan segmentasi
- **Kontak** — Database kontak per perusahaan dengan multiple PIC
- **Interaksi** — Log semua komunikasi (telepon, email, meeting, WhatsApp)
- **Komunikasi** — Kirim email/SMS/WA langsung dari platform dengan template
- **Task & Kalender** — Manajemen tugas CRM dan jadwal follow-up
- **Tiket & SLA** — Help desk dengan SLA policy dan escalation otomatis
- **Forecasting** — Prediksi revenue berdasarkan pipeline
- **Automasi** — Rule-based automation untuk follow-up, assignment, dan notifikasi
- **Segmentasi** — Segmentasi pelanggan berdasarkan kriteria custom
- **Template Email** — Library template email yang bisa di-personalisasi

#### 9.2 SFA — Sales Force Automation
- **Leads & Pipeline** — Tracking prospek dari lead → opportunity → quotation → closed
- **Tim & Territory** — Pembagian wilayah sales dan manajemen tim
- **Kunjungan & Coverage** — Plan kunjungan, check-in GPS, dan coverage analysis
- **Order & Quotation** — Buat quotation dan field order langsung dari lapangan
- **Target & Achievement** — Setting target per sales/tim/produk dengan tracking pencapaian
- **Insentif & Komisi** — Skema insentif bertingkat dengan auto-calculation
- **Plafon** — Batas kredit per customer dengan monitoring penggunaan
- **Display Audit** — Audit merchandising di toko dengan foto evidence
- **Kompetitor Intelligence** — Pencatatan aktivitas kompetitor
- **Survey** — Template survey untuk feedback pelanggan
- **Approval Workflow** — Multi-step approval untuk quotation, diskon, dan order
- **Geofence** — Validasi lokasi kunjungan sales
- **AI Workflow** — Lead scoring, customer segmentation, sales forecasting, visit optimization
- **Import/Export** — Bulk import/export semua entitas SFA

#### 9.3 Marketing & Campaign
- **Dashboard Marketing** — Overview performa campaign dan ROI
- **Campaign** — Buat dan kelola campaign multi-channel
- **Promosi** — Promo, diskon, dan bundle dengan periode berlaku
- **Segmentasi Pelanggan** — Target audience berdasarkan perilaku dan demografi
- **Budget Marketing** — Alokasi dan tracking pengeluaran marketing

### 10. Fleet Management System (FMS)

Manajemen armada kendaraan perusahaan secara komprehensif.

- **Dashboard FMS** — Overview status kendaraan, driver, maintenance, dan biaya
- **Kendaraan** — Database lengkap kendaraan (tipe, plat, tahun, status, dokumen)
- **Driver** — Profil driver dengan SIM, sertifikasi, dan histori
- **Maintenance** — Jadwal dan histori perawatan (preventive & corrective)
- **BBM** — Pencatatan pengisian BBM dengan efisiensi km/liter
- **Rental** — Manajemen penyewaan kendaraan
- **Inspeksi** — Checklist inspeksi harian/berkala
- **Insiden** — Pencatatan dan tracking kecelakaan/insiden
- **GPS Live** — Tracking lokasi real-time kendaraan di peta
- **Geofence** — Zona virtual dengan alert masuk/keluar
- **Pelanggaran** — Monitoring pelanggaran kecepatan dan rute
- **Fleet Analytics** — Analisis utilisasi, biaya per km, dan efisiensi
- **Manajemen Ban** — Tracking kondisi dan rotasi ban
- **Biaya** — Breakdown biaya per kendaraan (BBM, maintenance, pajak, asuransi)
- **Dokumen** — STNK, KIR, asuransi dengan reminder expired
- **Reminder** — Notifikasi otomatis untuk jadwal maintenance dan dokumen

### 11. Transportation Management System (TMS)

Manajemen pengiriman dan logistik end-to-end.

- **Dashboard TMS** — Overview shipment, trip, dan on-time delivery
- **Shipment** — Tracking pengiriman dari pick-up hingga delivery
- **Trip** — Perencanaan dan pelaksanaan trip dengan multi-stop
- **Dispatch** — Assignment driver dan kendaraan ke shipment
- **Tracking** — Live tracking status pengiriman
- **Carrier** — Database penyedia jasa pengiriman (internal & eksternal)
- **Rute** — Optimasi rute pengiriman
- **Logistics KPI** — Metrik performa logistik (on-time, cost, utilization)
- **Carrier Score** — Rating dan evaluasi performa carrier
- **Delivery SLA** — Monitoring SLA pengiriman per carrier/rute
- **Billing** — Tagihan freight dan biaya logistik
- **Zona** — Pembagian zona pengiriman
- **Tarif (Rate Card)** — Konfigurasi tarif per zona/berat/volume
- **Gudang** — Manajemen warehouse untuk staging dan cross-docking

### 12. Integrasi WhatsApp Business

Komunikasi bisnis otomatis via WhatsApp.

- **Dashboard WA** — Statistik pesan, delivery rate, dan engagement
- **Broadcast** — Kirim pesan massal ke segmen pelanggan
- **Template Pesan** — Library template dengan variabel personalisasi
- **Notifikasi Otomatis** — Invoice, konfirmasi order, reminder pembayaran, pengiriman
- **Pengaturan** — Konfigurasi API key, nomor bisnis, dan webhook

### 13. Integrasi Marketplace

Sinkronisasi toko online dari berbagai marketplace.

- **Dashboard Marketplace** — Overview penjualan dari semua channel
- **Channel Toko** — Koneksi ke Tokopedia, Shopee, Lazada, Bukalapak, dll.
- **Sync Produk** — Sinkronisasi produk, harga, dan stok antar platform
- **Order Marketplace** — Manajemen pesanan dari semua marketplace dalam satu dashboard
- **Pengaturan** — API key, mapping kategori, dan konfigurasi sync

### 14. Laporan & Analytics

Sistem pelaporan komprehensif untuk pengambilan keputusan.

- **Laporan Penjualan** — Per produk, kategori, cabang, kasir, periode, dan metode bayar
- **Laporan Konsolidasi** — Gabungan data dari semua cabang
- **Laporan Stok** — Stock level, movement, aging, dan valuasi
- **Laporan Keuangan** — P&L, balance sheet, cash flow, budget vs actual
- **Audit Log** — Histori lengkap semua aktivitas pengguna di sistem (siapa, kapan, apa)
- **E-Document Export** — 50+ tipe dokumen dalam format PDF, Excel, CSV, dan HTML print

### 15. Pengaturan & Sistem

Konfigurasi platform secara keseluruhan.

- **Modul Manajemen** — Aktifkan/nonaktifkan modul per tenant
- **Global Settings** — Konfigurasi default untuk receipt, pajak, mata uang, dan zona waktu
- **Integrasi Pihak Ketiga** — Kelola koneksi API eksternal
- **Pajak & Biaya** — Template pajak (PPN, PPh) dan biaya layanan
- **Notifikasi** — Konfigurasi email, push notification, dan in-app alert
- **Role & Akses** — 12 role bawaan (super_admin, owner, admin, manager, staff, hq_admin, branch_manager, cashier, inventory_staff, kitchen_staff, finance_staff, hr_staff)
- **Pengguna** — Manajemen user, assignment cabang, dan data scope

### 16. Knowledge Base

Pusat panduan dan dokumentasi platform yang terintegrasi di profil pengguna.

- **19+ artikel** mencakup semua modul dengan panduan step-by-step
- **Business flow diagram** — Visualisasi alur bisnis setiap proses
- **Sequence diagram** — Interaksi antar aktor dan sistem
- **Usage guide** — Panduan penggunaan dengan substep detail
- **FAQ** — Pertanyaan umum per modul
- **Pencarian** — Search across semua artikel
- **Filter** — Filter berdasarkan kategori (10 kategori) dan tingkat kesulitan (pemula/menengah/lanjutan)
- **Arsitektur platform** — Diagram interaktif integrasi antar modul

### 17. Admin Panel

Dashboard admin platform untuk mengelola seluruh tenant.

- **Tenant Management** — Daftar, detail, dan konfigurasi per tenant
- **KYB Review** — Review dan approve/reject aplikasi bisnis baru
- **Module Assignment** — Assign modul per tenant/business type
- **User Management** — Kelola semua user di platform
- **Business Types** — Konfigurasi jenis bisnis dan modul default-nya
- **System Logs** — Log aktivitas sistem dan error
- **Analytics** — Metrik penggunaan platform secara keseluruhan
- **Subscription & Billing** — Manajemen paket langganan tenant

---

## Teknologi

### Frontend
| Teknologi | Keterangan |
|---|---|
| **Next.js 15** | React framework dengan Pages Router dan API Routes |
| **TypeScript** | Type-safe development |
| **Tailwind CSS 3** | Utility-first CSS framework |
| **Radix UI** | Accessible component primitives (dialog, dropdown, tabs, dll.) |
| **Lucide React** | Icon library (284+ icons) |
| **Recharts / ApexCharts** | Data visualization dan charting |
| **React Hook Form + Zod** | Form management dan validasi |
| **Framer Motion** | Animasi dan transisi |
| **FullCalendar** | Kalender interaktif |
| **Leaflet** | Peta interaktif untuk GPS tracking |
| **SWR / Zustand** | State management dan data fetching |

### Backend
| Teknologi | Keterangan |
|---|---|
| **Next.js API Routes** | RESTful API endpoints (200+ endpoint) |
| **PostgreSQL** | Database relasional utama (300+ tabel) |
| **Sequelize ORM** | Object-Relational Mapping |
| **NextAuth.js** | Authentication dengan JWT |
| **Winston** | Structured logging |
| **ExcelJS** | Excel generation dan parsing |
| **jsPDF** | PDF document generation |
| **Nodemailer** | Email transactional |

### Security
- **Session-based authentication** dengan NextAuth.js JWT
- **Role-based access control** (RBAC) — 12 role bawaan
- **Module-based access** — Menu dan API dilindungi per modul
- **API middleware** — `withHQAuth` untuk validasi session, role, dan module
- **Parameterized SQL** — Pencegahan SQL injection
- **Audit logging** — Setiap create/update/delete tercatat

---

## Instalasi

### Prerequisites
- **Node.js** 18+
- **PostgreSQL** 14+
- **npm** atau **yarn**

### Setup Development

```bash
# 1. Clone repository
git clone https://github.com/winsitoruser/bedagang---PoS.git
cd bedagang---PoS

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.development
# Edit .env.development dengan kredensial database Anda

# 4. Setup database
createdb bedagang_dev
npm run db:migrate
npm run db:seed        # (opsional) data contoh

# 5. Jalankan dev server
npm run dev
```

Aplikasi berjalan di `http://localhost:3001`

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bedagang_dev
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bedagang_dev
DB_USER=your_user
DB_PASSWORD=your_password

# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key

# App
NODE_ENV=development
```

---

## Struktur Proyek

```
bedagang---PoS/
├── pages/                    # Next.js pages & API routes
│   ├── api/                  # 200+ API endpoints
│   │   ├── admin/            # Admin panel APIs
│   │   ├── hq/              # HQ platform APIs
│   │   │   ├── branches/    # Branch management
│   │   │   ├── finance/     # Finance module
│   │   │   ├── hris/        # HRIS module (23+ APIs)
│   │   │   ├── inventory/   # Inventory module
│   │   │   ├── sfa/         # CRM & SFA module
│   │   │   ├── fms/         # Fleet management
│   │   │   ├── tms/         # Transportation management
│   │   │   ├── manufacturing/ # Manufacturing
│   │   │   ├── warehouse/   # Warehouse management
│   │   │   └── documents/   # E-Document generation
│   │   ├── auth/            # Authentication (NextAuth)
│   │   └── pos/             # POS transactions
│   ├── hq/                  # HQ platform pages
│   ├── admin/               # Admin panel pages
│   ├── pos/                 # POS interface
│   └── auth/                # Login & register
├── components/               # React components
│   ├── hq/                  # HQ layout & components
│   ├── admin/               # Admin layout
│   ├── dashboard/           # Dashboard widgets
│   ├── documents/           # Document export button
│   └── common/              # Shared components
├── models/                   # Sequelize models (270+ models)
├── migrations/               # Database migrations (120+ files)
├── lib/                      # Core libraries
│   ├── knowledge-base/      # Knowledge base data & types
│   ├── documents/           # PDF & Excel generators
│   ├── middleware/           # withHQAuth, module guards
│   ├── adapters/            # Data adapters
│   └── api/                 # API utilities (pagination, response, validation)
├── config/                   # Configuration
│   ├── sidebar.config.ts    # Sidebar menus (HQ, Branch, Admin)
│   ├── database.ts          # DB connection config
│   └── features.ts          # Feature flags
├── hooks/                    # Custom React hooks
├── types/                    # TypeScript type definitions
├── services/                 # Business logic services
├── middleware/               # API & page middleware
├── scripts/                  # Database scripts & utilities
├── seeders/                  # Database seed data
├── docs/                     # API & module documentation
└── public/                   # Static assets
```

---

## Scripts

```bash
# Development
npm run dev                   # Start dev server (port 3001)
npm run build                 # Production build
npm run start                 # Start production server

# Database
npm run db:migrate            # Run migrations
npm run db:seed               # Seed database
npm run db:migrate:undo:all   # Undo all migrations
npm run db:reset              # Reset DB (undo + migrate + seed)

# Users
npm run create-super-user     # Create super admin user
npm run create-full-access    # Create user with full module access
npm run create-demo-user      # Create demo user

# Testing
npm run test                  # Run unit tests (Jest)
npm run cypress               # Open Cypress E2E
npm run cypress:run           # Run Cypress headless

# Deployment
npm run netlify:deploy:prod   # Deploy to Netlify
```

---

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker
```bash
docker-compose up -d
```

### Netlify
```bash
npm run netlify:deploy:prod
```

---

## Lisensi

MIT License — lihat file [LICENSE](LICENSE) untuk detail.

## Support

- **Email**: support@bedagang.com
- **Dokumentasi**: https://docs.bedagang.com
- **Issues**: https://github.com/winsitoruser/bedagang---PoS/issues

---

<div align="center">

**BEDAGANG** — Solusi ERP Modern untuk Bisnis Indonesia 🇮🇩

Built with ❤️ by Winsitor Team

</div>
