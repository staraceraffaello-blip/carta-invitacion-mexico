import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { buffer } from 'micro';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Vercel: desactivar body parser para recibir el raw body que Stripe necesita
export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let event;

  try {
    const rawBody = await buffer(req);
    const signature = req.headers['stripe-signature'];

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Solo procesamos checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const submissionId = session.metadata?.submission_id || session.client_reference_id;

    if (!submissionId) {
      console.error('No submission_id found in session:', session.id);
      return res.status(400).json({ error: 'Missing submission_id' });
    }

    try {
      // 1. Actualizar status a paid
      const { error: updateError } = await supabase
        .from('submissions')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          stripe_session: session.id,
        })
        .eq('id', submissionId);

      if (updateError) {
        console.error('Supabase update error:', updateError);
        return res.status(500).json({ error: 'Database update failed' });
      }

      // 2. TODO: Generar PDF y enviar email con Resend
      // Esto se implementará en el paso 5 del plan
      console.log(`Payment confirmed for submission ${submissionId}`);

    } catch (err) {
      console.error('Webhook processing error:', err);
      return res.status(500).json({ error: 'Processing failed' });
    }
  }

  // Stripe espera un 200 para confirmar recepción
  return res.status(200).json({ received: true });
}
