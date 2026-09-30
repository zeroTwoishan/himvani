# HIMVANI: Compliance, Accessibility, and What SIH Judges Reward

> Research brief for PS 26063 (NCPOR / MoES). Checked against live sources on **30 Sep 2026**. "MUST" means a GIGW mandatory checkpoint, "SHOULD" means advisory. Links are reference-style, so each one shows inline where it is used.

## TL;DR

- **The rules that shape our UI are GIGW 3.0 and DBIM together.** GIGW 3.0 has 88 checkpoints: 25 quality, 50 accessibility (WCAG 2.1 AA), 3 security and 10 lifecycle ([GIGW summary][gigw-ppt]). The Feb 2025 DBIM adds binding visual rules on top: the Noto Sans font, one colour group, a fixed header and footer, and a header bar with skip, language and accessibility controls ([DBIM §4.1, 5.4, 5.6][dbim]). STQC certifies both, each for 3 years with yearly surveillance audits ([CQW][stqc-wqc], [DBIM cert][stqc-dbim]).
- **Kids + an Ask box means DPDP.** Under DPDP, a "child" is anyone under 18. Before processing any child's personal data we need verifiable parental consent, and tracking children or targeting ads at them is banned outright ([s.9][dpdp-s9], [Rule 10][dpdp-rules]). Most of the Rules take effect on **13/14 May 2027** ([Rule 1(4)][dpdp-rules]). The simplest fix is to make Ask **anonymous and account-free**, so no child's data is collected and parental consent never comes up.
- **One log-retention rule satisfies both regimes.** CERT-In requires 180 days of ICT logs, clocks synced to NIC/NPL time servers, and incident reports within 6 hours ([Directions][certin-dir]). DPDP Rules 6 and 8(3) require logs to be kept for **1 year** ([Rules][dpdp-rules]). Keeping security logs for 1 year, stored in India, covers both.
- **The AI-labelling law covers images, audio and video, not text.** The IT Amendment Rules 2026 (in force since 20 Feb 2026) require labels and metadata on synthetic audio and visual content, and they explicitly exclude text ([Freshfields][it26-ff]). Text drafts from Studio are therefore outside the rule. Any AI image or voiceover posted to X, YouTube or Instagram must be declared and labelled.
- **SIH 2026 finalists are judged on 9 official criteria, and a working prototype is mandatory.** The criteria are novelty, complexity, clarity, feasibility, practicability, sustainability, impact, UX and future potential ([SIH 2026 guidelines][sih26]). 4–5 teams per PS reach the finale and NCPOR may decline to name a winner ([SIH 2026 guidelines][sih26]). PS 26063 had **116 of 500** idea slots filled when checked ([PS list][sih-ps]). Showing a real compliance-and-deployment story is how we beat the other finalists on feasibility.

---

## 1. GIGW 3.0: checkpoints that hit the HIMVANI UI

### 1.1 How GIGW 3.0 works

| Fact | Detail | Source |
|---|---|---|
| Authors | NIC with STQC and CERT-In, 2023; renamed "…Websites **and Apps**" | [GIGW manual][gigw] |
| Size | 88 guidelines: Quality 25, Accessibility 50, Security 3, Lifecycle 10 | [GIGW summary][gigw-ppt], [Handbook][hb] |
| Levels | MUST (mandatory), SHOULD (advisory), MAY (voluntary) | [GIGW summary][gigw-ppt] |
| Accessibility baseline | WCAG 2.1 Level AA (upgraded from 2.0; 17 new criteria) | [New features][gigw-new] |
| Security | CERT-In chapter based on OWASP Top 10, ASVS, ISO 27001 and CIS; a **"safe to host"** certificate is required | [New features][gigw-new] |
| Owner role | A Web Information Manager (WIM) of **at least Joint Secretary rank**, whose contact details appear on the site | [GIGW 5.4.1][gigw] |
| Certification | STQC **Certified Quality Website (CQW)**, valid **3 years**, with annual and surprise surveillance audits | [STQC WQC][stqc-wqc] |
| Documents | Website Quality Manual (WQM), VA reports, network architecture, security clearance | [STQC WQC][stqc-wqc], [Handbook §4][hb] |

### 1.2 Checkpoint → HIMVANI implementation

| GIGW | Requirement | HIMVANI implementation |
|---|---|---|
| [5.1.1][gigw] | Government association shown through an emblem or logo in the correct ratio and colour on the homepage | DBIM logo lockup in the header. The prototype uses a placeholder (see §6.4) |
| [5.1.2][gigw] | Ownership shown on every important page; each page stands alone | Footer: "Owned by NCPOR, MoES" on every route |
| [5.1.3][gigw] / [5.1.4][gigw] | Source named for third-party documents; permission obtained before republishing copyrighted work | `source`, `rights_holder` and `permission_ref` are **required** metadata fields; publishing is blocked if any is empty |
| [5.1.5][gigw] | **Last updated/reviewed date** on the homepage and every important entry page | `updated_at`/`reviewed_at` in the footer of each page, taken from the CMS |
| [5.1.6][gigw] | Every download shows title, size, format and usage instructions | Download chip, e.g. "PDF · 4.2 MB · English · opens in viewer" |
| [5.1.8][gigw] | Outdated news and announcements moved to archives | A job enforces the Content Archival Policy |
| [5.1.9][gigw] / [5.1.10][gigw] | About Us page; Contact Us page with key officials, linked from the homepage | `/about` and `/contact` routes |
| [5.1.11][gigw] | Feedback collected through online forms, with a mechanism to respond in time | `/feedback` form, a ticket ID, and an SLA shown to the user |
| [5.1.12][gigw] | Prominent link to the National Portal (india.gov.in), opening in a **new window** | Footer link with `target=_blank` and a "(opens in new tab)" label |
| [5.1.13][gigw] | Hindi and regional fonts tested across browsers; Unicode only | Screenshot tests per script in CI (Playwright) |
| [5.1.14][gigw] | **Help** section linked from **every** page, in a consistent position | Help link in the header utility bar |
| [5.1.15][gigw]–[5.1.17][gigw] | Responsive CSS; readable without CSS; page title, `lang` and meta tags present | Semantic HTML first, then Tailwind; `<html lang>` set per locale |
| [5.1.18][gigw] | Minimum homepage content: organisation name, emblem, About, major modules, services, Contact, Feedback, National Portal, **Search/Site Map**, Terms. Every other page: title, Home link, parent link, owner, Contact | Home template plus a CI check against this list |
| [5.1.19][gigw] / [5.1.20][gigw] | Data tables marked up correctly; pages print on A4 | `<th scope>` on tables; a `@media print` stylesheet |
| [5.1.21][gigw] | Domain must be gov.in or nic.in; research institutes may use **res.in** | Production target: `himvani.ncpor.res.in` |
| [5.1.22][gigw] | API integration with India Portal, DigiLocker, Aadhaar, SSO, MyGov, Data Platform and MyScheme | Push datasets to data.gov.in; staff SSO through [Parichay][parichay] |
| [5.1.23][gigw] | Consistent UX and visual identity across the organisation's sites | DBIM tokens (§1.5) |
| [5.1.24][gigw] | **Two-way** social media integration: push from the site to platforms **and** show social content on the site | Studio pushes; portal shows an "@NCPOR on X/YouTube" feed |
| [5.1.25][gigw] | No spelling or grammar errors | Studio lint step (Hindi and English) before review |
| [5.3.1][gigw] | **Security audit clearance** from NIC, STQC or a CERT-In-empanelled auditor **before production**; re-audit at least yearly or on any code change | Budgeted and scheduled in the go-live plan (§5.3) |
| [5.3.2][gigw] | Hosting inside India; high availability and DR drills at least yearly; WAF; VA/PT; **logs kept for a rolling 180 days**; HTTPS + HSTS; SFTP only; container hardening | MeghRaj deployment (§5) |
| [5.3.3][gigw] | Approved Security Policy, Privacy Policy and Contingency Management Plan | Policy pages (§1.3) |
| [5.4.2][gigw] | Site URL printed on all stationery and ads | Studio adds the URL to every post template |
| [5.4.3][gigw] | 10 policies approved by the WIM (§1.3) | MDX templates from the NIC handbook |
| [5.4.4][gigw] | Hyperlinks checked; clear indication when a link leaves for a non-government site | "External site" icon plus a nightly link-checker |
| [5.4.5][gigw] | Moderation keeps content free of offensive or discriminatory language | Toxicity filter in Studio and in Ask outputs |
| [5.4.6][gigw] | **Pages in multiple languages updated simultaneously** | Publishing an update fans out to every locale; a stale-translation badge flags any lag (see Corrections) |
| [5.4.7][gigw] / [5.4.8][gigw] | No broken links, 404s or "under construction" pages | CI link check; unfinished routes return 404 instead of a stub |
| [5.4.9][gigw] | Documents in HTML or another accessible format; accessible versions of scans | OCR output becomes an HTML reading view next to each scanned PDF |
| [5.4.10][gigw] | **Site is bilingual**, with a prominent language link, Unicode, and a language choice offered **before entering** (e.g. a pop-up) | Language picker on first visit (36 locales), remembered in an essential cookie |

