/**
 * Reads the daily SEO rank check report and sends it via Resend API.
 * Expects env vars: RESEND_API_KEY, REPORT_DATE (YYYY-MM-DD)
 */

import { readFileSync } from 'fs';

const date = process.env.REPORT_DATE || new Date().toISOString().split('T')[0];
const reportPath = `seo-rankings/${date}-rank-check.md`;

const markdown = readFileSync(reportPath, 'utf-8');

// Extract ranked count for subject line (matches "X in top 10, Y / 10 total")
const rankedMatch = markdown.match(/Keywords ranked:.*?(\d+)\s*\/\s*10\s*total/);
const ranked = rankedMatch ? rankedMatch[1] : '?';

// Extract best position for subject
const bestMatch = markdown.match(/Best position:.*?#([\d.]+)\s+for\s+"([^"]+)"/);
const bestInfo = bestMatch ? ` — best #${Math.round(parseFloat(bestMatch[1]))}` : '';

function markdownToHtml(md) {
  const lines = md.split('\n');
  const result = [];
  let inTable = false;
  let isHeaderRow = true;

  for (const line of lines) {
    // Table separator row — skip
    if (/^\|[\s-|]+\|$/.test(line)) {
      continue;
    }

    // Table row
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        isHeaderRow = true;
        result.push('<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">');
      }
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      const tag = isHeaderRow ? 'th' : 'td';
      const bgStyle = isHeaderRow
        ? 'background:#1a2744;color:#fff;'
        : '';
      const cellStyle = `padding:10px 12px;border:1px solid #e5ddd0;text-align:left;${bgStyle}`;
      result.push(
        '<tr>' +
        cells.map(c => `<${tag} style="${cellStyle}">${boldify(c)}</${tag}>`).join('') +
        '</tr>'
      );
      isHeaderRow = false;
      continue;
    }

    // Close table if we were in one
    if (inTable) {
      inTable = false;
      result.push('</table>');
    }

    // H1
    if (line.startsWith('# ')) {
      result.push(`<h1 style="color:#1a2744;font-size:24px;margin:24px 0 8px;">${line.slice(2)}</h1>`);
      continue;
    }

    // H2
    if (line.startsWith('## ')) {
      result.push(`<h2 style="color:#1a2744;font-size:20px;margin:24px 0 8px;border-bottom:2px solid #d4a853;padding-bottom:6px;">${line.slice(3)}</h2>`);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      result.push(`<blockquote style="margin:12px 0;padding:12px 16px;background:#fdfaf6;border-left:4px solid #d4a853;color:#4b5563;font-size:13px;">${boldify(line.slice(2))}</blockquote>`);
      continue;
    }

    // List item
    if (line.startsWith('- ')) {
      result.push(`<li style="margin:4px 0;padding-left:4px;">${boldify(line.slice(2))}</li>`);
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      result.push('<br>');
      continue;
    }

    // Regular paragraph
    result.push(`<p style="margin:4px 0;line-height:1.6;">${boldify(line)}</p>`);
  }

  if (inTable) result.push('</table>');

  return result.join('\n');
}

function boldify(text) {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fdfaf6;color:#1a2744;padding:24px;margin:0;">
  <div style="max-width:700px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e5ddd0;">
    <div style="border-bottom:3px solid #d4a853;padding-bottom:16px;margin-bottom:24px;">
      <h1 style="color:#1a2744;margin:0;font-size:22px;">SEO Rank Check</h1>
      <p style="color:#6b7280;margin:6px 0 0;font-size:14px;">cartadeinvitacionmexico.com &mdash; ${date}</p>
    </div>
    ${markdownToHtml(markdown)}
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5ddd0;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">Automated daily report &bull; Google Search Console + GitHub Actions</p>
    </div>
  </div>
</body>
</html>`;

const subject = `SEO Rank Check — ${date} — ${ranked}/10 keywords ranked${bestInfo}`;

async function sendEmail(from, to) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, html, text: markdown }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  console.log(`Email sent to ${to} (id: ${data.id})`);
  return true;
}

try {
  await sendEmail(
    'seo@raffaellostarace.com',
    'starace.raffaello@gmail.com'
  );
} catch (err) {
  console.error('Email send failed:', err.message);
  process.exit(1);
}
