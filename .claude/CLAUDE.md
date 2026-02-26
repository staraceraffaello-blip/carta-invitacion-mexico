# CLAUDE.md — Frontend Website Rules

## Always Do First
- **Invoke the `frontend-design` and `seo-optimization` skills** before writing any frontend code, every session, no exceptions.

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
