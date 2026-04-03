/**
 * Send article publication notification via Resend API.
 * Used for manual/local runs of the weekly-article skill.
 * (Remote trigger runs use Gmail MCP instead.)
 *
 * Usage:
 *   node scripts/send-article-notification.mjs \
 *     --title "Article Title" \
 *     --slug "article-slug" \
 *     --keyword "target keyword" \
 *     --summary "Brief summary" \
 *     [--aborted "reason"]
 *
 * Requires RESEND_API_KEY in .env.local
 */

import { readFileSync } from 'fs';

// Parse .env.local
const envPath = new URL('../.env.local', import.meta.url);
try {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([A-Z_]+)=(.+)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim();
    }
  }
} catch {
  console.error('Could not read .env.local — ensure RESEND_API_KEY is set');
  process.exit(1);
}

if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY not found in environment or .env.local');
  process.exit(1);
}

// Parse CLI args
const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  const key = process.argv[i]?.replace(/^--/, '');
  const val = process.argv[i + 1];
  if (key && val) args[key] = val;
}

const { title, slug, keyword, summary } = args;
const aborted = args.aborted;

if (!aborted && (!title || !slug)) {
  console.error('Required: --title "..." --slug "..." --keyword "..." --summary "..."');
  console.error('Or for abort: --aborted "reason"');
  process.exit(1);
}

const articleUrl = slug
  ? `https://cartadeinvitacionmexico.com/articulos/${slug}`
  : 'N/A';

const subject = aborted
  ? `Articulo NO publicado: ${aborted.slice(0, 60)}`
  : `Nuevo articulo publicado: ${title}`;

const body = aborted
  ? `El generador semanal de articulos NO publico esta semana.\n\nRazon: ${aborted}\n\nAccion requerida: revisar manualmente y decidir siguiente paso.`
  : [
      `Titulo: ${title}`,
      `URL: ${articleUrl}`,
      `Keyword objetivo: ${keyword || 'N/A'}`,
      '',
      `Resumen: ${summary || 'N/A'}`,
      '',
      'Este articulo fue generado automaticamente por el skill weekly-article.',
      'Verifica el contenido en el sitio y revisa el commit en GitHub.',
    ].join('\n');

const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fdfaf6;color:#1a2744;padding:24px;margin:0;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5ddd0;">
    <div style="border-bottom:3px solid #d4a853;padding-bottom:16px;margin-bottom:24px;">
      <h1 style="color:#1a2744;margin:0;font-size:20px;">${aborted ? 'Articulo No Publicado' : 'Nuevo Articulo Publicado'}</h1>
      <p style="color:#6b7280;margin:6px 0 0;font-size:14px;">cartadeinvitacionmexico.com</p>
    </div>
    ${aborted
      ? `<p style="color:#dc2626;font-weight:600;">Razon: ${aborted}</p><p>Accion requerida: revisar manualmente.</p>`
      : `<p><strong>Titulo:</strong> ${title}</p>
         <p><strong>URL:</strong> <a href="${articleUrl}" style="color:#4A6FA5;">${articleUrl}</a></p>
         <p><strong>Keyword:</strong> ${keyword || 'N/A'}</p>
         <p><strong>Resumen:</strong> ${summary || 'N/A'}</p>`
    }
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5ddd0;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">Generado por weekly-article skill</p>
    </div>
  </div>
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
    html,
    text: body,
  }),
});

if (!res.ok) {
  const err = await res.text();
  console.error(`Resend API error (${res.status}): ${err}`);
  process.exit(1);
}

const data = await res.json();
console.log(`Notification sent (id: ${data.id})`);
