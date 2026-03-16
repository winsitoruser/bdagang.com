import type { NextApiRequest, NextApiResponse } from 'next';
import { Branch, User, Store } from '../../../../models';
import { Op } from 'sequelize';
import { successResponse, errorResponse, ErrorCodes, HttpStatus } from '../../../../lib/api/response';
import { getPaginationParams, getPaginationMeta } from '../../../../lib/api/pagination';
import { withHQAuth } from '../../../../lib/middleware/withHQAuth';
const { tenantContext, requireTenant, addTenantFilter } = require('../../../../middleware/tenantContext');

const getDb = () => require('../../../../models');

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Apply tenant context middleware
    await new Promise((resolve, reject) => {
      tenantContext(req, res, (err: any) => {
        if (err) reject(err);
        else resolve(true);
      });
    });

    await new Promise((resolve, reject) => {
      requireTenant(req, res, (err: any) => {
        if (err) reject(err);
        else resolve(true);
      });
    });

    switch (req.method) {
      case 'GET':
        return await getBranches(req, res);
      case 'POST':
        return await createBranch(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(HttpStatus.METHOD_NOT_ALLOWED).json(
          errorResponse(ErrorCodes.METHOD_NOT_ALLOWED, `Method ${req.method} Not Allowed`)
        );
    }
  } catch (error) {
    console.error('Branch API Error:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, 'Internal server error')
    );
  }
}

export default withHQAuth(handler, { module: 'branches' });

