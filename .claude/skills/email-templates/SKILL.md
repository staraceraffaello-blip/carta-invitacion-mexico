---
name: email-templates
description: Build attractive, brand-consistent HTML email templates for transactional and marketing emails. Generates email-client-compatible code matching the Carta de Invitacion Mexico website style (navy, gold, cream palette, serif + sans-serif typography). Use when creating or updating any email sent to customers.
---

# Email Templates Skill

Create production-ready HTML email templates that perfectly match the Carta de Invitacion Mexico brand identity. Every email a customer receives should feel like a natural extension of the website — professional, trustworthy, and polished.

---

## When to Use This Skill

- Creating a new transactional email (order confirmation, delivery, payment receipt, etc.)
- Redesigning or upgrading the existing `send-email.js` template
- Building marketing/promotional emails (announcements, seasonal offers)
- Creating system emails (password reset, account notifications)
- Generating email template code for use with Resend, SendGrid, or any ESP

---

## Before You Start

1. **Read brand tokens:** Always read `references/brand-tokens.md` before generating any template.
2. **Read the example:** Study `examples/delivery-confirmation.html` — it is the gold-standard reference template.
3. **Check current code:** Read `api/lib/send-email.js` to understand the existing email integration.
4. **Check brand assets:** Look in `brand_assets/logos/` for logo SVGs if you need to inline them.

---

## Core Principles

### 1. Email Client Compatibility First

HTML email is not the web. These rules are non-negotiable:

- **Tables for layout.** Use `<table role="presentation">` for all structural layout. Never rely on `<div>` for columns.
- **Inline styles on every element.** CSS classes only work in a few clients. Every `<td>`, `<p>`, `<a>` needs its own `style=""`.
- **No CSS Grid, no Flexbox.** They break in Outlook, Gmail, and Yahoo.
- **No `<style>` for critical styles.** Use `<style>` blocks only for progressive enhancement (dark mode, mobile overrides). All essential visual styles must be inline.
- **No JavaScript.** Ever.
- **No `background-image` on `<td>`.** Outlook ignores it. Use VML fallbacks if needed.
- **Max width: 560px.** The email container should be 560px wide (matches current brand). Use `width="560"` on the outer table and `max-width: 560px; width: 100%` in inline style.
- **Image `alt` text always.** Many clients block images by default.
- **`role="presentation"`** on all layout tables to preserve accessibility.

### 2. Brand Consistency

Every template must use the brand tokens defined in `references/brand-tokens.md`:

| Element | Style |
|---------|-------|
| **Header** | Navy background (`#1B3566`), white text, serif heading (Georgia), gold logo mark |
| **Gold accent line** | 3px gradient strip below header (`#C9A84C` → `#D9BC5C` → `#C9A84C`) |
| **Body** | White background, `#1F2937` body text, `'Helvetica Neue', Arial, sans-serif` |
| **Callout boxes** | `#F0F4FF` background, 4px navy left border, gold bullets |
| **CTAs** | Gold background (`#C9A84C`), navy text (`#1B3566`), 8px radius, 700 weight |
| **Footer** | Darkest navy (`#0C1830`), gold CI·MX mark, mid-blue links, gray disclaimer |

### 3. Responsive Design

Use a single-column layout (560px) that degrades gracefully:

```css
@media only screen and (max-width: 600px) {
  .email-container { width: 100% !important; max-width: 100% !important; }
  .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
  .stack-column { display: block !important; width: 100% !important; }
}
```

### 4. Dark Mode Support

Include progressive enhancement for dark mode:

```css
@media (prefers-color-scheme: dark) {
  .email-bg { background-color: #0C1830 !important; }
  .card-bg { background-color: #132648 !important; }
  .body-text { color: #E5E7EB !important; }
  .muted-text { color: #9CA3AF !important; }
}
```

Also set `<meta name="color-scheme" content="light">` and `<meta name="supported-color-schemes" content="light">` to hint default rendering.

---

## Template Architecture

Every email template follows this structure:

```
DOCTYPE + html lang="es"
├── <head>
│   ├── Meta tags (charset, viewport, color-scheme)
│   ├── Outlook conditionals (VML namespace, pixel density)
│   ├── Web font link (wrapped in <!--[if !mso]><!--> ... <!--<![endif]-->)
│   ├── Reset styles
│   ├── Dark mode styles
│   └── Mobile responsive styles
│
├── <body style="background: #FAF8F4;">
│   ├── Hidden preheader text (preview snippet)
│   │
│   └── Outer table (100% width, cream background)
│       └── Inner table (560px, centered)
│           ├── HEADER — Navy bar with logo + title
│           ├── GOLD ACCENT — 3px gradient strip
│           ├── BODY — White card with content
│           │   ├── Greeting
│           │   ├── Main message
│           │   ├── Data card / summary (if applicable)
│           │   ├── Callout box (if applicable)
│           │   ├── CTA button (if applicable)
│           │   └── Help text
│           └── FOOTER — Dark navy with branding + legal
```

