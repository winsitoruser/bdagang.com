-- ============================================
-- ENHANCED MODULE SYSTEM - Level 3 Modular Architecture
-- ============================================
-- Date: February 27, 2026
-- Description: Add module dependencies, categories, features metadata
-- for self-service Module Management Dashboard
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ENHANCE modules TABLE
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='modules' AND column_name='category') THEN
        ALTER TABLE modules ADD COLUMN category VARCHAR(50) DEFAULT 'operations';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='modules' AND column_name='features') THEN
        ALTER TABLE modules ADD COLUMN features JSONB DEFAULT '[]';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='modules' AND column_name='pricing_tier') THEN
        ALTER TABLE modules ADD COLUMN pricing_tier VARCHAR(20) DEFAULT 'basic';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='modules' AND column_name='setup_complexity') THEN
        ALTER TABLE modules ADD COLUMN setup_complexity VARCHAR(20) DEFAULT 'simple';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='modules' AND column_name='color') THEN
        ALTER TABLE modules ADD COLUMN color VARCHAR(20) DEFAULT '#3B82F6';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='modules' AND column_name='preview_image') THEN
        ALTER TABLE modules ADD COLUMN preview_image VARCHAR(500);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='modules' AND column_name='version') THEN
        ALTER TABLE modules ADD COLUMN version VARCHAR(20) DEFAULT '1.0.0';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='modules' AND column_name='tags') THEN
        ALTER TABLE modules ADD COLUMN tags JSONB DEFAULT '[]';
    END IF;
END $$;

-- ============================================
-- 2. CREATE module_dependencies TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS module_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    depends_on_module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    dependency_type VARCHAR(20) DEFAULT 'required',  -- 'required' | 'optional' | 'recommended'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(module_id, depends_on_module_id),
    CHECK(module_id != depends_on_module_id)
);

CREATE INDEX IF NOT EXISTS idx_module_deps_module ON module_dependencies(module_id);
CREATE INDEX IF NOT EXISTS idx_module_deps_depends ON module_dependencies(depends_on_module_id);

-- ============================================
-- 3. ENHANCE tenant_modules TABLE
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tenant_modules' AND column_name='configured_at') THEN
        ALTER TABLE tenant_modules ADD COLUMN configured_at TIMESTAMP;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tenant_modules' AND column_name='config_data') THEN
        ALTER TABLE tenant_modules ADD COLUMN config_data JSONB DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tenant_modules' AND column_name='enabled_by') THEN
        ALTER TABLE tenant_modules ADD COLUMN enabled_by UUID REFERENCES users(id);
    END IF;
END $$;

-- ============================================
-- 4. UPDATE EXISTING MODULE DATA
-- ============================================

-- Update module metadata (category, features, pricing, color)
UPDATE modules SET 
    category = 'core',
    features = '["Overview bisnis", "Statistik real-time", "Notifikasi penting", "Quick actions"]',
    pricing_tier = 'basic',
    setup_complexity = 'simple',
    color = '#3B82F6'
WHERE code = 'dashboard';

UPDATE modules SET 
    category = 'operations',
    features = '["Kasir digital", "Multi payment", "Cetak struk", "Diskon & promo", "Split bill"]',
    pricing_tier = 'basic',
    setup_complexity = 'simple',
    color = '#10B981'
WHERE code = 'pos';

UPDATE modules SET 
    category = 'operations',
    features = '["Stok real-time", "Multi-gudang", "Stock opname", "Transfer stok", "Alerts otomatis", "Barcode support"]',
    pricing_tier = 'basic',
    setup_complexity = 'moderate',
    color = '#F59E0B'
WHERE code = 'inventory';

UPDATE modules SET 
    category = 'crm',
    features = '["Database pelanggan", "Riwayat transaksi", "Segmentasi", "Customer insights"]',
    pricing_tier = 'basic',
    setup_complexity = 'simple',
    color = '#8B5CF6'
WHERE code = 'customers';

UPDATE modules SET 
    category = 'hr',
    features = '["Data karyawan", "Jadwal & shift", "Attendance tracking"]',
    pricing_tier = 'basic',
    setup_complexity = 'simple',
    color = '#6366F1'
