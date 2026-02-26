import type { NextApiRequest, NextApiResponse } from 'next';

let Op: any;
try { Op = require('sequelize').Op; } catch (e) {}

let EmployeeKPI: any, Employee: any, Branch: any;
try {
  const models = require('../../../../models');
  EmployeeKPI = models.EmployeeKPI;
  Employee = models.Employee;
  Branch = models.Branch;
} catch (e) {
  console.warn('KPI models not available:', e);
}

// Mock data as fallback when DB tables don't exist yet
const mockEmployeeKPIs = [
  {
    employeeId: '1', employeeName: 'Ahmad Wijaya', position: 'Branch Manager', branchName: 'Cabang Pusat Jakarta', department: 'Operations',
    overallScore: 92, overallAchievement: 104,
    metrics: [
      { id: '1', name: 'Target Penjualan', category: 'sales', target: 1200000000, actual: 1250000000, unit: 'Rp', weight: 40, trend: 'up', period: 'Feb 2026' },
      { id: '2', name: 'Kepuasan Pelanggan', category: 'customer', target: 90, actual: 92, unit: '%', weight: 20, trend: 'up', period: 'Feb 2026' },
      { id: '3', name: 'Efisiensi Operasional', category: 'operations', target: 85, actual: 88, unit: '%', weight: 20, trend: 'stable', period: 'Feb 2026' },
      { id: '4', name: 'Kehadiran Tim', category: 'operations', target: 95, actual: 98, unit: '%', weight: 20, trend: 'up', period: 'Feb 2026' },
    ],
    status: 'exceeded', lastUpdated: '2026-02-22'
  },
  {
    employeeId: '2', employeeName: 'Siti Rahayu', position: 'Branch Manager', branchName: 'Cabang Bandung', department: 'Operations',
    overallScore: 88, overallAchievement: 102,
    metrics: [
      { id: '1', name: 'Target Penjualan', category: 'sales', target: 900000000, actual: 920000000, unit: 'Rp', weight: 40, trend: 'up', period: 'Feb 2026' },
      { id: '2', name: 'Kepuasan Pelanggan', category: 'customer', target: 90, actual: 88, unit: '%', weight: 20, trend: 'down', period: 'Feb 2026' },
      { id: '3', name: 'Efisiensi Operasional', category: 'operations', target: 85, actual: 86, unit: '%', weight: 20, trend: 'stable', period: 'Feb 2026' },
      { id: '4', name: 'Kehadiran Tim', category: 'operations', target: 95, actual: 96, unit: '%', weight: 20, trend: 'up', period: 'Feb 2026' },
    ],
    status: 'exceeded', lastUpdated: '2026-02-22'
  },
  {
    employeeId: '3', employeeName: 'Budi Santoso', position: 'Branch Manager', branchName: 'Cabang Surabaya', department: 'Operations',
    overallScore: 78, overallAchievement: 92,
    metrics: [
      { id: '1', name: 'Target Penjualan', category: 'sales', target: 850000000, actual: 780000000, unit: 'Rp', weight: 40, trend: 'down', period: 'Feb 2026' },
      { id: '2', name: 'Kepuasan Pelanggan', category: 'customer', target: 90, actual: 85, unit: '%', weight: 20, trend: 'down', period: 'Feb 2026' },
      { id: '3', name: 'Efisiensi Operasional', category: 'operations', target: 85, actual: 82, unit: '%', weight: 20, trend: 'down', period: 'Feb 2026' },
      { id: '4', name: 'Kehadiran Tim', category: 'operations', target: 95, actual: 94, unit: '%', weight: 20, trend: 'stable', period: 'Feb 2026' },
    ],
    status: 'partial', lastUpdated: '2026-02-22'
  },
  {
    employeeId: '5', employeeName: 'Eko Prasetyo', position: 'Kasir Senior', branchName: 'Cabang Pusat Jakarta', department: 'Sales',
    overallScore: 90, overallAchievement: 110,
    metrics: [
      { id: '1', name: 'Transaksi Harian', category: 'sales', target: 50, actual: 58, unit: 'transaksi', weight: 30, trend: 'up', period: 'Feb 2026' },
      { id: '2', name: 'Nilai Transaksi', category: 'sales', target: 15000000, actual: 16500000, unit: 'Rp', weight: 30, trend: 'up', period: 'Feb 2026' },
      { id: '3', name: 'Upselling', category: 'sales', target: 10, actual: 12, unit: '%', weight: 20, trend: 'up', period: 'Feb 2026' },
      { id: '4', name: 'Akurasi Kasir', category: 'operations', target: 99, actual: 99.5, unit: '%', weight: 20, trend: 'stable', period: 'Feb 2026' },
    ],
    status: 'exceeded', lastUpdated: '2026-02-22'
  },
];

