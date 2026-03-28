/**
 * Catch-all router for /api/v1/* endpoints.
 * Consolidates all v1 routes into a single serverless function
 * to stay within Vercel Hobby plan's 12-function limit.
 */

import healthHandler from './_routes/health.js';
import documentTypesHandler from './_routes/document-types.js';
import documentTypeByIdHandler from './_routes/document-type-by-id.js';
import documentsCreateHandler from './_routes/documents-create.js';
import documentsStatusHandler from './_routes/documents-status.js';
import documentsStreamHandler from './_routes/documents-stream.js';
import mcpHandler from './_routes/mcp.js';
import openapiHandler from './_routes/openapi.js';
import webhooksHandler from './_routes/webhooks.js';
import webhooksDeleteHandler from './_routes/webhooks-delete.js';
import { errorResponse, handleCors } from './_helpers.js';

export const config = {
  maxDuration: 60, // Needed for SSE streaming
};

export default function handler(req, res) {
  const segments = req.query.path || [];
  const route = segments.join('/');

  // Inject parsed path params into req.query for handlers that expect them
  // (Vercel normally does this via [param] file naming)

  // --- Route matching ---

  // GET /api/v1/health
  if (route === 'health') {
    return healthHandler(req, res);
  }

  // GET /api/v1/document-types
  if (route === 'document-types') {
    return documentTypesHandler(req, res);
  }

  // GET /api/v1/document-types/:type
  if (segments[0] === 'document-types' && segments.length === 2) {
    req.query.type = segments[1];
    return documentTypeByIdHandler(req, res);
  }

  // POST /api/v1/documents
  if (route === 'documents') {
    return documentsCreateHandler(req, res);
  }

  // GET /api/v1/documents/:id/stream
  if (segments[0] === 'documents' && segments.length === 3 && segments[2] === 'stream') {
    req.query.id = segments[1];
    return documentsStreamHandler(req, res);
  }

  // GET /api/v1/documents/:id
  if (segments[0] === 'documents' && segments.length === 2) {
    req.query.id = segments[1];
    return documentsStatusHandler(req, res);
  }

  // POST /api/v1/mcp
  if (route === 'mcp') {
    return mcpHandler(req, res);
  }

  // GET /api/v1/openapi.json
  if (route === 'openapi.json') {
    return openapiHandler(req, res);
  }

  // POST/GET /api/v1/webhooks
  if (route === 'webhooks') {
    return webhooksHandler(req, res);
  }

  // DELETE /api/v1/webhooks/:id
  if (segments[0] === 'webhooks' && segments.length === 2) {
    req.query.id = segments[1];
    return webhooksDeleteHandler(req, res);
  }

  // CORS preflight for any unmatched route
  if (req.method === 'OPTIONS') {
    if (handleCors(req, res)) return;
  }

  // 404 — no matching route
  return errorResponse(res, 'NOT_FOUND', `No endpoint matches /api/v1/${route}`, { status: 404 });
}
