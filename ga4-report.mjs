#!/usr/bin/env node
/**
 * ga4-report.mjs — Standalone GA4 analytics report generator
 *
 * Calls the GA4 Data API directly using service account credentials.
 * No MCP dependency. Outputs JSON or formatted text.
 * Includes week-over-week comparison with the previous period.
 *
 * Usage:
 *   node ga4-report.mjs                  # last 7 days, JSON output
 *   node ga4-report.mjs --days 14        # last 14 days
 *   node ga4-report.mjs --format text    # human-readable text
 *   node ga4-report.mjs --format html    # HTML email body
 */

import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { readFileSync } from "fs";

// --- Config ---
const PROPERTY_ID = "526320486";

// --- CLI args ---
const args = process.argv.slice(2);
function getArg(name, fallback) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
}
const days = parseInt(getArg("days", "7"), 10);
const format = getArg("format", "json"); // json | text | html

// --- Auth ---
let credentials;
if (process.env.GA4_SERVICE_ACCOUNT) {
  credentials = JSON.parse(process.env.GA4_SERVICE_ACCOUNT);
} else {
  const credPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    "C:/Users/laura.rodriguez/.claude/ga4-credentials.json";
  credentials = JSON.parse(readFileSync(credPath, "utf8"));
}
const client = new BetaAnalyticsDataClient({
  credentials: {
    client_email: credentials.client_email,
    private_key: credentials.private_key,
  },
  projectId: credentials.project_id,
});

const property = `properties/${PROPERTY_ID}`;

// Both date ranges for comparison
const dateRanges = [
  { startDate: `${days}daysAgo`, endDate: "yesterday" },
  { startDate: `${days * 2}daysAgo`, endDate: `${days + 1}daysAgo` },
];

// --- Comparison helpers ---
function delta(current, previous) {
  const c = parseFloat(current) || 0;
  const p = parseFloat(previous) || 0;
  if (p === 0) return c > 0 ? { abs: c, pct: null, dir: "up" } : { abs: 0, pct: 0, dir: "flat" };
  const pct = ((c - p) / p) * 100;
  const dir = pct > 1 ? "up" : pct < -1 ? "down" : "flat";
  return { abs: c - p, pct, dir };
}

function formatDelta(d, opts = {}) {
  if (d.dir === "flat") return "—";
  const arrow = d.dir === "up" ? "+" : "";
  if (d.pct === null) return `${arrow}${Math.round(d.abs)} (new)`;
  return `${arrow}${Math.round(d.abs)} (${arrow}${d.pct.toFixed(0)}%)`;
}

function htmlDelta(d) {
  if (d.dir === "flat") return `<span style="color:#8B7D6B;font-size:11px;">—</span>`;
  const color = d.dir === "up" ? "#2D6A4F" : "#DC2626";
  const arrow = d.dir === "up" ? "&#9650;" : "&#9660;";
  const pctStr = d.pct !== null ? ` ${d.pct > 0 ? "+" : ""}${d.pct.toFixed(0)}%` : " new";
  return `<span style="color:${color};font-size:11px;">${arrow}${pctStr}</span>`;
}

// For bounce rate, down is good
function htmlDeltaBounce(d) {
  if (d.dir === "flat") return `<span style="color:#8B7D6B;font-size:11px;">—</span>`;
  const color = d.dir === "down" ? "#2D6A4F" : "#DC2626"; // inverted
  const arrow = d.dir === "up" ? "&#9650;" : "&#9660;";
  const pctStr = d.pct !== null ? ` ${d.pct > 0 ? "+" : ""}${d.pct.toFixed(0)}%` : "";
  return `<span style="color:${color};font-size:11px;">${arrow}${pctStr}</span>`;
}

// --- Report: ALL Sessions (with previous period) ---
async function fetchAllSessions() {
  const [response] = await client.runReport({
    property,
    dateRanges,
    dimensions: [{ name: "pagePath" }],
    metrics: [
      { name: "sessions" },
      { name: "activeUsers" },
      { name: "screenPageViews" },
      { name: "engagedSessions" },
      { name: "userEngagementDuration" },
      { name: "bounceRate" },
    ],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 15,
  });
  return parseDualRows(response, ["sessions", "activeUsers", "screenPageViews", "engagedSessions", "userEngagementDuration", "bounceRate"]);
}

// --- Report: Engaged Sessions Only (with previous period) ---
async function fetchEngagedSessions() {
  const [response] = await client.runReport({
    property,
    dateRanges,
    dimensions: [{ name: "pagePath" }],
    metrics: [
      { name: "sessions" },
      { name: "activeUsers" },
      { name: "screenPageViews" },
      { name: "userEngagementDuration" },
    ],
    metricFilter: {
      filter: {
        fieldName: "engagedSessions",
        numericFilter: {
          operation: "GREATER_THAN_OR_EQUAL",
          value: { int64Value: 1 },
        },
      },
    },
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 15,
  });
  return parseDualRows(response, ["sessions", "activeUsers", "screenPageViews", "userEngagementDuration"]);
}

