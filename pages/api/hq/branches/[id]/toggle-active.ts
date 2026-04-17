import type { NextApiRequest, NextApiResponse } from 'next';
import { successResponse, errorResponse, ErrorCodes, HttpStatus } from '../../../../../lib/api/response';
import { withHQAuth } from '../../../../../lib/middleware/withHQAuth';
const { tenantContext, requireTenant } = require('../../../../../middleware/tenantContext');

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'PATCH') {
    res.setHeader('Allow', ['POST', 'PATCH']);
    return res.status(HttpStatus.METHOD_NOT_ALLOWED).json(
      errorResponse(ErrorCodes.METHOD_NOT_ALLOWED, `Method ${req.method} Not Allowed`)
    );
  }

  try {
    await new Promise((resolve, reject) => tenantContext(req, res, (e: any) => (e ? reject(e) : resolve(true))));
    await new Promise((resolve, reject) => requireTenant(req, res, (e: any) => (e ? reject(e) : resolve(true))));

    const { id } = req.query;
    const tenantId = (req as any).tenantId;

    const { Branch } = require('../../../../../models');
    const branch = await Branch.findOne({ where: { id, tenantId } });

    if (!branch) {
      return res.status(HttpStatus.NOT_FOUND).json(
        errorResponse(ErrorCodes.NOT_FOUND, 'Branch not found')
      );
    }

    const nextActive = typeof req.body?.isActive === 'boolean' ? req.body.isActive : !branch.isActive;
    await branch.update({ isActive: nextActive });

    return res.status(HttpStatus.OK).json(
      successResponse(
        {
          id: branch.id,
          code: branch.code,
          name: branch.name,
          isActive: branch.isActive,
        },
        undefined,
        nextActive ? 'Branch activated' : 'Branch deactivated'
      )
    );
  } catch (error: any) {
    console.error('[branches/toggle-active] error:', error?.message || error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, error?.message || 'Failed to toggle branch status')
    );
  }
}

export default withHQAuth(handler, { module: 'branches' });
