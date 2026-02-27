import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const getDb = () => require('../../../models');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const db = getDb();
    const { businessName, businessTypeCode } = req.body;

    if (!businessName || !businessTypeCode) {
      return res.status(400).json({
        success: false,
        message: 'Business name and type are required'
      });
    }

    // Check if user already has a tenant
    const userId = parseInt(session.user.id);
    const existingUser = await db.User.findByPk(userId);
    
    if (existingUser.tenantId) {
      // User already has a tenant - let them proceed instead of blocking
      return res.status(200).json({
        success: true,
        message: 'Tenant sudah ada, melanjutkan ke KYB',
        data: {
          tenantId: existingUser.tenantId,
          businessName: businessName || 'Existing'
        }
      });
    }

    // Get or create business type
    const businessTypeNames: Record<string, string> = {
      fine_dining: 'Fine Dining',
      cloud_kitchen: 'Cloud Kitchen',
      qsr: 'Quick Service Restaurant',
      cafe: 'Cafe',
      retail: 'Retail',
      fnb: 'Food & Beverage',
      bengkel: 'Bengkel & Otomotif',
      salon: 'Salon & Kecantikan',
    };

    const [businessType] = await db.BusinessType.findOrCreate({
      where: { code: businessTypeCode },
      defaults: {
        code: businessTypeCode,
        name: businessTypeNames[businessTypeCode] || businessTypeCode,
        description: `Jenis bisnis: ${businessTypeNames[businessTypeCode] || businessTypeCode}`,
        isActive: true,
      }
    });

    console.log('[Create Tenant] BusinessType:', businessType.code, businessType.id);

    // Generate unique tenant code from business name
    const baseCode = businessName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 8);
    const uniqueSuffix = Date.now().toString(36).toUpperCase().slice(-4);
    const tenantCode = `${baseCode || 'TNT'}-${uniqueSuffix}`;

    // Create tenant
    // status must be one of: 'active','inactive','suspended','trial' (DB ENUM)
    // onboardingStep must be INTEGER (DB column is int4)
    // code is NOT NULL in DB
    const tenant = await db.Tenant.create({
      businessName,
      businessTypeId: businessType.id,
      name: businessName,
      code: tenantCode,
      status: 'trial',
      isActive: true,
      setupCompleted: false,
      businessStructure: 'single_outlet',
      isHq: false,
      onboardingStep: 1
    });

    // Update user with tenant
    await existingUser.update({
      tenantId: tenant.id
    });

    // Create initial KYB application
    await db.KybApplication.create({
      userId,
      tenantId: tenant.id,
      status: 'draft',
      currentStep: 1,
      completionPercentage: 0
    });

    return res.status(200).json({
      success: true,
      message: 'Tenant created successfully',
      data: {
        tenantId: tenant.id,
        businessName: tenant.businessName
      }
    });
  } catch (error: any) {
    console.error('Create tenant error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create tenant'
    });
  }
}
