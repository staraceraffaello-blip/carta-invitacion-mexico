import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { buffer } from 'micro';
import generatePDF from './lib/generate-pdf.js';
import sendEmail from './lib/send-email.js';

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

      // 2. Fetch full submission data
      const { data: submission, error: fetchError } = await supabase
        .from('submissions')
        .select('plan, email, form_data')
        .eq('id', submissionId)
        .single();

      if (fetchError || !submission) {
        console.error('Failed to fetch submission:', fetchError);
        return res.status(500).json({ error: 'Failed to fetch submission data' });
      }

      // 3. Generate PDF and send email
      try {
        const pdfBuffer = await generatePDF(submission.form_data, submission.plan);
        const guestName = submission.form_data['v-nombre'] || '';

        await sendEmail(submission.email, pdfBuffer, submission.plan, guestName);

        await supabase
          .from('submissions')
          .update({ status: 'delivered', delivered_at: new Date().toISOString() })
          .eq('id', submissionId);

        console.log(`PDF generated and emailed for submission ${submissionId}`);
      } catch (deliveryErr) {
        console.error('PDF/email delivery failed:', deliveryErr);
        await supabase
          .from('submissions')
          .update({ status: 'delivery_failed' })
          .eq('id', submissionId);
      }

    } catch (err) {
      console.error('Webhook processing error:', err);
      return res.status(500).json({ error: 'Processing failed' });
    }
  }

  // Stripe espera un 200 para confirmar recepción
  return res.status(200).json({ received: true });
}
