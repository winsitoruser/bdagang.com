import type { NextApiRequest, NextApiResponse } from 'next';
import { successResponse, errorResponse, ErrorCodes, HttpStatus } from '../../../../lib/api/response';

interface KPITemplate {
  id: string;
  name: string;
  description: string;
  category: 'sales' | 'operational' | 'service' | 'hr' | 'financial';
  weight: number;
  targetType: 'percentage' | 'number' | 'currency' | 'rating';
  defaultTarget: number;
  minValue: number;
  maxValue: number;
  isActive: boolean;
  applicableTo: ('branch_manager' | 'supervisor' | 'staff' | 'all')[];
}

interface KPIScoringRule {
  id: string;
  templateId: string;
  minAchievement: number;
  maxAchievement: number;
  score: number;
  grade: string;
  color: string;
}

interface KPIPeriodSettings {
  id: string;
  year: number;
  quarter: number;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'closed';
  evaluationDeadline: string;
}

const mockTemplates: KPITemplate[] = [
  { id: '1', name: 'Revenue Achievement', description: 'Pencapaian target revenue bulanan', category: 'sales', weight: 25, targetType: 'currency', defaultTarget: 100000000, minValue: 0, maxValue: 200, isActive: true, applicableTo: ['branch_manager', 'supervisor'] },
  { id: '2', name: 'Transaction Count', description: 'Jumlah transaksi per hari', category: 'sales', weight: 15, targetType: 'number', defaultTarget: 150, minValue: 0, maxValue: 500, isActive: true, applicableTo: ['branch_manager', 'supervisor', 'staff'] },
  { id: '3', name: 'Customer Satisfaction', description: 'Skor kepuasan pelanggan', category: 'service', weight: 20, targetType: 'rating', defaultTarget: 4.5, minValue: 1, maxValue: 5, isActive: true, applicableTo: ['all'] },
  { id: '4', name: 'Stock Accuracy', description: 'Akurasi stok setelah stock opname', category: 'operational', weight: 15, targetType: 'percentage', defaultTarget: 98, minValue: 0, maxValue: 100, isActive: true, applicableTo: ['branch_manager', 'supervisor'] },
  { id: '5', name: 'Attendance Rate', description: 'Tingkat kehadiran karyawan', category: 'hr', weight: 10, targetType: 'percentage', defaultTarget: 95, minValue: 0, maxValue: 100, isActive: true, applicableTo: ['all'] },
  { id: '6', name: 'Expense Control', description: 'Pengendalian biaya operasional', category: 'financial', weight: 15, targetType: 'percentage', defaultTarget: 100, minValue: 0, maxValue: 150, isActive: true, applicableTo: ['branch_manager'] }
];

const mockScoringRules: KPIScoringRule[] = [
  { id: '1', templateId: 'all', minAchievement: 0, maxAchievement: 50, score: 1, grade: 'Poor', color: '#EF4444' },
  { id: '2', templateId: 'all', minAchievement: 50, maxAchievement: 70, score: 2, grade: 'Below Average', color: '#F97316' },
  { id: '3', templateId: 'all', minAchievement: 70, maxAchievement: 85, score: 3, grade: 'Average', color: '#EAB308' },
  { id: '4', templateId: 'all', minAchievement: 85, maxAchievement: 100, score: 4, grade: 'Good', color: '#22C55E' },
  { id: '5', templateId: 'all', minAchievement: 100, maxAchievement: 200, score: 5, grade: 'Excellent', color: '#3B82F6' }
];

const mockPeriodSettings: KPIPeriodSettings[] = [
  { id: '1', year: 2026, quarter: 1, startDate: '2026-01-01', endDate: '2026-03-31', status: 'active', evaluationDeadline: '2026-04-15' },
  { id: '2', year: 2026, quarter: 2, startDate: '2026-04-01', endDate: '2026-06-30', status: 'upcoming', evaluationDeadline: '2026-07-15' },
  { id: '3', year: 2025, quarter: 4, startDate: '2025-10-01', endDate: '2025-12-31', status: 'closed', evaluationDeadline: '2026-01-15' }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return getKPISettings(req, res);
      case 'POST':
        return createKPITemplate(req, res);
      case 'PUT':
        return updateKPISettings(req, res);
      case 'DELETE':
        return deleteKPITemplate(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(HttpStatus.METHOD_NOT_ALLOWED).json(
          errorResponse(ErrorCodes.METHOD_NOT_ALLOWED, `Method ${req.method} Not Allowed`)
        );
    }
  } catch (error) {
    console.error('KPI Settings API Error:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, 'Internal server error')
    );
  }
}

