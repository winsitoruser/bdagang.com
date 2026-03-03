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
  return [
    { id: '1', code: 'HQ-001', name: 'Cabang Pusat Jakarta', type: 'main', city: 'Jakarta Selatan', province: 'DKI Jakarta', isActive: true, manager: { id: '1', name: 'Ahmad Wijaya' }, stats: { employeeCount: 25, todaySales: 45000000, monthSales: 1250000000, lowStockItems: 5 } },
    { id: '2', code: 'BR-002', name: 'Cabang Bandung', type: 'branch', city: 'Bandung', province: 'Jawa Barat', isActive: true, manager: { id: '2', name: 'Siti Rahayu' }, stats: { employeeCount: 18, todaySales: 32000000, monthSales: 920000000, lowStockItems: 12 } },
    { id: '3', code: 'BR-003', name: 'Cabang Surabaya', type: 'branch', city: 'Surabaya', province: 'Jawa Timur', isActive: true, manager: { id: '3', name: 'Budi Santoso' }, stats: { employeeCount: 15, todaySales: 28000000, monthSales: 780000000, lowStockItems: 8 } },
    { id: '4', code: 'BR-004', name: 'Cabang Medan', type: 'branch', city: 'Medan', province: 'Sumatera Utara', isActive: true, manager: { id: '4', name: 'Dewi Lestari' }, stats: { employeeCount: 12, todaySales: 22000000, monthSales: 650000000, lowStockItems: 15 } },
    { id: '5', code: 'WH-001', name: 'Gudang Pusat', type: 'warehouse', city: 'Bekasi', province: 'Jawa Barat', isActive: true, manager: { id: '5', name: 'Eko Prasetyo' }, stats: { employeeCount: 30, todaySales: 0, monthSales: 0, lowStockItems: 22 } }
  ];
}
