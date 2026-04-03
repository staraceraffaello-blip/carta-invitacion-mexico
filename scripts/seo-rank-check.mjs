/**
 * SEO Rank Check via Google Search Console API.
 * Queries GSC for 10 target keywords, generates a markdown report,
 * and saves it alongside a JSON sidecar for easy comparison.
 *
 * Env vars: GSC_SERVICE_ACCOUNT (JSON string), GSC_SITE_URL (optional)
 * Output: seo-rankings/YYYY-MM-DD-rank-check.md + .json
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { createSign } from 'crypto';

// --- Config ---

const SITE_URL = process.env.GSC_SITE_URL || 'sc-domain:cartadeinvitacionmexico.com';

// Core 10 — always reported in the main table
const CORE_KEYWORDS = [
  'carta de invitación méxico',
  'carta de invitación para extranjeros méxico',
  'carta de invitación para entrar a méxico',
  'carta de invitación migración méxico',
  'cómo hacer carta de invitación méxico',
  'carta de invitación cubanos méxico',
  'carta de invitación venezolanos méxico',
  'requisitos entrar a méxico como turista',
  'generar carta de invitación méxico online',
  'formato carta de invitación méxico',
];

// Expanded — nationality + process/situation keywords (tracked in JSON sidecar)
const EXPANDED_KEYWORDS = [
  ...CORE_KEYWORDS,
  // Nationality expansion
  'carta de invitación colombianos méxico',
  'carta de invitación peruanos méxico',
  'carta de invitación argentinos méxico',
  'carta de invitación ecuatorianos méxico',
  'carta de invitación dominicanos méxico',
  'carta de invitación brasileños méxico',
  'carta de invitación bolivianos méxico',
  'carta de invitación hondureños méxico',
  'carta de invitación guatemaltecos méxico',
  'carta de invitación chilenos méxico',
  'carta de invitación nicaragüenses méxico',
  'carta de invitación salvadoreños méxico',
  'carta de invitación haitianos méxico',
  'carta de invitación paraguayos méxico',
  // Process & situation
  'carta de invitación para menor de edad méxico',
  'carta de invitación para pareja extranjera méxico',
  'carta de invitación para visa mexicana consulado',
  'carta de invitación vs reserva de hotel méxico',
  'carta de invitación para tratamiento médico méxico',
  'qué pasa si no tengo carta de invitación méxico',
  'carta de invitación para eventos y negocios méxico',
  'carta responsiva migración méxico',
  'preregistro inm colombia méxico',
  'documentos para entrar a méxico como turista',
];

// --- Auth (JWT → access token, no SDK needed) ---

function base64url(data) {
  const b = typeof data === 'string' ? Buffer.from(data) : data;
  return b.toString('base64url');
}

async function getAccessToken(credentials) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
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

// --- GSC Query ---

async function queryGSC(token, startDate, endDate) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: ['query', 'page'],
      rowLimit: 10000,
    }),
  });

  if (!res.ok) throw new Error(`GSC API error (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return data.rows || [];
}

// --- Keyword Matching ---

function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

function matchKeyword(rows, keyword) {
  const norm = normalize(keyword);
  const words = norm.split(/\s+/);

  // Score each row: exact match > contains > partial word match
  const scored = rows
    .map(row => {
      const query = normalize(row.keys[0]);
      let score = 0;
      if (query === norm) score = 100;
      else if (query.includes(norm)) score = 80;
      else if (norm.includes(query)) score = 60;
      else {
        const matchedWords = words.filter(w => query.includes(w));
        score = (matchedWords.length / words.length) * 40;
      }
      return { ...row, score };
    })
    .filter(r => r.score >= 50)
    .sort((a, b) => b.score - a.score || a.position - b.position);

  return scored[0] || null;
}

// --- Previous Report ---

function loadPreviousData() {
  const dir = 'seo-rankings';
  if (!existsSync(dir)) return null;

  const jsonFiles = readdirSync(dir)
    .filter(f => f.endsWith('-rank-check.json'))
    .sort()
    .reverse();

  if (jsonFiles.length === 0) return null;

  try {
    return JSON.parse(readFileSync(`${dir}/${jsonFiles[0]}`, 'utf-8'));
  } catch {
    return null;
  }
}

// --- Report Generation ---

function generateReport(date, startDate, endDate, results, previous) {
  const inTop10 = results.filter(r => r.position !== null && r.position <= 10);
  const best = inTop10.length > 0
    ? inTop10.reduce((a, b) => a.position < b.position ? a : b)
    : null;

  let changesSection = 'First check (no previous data)';
  if (previous) {
    const changes = results.map(r => {
      const prev = previous.results.find(p => p.keyword === r.keyword);
      if (!prev) return null;
      const prevPos = prev.position;
      const curPos = r.position;
      if (prevPos === null && curPos === null) return null;
      if (prevPos === null && curPos !== null) return `  - **NEW** "${r.keyword}" entered at #${curPos.toFixed(1)}`;
      if (prevPos !== null && curPos === null) return `  - **LOST** "${r.keyword}" dropped out (was #${prevPos.toFixed(1)})`;
      const diff = prevPos - curPos; // positive = improved
      if (Math.abs(diff) < 0.5) return null;
      const arrow = diff > 0 ? `improved ${diff.toFixed(1)} positions` : `dropped ${Math.abs(diff).toFixed(1)} positions`;
      return `  - "${r.keyword}": #${prevPos.toFixed(1)} → #${curPos.toFixed(1)} (${arrow})`;
    }).filter(Boolean);
    changesSection = changes.length > 0 ? changes.join('\n') : 'No significant changes';
  }

  // Build recommendations
  const recs = [];
  const highImpLowCtr = results
    .filter(r => r.impressions > 50 && r.ctr < 3 && r.position !== null)
    .sort((a, b) => b.impressions - a.impressions);
  if (highImpLowCtr.length > 0) {
    recs.push(`Optimize title/meta description for "${highImpLowCtr[0].keyword}" — ${highImpLowCtr[0].impressions} impressions but only ${highImpLowCtr[0].ctr.toFixed(1)}% CTR`);
  }
  const notRanking = results.filter(r => r.position === null);
  if (notRanking.length > 0) {
    recs.push(`Create or improve content targeting: ${notRanking.map(r => `"${r.keyword}"`).join(', ')}`);
  }
  const almostTop3 = results.filter(r => r.position !== null && r.position > 3 && r.position <= 10);
  if (almostTop3.length > 0) {
    recs.push(`Push into top 3: "${almostTop3[0].keyword}" (currently #${almostTop3[0].position.toFixed(1)}) — add internal links, improve content depth`);
  }
  if (recs.length === 0) recs.push('Continue current strategy — all target keywords are performing well');

  const tableRows = results.map(r => {
    const pos = r.position !== null ? `#${r.position.toFixed(1)}` : 'Not ranking';
    const url = r.url || '-';
    return `| ${r.num} | ${r.keyword} | ${pos} | ${url} | ${r.clicks} | ${r.impressions} | ${r.ctr.toFixed(1)}% |`;
  }).join('\n');

  return `# SEO Rank Check — cartadeinvitacionmexico.com
**Date:** ${date}
**Data range:** ${startDate} to ${endDate}
**Source:** Google Search Console API

> **Note:** GSC data has a 2-3 day delay. Positions are averages over the data range. For competitor analysis, use Ahrefs or SEMrush.

## Results

| # | Keyword | Position | Our URL | Clicks | Impressions | CTR |
|---|---------|----------|---------|--------|-------------|-----|
${tableRows}

## Summary
- **Keywords ranked:** ${inTop10.length} in top 10, ${results.filter(r => r.position !== null).length} / 10 total
- **Best position:** ${best ? `#${best.position.toFixed(1)} for "${best.keyword}"` : 'None in top 10'}
- **Total clicks (7d):** ${results.reduce((s, r) => s + r.clicks, 0)}
- **Total impressions (7d):** ${results.reduce((s, r) => s + r.impressions, 0)}
- **Changes since last check:**
${changesSection}

## Recommendations
${recs.map(r => `- ${r}`).join('\n')}
`;
}

// --- Main ---

async function main() {
  const credentials = JSON.parse(process.env.GSC_SERVICE_ACCOUNT);
  const date = new Date().toISOString().split('T')[0];

  // GSC data has ~2-day delay, query last 7 available days
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 2);
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 7);

  const fmt = d => d.toISOString().split('T')[0];

  console.log(`Fetching GSC data for ${SITE_URL} (${fmt(startDate)} to ${fmt(endDate)})...`);
  const token = await getAccessToken(credentials);
  const rows = await queryGSC(token, fmt(startDate), fmt(endDate));
  console.log(`Got ${rows.length} rows from GSC`);

  // Match core keywords (for the main report table)
  const previous = loadPreviousData();
  const results = CORE_KEYWORDS.map((keyword, i) => {
    const match = matchKeyword(rows, keyword);
    return {
      num: i + 1,
      keyword,
      position: match ? match.position : null,
      url: match ? new URL(match.keys[1]).pathname : null,
      clicks: match ? match.clicks : 0,
      impressions: match ? match.impressions : 0,
      ctr: match ? match.ctr * 100 : 0,
    };
  });

  // Match expanded keywords (for JSON sidecar — used by article generator)
  const expandedResults = EXPANDED_KEYWORDS.map((keyword, i) => {
    const match = matchKeyword(rows, keyword);
    return {
      num: i + 1,
      keyword,
      position: match ? match.position : null,
      url: match ? new URL(match.keys[1]).pathname : null,
      clicks: match ? match.clicks : 0,
      impressions: match ? match.impressions : 0,
      ctr: match ? match.ctr * 100 : 0,
    };
  });

  // Build keyword discovery: all GSC queries sorted by impressions (desc)
  // Aggregates across pages for the same query
  const queryMap = new Map();
  for (const row of rows) {
    const query = row.keys[0];
    const existing = queryMap.get(query);
    if (existing) {
      existing.clicks += row.clicks;
      existing.impressions += row.impressions;
      if (row.position < existing.bestPosition) {
        existing.bestPosition = row.position;
        existing.bestUrl = new URL(row.keys[1]).pathname;
      }
    } else {
      queryMap.set(query, {
        query,
        clicks: row.clicks,
        impressions: row.impressions,
        bestPosition: row.position,
        bestUrl: new URL(row.keys[1]).pathname,
      });
    }
  }
  const discovery = Array.from(queryMap.values())
    .sort((a, b) => b.impressions - a.impressions || a.bestPosition - b.bestPosition);

  // Generate report
  const markdown = generateReport(date, fmt(startDate), fmt(endDate), results, previous);

  // Save files
  mkdirSync('seo-rankings', { recursive: true });
  const mdPath = `seo-rankings/${date}-rank-check.md`;
  const jsonPath = `seo-rankings/${date}-rank-check.json`;
  const discoveryPath = `seo-rankings/${date}-keyword-discovery.json`;
  writeFileSync(mdPath, markdown);
  writeFileSync(jsonPath, JSON.stringify({
    date,
    startDate: fmt(startDate),
    endDate: fmt(endDate),
    results,
    expandedResults,
  }, null, 2));
  writeFileSync(discoveryPath, JSON.stringify({
    date,
    startDate: fmt(startDate),
    endDate: fmt(endDate),
    totalQueries: discovery.length,
    queries: discovery,
  }, null, 2));

  console.log(`Report saved: ${mdPath}`);
  console.log(`Data saved: ${jsonPath}`);
  console.log(`Discovery saved: ${discoveryPath} (${discovery.length} unique queries)`);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
