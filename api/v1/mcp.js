/**
 * POST /api/v1/mcp
 *
 * Model Context Protocol (MCP) server endpoint.
 * Accepts JSON-RPC 2.0 requests and exposes tools for AI agents to interact
 * with the carta de invitación service.
 *
 * Supported methods:
 *   - initialize          → server info & capabilities
 *   - tools/list          → available tools with JSON Schema input definitions
 *   - tools/call          → execute a tool (list_document_types, create_document, check_document_status)
 *
 * Auth: read-only tools require no API key; create_document requires auth.
 */
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import {
  rateLimit,
  handleCors,
  authenticateApiKey,
  corsHeaders,
} from './_helpers.js';
import DOCUMENT_TYPES from './_document-types-data.js';
import mexicoNow from '../lib/mexico-now.js';

/* ─── Lazy-init external clients (only when needed) ─── */
let _supabase;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return _supabase;
}

let _stripe;
function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

/* ─── Plan pricing (must match documents/index.js) ─── */
const PLANS = {
  esencial: { name: 'Plan Esencial — Carta de Invitación', price: 500 },
  completo: { name: 'Plan Completo — Carta de Invitación', price: 900 },
};

/* ─── JSON-RPC error codes ─── */
const PARSE_ERROR = -32700;
const INVALID_REQUEST = -32600;
const METHOD_NOT_FOUND = -32601;
const INVALID_PARAMS = -32602;
const INTERNAL_ERROR = -32603;

/* ─── MCP Protocol Version ─── */
const PROTOCOL_VERSION = '2024-11-05';

/* ─── Tool definitions ─── */
const TOOLS = [
  {
    name: 'list_document_types',
    description:
      'Returns available document types (plans) with their field definitions, descriptions, and pricing. No authentication required.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'create_document',
    description:
      'Creates a new invitation letter (carta de invitación) for Mexican immigration. Returns a document ID and Stripe Checkout URL for payment. Requires API key authentication. The PDF is generated automatically after payment is completed.',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['carta_invitacion_turismo'],
          description: 'Document type identifier. Currently only "carta_invitacion_turismo" is supported.',
        },
        inviter: {
          type: 'object',
          description: 'Details of the host/inviter in Mexico.',
          properties: {
            full_name: { type: 'string', description: 'Full legal name of the host' },
            gender: { type: 'string', enum: ['masculino', 'femenino'], description: 'Gender (for grammatical agreement in Spanish)' },
            nationality: { type: 'string', description: 'Nationality (e.g., "mexicana")' },
            birth_date: { type: 'string', description: 'Birth date in YYYY-MM-DD format' },
            address: { type: 'string', description: 'Full street address in Mexico' },
            city: { type: 'string', description: 'City' },
            state: { type: 'string', description: 'State (e.g., "Ciudad de México")' },
            zip: { type: 'string', description: 'Postal code' },
            id_type: { type: 'string', enum: ['ine', 'pasaporte', 'tarjeta_residente'], description: 'Type of official identification' },
            id_number: { type: 'string', description: 'Identification document number' },
            phone: { type: 'string', description: 'Phone number with country code' },
            email: { type: 'string', description: 'Email address' },
            occupation: { type: 'string', description: 'Occupation/profession' },
            company: { type: 'string', description: 'Employer name (optional)' },
            relationship_type: { type: 'string', enum: ['familiar', 'pareja', 'amigo', 'conocido'], description: 'Relationship to the traveler' },
            relationship_description: { type: 'string', description: 'Free-text description of the relationship' },
            hosts_traveler: { type: 'boolean', description: 'Whether the traveler stays at the inviter address' },
          },
          required: ['full_name', 'address', 'id_type', 'phone', 'email'],
        },
        traveler: {
          type: 'object',
          description: 'Details of the traveler/visitor.',
          properties: {
            full_name: { type: 'string', description: 'Full legal name as on passport' },
            gender: { type: 'string', enum: ['masculino', 'femenino'] },
            nationality: { type: 'string', description: 'Nationality (e.g., "colombiana")' },
            birth_date: { type: 'string', description: 'Birth date in YYYY-MM-DD format' },
            passport_number: { type: 'string', description: 'Passport number' },
            occupation: { type: 'string' },
            country_of_residence: { type: 'string' },
            email: { type: 'string', description: 'Email address (optional)' },
            address: { type: 'string', description: 'Full address in country of residence' },
            city: { type: 'string' },
            state: { type: 'string' },
            zip: { type: 'string' },
            travel_dates: {
              type: 'object',
              properties: {
                arrival: { type: 'string', description: 'Arrival date in YYYY-MM-DD format' },
                departure: { type: 'string', description: 'Departure date in YYYY-MM-DD format' },
              },
              required: ['arrival', 'departure'],
            },
            purpose: { type: 'string', description: 'Purpose of visit (e.g., "turismo", "negocios")' },
            activities: { type: 'string', description: 'Description of planned activities' },
            entry_type: { type: 'string', enum: ['aereo', 'terrestre', 'maritimo'] },
            entry_airport: { type: 'string' },
            entry_airline: { type: 'string' },
            entry_flight: { type: 'string' },
            exit_type: { type: 'string', enum: ['aereo', 'terrestre', 'maritimo'] },
            exit_airport: { type: 'string' },
            exit_airline: { type: 'string' },
            exit_flight: { type: 'string' },
          },
          required: ['full_name', 'nationality', 'passport_number', 'travel_dates', 'purpose'],
        },
        companions: {
          type: 'array',
          description: 'Additional travelers (triggers Plan Completo pricing at $9 USD instead of $5 USD)',
          items: {
            type: 'object',
            properties: {
              full_name: { type: 'string' },
              gender: { type: 'string', enum: ['masculino', 'femenino'] },
              nationality: { type: 'string' },
              birth_date: { type: 'string' },
              passport_number: { type: 'string' },
              occupation: { type: 'string' },
              relationship_type: { type: 'string' },
              relationship_description: { type: 'string' },
            },
            required: ['full_name', 'nationality', 'passport_number'],
          },
        },
        accommodation: {
          type: 'object',
          description: 'Accommodation details (when traveler does NOT stay with inviter)',
          properties: {
            name: { type: 'string' },
            street: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            zip: { type: 'string' },
          },
        },
        expenses: {
          type: 'object',
          properties: {
            host_covers: { type: 'boolean', description: 'Whether the host covers any expenses' },
            categories: {
              type: 'array',
              items: { type: 'string', enum: ['alojamiento', 'alimentos', 'transporte', 'actividades', 'medicos', 'otro'] },
            },
            other_description: { type: 'string' },
          },
        },
        itinerary: {
          type: 'array',
          description: 'Multi-destination itinerary (Plan Completo)',
          items: {
            type: 'object',
            properties: {
              city: { type: 'string' },
              date_from: { type: 'string' },
              date_to: { type: 'string' },
              activities: { type: 'string' },
              host_accommodation: { type: 'boolean' },
              accommodation_name: { type: 'string' },
            },
          },
        },
      },
      required: ['type', 'inviter', 'traveler'],
    },
  },
  {
    name: 'check_document_status',
    description:
      'Checks the status of a previously created document by its UUID. Returns status (pending_payment, processing, completed, failed) and download URL when completed. No authentication required.',
    inputSchema: {
      type: 'object',
      properties: {
        document_id: {
          type: 'string',
          description: 'The UUID of the document to check.',
        },
      },
      required: ['document_id'],
    },
  },
];

