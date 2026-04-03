---
name: SEO Rank Check
description: Check Google rankings for cartadeinvitacionmexico.com across the top 10 target keywords. Saves a dated report in the seo-rankings/ folder. Use when you want to monitor SEO progress over time.
---

# SEO Rank Check — cartadeinvitacionmexico.com

Searches Google for each target keyword and checks whether cartadeinvitacionmexico.com appears in the results. Produces a markdown report saved to `seo-rankings/`.

## Target Keywords

### Core (10) — tracked daily via GitHub Actions + GSC
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

### Nationality expansion (14) — match existing + uncovered articles
11. `carta de invitación colombianos México`
12. `carta de invitación peruanos México`
13. `carta de invitación argentinos México`
14. `carta de invitación ecuatorianos México`
15. `carta de invitación dominicanos México`
16. `carta de invitación brasileños México`
17. `carta de invitación bolivianos México`
18. `carta de invitación hondureños México`
19. `carta de invitación guatemaltecos México`
20. `carta de invitación chilenos México`
21. `carta de invitación nicaragüenses México`
22. `carta de invitación salvadoreños México`
23. `carta de invitación haitianos México`
24. `carta de invitación paraguayos México`

### Process & situation (10) — long-tail article opportunities
25. `carta de invitación para menor de edad México`
26. `carta de invitación para pareja extranjera México`
27. `carta de invitación para visa mexicana consulado`
28. `carta de invitación vs reserva de hotel México`
29. `carta de invitación para tratamiento médico México`
30. `qué pasa si no tengo carta de invitación México`
31. `carta de invitación para eventos y negocios México`
32. `carta responsiva migración México`
33. `preregistro INM Colombia México`
34. `documentos para entrar a México como turista`

## Execution

**Automated (daily via GitHub Actions):** The `scripts/seo-rank-check.mjs` script queries GSC for the core 10 keywords and saves reports + JSON to `seo-rankings/`. It also exports a `keyword-discovery.json` file with ALL queries GSC has data for — used by the weekly article generator to find topic gaps.

**Manual (via this skill):** Search all 34 keywords using the WebSearch tool (batch into groups of 4 max per message).
1. For each search result, scan ALL returned URLs to check if `cartadeinvitacionmexico.com` appears anywhere in the results.
2. Record:
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
