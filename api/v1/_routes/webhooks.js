/**
 * POST /api/v1/webhooks — Register a new webhook
 * GET  /api/v1/webhooks — List registered webhooks
 *
 * Webhooks allow AI agents to receive callbacks when documents are
 * completed or fail. Requires API key authentication.
 *
 * NOTE: Webhook registrations are stored in-memory and will NOT persist
 * across Vercel cold starts. For production durability, migrate storage
 * to Supabase (see inline comments).
 */
import { randomUUID } from 'node:crypto';
import {
  jsonResponse,
  errorResponse,
  rateLimit,
  handleCors,
  authenticateApiKey,
} from '../_helpers.js';

/* ─── Valid webhook event types ─── */
const VALID_EVENTS = ['document.completed', 'document.failed'];

/* ─── In-memory webhook store (keyed by webhook ID) ─── */
// Each entry: { id, url, events, secret?, api_key_hash, created_at }
// WARNING: This map resets on every Vercel cold start.
// To persist, replace with Supabase table `webhooks`.
const webhookStore = new Map();

// Export for use by other modules (e.g., the Stripe webhook dispatcher)
export { webhookStore, VALID_EVENTS };

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
  // Rate limiting
  const rl = rateLimit(req, { maxRequests: 20, windowMs: 60000 });
  if (!rl.allowed) {
    res.setHeader('Retry-After', rl.retryAfter);
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

  try {
    const body = req.body;

    if (!body || typeof body !== 'object') {
      return errorResponse(res, 'INVALID_BODY', 'Request body must be a JSON object.', { rateLimitInfo: rl });
    }

    // ── Validate fields ──
    const errors = [];

    // URL — required, must be HTTPS
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

    // Events — required, non-empty array of valid event types
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

    // Secret — optional, but must be a string if provided
    if (body.secret !== undefined && typeof body.secret !== 'string') {
      errors.push({ code: 'INVALID_FIELD', message: 'secret must be a string.', field: 'secret' });
    }

    if (errors.length > 0) {
      return jsonResponse(res, { errors }, 400, rl);
    }

    // ── Deduplicate events ──
    const events = [...new Set(body.events)];

    // ── Create webhook record ──
    const webhookId = `wh_${randomUUID().replace(/-/g, '')}`;
    const now = new Date().toISOString();

    // Hash the API key to associate webhooks with the caller
    // (constant-length digest so we can filter by owner later)
    const apiKeyHash = hashApiKey(req);

    const webhook = {
      id: webhookId,
      url: body.url,
      events,
      ...(body.secret && { secret: body.secret }),
      api_key_hash: apiKeyHash,
      created_at: now,
    };

    webhookStore.set(webhookId, webhook);

    // ── Response (exclude internal fields) ──
    const responseBody = {
      webhook_id: webhook.id,
      url: webhook.url,
      events: webhook.events,
      created_at: webhook.created_at,
    };

    return jsonResponse(res, responseBody, 201, rl);

  } catch (err) {
    console.error('[api/v1/webhooks] POST error:', err);
    return errorResponse(res, 'INTERNAL_ERROR', 'An unexpected error occurred.', { status: 500, rateLimitInfo: rl });
  }
}

/* ─── GET: List webhooks for the authenticated API key ─── */
async function handleGet(req, res) {
  // Rate limiting
  const rl = rateLimit(req, { maxRequests: 60, windowMs: 60000 });
  if (!rl.allowed) {
    res.setHeader('Retry-After', rl.retryAfter);
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

  try {
    const apiKeyHash = hashApiKey(req);

    // Filter webhooks belonging to this API key
    const webhooks = [];
    for (const wh of webhookStore.values()) {
      if (wh.api_key_hash === apiKeyHash) {
        webhooks.push({
          webhook_id: wh.id,
          url: wh.url,
          events: wh.events,
          created_at: wh.created_at,
        });
      }
    }

    return jsonResponse(res, { webhooks }, 200, rl);

  } catch (err) {
    console.error('[api/v1/webhooks] GET error:', err);
    return errorResponse(res, 'INTERNAL_ERROR', 'An unexpected error occurred.', { status: 500, rateLimitInfo: rl });
  }
}

/* ─── Helpers ─── */

/**
 * Derive a simple hash from the API key in the request.
 * Used to associate webhooks with their owner without storing the raw key.
 */
function hashApiKey(req) {
  const authHeader = req.headers['authorization'] || '';
  const xApiKey = req.headers['x-api-key'] || '';
  const key = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : xApiKey.trim();

  // Simple FNV-1a 32-bit hash — sufficient for in-memory association
  let hash = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16);
}
