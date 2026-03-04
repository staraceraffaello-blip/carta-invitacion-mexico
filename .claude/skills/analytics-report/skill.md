# Skill: Analytics Report

Generate a GA4 analytics report for cartadeinvitacionmexico.com using the Google Analytics MCP.

## Property
- **Property ID:** `526320486`
- **Timezone:** America/Mexico_City
- **Currency:** USD

## Report Format

Always produce **two tables** side by side:

### 1. ALL Sessions
Pull with no filters. Include these metrics:
- `sessions`, `activeUsers`, `screenPageViews`, `engagedSessions`, `userEngagementDuration`, `bounceRate`

### 2. Engaged Sessions Only (Humans)
Apply a metric filter: `engagedSessions >= 1`. This filters out bots/crawlers that hit a page without meaningful interaction. Include:
- `sessions`, `activeUsers`, `screenPageViews`, `userEngagementDuration`

## Default Dimensions & Date Range
- **Dimensions:** `pagePath` (unless the user asks for something else like country, source, device)
- **Date range:** Last 7 days (`7daysAgo` to `today`) unless the user specifies otherwise
- **Order by:** sessions descending
- **Limit:** 15 rows

## Realtime
If the user asks for realtime data or "who's on the site right now", use `run_realtime_report` with:
- **Dimensions:** `unifiedScreenName`
- **Metrics:** `activeUsers`

## Interpreting Results
- Sessions from cities like Ashburn, Boardman, Council Bluffs (US data centers) are likely bots
- Linux + Chrome from random global cities is a common bot fingerprint
- 100% bounce rate + low engagement time = likely automated traffic
- Engaged session = 10+ seconds on page, OR 2+ page views, OR a conversion event

## Available MCP Tools
- `mcp__google-analytics__get_account_summaries` — list accounts/properties
- `mcp__google-analytics__run_report` — historical reports with date ranges
- `mcp__google-analytics__run_realtime_report` — live active users
- `mcp__google-analytics__get_property_details` — property configuration
- `mcp__google-analytics__get_custom_dimensions_and_metrics` — custom dims/metrics

## Example User Prompts
- "pull analytics" / "analytics report" / "how's the site doing?"
- "who's on the site right now?"
- "show me traffic by country"
- "compare this week vs last week"
- "top traffic sources"