---

## Template Types

### Transactional (must-send, triggered by user action)

| Template | Trigger | Key Content |
|----------|---------|-------------|
| **Delivery Confirmation** | Payment success + PDF generated | PDF attached, guest name, recommendations |
| **Payment Receipt** | Stripe payment confirmed | Amount, plan, order ID, date, receipt link |
| **Payment Failed** | Stripe charge fails | Retry link, support contact |
| **Refund Confirmation** | Admin issues refund | Amount, original order, timeline |

### System (automated, platform-generated)

| Template | Trigger | Key Content |
|----------|---------|-------------|
| **Welcome / Account Created** | First purchase | What to expect, how it works |
| **Order Processing** | Form submitted, awaiting payment | What happens next, payment link |

### Marketing (optional, manual sends)

| Template | Use Case | Key Content |
|----------|----------|-------------|
| **Seasonal Promotion** | Holiday / peak travel | Discount code, urgency, CTA |
| **New Feature Announcement** | Plan Completo launch, etc. | Feature highlights, upgrade CTA |
| **Re-engagement** | Abandoned form / cart | Reminder, simplified CTA |

---

## Generating a Template

### Step 1: Identify the Type

Ask (or determine from context):
- What triggers this email?
- What must the recipient know?
- Is there a CTA? Where should it go?
- Are there dynamic variables? List them.

### Step 2: Scaffold from the Example

Copy `examples/delivery-confirmation.html` as a starting point. It already has:
- Correct Outlook conditionals
- Reset styles
- Dark mode support
- Mobile responsive classes
- All brand tokens applied
- Accessible table-based layout
- VML button fallback for Outlook

### Step 3: Customize Content Blocks

Swap content blocks as needed. Available blocks:

#### Hero Image Block
```html
<tr>
  <td style="padding: 0;">
    <img src="{{imageUrl}}" alt="{{imageAlt}}" width="560" style="display: block; width: 100%; height: auto; border-radius: 0;" class="fluid">
  </td>
</tr>
```

#### Data Summary Card
```html
<tr>
  <td style="background-color: #FAF8F4; border-radius: 8px; padding: 20px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 12px;" colspan="2">
          Section Title
        </td>
      </tr>
      <tr>
        <td style="font-size: 14px; color: #6B7280; padding: 4px 0;">Label</td>
        <td align="right" style="font-size: 14px; color: #1B3566; font-weight: 600;">Value</td>
      </tr>
    </table>
  </td>
</tr>
```

#### Callout / Tip Box
```html
<tr>
  <td style="background-color: #F0F4FF; border-left: 4px solid #1B3566; padding: 16px 20px; border-radius: 0 8px 8px 0;">
    <p style="margin: 0 0 8px; font-size: 14px; color: #1B3566; font-weight: 600;">Title</p>
    <p style="margin: 0; font-size: 13px; line-height: 1.7; color: #374151;">Body text.</p>
  </td>
</tr>
```

#### Warning / Alert Box
```html
<tr>
  <td style="background-color: #FFF7ED; border-left: 4px solid #C9A84C; padding: 16px 20px; border-radius: 0 8px 8px 0;">
    <p style="margin: 0 0 8px; font-size: 14px; color: #92400E; font-weight: 600;">Atencion</p>
    <p style="margin: 0; font-size: 13px; line-height: 1.7; color: #78350F;">Warning message.</p>
  </td>
</tr>
```

#### Gold CTA Button (with Outlook VML fallback)
```html
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
  <tr>
    <td align="center">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="{{url}}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="17%" strokecolor="#C9A84C" fillcolor="#C9A84C">
        <w:anchorlock/><center style="color:#1B3566;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">{{buttonText}}</center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-->
      <a href="{{url}}" target="_blank" style="display: inline-block; background-color: #C9A84C; color: #1B3566; font-family: 'DM Sans', 'Helvetica Neue', Arial, sans-serif; font-size: 16px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
        {{buttonText}}
      </a>
      <!--<![endif]-->
    </td>
  </tr>
</table>
```

#### Navy CTA Button
```html
<a href="{{url}}" target="_blank" style="display: inline-block; background-color: #1B3566; color: #FFFFFF; font-family: 'DM Sans', 'Helvetica Neue', Arial, sans-serif; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
  {{buttonText}}
</a>
```

#### Gold Divider
```html
<tr>
  <td style="padding: 12px 0;">
    <div style="height: 1px; background: linear-gradient(to right, transparent, #C9A84C, transparent); opacity: 0.4;"></div>
    <!--[if mso]><hr style="border: none; border-top: 1px solid #E5E7EB;"><![endif]-->
  </td>
</tr>
```

