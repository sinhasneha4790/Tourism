import { confirmPaidBooking, markRefunded } from '@/lib/bookings';
import { verifyWebhookSignature } from '@/lib/razorpay';

interface WebhookBody {
  event: string;
  payload: {
    payment?: { entity: { id: string; order_id: string; status: string } };
    refund?: { entity: { id: string; payment_id: string } };
  };
}

/**
 * Razorpay webhook (Dashboard → Webhooks → https://<site>/api/payments/webhook,
 * events: payment.captured, order.paid, refund.processed). The signature over the raw
 * body is checked before anything is trusted.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhookSignature(raw, req.headers.get('x-razorpay-signature'))) {
    return new Response('invalid signature', { status: 400 });
  }
  let body: WebhookBody;
  try {
    body = JSON.parse(raw) as WebhookBody;
  } catch {
    return new Response('bad json', { status: 400 });
  }

  const payment = body.payload.payment?.entity;
  if ((body.event === 'payment.captured' || body.event === 'order.paid') && payment?.order_id) {
    await confirmPaidBooking(payment.order_id, payment.id);
  } else if (body.event === 'refund.processed' && body.payload.refund) {
    await markRefunded(body.payload.refund.entity.payment_id, body.payload.refund.entity.id);
  }
  return Response.json({ ok: true });
}
