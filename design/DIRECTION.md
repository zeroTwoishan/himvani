# HIMVANI visual direction (locked from the Stitch probe, 30 Sep 2026)

This is the contract for `design/DESIGN.md`, `design/UX.md` and every Stitch screen. Probe renders live in `design/stitch/probe/`.

## Chosen composition
**Base:** variant `dac9fdb0…` (`probe/home-var-dac9fdb051ad495c887bc5e8bccb3436.webp`). The hero is one full-bleed polar-night section holding the headline, the polar map and the Ask bar together. Everything below it sits on light sea-ice.

**Graft from** variant `07c74208…`: a recognisable Antarctica outline (with the peninsula), and the facts stated inline in one sentence instead of stat cards.

**Spend boldness in one place.** The only loud element is the hero map. It is a south-polar-stereographic Antarctica ringed by **45 expedition ticks** (1981 to 2026), with Maitri and Bharati at their real coordinates. The 45th tick is orange and labelled "45th expedition, underway". Everything else stays quiet.

## Tokens (starting point, design system may refine with contrast proof)
| Token | Hex | Role |
|---|---|---|
| polar-night | `#0F2436` | text, hero and footer background |
| sea-ice | `#EEF3F6` | page background |
| snow | `#FFFFFF` | raised surfaces |
| glacier | `#5B8BA8` | secondary, map ice, links on dark |
| expedition-orange | `#E4572E` | **only** accent: primary action, citation markers, station pins, "underway" |
| rule | `#D3DEE6` | 1px borders |

- The orange comes from polar parkas and ship hulls, and it rhymes with saffron. Never use it as a large fill.
- No gradients, no aurora glows, no purple.

## Type
- **Anek** (Ek Type, OFL) for display and UI, using the script-matched cuts: Anek Latin / Devanagari / Tamil / Bangla / Telugu / Kannada / Malayalam / Gujarati / Gurmukhi / Odia. Headlines use the condensed width axis.
- **Noto Sans** (plus per-script Noto) for body and as the fallback for scripts Anek lacks: Ol Chiki, Meitei Mayek, Perso-Arabic (Urdu, Kashmiri, Sindhi, which are RTL), and others.
- Stitch's font enum has no Anek. **In Stitch mocks only**, use the closest condensed sans for headings and NOTO_SANS for body. The build uses Anek.
- Indic scripts need about 1.6–1.75 line-height for body text. Latin uses 1.5.

## Keep
- GIGW utility bar: skip link, A- / A / A+, high-contrast toggle, language switch with a one-tap हिन्दी.
- Ask bar with a mic and an orange "Ask / पूछें" button, plus example chips in three scripts.
- Station facts: established year and coordinates in degrees.
- Footer mandatory links: Help, Feedback, Accessibility statement, Privacy, Terms, Sitemap, and the last-updated date.

## Kill (seen in the probes, all generic tells or scope creep)
- Big-number stat cards ("44 / 36 / 100%"). Use one inline sentence instead.
- ALL-CAPS eyebrow labels ("SCIENTIFIC RECORDS", "PERMANENT BASES").
- Monospace for data labels (`[NCPOR-BIO-2026]`, `Est. 1989`).
- Three identical rounded cards per section. Give stories an editorial lead + list layout, and show stations as a comparison strip.
- Invented nav names ("Observatory", "Dispatches", "Knowledge Engine"). The nav is **Ask, Explore, Archive, Expeditions, For schools**.
- "Live telemetry" and "station status" features. They are not in scope.
- `→` appended to every link.
- **Any official branding.** No national emblem, no NCPOR/MoES logo, no "© NCPOR, all rights reserved". Header subtitle: "Polar knowledge portal (concept)". Footer: "Concept design for Smart India Hackathon 2026 by Team Claude Can Code. Not an official NCPOR website."

## Stitch API notes (for whoever generates screens)
- Use `node design/stitch/stitch.mjs …`, not the stitch MCP tools: their `get_screen` wrapper is broken in v1.0.7.
- Project `15456917565346686486`. Generation takes 1–3 minutes per screen. Do not retry on timeout; poll `get` instead.
