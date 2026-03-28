/**
 * POST /api/v1/documents
 *
 * Creates a new invitation letter document record and returns a Stripe
 * Checkout URL for the agent/user to complete payment.
 *
 * Does NOT generate the PDF immediately — that happens via the existing
 * Stripe webhook flow after payment is completed.
 */
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import {
  jsonResponse,
  errorResponse,
  rateLimit,
  handleCors,
  authenticateApiKey,
} from '../_helpers.js';
import mexicoNow from '../../lib/mexico-now.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ─── Plan pricing (must match api/submit.js) ─── */
const PLANS = {
  esencial: { name: 'Plan Esencial — Carta de Invitación', price: 500 },
  completo: { name: 'Plan Completo — Carta de Invitación', price: 900 },
};

/* ─── Idempotency store (in-memory, resets on cold start) ─── */
const idempotencyStore = new Map();
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/* ─── Valid ID types ─── */
const VALID_ID_TYPES = ['ine', 'pasaporte', 'tarjeta_residente'];

/* ─── Nationalities that map to form values ─── */
// We accept any non-empty string; the form uses a <select> but the API
// should be lenient and let the PDF generator handle the display value.

export default async function handler(req, res) {
  // CORS preflight
  if (handleCors(req, res)) return;

  // Only POST
  if (req.method !== 'POST') {
    return errorResponse(res, 'METHOD_NOT_ALLOWED', 'Only POST is allowed on this endpoint.', { status: 405 });
  }

  // Rate limiting
  const rl = rateLimit(req, { maxRequests: 20, windowMs: 60000 });
  if (!rl.allowed) {
    return errorResponse(res, 'RATE_LIMITED', 'Too many requests. Try again later.', {
      status: 429,
      rateLimitInfo: rl,
    });
  }

  // Authentication
  const auth = authenticateApiKey(req);
  if (!auth.valid) {
    return errorResponse(res, 'UNAUTHORIZED', auth.reason, { status: 401, rateLimitInfo: rl });
  }

  // Idempotency check
  const idempotencyKey = req.headers['idempotency-key'];
  if (idempotencyKey) {
    const cached = idempotencyStore.get(idempotencyKey);
    if (cached && Date.now() - cached.timestamp < IDEMPOTENCY_TTL_MS) {
      return jsonResponse(res, cached.response, cached.statusCode, rl);
    }
  }

  try {
    const body = req.body;

    if (!body || typeof body !== 'object') {
      return errorResponse(res, 'INVALID_BODY', 'Request body must be a JSON object.', { rateLimitInfo: rl });
    }

    // ── Validate top-level fields ──
    const errors = [];

    if (!body.type || body.type !== 'carta_invitacion_turismo') {
      errors.push({ code: 'INVALID_FIELD', message: 'type must be "carta_invitacion_turismo".', field: 'type' });
    }

    if (!body.inviter || typeof body.inviter !== 'object') {
      errors.push({ code: 'MISSING_FIELD', message: 'inviter object is required.', field: 'inviter' });
    }

    if (!body.traveler || typeof body.traveler !== 'object') {
      errors.push({ code: 'MISSING_FIELD', message: 'traveler object is required.', field: 'traveler' });
    }

    if (errors.length > 0) {
      return jsonResponse(res, { errors }, 400, rl);
    }

    // ── Validate inviter fields ──
    const inviter = body.inviter;
    if (!inviter.full_name?.trim()) {
      errors.push({ code: 'MISSING_FIELD', message: 'Inviter full name is required.', field: 'inviter.full_name' });
    }
    if (!inviter.address?.trim()) {
      errors.push({ code: 'MISSING_FIELD', message: 'Inviter address is required.', field: 'inviter.address' });
    }
    if (!inviter.id_type || !VALID_ID_TYPES.includes(inviter.id_type)) {
      errors.push({
        code: 'INVALID_FIELD',
        message: `id_type must be one of: ${VALID_ID_TYPES.join(', ')}.`,
        field: 'inviter.id_type',
      });
    }
    if (!inviter.phone?.trim()) {
      errors.push({ code: 'MISSING_FIELD', message: 'Inviter phone is required.', field: 'inviter.phone' });
    }
    if (!inviter.email?.trim() || !isValidEmail(inviter.email)) {
      errors.push({ code: 'INVALID_FIELD', message: 'A valid inviter email is required.', field: 'inviter.email' });
    }

    // ── Validate traveler fields ──
    const traveler = body.traveler;
    if (!traveler.full_name?.trim()) {
      errors.push({ code: 'MISSING_FIELD', message: 'Traveler full name is required.', field: 'traveler.full_name' });
    }
    if (!traveler.nationality?.trim()) {
      errors.push({ code: 'MISSING_FIELD', message: 'Traveler nationality is required.', field: 'traveler.nationality' });
    }
    if (!traveler.passport_number?.trim()) {
      errors.push({ code: 'MISSING_FIELD', message: 'Traveler passport number is required.', field: 'traveler.passport_number' });
    }

    // Travel dates
    if (!traveler.travel_dates || typeof traveler.travel_dates !== 'object') {
      errors.push({ code: 'MISSING_FIELD', message: 'traveler.travel_dates object is required.', field: 'traveler.travel_dates' });
    } else {
      if (!traveler.travel_dates.arrival || !isValidDate(traveler.travel_dates.arrival)) {
        errors.push({ code: 'INVALID_FIELD', message: 'travel_dates.arrival must be a valid YYYY-MM-DD date.', field: 'traveler.travel_dates.arrival' });
      }
      if (!traveler.travel_dates.departure || !isValidDate(traveler.travel_dates.departure)) {
        errors.push({ code: 'INVALID_FIELD', message: 'travel_dates.departure must be a valid YYYY-MM-DD date.', field: 'traveler.travel_dates.departure' });
      }
      if (
        traveler.travel_dates.arrival && traveler.travel_dates.departure &&
        isValidDate(traveler.travel_dates.arrival) && isValidDate(traveler.travel_dates.departure) &&
        new Date(traveler.travel_dates.departure) < new Date(traveler.travel_dates.arrival)
      ) {
        errors.push({ code: 'INVALID_FIELD', message: 'Departure date must be on or after arrival date.', field: 'traveler.travel_dates.departure' });
      }
    }

    if (!traveler.purpose?.trim()) {
      errors.push({ code: 'MISSING_FIELD', message: 'Traveler purpose is required.', field: 'traveler.purpose' });
    }

    // ── Validate companions (optional) ──
    const companions = body.companions || [];
    if (!Array.isArray(companions)) {
      errors.push({ code: 'INVALID_FIELD', message: 'companions must be an array.', field: 'companions' });
    } else {
      companions.forEach((comp, i) => {
        if (!comp.full_name?.trim()) {
          errors.push({ code: 'MISSING_FIELD', message: `Companion ${i + 1} full_name is required.`, field: `companions[${i}].full_name` });
        }
        if (!comp.nationality?.trim()) {
          errors.push({ code: 'MISSING_FIELD', message: `Companion ${i + 1} nationality is required.`, field: `companions[${i}].nationality` });
        }
        if (!comp.passport_number?.trim()) {
          errors.push({ code: 'MISSING_FIELD', message: `Companion ${i + 1} passport_number is required.`, field: `companions[${i}].passport_number` });
        }
      });
    }

    if (errors.length > 0) {
      return jsonResponse(res, { errors }, 400, rl);
    }

    // ── Determine plan based on companions ──
    const plan = companions.length > 0 ? 'completo' : 'esencial';

    // ── Map API fields → form data fields (matching generate-pdf.js expectations) ──
    const formData = mapApiToFormData(body, plan);

    // ── Store in Supabase ──
    // Note: we do NOT include a 'source' column since it may not exist
    // in the schema. The source is tracked via Stripe metadata instead.
    const { data: submission, error: dbError } = await supabase
      .from('submissions')
      .insert({
        plan,
        email: inviter.email.trim(),
        form_data: formData,
        status: 'pending_payment',
        created_at: mexicoNow(),
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('[api/v1/documents] Supabase insert error:', dbError);
      return errorResponse(res, 'DATABASE_ERROR', 'Failed to create document record.', { status: 500, rateLimitInfo: rl });
    }

    // ── Create Stripe Checkout Session ──
    const siteUrl = process.env.SITE_URL || 'https://cartadeinvitacionmexico.com';
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: PLANS[plan].name,
              description: plan === 'esencial'
                ? 'Carta de Invitación a México — 1 persona, 1 viaje'
                : `Carta de Invitación a México — Itinerario completo + ${companions.length} acompañante${companions.length > 1 ? 's' : ''}`,
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
        source: 'api_v1',
      },
      customer_email: inviter.email.trim(),
      success_url: `${siteUrl}/checkout?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout?status=cancelled`,
    });

    // Store Stripe session ID
    await supabase
      .from('submissions')
      .update({ stripe_session: session.id })
      .eq('id', submission.id);

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const responseBody = {
      document_id: submission.id,
      status: 'pending_payment',
      plan,
      checkout_url: session.url,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    };

    // Cache idempotent response
    if (idempotencyKey) {
      idempotencyStore.set(idempotencyKey, {
        response: responseBody,
        statusCode: 201,
        timestamp: Date.now(),
      });
      // Clean old entries
      if (idempotencyStore.size > 1000) {
        const cutoff = Date.now() - IDEMPOTENCY_TTL_MS;
        for (const [key, val] of idempotencyStore) {
          if (val.timestamp < cutoff) idempotencyStore.delete(key);
        }
      }
    }

    return jsonResponse(res, responseBody, 201, rl);

  } catch (err) {
    console.error('[api/v1/documents] Unexpected error:', err);
    return errorResponse(res, 'INTERNAL_ERROR', 'An unexpected error occurred.', { status: 500, rateLimitInfo: rl });
  }
}

