import generatePDF from './lib/generate-pdf.js';
import { deliveryConfirmation } from './lib/email-templates.js';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const submissionId = req.query.id || '3975bdf6-27e9-462a-949d-4d117517c238';
  const useTestSender = req.query.test === '1'; // ?test=1 to use onboarding@resend.dev
  const logs = [];
  const log = (msg) => { console.log(msg); logs.push(msg); };

  try {
    log('1. Fetching submission: ' + submissionId);
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('plan, email, form_data')
      .eq('id', submissionId)
      .single();

    if (fetchError) {
      log('FETCH ERROR: ' + JSON.stringify(fetchError));
      return res.status(500).json({ logs, error: fetchError });
    }

    log('2. Submission fetched. Plan: ' + submission.plan + ', Email: ' + submission.email);
    log('3. RESEND_API_KEY set: ' + !!process.env.RESEND_API_KEY);
    log('4. RESEND_FROM_EMAIL: ' + (process.env.RESEND_FROM_EMAIL || '(not set)'));

    log('5. Generating PDF...');
    const pdfBuffer = await generatePDF(submission.form_data, submission.plan);
    log('6. PDF generated! Size: ' + pdfBuffer.length + ' bytes');

    const guestName = submission.form_data['v-nombre'] || '';
    const planLabel = submission.plan === 'completo' ? 'Plan Completo' : 'Plan Esencial';
    const now = new Date();
    const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const orderDate = `${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;

    const html = deliveryConfirmation({ guestName, planLabel, orderDate });

    const resend = new Resend(process.env.RESEND_API_KEY);

    const fromAddr = useTestSender
      ? 'onboarding@resend.dev'
      : (process.env.RESEND_FROM_EMAIL || 'Carta de Invitación <cartas@cartadeinvitacionmexico.com>');

    log('7. Sending email from: ' + fromAddr + ' to: ' + submission.email);
    const { data, error } = await resend.emails.send({
      from: fromAddr,
      to: submission.email,
      subject: `Tu Carta de Invitación a México está lista — ${planLabel}`,
      html,
      attachments: [
        {
          filename: `Carta-Invitacion-Mexico-${(guestName || 'visitante').replace(/\s+/g, '-')}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      log('8. RESEND ERROR: ' + JSON.stringify(error));
      return res.status(500).json({ success: false, logs, error });
    }

    log('8. EMAIL ACCEPTED! Resend ID: ' + data.id);

    // Also check the email status
    try {
      const status = await resend.emails.get(data.id);
      log('9. Email status: ' + JSON.stringify(status));
    } catch (e) {
      log('9. Could not fetch email status: ' + e.message);
    }

    return res.status(200).json({ success: true, logs });
  } catch (err) {
    log('ERROR: ' + err.message);
    log('STACK: ' + err.stack);
    return res.status(500).json({ success: false, logs, error: err.message });
  }
}
