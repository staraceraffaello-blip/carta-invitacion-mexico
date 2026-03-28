/**
 * POST /api/v1/webhooks — Register a new webhook
 * GET  /api/v1/webhooks — List registered webhooks
 *
 * Webhooks allow AI agents to receive callbacks when documents are
 * completed or fail. Requires API key authentication.
 *
 * Storage: Supabase `webhooks` table (persistent across cold starts).
 */
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import {
  jsonResponse,
  errorResponse,
  rateLimit,
  handleCors,
  authenticateApiKey,
} from '../_helpers.js';

/* ─── Valid webhook event types ─── */
const VALID_EVENTS = ['document.completed', 'document.failed'];

export { VALID_EVENTS };

/* ─── Supabase client ─── */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // CORS preflight
  if (handleCors(req, res)) return;

  if (req.method === 'POST') {
    return handlePost(req, res);
  }

  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  return errorResponse(res, 'METHOD_NOT_ALLOWED', 'Only POST and GET are allowed on this endpoint.', { status: 405 });
}

/* ─── POST: Register a webhook ─── */
async function handlePost(req, res) {
  const rl = rateLimit(req, { maxRequests: 20, windowMs: 60000 });
  if (!rl.allowed) {
    res.setHeader('Retry-After', rl.retryAfter);
    return errorResponse(res, 'RATE_LIMITED', 'Too many requests. Try again later.', {
      status: 429,
      rateLimitInfo: rl,
    });
  }

  const auth = authenticateApiKey(req);
  if (!auth.valid) {
    return errorResponse(res, 'UNAUTHORIZED', auth.reason, { status: 401, rateLimitInfo: rl });
  }

  try {
    const body = req.body;

    if (!body || typeof body !== 'object') {
      return errorResponse(res, 'INVALID_BODY', 'Request body must be a JSON object.', { rateLimitInfo: rl });
    }

    // ── Validate fields ──
    const errors = [];

    if (!body.url || typeof body.url !== 'string') {
      errors.push({ code: 'MISSING_FIELD', message: 'url is required.', field: 'url' });
    } else {
      try {
        const parsed = new URL(body.url);
        if (parsed.protocol !== 'https:') {
          errors.push({ code: 'INVALID_FIELD', message: 'url must use HTTPS.', field: 'url' });
        }
      } catch {
        errors.push({ code: 'INVALID_FIELD', message: 'url must be a valid URL.', field: 'url' });
      }
    }

    if (!body.events || !Array.isArray(body.events) || body.events.length === 0) {
      errors.push({ code: 'MISSING_FIELD', message: 'events must be a non-empty array.', field: 'events' });
    } else {
      const invalid = body.events.filter(e => !VALID_EVENTS.includes(e));
      if (invalid.length > 0) {
        errors.push({
          code: 'INVALID_FIELD',
          message: `Invalid event types: ${invalid.join(', ')}. Valid types: ${VALID_EVENTS.join(', ')}.`,
          field: 'events',
        });
      }
    }

    if (body.secret !== undefined && typeof body.secret !== 'string') {
      errors.push({ code: 'INVALID_FIELD', message: 'secret must be a string.', field: 'secret' });
    }

    if (errors.length > 0) {
      return jsonResponse(res, { errors }, 400, rl);
    }

    // ── Create webhook record ──
    const events = [...new Set(body.events)];
    const webhookId = `wh_${randomUUID().replace(/-/g, '')}`;
    const apiKeyHash = hashApiKey(req);

    const { data, error: dbError } = await supabase
      .from('webhooks')
      .insert({
        id: webhookId,
        url: body.url,
        events,
        secret: body.secret || null,
        api_key_hash: apiKeyHash,
      })
      .select('id, url, events, created_at')
      .single();

    if (dbError) {
      console.error('[api/v1/webhooks] Supabase insert error:', dbError);
      return errorResponse(res, 'INTERNAL_ERROR', 'Failed to register webhook.', { status: 500, rateLimitInfo: rl });
    }

    return jsonResponse(res, {
      webhook_id: data.id,
      url: data.url,
      events: data.events,
      created_at: data.created_at,
    }, 201, rl);

  } catch (err) {
    console.error('[api/v1/webhooks] POST error:', err);
    return errorResponse(res, 'INTERNAL_ERROR', 'An unexpected error occurred.', { status: 500, rateLimitInfo: rl });
  }
}

/* ─── GET: List webhooks for the authenticated API key ─── */
async function handleGet(req, res) {
  const rl = rateLimit(req, { maxRequests: 60, windowMs: 60000 });
  if (!rl.allowed) {
    res.setHeader('Retry-After', rl.retryAfter);
    return errorResponse(res, 'RATE_LIMITED', 'Too many requests. Try again later.', {
      status: 429,
      rateLimitInfo: rl,
    });
  }

  const auth = authenticateApiKey(req);
  if (!auth.valid) {
    return errorResponse(res, 'UNAUTHORIZED', auth.reason, { status: 401, rateLimitInfo: rl });
  }

  try {
    const apiKeyHash = hashApiKey(req);

    const { data: webhooks, error: dbError } = await supabase
      .from('webhooks')
      .select('id, url, events, created_at')
      .eq('api_key_hash', apiKeyHash)
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('[api/v1/webhooks] Supabase select error:', dbError);
      return errorResponse(res, 'INTERNAL_ERROR', 'Failed to list webhooks.', { status: 500, rateLimitInfo: rl });
    }

    return jsonResponse(res, {
      webhooks: (webhooks || []).map(wh => ({
        webhook_id: wh.id,
        url: wh.url,
        events: wh.events,
        created_at: wh.created_at,
      })),
    }, 200, rl);

  } catch (err) {
    console.error('[api/v1/webhooks] GET error:', err);
    return errorResponse(res, 'INTERNAL_ERROR', 'An unexpected error occurred.', { status: 500, rateLimitInfo: rl });
  }
}

/* ─── Helpers ─── */

function hashApiKey(req) {
  const authHeader = req.headers['authorization'] || '';
  const xApiKey = req.headers['x-api-key'] || '';
  const key = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : xApiKey.trim();

  let hash = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16);
}
