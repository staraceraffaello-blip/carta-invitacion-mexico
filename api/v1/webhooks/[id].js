/**
 * DELETE /api/v1/webhooks/:id
 *
 * Deletes a registered webhook. Requires API key authentication.
 * Only the API key that created the webhook can delete it.
 */
import {
  jsonResponse,
  errorResponse,
  rateLimit,
  handleCors,
  authenticateApiKey,
} from '../_helpers.js';
import { webhookStore } from './index.js';

export default async function handler(req, res) {
  // CORS preflight
  if (handleCors(req, res)) return;

  // Only DELETE
  if (req.method !== 'DELETE') {
    return errorResponse(res, 'METHOD_NOT_ALLOWED', 'Only DELETE is allowed on this endpoint.', { status: 405 });
  }

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
    // Extract webhook ID from the URL
    const webhookId = req.query.id;

    if (!webhookId) {
      return errorResponse(res, 'MISSING_FIELD', 'Webhook ID is required.', { field: 'id', rateLimitInfo: rl });
    }

    // Validate webhook ID format (wh_ prefix + hex)
    if (!/^wh_[0-9a-f]{32}$/.test(webhookId)) {
      return errorResponse(res, 'INVALID_FIELD', 'Webhook ID must be a valid wh_ identifier.', { field: 'id', rateLimitInfo: rl });
    }

    // Look up the webhook
    const webhook = webhookStore.get(webhookId);
    if (!webhook) {
      return errorResponse(res, 'NOT_FOUND', 'Webhook not found.', { status: 404, rateLimitInfo: rl });
    }

    // Verify ownership — only the API key that created the webhook can delete it
    const apiKeyHash = hashApiKey(req);
    if (webhook.api_key_hash !== apiKeyHash) {
      return errorResponse(res, 'NOT_FOUND', 'Webhook not found.', { status: 404, rateLimitInfo: rl });
    }

    // Delete
    webhookStore.delete(webhookId);

    return jsonResponse(res, { deleted: true, webhook_id: webhookId }, 200, rl);

  } catch (err) {
    console.error('[api/v1/webhooks/[id]] DELETE error:', err);
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
