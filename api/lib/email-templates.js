/**
 * Branded email template builder for Carta de Invitación México.
 *
 * Produces email-client-compatible HTML (table layout, inline styles,
 * Outlook VML fallbacks, dark-mode progressive enhancement).
 *
 * Brand tokens:  Navy #1B3566 · Gold #C9A84C · Cream #FAF8F4
 * Typography:    Georgia (headings) + Helvetica Neue/Arial (body)
 * Container:     560 px max-width
 */

// ── Brand logo (white variant) inlined as a data-URI ──────────────────
const LOGO_B64 =
  'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNDAgMTQwIiByb2xlPSJpbWciIGFyaWEtbGFiZWxsZWRieT0iY2ltLWxvZ28tdy10aXRsZSI+CiAgPHRpdGxlIGlkPSJjaW0tbG9nby13LXRpdGxlIj5DYXJ0YSBJbnZpdGFjacOzbiBNw6l4aWNvPC90aXRsZT4KCiAgPCEtLSBPdXRlciB3aGl0ZSBmcmFtZSAtLT4KICA8cmVjdCB4PSIyIiB5PSIyIiB3aWR0aD0iMTM2IiBoZWlnaHQ9IjEzNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuODgpIiBzdHJva2Utd2lkdGg9IjMiLz4KICA8IS0tIElubmVyIGdvbGQgYWNjZW50IGZyYW1lIC0tPgogIDxyZWN0IHg9IjgiIHk9IjgiIHdpZHRoPSIxMjQiIGhlaWdodD0iMTI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNDOUE4NEMiIHN0cm9rZS13aWR0aD0iMC44IiBvcGFjaXR5PSIwLjY1Ii8+CgogIDwhLS0gQ29ybmVyIGdvbGQgYWNjZW50cyAtLT4KICA8ZyBmaWxsPSIjQzlBODRDIiBvcGFjaXR5PSIwLjY1Ij4KICAgIDwhLS0gTlcgLS0+CiAgICA8cmVjdCB4PSI4IiAgICAgeT0iOCIgICAgIHdpZHRoPSIxNCIgIGhlaWdodD0iMS41Ii8+CiAgICA8cmVjdCB4PSI4IiAgICAgeT0iOCIgICAgIHdpZHRoPSIxLjUiIGhlaWdodD0iMTQiLz4KICAgIDwhLS0gTkUgLS0+CiAgICA8cmVjdCB4PSIxMTgiICAgeT0iOCIgICAgIHdpZHRoPSIxNCIgIGhlaWdodD0iMS41Ii8+CiAgICA8cmVjdCB4PSIxMzAuNSIgeT0iOCIgICAgIHdpZHRoPSIxLjUiIGhlaWdodD0iMTQiLz4KICAgIDwhLS0gU1cgLS0+CiAgICA8cmVjdCB4PSI4IiAgICAgeT0iMTMwLjUiIHdpZHRoPSIxNCIgIGhlaWdodD0iMS41Ii8+CiAgICA8cmVjdCB4PSI4IiAgICAgeT0iMTE4IiAgIHdpZHRoPSIxLjUiIGhlaWdodD0iMTQiLz4KICAgIDwhLS0gU0UgLS0+CiAgICA8cmVjdCB4PSIxMTgiICAgeT0iMTMwLjUiIHdpZHRoPSIxNCIgIGhlaWdodD0iMS41Ii8+CiAgICA8cmVjdCB4PSIxMzAuNSIgeT0iMTE4IiAgIHdpZHRoPSIxLjUiIGhlaWdodD0iMTQiLz4KICA8L2c+CgogIDwhLS0gQ0kg4oCUIHVwcGVyIGhhbGYsIHdoaXRlIC0tPgogIDx0ZXh0IHg9Ijc2IiB5PSI1NyIKICAgICAgICB0ZXh0LWFuY2hvcj0ibWlkZGxlIgogICAgICAgIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCAnVGltZXMgTmV3IFJvbWFuJywgc2VyaWYiCiAgICAgICAgZm9udC1zaXplPSI0NiIgZm9udC13ZWlnaHQ9IjcwMCIKICAgICAgICBmaWxsPSJ3aGl0ZSIKICAgICAgICBsZXR0ZXItc3BhY2luZz0iMTIiPkNJPC90ZXh0PgoKICA8IS0tIEdvbGQgc2VwYXJhdG9yIHJ1bGUgLS0+CiAgPGxpbmUgeDE9IjIwIiB5MT0iNzAiIHgyPSIxMjAiIHkyPSI3MCIgc3Ryb2tlPSIjQzlBODRDIiBzdHJva2Utd2lkdGg9IjAuOSIgb3BhY2l0eT0iMC41NSIvPgoKICA8IS0tIE1YIOKAlCBsb3dlciBoYWxmLCBnb2xkIC0tPgogIDx0ZXh0IHg9Ijc2IiB5PSIxMTYiCiAgICAgICAgdGV4dC1hbmNob3I9Im1pZGRsZSIKICAgICAgICBmb250LWZhbWlseT0iR2VvcmdpYSwgJ1RpbWVzIE5ldyBSb21hbicsIHNlcmlmIgogICAgICAgIGZvbnQtc2l6ZT0iNDYiIGZvbnQtd2VpZ2h0PSI3MDAiCiAgICAgICAgZmlsbD0iI0M5QTg0QyIKICAgICAgICBsZXR0ZXItc3BhY2luZz0iMTIiPk1YPC90ZXh0Pgo8L3N2Zz4K';

