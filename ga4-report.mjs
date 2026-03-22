#!/usr/bin/env node
/**
 * ga4-report.mjs — Standalone GA4 analytics report generator
 *
 * Calls the GA4 Data API directly using service account credentials.
 * No MCP dependency. Outputs JSON or formatted text.
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
const CREDENTIALS_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  "C:/Users/laura.rodriguez/.claude/ga4-credentials.json";

// --- CLI args ---
const args = process.argv.slice(2);
function getArg(name, fallback) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
}
const days = parseInt(getArg("days", "7"), 10);
const format = getArg("format", "json"); // json | text | html

// --- Auth ---
const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, "utf8"));
const client = new BetaAnalyticsDataClient({
  credentials: {
    client_email: credentials.client_email,
    private_key: credentials.private_key,
  },
  projectId: credentials.project_id,
});

const property = `properties/${PROPERTY_ID}`;

// --- Report: ALL Sessions ---
async function fetchAllSessions() {
  const [response] = await client.runReport({
    property,
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "yesterday" }],
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
  return parseRows(response, [
    "pagePath",
    "sessions",
    "activeUsers",
    "screenPageViews",
    "engagedSessions",
    "userEngagementDuration",
    "bounceRate",
  ]);
}

// --- Report: Engaged Sessions Only (Humans) ---
async function fetchEngagedSessions() {
  const [response] = await client.runReport({
    property,
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "yesterday" }],
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
  return parseRows(response, [
    "pagePath",
    "sessions",
    "activeUsers",
    "screenPageViews",
    "userEngagementDuration",
  ]);
}

// --- Totals row ---
async function fetchTotals() {
  const [all] = await client.runReport({
    property,
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "yesterday" }],
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
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "yesterday" }],
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

  const allRow = all.rows?.[0]?.metricValues?.map((v) => v.value) || [];
  const engRow =
    engaged.rows?.[0]?.metricValues?.map((v) => v.value) || [];

  return {
    all: {
      sessions: allRow[0] || "0",
      activeUsers: allRow[1] || "0",
      pageViews: allRow[2] || "0",
      engagedSessions: allRow[3] || "0",
      bounceRate: allRow[4] || "0",
    },
    engaged: {
      sessions: engRow[0] || "0",
      activeUsers: engRow[1] || "0",
      pageViews: engRow[2] || "0",
      engagedSessions: engRow[3] || "0",
    },
  };
}

function parseRows(response, columns) {
  if (!response.rows || response.rows.length === 0) return [];
  return response.rows.map((row) => {
    const obj = {};
    row.dimensionValues?.forEach((d, i) => {
      obj[columns[i]] = d.value;
    });
    const metricOffset = row.dimensionValues?.length || 0;
    row.metricValues?.forEach((m, i) => {
      obj[columns[metricOffset + i]] = m.value;
    });
    return obj;
  });
}

function formatDuration(seconds) {
  const s = Math.round(parseFloat(seconds));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

function formatBounce(rate) {
  return `${(parseFloat(rate) * 100).toFixed(1)}%`;
}

function truncatePath(p, max = 45) {
  return p.length > max ? p.slice(0, max - 1) + "…" : p;
}

// --- Formatters ---
function toText(allRows, engRows, totals, dateRange) {
  let out = `GA4 Analytics Report — cartadeinvitacionmexico.com\n`;
  out += `Date range: ${dateRange}\n`;
  out += `Generated: ${new Date().toISOString()}\n\n`;

  out += `═══ TOTALS ═══\n`;
  out += `ALL:     ${totals.all.sessions} sessions | ${totals.all.activeUsers} users | ${totals.all.pageViews} pageviews | Bounce: ${formatBounce(totals.all.bounceRate)}\n`;
  out += `HUMANS:  ${totals.engaged.sessions} sessions | ${totals.engaged.activeUsers} users | ${totals.engaged.pageViews} pageviews\n\n`;

  out += `═══ ALL SESSIONS (Top 15 pages) ═══\n`;
  out += `${"Page".padEnd(47)} ${"Sess".padStart(6)} ${"Users".padStart(6)} ${"Views".padStart(6)} ${"Eng".padStart(6)} ${"Time".padStart(8)} ${"Bounce".padStart(8)}\n`;
  out += "─".repeat(90) + "\n";
  for (const r of allRows) {
    out += `${truncatePath(r.pagePath).padEnd(47)} ${r.sessions.padStart(6)} ${r.activeUsers.padStart(6)} ${r.screenPageViews.padStart(6)} ${r.engagedSessions.padStart(6)} ${formatDuration(r.userEngagementDuration).padStart(8)} ${formatBounce(r.bounceRate).padStart(8)}\n`;
  }

  out += `\n═══ ENGAGED SESSIONS ONLY — Humans (Top 15 pages) ═══\n`;
  out += `${"Page".padEnd(47)} ${"Sess".padStart(6)} ${"Users".padStart(6)} ${"Views".padStart(6)} ${"Time".padStart(8)}\n`;
  out += "─".repeat(75) + "\n";
  for (const r of engRows) {
    out += `${truncatePath(r.pagePath).padEnd(47)} ${r.sessions.padStart(6)} ${r.activeUsers.padStart(6)} ${r.screenPageViews.padStart(6)} ${formatDuration(r.userEngagementDuration).padStart(8)}\n`;
  }

  return out;
}

function toHtml(allRows, engRows, totals, dateRange) {
  const cellStyle = `padding:8px 12px;border-bottom:1px solid #E8E0D0;font-size:13px;`;
  const headerCell = `${cellStyle}background:#1B2A4A;color:#D4A853;font-weight:600;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;`;
  const numCell = `${cellStyle}text-align:right;font-variant-numeric:tabular-nums;`;

  function tableRows(rows, cols) {
    return rows
      .map(
        (r, i) =>
          `<tr style="background:${i % 2 === 0 ? "#FFFDF7" : "#FAF6EE"}">` +
          cols
            .map((c) => {
              const val = r[c.key];
              if (c.key === "pagePath")
                return `<td style="${cellStyle}max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#1B2A4A;">${val}</td>`;
              if (c.key === "bounceRate")
                return `<td style="${numCell}color:#4A5568;">${formatBounce(val)}</td>`;
              if (c.key === "userEngagementDuration")
                return `<td style="${numCell}color:#4A5568;">${formatDuration(val)}</td>`;
              return `<td style="${numCell}color:#4A5568;">${parseInt(val).toLocaleString()}</td>`;
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
  </div>
  <div style="padding:24px 32px;">
    <div style="display:flex;gap:16px;margin-bottom:24px;flex-wrap:wrap;">
      <div style="flex:1;min-width:140px;background:#F5F0E8;border-radius:8px;padding:16px;text-align:center;">
        <div style="font-size:28px;font-weight:700;color:#1B2A4A;">${parseInt(totals.all.sessions).toLocaleString()}</div>
        <div style="font-size:12px;color:#8B7D6B;margin-top:4px;">Total Sessions</div>
      </div>
      <div style="flex:1;min-width:140px;background:#F5F0E8;border-radius:8px;padding:16px;text-align:center;">
        <div style="font-size:28px;font-weight:700;color:#2D6A4F;">${parseInt(totals.engaged.sessions).toLocaleString()}</div>
        <div style="font-size:12px;color:#8B7D6B;margin-top:4px;">Human Sessions</div>
      </div>
      <div style="flex:1;min-width:140px;background:#F5F0E8;border-radius:8px;padding:16px;text-align:center;">
        <div style="font-size:28px;font-weight:700;color:#1B2A4A;">${parseInt(totals.all.pageViews).toLocaleString()}</div>
        <div style="font-size:12px;color:#8B7D6B;margin-top:4px;">Page Views</div>
      </div>
      <div style="flex:1;min-width:140px;background:#F5F0E8;border-radius:8px;padding:16px;text-align:center;">
        <div style="font-size:28px;font-weight:700;color:#B45309;">${formatBounce(totals.all.bounceRate)}</div>
        <div style="font-size:12px;color:#8B7D6B;margin-top:4px;">Bounce Rate</div>
      </div>
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
    <p style="margin:0;color:#8B7D6B;font-size:12px;">Automated weekly report · Carta de Invitación México</p>
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
