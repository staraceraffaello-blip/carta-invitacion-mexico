import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLANS = {
  esencial: { name: 'Plan Esencial — Carta de Invitación', price: 500 }, // centavos
  completo: { name: 'Plan Completo — Carta de Invitación', price: 900 },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plan, email, formData } = req.body;

    // Validar campos requeridos
    if (!plan || !email || !formData) {
      return res.status(400).json({ error: 'Faltan campos requeridos: plan, email, formData' });
    }

    if (!PLANS[plan]) {
      return res.status(400).json({ error: 'Plan inválido. Usa "esencial" o "completo".' });
    }

    // 1. Guardar en Supabase con status pending_payment
    const { data: submission, error: dbError } = await supabase
      .from('submissions')
      .insert({
        plan,
        email,
        form_data: formData,
        status: 'pending_payment',
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('Supabase insert error:', dbError);
      return res.status(500).json({ error: 'Error al guardar los datos.' });
    }

    // 2. Crear Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: PLANS[plan].name,
              description: `Carta de Invitación a México — ${plan === 'esencial' ? '1 persona, 1 viaje' : 'Itinerario completo + acompañantes'}`,
            },
            unit_amount: PLANS[plan].price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      client_reference_id: submission.id,
      metadata: {
        submission_id: submission.id,
        plan,
      },
      success_url: `${req.headers.origin || process.env.SITE_URL || 'https://carta-invitacion-mexico-tawny.vercel.app'}/checkout?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || process.env.SITE_URL || 'https://carta-invitacion-mexico-tawny.vercel.app'}/checkout?status=cancelled&plan=${plan}`,
    });

    // 3. Guardar stripe session ID en el registro
    await supabase
      .from('submissions')
      .update({ stripe_session: session.id })
      .eq('id', submission.id);

    // 4. Devolver URL de Stripe Checkout
    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('Submit error:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}
