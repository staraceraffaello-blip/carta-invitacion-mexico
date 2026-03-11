# CLAUDE.md — Frontend Website Rules

## Always Do First
- **Invoke the `frontend-design` and `seo-optimization` skills** before writing any frontend code, every session, no exceptions.
- **Off-topic check:** If the user sends a request that seems completely unrelated to what you are currently working on (e.g., switching from PDF tweaks to analytics, or from frontend to email), ask them to confirm before proceeding. They may have intended the message for a different agent.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- **Mobile Reflow:** If only a desktop reference is provided, you must intelligently reflow the layout for mobile (e.g., stack columns, collapse navigation).
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.
- **Mobile Validation:** Perform at least one of these comparison rounds specifically using a mobile viewport (375px width).

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL.
- Start the dev server: `node serve.mjs` (serves the project root at `http://localhost:3000`)
- `serve.mjs` lives in the project root. Start it in the background before taking any screenshots.
- If the server is already running, do not start a second instance.

## Screenshot Workflow
- Puppeteer is installed at `C:/Users/laura.rodriguez/AppData/Roaming/npm/node_modules/puppeteer`. Chrome cache is at `C:/Users/laura.rodriguez/.cache/puppeteer/`.
- **Always screenshot from localhost:** `node screenshot.mjs http://localhost:3000`
- **Mobile Screenshotting:** To verify mobile layouts, use the mobile flag/dimensions: `node screenshot.mjs http://localhost:3000 mobile` (target 375x812).
- Screenshots are saved automatically to `./temporary screenshots/screenshot-N.png` (auto-incremented, never overwritten).
- Optional label suffix: `node screenshot.mjs http://localhost:3000 label` → saves as `screenshot-N-label.png`
- `screenshot.mjs` lives in the project root. Use it as-is.
- After screenshotting, read the PNG from `temporary screenshots/` with the Read tool — Claude can see and analyze the image directly.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px"
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing

## Output Defaults
- Single `index.html` file, all styles inline, unless user says otherwise.
- **Viewport Meta:** Always include `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">`.
- **SEO Foundations:** - Use a logical heading hierarchy (`h1` through `h6`).
    - Include a descriptive `<title>` and `<meta name="description" content="...">`.
    - Use semantic HTML tags (`<header>`, `<main>`, `<footer>`, `<section>`, `<article>`).
    - Add `alt` attributes to all images (even placeholders).
- **Mobile-First CSS:** Build using mobile styles as default (e.g., `flex-col`, `grid-cols-1`) and use `md:` or `lg:` for desktop layout adjustments.
- **Scroll Fix:** Apply `overflow-x-hidden` to the body or main wrapper to prevent accidental horizontal shifting on small screens.
- Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive.

## Brand Assets
- Always check the `brand_assets/` folder before designing. It may contain logos, color guides, style guides, or images.
- If assets exist there, use them. Do not use placeholders where real assets are available.
- If a logo is present, use it. If a color palette is defined, use those exact values — do not invent brand colors.

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Pick a custom brand color and derive from it.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Touch Targets:** Ensure all buttons, links, and inputs have a minimum touch area of **44x44px** on mobile.
- **Input Scaling:** Set a minimum font size of `16px` (Tailwind `text-base`) for all form inputs to prevent iOS auto-zoom behavior on focus.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay (`bg-gradient-to-t from-black/60`) and a color treatment layer with `mix-blend-multiply`.
- **Spacing:** Use intentional, consistent spacing tokens — not random Tailwind steps. Ensure `px-4` or `px-6` horizontal padding on mobile containers so content never touches screen edges.
- **Depth:** Surfaces should have a layering system (base → elevated → floating), not all sit at the same z-plane.

## Hard Rules
- Do not add sections, features, or content not in the reference.
- Do not "improve" a reference design — match it.
- **No Horizontal Scrolling:** A mobile layout that requires horizontal scrolling is an automatic failure.
- **Semantic HTML Only:** Avoid `div` soup; use appropriate tags for SEO and accessibility.
- Do not stop after one screenshot pass.
- Do not use `transition-all`.
- Do not use default Tailwind blue/indigo as primary color.

## Git & Deployment
- After making file changes, always commit and push to the repository unless told otherwise.
- When pushing to git, check that the remote is already configured before running `git remote add` to avoid errors.

