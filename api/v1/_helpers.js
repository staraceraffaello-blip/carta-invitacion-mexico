// Shared utilities for API v1 endpoints
import { timingSafeEqual } from 'node:crypto';

/**
 * Build a JSON response with proper Content-Type and rate limit headers.
 */
export function jsonResponse(res, data, status = 200, rateLimitInfo = null) {
  res.setHeader('Content-Type', 'application/json');

  // CORS headers
  const cors = corsHeaders();
  for (const [key, value] of Object.entries(cors)) {
    res.setHeader(key, value);
  }

  // Rate limit headers
  if (rateLimitInfo) {
    res.setHeader('X-RateLimit-Limit', rateLimitInfo.limit);
    res.setHeader('X-RateLimit-Remaining', rateLimitInfo.remaining);
    res.setHeader('X-RateLimit-Reset', rateLimitInfo.reset);
  }

  return res.status(status).json(data);
}

/**
 * Build a structured error response.
 * Format: { "error": { "code": "ERROR_CODE", "message": "Human-readable", "field": "optional" } }
 */
export function errorResponse(res, code, message, { field = null, status = 400, rateLimitInfo = null } = {}) {
  const body = {
    error: {
      code,
      message,
      ...(field && { field }),
    },
  };
  return jsonResponse(res, body, status, rateLimitInfo);
}

/**
 * Simple in-memory rate limiter (resets on cold start).
 * Tracks requests by IP within a sliding window.
 *
 * Returns { allowed: boolean, limit, remaining, reset, retryAfter? }
 */
const buckets = new Map();

export function rateLimit(req, { maxRequests = 60, windowMs = 60000 } = {}) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket?.remoteAddress
    || 'unknown';

  const now = Date.now();
  const windowStart = now - windowMs;

  let bucket = buckets.get(ip);
  if (!bucket) {
    bucket = { timestamps: [] };
    buckets.set(ip, bucket);
  }

  // Purge timestamps outside the window
  bucket.timestamps = bucket.timestamps.filter(t => t > windowStart);

  const reset = Math.ceil((now + windowMs) / 1000);
  const remaining = Math.max(0, maxRequests - bucket.timestamps.length);

  if (bucket.timestamps.length >= maxRequests) {
    const oldestInWindow = bucket.timestamps[0];
    const retryAfter = Math.ceil((oldestInWindow + windowMs - now) / 1000);
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      reset,
      retryAfter,
    };
  }

  bucket.timestamps.push(now);

  return {
    allowed: true,
    limit: maxRequests,
    remaining: remaining - 1, // account for the request we just added
    reset,
  };
}

/**
 * CORS headers for API routes.
 */
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Api-Key, Idempotency-Key',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Handle OPTIONS preflight requests.
 * Returns true if the request was an OPTIONS request and was handled.
 */
export function handleCors(req, res) {
  if (req.method === 'OPTIONS') {
    const cors = corsHeaders();
    for (const [key, value] of Object.entries(cors)) {
      res.setHeader(key, value);
    }
    res.status(204).end();
    return true;
  }
  return false;
}

/**
 * Validate API key from Authorization: Bearer <key> or X-Api-Key header.
 * @param {object} req
 * @returns {{ valid: boolean, reason?: string }}
 */
export function authenticateApiKey(req) {
  const authHeader = req.headers['authorization'] || '';
  const xApiKey = req.headers['x-api-key'] || '';

  let apiKey = '';

  if (authHeader.startsWith('Bearer ')) {
    apiKey = authHeader.slice(7).trim();
  } else if (xApiKey) {
    apiKey = xApiKey.trim();
  }

  if (!apiKey) {
    return {
      valid: false,
      reason: 'Missing API key. Provide via Authorization: Bearer <key> or X-Api-Key header.',
    };
  }

  const validKey = process.env.CARTA_API_KEY || process.env.API_KEY;
  if (!validKey) {
    console.error('[auth] Neither CARTA_API_KEY nor API_KEY env var is set');
    return {
      valid: false,
      reason: 'API key authentication is not configured on the server.',
    };
  }

  // Constant-time comparison to prevent timing attacks
  if (apiKey.length !== validKey.length) {
    return { valid: false, reason: 'Invalid API key.' };
  }
  const a = Buffer.from(apiKey);
  const b = Buffer.from(validKey);
  if (!timingSafeEqual(a, b)) {
    return { valid: false, reason: 'Invalid API key.' };
  }

  return { valid: true };
}
