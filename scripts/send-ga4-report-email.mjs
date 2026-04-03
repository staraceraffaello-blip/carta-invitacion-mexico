/**
 * Runs the GA4 report and sends it via Resend.
 *
 * Env vars required:
 *   GA4_SERVICE_ACCOUNT  — Google service account JSON string
 *   RESEND_API_KEY       — Resend API key
 *
 * Usage:
 *   node scripts/send-ga4-report-email.mjs          # 7-day report
 *   node scripts/send-ga4-report-email.mjs --days 14
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const scriptPath = join(__dirname, '..', 'ga4-report.mjs');

// Forward --days arg if present
const args = process.argv.slice(2);
const daysIdx = args.indexOf('--days');
const daysArg = daysIdx !== -1 && args[daysIdx + 1] ? `--days ${args[daysIdx + 1]}` : '';

function run(format) {
  return execSync(
    `node "${scriptPath}" --format ${format} ${daysArg}`,
    { encoding: 'utf-8', env: process.env, maxBuffer: 1024 * 1024 }
  ).trim();
}

// Generate both formats
let textBody, htmlBody;
try {
  textBody = run('text');
  htmlBody = run('html');
} catch (err) {
  // Script failed — send error notification instead
  const errorMsg = err.stderr || err.message;
  console.error('GA4 report failed:', errorMsg);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'seo@raffaellostarace.com',
      to: ['starace.raffaello@gmail.com'],
      subject: `GA4 Report FAILED — ${new Date().toISOString().split('T')[0]}`,
      text: `The GA4 weekly report failed to generate.\n\nError:\n${errorMsg}`,
    }),
  });

  if (!res.ok) console.error('Error email also failed:', await res.text());
  process.exit(1);
}

// Extract date range from text output (first line after header)
const dateMatch = textBody.match(/Date range:\s*(.+)/);
const dateRange = dateMatch ? dateMatch[1].trim() : new Date().toISOString().split('T')[0];

const subject = `GA4 Weekly Report — ${dateRange} — cartadeinvitacionmexico.com`;

// Wrap HTML in a full email document
const fullHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:24px;background:#fdfaf6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  ${htmlBody}
</body>
</html>`;

const res = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'seo@raffaellostarace.com',
    to: ['starace.raffaello@gmail.com'],
    subject,
    html: fullHtml,
    text: textBody,
  }),
});

if (!res.ok) {
  const err = await res.text();
  throw new Error(`Resend API error (${res.status}): ${err}`);
}

const data = await res.json();
console.log(`GA4 report emailed (id: ${data.id})`);