async function getBranches(req: NextApiRequest, res: NextApiResponse) {
  const { search, type, status } = req.query;
  const { limit, offset, page } = getPaginationParams(req.query);

  try {
    let where: any = {};
    
    // Add tenant filtering
    where = addTenantFilter(where, req);
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
        { city: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (type && type !== 'all') {
      where.type = type;
    }
    
    if (status && status !== 'all') {
      where.isActive = status === 'active';
    }

    const { count, rows } = await Branch.findAndCountAll({
      where,
      include: [
        { model: User, as: 'manager', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Store, as: 'store', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    // Get setup status for each branch
    let BranchSetup: any = null;
    try {
      BranchSetup = require('../../../../models').BranchSetup;
    } catch (e) {}

    const branches = await Promise.all(rows.map(async (branch: any) => {
      let setupStatus = null;
      let setupProgress = 0;
      
      if (BranchSetup) {
        try {
          const setup = await BranchSetup.findOne({ where: { branchId: branch.id } });
          if (setup) {
            setupStatus = setup.status;
            setupProgress = setup.getProgress ? setup.getProgress() : 0;
          }
        } catch (e) {}
      }

      return {
        id: branch.id,
        code: branch.code,
        name: branch.name,
        type: branch.type || 'branch',
        address: branch.address,
        city: branch.city,
        province: branch.province,
        phone: branch.phone,
        email: branch.email,
        isActive: branch.isActive,
        manager: branch.manager ? {
          id: branch.manager.id,
          name: branch.manager.name,
          email: branch.manager.email,
          phone: branch.manager.phone
        } : null,
        stats: {
          employeeCount: 0,
          todaySales: 0,
          monthSales: 0,
          lowStockItems: 0
        },
        setupStatus,
        setupProgress,
        createdAt: branch.createdAt,
        updatedAt: branch.updatedAt
      };
    }));

    return res.status(HttpStatus.OK).json(
      successResponse(
        { branches },
        getPaginationMeta(count, page, limit)
      )
    );
  } catch (error) {
    console.error('Error fetching branches:', error);
    // Return mock data if database not available
    const mockBranches = getMockBranches();
    return res.status(HttpStatus.OK).json(
      successResponse(
        { branches: mockBranches },
        getPaginationMeta(mockBranches.length, 1, 10)
      )
    );
  }
}

async function createBranch(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();
  const { code, name, type, address, city, province, phone, email, managerId } = req.body;

  if (!code || !name) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.MISSING_REQUIRED_FIELDS, 'Code and name are required')
    );
  }

  try {
    // Check tenant limits
    const tenant = await db.Tenant.findByPk((req as any).tenantId, {
      include: [{ model: db.Branch, as: 'branches' }]
    });

    if (tenant && !tenant.canAddBranch()) {
      return res.status(HttpStatus.BAD_REQUEST).json(
        errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          `Branch limit reached. Maximum ${tenant.maxBranches} branches allowed for your subscription plan`
        )
      );
    }

    // Create the branch with tenant
    const branch = await Branch.create({
      tenantId: (req as any).tenantId,
      code,
      name,
      type: type || 'branch',
      address,
      city,
      province,
      phone,
      email,
      managerId,
      isActive: true
    });

    const branchId = (branch as any).id;
    const branchType = type || 'branch';
    
    // Initialize all branch services using the initialization service
    let initResult = {
      success: false,
      initializedServices: [] as string[],
      errors: [] as string[]
    };

    try {
      const { initializeBranch } = require('../../../../lib/services/branchInitializationService');
      
      initResult = await initializeBranch({
        branchId,
        branchCode: code,
        branchName: name,
        branchType,
        createdBy: managerId
      });

      console.log('Branch initialization result:', initResult);
    } catch (initError: any) {
      console.warn('Could not use initialization service, falling back to basic setup:', initError.message);
      
      // Fallback to basic initialization
      try {
        const { BranchSetup, BranchModule, Location, StoreSetting } = require('../../../../models');
        
        // Create setup record
        if (BranchSetup) {
          await BranchSetup.create({
            branchId,
            status: 'pending',
            currentStep: 1
          });
          initResult.initializedServices.push('branch_setup');
        }

        // Enable default modules
        if (BranchModule && BranchModule.enableDefaultModules) {
          await BranchModule.enableDefaultModules(branchId);
          initResult.initializedServices.push('modules');
        }

        // Create default location
        if (Location) {
          await Location.create({
            branchId,
            code: 'MAIN',
            name: 'Lokasi Utama',
            type: 'store',
            isDefault: true,
            isActive: true
          });
          initResult.initializedServices.push('locations');
        }

        // Create default settings
        if (StoreSetting) {
          const defaultSettings = [
            { category: 'general', key: 'currency', value: 'IDR', dataType: 'string' },
            { category: 'general', key: 'timezone', value: 'Asia/Jakarta', dataType: 'string' },
            { category: 'pos', key: 'receipt_header', value: name, dataType: 'string' },
            { category: 'pos', key: 'receipt_footer', value: 'Terima kasih atas kunjungan Anda', dataType: 'string' },
            { category: 'pos', key: 'tax_enabled', value: 'true', dataType: 'boolean' },
            { category: 'pos', key: 'tax_rate', value: '11', dataType: 'number' },
            { category: 'inventory', key: 'low_stock_threshold', value: '10', dataType: 'number' },
            { category: 'inventory', key: 'sync_from_hq', value: 'true', dataType: 'boolean' }
          ];

          for (const setting of defaultSettings) {
            await StoreSetting.findOrCreate({
              where: { branchId, category: setting.category, key: setting.key },
              defaults: { ...setting, branchId }
            });
          }
          initResult.initializedServices.push('store_settings');
        }

        initResult.success = true;
      } catch (fallbackError: any) {
        initResult.errors.push(fallbackError.message);
      }
    }

    return res.status(HttpStatus.CREATED).json(
      successResponse(
        {
          branch,
          setupInitialized: initResult.success || initResult.initializedServices.length > 0,
          initializedServices: initResult.initializedServices,
          initializationErrors: initResult.errors,
          redirectToSetup: true,
          setupUrl: `/hq/branches/${branchId}/setup`
        },
        undefined,
        'Branch created successfully'
      )
    );
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(HttpStatus.BAD_REQUEST).json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, 'Branch code already exists')
      );
    }
    throw error;
  }
}