## File Changes Across Multiple HTML Pages
- This project has ~27-30 HTML files that often need the same change (favicons, footers, copyright years, schema markup). When making a change to one HTML file, always ask or check if the same change applies to all HTML files in the project.
- Use parallel agents (Task tool) for bulk multi-file changes.

## Forms
- This project has TWO Spanish-language form files that must always be kept in sync. When modifying validation, dropdowns, labels, or fields in one form, apply the same change to the other form file.
- Always verify that dropdown option values exactly match the label map keys used in processing logic.

## Email & Logo Rendering
- SVG logos do NOT render in email clients. When building email templates, always use hosted PNG images for logos from the start.
- Verify email recipient addresses before sending test emails or drafts.

## Articles & Blog Content
- **Mid-article CTA required:** Every article must have TWO CTAs — one mid-article (after the first `<h2>` section) and one at the bottom.
  - Articles ≤7 min: use **Style A "inline sutil"** (`.cta-inline` — left gold border, text link, no button)
  - Articles ≥8 min: use **Style B "card compacta"** (`.cta-mid` — centered cream card with btn-gold, max-width 480px)
  - CTA button text must use first person: "Crear mi carta" (not "Crea tu carta")
  - Mid-article CTA copy must be **different** from the bottom CTA to avoid redundancy
  - Adapt the headline/copy to the article's specific topic (contextual, not generic)
- **CURP:** Never mention CURP in articles. The service does not collect it. Use "número de identificación oficial (INE, pasaporte mexicano o tarjeta de residente)" instead.
- **Consistency with the service:** Do not claim the carta includes data fields that the forms don't actually collect. When in doubt, check `formulario-esencial.html` and `formulario-completo.html`.

### New Article Checklist
Every time a new article is created, complete ALL of the following before considering it done:

1. **Fact-check thoroughly:** Verify all legal requirements, visa policies, dates, and immigration rules against official sources (gob.mx, INM, SRE). Do not guess or fabricate immigration data.
2. **Cross-check with existing content:** Read at least 3 existing articles to ensure the new article does not contradict information already published on the site (e.g., visa-exempt countries, document requirements, fee amounts).
3. **Add article card to `articulos.html`:** The article must appear on the articles listing page with correct title, description, thumbnail, and link.
4. **Verify article is accessible:** Start the local server and use Puppeteer to navigate to `http://localhost:3000/articulos/[slug].html` — confirm the page loads without errors.
5. **Screenshot the article card on `articulos.html`:** Use Puppeteer to screenshot the articles page and verify the new card image renders correctly, is not broken, and matches the existing card layout.
6. **Update `sitemap.xml`:** Add a `<url>` entry with the full URL, today's date as `<lastmod>`, `monthly` changefreq, and `0.7` priority.
7. **Internal linking:** Ensure the new article links to at least 2 related existing articles, and add a link to the new article from at least 1 existing related article.
8. **Meta tags & schema:** Verify the article has `<title>`, `<meta description>`, Open Graph tags, and FAQPage schema markup where appropriate.
9. **Mid-article CTA:** Confirm both mid-article and bottom CTAs are present per the rules above.
10. **Commit & push:** Stage the new article, updated `articulos.html`, updated `sitemap.xml`, and any modified existing articles. Push to remote.

## PDF Generation (`api/lib/generate-pdf.js`)
- **Capitalization after periods:** When concatenating sentences into a single `doc.text()` call, never start a sentence with a lowercase variable (e.g., `${refInvitados} se desplazará`). Always use a construction that begins with a capital letter.
- **Singular/plural:** Use `hasCompanions` to branch between singular (Plan Esencial) and plural (Plan Completo). Always verify both variants after any change.
- **No redundant phrases:** Avoid repeating the same phrase (e.g., "Durante su estancia") across consecutive paragraphs.
- **Test all variants:** Run `node test-pdf.mjs` after changes — it generates 3 test PDFs (esencial, esencial-b, completo) in `temporary pdf/`. Review ALL of them.

## Analytics
- **GA4 Property ID:** `526320486` (cartadeinvitacionmexico.com)
- When pulling analytics reports, invoke the `analytics-report` skill at `.claude/skills/analytics-report/skill.md`.
- Always show two tables: ALL sessions and Engaged-only (humans) sessions.

