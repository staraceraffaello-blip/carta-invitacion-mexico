import generatePDF from './lib/generate-pdf.js';
import sendEmail from './lib/send-email.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Only allow GET for easy browser testing
  const submissionId = req.query.id || '3975bdf6-27e9-462a-949d-4d117517c238';
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
    log('5. form_data keys: ' + Object.keys(submission.form_data || {}).join(', '));

    log('6. Generating PDF...');
    const pdfBuffer = await generatePDF(submission.form_data, submission.plan);
    log('7. PDF generated! Size: ' + pdfBuffer.length + ' bytes');

    const guestName = submission.form_data['v-nombre'] || '';
    log('8. Sending email to: ' + submission.email);
    const emailResult = await sendEmail(submission.email, pdfBuffer, submission.plan, guestName);
    log('9. EMAIL SENT SUCCESSFULLY! Resend response: ' + JSON.stringify(emailResult));

    return res.status(200).json({ success: true, logs });
  } catch (err) {
    log('ERROR: ' + err.message);
    log('STACK: ' + err.stack);
    return res.status(500).json({ success: false, logs, error: err.message });
  }
}
