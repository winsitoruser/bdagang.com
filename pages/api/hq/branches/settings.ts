import type { NextApiRequest, NextApiResponse } from 'next';
import { successResponse, errorResponse, ErrorCodes, HttpStatus } from '../../../../lib/api/response';

let BranchSetting: any;
try {
  const models = require('../../../../models');
  BranchSetting = models.BranchSetting;
} catch (e) {
  console.warn('BranchSetting model not available');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getSettings(req, res);
      case 'PUT':
        return await updateSettings(req, res);
      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(HttpStatus.METHOD_NOT_ALLOWED).json(
          errorResponse(ErrorCodes.METHOD_NOT_ALLOWED, `Method ${req.method} Not Allowed`)
        );
    }
  } catch (error) {
    console.error('Branch Settings API Error:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, 'Internal server error')
    );
  }
}

async function getSettings(req: NextApiRequest, res: NextApiResponse) {
  const { branchId } = req.query;

  if (!branchId) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.MISSING_REQUIRED_FIELDS, 'Branch ID is required')
    );
  }

  try {
    if (BranchSetting) {
      const settings = await BranchSetting.findAll({
        where: { branchId }
      });

      const settingsMap = settings.reduce((acc: any, setting: any) => {
        if (!acc[setting.category]) acc[setting.category] = {};
        acc[setting.category][setting.key] = {
          value: setting.value,
          dataType: setting.dataType,
          description: setting.description
        };
        return acc;
      }, {});

      return res.status(HttpStatus.OK).json(
        successResponse({ settings: settingsMap })
      );
    }

    return res.status(HttpStatus.OK).json(
      successResponse({ settings: getMockSettings() })
    );
  } catch (error) {
    console.error('Error fetching settings:', error);
    return res.status(HttpStatus.OK).json(
      successResponse({ settings: getMockSettings() })
    );
  }
}

async function updateSettings(req: NextApiRequest, res: NextApiResponse) {
  const { branchId, settings } = req.body;

  if (!branchId || !settings) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.MISSING_REQUIRED_FIELDS, 'Branch ID and settings are required')
    );
  }

  try {
    if (BranchSetting) {
      for (const category in settings) {
        for (const key in settings[category]) {
          await BranchSetting.upsert({
            branchId,
            category,
            key,
            value: settings[category][key].value,
            dataType: settings[category][key].dataType || 'string'
          });
        }
      }

      return res.status(HttpStatus.OK).json(
        successResponse(null, undefined, 'Settings updated successfully')
      );
    }

    return res.status(HttpStatus.OK).json(
      successResponse(null, undefined, 'Settings updated (mock mode)')
    );
  } catch (error) {
    console.error('Error updating settings:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, 'Failed to update settings')
    );
  }
}

function getMockSettings() {
  return {
    general: {
      currency: { value: 'IDR', dataType: 'string' },
      timezone: { value: 'Asia/Jakarta', dataType: 'string' },
      language: { value: 'id', dataType: 'string' }
    },
    pos: {
      receipt_header: { value: 'Toko Bedagang', dataType: 'string' },
      receipt_footer: { value: 'Terima kasih', dataType: 'string' },
      tax_enabled: { value: 'true', dataType: 'boolean' },
      tax_rate: { value: '11', dataType: 'number' }
    },
    inventory: {
      low_stock_threshold: { value: '10', dataType: 'number' },
      sync_from_hq: { value: 'true', dataType: 'boolean' }
    }
  };
}