WHERE code = 'employees';

UPDATE modules SET 
    category = 'crm',
    features = '["Point system", "Tier membership", "Rewards catalog", "Auto promo"]',
    pricing_tier = 'professional',
    setup_complexity = 'moderate',
    color = '#EC4899'
WHERE code = 'loyalty';

UPDATE modules SET 
    category = 'operations',
    features = '["Layout meja", "Status real-time", "Gabung/pisah meja", "QR order"]',
    pricing_tier = 'professional',
    setup_complexity = 'moderate',
    color = '#14B8A6'
WHERE code = 'tables';

UPDATE modules SET 
    category = 'operations',
    features = '["Booking online", "Kalender reservasi", "Konfirmasi otomatis", "Waitlist"]',
    pricing_tier = 'professional',
    setup_complexity = 'moderate',
    color = '#F97316'
WHERE code = 'reservations';

UPDATE modules SET 
    category = 'operations',
    features = '["Kitchen Display System", "Order queue", "Prep time tracking", "Recipe management"]',
    pricing_tier = 'professional',
    setup_complexity = 'complex',
    color = '#EF4444'
WHERE code = 'kitchen';

UPDATE modules SET 
    category = 'marketing',
    features = '["Buat promo", "Voucher & kupon", "Bundle deals", "Jadwal promo", "Analitik promo"]',
    pricing_tier = 'professional',
    setup_complexity = 'moderate',
    color = '#F43F5E'
WHERE code = 'promo';

UPDATE modules SET 
    category = 'finance',
    features = '["Laporan keuangan", "Arus kas", "Laba rugi", "Piutang & hutang", "Budget planning", "Pajak"]',
    pricing_tier = 'professional',
    setup_complexity = 'complex',
    color = '#22C55E'
WHERE code = 'finance';

UPDATE modules SET 
    category = 'analytics',
    features = '["Laporan penjualan", "Laporan stok", "Laporan keuangan", "Konsolidasi multi-cabang", "Export PDF/Excel"]',
    pricing_tier = 'basic',
    setup_complexity = 'simple',
    color = '#0EA5E9'
WHERE code = 'reports';

UPDATE modules SET 
    category = 'system',
    features = '["Pengaturan toko", "Integrasi", "Notifikasi", "Pajak & biaya", "Backup"]',
    pricing_tier = 'basic',
    setup_complexity = 'simple',
    color = '#64748B'
WHERE code = 'settings';

UPDATE modules SET 
    category = 'hr',
    features = '["KPI karyawan", "Attendance management", "Performance review", "Cuti management", "Payroll ready"]',
    pricing_tier = 'enterprise',
    setup_complexity = 'complex',
    color = '#7C3AED'
WHERE code = 'hris';

UPDATE modules SET 
    category = 'operations',
    features = '["Multi-cabang management", "Performa cabang", "Transfer antar cabang", "Pengaturan per-cabang"]',
    pricing_tier = 'professional',
    setup_complexity = 'moderate',
    color = '#2563EB'
WHERE code = 'branches';

UPDATE modules SET 
    category = 'operations',
    features = '["Purchase order", "Internal requisition", "Supplier management", "Goods receipt"]',
    pricing_tier = 'professional',
    setup_complexity = 'moderate',
    color = '#D97706'
WHERE code = 'supply_chain';

UPDATE modules SET 
    category = 'operations',
    features = '["Master produk", "Variant management", "Pricing tiers", "Kategori produk"]',
    pricing_tier = 'basic',
    setup_complexity = 'simple',
    color = '#059669'
WHERE code = 'products';

UPDATE modules SET 
    category = 'system',
    features = '["User management", "Role & akses", "Branch manager assignment"]',
    pricing_tier = 'basic',
    setup_complexity = 'simple',
    color = '#475569'
WHERE code = 'users';

UPDATE modules SET 
    category = 'system',
    features = '["Activity log", "Security audit", "Change tracking"]',
    pricing_tier = 'professional',
    setup_complexity = 'simple',
    color = '#78716C'
WHERE code = 'audit';