/* ─── Status mapping (same as documents/[id].js) ─── */
const STATUS_MAP = {
  'pending_payment': 'pending_payment',
  'paid': 'processing',
  'delivered': 'completed',
  'delivery_failed': 'failed',
};

/* ─── Valid ID types (same as documents/index.js) ─── */
const VALID_ID_TYPES = ['ine', 'pasaporte', 'tarjeta_residente'];

/* ═══════════════════════════════════════════════════════
   Main handler
   ═══════════════════════════════════════════════════════ */
export default async function handler(req, res) {
  // CORS preflight
  if (handleCors(req, res)) return;

  // Only POST
  if (req.method !== 'POST') {
    const cors = corsHeaders();
    for (const [key, value] of Object.entries(cors)) {
      res.setHeader(key, value);
    }
    res.setHeader('Content-Type', 'application/json');
    return res.status(405).json(
      rpcError(null, METHOD_NOT_FOUND, 'Only POST requests are accepted. Send a JSON-RPC 2.0 request.')
    );
  }

  // Rate limiting
  const rl = rateLimit(req, { maxRequests: 60, windowMs: 60000 });
  if (!rl.allowed) {
    const cors = corsHeaders();
    for (const [key, value] of Object.entries(cors)) {
      res.setHeader(key, value);
    }
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Retry-After', rl.retryAfter);
    return res.status(429).json(
      rpcError(null, INTERNAL_ERROR, `Rate limit exceeded. Retry after ${rl.retryAfter} seconds.`)
    );
  }

  // Set CORS + content type for all responses
  const cors = corsHeaders();
  for (const [key, value] of Object.entries(cors)) {
    res.setHeader(key, value);
  }
  res.setHeader('Content-Type', 'application/json');

  // Rate limit headers
  res.setHeader('X-RateLimit-Limit', rl.limit);
  res.setHeader('X-RateLimit-Remaining', rl.remaining);
  res.setHeader('X-RateLimit-Reset', rl.reset);

  // Parse body
  const body = req.body;
  if (!body || typeof body !== 'object') {
    return res.status(400).json(rpcError(null, PARSE_ERROR, 'Request body must be a valid JSON object.'));
  }

  // Validate JSON-RPC 2.0 envelope
  const { jsonrpc, id, method, params } = body;

  if (jsonrpc !== '2.0') {
    return res.status(400).json(rpcError(id ?? null, INVALID_REQUEST, 'jsonrpc field must be "2.0".'));
  }

  if (typeof method !== 'string') {
    return res.status(400).json(rpcError(id ?? null, INVALID_REQUEST, 'method field must be a string.'));
  }

  try {
    const result = await dispatch(method, params || {}, req);
    return res.status(200).json(rpcSuccess(id ?? null, result));
  } catch (err) {
    if (err.rpcCode) {
      return res.status(200).json(rpcError(id ?? null, err.rpcCode, err.message, err.data));
    }
    console.error('[api/v1/mcp] Unexpected error:', err);
    return res.status(200).json(rpcError(id ?? null, INTERNAL_ERROR, 'An unexpected error occurred.'));
  }
}