### 1.3 The 10 mandatory policies (GIGW 5.4.3), with templates in the NIC handbook

| Policy | Key content (from the [Handbook §5.4.3][hb]) | Public page? |
|---|---|---|
| Copyright | Three variants: liberal, moderate, conservative. Departments "should aim to have a liberal" policy | Yes, `/copyright` |
| CMAP (Content Contribution, Moderation & Approval) | Documented workflow plus an **audit trail showing who approved each item and when**. Two tiers (Contributor → Moderator/Approver) or three tiers (Contributor → Moderator → Approver/WIM) | Internal, reflected in Studio |
| CAP (Archival) | How long content stays online, when it moves to offline archive, and when it is purged | Yes |
| CRP (Content Review) | Review period per section (e.g. home daily, news daily) | Yes (recommended) |
| Hyperlinking | Not responsible for external sites; others may link to us without permission; **no framing of our pages** | Yes, `/hyperlink-policy` (send `frame-ancestors 'none'`) |
| Terms & Conditions | Ownership, usage, legal disclaimer, jurisdiction of Indian courts | Yes, `/terms` |
| Privacy Policy | MUST be prominent when personal information is collected; states purpose and any disclosure | Yes, `/privacy` (must also meet DPDP, §3) |
| Website Monitoring Plan | Performance, availability and download-speed monitoring | Internal |
| Contingency Management Plan | Defacement, data loss and outage response | Internal (feeds the §4 runbook) |
| Security Policy | Must be defined and approved | Yes (summary) |

### 1.4 "Expected" elements that are not numbered GIGW checkpoints

| Element | Status | Evidence |
|---|---|---|
| Skip to main content | **MUST** through GIGW [5.2.27][gigw] (bypass blocks) **and** the DBIM header, which requires skip, language and accessibility controls on every header variant | [GIGW 5.2.27][gigw], [DBIM §5.4][dbim] |
| Text resize (A-/A/A+) | GIGW needs 200% zoom without assistive tech ([5.2.15][gigw]); browser zoom alone passes. A widget is expected under DBIM's "accessibility controls" | [DBIM §5.4, Fig 44][dbim], [data.gov.in header][ogd] |
| High contrast | [5.2.14][gigw] requires 4.5:1 contrast; the evaluator checks "whether 'high contrast mode' is available" | [GIGW 5.2.14][gigw] |
| Sitemap | Required on the homepage by [5.1.18(i)][gigw]; the DBIM footer requires one "with at least 2 levels" | [DBIM §5.6][dbim] |
| Accessibility statement / screen-reader access page | Not a GIGW checkpoint. It is standard on NIC platforms and its absence is a top-10 audit failure according to a vendor | [data.gov.in footer][ogd], [AccessSure (vendor)][accesssure] |
| Help: FAQs, screen-reader access, certificates | DBIM footer MUST | [DBIM §5.6][dbim] |

### 1.5 DBIM (Digital Brand Identity Manual, MeitY, launched 18 Feb 2025; [PIB][dbim-pib]) rules that bind our design

| DBIM rule | HIMVANI token/decision | Source |
|---|---|---|
| **Noto Sans** is the main typeface and must be used for every Indic script | `--font-sans: "Noto Sans", "Noto Sans Devanagari", "Noto Sans Tamil"…` | [DBIM §4.1–4.2][dbim] |
| Pick exactly **one colour group** from the primary palette; applies to digital platforms only | One polar-blue group; gradients only within that group | [DBIM §2.1][dbim] |
| Functional palette: page background #FFFFFF, text #150202, links #0D6EFD, success #198754, warning #FFC107, error #DC3545 | Semantic tokens copied exactly | [DBIM §2.2][dbim] |
| Header: fixed search, user controls (skip, language, accessibility) and global navigation. Header 2 is for organisations allowed to use the State Emblem; Header 3 for those that are not | NCPOR is an autonomous body, so Header 3 is likely; **confirm with NCPOR** | [DBIM §5.4][dbim] |
| Footer MUST include: Website Policies, Sitemap (2 or more levels), Related Links, Help, Feedback, **Last Updated On**, in the key (darkest) colour | Footer component | [DBIM §5.6][dbim] |
| Icons: one style only (line **or** filled), PNG/WEBP/SVG, fixed sizes; logos under 100 KB | Lucide in line style, re-exported as SVG | [DBIM §3, 5.5][dbim] |
| Cookies: essential cookies (language, accessibility, consent) need no consent; analytics and social cookies need consent; no pre-ticked boxes; data stored in India | Consent banner offers "Essential only" by default | [DBIM §7.6][dbim] |
| Documents uploaded as **accessible PDFs** | PDF/UA check in the ingest pipeline | [DBIM §7][dbim] |
| Social posts: subtitles on **every** video, alt text on **every** image, **2–3 hashtags max**, **2–3 emojis max**, contrast-checked text on images, "no personalised information". Listed Don'ts include **"Automate everything"** | Studio lint rules; human approval stays mandatory | [DBIM §C.4.2, C.8][dbim] |
| Apps: English **and Hindi** required; offline sync "wherever possible"; **CERT-In-approved security audit**; hosted on the Gov.In App Store (Play and App Store optional) | Field app (PWA) plan | [DBIM §D.1, D.2][dbim] |
| Certification | STQC DBIM Compliance Certificate: 3 years with annual surveillance; STQC lab fee ₹3.5 lakh deposited in advance | [STQC DBIM][stqc-dbim] |

