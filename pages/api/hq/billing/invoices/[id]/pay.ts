import type { NextApiRequest, NextApiResponse } from 'next';
import { withHQAuth } from '../../../../../../lib/middleware/withHQAuth';
import { getPaymentGateway, PaymentProvider } from '../../../../../../lib/services/payment';

const getDb = () => require('../../../../../../models');

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const session = (req as any).session;
  const tenantId = session?.user?.tenantId;
  if (!tenantId) return res.status(400).json({ success: false, error: 'Tenant not found' });

  const { id } = req.query;
  const { provider = 'midtrans', successUrl, failureUrl } = req.body || {};

  const db = getDb();
  const invoice = await db.Invoice.findOne({ where: { id, tenantId } });
  if (!invoice) return res.status(404).json({ success: false, error: 'Invoice not found' });
  if (invoice.status === 'paid') {
    return res.status(400).json({ success: false, error: 'Invoice already paid' });
  }

  const tenant = await db.Tenant.findByPk(tenantId);

  try {
    const gateway = getPaymentGateway(provider as PaymentProvider);
    const origin = (req.headers.origin as string) || '';

    const checkout = await gateway.createCheckout({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amount: Number(invoice.totalAmount),
      currency: invoice.currency || 'IDR',
      description: `Pembayaran Invoice ${invoice.invoiceNumber}`,
      customerName: tenant?.businessName || invoice.customerName,
      customerEmail: tenant?.businessEmail || invoice.customerEmail,
      customerPhone: (tenant as any)?.businessPhone || invoice.customerPhone,
      successUrl: successUrl || `${origin}/hq/billing-info/payment/success`,
      failureUrl: failureUrl || `${origin}/hq/billing-info/payment/failure`,
      metadata: { tenantId, invoiceId: invoice.id, retry: true }
    });

    invoice.paymentProvider = provider;
    invoice.externalId = checkout.providerTransactionId || invoice.externalId;
    await invoice.save();

    await db.PaymentTransaction.create({
      invoiceId: invoice.id,
      amount: invoice.totalAmount,
      currency: invoice.currency,
      status: 'pending',
      provider,
      providerTransactionId: checkout.providerTransactionId,
      rawPayload: checkout.rawResponse || null
    });

    return res.status(200).json({ success: true, data: checkout });
  } catch (error: any) {
    console.error('Invoice pay error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export default withHQAuth(handler);