/* ═══════════════════════════════════════════════════════
   Method dispatcher
   ═══════════════════════════════════════════════════════ */
async function dispatch(method, params, req) {
  switch (method) {
    case 'initialize':
      return handleInitialize();

    case 'tools/list':
      return handleToolsList();

    case 'tools/call':
      return handleToolsCall(params, req);

    default:
      throw rpcErr(METHOD_NOT_FOUND, `Method "${method}" not found.`);
  }
}

/* ─── initialize ─── */
function handleInitialize() {
  return {
    protocolVersion: PROTOCOL_VERSION,
    serverInfo: {
      name: 'carta-invitacion-mexico',
      version: '1.0.0',
    },
    capabilities: {
      tools: {},
    },
  };
}

/* ─── tools/list ─── */
function handleToolsList() {
  return { tools: TOOLS };
}

/* ─── tools/call ─── */
async function handleToolsCall(params, req) {
  const { name, arguments: args } = params;

  if (!name || typeof name !== 'string') {
    throw rpcErr(INVALID_PARAMS, 'params.name is required and must be a string.');
  }

  switch (name) {
    case 'list_document_types':
      return toolListDocumentTypes();

    case 'create_document':
      return toolCreateDocument(args || {}, req);

    case 'check_document_status':
      return toolCheckDocumentStatus(args || {});

    default:
      throw rpcErr(METHOD_NOT_FOUND, `Tool "${name}" not found.`);
  }
}

/* ═══════════════════════════════════════════════════════
   Tool implementations
   ═══════════════════════════════════════════════════════ */

/* ─── list_document_types ─── */
function toolListDocumentTypes() {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ document_types: DOCUMENT_TYPES }, null, 2),
      },
    ],
  };
}

