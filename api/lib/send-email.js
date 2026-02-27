import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send the invitation letter PDF to the customer via email.
 * @param {string} to — recipient email
 * @param {Buffer} pdfBuffer — the generated PDF
 * @param {'esencial'|'completo'} plan
 * @param {string} guestName — guest's full name for the subject line
 */
export default async function sendEmail(to, pdfBuffer, plan, guestName) {
  const planLabel = plan === 'completo' ? 'Plan Completo' : 'Plan Esencial';

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'Carta de Invitación <cartas@cartadeinvitacionmexico.com>',
    to,
    subject: `Tu Carta de Invitación a México está lista — ${planLabel}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1F2937;">
        <div style="background: #1B3566; padding: 24px 32px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #fff; font-size: 20px; margin: 0;">Carta de Invitación a México</h1>
        </div>
        <div style="background: #fff; border: 1px solid #E5E7EB; border-top: none; padding: 32px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 15px; line-height: 1.6;">¡Hola!</p>
          <p style="font-size: 15px; line-height: 1.6;">
            Tu carta de invitación para <strong>${guestName || 'tu visitante'}</strong> ha sido generada
            exitosamente. Encontrarás el documento en PDF adjunto a este correo.
          </p>
          <div style="background: #F0F4FF; border-left: 4px solid #1B3566; padding: 16px 20px; margin: 24px 0; border-radius: 0 6px 6px 0;">
            <p style="margin: 0; font-size: 14px; color: #1B3566; font-weight: 600;">Recomendaciones:</p>
            <ul style="margin: 8px 0 0; padding-left: 18px; font-size: 13px; line-height: 1.7; color: #374151;">
              <li>Imprime la carta o tenla disponible en tu celular al momento de llegar a México.</li>
              <li>Lleva también copia de la identificación del anfitrión y comprobante de domicilio.</li>
              <li>Ten a la mano tu reservación de vuelo de regreso y comprobante de hospedaje.</li>
            </ul>
          </div>
          <p style="font-size: 13px; color: #6B7280; line-height: 1.6;">
            Si tienes alguna pregunta, responde directamente a este correo.
          </p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;">
          <p style="font-size: 11px; color: #9CA3AF; text-align: center;">
            cartadeinvitacionmexico.com · Este documento no constituye asesoría legal.
          </p>
        </div>
      </div>
    `,
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
