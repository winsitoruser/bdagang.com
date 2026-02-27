import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

const getDb = () => require('../../../../models');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const userRole = (session.user as any).role;
    const tenantId = (session.user as any).tenantId;

    if (!['super_admin', 'owner', 'hq_admin'].includes(userRole)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    switch (req.method) {
      case 'GET':
        return getModules(req, res, tenantId, userRole);
      case 'PUT':
        return toggleModule(req, res, tenantId, session.user);
      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Module Management API error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function getModules(
  req: NextApiRequest,
  res: NextApiResponse,
  tenantId: string,
  userRole: string
) {
  const db = getDb();
  const { Module, TenantModule, ModuleDependency } = db;

  // Get all active modules
  const allModules = await Module.findAll({
    where: { isActive: true },
    order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    include: [
      {
        model: ModuleDependency,
        as: 'dependencies',
        include: [{
          model: Module,
          as: 'dependsOn',
          attributes: ['id', 'code', 'name', 'icon']
        }]
      },
      {
        model: ModuleDependency,
        as: 'dependedBy',
        include: [{
          model: Module,
          as: 'module',
          attributes: ['id', 'code', 'name', 'icon']
        }]
      }
    ]
  });

  // Get tenant module states
  let tenantModules: any[] = [];
  if (tenantId) {
    tenantModules = await TenantModule.findAll({
      where: { tenantId }
    });
  }

  const tenantModuleMap = new Map();
  tenantModules.forEach((tm: any) => {
    tenantModuleMap.set(tm.moduleId, {
      isEnabled: tm.isEnabled,
      enabledAt: tm.enabledAt,
      disabledAt: tm.disabledAt,
      configuredAt: tm.configuredAt,
      configData: tm.configData
    });
  });

  // Build enriched module list
  const modules = allModules.map((mod: any) => {
    const tenantState = tenantModuleMap.get(mod.id);
    const isEnabled = tenantState?.isEnabled || false;

    // Build dependency info
    const dependencies = (mod.dependencies || []).map((dep: any) => ({
      moduleCode: dep.dependsOn?.code,
      moduleName: dep.dependsOn?.name,
      moduleIcon: dep.dependsOn?.icon,
      type: dep.dependencyType
    }));

    // Build "depended by" info (who depends on this module)
    const dependedBy = (mod.dependedBy || []).map((dep: any) => ({
      moduleCode: dep.module?.code,
      moduleName: dep.module?.name,
      moduleIcon: dep.module?.icon,
      type: dep.dependencyType
    }));

    return {
      id: mod.id,
      code: mod.code,
      name: mod.name,
      description: mod.description,
      icon: mod.icon,
      route: mod.route,
      category: mod.category,
      features: mod.features || [],
      pricingTier: mod.pricingTier,
      setupComplexity: mod.setupComplexity,
      color: mod.color,
      version: mod.version,
      tags: mod.tags || [],
      isCore: mod.isCore,
      sortOrder: mod.sortOrder,
      // Tenant-specific state
      isEnabled,
      enabledAt: tenantState?.enabledAt,
      disabledAt: tenantState?.disabledAt,
      configuredAt: tenantState?.configuredAt,
      // Dependencies
      dependencies,
      dependedBy
    };
  });

  // Group by category
  const categories: Record<string, any[]> = {};
  modules.forEach((mod: any) => {
    const cat = mod.category || 'other';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(mod);
  });

  // Summary stats
  const totalModules = modules.length;
  const enabledCount = modules.filter((m: any) => m.isEnabled).length;
  const coreCount = modules.filter((m: any) => m.isCore).length;

  return res.status(200).json({
    success: true,
    data: {
      modules,
      categories,
      summary: {
        total: totalModules,
        enabled: enabledCount,
        disabled: totalModules - enabledCount,
        core: coreCount
      },
      categoryLabels: {
        core: 'Core System',
        operations: 'Operasional',
        finance: 'Keuangan',
        hr: 'SDM & HRIS',
        crm: 'CRM & Pelanggan',
        marketing: 'Marketing',
        analytics: 'Analitik & Laporan',
        system: 'Sistem & Pengaturan',
        integration: 'Integrasi & Koneksi'
      }
    }
  });
}

async function toggleModule(
  req: NextApiRequest,
  res: NextApiResponse,
  tenantId: string,
  user: any
) {
  const db = getDb();
  const { Module, TenantModule, ModuleDependency } = db;
  const { moduleId, isEnabled } = req.body;

  if (!moduleId || isEnabled === undefined) {
    return res.status(400).json({
      success: false,
      error: 'moduleId and isEnabled are required'
    });
  }

  if (!tenantId) {
    return res.status(400).json({
      success: false,
      error: 'No tenant associated'
    });
  }

  const targetModule = await Module.findByPk(moduleId);
  if (!targetModule) {
    return res.status(404).json({ success: false, error: 'Module not found' });
  }

  // Prevent disabling core modules
  if (!isEnabled && targetModule.isCore) {
    return res.status(400).json({
      success: false,
      error: 'CORE_MODULE',
      message: `Modul '${targetModule.name}' adalah modul core dan tidak bisa dinonaktifkan.`
    });
  }

  if (isEnabled) {
    // ENABLING: Check if all required dependencies are enabled
    const dependencies = await ModuleDependency.findAll({
      where: {
        moduleId: targetModule.id,
        dependencyType: 'required'
      },
      include: [{
        model: Module,
        as: 'dependsOn',
        attributes: ['id', 'code', 'name']
      }]
    });

    if (dependencies.length > 0) {
      const depModuleIds = dependencies.map((d: any) => d.dependsOnModuleId);
      const enabledDeps = await TenantModule.findAll({
        where: {
          tenantId,
          moduleId: depModuleIds,
          isEnabled: true
        }
      });

      const enabledDepIds = new Set(enabledDeps.map((d: any) => d.moduleId));
      const missingDeps = dependencies.filter(
        (d: any) => !enabledDepIds.has(d.dependsOnModuleId)
      );

      if (missingDeps.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_DEPENDENCIES',
          message: `Modul '${targetModule.name}' membutuhkan modul berikut yang belum aktif:`,
          missingDependencies: missingDeps.map((d: any) => ({
            code: d.dependsOn.code,
            name: d.dependsOn.name,
            id: d.dependsOn.id
          }))
        });
      }
    }
  } else {
    // DISABLING: Check if any enabled module depends on this one
    const dependedBy = await ModuleDependency.findAll({
      where: {
        dependsOnModuleId: targetModule.id,
        dependencyType: 'required'
      },
      include: [{
        model: Module,
        as: 'module',
        attributes: ['id', 'code', 'name']
      }]
    });

    if (dependedBy.length > 0) {
      const depModuleIds = dependedBy.map((d: any) => d.moduleId);
      const enabledDependents = await TenantModule.findAll({
        where: {
          tenantId,
          moduleId: depModuleIds,
          isEnabled: true
        },
        include: [{
          model: Module,
          as: 'module',
          attributes: ['id', 'code', 'name']
        }]
      });

      if (enabledDependents.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'HAS_DEPENDENTS',
          message: `Tidak bisa menonaktifkan '${targetModule.name}' karena modul berikut masih bergantung padanya:`,
          dependentModules: enabledDependents.map((d: any) => ({
            code: d.module.code,
            name: d.module.name,
            id: d.module.id
          }))
        });
      }
    }
  }

  // Apply the toggle
  const existing = await TenantModule.findOne({
    where: { tenantId, moduleId: targetModule.id }
  });

  if (existing) {
    await existing.update({
      isEnabled,
      enabledAt: isEnabled ? new Date() : existing.enabledAt,
      disabledAt: !isEnabled ? new Date() : null,
      enabledBy: user.id || null,
      configuredAt: new Date()
    });
  } else {
    await TenantModule.create({
      tenantId,
      moduleId: targetModule.id,
      isEnabled,
      enabledAt: isEnabled ? new Date() : null,
      enabledBy: user.id || null,
      configuredAt: new Date()
    });
  }

  return res.status(200).json({
    success: true,
    message: isEnabled
      ? `Modul '${targetModule.name}' berhasil diaktifkan`
      : `Modul '${targetModule.name}' berhasil dinonaktifkan`,
    data: {
      moduleId: targetModule.id,
      moduleCode: targetModule.code,
      moduleName: targetModule.name,
      isEnabled
    }
  });
}
