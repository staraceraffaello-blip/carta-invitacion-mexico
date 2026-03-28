import { jsonResponse, errorResponse, rateLimit, handleCors } from '../_helpers.js';
import DOCUMENT_TYPES from '../_document-types-data.js';

export default function handler(req, res) {
  // Handle CORS preflight
  if (handleCors(req, res)) return;

  // Only allow GET
  if (req.method !== 'GET') {
    return errorResponse(res, 'METHOD_NOT_ALLOWED', 'Only GET requests are accepted.', { status: 405 });
  }

  // Rate limiting
  const rl = rateLimit(req);
  if (!rl.allowed) {
    res.setHeader('Retry-After', rl.retryAfter);
    return errorResponse(res, 'RATE_LIMITED', `Too many requests. Try again in ${rl.retryAfter} seconds.`, {
      status: 429,
      rateLimitInfo: rl,
    });
  }

  try {
    const { type } = req.query;

    const docType = DOCUMENT_TYPES.find(dt => dt.id === type);

    if (!docType) {
      return errorResponse(res, 'NOT_FOUND', `Document type "${type}" not found. Valid types: ${DOCUMENT_TYPES.map(dt => dt.id).join(', ')}`, {
        field: 'type',
        status: 404,
        rateLimitInfo: rl,
      });
    }

    return jsonResponse(res, docType, 200, rl);
  } catch (err) {
    console.error('[api/v1/document-types/[type]] Error:', err);
    return errorResponse(res, 'INTERNAL_ERROR', 'An unexpected error occurred.', { status: 500, rateLimitInfo: rl });
  }
}
