# HIMVANI: Polar Knowledge Portal — Source Brief

> Cleaned transcription of `.agent/SIH111.pdf` (the team's SIH 2026 idea submission). This is the single source of truth every other doc traces back to. Where the PDF was ambiguous, the interpretation is marked *(interp.)*.

## Submission facts

| Field | Value |
|---|---|
| Event | Smart India Hackathon 2026 |
| Problem Statement ID | **26063** |
| Problem Statement Title | Integrated Polar Science Outreach, Knowledge Repository and Media Dissemination Portal |
| Theme | Smart Education |
| Category | Software |
| Team ID / Name | 182654 / **Claude Can Code** |
| Product name | **HIMVANI: Polar Knowledge Portal** |
| Team | 6 people: 2 frontend, 2 backend + AI, 1 data, 1 design |

## The problem

- 44 completed Indian Scientific Expeditions to Antarctica (ISEA), with the 45th underway. Their reports, photos and data are spread across **separate places**, mostly **untagged**.
- They are split across **two websites**: the NCPOR site and NPDC (National Polar Data Center).
- Scientists skip metadata forms.
- Outreach happens in only **two languages** (English, Hindi).
- AI-generated text can be wrong.
- Students and the public have no way to *ask* questions. Today's pages are English/Hindi only.
- The MoES outreach cell hand-writes each post, in one language.

## Proposed solution (one line)

One AI portal that archives every expedition, answers questions with **cited sources**, and turns polar science into **human-approved outreach in 36 Indian languages**.

## How it works

### Inputs: scientists & stations
Reports, photos, videos and datasets from **Maitri** and **Bharati** (Antarctica) and **Himadri** (Arctic, Ny-Ålesund, Svalbard).

### HIMVANI core pipeline
1. **Upload** by web, email ("email-to-archive"), or an **offline field app** that syncs when a link is available.
2. **Understand**: AI tagging, OCR, transcripts.
3. **Index** with source links and FAIR metadata.

### Outputs
- **Ask** (students & public): any question in 36 languages, answered with citations, so people can learn in their own language.
- **Studio** (MoES outreach): one update becomes drafts for kids, press and social media. A reviewer approves them, then they are posted on the web and social channels.

## How it addresses the problem

| Today | With HIMVANI |
|---|---|
| Split across 2 websites | One search, one Ask box |
| Metadata forms skipped | AI fills metadata on upload |
| Outreach in 2 languages | Drafts in 36 languages |
| AI text can be wrong | Every claim cited, human-approved |

## Innovation vs. alternatives

| Capability | NCPOR site | NPDC | AI chatbots | **HIMVANI** |
|---|---|---|---|---|
| Cited answers | — | — | — | ✓ |
| Auto-tagging | Manual | Manual | — | ✓ |
| Indian languages | 2 | 1 | Unverified | **36** |
| Approval workflow | Manual | — | — | ✓ |

## Technical approach

### Architecture layers
1. **Sources**: NCPOR reports, station photos & video, NPDC datasets, news & press.
2. **Ingest**: web upload, email-to-archive, offline field app (syncs on link).
3. **AI enrichment**: OCR, Whisper transcripts, CLIP image tags, auto metadata.
4. **Knowledge store**: PostgreSQL + pgvector, object store, FAIR metadata, DOIs.
5. **Services**: Ask (RAG with citations), Explore map, Content Studio.
6. **Channels**: web portal, X, YouTube, Instagram, Bhashini (36 languages).

### Checks at every step
- Each answer sentence is matched to a source.
- Embargo dates and access roles.
- A person approves anything before it is published.

### Technologies

| Layer | Choice |
|---|---|
| Interface | Next.js, React PWA, CesiumJS, Leaflet |
| AI models | RAG + LLM, Whisper, CLIP, OCR |
| Language | Bhashini APIs, locked polar glossary |
| Data & API | FastAPI, PostgreSQL + pgvector |
| Hosting | NIC MeghRaj cloud |

### Working prototype (MVP screens shown in the submission)
- **Ask**: a Hindi question, answered with 2 sources.
- **Explore**: stations and expeditions on a map.
- **Studio**: one update turned into bilingual drafts to approve.

## Feasibility

| Dimension | Why it is feasible |
|---|---|
| Technical | Open-source, proven parts: pgvector, Whisper, CLIP |
| Data | NCPOR reports, photos and NPDC datasets are already public |
| Language | Bhashini is a government API covering 36 text languages |
| Team | 6 people: 2 frontend, 2 backend + AI, 1 data, 1 design |

## Viability & sustainability
- **REACHOUT**: fits PRITHVI's outreach sub-scheme. Zero licence cost thanks to the open-source stack.
- **MeghRaj**: runs on NIC cloud, operated by NCPOR ICT.
- **Reusable** by INCOIS, NCCR and IMD *(interp.: other MoES institutes can reuse the platform)*.

## 12-week build plan
| Weeks | Milestone |
|---|---|
| 1–4 | **Archive + Ask**: upload, tagging, cited answers |
| 5–8 | **Studio + Bhashini**: drafts, 36 languages, approvals |
| 9–12 | **Map + pilot**: NPDC link, offline sync |
| Week 12 | Pilot with the NCPOR outreach team on one expedition update |

## Risks & mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| AI states something wrong in public | High | Answers only from sources; claim check and human approval |
| Embargoed data goes public | High | Role-based access, embargo dates, public/internal flag per file |
| Scientific terms mistranslated | Medium | Locked polar glossary in all 36 languages, reviewer sign-off |
| Weak satellite links at stations | Medium | Offline-first app with compressed, resumable uploads |
| Scientists don't adopt another tool | Medium | Zero-form upload and email-to-archive; AI fills metadata |

## Impact
| Audience | Today | With HIMVANI |
|---|---|---|
| Scientists at NCPOR | Files sit untagged, forms skipped | Drop a file and it becomes findable, citable, and linked to NPDC |
| Students & public | English and Hindi pages, no way to ask | Ask in Tamil or Hindi and get a sourced answer |
| Outreach cell, MoES | Each post hand-written, in one language | One upload gives **216 drafts** to review (6 formats × 36 languages) |

**Reach of one expedition update:** languages go from 2 to 36, and drafts per update go from 1 to 216.

**Benefits**
- Social (SDG 4): polar science for learners beyond English and Hindi.
- Economic: no lost or redone field data; zero licence cost.
- Environmental (SDG 13): climate literacy on how polar ice shapes India's weather.
- Scientific: FAIR datasets with DOIs that are easier to reuse.

## Key numbers & references (from the submission)
- 1981–82: the first Indian expedition reached Antarctica [3].
- 45th expedition underway, 44 completed [1, 2].
- 36 Indian text languages on Bhashini [8].
- PRITHVI scheme 2021–26: ₹4,797 cr (incl. REACHOUT) [7].

1. NCPOR: 45th ISEA team reaches Maitri (Nov 2025). ncaor.gov.in/news/view/929
2. NCPOR: Call for 46th ISEA proposals (44 completed). isea.ncpor.res.in/forms/46-ISEA Webpage Advertisment.pdf
3. PIB: Antarctica Expeditions (1981 start, Maitri, Bharati). pib.gov.in/newsite/PrintRelease.aspx?relid=123510
4. Indian Antarctic Programme (Bharati, 134 containers). en.wikipedia.org/wiki/Indian_Antarctic_Programme
5. NCPOR: Himadri, India's Arctic station. ncpor.res.in/…/340-himadri-station
6. National Polar Data Center, NCPOR. npdc.ncpor.res.in
7. PIB: PRITHVI scheme, ₹4,797 cr (incl. REACHOUT). pib.gov.in/PressReleaseIframePage.aspx?PRID=2003592
8. PIB: BHASHINI, 36 text and 23 voice languages (2026). pib.gov.in/PressReleasePage.aspx?PRID=2267632
9. Wilkinson et al., FAIR data principles (2016). doi.org/10.1038/sdata.2016.18
10. Lewis et al., RAG (2020); Radford et al., Whisper (2022). arxiv.org/abs/2005.11401, arxiv.org/abs/2212.04356