/* ─── create_document ─── */
async function toolCreateDocument(args, req) {
  // Require API key auth for write operations
  const auth = authenticateApiKey(req);
  if (!auth.valid) {
    throw rpcErr(
      INVALID_PARAMS,
      `Authentication required: ${auth.reason}`,
      { authentication_error: true }
    );
  }

  // Validate required fields
  const errors = [];

  if (!args.type || args.type !== 'carta_invitacion_turismo') {
    errors.push({ field: 'type', message: 'type must be "carta_invitacion_turismo".' });
  }

  if (!args.inviter || typeof args.inviter !== 'object') {
    errors.push({ field: 'inviter', message: 'inviter object is required.' });
  }

  if (!args.traveler || typeof args.traveler !== 'object') {
    errors.push({ field: 'traveler', message: 'traveler object is required.' });
  }

  if (errors.length > 0) {
    throw rpcErr(INVALID_PARAMS, 'Validation failed.', { errors });
  }

  const inviter = args.inviter;
  const traveler = args.traveler;

  // Validate inviter
  if (!inviter.full_name?.trim()) {
    errors.push({ field: 'inviter.full_name', message: 'Inviter full name is required.' });
  }
  if (!inviter.address?.trim()) {
    errors.push({ field: 'inviter.address', message: 'Inviter address is required.' });
  }
  if (!inviter.id_type || !VALID_ID_TYPES.includes(inviter.id_type)) {
    errors.push({ field: 'inviter.id_type', message: `id_type must be one of: ${VALID_ID_TYPES.join(', ')}.` });
  }
  if (!inviter.phone?.trim()) {
    errors.push({ field: 'inviter.phone', message: 'Inviter phone is required.' });
  }
  if (!inviter.email?.trim() || !isValidEmail(inviter.email)) {
    errors.push({ field: 'inviter.email', message: 'A valid inviter email is required.' });
  }

  // Validate traveler
  if (!traveler.full_name?.trim()) {
    errors.push({ field: 'traveler.full_name', message: 'Traveler full name is required.' });
  }
  if (!traveler.nationality?.trim()) {
    errors.push({ field: 'traveler.nationality', message: 'Traveler nationality is required.' });
  }
  if (!traveler.passport_number?.trim()) {
    errors.push({ field: 'traveler.passport_number', message: 'Traveler passport number is required.' });
  }
  if (!traveler.purpose?.trim()) {
    errors.push({ field: 'traveler.purpose', message: 'Traveler purpose is required.' });
  }

  // Travel dates
  if (!traveler.travel_dates || typeof traveler.travel_dates !== 'object') {
    errors.push({ field: 'traveler.travel_dates', message: 'traveler.travel_dates object is required.' });
  } else {
    if (!traveler.travel_dates.arrival || !isValidDate(traveler.travel_dates.arrival)) {
      errors.push({ field: 'traveler.travel_dates.arrival', message: 'Arrival must be a valid YYYY-MM-DD date.' });
    }
    if (!traveler.travel_dates.departure || !isValidDate(traveler.travel_dates.departure)) {
      errors.push({ field: 'traveler.travel_dates.departure', message: 'Departure must be a valid YYYY-MM-DD date.' });
    }
    if (
      traveler.travel_dates.arrival && traveler.travel_dates.departure &&
      isValidDate(traveler.travel_dates.arrival) && isValidDate(traveler.travel_dates.departure) &&
      new Date(traveler.travel_dates.departure) < new Date(traveler.travel_dates.arrival)
    ) {
      errors.push({ field: 'traveler.travel_dates.departure', message: 'Departure date must be on or after arrival date.' });
    }
  }

  // Validate companions
  const companions = args.companions || [];
  if (!Array.isArray(companions)) {
    errors.push({ field: 'companions', message: 'companions must be an array.' });
  } else {
    companions.forEach((comp, i) => {
      if (!comp.full_name?.trim()) {
        errors.push({ field: `companions[${i}].full_name`, message: `Companion ${i + 1} full_name is required.` });
      }
      if (!comp.nationality?.trim()) {
        errors.push({ field: `companions[${i}].nationality`, message: `Companion ${i + 1} nationality is required.` });
      }
      if (!comp.passport_number?.trim()) {
        errors.push({ field: `companions[${i}].passport_number`, message: `Companion ${i + 1} passport_number is required.` });
      }
    });
  }

  if (errors.length > 0) {
    throw rpcErr(INVALID_PARAMS, 'Validation failed.', { errors });
  }

  // Determine plan
  const plan = companions.length > 0 ? 'completo' : 'esencial';

  // Map to form data (reuse same logic as documents/index.js)
  const formData = mapApiToFormData(args, plan);

  // Store in Supabase
  const supabase = getSupabase();
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
    console.error('[api/v1/mcp] Supabase insert error:', dbError);
    throw rpcErr(INTERNAL_ERROR, 'Failed to create document record.');
  }

  // Create Stripe Checkout Session
  const stripe = getStripe();
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
      source: 'mcp',
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

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          document_id: submission.id,
          status: 'pending_payment',
          plan,
          checkout_url: session.url,
          expires_at: expiresAt,
          created_at: new Date().toISOString(),
        }, null, 2),
      },
    ],
  };
}