// --- Totals row (with previous period) ---
async function fetchTotals() {
  const [all] = await client.runReport({
    property,
    dateRanges,
    metrics: [
      { name: "sessions" },
      { name: "activeUsers" },
      { name: "screenPageViews" },
      { name: "engagedSessions" },
      { name: "bounceRate" },
    ],
  });
  const [engaged] = await client.runReport({
    property,
    dateRanges,
    metrics: [
      { name: "sessions" },
      { name: "activeUsers" },
      { name: "screenPageViews" },
      { name: "engagedSessions" },
    ],
    metricFilter: {
      filter: {
        fieldName: "engagedSessions",
        numericFilter: {
          operation: "GREATER_THAN_OR_EQUAL",
          value: { int64Value: 1 },
        },
      },
    },
  });

  // With 2 date ranges and no dimensions, GA4 returns 2 rows (one per range)
  const allCur = all.rows?.[0]?.metricValues?.map((v) => v.value) || [];
  const allPrev = all.rows?.[1]?.metricValues?.map((v) => v.value) || [];
  const engCur = engaged.rows?.[0]?.metricValues?.map((v) => v.value) || [];
  const engPrev = engaged.rows?.[1]?.metricValues?.map((v) => v.value) || [];

  return {
    all: {
      sessions: allCur[0] || "0",
      activeUsers: allCur[1] || "0",
      pageViews: allCur[2] || "0",
      engagedSessions: allCur[3] || "0",
      bounceRate: allCur[4] || "0",
    },
    allPrev: {
      sessions: allPrev[0] || "0",
      activeUsers: allPrev[1] || "0",
      pageViews: allPrev[2] || "0",
      engagedSessions: allPrev[3] || "0",
      bounceRate: allPrev[4] || "0",
    },
    engaged: {
      sessions: engCur[0] || "0",
      activeUsers: engCur[1] || "0",
      pageViews: engCur[2] || "0",
      engagedSessions: engCur[3] || "0",
    },
    engagedPrev: {
      sessions: engPrev[0] || "0",
      activeUsers: engPrev[1] || "0",
      pageViews: engPrev[2] || "0",
      engagedSessions: engPrev[3] || "0",
    },
  };
}

/**
 * Parse GA4 response with dual date ranges.
 * With dimensions + 2 date ranges, GA4 returns rows grouped by dimension,
 * with a "dateRange" dimension: "date_range_0" or "date_range_1".
 * We merge them into objects with current + prev values.
 */
function parseDualRows(response, metricNames) {
  if (!response.rows || response.rows.length === 0) return [];

  const byPage = new Map();

  for (const row of response.rows) {
    const pagePath = row.dimensionValues[0].value;
    const metrics = row.metricValues.map((v) => v.value);

    if (!byPage.has(pagePath)) {
      byPage.set(pagePath, { pagePath, cur: {}, prev: {} });
    }
    const entry = byPage.get(pagePath);

    // With 2 date ranges and dimensions, GA4 duplicates rows with an implicit
    // date range index. The first occurrence is range 0 (current), determined
    // by the response ordering. We detect via the dateRange dimension if present,
    // otherwise use insertion order.
    const dateRangeDim = row.dimensionValues.find(
      (d) => d.value === "date_range_0" || d.value === "date_range_1"
    );

    let target;
    if (dateRangeDim) {
      target = dateRangeDim.value === "date_range_0" ? "cur" : "prev";
    } else {
      // Fallback: first seen = current
      target = Object.keys(entry.cur).length === 0 ? "cur" : "prev";
    }

    metricNames.forEach((name, i) => {
      entry[target][name] = metrics[i];
    });
  }

  // Sort by current sessions descending, return top entries
  return Array.from(byPage.values())
    .sort((a, b) => (parseInt(b.cur.sessions) || 0) - (parseInt(a.cur.sessions) || 0))
    .slice(0, 15);
}

