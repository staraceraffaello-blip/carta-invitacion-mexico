/**
 * GET /api/v1/documents/:id
 *
 * Check the status of a document by its ID.
 * Returns document status, and download URL when completed.
 *
 * Authentication is optional for GET — if an API key is provided it is
 * validated, but unauthenticated requests are also allowed (the document
 * ID itself acts as a bearer token since it is a UUID).
 */
import { createClient } from '@supabase/supabase-js';
import {
  jsonResponse,
  errorResponse,
  rateLimit,
  handleCors,
  authenticateApiKey,
} from '../_helpers.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* ─── Status mapping ─── */
// Map internal statuses to API-facing statuses
const STATUS_MAP = {
  'pending_payment': 'pending_payment',
  'paid': 'processing',
  'delivered': 'completed',
  'delivery_failed': 'failed',
};

export default async function handler(req, res) {
  // CORS preflight
  if (handleCors(req, res)) return;

  // Only GET
  if (req.method !== 'GET') {
    return errorResponse(res, 'METHOD_NOT_ALLOWED', 'Only GET is allowed on this endpoint.', { status: 405 });
  }

  // Rate limiting (more generous for reads)
  const rl = rateLimit(req, { maxRequests: 60, windowMs: 60000 });
  if (!rl.allowed) {
    return errorResponse(res, 'RATE_LIMITED', 'Too many requests. Try again later.', {
      status: 429,
      rateLimitInfo: rl,
    });
  }

  // Optional auth — if a key is provided, validate it; if not, allow through
  const authHeader = req.headers['authorization'] || '';
  const xApiKey = req.headers['x-api-key'] || '';
  if (authHeader || xApiKey) {
    const auth = authenticateApiKey(req);
    if (!auth.valid) {
      return errorResponse(res, 'UNAUTHORIZED', auth.reason, { status: 401, rateLimitInfo: rl });
    }
  }

  try {
    // Extract document ID from the URL
    // Vercel passes dynamic route params via req.query
    const documentId = req.query.id;

    if (!documentId) {
      return errorResponse(res, 'MISSING_FIELD', 'Document ID is required.', { field: 'id', rateLimitInfo: rl });
    }

    // Validate UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(documentId)) {
      return errorResponse(res, 'INVALID_FIELD', 'Document ID must be a valid UUID.', { field: 'id', rateLimitInfo: rl });
    }

    // Fetch from Supabase
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('id, plan, email, status, created_at, paid_at, delivered_at, pdf_url')
      .eq('id', documentId)
      .single();

    if (fetchError || !submission) {
      return errorResponse(res, 'NOT_FOUND', 'Document not found.', { status: 404, rateLimitInfo: rl });
    }

    // Build response
    const apiStatus = STATUS_MAP[submission.status] || submission.status;

    const response = {
      document_id: submission.id,
      status: apiStatus,
      plan: submission.plan,
      email: submission.email,
      created_at: submission.created_at,
    };

    // Add timestamps based on status
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

    return jsonResponse(res, response, 200, rl);

  } catch (err) {
    console.error('[api/v1/documents/[id]] Unexpected error:', err);
    return errorResponse(res, 'INTERNAL_ERROR', 'An unexpected error occurred.', { status: 500, rateLimitInfo: rl });
  }
}