/* ─── Helpers ─── */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidDate(str) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(str + 'T00:00:00');
  return !isNaN(d.getTime());
}

/**
 * Map the clean API request body → the flat form data object that
 * generate-pdf.js expects. Field names use the same hyphenated IDs
 * and underscore radio/checkbox names the HTML forms use.
 */
function mapApiToFormData(body, plan) {
  const inv = body.inviter;
  const trav = body.traveler;
  const companions = body.companions || [];

  // Parse inviter address into components if provided as structured object
  // or use the raw string for the street field
  const invAddress = typeof inv.address === 'object' ? inv.address : null;

  const d = {
    // ── Inviter (anfitrión) ──
    'a-nombre': inv.full_name?.trim() || '',
    'a_genero': inv.gender || 'masculino',
    'a-nacionalidad': inv.nationality || 'mexicana',
    'a-nacimiento': inv.birth_date || '',
    'a-id-tipo': mapIdType(inv.id_type),
    'a-id-num': inv.id_number || '',
    'a-telefono': inv.phone?.trim() || '',
    'a-email': inv.email?.trim() || '',
    'a-ocupacion': inv.occupation || '',
    'a-empresa': inv.company || '',

    // Address fields — if structured object provided, use components;
    // otherwise put the whole string in the street field
    'a-calle': invAddress ? invAddress.street : (inv.address?.trim() || ''),
    'a-colonia': invAddress?.neighborhood || '',
    'a-delegacion': invAddress?.municipality || '',
    'a-ciudad': invAddress?.city || inv.city || '',
    'a-estado': invAddress?.state || inv.state || '',
    'a-cp': invAddress?.zip || inv.zip || '',

    // ── Traveler (visitante) ──
    'v-nombre': trav.full_name?.trim() || '',
    'v_genero': trav.gender || 'masculino',
    'v-nacionalidad': trav.nationality?.trim() || '',
    'v-nacimiento': trav.birth_date || '',
    'v-pasaporte': trav.passport_number?.trim() || '',
    'v-ocupacion': trav.occupation || '',
    'v-residencia': trav.country_of_residence || '',
    'v-email': trav.email || '',

    // Traveler address
    'v-calle': trav.address || '',
    'v-ciudad': trav.city || '',
    'v-provincia': trav.state || '',
    'v-cp': trav.zip || '',

    // ── Relationship ──
    'a-vinculo': inv.relationship_type || 'conocido',
    'a-parentesco': inv.relationship_detail || '',
    'a-parentesco-otro': inv.relationship_custom || '',
    'a-vinculo-detalle': inv.relationship_description || '',
    'a-tiempo-anios': inv.relationship_years != null ? String(inv.relationship_years) : '',
    'a-tiempo-meses': inv.relationship_months != null ? String(inv.relationship_months) : '',

    // ── Trip details ──
    'j-motivo': trav.purpose || 'turismo',
    'j-actividades': trav.activities || '',
    'ing-fecha': trav.travel_dates?.arrival || '',
    'sal-fecha': trav.travel_dates?.departure || '',

    // Entry/exit transport (optional)
    'ingreso_tipo': trav.entry_type || '',
    'ing-aeropuerto': trav.entry_airport || '',
    'ing-aerolinea': trav.entry_airline || '',
    'ing-vuelo': trav.entry_flight || '',
    'ing-cruce': trav.entry_crossing || '',
    'ing-puerto': trav.entry_port || '',

    'salida_tipo': trav.exit_type || '',
    'sal-aeropuerto': trav.exit_airport || '',
    'sal-aerolinea': trav.exit_airline || '',
    'sal-vuelo': trav.exit_flight || '',
    'sal-cruce': trav.exit_crossing || '',
    'sal-puerto': trav.exit_port || '',

    // ── Accommodation ──
    'aloj_es_anfitrion': inv.hosts_traveler !== false ? 'si' : 'no',
    'j-aloj-nombre': body.accommodation?.name || '',
    'j-al-calle': body.accommodation?.street || '',
    'j-al-colonia': body.accommodation?.neighborhood || '',
    'j-al-delegacion': body.accommodation?.municipality || '',
    'j-al-ciudad': body.accommodation?.city || '',
    'j-al-estado': body.accommodation?.state || '',
    'j-al-cp': body.accommodation?.zip || '',

    // ── Expenses ──
    'gastos_anfitrion': body.expenses?.host_covers ? 'si' : 'no',
    'gastos_host_conceptos': body.expenses?.categories || [],
    'gastos-otro-texto': body.expenses?.other_description || '',

    // ── Transport in Mexico ──
    'transporte_mx': body.transport_in_mexico || [],
  };

  // ── Companions (Plan Completo) ──
  if (companions.length > 0) {
    d.companions = companions.map(comp => ({
      nombre: comp.full_name?.trim() || '',
      genero: comp.gender || 'masculino',
      nacionalidad: comp.nationality?.trim() || '',
      nacimiento: comp.birth_date || '',
      pasaporte: comp.passport_number?.trim() || '',
      ocupacion: comp.occupation || '',
      residencia: comp.country_of_residence || '',
      vinculo: comp.relationship_type || 'conocido',
      parentesco: comp.relationship_detail || '',
      parentesco_otro: comp.relationship_custom || '',
      vinculo_detalle: comp.relationship_description || '',
      tiempo_anios: comp.relationship_years != null ? String(comp.relationship_years) : '',
      tiempo_meses: comp.relationship_months != null ? String(comp.relationship_months) : '',
      mismo_domicilio: comp.same_address !== false ? 'si' : 'no',
      calle: comp.address || '',
      ciudad: comp.city || '',
      provincia: comp.state || '',
      cp: comp.zip || '',
    }));
  }

  // ── Destinations / Itinerary (Plan Completo) ──
  if (body.itinerary && Array.isArray(body.itinerary)) {
    d.destinos = body.itinerary.map(dest => ({
      ciudad: dest.city || '',
      fecha_desde: dest.date_from || '',
      fecha_hasta: dest.date_to || '',
      actividades: dest.activities || '',
      aloj_es_anfitrion: dest.host_accommodation ? 'si' : 'no',
      aloj_nombre: dest.accommodation_name || '',
      aloj_calle: dest.accommodation_street || '',
      aloj_colonia: dest.accommodation_neighborhood || '',
      aloj_delegacion: dest.accommodation_municipality || '',
      aloj_ciudad: dest.accommodation_city || '',
      aloj_estado: dest.accommodation_state || '',
      aloj_cp: dest.accommodation_zip || '',
    }));
  }

  return d;
}

/**
 * Map API id_type values to the form's expected values.
 */
function mapIdType(apiType) {
  const map = {
    'INE': 'ine',
    'ine': 'ine',
    'pasaporte': 'pasaporte',
    'tarjeta_residente': 'residente',
  };
  return map[apiType] || apiType || 'ine';
}
