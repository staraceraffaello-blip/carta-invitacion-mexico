import { Resend } from 'resend';
import { deliveryConfirmation } from './email-templates.js';
import mexicoNow from './mexico-now.js';

const resend = new Resend(process.env.RESEND_API_KEY);

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getDate()} de ${MONTHS_ES[d.getMonth()]} de ${d.getFullYear()}`;
}

/**
 * Send the invitation letter PDF to the customer via email.
 * @param {string} to — recipient email
 * @param {Buffer} pdfBuffer — the generated PDF
 * @param {'esencial'|'completo'} plan
 * @param {string} guestName — guest's full name for the subject line
 */
export default async function sendEmail(to, pdfBuffer, plan, guestName) {
  const planLabel = plan === 'completo' ? 'Plan Completo' : 'Plan Esencial';
  const orderDate = formatDate(mexicoNow());

  const html = deliveryConfirmation({
    guestName: guestName || 'tu visitante',
    planLabel,
    orderDate,
  });

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'Carta de Invitación <cartas@cartadeinvitacionmexico.com>',
    to,
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
    throw new Error(`Resend error: ${error.message}`);
  }

  return data;
}
