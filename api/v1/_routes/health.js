import { jsonResponse, errorResponse, rateLimit, handleCors } from '../_helpers.js';

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

  return jsonResponse(res, {
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  }, 200, rl);
}
