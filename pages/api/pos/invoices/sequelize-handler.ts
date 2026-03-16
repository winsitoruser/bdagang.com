import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Sequelize handler for POS invoices
 * Placeholder implementation - returns method not implemented
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return res.status(200).json({
        success: true,
        message: 'POS invoices endpoint - not yet implemented',
        data: []
      });

    case 'POST':
      return res.status(201).json({
        success: true,
        message: 'Invoice created - not yet implemented',
        data: null
      });

    default:
      return res.status(405).json({
        success: false,
        message: `Method ${method} not allowed`
      });
  }
}