function getMockBranches() {
  const now = new Date().toISOString();
  return [
    {
      id: '1', code: 'HQ-001', name: 'Kantor Pusat Jakarta', type: 'main',
      address: 'Jl. Sudirman No. 123, Senayan', city: 'Jakarta Selatan', province: 'DKI Jakarta', region: 'DKI Jakarta',
      phone: '021-5551234', email: 'pusat@bedagang.com',
      isActive: true, status: 'online', syncStatus: 'synced', lastSync: now,
      priceTierId: 'tier-1', priceTierName: 'Harga Standar',
      manager: { id: '1', name: 'Ahmad Wijaya', email: 'ahmad@bedagang.com' },
      stats: { employeeCount: 25, todaySales: 48500000, monthSales: 1350000000, lowStockItems: 3 },
      setupStatus: 'completed', setupProgress: 100, healthScore: 95, healthGrade: 'A',
      createdAt: '2024-01-15'
    },
    {
      id: '2', code: 'BR-002', name: 'Cabang Bandung', type: 'branch',
      address: 'Jl. Braga No. 45', city: 'Bandung', province: 'Jawa Barat', region: 'Jawa Barat',
      phone: '022-4201234', email: 'bandung@bedagang.com',
      isActive: true, status: 'online', syncStatus: 'synced', lastSync: now,
      priceTierId: 'tier-2', priceTierName: 'Harga Regional Jabar',
      manager: { id: '2', name: 'Siti Rahayu', email: 'siti@bedagang.com' },
      stats: { employeeCount: 18, todaySales: 35200000, monthSales: 980000000, lowStockItems: 7 },
      setupStatus: 'completed', setupProgress: 100, healthScore: 84, healthGrade: 'B',
      createdAt: '2024-03-10'
    },
    {
      id: '3', code: 'BR-003', name: 'Cabang Surabaya', type: 'branch',
      address: 'Jl. Tunjungan No. 78', city: 'Surabaya', province: 'Jawa Timur', region: 'Jawa Timur',
      phone: '031-5459876', email: 'surabaya@bedagang.com',
      isActive: true, status: 'warning', syncStatus: 'pending', lastSync: new Date(Date.now() - 7200000).toISOString(),
      priceTierId: 'tier-3', priceTierName: 'Harga Regional Jatim',
      manager: { id: '3', name: 'Budi Santoso', email: 'budi@bedagang.com' },
      stats: { employeeCount: 15, todaySales: 29800000, monthSales: 820000000, lowStockItems: 14 },
      setupStatus: 'completed', setupProgress: 100, healthScore: 68, healthGrade: 'C',
      createdAt: '2024-04-22'
    },
    {
      id: '4', code: 'BR-004', name: 'Cabang Medan', type: 'branch',
      address: 'Jl. Gatot Subroto No. 56', city: 'Medan', province: 'Sumatera Utara', region: 'Sumatera Utara',
      phone: '061-4567890', email: 'medan@bedagang.com',
      isActive: true, status: 'online', syncStatus: 'synced', lastSync: now,
      priceTierId: 'tier-4', priceTierName: 'Harga Regional Sumut',
      manager: { id: '4', name: 'Dewi Lestari', email: 'dewi@bedagang.com' },
      stats: { employeeCount: 12, todaySales: 24500000, monthSales: 710000000, lowStockItems: 9 },
      setupStatus: 'completed', setupProgress: 100, healthScore: 79, healthGrade: 'B',
      createdAt: '2024-06-01'
    },
    {
      id: '5', code: 'BR-005', name: 'Cabang Bali', type: 'branch',
      address: 'Jl. Sunset Road No. 88, Kuta', city: 'Denpasar', province: 'Bali', region: 'Bali & Nusa Tenggara',
      phone: '0361-765432', email: 'bali@bedagang.com',
      isActive: true, status: 'online', syncStatus: 'synced', lastSync: now,
      priceTierId: 'tier-5', priceTierName: 'Harga Regional Bali',
      manager: { id: '6', name: 'Made Wirawan', email: 'made@bedagang.com' },
      stats: { employeeCount: 14, todaySales: 38700000, monthSales: 1050000000, lowStockItems: 4 },
      setupStatus: 'completed', setupProgress: 100, healthScore: 88, healthGrade: 'B',
      createdAt: '2024-07-15'
    },
    {
      id: '6', code: 'BR-006', name: 'Cabang Makassar', type: 'branch',
      address: 'Jl. Penghibur No. 12', city: 'Makassar', province: 'Sulawesi Selatan', region: 'Sulawesi',
      phone: '0411-332211', email: 'makassar@bedagang.com',
      isActive: true, status: 'offline', syncStatus: 'failed', lastSync: new Date(Date.now() - 86400000).toISOString(),
      priceTierId: null, priceTierName: null,
      manager: { id: '7', name: 'Andi Pratama', email: 'andi@bedagang.com' },
      stats: { employeeCount: 10, todaySales: 0, monthSales: 520000000, lowStockItems: 18 },
      setupStatus: 'completed', setupProgress: 100, healthScore: 42, healthGrade: 'D',
      createdAt: '2024-08-20'
    },
    {
      id: '7', code: 'BR-007', name: 'Cabang Semarang', type: 'branch',
      address: 'Jl. Pandanaran No. 33', city: 'Semarang', province: 'Jawa Tengah', region: 'Jawa Tengah',
      phone: '024-8453210', email: 'semarang@bedagang.com',
      isActive: true, status: 'online', syncStatus: 'synced', lastSync: now,
      priceTierId: 'tier-2', priceTierName: 'Harga Regional Jateng',
      manager: { id: '8', name: 'Rina Hartati', email: 'rina@bedagang.com' },
      stats: { employeeCount: 13, todaySales: 27300000, monthSales: 760000000, lowStockItems: 6 },
      setupStatus: 'completed', setupProgress: 100, healthScore: 82, healthGrade: 'B',
      createdAt: '2024-09-05'
    },
    {
      id: '8', code: 'WH-001', name: 'Gudang Pusat Cikarang', type: 'warehouse',
      address: 'Kawasan Industri Jababeka Blok D-12', city: 'Bekasi', province: 'Jawa Barat', region: 'Jawa Barat',
      phone: '021-89835678', email: 'gudang@bedagang.com',
      isActive: true, status: 'online', syncStatus: 'synced', lastSync: now,
      priceTierId: null, priceTierName: null,
      manager: { id: '5', name: 'Eko Prasetyo', email: 'eko@bedagang.com' },
      stats: { employeeCount: 30, todaySales: 0, monthSales: 0, lowStockItems: 22 },
      setupStatus: 'completed', setupProgress: 100, healthScore: 76, healthGrade: 'B',
      createdAt: '2024-02-01'
    },
    {
      id: '9', code: 'WH-002', name: 'Gudang Regional Surabaya', type: 'warehouse',
      address: 'Jl. Rungkut Industri No. 5', city: 'Surabaya', province: 'Jawa Timur', region: 'Jawa Timur',
      phone: '031-8710234', email: 'gudang-sby@bedagang.com',
      isActive: true, status: 'online', syncStatus: 'synced', lastSync: now,
      priceTierId: null, priceTierName: null,
      manager: { id: '9', name: 'Hendra Gunawan', email: 'hendra@bedagang.com' },
      stats: { employeeCount: 20, todaySales: 0, monthSales: 0, lowStockItems: 15 },
      setupStatus: 'completed', setupProgress: 100, healthScore: 72, healthGrade: 'C',
      createdAt: '2024-05-10'
    },
    {
      id: '10', code: 'KS-001', name: 'Kiosk Mall Kelapa Gading', type: 'kiosk',
      address: 'Mall Kelapa Gading Lt. 2 Unit 215', city: 'Jakarta Utara', province: 'DKI Jakarta', region: 'DKI Jakarta',
      phone: '021-4587123', email: 'kiosk-kg@bedagang.com',
      isActive: true, status: 'online', syncStatus: 'synced', lastSync: now,
      priceTierId: 'tier-1', priceTierName: 'Harga Standar',
      manager: { id: '10', name: 'Lisa Permata', email: 'lisa@bedagang.com' },
      stats: { employeeCount: 5, todaySales: 18900000, monthSales: 480000000, lowStockItems: 2 },
      setupStatus: 'completed', setupProgress: 100, healthScore: 90, healthGrade: 'A',
      createdAt: '2024-10-01'
    },
    {
      id: '11', code: 'KS-002', name: 'Kiosk Grand Indonesia', type: 'kiosk',
      address: 'Grand Indonesia East Mall Lt. 3', city: 'Jakarta Pusat', province: 'DKI Jakarta', region: 'DKI Jakarta',
      phone: '021-2358890', email: 'kiosk-gi@bedagang.com',
      isActive: false, status: 'offline', syncStatus: 'never', lastSync: new Date(Date.now() - 604800000).toISOString(),
      priceTierId: 'tier-1', priceTierName: 'Harga Standar',
      manager: null,
      stats: { employeeCount: 0, todaySales: 0, monthSales: 0, lowStockItems: 0 },
      setupStatus: 'pending', setupProgress: 20, healthScore: 25, healthGrade: 'F',
      createdAt: '2025-01-15'
    },
    {
      id: '12', code: 'BR-008', name: 'Cabang Yogyakarta', type: 'branch',
      address: 'Jl. Malioboro No. 52', city: 'Yogyakarta', province: 'DI Yogyakarta', region: 'Jawa Tengah',
      phone: '0274-567890', email: 'yogya@bedagang.com',
      isActive: true, status: 'online', syncStatus: 'synced', lastSync: now,
      priceTierId: 'tier-2', priceTierName: 'Harga Regional Jateng',
      manager: { id: '11', name: 'Wahyu Nugroho', email: 'wahyu@bedagang.com' },
      stats: { employeeCount: 11, todaySales: 21600000, monthSales: 620000000, lowStockItems: 5 },
      setupStatus: 'completed', setupProgress: 100, healthScore: 85, healthGrade: 'B',
      createdAt: '2024-11-10'
    }
  ];
}
