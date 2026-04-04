/**
 * Submit a URL to Google's Indexing API for faster crawling.
 *
 * Usage:
 *   node scripts/submit-to-google-index.mjs https://cartadeinvitacionmexico.com/articulos/slug
 *
 * Env vars: GSC_SERVICE_ACCOUNT (JSON string) or reads from .env.local
 *
 * Prerequisites:
 *   1. Enable "Web Search Indexing API" in Google Cloud Console
 *   2. Add the service account email as Owner in Search Console
 */

import { createSign } from 'crypto';
import { readFileSync } from 'fs';

const url = process.argv[2];
if (!url) {
  console.error('Usage: node scripts/submit-to-google-index.mjs <URL>');
  process.exit(1);
}

// Load credentials
let credentials;
if (process.env.GSC_SERVICE_ACCOUNT) {
  credentials = JSON.parse(process.env.GSC_SERVICE_ACCOUNT);
} else {
  // Try .env.local
  try {
    const envPath = new URL('../.env.local', import.meta.url);
    const envContent = readFileSync(envPath, 'utf-8');
    const match = envContent.match(/^GSC_SERVICE_ACCOUNT=(.+)$/m);
    if (match) {
      credentials = JSON.parse(match[1]);
    }
  } catch {}

  if (!credentials) {
    // Try GA4 service account as fallback (same GCP project)
    if (process.env.GA4_SERVICE_ACCOUNT) {
      credentials = JSON.parse(process.env.GA4_SERVICE_ACCOUNT);
    } else {
      console.error('No service account credentials found. Set GSC_SERVICE_ACCOUNT env var.');
      process.exit(1);
    }
  }
}

// JWT auth
function base64url(data) {
  const b = typeof data === 'string' ? Buffer.from(data) : data;
  return b.toString('base64url');
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));

  const signature = createSign('RSA-SHA256')
    .update(`${header}.${payload}`)
    .sign(credentials.private_key, 'base64url');

  const jwt = `${header}.${payload}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

// Submit URL
async function submitUrl(token, targetUrl) {
  const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: targetUrl,
      type: 'URL_UPDATED',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    if (err.includes('API has not been used') || err.includes('is not enabled')) {
      console.error('\nThe Indexing API is not enabled. To fix:');
      console.error('1. Go to: https://console.cloud.google.com/apis/library/indexing.googleapis.com');
      console.error('2. Click "Enable"');
      console.error(`3. Ensure ${credentials.client_email} is an Owner in Search Console`);
    }
    throw new Error(`Indexing API error (${res.status}): ${err}`);
  }

  return await res.json();
}

try {
  console.log(`Submitting: ${url}`);
  const token = await getAccessToken();
  const result = await submitUrl(token, url);
  console.log(`Submitted successfully!`);
  console.log(`  URL: ${result.urlNotificationMetadata?.url || url}`);
  console.log(`  Latest update: ${result.urlNotificationMetadata?.latestUpdate?.notifyTime || 'now'}`);
} catch (err) {
  console.error(`Failed: ${err.message}`);
  process.exit(1);
}
