---
name: weekly-article
description: |
  Autonomous SEO article generator for cartadeinvitacionmexico.com.
  Picks a topic from keyword gaps, researches, writes, publishes, and notifies.
  Scheduled weekly via remote trigger. Can also be invoked manually.
user-invocable: true
---

# Weekly Article Generator — cartadeinvitacionmexico.com

Create one new SEO-optimized article, publish it to the site, and send a notification.
Complete everything autonomously — do NOT ask for confirmation.

---

## ABORT CONDITIONS

If ANY of these occur, STOP immediately — do not publish a weak article:

- No suitable topic found (all keyword gaps already covered, no viable long-tail expansion)
- Cannot verify critical legal/immigration facts against official sources
- Research reveals contradictions with existing articles that cannot be resolved

If aborting: skip to Step 8 (notification) and explain why no article was published.

---

## Step 1: Read Project Context

Read these files before doing anything else:

1. `.claude/CLAUDE.md` — article rules, CTA requirements, brand styles, New Article Checklist
2. `.claude/skills/seo-rank-check/SKILL.md` — the 10 target keywords
3. `formulario-esencial.html` (lines 1-100) and `formulario-completo.html` (lines 1-100) — scan for actual form fields so you never claim the carta includes data it doesn't collect

### Critical Rules (from CLAUDE.md — repeated here for emphasis)

- **Mid-article CTA required:** TWO CTAs — one mid-article (after first `<h2>` section) + one at bottom
  - Articles ≤7 min read: **Style A "inline sutil"** (`.cta-inline` — left gold border, text link, no button)
  - Articles ≥8 min read: **Style B "card compacta"** (`.cta-mid` — centered cream card, `btn-gold`, max-width 480px)
  - CTA button text: first person ("Crear mi carta", NOT "Crea tu carta")
  - Mid-article CTA copy must be DIFFERENT from bottom CTA
  - Adapt CTA headline/copy to the article's specific topic (not generic)
- **Never mention CURP** — use "numero de identificacion oficial (INE, pasaporte mexicano o tarjeta de residente)"
- **Service consistency** — do not claim the carta includes data fields the forms don't actually collect

---

## Step 2: Choose Topic

1. Read the **most recent** report in `seo-rankings/` — identify keywords where the site is NOT ranking or ranking below position 10
2. List existing articles: `ls articulos/` — count them. Do NOT duplicate an existing topic.
3. Pick a topic that:
   - Targets a keyword gap from the SEO report
   - Is relevant to carta de invitacion / immigration to Mexico
   - Has search demand (verify with WebSearch — search the candidate keyword and check if competitors have content)
   - Is NOT already covered by any existing article

4. **If all 10 target keywords are adequately covered:** expand to long-tail variations, including:
   - Nationality-specific queries not yet covered (check which nationalities already have articles)
   - Process-specific queries: "carta de invitacion para menor de edad", "carta de invitacion trabajo temporal Mexico", "carta de invitacion multiple entries"
   - Seasonal/situational: holiday travel to Mexico, Semana Santa travel, digital nomad stays
   - Complementary topics: "seguro de viaje para Mexico", "FMM forma migratoria multiple"
   - Use WebSearch to validate demand before committing to any long-tail topic.