/* ─── check_document_status ─── */
async function toolCheckDocumentStatus(args) {
  const { document_id } = args;

  if (!document_id || typeof document_id !== 'string') {
    throw rpcErr(INVALID_PARAMS, 'document_id is required.');
  }

  // Validate UUID format
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(document_id)) {
    throw rpcErr(INVALID_PARAMS, 'document_id must be a valid UUID.');
  }

  const supabase = getSupabase();
  const { data: submission, error: fetchError } = await supabase
    .from('submissions')
    .select('id, plan, email, status, created_at, paid_at, delivered_at, pdf_url')
    .eq('id', document_id)
    .single();

  if (fetchError || !submission) {
    throw rpcErr(INVALID_PARAMS, 'Document not found.', { document_id });
  }

  const apiStatus = STATUS_MAP[submission.status] || submission.status;

  const response = {
    document_id: submission.id,
    status: apiStatus,
    plan: submission.plan,
    email: submission.email,
    created_at: submission.created_at,
  };

  if (submission.paid_at) {
    response.paid_at = submission.paid_at;
  }

  if (apiStatus === 'completed') {
    response.completed_at = submission.delivered_at;
    if (submission.pdf_url) {
      response.download_url = submission.pdf_url;
    }
  }

  if (apiStatus === 'failed') {
    response.failed_at = submission.delivered_at;
    response.error = {
      code: 'DELIVERY_FAILED',
      message: 'PDF generation or email delivery failed. Contact support.',
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(response, null, 2),
      },
    ],
  };
}

/* ═══════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════ */

/** Build a JSON-RPC 2.0 success response. */
function rpcSuccess(id, result) {
  return { jsonrpc: '2.0', id, result };
}

/** Build a JSON-RPC 2.0 error response. */
function rpcError(id, code, message, data) {
  const err = { jsonrpc: '2.0', id, error: { code, message } };
  if (data !== undefined) {
    err.error.data = data;
  }
  return err;
}

/** Create a throwable RPC error with a code. */
function rpcErr(code, message, data) {
  const err = new Error(message);
  err.rpcCode = code;
  err.data = data;
  return err;
}

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
 * generate-pdf.js expects. Reuses the same mapping logic as documents/index.js.
 */
function mapApiToFormData(body, plan) {
  const inv = body.inviter;
  const trav = body.traveler;
  const companions = body.companions || [];

  const invAddress = typeof inv.address === 'object' ? inv.address : null;

  const d = {
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

    'a-calle': invAddress ? invAddress.street : (inv.address?.trim() || ''),
    'a-colonia': invAddress?.neighborhood || '',
    'a-delegacion': invAddress?.municipality || '',
    'a-ciudad': invAddress?.city || inv.city || '',
    'a-estado': invAddress?.state || inv.state || '',
    'a-cp': invAddress?.zip || inv.zip || '',

    'v-nombre': trav.full_name?.trim() || '',
    'v_genero': trav.gender || 'masculino',
    'v-nacionalidad': trav.nationality?.trim() || '',
    'v-nacimiento': trav.birth_date || '',
    'v-pasaporte': trav.passport_number?.trim() || '',
    'v-ocupacion': trav.occupation || '',
    'v-residencia': trav.country_of_residence || '',
    'v-email': trav.email || '',

    'v-calle': trav.address || '',
    'v-ciudad': trav.city || '',
    'v-provincia': trav.state || '',
    'v-cp': trav.zip || '',

    'a-vinculo': inv.relationship_type || 'conocido',
    'a-parentesco': inv.relationship_detail || '',
    'a-parentesco-otro': inv.relationship_custom || '',
    'a-vinculo-detalle': inv.relationship_description || '',
    'a-tiempo-anios': inv.relationship_years != null ? String(inv.relationship_years) : '',
    'a-tiempo-meses': inv.relationship_months != null ? String(inv.relationship_months) : '',

    'j-motivo': trav.purpose || 'turismo',
    'j-actividades': trav.activities || '',
    'ing-fecha': trav.travel_dates?.arrival || '',
    'sal-fecha': trav.travel_dates?.departure || '',

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

    'aloj_es_anfitrion': inv.hosts_traveler !== false ? 'si' : 'no',
    'j-aloj-nombre': body.accommodation?.name || '',
    'j-al-calle': body.accommodation?.street || '',
    'j-al-colonia': body.accommodation?.neighborhood || '',
    'j-al-delegacion': body.accommodation?.municipality || '',
    'j-al-ciudad': body.accommodation?.city || '',
    'j-al-estado': body.accommodation?.state || '',
    'j-al-cp': body.accommodation?.zip || '',

    'gastos_anfitrion': body.expenses?.host_covers ? 'si' : 'no',
    'gastos_host_conceptos': body.expenses?.categories || [],
    'gastos-otro-texto': body.expenses?.other_description || '',

    'transporte_mx': body.transport_in_mexico || [],
  };

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

function mapIdType(apiType) {
  const map = {
    'INE': 'ine',
    'ine': 'ine',
    'pasaporte': 'pasaporte',
    'tarjeta_residente': 'residente',
  };
  return map[apiType] || apiType || 'ine';
}