UPDATE modules SET 
    category = 'operations',
    features = '["Fleet overview", "GPS tracking", "Route management", "Fuel management", "Maintenance schedule", "Cost reporting"]',
    pricing_tier = 'enterprise',
    setup_complexity = 'complex',
    color = '#DC2626'
WHERE code = 'fleet';

UPDATE modules SET 
    category = 'system',
    features = '["API integration", "Payment gateway", "Delivery partners", "Accounting sync"]',
    pricing_tier = 'professional',
    setup_complexity = 'moderate',
    color = '#4F46E5'
WHERE code = 'integrations';

-- ============================================
-- 5. INSERT MODULE DEPENDENCIES
-- ============================================
-- Finance depends on Reports
INSERT INTO module_dependencies (module_id, depends_on_module_id, dependency_type)
SELECT m1.id, m2.id, 'required'
FROM modules m1, modules m2
WHERE m1.code = 'finance' AND m2.code = 'reports'
ON CONFLICT DO NOTHING;

-- HRIS depends on Employees
INSERT INTO module_dependencies (module_id, depends_on_module_id, dependency_type)
SELECT m1.id, m2.id, 'required'
FROM modules m1, modules m2
WHERE m1.code = 'hris' AND m2.code = 'employees'
ON CONFLICT DO NOTHING;

-- Kitchen depends on POS
INSERT INTO module_dependencies (module_id, depends_on_module_id, dependency_type)
SELECT m1.id, m2.id, 'required'
FROM modules m1, modules m2
WHERE m1.code = 'kitchen' AND m2.code = 'pos'
ON CONFLICT DO NOTHING;

-- Tables depends on POS
INSERT INTO module_dependencies (module_id, depends_on_module_id, dependency_type)
SELECT m1.id, m2.id, 'required'
FROM modules m1, modules m2
WHERE m1.code = 'tables' AND m2.code = 'pos'
ON CONFLICT DO NOTHING;

-- Reservations depends on Tables
INSERT INTO module_dependencies (module_id, depends_on_module_id, dependency_type)
SELECT m1.id, m2.id, 'required'
FROM modules m1, modules m2
WHERE m1.code = 'reservations' AND m2.code = 'tables'
ON CONFLICT DO NOTHING;

-- Loyalty depends on Customers
INSERT INTO module_dependencies (module_id, depends_on_module_id, dependency_type)
SELECT m1.id, m2.id, 'required'
FROM modules m1, modules m2
WHERE m1.code = 'loyalty' AND m2.code = 'customers'
ON CONFLICT DO NOTHING;

-- Supply Chain depends on Inventory
INSERT INTO module_dependencies (module_id, depends_on_module_id, dependency_type)
SELECT m1.id, m2.id, 'required'
FROM modules m1, modules m2
WHERE m1.code = 'supply_chain' AND m2.code = 'inventory'
ON CONFLICT DO NOTHING;

-- Promo recommends Loyalty
INSERT INTO module_dependencies (module_id, depends_on_module_id, dependency_type)
SELECT m1.id, m2.id, 'recommended'
FROM modules m1, modules m2
WHERE m1.code = 'promo' AND m2.code = 'loyalty'
ON CONFLICT DO NOTHING;

-- Branches depends on Dashboard
INSERT INTO module_dependencies (module_id, depends_on_module_id, dependency_type)
SELECT m1.id, m2.id, 'required'
FROM modules m1, modules m2
WHERE m1.code = 'branches' AND m2.code = 'dashboard'
ON CONFLICT DO NOTHING;

-- Fleet depends on Branches
INSERT INTO module_dependencies (module_id, depends_on_module_id, dependency_type)
SELECT m1.id, m2.id, 'required'
FROM modules m1, modules m2
WHERE m1.code = 'fleet' AND m2.code = 'branches'
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================
SELECT m.code, m.category, m.pricing_tier, m.setup_complexity, m.color,
       COUNT(md.id) as dependency_count
FROM modules m
LEFT JOIN module_dependencies md ON md.module_id = m.id
GROUP BY m.id, m.code, m.category, m.pricing_tier, m.setup_complexity, m.color
ORDER BY m.sort_order;