#### Two-Column Layout (stacks on mobile)
```html
<tr>
  <td>
    <!--[if mso]><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td width="50%" valign="top"><![endif]-->
    <div class="stack-column" style="display: inline-block; width: 48%; vertical-align: top;">
      <!-- Left column -->
    </div>
    <!--[if mso]></td><td width="4%">&nbsp;</td><td width="50%" valign="top"><![endif]-->
    <div class="stack-column" style="display: inline-block; width: 48%; vertical-align: top;">
      <!-- Right column -->
    </div>
    <!--[if mso]></td></tr></table><![endif]-->
  </td>
</tr>
```

### Step 4: Set the Preheader

Every email needs a hidden preheader — the preview text that shows in the inbox next to the subject line. Keep it under 100 characters and make it compelling:

```html
<div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #FAF8F4;">
  Your preview text here. Make it enticing.
  &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
</div>
```

The `&zwnj;&nbsp;` padding pushes any leaking body text out of the preview.

### Step 5: Validate

Before delivering the template, verify:

- [ ] All styles are inline on every visible element
- [ ] `role="presentation"` on all layout tables
- [ ] VML fallback on CTA buttons (for Outlook)
- [ ] Preheader text is set and hidden
- [ ] All `{{variables}}` are documented
- [ ] `lang="es"` on `<html>` tag
- [ ] Mobile responsive (`@media max-width: 600px`)
- [ ] Dark mode classes on key elements
- [ ] Alt text on all images
- [ ] No `transition`, `animation`, `transform`, `position: fixed`, or JS
- [ ] Max container width is 560px
- [ ] Font stacks use email-safe fallbacks (Georgia for serif, Helvetica/Arial for sans)
- [ ] Colors match brand tokens exactly

---

## Integration with send-email.js

The current `api/lib/send-email.js` uses Resend's `html` parameter. To use a new template:

```javascript
// In send-email.js or a new email function:
const { data, error } = await resend.emails.send({
  from: process.env.RESEND_FROM_EMAIL || 'Carta de Invitacion <cartas@cartadeinvitacionmexico.com>',
  to,
  subject: 'Your subject — {{planLabel}}',
  html: buildTemplate({ guestName, planLabel, orderDate, orderId }),
  attachments: [/* ... */],
});
```

You can either:
1. **Inline the HTML** in the `html` parameter (current approach, simpler)
2. **Create a template builder function** that accepts variables and returns the HTML string
3. **Use Resend's template feature** if the project migrates to stored templates

For approach #2, create a helper in `api/lib/email-templates/` that exports template functions:

```javascript
// api/lib/email-templates/delivery.js
export function deliveryConfirmation({ guestName, planLabel, orderDate, orderId }) {
  return `<!DOCTYPE html>...`; // Full HTML string with variables interpolated
}
```

---

## Testing

### Visual Testing
1. Copy the HTML into a file and open it in a browser for a quick visual check
2. Use [Litmus](https://www.litmus.com) or [Email on Acid](https://www.emailonacid.com) for cross-client rendering
3. Send a test via Resend's test mode to check real rendering

### Resend Test Send
Use the existing `api/test-webhook.js` pattern or create a dedicated test script:

```javascript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Test <onboarding@resend.dev>',
  to: 'your-email@example.com',
  subject: 'Template Test',
  html: templateHtml,
});
```

### Checklist of Clients to Verify
- Gmail (web + mobile app)
- Apple Mail (macOS + iOS)
- Outlook (desktop + web)
- Yahoo Mail

---

## Anti-Patterns to Avoid

| Do NOT | Do Instead |
|--------|------------|
| Use `<div>` for layout columns | Use `<table>` with `role="presentation"` |
| Use CSS classes for essential styles | Inline every style |
| Use `margin` on outer elements | Use `padding` on `<td>` cells |
| Use `background-image` on `<td>` | Use VML for Outlook, inline `<img>` for others |
| Use web fonts as primary | Use email-safe stacks, web fonts as enhancement |
| Use hex shorthand (`#fff`) | Use full hex (`#FFFFFF`) for max compatibility |
| Send without a preheader | Always include a hidden preheader `<div>` |
| Use `max-width` alone | Combine with `width="560"` attribute for Outlook |
| Nest tables more than 3 levels | Keep structure flat |
| Use CSS `float` | Use `display: inline-block` with Outlook conditional tables |

---

## Quick Reference: Variable Syntax

Use `{{variableName}}` as placeholders. Document all variables at the top of each template in an HTML comment:

```html
<!--
  TEMPLATE: Template Name
  TYPE: Transactional | System | Marketing
  VARIABLES:
    {{guestName}} — Full name of the guest/visitor
    {{planLabel}} — "Plan Esencial" or "Plan Completo"
    {{orderDate}} — Formatted date string (e.g., "26 de febrero de 2026")
    {{orderId}}   — Stripe session or internal order ID
    {{ctaUrl}}    — URL for the main CTA button
-->
```
