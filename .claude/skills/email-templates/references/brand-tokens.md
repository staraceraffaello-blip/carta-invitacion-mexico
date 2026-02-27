# Brand Tokens for Email Templates

These tokens are derived from the Carta de Invitacion Mexico website and MUST be used in all email templates.

## Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Navy | `#1B3566` | Primary brand, header backgrounds, headings |
| Navy Dark | `#132648` | Darker accents, preheader background |
| Navy Darkest | `#0C1830` | Footer background |
| Gold | `#C9A84C` | Accent buttons, highlights, CTAs |
| Gold Light | `#D9BC5C` | Hover states, secondary accents |
| Gold Pale | `#E0C97A` | Subtle accent backgrounds |
| Cream | `#FAF8F4` | Body background alternative |
| Mid Blue | `#4A6FA5` | Secondary text, links |
| Info BG | `#F0F4FF` | Callout/tip box backgrounds |
| Body Text | `#1F2937` | Main paragraph text |
| Secondary Text | `#374151` | List items, secondary content |
| Muted Text | `#6B7280` | Captions, fine print |
| Faintest Text | `#9CA3AF` | Legal disclaimers, footer links |
| Border Light | `#E5E7EB` | Dividers, card borders |
| White | `#FFFFFF` | Card/content backgrounds |

## Typography (Email-Safe Stacks)

Email clients do not reliably load web fonts. Use these fallback stacks:

| Role | Stack | Notes |
|------|-------|-------|
| Headings | `Georgia, 'Times New Roman', serif` | Mirrors Cormorant Garamond's serif feel |
| Body | `'Helvetica Neue', Helvetica, Arial, sans-serif` | Mirrors DM Sans's clean look |
| Monospace | `'Courier New', Courier, monospace` | For codes, order IDs |

**Optional web-font hint** (works in Apple Mail, iOS Mail, some Android):
```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```
Wrap in `<!--[if !mso]><!-->...<!--<![endif]-->` so Outlook ignores it.

## Button Styles

### Primary CTA (Gold)
```
Background: #C9A84C
Text: #1B3566 (navy)
Border-radius: 8px
Padding: 14px 32px
Font-weight: 700
Font-size: 16px
```

### Secondary CTA (Navy)
```
Background: #1B3566
Text: #FFFFFF
Border-radius: 8px
Padding: 14px 32px
Font-weight: 600
Font-size: 15px
```

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| Container max-width | 560px | Main email width |
| Header padding | 24px 32px | Top header block |
| Body padding | 32px | Content area |
| Section gap | 24px | Between content blocks |
| Paragraph line-height | 1.6 | Body readability |

## Logo

The logo SVG (`brand_assets/logos/concept-1-el-sello-white.svg`) should be inlined as a base64 data URI or referenced via the production domain. Use the white variant on navy headers, the standard variant on light backgrounds.

## Callout Box

```
Background: #F0F4FF
Border-left: 4px solid #1B3566
Padding: 16px 20px
Border-radius: 0 6px 6px 0
Title: 14px, #1B3566, font-weight 600
Body: 13px, #374151, line-height 1.7
```

## Gold Divider

```html
<tr><td style="padding: 0 32px;">
  <div style="height: 1px; background: linear-gradient(to right, transparent, #C9A84C, transparent); opacity: 0.4;"></div>
</td></tr>
```

Note: `linear-gradient` dividers won't render in all clients. Provide a solid-color fallback:
```html
<!--[if mso]>
<tr><td style="padding: 0 32px;"><hr style="border: none; border-top: 1px solid #E5E7EB;"></td></tr>
<![endif]-->
```