### 1.6 Field app (offline upload)

GIGW 3.0 applies to "websites/apps". Its checkpoints use "homepage/homescreen" throughout, and developers are told to follow OWASP ASVS and the mobile standard (the manual writes "MAVS") ([GIGW 5.3.1][gigw]). DBIM adds four requirements: English+Hindi, offline sync, a CERT-In-approved audit, and Gov.In App Store hosting ([DBIM §D][dbim]). **Decision: ship the field app as a PWA** (installable, offline-first). It is one codebase, and it still needs a CERT-In audit before any production build.

---

## 2. Accessibility: WCAG 2.1/2.2 AA, IS 17802 and the legal chain

### 2.1 Legal chain

| Instrument | What it does | Source |
|---|---|---|
| RPwD Act 2016 + Rule 15 | Every establishment must meet accessibility standards for ICT | [SCC Online][rpwd23-scc] |
| RPwD (Amendment) Rules 2023 (May 2023) | Makes **IS 17802 Parts 1 & 2** the standard for websites, apps and ICT services | [Gazette][rpwd23], [SCC Online][rpwd23-scc] |
| IS 17802-1:2021 / -2:2022 | Technical adoption of **EN 301 549 v3.2.1**, adapted for the RPwD Act and Indian official languages | [IS 17802-1][is17802] |
| *Rajive Raturi v. UoI* (SC, 8 Nov 2024) | Held Rule 15(1) ultra vires for treating recommendatory guidelines as sufficient; told the Union to frame mandatory rules | [Judgment][raturi] |
| *Amar Jain v. UoI* (SC, 30 Apr 2025) | Recognised the **right to digital access** as part of Article 21; ordered accessible e-KYC and periodic accessibility audits | [Case note][amarjain] |
| GIGW 3.0 | Requires WCAG **2.1** AA (50 checkpoints, 5.2.1–5.2.50) | [GIGW][gigw] |
| WCAG 2.2 | W3C Recommendation since 5 Oct 2023; approved as **ISO/IEC 40500:2025** on 21 Oct 2025; adds 9 criteria and drops 4.1.1 | [W3C new-in-2.2][wcag22], [W3C ISO news][wcag22-iso] |
| WCAG 3 | Still a Working Draft (10 Sep 2026); not a target | [W3C][wcag3] |

**Target: WCAG 2.2 AA.** It includes everything in 2.1 AA except 4.1.1 (removed), so it satisfies GIGW and IS 17802. Vendors report that STQC reviewers already check "Focus Not Obscured" and "Target Size" ([AccessSure, vendor][accesssure]).

### 2.2 Success criteria most likely to fail on HIMVANI

| SC | Why it bites HIMVANI specifically | Implementation |
|---|---|---|
| 1.1.1 Non-text content ([GIGW 5.2.1][gigw]) | Thousands of expedition photos | CLIP/VLM drafts the alt text; a human approves it; the image can't be published until it does |
| 1.2.2 Captions ([5.2.3][gigw]) | Station videos | Whisper produces captions, which are edited in Studio; WebVTT for each language |
| 1.2.3 / **1.2.5 Audio description, level AA** ([5.2.4][gigw], [5.2.6][gigw]) | AA requires audio description for pre-recorded video, which most media portals skip | An LLM drafts an AD script from keyframes and transcript; a human reviews it; published as a text-alternative track |
| 1.3.1 Info & relationships | Metadata tables and dataset cards | Semantic `<dl>`/`<table>` markup |
| 1.4.3 / 1.4.11 Contrast (4.5:1 text, 3:1 UI) ([5.2.14][gigw], [5.2.18][gigw]) | Map markers on white ice imagery | Outlined markers; tokens validated in CI |
| 1.4.4 Resize 200% / 1.4.10 Reflow at 320 px | Sidebar layouts in Explore | Single-column layout at 320 px |
| 1.4.12 Text spacing | Indic scripts clip at tight line-heights | `line-height ≥ 1.6` for Indic locales |
| 2.1.1 Keyboard / **2.5.7 Dragging (2.2)** | The CesiumJS globe is drag-only | Button controls for pan and zoom, plus a **list view** alternative for every map |
| 2.2.2 Pause/Stop/Hide | Hero carousels (also a common vendor-reported fail) | No auto-advance, or a visible pause control |
| 2.4.1 Bypass blocks ([5.2.27][gigw]) | Long navigation | Skip link as the first focusable element |
| **2.4.11 Focus Not Obscured (2.2)** | Sticky DBIM header | `scroll-padding-top` equal to the header height |
| **2.5.8 Target Size, 24×24 (2.2)** | Language chips, citation superscripts | Minimum 24 px hit area on citation markers |
| 3.1.1 / 3.1.2 Language of page / parts | Answers mix Tamil text with English citations | `lang` attribute on every answer block and every citation |
| **3.3.8 Accessible Authentication (2.2)** | Studio login | SSO/passkey; no cognitive CAPTCHA |
| 4.1.3 Status messages ([5.2.50][gigw]) | Streaming Ask answers | `aria-live="polite"` region; announce "answer ready, 2 sources" |
| 2.3.1 Three flashes | Aurora and blizzard footage | Flash check at ingest |

Test like the auditors do: NVDA/JAWS on desktop and TalkBack/VoiceOver on mobile ([AccessSure, vendor][accesssure]), plus axe-core in CI.

---

## 3. DPDP Act 2023 + DPDP Rules 2025

### 3.1 Timeline

| Date | What commences | Source |
|---|---|---|
| G.S.R. 846(E) dated 13 Nov 2025 (gazetted 14 Nov 2025) | Rules 1, 2, 17–21: definitions and the Data Protection Board | [Rules r.1(2)][dpdp-rules], [Timeline][dpdp-timeline] |
| Nov 2026 (+1 yr) | Rule 4: consent managers | [Rules r.1(3)][dpdp-rules] |
| **May 2027 (+18 mo)** | Rules 3 and 5–16 (notice, security, breach, retention, **children**), 22, 23 | [Rules r.1(4)][dpdp-rules] |
| Jan 2026 | MeitY **proposed** cutting the timeline to 12 months for SDFs. This is a proposal, not law, as of this check | [Mondaq][dpdp-12m] |

The finale demo (Dec 2026) and the 12-week pilot come before May 2027. **Design to the full rules anyway**, because retrofitting consent later costs more.

### 3.2 Obligations → HIMVANI surface

