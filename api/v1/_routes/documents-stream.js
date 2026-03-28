/**
 * GET /api/v1/documents/:id/stream
 *
 * Server-Sent Events (SSE) endpoint for real-time document status updates.
 *
 * Streams status changes for a document as they occur, polling Supabase
 * every 3 seconds. Sends heartbeat events every 15 seconds. Auto-closes
 * when the document reaches a terminal state (completed / failed) or when
 * the Vercel function timeout approaches.
 *
 * Supports the Last-Event-ID header for reconnection — the client can
 * resume from the last received event without missing status transitions.
 */
import { createClient } from '@supabase/supabase-js';
import {
  errorResponse,
  rateLimit,
  handleCors,
  corsHeaders,
  authenticateApiKey,
} from '../_helpers.js';

export const config = { maxDuration: 60 };

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* ─── Status mapping (mirrors [id].js) ─── */
const STATUS_MAP = {
  'pending_payment': 'pending_payment',
  'paid': 'processing',
  'delivered': 'completed',
  'delivery_failed': 'failed',
};

const TERMINAL_STATUSES = new Set(['completed', 'failed']);

/* ─── SSE helpers ─── */

let eventCounter = 0;

function sseEvent(res, event, data, id = null) {
  const eventId = id || String(++eventCounter);
  res.write(`id: ${eventId}\n`);
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

/**
 * Fetch document from Supabase and map to API-facing shape.
 * Returns null if not found.
 */
async function fetchDocument(documentId) {
  const { data: submission, error } = await supabase
    .from('submissions')
    .select('id, plan, email, status, created_at, paid_at, delivered_at, pdf_url')
    .eq('id', documentId)
    .single();

  if (error || !submission) return null;

  const apiStatus = STATUS_MAP[submission.status] || submission.status;

  const doc = {
    document_id: submission.id,
    status: apiStatus,
    plan: submission.plan,
    created_at: submission.created_at,
    updated_at: submission.delivered_at || submission.paid_at || submission.created_at,
  };

  if (apiStatus === 'completed' && submission.pdf_url) {
    doc.download_url = submission.pdf_url;
  }

  if (apiStatus === 'failed') {
    doc.error = {
      code: 'DELIVERY_FAILED',
      message: 'PDF generation or email delivery failed. Contact support.',
    };
  }

  return doc;
}

/* ─── Handler ─── */

export default async function handler(req, res) {
  // CORS preflight
  if (handleCors(req, res)) return;

  // Only GET
  if (req.method !== 'GET') {
    return errorResponse(res, 'METHOD_NOT_ALLOWED', 'Only GET is allowed on this endpoint.', { status: 405 });
  }

  // Rate limiting — stricter for long-lived streams (10 per minute per IP)
  const rl = rateLimit(req, { maxRequests: 10, windowMs: 60000 });
  if (!rl.allowed) {
    return errorResponse(res, 'RATE_LIMITED', 'Too many stream connections. Try again later.', {
      status: 429,
      rateLimitInfo: rl,
    });
  }

  // Optional auth (same as [id].js)
  const authHeader = req.headers['authorization'] || '';
  const xApiKey = req.headers['x-api-key'] || '';
  if (authHeader || xApiKey) {
    const auth = authenticateApiKey(req);
    if (!auth.valid) {
      return errorResponse(res, 'UNAUTHORIZED', auth.reason, { status: 401, rateLimitInfo: rl });
    }
  }

  // Validate document ID
  const documentId = req.query.id;

  if (!documentId) {
    return errorResponse(res, 'MISSING_FIELD', 'Document ID is required.', { field: 'id', rateLimitInfo: rl });
  }

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(documentId)) {
    return errorResponse(res, 'INVALID_FIELD', 'Document ID must be a valid UUID.', { field: 'id', rateLimitInfo: rl });
  }

  // Verify document exists BEFORE switching to SSE mode
  const initialDoc = await fetchDocument(documentId);
  if (!initialDoc) {
    return errorResponse(res, 'NOT_FOUND', 'Document not found.', { status: 404, rateLimitInfo: rl });
  }

  // ─── Switch to SSE mode ───
  const cors = corsHeaders();
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    ...cors,
  });

  // Retry directive — client should reconnect after 3 seconds if disconnected
  res.write('retry: 3000\n\n');

  // ─── Reconnection: check Last-Event-ID ───
  const lastEventId = req.headers['last-event-id'] || null;
  let lastStatus = null;

  // If reconnecting, the client already has the last status.
  // We still send the current state so they have the latest.
  if (lastEventId) {
    // lastEventId format: "{documentId}:{status}:{counter}"
    const parts = lastEventId.split(':');
    if (parts.length >= 2) {
      lastStatus = parts[1];
    }
  }

  // Send the initial status event
  const initialEventId = `${documentId}:${initialDoc.status}:${Date.now()}`;
  sseEvent(res, 'status', initialDoc, initialEventId);
  lastStatus = initialDoc.status;

  // If already terminal, close immediately
  if (TERMINAL_STATUSES.has(initialDoc.status)) {
    res.end();
    return;
  }

  // ─── Poll loop ───
  const startTime = Date.now();
  const TIMEOUT_MS = 55000;         // 55s — leave 5s buffer before Vercel kills the function
  const POLL_INTERVAL = 3000;       // Check Supabase every 3s
  const HEARTBEAT_INTERVAL = 15000; // Heartbeat every 15s

  let lastHeartbeat = Date.now();
  let closed = false;

  // Detect client disconnect
  req.on('close', () => {
    closed = true;
  });

  const poll = async () => {
    if (closed) return;

    const elapsed = Date.now() - startTime;

    // Approaching timeout — send reconnect hint and close
    if (elapsed >= TIMEOUT_MS) {
      sseEvent(res, 'reconnect', {
        reason: 'server_timeout',
        message: 'Connection approaching server timeout. Please reconnect.',
        last_status: lastStatus,
      });
      res.end();
      return;
    }

    try {
      const doc = await fetchDocument(documentId);

      if (doc && doc.status !== lastStatus) {
        const eventId = `${documentId}:${doc.status}:${Date.now()}`;
        sseEvent(res, 'status', doc, eventId);
        lastStatus = doc.status;

        // Terminal — close the stream
        if (TERMINAL_STATUSES.has(doc.status)) {
          res.end();
          return;
        }
      }

      // Heartbeat
      const now = Date.now();
      if (now - lastHeartbeat >= HEARTBEAT_INTERVAL) {
        sseEvent(res, 'heartbeat', { timestamp: new Date().toISOString() });
        lastHeartbeat = now;
      }
    } catch (err) {
      console.error('[api/v1/documents/[id]/stream] Poll error:', err);
      sseEvent(res, 'error', {
        code: 'POLL_ERROR',
        message: 'Error fetching document status. Stream will continue.',
      });
    }

    // Schedule next poll
    if (!closed) {
      setTimeout(poll, POLL_INTERVAL);
    }
  };

  // Start polling after the initial event (first poll after POLL_INTERVAL)
  setTimeout(poll, POLL_INTERVAL);
}