const mockBranchKPIs = [
  { branchId: '1', branchName: 'Cabang Pusat Jakarta', branchCode: 'HQ-001', manager: 'Ahmad Wijaya', overallAchievement: 104, salesKPI: 104, operationsKPI: 103, customerKPI: 102, employeeCount: 25, topPerformers: 8, lowPerformers: 2 },
  { branchId: '2', branchName: 'Cabang Bandung', branchCode: 'BR-002', manager: 'Siti Rahayu', overallAchievement: 102, salesKPI: 102, operationsKPI: 101, customerKPI: 98, employeeCount: 18, topPerformers: 5, lowPerformers: 3 },
  { branchId: '3', branchName: 'Cabang Surabaya', branchCode: 'BR-003', manager: 'Budi Santoso', overallAchievement: 92, salesKPI: 92, operationsKPI: 96, customerKPI: 94, employeeCount: 15, topPerformers: 3, lowPerformers: 4 },
  { branchId: '4', branchName: 'Cabang Medan', branchCode: 'BR-004', manager: 'Dedi Kurniawan', overallAchievement: 95, salesKPI: 94, operationsKPI: 97, customerKPI: 96, employeeCount: 12, topPerformers: 3, lowPerformers: 2 },
  { branchId: '5', branchName: 'Cabang Yogyakarta', branchCode: 'BR-005', manager: 'Rina Susanti', overallAchievement: 98, salesKPI: 97, operationsKPI: 99, customerKPI: 100, employeeCount: 10, topPerformers: 4, lowPerformers: 1 },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getKPIData(req, res);
      case 'POST':
        return await createKPI(req, res);
      case 'PUT':
        return await updateKPI(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('KPI API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getKPIData(req: NextApiRequest, res: NextApiResponse) {
  const { period, employeeId, branchId } = req.query;
  const currentPeriod = (period as string) || new Date().toISOString().substring(0, 7);

  // Try DB first
  if (EmployeeKPI && Employee) {
    try {
      const kpiWhere: any = { period: currentPeriod };
      if (employeeId) kpiWhere.employeeId = employeeId;
      if (branchId) kpiWhere.branchId = branchId;

      const kpiRecords = await EmployeeKPI.findAll({
        where: kpiWhere,
        order: [['employeeId', 'ASC'], ['category', 'ASC']]
      });

      if (kpiRecords.length > 0) {
        // Group by employee
        const grouped: Record<string, any[]> = {};
        kpiRecords.forEach((k: any) => {
          if (!grouped[k.employeeId]) grouped[k.employeeId] = [];
          grouped[k.employeeId].push(k);
        });

        const employeeIds = Object.keys(grouped);
        const employees = await Employee.findAll({
          where: { id: { [Op.in]: employeeIds } },
          attributes: ['id', 'name', 'position', 'department', 'workLocation']
        });
        const empMap: Record<string, any> = {};
        employees.forEach((e: any) => { empMap[e.id] = e; });

        const employeeKPIs = employeeIds.map(eId => {
          const emp = empMap[eId] || {};
          const metrics = grouped[eId];
          const totalWeight = metrics.reduce((s: number, m: any) => s + (m.weight || 100), 0);
          const weightedAchievement = metrics.reduce((s: number, m: any) => {
            const target = parseFloat(m.target) || 0;
            const actual = parseFloat(m.actual) || 0;
            const achievement = target > 0 ? (actual / target) * 100 : 0;
            return s + (achievement * (m.weight || 100));
          }, 0) / (totalWeight || 1);

          const overallAchievement = Math.round(weightedAchievement);
          let status = 'not_achieved';
          if (overallAchievement >= 110) status = 'exceeded';
          else if (overallAchievement >= 100) status = 'achieved';
          else if (overallAchievement >= 80) status = 'partial';

          return {
            employeeId: eId,
            employeeName: emp.name || 'Unknown',
            position: emp.position || '-',
            branchName: emp.workLocation || '-',
            department: emp.department || '-',
            overallScore: Math.round(overallAchievement * 0.92),
            overallAchievement,
            metrics: metrics.map((m: any) => ({
              id: m.id,
              name: m.metricName,
              category: m.category,
              target: parseFloat(m.target),
              actual: parseFloat(m.actual),
              unit: m.unit,
              weight: m.weight,
              trend: 'stable',
              period: m.period
            })),
            status,
            lastUpdated: metrics[0]?.updatedAt
          };
        });

        return res.status(200).json({
          employeeKPIs,
          branchKPIs: mockBranchKPIs,
          summary: {
            totalEmployees: employeeKPIs.length,
            exceeded: employeeKPIs.filter((e: any) => e.status === 'exceeded').length,
            achieved: employeeKPIs.filter((e: any) => e.status === 'achieved').length,
            partial: employeeKPIs.filter((e: any) => e.status === 'partial').length,
            notAchieved: employeeKPIs.filter((e: any) => e.status === 'not_achieved').length,
            avgAchievement: Math.round(employeeKPIs.reduce((s: number, e: any) => s + e.overallAchievement, 0) / employeeKPIs.length)
          }
        });
      }
    } catch (e) {
      console.warn('KPI DB query failed, falling back to mock:', (e as any).message);
    }
  }

  // Fallback to mock
  let filteredEmployeeKPIs = mockEmployeeKPIs;
  let filteredBranchKPIs = mockBranchKPIs;
  if (employeeId) filteredEmployeeKPIs = filteredEmployeeKPIs.filter(e => e.employeeId === employeeId);
  if (branchId) {
    filteredBranchKPIs = filteredBranchKPIs.filter(b => b.branchId === branchId);
    filteredEmployeeKPIs = filteredEmployeeKPIs.filter(e => e.branchName.includes(branchId as string));
  }

  return res.status(200).json({
    employeeKPIs: filteredEmployeeKPIs,
    branchKPIs: filteredBranchKPIs,
    summary: {
      totalEmployees: filteredEmployeeKPIs.length,
      exceeded: filteredEmployeeKPIs.filter(e => e.status === 'exceeded').length,
      achieved: filteredEmployeeKPIs.filter(e => e.status === 'achieved').length,
      partial: filteredEmployeeKPIs.filter(e => e.status === 'partial').length,
      notAchieved: filteredEmployeeKPIs.filter(e => e.status === 'not_achieved').length,
      avgAchievement: Math.round(filteredEmployeeKPIs.reduce((s, e) => s + e.overallAchievement, 0) / (filteredEmployeeKPIs.length || 1))
    }
  });
}

async function createKPI(req: NextApiRequest, res: NextApiResponse) {
  const { employeeId, metrics, period } = req.body;

  if (!employeeId || !metrics || metrics.length === 0) {
    return res.status(400).json({ error: 'Employee ID and metrics are required' });
  }

  const targetPeriod = period || new Date().toISOString().substring(0, 7);

  if (EmployeeKPI) {
    try {
      const created = await Promise.all(
        metrics.map((m: any) =>
          EmployeeKPI.create({
            employeeId,
            branchId: m.branchId || null,
            period: targetPeriod,
            metricName: m.name,
            category: m.category || 'operations',
            target: m.target,
            actual: m.actual || 0,
            unit: m.unit || '%',
            weight: m.weight || 100,
            status: 'pending',
            tenantId: m.tenantId || null
          })
        )
      );
      return res.status(201).json({ kpis: created, message: 'KPI created successfully' });
    } catch (e: any) {
      console.error('KPI create error:', e.message);
      return res.status(500).json({ error: 'Failed to create KPI', details: e.message });
    }
  }

  // Fallback
  return res.status(201).json({
    kpi: { id: Date.now().toString(), employeeId, metrics, period: targetPeriod, createdAt: new Date().toISOString() },
    message: 'KPI created successfully (mock)'
  });
}

async function updateKPI(req: NextApiRequest, res: NextApiResponse) {
  const { id, employeeId, metricId, actual, status } = req.body;

  if (!id && (!employeeId || !metricId)) {
    return res.status(400).json({ error: 'KPI ID or (Employee ID + metric ID) required' });
  }

  if (EmployeeKPI) {
    try {
      const kpi = id
        ? await EmployeeKPI.findByPk(id)
        : await EmployeeKPI.findOne({ where: { employeeId, id: metricId } });

      if (!kpi) return res.status(404).json({ error: 'KPI record not found' });

      const updateData: any = {};
      if (actual !== undefined) updateData.actual = actual;
      if (status) updateData.status = status;

      // Auto-determine status based on achievement
      if (actual !== undefined && !status) {
        const target = parseFloat(kpi.target) || 0;
        const achievement = target > 0 ? (actual / target) * 100 : 0;
        if (achievement >= 110) updateData.status = 'exceeded';
        else if (achievement >= 100) updateData.status = 'achieved';
        else if (achievement >= 80) updateData.status = 'in_progress';
        else updateData.status = 'not_achieved';
      }

      await kpi.update(updateData);
      return res.status(200).json({ kpi, message: 'KPI updated successfully' });
    } catch (e: any) {
      return res.status(500).json({ error: 'Failed to update KPI', details: e.message });
    }
  }

  return res.status(200).json({
    message: 'KPI updated successfully (mock)',
    updated: { employeeId, metricId, actual, updatedAt: new Date().toISOString() }
  });
}