| Obligation | Rule text (short) | HIMVANI design |
|---|---|---|
| Notice ([Rule 3][dpdp-rules]) | Standalone and in plain language: an itemised list of the data, the purpose, a link to withdraw consent "with ease comparable" to giving it, how to exercise rights, and how to complain to the Board | A short notice component on the Feedback, Studio signup and field-app screens |
| Notice languages ([s.5(3)][dpdp-s5]) | Data principals can read the notice in English **or any Eighth Schedule language** | Notice available in English + 22 scheduled languages (human-verified; not machine output alone) |
| Contact / DPO ([s.8(9)][dpdp-s8], [Rule 9][dpdp-rules], [s.10][dpdp-s10]) | Publish contact details of a DPO **only if a Significant Data Fiduciary**; otherwise a person who can answer questions | NCPOR is unlikely to be designated an SDF. Name a "Grievance/Privacy contact" on `/privacy` |
| Security ([Rule 6][dpdp-rules]) | Encryption or masking, access control, **logs, monitoring and review**, backups; **keep logs for 1 year** | §4 logging design |
| Breach ([Rule 7][dpdp-rules]) | Tell each affected person "without delay"; tell the Board without delay, with a detailed report **within 72 h** | A single runbook with the CERT-In 6-hour report (§4) |
| Retention ([Rule 8(3)][dpdp-rules]) | Keep personal data, traffic data and processing logs for **at least 1 year**, then erase | Feedback PII kept 1 year, then purged |
| **Children** ([s.9][dpdp-s9], [Rule 10][dpdp-rules]) | Child = under 18. **Verifiable parental consent** before processing, by checking the parent is an identifiable adult (existing records, self-declared details, or a DigiLocker-type token). **No tracking, behavioural monitoring or targeted ads directed at children**. Nothing likely to harm a child's well-being | **Ask has no accounts, no history and no personalisation.** Kids pages use no analytics cookies |
| Child exemptions ([Fourth Schedule][dpdp-rules]) | Part B: accounts used only for email; blocking content harmful to children; confirming a user is not a child. Part A: educational institutions (tracking limited to their own educational activities) | Filtering unsafe content for children is covered by exemption B-5. **HIMVANI is not an "educational institution"**, so don't rely on Part A |
| Research/archiving ([Rule 16][dpdp-rules]) | The Act doesn't apply to processing needed for research, archiving or statistics, **if** done to Second Schedule standards (lawful, minimal, accurate, secure) | This covers the **internal archive** of expedition photos. **Publishing them for outreach** is not archiving, so it needs consent (§6.3) |
| Publicly available data ([s.3(c)(ii)][dpdp-s3]) | Excluded only if the data principal made it public, or someone legally obliged to publish it did | Scraping social media does **not** qualify, so the RAG corpus stays NCPOR-owned sources only |
| Penalties ([Schedule][dpdp-sched]) | Up to ₹250 cr for failed security safeguards; ₹200 cr for breach-notice failures; ₹200 cr for children's-data violations | The risk register cites these |

### 3.3 Ask box pattern (DPDP-safe for kids)

| Data | Collected? | Why / control |
|---|---|---|
| Account, name, age | **No** | Without identity we never process a child's personal data, so parental consent under Rule 10 doesn't arise |
| Query text | Yes | A PII scrubber (regex + NER for names, phones, emails, Aadhaar-like numbers) redacts before storage; a hint under the box says "Don't type your name or phone" |
| IP address | Security logs only | Needed for CERT-In/DPDP security logging (§4). Never joined with query analytics; rate-limit keys are salted hashes that rotate daily |
| Session history | No server-side history | A per-tab `sessionStorage` thread only |
| Analytics | Aggregates only, self-hosted, no fingerprinting | No behavioural profiles, since s.9(3) bans tracking children and we can't tell which visitors are children |

---

## 4. CERT-In Directions (28 Apr 2022) → logging design