function getKPISettings(req: NextApiRequest, res: NextApiResponse) {
  const { type, category } = req.query;

  if (type === 'templates') {
    let filtered = [...mockTemplates];
    if (category && category !== 'all') {
      filtered = filtered.filter(t => t.category === category);
    }
    return res.status(HttpStatus.OK).json(successResponse({ templates: filtered }));
  }

  if (type === 'scoring') {
    return res.status(HttpStatus.OK).json(successResponse({ scoringRules: mockScoringRules }));
  }

  if (type === 'periods') {
    return res.status(HttpStatus.OK).json(successResponse({ periods: mockPeriodSettings }));
  }

  return res.status(HttpStatus.OK).json(
    successResponse({
      templates: mockTemplates,
      scoringRules: mockScoringRules,
      periods: mockPeriodSettings,
      summary: {
        totalTemplates: mockTemplates.length,
        activeTemplates: mockTemplates.filter(t => t.isActive).length,
        totalWeight: mockTemplates.reduce((sum, t) => sum + t.weight, 0)
      }
    })
  );
}

function createKPITemplate(req: NextApiRequest, res: NextApiResponse) {
  const { name, description, category, weight, targetType, defaultTarget, minValue, maxValue, applicableTo } = req.body;

  if (!name || !category || !weight) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.MISSING_REQUIRED_FIELDS, 'Name, category, and weight are required')
    );
  }

  const newTemplate: KPITemplate = {
    id: Date.now().toString(),
    name,
    description: description || '',
    category,
    weight,
    targetType: targetType || 'percentage',
    defaultTarget: defaultTarget || 100,
    minValue: minValue || 0,
    maxValue: maxValue || 100,
    isActive: true,
    applicableTo: applicableTo || ['all']
  };

  return res.status(HttpStatus.CREATED).json(
    successResponse(newTemplate, undefined, 'KPI template created successfully')
  );
}

function updateKPISettings(req: NextApiRequest, res: NextApiResponse) {
  const { type, id, ...data } = req.body;

  if (!id) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.MISSING_REQUIRED_FIELDS, 'ID is required')
    );
  }

  if (type === 'template') {
    const template = mockTemplates.find(t => t.id === id);
    if (!template) {
      return res.status(HttpStatus.NOT_FOUND).json(
        errorResponse(ErrorCodes.NOT_FOUND, 'Template not found')
      );
    }
    Object.assign(template, data);
    return res.status(HttpStatus.OK).json(
      successResponse(template, undefined, 'Template updated successfully')
    );
  }

  if (type === 'period') {
    const period = mockPeriodSettings.find(p => p.id === id);
    if (!period) {
      return res.status(HttpStatus.NOT_FOUND).json(
        errorResponse(ErrorCodes.NOT_FOUND, 'Period not found')
      );
    }
    Object.assign(period, data);
    return res.status(HttpStatus.OK).json(
      successResponse(period, undefined, 'Period updated successfully')
    );
  }

  return res.status(HttpStatus.BAD_REQUEST).json(
    errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid type')
  );
}

function deleteKPITemplate(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.body;

  if (!id) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.MISSING_REQUIRED_FIELDS, 'Template ID is required')
    );
  }

  const index = mockTemplates.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(HttpStatus.NOT_FOUND).json(
      errorResponse(ErrorCodes.NOT_FOUND, 'Template not found')
    );
  }

  mockTemplates.splice(index, 1);

  return res.status(HttpStatus.OK).json(
    successResponse(null, undefined, 'Template deleted successfully')
  );
}