function formatDuration(seconds) {
  const s = Math.round(parseFloat(seconds) || 0);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

function formatBounce(rate) {
  return `${(parseFloat(rate || 0) * 100).toFixed(1)}%`;
}

function truncatePath(p, max = 40) {
  return p.length > max ? p.slice(0, max - 1) + "…" : p;
}

// --- Text Formatter ---
function toText(allRows, engRows, totals, dateRange) {
  const dSess = delta(totals.all.sessions, totals.allPrev.sessions);
  const dHuman = delta(totals.engaged.sessions, totals.engagedPrev.sessions);
  const dViews = delta(totals.all.pageViews, totals.allPrev.pageViews);
  const dBounce = delta(totals.all.bounceRate, totals.allPrev.bounceRate);

  let out = `GA4 Analytics Report — cartadeinvitacionmexico.com\n`;
  out += `Date range: ${dateRange} (vs previous ${days} days)\n`;
  out += `Generated: ${new Date().toISOString()}\n\n`;

  out += `═══ TOTALS (vs previous period) ═══\n`;
  out += `ALL:     ${totals.all.sessions} sessions (${formatDelta(dSess)}) | ${totals.all.activeUsers} users | ${totals.all.pageViews} pageviews (${formatDelta(dViews)}) | Bounce: ${formatBounce(totals.all.bounceRate)}\n`;
  out += `HUMANS:  ${totals.engaged.sessions} sessions (${formatDelta(dHuman)}) | ${totals.engaged.activeUsers} users | ${totals.engaged.pageViews} pageviews\n\n`;

  out += `═══ ALL SESSIONS (Top 15 pages) ═══\n`;
  out += `${"Page".padEnd(42)} ${"Sess".padStart(6)} ${"Δ".padStart(8)} ${"Users".padStart(6)} ${"Views".padStart(6)} ${"Eng".padStart(5)} ${"Time".padStart(7)} ${"Bounce".padStart(7)}\n`;
  out += "─".repeat(95) + "\n";
  for (const r of allRows) {
    const d = delta(r.cur.sessions, r.prev.sessions || "0");
    out += `${truncatePath(r.pagePath).padEnd(42)} ${(r.cur.sessions || "0").padStart(6)} ${formatDelta(d).padStart(8)} ${(r.cur.activeUsers || "0").padStart(6)} ${(r.cur.screenPageViews || "0").padStart(6)} ${(r.cur.engagedSessions || "0").padStart(5)} ${formatDuration(r.cur.userEngagementDuration).padStart(7)} ${formatBounce(r.cur.bounceRate).padStart(7)}\n`;
  }

  out += `\n═══ ENGAGED SESSIONS ONLY — Humans (Top 15 pages) ═══\n`;
  out += `${"Page".padEnd(42)} ${"Sess".padStart(6)} ${"Δ".padStart(8)} ${"Users".padStart(6)} ${"Views".padStart(6)} ${"Time".padStart(7)}\n`;
  out += "─".repeat(80) + "\n";
  for (const r of engRows) {
    const d = delta(r.cur.sessions, r.prev.sessions || "0");
    out += `${truncatePath(r.pagePath).padEnd(42)} ${(r.cur.sessions || "0").padStart(6)} ${formatDelta(d).padStart(8)} ${(r.cur.activeUsers || "0").padStart(6)} ${(r.cur.screenPageViews || "0").padStart(6)} ${formatDuration(r.cur.userEngagementDuration).padStart(7)}\n`;
  }

  return out;
}

// --- HTML Formatter ---
function toHtml(allRows, engRows, totals, dateRange) {
  const cellStyle = `padding:8px 12px;border-bottom:1px solid #E8E0D0;font-size:13px;`;
  const headerCell = `${cellStyle}background:#1B2A4A;color:#D4A853;font-weight:600;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;`;
  const numCell = `${cellStyle}text-align:right;font-variant-numeric:tabular-nums;`;

  // Totals deltas
  const dSess = delta(totals.all.sessions, totals.allPrev.sessions);
  const dHuman = delta(totals.engaged.sessions, totals.engagedPrev.sessions);
  const dViews = delta(totals.all.pageViews, totals.allPrev.pageViews);
  const dBounce = delta(totals.all.bounceRate, totals.allPrev.bounceRate);

  function totalsCard(value, label, d, invertColor = false) {
    const color = label === "Human Sessions" ? "#2D6A4F" : label === "Bounce Rate" ? "#B45309" : "#1B2A4A";
    const deltaHtml = invertColor ? htmlDeltaBounce(d) : htmlDelta(d);
    return `<div style="flex:1;min-width:140px;background:#F5F0E8;border-radius:8px;padding:16px;text-align:center;">
        <div style="font-size:28px;font-weight:700;color:${color};">${value}</div>
        <div style="font-size:12px;color:#8B7D6B;margin-top:4px;">${label}</div>
        <div style="margin-top:6px;">${deltaHtml}</div>
      </div>`;
  }

  function tableRows(rows, cols) {
    return rows
      .map(
        (r, i) =>
          `<tr style="background:${i % 2 === 0 ? "#FFFDF7" : "#FAF6EE"}">` +
          cols
            .map((c) => {
              const val = r.cur[c.key];
              if (c.key === "pagePath")
                return `<td style="${cellStyle}max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#1B2A4A;">${r.pagePath}</td>`;
              if (c.key === "sessions") {
                const d = delta(r.cur.sessions, r.prev.sessions || "0");
                return `<td style="${numCell}color:#4A5568;">${parseInt(val || 0).toLocaleString()} ${htmlDelta(d)}</td>`;
              }
              if (c.key === "bounceRate")
                return `<td style="${numCell}color:#4A5568;">${formatBounce(val)}</td>`;
              if (c.key === "userEngagementDuration")
                return `<td style="${numCell}color:#4A5568;">${formatDuration(val)}</td>`;
              return `<td style="${numCell}color:#4A5568;">${parseInt(val || 0).toLocaleString()}</td>`;
            })
            .join("") +
          `</tr>`
      )
      .join("");
  }

  const allCols = [
    { key: "pagePath", label: "Page" },
    { key: "sessions", label: "Sessions" },
    { key: "activeUsers", label: "Users" },
    { key: "screenPageViews", label: "Views" },
    { key: "engagedSessions", label: "Engaged" },
    { key: "userEngagementDuration", label: "Eng. Time" },
    { key: "bounceRate", label: "Bounce" },
  ];

  const engCols = [
    { key: "pagePath", label: "Page" },
    { key: "sessions", label: "Sessions" },
    { key: "activeUsers", label: "Users" },
    { key: "screenPageViews", label: "Views" },
    { key: "userEngagementDuration", label: "Eng. Time" },
  ];

  return `<div style="font-family:'Georgia',serif;max-width:720px;margin:0 auto;background:#FFFDF7;border:1px solid #E8E0D0;border-radius:8px;overflow:hidden;">
  <div style="background:#1B2A4A;padding:24px 32px;">
    <h1 style="color:#D4A853;margin:0;font-size:20px;font-weight:600;">GA4 Weekly Report</h1>
    <p style="color:#B8C4D8;margin:4px 0 0;font-size:14px;">cartadeinvitacionmexico.com — ${dateRange}</p>
    <p style="color:#7B8DA8;margin:2px 0 0;font-size:12px;">vs previous ${days} days</p>
  </div>
  <div style="padding:24px 32px;">
    <div style="display:flex;gap:16px;margin-bottom:24px;flex-wrap:wrap;">
      ${totalsCard(parseInt(totals.all.sessions).toLocaleString(), "Total Sessions", dSess)}
      ${totalsCard(parseInt(totals.engaged.sessions).toLocaleString(), "Human Sessions", dHuman)}
      ${totalsCard(parseInt(totals.all.pageViews).toLocaleString(), "Page Views", dViews)}
      ${totalsCard(formatBounce(totals.all.bounceRate), "Bounce Rate", dBounce, true)}
    </div>

    <h2 style="color:#1B2A4A;font-size:16px;margin:24px 0 12px;border-bottom:2px solid #D4A853;padding-bottom:8px;">All Sessions (Top 15)</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <thead><tr>${allCols.map((c) => `<th style="${headerCell}">${c.label}</th>`).join("")}</tr></thead>
      <tbody>${tableRows(allRows, allCols)}</tbody>
    </table>

    <h2 style="color:#1B2A4A;font-size:16px;margin:24px 0 12px;border-bottom:2px solid #2D6A4F;padding-bottom:8px;">Engaged Sessions — Humans Only (Top 15)</h2>
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr>${engCols.map((c) => `<th style="${headerCell}">${c.label}</th>`).join("")}</tr></thead>
      <tbody>${tableRows(engRows, engCols)}</tbody>
    </table>
  </div>
  <div style="background:#F5F0E8;padding:16px 32px;text-align:center;">
    <p style="margin:0;color:#8B7D6B;font-size:12px;">Automated weekly report · Carta de Invitaci&oacute;n M&eacute;xico</p>
  </div>
</div>`;
}

// --- Main ---
async function main() {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 1);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const dateRange = `${startDate.toLocaleDateString("es-MX", { day: "numeric", month: "short" })} – ${endDate.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}`;

  const [allRows, engRows, totals] = await Promise.all([
    fetchAllSessions(),
    fetchEngagedSessions(),
    fetchTotals(),
  ]);

  if (format === "text") {
    console.log(toText(allRows, engRows, totals, dateRange));
  } else if (format === "html") {
    console.log(toHtml(allRows, engRows, totals, dateRange));
  } else {
    console.log(
      JSON.stringify({ dateRange, totals, allSessions: allRows, engagedSessions: engRows }, null, 2)
    );
  }
}

main().catch((err) => {
  console.error("GA4 Report Error:", err.message);
  process.exit(1);
});