5. **Year and date rules:**
   - Use the current year in article content where dates are referenced (check today's date with `date`)
   - Do NOT put the year in the URL slug — slugs must be evergreen
   - Example: slug `carta-invitacion-menores-mexico` (good), NOT `carta-invitacion-menores-mexico-2026` (bad)

---

## Step 3: Research & Fact-Check

This is the most important step. Factual accuracy is non-negotiable for immigration content.

1. WebSearch the topic — find 3-5 authoritative sources (prioritize gob.mx, INM, SRE, consulate pages)
2. Cross-reference ALL legal requirements, visa policies, document lists, and immigration rules against official Mexican government sources
3. Read at least 3 existing articles in `articulos/` to verify the new article does NOT contradict published content
4. Do NOT guess or fabricate immigration data. If you cannot verify a claim from an official source, omit it entirely.
5. **Record your sources** — you will include them in the notification email (Step 8)

---

## Step 4: Write the Article

1. Read `articulos/carta-invitacion-notariada.html` as the structural template — match the exact HTML structure, `<head>` tags, inline styles, nav, footer
2. Write in Spanish (es-MX). Professional but accessible tone.
3. Target 1200-2000 words (6-10 min read)
4. Include all of the following:
   - `<title>`, `<meta description>`, `<link rel="canonical">`, Open Graph tags (including `article:published_time` with today's date), Twitter Card tags
   - Google Analytics gtag.js snippet (copy exactly from template)
   - All favicon links (copy exactly from template)
   - Article schema markup (JSON-LD) — and FAQPage schema if the article has an FAQ section
   - Semantic HTML: `<header>`, `<main>`, `<article>`, `<footer>`, `<section>`
   - Logical heading hierarchy: single `<h1>`, then `<h2>` for sections, `<h3>` for subsections
   - Brand CSS variables and classes from the template (`--c-navy`, `--c-gold`, `--c-cream`, `.btn-gold`, `.cta-inline`, `.cta-card`, etc.)
   - Both CTAs per the CTA rules above (correct style for reading time)
5. Save as `articulos/[slug].html` — slug is descriptive, SEO-friendly, and evergreen (no year)

---

## Step 5: Internal Linking & Pillar Page

1. **From new article → existing articles:** Link to at least 2 related existing articles with descriptive anchor text
2. **From new article → pillar page:** Link to `guia-carta-invitacion-mexico.html` where contextually appropriate (e.g., "Para una guia completa, consulta nuestra [Guia de Carta de Invitacion]")
3. **From existing article → new article:** Edit at least 1 existing related article to add a link to the new article
4. **From pillar page → new article:** If the new topic fills a gap in the pillar page's coverage, add a link from `guia-carta-invitacion-mexico.html` to the new article

---

## Step 6: Update Site Infrastructure

### 6a. `articulos.html`
Read the file, find the article grid, and add a new card matching the existing card HTML structure (title, description, thumbnail placeholder, link). Place it at the top of the grid (newest first).

### 6b. `sitemap.xml`
Add a `<url>` entry in the "Articulos" section:
```xml
<url>
  <loc>https://cartadeinvitacionmexico.com/articulos/[slug]</loc>
  <lastmod>YYYY-MM-DD</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
```

### 6c. `llms.txt`
Add the new article to the articles list, matching the existing format:
```
- [Article Title](https://cartadeinvitacionmexico.com/articulos/[slug]): One-line description in Spanish.
```

---

## Step 7: Validate & Commit

### Validation checks (before committing):
1. Open the new article file with Read and verify:
   - No unclosed HTML tags
   - All `<img>` tags have `alt` attributes
   - Schema JSON-LD is valid (proper braces/brackets)
   - Canonical URL matches the slug
   - `article:published_time` is set to today's date
   - No mention of "CURP" anywhere (`grep -i curp` on the file)
   - Both CTAs present
2. Verify `articulos.html` card links to the correct slug
3. Verify `sitemap.xml` entry has the correct URL (no `.html` extension — Vercel `cleanUrls` strips it)
4. Verify `llms.txt` entry matches

### Commit & push:
```bash
git add articulos/[new-article].html articulos.html sitemap.xml llms.txt
# Add any files edited for internal linking:
git add articulos/[edited-articles].html
# Add pillar page if edited:
git add guia-carta-invitacion-mexico.html
git commit -m "feat: new article — [slug] (keyword: [target keyword])"
git push origin main
```

---

## Step 8: Send Notification Email

Send a notification email with the results.

**If using Gmail MCP** (remote trigger):
Send to starace.raffaello@gmail.com with:

**If running locally** (manual invocation):
Run `node scripts/send-article-notification.mjs` (uses Resend API from `.env.local`)

### Email content:
- **Subject:** `Nuevo articulo publicado: [article title]` (or `Articulo NO publicado: [reason]` if aborted)
- **Body:**
  - Article title and URL: `https://cartadeinvitacionmexico.com/articulos/[slug]`
  - Target keyword(s)
  - Brief summary (2-3 sentences describing the article)
  - Internal links added (which existing articles were updated, and the pillar page if applicable)
  - Fact-check sources used (list the URLs)
  - If ABORTED: explain why and suggest what to do next

---

## Quality Checklist

Verify ALL before committing (Step 7):

- [ ] Article HTML renders without errors
- [ ] Both CTAs present — correct style for reading time (A for ≤7 min, B for ≥8 min)
- [ ] CTA text uses first person ("Crear mi carta")
- [ ] Mid-article and bottom CTA copy are different from each other
- [ ] No mention of CURP anywhere
- [ ] All immigration facts verified against official government sources
- [ ] No contradictions with existing published articles
- [ ] Card added to `articulos.html`
- [ ] `sitemap.xml` updated (URL without `.html` extension)
- [ ] `llms.txt` updated with new entry
- [ ] At least 2 internal links TO existing articles
- [ ] At least 1 internal link FROM an existing article
- [ ] Pillar page cross-linked where appropriate
- [ ] Meta tags, OG tags (including `article:published_time`), Twitter Card tags present
- [ ] Article + FAQPage schema markup (JSON-LD) present
- [ ] Canonical URL set correctly
- [ ] URL slug is evergreen (no year in slug)
- [ ] Current year used in article body text where dates are referenced