const LOGO_URI = `data:image/svg+xml;base64,${LOGO_B64}`;

// ── Shared font stacks ────────────────────────────────────────────────
const SERIF  = "Georgia, 'Times New Roman', serif";
const SANS   = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO   = "'Courier New', Courier, monospace";

// ── Shared head (resets, dark mode, mobile) ───────────────────────────
const HEAD = `
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <!--[if !mso]><!-->
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <!--<![endif]-->
  <!--[if mso]>
  <noscript><xml>
    <o:OfficeDocumentSettings>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml></noscript>
  <style>
    table { border-collapse: collapse; }
    td { font-family: Arial, sans-serif; }
  </style>
  <![endif]-->
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }
    @media (prefers-color-scheme: dark) {
      .email-bg   { background-color: #0C1830 !important; }
      .card-bg    { background-color: #132648 !important; }
      .body-text  { color: #E5E7EB !important; }
      .muted-text { color: #9CA3AF !important; }
      .summary-bg { background-color: #1B3566 !important; }
    }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .fluid           { max-width: 100% !important; height: auto !important; }
      .stack-column    { display: block !important; width: 100% !important; }
      .mobile-padding  { padding-left: 20px !important; padding-right: 20px !important; }
      .mobile-center   { text-align: center !important; }
    }
  </style>`;

// ── Reusable layout fragments ─────────────────────────────────────────

function header(title) {
  return `
          <!-- ====== HEADER ====== -->
          <tr>
            <td style="background-color: #1B3566; padding: 28px 32px; border-radius: 12px 12px 0 0;" class="mobile-padding">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="48" valign="middle" style="padding-right: 16px;">
                    <img src="${LOGO_URI}" alt="Carta Invitaci\u00F3n M\u00E9xico" width="44" height="44" style="display: block; width: 44px; height: 44px;">
                  </td>
                  <td valign="middle">
                    <h1 style="margin: 0; font-family: ${SERIF}; font-size: 20px; font-weight: 700; color: #FFFFFF; line-height: 1.3;">
                      ${title}
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ====== GOLD ACCENT LINE ====== -->
          <tr>
            <td style="background-color: #FFFFFF; height: 3px; font-size: 0; line-height: 0;">
              <div style="height: 3px; background: linear-gradient(to right, #C9A84C, #D9BC5C, #C9A84C);"></div>
              <!--[if mso]><div style="height: 3px; background-color: #C9A84C;"></div><![endif]-->
            </td>
          </tr>`;
}

