---
name: SEO Rank Check
description: Check Google rankings for cartadeinvitacionmexico.com across the top 10 target keywords. Saves a dated report in the seo-rankings/ folder. Use when you want to monitor SEO progress over time.
---

# SEO Rank Check — cartadeinvitacionmexico.com

Searches Google for each target keyword and checks whether cartadeinvitacionmexico.com appears in the results. Produces a markdown report saved to `seo-rankings/`.

## Target Keywords (10)

Search for these exact queries using the WebSearch tool:

1. `carta de invitación México`
2. `carta de invitación para extranjeros México`
3. `carta de invitación para entrar a México`
4. `carta de invitación migración México`
5. `cómo hacer carta de invitación México`
6. `carta de invitación cubanos México`
7. `carta de invitación venezolanos México`
8. `requisitos entrar a México como turista`
9. `generar carta de invitación México online`
10. `formato carta de invitación México`

## Execution

1. **Run all 10 searches in parallel** using the WebSearch tool (batch into groups of 4 max per message).
2. For each search result, scan ALL returned URLs to check if `cartadeinvitacionmexico.com` appears anywhere in the results.
3. Record:
   - **Position**: If found, note the approximate position (1-10). If not found in results, mark as "Not in top 10".
   - **Ranking URL**: Which page from our site appeared (if any).
   - **Top 3 competitors**: The first 3 URLs that are NOT our site.

## Important Notes

- The WebSearch tool runs from a US-based English context. Results may differ from what the user sees in their local Google (Spanish, Mexico locale). **Always include this caveat** in the report.
- If our site appears in results, note the exact page URL that ranked.
- Look for ANY cartadeinvitacionmexico.com URL in the results, not just the homepage.

## Output

Save the report as a markdown file at:

```
seo-rankings/YYYY-MM-DD-rank-check.md
```

Where `YYYY-MM-DD` is today's date.

### Report Format

Use this exact format:

```markdown
# SEO Rank Check — cartadeinvitacionmexico.com
**Date:** YYYY-MM-DD
**Tool:** WebSearch (US-based, English context)

> **Caveat:** These results are from a US-based search API and may differ from localized Google results in Mexico/Latin America. For precise rank tracking, use Google Search Console Performance reports or a dedicated rank tracker (Ahrefs, SEMrush, Ubersuggest).

## Results

| # | Keyword | Position | Our URL | Top 3 Competitors |
|---|---------|----------|---------|-------------------|
| 1 | carta de invitación México | Not in top 10 / #N | /articulos/... | site1.com, site2.com, site3.com |
| ... | ... | ... | ... | ... |

## Summary
- **Keywords ranked (top 10):** X / 10
- **Best position:** #N for "keyword"
- **New rankings since last check:** (compare with previous report if exists)
- **Top competitors appearing most:** site1 (X keywords), site2 (X keywords)

## Recommendations
- [1-3 actionable next steps based on the findings]
```

## Comparing with Previous Reports

Before generating the report, check if previous reports exist in `seo-rankings/`. If they do, read the most recent one and include a "Changes since last check" section comparing positions.
