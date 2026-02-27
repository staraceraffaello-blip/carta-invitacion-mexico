import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { buffer } from 'micro';
import generatePDF from './lib/generate-pdf.js';
import sendEmail from './lib/send-email.js';
import mexicoNow from './lib/mexico-now.js';

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
          paid_at: mexicoNow(),
          stripe_session: session.id,
        })
        .eq('id', submissionId);

      if (updateError) {
        console.error('Supabase update error:', updateError);
        return res.status(500).json({ error: 'Database update failed' });
      }

      // 2. Fetch full submission data
      console.log('[webhook] Fetching submission data for:', submissionId);
      const { data: submission, error: fetchError } = await supabase
        .from('submissions')
        .select('plan, email, form_data')
        .eq('id', submissionId)
        .single();

      if (fetchError || !submission) {
        console.error('[webhook] Failed to fetch submission:', fetchError);
        return res.status(500).json({ error: 'Failed to fetch submission data' });
      }

      console.log('[webhook] Submission fetched. Plan:', submission.plan, 'Email:', submission.email);
      console.log('[webhook] RESEND_API_KEY set:', !!process.env.RESEND_API_KEY);
      console.log('[webhook] RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || '(not set, using default)');

      // 3. Generate PDF, upload to storage, and send email
      try {
        console.log('[webhook] Generating PDF...');
        const pdfBuffer = await generatePDF(submission.form_data, submission.plan);
        console.log('[webhook] PDF generated, size:', pdfBuffer.length, 'bytes');

        // Upload PDF to Supabase Storage
        const guestName = submission.form_data['v-nombre'] || '';
        const safeName = (guestName || 'visitante').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
        const pdfPath = `${submissionId}/${safeName}.pdf`;
        console.log('[webhook] Uploading PDF to storage:', pdfPath);

        const { error: uploadErr } = await supabase.storage
          .from('pdfs')
          .upload(pdfPath, pdfBuffer, {
            contentType: 'application/pdf',
            upsert: true,
          });

        let pdfUrl = null;
        if (uploadErr) {
          console.error('[webhook] PDF upload failed (non-blocking):', uploadErr.message);
        } else {
          const { data: urlData } = supabase.storage.from('pdfs').getPublicUrl(pdfPath);
          pdfUrl = urlData.publicUrl;
          console.log('[webhook] PDF uploaded, URL:', pdfUrl);
        }

        // Send email
        console.log('[webhook] Sending email to:', submission.email);
        await sendEmail(submission.email, pdfBuffer, submission.plan, guestName);
        console.log('[webhook] Email sent successfully');

        const { error: deliverErr } = await supabase
          .from('submissions')
          .update({
            status: 'delivered',
            delivered_at: mexicoNow(),
            ...(pdfUrl && { pdf_url: pdfUrl }),
          })
          .eq('id', submissionId);

        if (deliverErr) console.error('[webhook] Failed to update status to delivered:', deliverErr);
        else console.log(`[webhook] Submission ${submissionId} marked as delivered`);
      } catch (deliveryErr) {
        console.error('[webhook] PDF/email delivery failed:', deliveryErr.message || deliveryErr);
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