function footer() {
  return `
          <!-- ====== FOOTER ====== -->
          <tr>
            <td style="background-color: #0C1830; padding: 24px 32px; border-radius: 0 0 12px 12px;" class="mobile-padding">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <img src="${LOGO_URI}" alt="CI MX" width="32" height="32" style="display: block; margin: 0 auto 10px; width: 32px; height: 32px;">
                    <p style="margin: 0 0 4px; font-family: ${SANS}; font-size: 12px; color: #4A6FA5;">
                      <a href="https://cartadeinvitacionmexico.com" style="color: #4A6FA5; text-decoration: underline;">cartadeinvitacionmexico.com</a>
                    </p>
                    <p style="margin: 12px 0 0; font-family: ${SANS}; font-size: 11px; color: #9CA3AF; line-height: 1.5;">
                      Este documento no constituye asesor\u00EDa legal.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
}

function goldButton(text, url) {
  return `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${url}" style="height:48px;v-text-anchor:middle;width:260px;" arcsize="17%" strokecolor="#C9A84C" fillcolor="#C9A84C">
                      <w:anchorlock/>
                      <center style="color:#1B3566;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">${text}</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${url}" target="_blank" style="display: inline-block; background-color: #C9A84C; color: #1B3566; font-family: ${SANS}; font-size: 16px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 8px; text-align: center;">
                      ${text}
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>`;
}

function summaryRow(label, value, options = {}) {
  const valueFont = options.mono ? MONO : SANS;
  const valueColor = options.muted ? '#6B7280' : '#1B3566';
  const valueWeight = options.muted ? '400' : '600';
  const valueSize = options.mono ? '13px' : '14px';
  return `
                      <tr>
                        <td style="font-family: ${SANS}; font-size: 14px; color: #6B7280; padding: 5px 0;">${label}</td>
                        <td align="right" style="font-family: ${valueFont}; font-size: ${valueSize}; color: ${valueColor}; font-weight: ${valueWeight};">${value}</td>
                      </tr>`;
}

function summaryCard(title, rows) {
  return `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td style="background-color: #FAF8F4; border-radius: 8px; padding: 20px;" class="summary-bg">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="font-family: ${SANS}; font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1.5px; padding-bottom: 14px;" colspan="2">
                          ${title}
                        </td>
                      </tr>
                      ${rows}
                    </table>
                  </td>
                </tr>
              </table>`;
}

function calloutBox(title, bulletPoints) {
  const bullets = bulletPoints.map(bp => `
                      <tr>
                        <td valign="top" style="padding: 3px 8px 3px 0; font-size: 13px; color: #C9A84C; line-height: 1.7;">&bull;</td>
                        <td style="font-family: ${SANS}; font-size: 13px; line-height: 1.7; color: #374151; padding-bottom: 4px;">
                          ${bp}
                        </td>
                      </tr>`).join('');

  return `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td style="background-color: #F0F4FF; border-left: 4px solid #1B3566; padding: 16px 20px; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0 0 10px; font-family: ${SANS}; font-size: 14px; color: #1B3566; font-weight: 600;">
                      ${title}
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      ${bullets}
                    </table>
                  </td>
                </tr>
              </table>`;
}

function goldDivider() {
  return `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding: 4px 0 20px;">
                    <div style="height: 1px; background: linear-gradient(to right, transparent, #C9A84C, transparent); opacity: 0.35;"></div>
                    <!--[if mso]><hr style="border: none; border-top: 1px solid #E5E7EB;"><![endif]-->
                  </td>
                </tr>
              </table>`;
}

function paragraph(text, options = {}) {
  const size = options.small ? '13px' : '15px';
  const color = options.muted ? '#6B7280' : '#1F2937';
  const cls = options.muted ? 'muted-text' : 'body-text';
  const mb = options.noMargin ? '0' : '20px';
  return `
              <p style="margin: 0 0 ${mb}; font-family: ${SANS}; font-size: ${size}; line-height: 1.6; color: ${color};" class="${cls}">
                ${text}
              </p>`;
}

// ── Wraps body content in the full email shell ────────────────────────
function wrap({ title, preheader, bodyRows }) {
  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <title>${title}</title>
  ${HEAD}
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F4; font-family: ${SANS};">

  <div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #FAF8F4;">
    ${preheader}
    &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FAF8F4;" class="email-bg">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" class="email-container" style="max-width: 560px; width: 100%;">

          ${header(title)}

          <!-- ====== BODY ====== -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 32px;" class="mobile-padding card-bg">
              ${bodyRows}
            </td>
          </tr>

          ${footer()}

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}


// ═══════════════════════════════════════════════════════════════════════
//  PUBLIC TEMPLATE:  Delivery Confirmation (PDF attached)
// ═══════════════════════════════════════════════════════════════════════

export function deliveryConfirmation({ guestName, planLabel, orderDate, orderId }) {
  const safeName = guestName || 'tu visitante';

  const body = [
    paragraph(`\u00A1Hola!`),
    paragraph(`Tu carta de invitaci\u00F3n para <strong style="color: #1B3566;">${safeName}</strong> ha sido generada exitosamente con el <strong style="color: #1B3566;">${planLabel}</strong>. Encontrar\u00E1s el documento en PDF adjunto a este correo.`),

    summaryCard('Resumen del pedido', [
      summaryRow('Plan', planLabel),
      summaryRow('Visitante', safeName),
      summaryRow('Fecha', orderDate || '\u2014'),
      summaryRow('Orden', orderId || '\u2014', { mono: true }),
    ].join('')),

    calloutBox('Recomendaciones', [
      'Imprime la carta o tenla disponible en tu celular al momento de llegar a M\u00E9xico.',
      'Lleva tambi\u00E9n copia de la identificaci\u00F3n del anfitri\u00F3n y comprobante de domicilio.',
      'Ten a la mano tu reservaci\u00F3n de vuelo de regreso y comprobante de hospedaje.',
    ]),

    goldButton('Visitar nuestro sitio', 'https://cartadeinvitacionmexico.com'),

    goldDivider(),

    paragraph('Si tienes alguna pregunta, responde directamente a este correo.', { small: true, muted: true, noMargin: true }),
  ].join('');

  return wrap({
    title: `Tu Carta de Invitaci\u00F3n est\u00E1 lista \u2014 ${planLabel}`,
    preheader: `Tu carta de invitaci\u00F3n para ${safeName} est\u00E1 lista. Encontrar\u00E1s el PDF adjunto.`,
    bodyRows: body,
  });
}