| Direction | Requirement | HIMVANI design | Source |
|---|---|---|---|
| (i) Time | Sync **all** ICT clocks to NIC or NPL NTP servers (or sources traceable to them) | chrony → `samay1.nic.in`, `samay2.nic.in`, `time.nplindia.org`. Log in **UTC with the time zone recorded** (IST not required) | [Directions][certin-dir], [FAQ Q on IST + server list][certin-faq] |
| (ii) Reporting | Report Annexure I incidents to CERT-In **within 6 hours** of noticing them | Pager rota; a pre-filled report template. Relevant Annexure I types: website defacement, unauthorised access, data breach, data leak, **unauthorised access to social media accounts**, attacks on cloud, **attacks on AI/ML systems** | [Directions Annex I][certin-dir] |
| (iii) PoC | Name a Point of Contact for CERT-In (Annexure II format) | NCPOR ICT officer, recorded in the Contingency Plan | [Directions][certin-dir] |
| (iv) Logs | Keep logs of **all ICT systems** securely for a **rolling 180 days**, "within the Indian jurisdiction" | Keep **365 days** (covers DPDP's 1 year) on WORM object storage in India. Log types: firewall, WAF, web, DB, app, SSH, VPN (FAQ list) | [Directions][certin-dir], [FAQ Q37][certin-faq] |
| (v) Cloud KYC | CSPs keep subscriber KYC for 5 years | Applies to the CSP, not to us | [Directions][certin-dir] |
| GIGW overlap | Logs kept 180 days; web logs audited periodically; DB audit trail; incidents reported to NIC-CERT and CERT-In | Same pipeline | [GIGW 5.3.1–5.3.2][gigw] |
| Annual audit | CERT-In Comprehensive Cyber Security Audit Policy Guidelines (25 Jul 2025): audit ICT **at least once a year** | Budget a yearly audit | [CERT-In audit policy][certin-audit] |
| SBOM/AIBOM | CERT-In BOM Technical Guidelines v2.0 (9 Jul 2025) cover SBOM, AIBOM, CBOM and more; advisory, not mandatory | Publish a CycloneDX SBOM and an AIBOM (Whisper, CLIP, LLM, datasets) | [CERT-In BOM v2.0][certin-bom] |

**Log tiers (one retention rule):**

| Tier | Content | Retention | Store |
|---|---|---|---|
| Security | Access, WAF, auth, admin actions, IPs | 365 days rolling | India, WORM, SIEM-readable |
| Content audit (CMAP) | Who drafted, edited, approved and published what, and when | Per the archival policy (long-lived) | Postgres append-only table plus a hash chain |
| Ask analytics | De-identified query text, language, citations shown, feedback score | 1 year, then aggregates only | Postgres, separate schema |

---

## 5. MeghRaj / NIC cloud

### 5.1 What exists (Sep 2026)

| Offering | What it gives us | Source |
|---|---|---|
| GI Cloud "MeghRaj" | The umbrella initiative. **2,170** ministries/departments host cloud apps on it | [PIB 12 Dec 2025][pib-cloud] |
| MeitY-empanelled CSPs | **26** CSPs, audited by STQC against ISO 27001/27017/27018/20000 and listed on AMBUD | [PIB][pib-cloud], [AMBUD][ambud] |
| NIC National Cloud | 4 National DCs + 24 mini DCs. Catalogue: web/app/DB servers, load balancer, backup, public IPv4/IPv6, **containers**, WAF, VA, APM | [cloud.gov.in][nic-cloud] |
| NIC AI services | AI Panini (translation, 22 languages), AI Shruti (streaming ASR in 9 languages), AI Saransh (summarisation), VANI (chatbots), and others | [cloud.gov.in][nic-cloud], [NIC @ AI Summit][nic-ai], [TelecomTalk][nic-ai2] |
| NICSI National Government Cloud (NGC) | Tier I: VMs, **object and block storage**, VPC, RDBMS. Tier II: **production GPU VMs**, managed DB, CDN. Tier III: **Kubernetes**, HSM/KMS, SIEM/SOAR, AI/ML platforms | [NICSI][nicsi] |
| MeghRaj 2.0 (AWS Outposts in NIC DCs, with Yotta; 17 Feb 2026) | EKS, RDS, S3 and GenAI inside NIC facilities | [Yotta][yotta] |
| IndiaAI compute | **38,000+ GPUs at ₹65/GPU-hour** for startups, academia and public institutions | [PIB][indiaai-gpu], [PIB AI backgrounder][aigg-pib] |

### 5.2 HIMVANI mapping

| Component | Target service |
|---|---|
| Next.js + FastAPI | NCCaaS containers (NIC) or NGC Tier III Kubernetes |
| PostgreSQL 16 + pgvector | NIC DB server VM (pgvector is an extension, so managed DBs may not ship it; **verify**) |
| Object store (media, logs) | NGC Tier I object storage, or MinIO on NIC VMs |
| Whisper / CLIP / LLM inference | NGC Tier II GPU VMs, or IndiaAI compute for batch enrichment |
| Translation | Bhashini (primary), AI Panini (fallback) |

### 5.3 Before go-live (all MUST)

1. CERT-In-empanelled **security audit clearance ("safe to host")** ([GIGW 5.3.1][gigw]).
2. Hosting in India, with high availability, DR and a yearly DR drill ([GIGW 5.3.2][gigw]).
3. WAF, VA/PT, HSTS, SFTP only, least-privilege service accounts ([GIGW 5.3.2][gigw]).
4. Security, Privacy and Contingency policies approved ([GIGW 5.3.3][gigw]).
5. STQC CQW (GIGW), then STQC DBIM certification ([STQC WQC][stqc-wqc], [STQC DBIM][stqc-dbim]).

---

## 6. Open data, licensing and image rights

### 6.1 Instruments

| Instrument | Key terms | Source |
|---|---|---|
| NDSAP (2012) | Open-by-default for non-sensitive data produced with public funds; a negative list of exclusions; data.gov.in is the platform | [NDSAP][ndsap] |
| GODL-India (gazetted Feb 2017) | Worldwide, royalty-free, non-exclusive right to use, adapt and publish, commercially too. **Excludes** personal information, sensitive data, official symbols, logos and crests, IP-protected items, and ID documents. Rights end on breach, and are restored if cured within 30 days | [GODL][godl], [NDSAP][ndsap] |
| GODL attribution format | `[Provider], [Year], [Name of Data], [Repository], [Version/Date], [DOI/URL]. Published under [License]: [URL]` | [GODL][godl] |
| Copyright Act s.17 | Author is the first owner; **(b)** commissioned photos belong to the commissioner; **(c)** the employer owns employee work; **(d)** the Government owns Government works | [s.17][copyright17] |
| GIGW copyright policy | Templates in 3 variants; departments "should aim" for **liberal** reuse with attribution | [Handbook 5.4.3a][hb] |
| CC BY 4.0 | Attribute with TASL (Title, Author, Source, License) placed next to the work | [CC wiki][cc-attr] |
| State Emblem Act 2005 | Using the emblem, or anything resembling it, to suggest a Government connection **without permission** is prohibited | [India Code][emblem] |

### 6.2 HIMVANI licence matrix (default per asset type)

| Asset | Default licence | Notes |
|---|---|---|
| Datasets (with NPDC) | **GODL-India** + DOI | Attribution string generated automatically in the GODL format |
| Reports and text | GODL-India | CC BY 4.0 on request for OER reuse |
| NCPOR photos and video | **CC BY 4.0** + credit ("Photo: Name, NCPOR/ISEA-45") | Only where the Govt or NCPOR owns the work under s.17(c)/(d). Staff seconded from other institutes (IMD, GSI, armed forces) get a `rights_holder` check |
| Third-party material | As received | Permission reference required by [GIGW 5.1.4][gigw] |
| Logos, emblem, insignia | All rights reserved | GODL excludes them explicitly |

### 6.3 People in photos

- A photo of an identifiable person is personal data. Publishing it for outreach needs a lawful basis, and Rule 16's archiving exemption doesn't stretch to promotional use ([Rule 16][dpdp-rules]).
- Minors (e.g. school outreach events) trigger **verifiable parental consent** under s.9 ([s.9][dpdp-s9]).
- Courts are actively enforcing personality rights against AI misuse of likeness ([Delhi HC orders, 2025][persona]).
- **Pipeline:** face detection only (no face *recognition*) flags every photo containing people. Adults need a signed release on file (`consent_ref`). Minors are blurred unless a parental consent record exists. Studio blocks publishing while the flag is unresolved.

### 6.4 The prototype itself

Don't use the State Emblem or present the prototype as an official NCPOR site. Add a "SIH 2026 prototype" banner ([Emblem Act][emblem]).

---

## 7. Government social media: official posting and approval chains

| Topic | Rule | Studio implementation | Source |
|---|---|---|---|
| DeitY Framework & Guidelines (23 Aug 2012) | Six elements: Objective, Platform, Governance, Communication strategy, Pilot, Institutionalisation. Deals with who is **authorised to speak** for the department, and compliance with the IT Act and RTI Act | Role-based "authorised poster" list | [PIB 2012][sm-pib] |
| Same framework | Use the same handle on every platform; keep an **official record of login IDs and passwords**; state response turnaround up front; post existing information, not unverified claims; plan for archival and records | Credential vault (not personal logins); a response SLA shown on each channel bio | [MediaNama][sm-mn], [ALG][sm-alg] |
| GIGW CMAP | A documented approval audit trail for every item | Contributor (scientist/outreach) → Moderator (science accuracy) → Approver (PRO/WIM delegate). Every approval is logged with who and when | [Handbook][hb] |
| DBIM social media | Subtitles, alt text, hashtag and emoji caps, contrast; content only from official Govt sources; **Don't "automate everything"** | Lint before review; **no auto-posting without human approval** | [DBIM §C][dbim] |
| CERT-In | "Unauthorised access to social media accounts" must be reported within 6 hours | OAuth tokens in a vault, MFA on every handle, token-use audit | [Directions][certin-dir] |
| IT Rules 2026 | Significant social media intermediaries (SSMIs: X, YouTube, Instagram) must collect a **declaration from the user** on whether content is synthetic (SGI) | A "Contains AI-generated media" toggle is sent with each upload | [Freshfields][it26-ff] |

---

## 8. AI governance and labelling

| Instrument | Status (30 Sep 2026) | What it means for HIMVANI | Source |
|---|---|---|---|
| India AI Governance Guidelines (MeitY) | Unveiled 5 Nov 2025; PIB backgrounder 15 Feb 2026. **Principles only, not binding.** 7 sutras: Trust is the Foundation; People First; Innovation over Restraint; Fairness & Equity; Accountability; Understandable by Design; Safety, Resilience & Sustainability | "Understandable by design" is met by citations and an "AI-drafted, human-verified" badge. The guidelines recommend content-authentication standards, human oversight, grievance redressal and an AI incident database | [PIB][aigg-pib], [Chambers][aigg-ch] |
| IT (Intermediary…) Amendment Rules 2026, G.S.R. 120(E) | Notified 10 Feb 2026, **in force 20 Feb 2026** | SGI = **audio, visual or AV** content made to look real. **Text is excluded**, as are good-faith edits, documents and accessibility tools. Visible labels, audio prefixes and **non-removable metadata/identifiers**. SSMIs collect declarations. Takedowns in 3 h (2 h for NCII/deepfakes) | [Freshfields][it26-ff], [Lexology][it26-lex], [Khaitan][it26-kh] |
| Who carries the obligation | Obligations fall on **intermediaries**. HIMVANI publishes NCPOR content and hosts no user uploads, so it is a publisher | Legally we must declare SGI on upload to SSMIs. **Label anyway** on our own site | [Freshfields][it26-ff] |
| MoF advisory (29 Jan 2025) | Advised officials against using ChatGPT/DeepSeek on office devices because of confidentiality risk | Use self-hosted open-weights models on Indian infrastructure; no foreign SaaS LLM in the data path | [Inc42][mof] |
| C2PA 2.2 (May 2025) | Signed provenance manifests plus soft-binding watermarks | Attach C2PA manifests to any AI-assisted image or video that Studio exports | [C2PA 2.2][c2pa] |

**Studio labelling policy:**
1. Every draft has an `ai_assisted: true` flag and a `verified_by` field.
2. Public pages show "AI-assisted draft, verified by <role>, <date>".
3. Photoreal AI images and voice clones are **disabled**, to keep a government handle away from deepfake risk.
4. AI illustrations and diagrams carry a visible label and a C2PA manifest.

---

## 9. SIH 2026: format, criteria and the judging checklist

### 9.1 Facts

| Item | Detail | Source |
|---|---|---|
| Idea deadline | 30 Sep 2026; at most 500 ideas per PS; at most 2 PS per team | [SIH 2026 guidelines §10][sih26] |
| PS 26063 competition | **116/500** ideas at the time of this check. Brief: "archives expedition reports, scientific datasets, publications, photographs, videos and institutional activities while generating content for websites and social media" | [SIH PS list][sih-ps] |
| Team | 6 members, same college, **at least one woman**; up to 2 mentors (5+ years' experience) | [SIH 2026 guidelines][sih26] |
| Official evaluation criteria | Novelty, complexity, clarity & detail in the prescribed format, feasibility, practicability, sustainability, scale of impact, **user experience**, potential for future work | [SIH 2026 guidelines §13][sih26] |
| Prototype | "Working Prototype (not necessarily complete) is **mandatory** for Software Edition" | [SIH 2026 FAQ (DTU notice)][sih-dtu] |
| Finalists | 4–5 teams per PS; the PS owner decides and "isn't obligated to declare a winner" | [SIH 2026 guidelines §12][sih26] |
| Prize | One winner per PS, ₹1,50,000, paid **only if** the ministry likes the idea | [SIH 2026 guidelines §18][sih26] |
| Finale | Offline at nodal centres across India, **December 2026** | [SIH 2026 guidelines §13][sih26] |
| Finale duration (precedent) | SIH 2025: **36 hours**, 8:00 on 8 Dec to 20:00 on 9 Dec, "continuous mentoring and evaluation", then an expert panel. The 2026 duration is not yet published | [PIB Nagpur 2025][pib-sih25] |
| Scale (precedent) | SIH 2025: 72,165 ideas; **1,360 finalist teams** across **60 nodal centres**; the MoS Education asked finalists about "application relevance to various ministries" | [PIB 9 Dec 2025][pib-sih25b] |
| IP | Winning IP split equally between the PS organisation and the team, or by mutual agreement; ideas must be new | [SIH 2026 guidelines §17][sih26] |
| Logistics | Travel reimbursed up to ₹3,000 per person; college photo ID and consent letter mandatory | [SIH 2026 guidelines §16][sih26] |
| What wins (anecdotal) | An end-to-end walkthrough, a deployable product, backup demos, a story the ministry could "deploy tomorrow" | [Apnijanta][win1], [Medium, SIH 2024 winner][win2] (weak sources) |

### 9.2 Judging checklist → where HIMVANI proves it

| Criterion (official) | What an NCPOR/MoES juror + industry juror will probe | HIMVANI proof in the demo | Evidence artefact |
|---|---|---|---|
| **Novelty** | "Isn't this just a chatbot on a website?" | A Tamil kid's question gets an answer where each sentence is matched to a source; unsupported sentences are struck through live. Glossary-locked translation of "katabatic wind" | Claim-check trace panel |
| **Complexity** | Real AI pipeline vs. API glue | Drop in a scanned 1980s ISEA report → OCR → CLIP tags → FAIR metadata → pgvector index → answerable within the demo | Pipeline timing HUD |
| **Clarity (prescribed format)** | Can they explain it in 60 seconds? | A single three-part flow (Archive → Ask → Studio) repeated in the deck, the demo and the README | 1-page architecture diagram |
| **Feasibility** | "Can NCPOR ICT actually run this on MeghRaj?" | Deployment page: NIC containers + NGC GPU + Bhashini; costed certification path (CERT-In audit → CQW → DBIM) | §5 mapping table + cost sheet |
| **Practicability** | Will scientists and the outreach cell use it? | Email-to-archive live (send a PDF → it appears in the archive); batch-approve screen with an audit trail (GIGW CMAP) | CMAP audit log view |
| **Sustainability** | Who pays? Licences? Compliance upkeep? | Open-source stack; Bhashini production path through a Sahayogi MoU; **live compliance scorecard** (axe CI + GIGW/DBIM checklist) | `/compliance` page, green checks |
| **Scale of impact** | Reach beyond English and Hindi; kids; other MoES bodies | 36-language Ask; kid-safe mode (no login, no tracking); reusable by INCOIS/NCCR/IMD through configuration | Language coverage matrix |
| **User experience** | GIGW/DBIM look; accessibility | DBIM header and footer, Noto Sans, skip link, contrast toggle; keyboard-only run of Ask; screen-reader clip | Recorded NVDA pass (30 s) |
| **Future potential** | Roadmap credibility | 12-week plan tied to the pilot; field app offline sync; NPDC DOI linkage | Roadmap slide |
| **Working prototype (mandatory)** | Does it run offline at the venue? | Seeded local stack (docker compose), with a recorded fallback video | Offline demo kit |
| **Compliance (implicit in feasibility)** | "Is this legal for a Govt site handling kids' questions?" | Compliance page covering DPDP-safe Ask, CERT-In logging (NTP, 1-year retention), SGI labelling, GODL/CC licences | This doc condensed to one screen |
| **Finale rounds** | Progress between evaluations | Each round demonstrates one new, fully working slice (e.g. R1 Ask, R2 Studio + approvals, R3 compliance + deployment) | Changelog shown per round |

---

## Recommendations for HIMVANI

1. **Build to WCAG 2.2 AA + GIGW 3.0 + DBIM from the first commit, and show a live `/compliance` scorecard at the finale.** Why: the ministry juror asks "can we deploy this?", and a green checklist answers it faster than slides.
2. **Make Ask anonymous: no accounts, no server-side history, no personalisation.** Why: with no child identity, verifiable parental consent under DPDP Rule 10 never arises, and the s.9(3) tracking ban is met by design.
3. **Scrub PII from queries before storage, and keep IPs only in security logs.** Why: people type names and phone numbers into chat boxes, and a scrubber keeps query analytics non-personal.
4. **Keep one 365-day, India-hosted, WORM security-log store, with NTP to `samay1/samay2.nic.in` and `time.nplindia.org`, in UTC with the time zone recorded.** Why: a single setting satisfies CERT-In's 180 days, GIGW's 180 days and DPDP's 1 year.
5. **Model Studio approvals exactly as the GIGW 3-tier CMAP (Contributor → Moderator → Approver) with an append-only, hash-chained audit log.** Why: STQC's backend audit checks who approved which item and when.
6. **Recast "216 drafts" as generated drafts plus batch review with per-item records, launching with 3–5 priority languages per update.** Why: GIGW 5.4.6 requires all language versions updated together, and reviewer capacity is the real bottleneck.
7. **Set default licences: GODL-India + DOI for data, CC BY 4.0 for NCPOR media, all rights reserved for logos, and generate attribution strings automatically.** Why: teachers and journalists reuse content only when the licence is obvious.
8. **Gate every photo containing people: detection only, a consent reference for adults, blur for minors, never face recognition.** Why: DPDP s.9 and personality-rights cases make publishing an unconsented face the largest single legal risk in Studio.
9. **Ship text-first Studio outputs and disable photoreal AI images and voice clones.** Why: text falls outside the 2026 SGI rules, and a government handle posting synthetic media is a reputational hazard.
10. **Label everything AI-assisted ("AI-drafted, verified by role and date") and attach C2PA manifests to exported media.** Why: the AI Governance Guidelines ask for understandability and provenance, and labelling is cheap to add now and costly to retrofit.
11. **Run inference on sovereign infrastructure: open-weights LLM + Whisper + CLIP on NGC Tier II GPUs or IndiaAI compute, with NIC AI Panini/Shruti as fallbacks.** Why: the MoF advisory and GIGW's hosting-in-India rule both rule out foreign SaaS LLMs.
12. **Plan the Bhashini production path now (BHASHINI Sahayogi MoU); cache translations and enforce the locked glossary.** Why: Bhashini's free APIs are licensed for proof-of-concept use only.
13. **Offer a first-visit language picker, a `lang` attribute on every block, Noto Sans for all scripts, and per-script visual regression tests.** Why: these are explicit GIGW 5.4.10/5.1.13 and DBIM §4 checks and cost almost nothing.
14. **Give every map a list view, button pan/zoom and Survey of India-compliant boundaries.** Why: WCAG 2.1.1/2.5.7 require non-drag alternatives, and the DST geospatial guidelines require SoI boundaries on political maps of India.
15. **Auto-draft captions and audio-description scripts for every video (Whisper + LLM, human-approved).** Why: GIGW 5.2.3–5.2.6 require these at AA, and we can present meeting them as a feature.
16. **Publish the privacy notice in English + the 22 Eighth Schedule languages, with one-click consent withdrawal.** Why: DPDP s.5(3) and Rule 3 require it, and we already have the translation pipeline.
17. **Harden Studio: Parichay SSO + MFA, social OAuth tokens in a vault, CSP/HSTS, OWASP ASVS L2 checklist, and a 6-hour incident runbook covering the 72-hour Board report.** Why: social-account takeover is a CERT-In reportable incident, and GIGW 5.3.1 needs audit clearance.
18. **Commit a CycloneDX SBOM and an AIBOM to the repo.** Why: CERT-In's BOM guidelines v2.0 make this a visible marker of rigour for about an hour of work.
19. **Generate the 10 GIGW policy pages from the NIC handbook templates as MDX on day 1.** Why: GIGW 5.4.3 requires them, and the auditable content comes free.
20. **Keep the State Emblem out of the prototype and show a "SIH 2026 prototype" banner.** Why: the Emblem Act and basic honesty with the jury.
21. **Build an offline demo kit (docker compose with seeded data plus a recorded fallback), and plan one new working slice per evaluation round.** Why: the 2025 finale ran 36 hours with continuous evaluation, and venue Wi-Fi is unreliable.

## Corrections to our submission

1. **"Zero licence cost" is overstated.** The software is open source, but Bhashini's free APIs are "for the purposes of PoC only", and production use requires the paid/onboarded path ([Bhashini API docs][bhashini-poc]). Certification also has direct costs, e.g. the STQC DBIM lab fee of ₹3.5 lakh plus CERT-In audit charges ([STQC DBIM][stqc-dbim], [STQC WQC][stqc-wqc]). **Reword:** "No software licence cost. Bhashini production via a BHASHINI Sahayogi MoU; certification costs budgeted."
2. **"Hosting: NIC MeghRaj cloud" hides the GPU question.** MeghRaj is MeitY's GI Cloud umbrella ([PIB][pib-cloud]). NIC's public catalogue lists containers and AI SaaS but no self-service GPU ([cloud.gov.in][nic-cloud]); GPU VMs come through NICSI NGC Tier II ([NICSI][nicsi]) or IndiaAI compute ([PIB][indiaai-gpu]). **Reword:** "MeghRaj: NIC National Cloud (app/DB) + NGC GPU tier / IndiaAI compute (Whisper, CLIP, LLM)."
3. **"45th expedition underway, 44 completed" will be stale by the finale.** The 46th ISEA is scheduled to launch in Oct/Nov 2026 ([NCPOR news][isea46]). **Reword for Dec 2026:** "45 expeditions completed; 46th underway" (confirm the 45th wintering team's status before the finale).
4. **PRITHVI "2021–26" framing is time-limited.** The ₹4,797 cr outlay covers 2021–26 ([PIB][prithvi]), a cycle that ended on 31 Mar 2026. No public continuation approval was found as of this check (low confidence; verify). **Reword:** "fits MoES's PRITHVI/REACHOUT outreach mandate" without the dated outlay, or cite the successor cycle once it is announced.
5. **"Ask any question in 36 languages" applies to text only.** Bhashini supports 36 text languages but **23 voice** languages ([PIB Jun 2026][bhashini-pib]). **Reword:** "type in 36 languages, speak in 23."
6. **"216 drafts per update" clashes with GIGW's per-item approval audit trail (CMAP) and simultaneous multi-language updates (5.4.6), and with DBIM's "don't automate everything"** ([Handbook][hb], [GIGW 5.4.6][gigw], [DBIM §C.8][dbim]). **Reword:** "up to 216 drafts generated; reviewers batch-approve with a per-item audit trail; priority languages first."
7. **Gap, not an error: kids are a named audience, but DPDP isn't mentioned.** Children are under 18, and tracking them or targeting ads at them is banned ([s.9][dpdp-s9]). **Add:** "Ask needs no login and does no tracking (DPDP s.9-safe)."
8. **Gap: posting to X, YouTube and Instagram now triggers SGI declarations for any AI image, audio or video** (IT Amendment Rules 2026, in force 20 Feb 2026) ([Freshfields][it26-ff]). **Add:** "AI-assisted media labelled, with C2PA provenance."
9. **Gap: Explore uses CesiumJS/Leaflet default basemaps.** Political maps of India must use Survey of India boundary data ([DST guidelines 2021][dst-geo]). **Add:** "SoI-compliant boundaries."

[gigw]: https://cdnbbsr.s3waas.gov.in/s3c92a10324374fac681719d63979d00fe/uploads/2026/07/2026072438.pdf
[gigw-new]: https://guidelines.india.gov.in/new-features-of-gigw-3-0/
[gigw-ppt]: https://dbimtoolkit.digifootprint.gov.in/static/uploads/2025/02/c35ec5a5b570663b2a0d514f4f2ff013.pdf
[hb]: https://cdnbbsr.s3waas.gov.in/s3c92a10324374fac681719d63979d00fe/uploads/2023/12/2023122166.pdf
[stqc-wqc]: https://www.stqc.gov.in/website-quality-certification-0
[stqc-dbim]: https://stqc.gov.in/en/dbim-compliance-certification
[dbim]: https://dbimtoolkit.digifootprint.gov.in/static/uploads/2025/01/b70a5719408bd6d60040eda3ac042053.pdf
[dbim-pib]: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2104686
[accesssure]: https://accesssure.in/learn/gigw-3-0-explained/
[ogd]: https://www.data.gov.in/Godl
[parichay]: https://www.nic.gov.in/project/parichay/
[is17802]: https://broadbandindiaforum.in/wp-content/uploads/2022/08/IS-17802_1_2021.pdf
[rpwd23]: https://divyangjan.depwd.gov.in/upload/uploadfiles/files/RPwD%20(Amendment)%20Rules,%202023%20-%20Accessibility%20standards%20on%20ICT%20products%20and%20Services_compressed.pdf
[rpwd23-scc]: https://www.scconline.com/blog/post/2023/05/12/ministry-of-social-justice-and-empowerment-notified-rights-of-persons-with-disabilities-amendment-rules-2023-legal-news/
[raturi]: https://api.sci.gov.in/supremecourt/2005/9321/9321_2005_1_1503_56986_Judgement_08-Nov-2024.pdf
[amarjain]: https://www.disabilityrightsindia.com/2025/05/supreme-court-issues-directions-to-make.html
[wcag22]: https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
[wcag22-iso]: https://www.w3.org/WAI/news/2025-10-21/wcag22-iso
[wcag3]: https://www.w3.org/WAI/news/2026-09-10/wcag3/
[dpdp-rules]: https://www.dpdpa.com/DPDP_Rules_2025_English_only.pdf
[dpdp-timeline]: https://protectcomply.com/blog/dpdp-rules-2025-timeline
[dpdp-12m]: https://www.mondaq.com/india/data-protection/1773554/meity-plans-to-cut-short-dpdp-compliance-timeline-and-notify-cross-border-restrictions-for-sdfs
[dpdp-s9]: https://indiankanoon.org/doc/98869575/
[dpdp-s5]: https://www.apnilaw.com/bare-act/dpdp/section-5-digital-personal-data-protection-act-dpdp-notice/
[dpdp-s3]: https://www.india-briefing.com/news/india-dpdp-act-publicly-available-personal-data-46899.html
[dpdp-s8]: https://indiankanoon.org/doc/186118625/
[dpdp-s10]: https://indiankanoon.org/doc/180799537/
[dpdp-sched]: https://www.dpdpa.com/theschedule.html
[certin-dir]: https://www.cert-in.org.in/PDF/CERT-In_Directions_70B_28.04.2022.pdf
[certin-faq]: https://www.cert-in.org.in/PDF/FAQs_on_CyberSecurityDirections_May2022.pdf
[certin-audit]: https://www.cert-in.org.in/PDF/Comprehensive_Cyber_Security_Audit_Policy_Guidelines.pdf
[certin-bom]: https://www.cert-in.org.in/PDF/TechnicalGuidelines-on-SBOM,QBOM&CBOM,AIBOM_and_HBOM_ver2.0.pdf
[pib-cloud]: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2202897
[ambud]: https://ambud.meity.gov.in/
[nic-cloud]: https://cloud.gov.in/
[nic-ai]: https://x.com/NICMeity/status/2023353486617030944
[nic-ai2]: https://telecomtalk.info/indian-government-adoption-of-nic-ai-tools/1001958/
[nicsi]: https://nicsi.nic.in/nicsi/nicsi-cloud/
[yotta]: https://yotta.com/press-releases/aws-yotta-deploy-hybrid-cloud-for-nic-meghraj-2-0/
[indiaai-gpu]: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2177598
[ndsap]: https://en.wikipedia.org/wiki/National_Data_Sharing_and_Accessibility_Policy
[godl]: https://smartcities.data.gov.in/government-open-data-license-india
[copyright17]: https://indiankanoon.org/doc/1404402/
[cc-attr]: https://wiki.creativecommons.org/wiki/Recommended_practices_for_attribution
[emblem]: https://www.indiacode.nic.in/handle/123456789/2038?view_type=browse
[persona]: https://disputeresolution.cyrilamarchandblogs.com/2026/05/personality-rights-in-india-in-the-age-of-ai/
[sm-pib]: https://www.pib.gov.in/newsite/PrintRelease.aspx?relid=86618
[sm-mn]: http://www.medianama.com/2012/08/223-indian-govt-releases-social-media-guidelines-for-its-agencies-highlights/
[sm-alg]: https://www.algindia.com/summary-framework-guidelines-for-use-of-social-media-for-government-organisations-meity/
[aigg-pib]: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2228315
[aigg-ch]: https://chambers.com/articles/meity-unveils-india-s-approach-towards-regulating-artificial-intelligence
[it26-ff]: https://www.freshfields.com/en/our-thinking/blogs/technology-quotient/india-targets-deepfakes-and-ai-generated-content-key-changes-under-meitys-2026-102mjwn
[it26-lex]: https://www.lexology.com/library/detail.aspx?g=adb2714c-1188-43e3-b62b-eb6649727f6e
[it26-kh]: https://www.khaitanco.com/thought-leadership/MeitY-notifies-the-IT-Amendment-Rules-2026
[mof]: https://inc42.com/buzz/finance-ministry-asks-employees-to-not-use-chatgpt-deepseek-report/
[c2pa]: https://spec.c2pa.org/specifications/specifications/2.2/specs/_attachments/C2PA_Specification.pdf
[sih26]: https://www.sih.gov.in/letters/2026/SIH%202026%20Guidelines.pdf
[sih-ps]: https://sih.gov.in/sih2026PS
[sih-dtu]: https://www.dtu.ac.in/Web/upload/events/aug/file0807.pdf
[pib-sih25]: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2202893
[pib-sih25b]: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2201244
[win1]: https://apnijanta.com/trending/sih-winners-guide.html
[win2]: https://medium.com/@deshmusn/from-biryani-to-big-wins-our-thrilling-ride-to-victory-at-sih-2024-e55981468c06
[bhashini-poc]: https://bhashini.gitbook.io/bhashini-apis
[bhashini-pib]: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2267632
[isea46]: http://www.ncaor.gov.in/news/view/1009
[prithvi]: https://www.pib.gov.in/PressReleseDetailm.aspx?PRID=2003592
[dst-geo]: https://dst.gov.in/sites/default/files/Final%20Approved%20Guidelines%20on%20Geospatial%20Data.pdf
