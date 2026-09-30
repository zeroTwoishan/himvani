# Polar-Science Domain, Stakeholders and Archive Content for HIMVANI

> Research date: **2026-09-30**. Every NCPOR/NPDC finding below was checked against the live site on that date with `curl`/WebFetch. "Verified live" means we fetched the page or endpoint ourselves. Figures that carry no link came from our own crawl, and the method is given next to them.

## TL;DR

- **The official PS text is one sentence and it asks for more than we pitched.** It reads: *"Develop a comprehensive outreach portal that archives expedition reports, scientific datasets, publications, photographs, videos and institutional activities while generating content for websites and social media"* ([sih.gov.in](https://sih.gov.in/sih2026PS)). Our submission skips **publications** and **institutional activities** (news, events, campaigns). About 4–5 of the **116 teams** that submitted ideas go to the finale ([SIH 2026 Guidelines](https://sih.gov.in/letters/2026/SIH%202026%20Guidelines.pdf)).
- **NCPOR's content sits on at least 8 web properties, not 2**: ncpor.res.in (also served at ncaor.gov.in), NPDC, data.ncpor.res.in, a DSpace install on a bare IP, isea.ncpor.res.in, onlineform, synopticdata and LAS, plus YouTube and X. Three of them failed or returned errors when we tested on 30 Sep 2026.
- **We can seed the archive from day 1 without scraping HTML.** The DSpace at `14.139.119.23:8080` has a working **OAI-PMH** endpoint with **825 oai_dc records**: ISEA Scientific Reports 1–30, all PDF, all English. The NCPOR **RSS feed carries 835 dated news items (2012–2026)**, of which only 57 have Hindi titles. NPDC has about **900 DIF-style metadata records**, no DOIs, no API, and its XML export returns HTTP 500.
- **The stations and the network shape the product.** Maitri has had a 4 MHz SATCOM link since 2008. Expedition members get **6 min/month of personal calls in summer and 20 min/month in winter, plus one shared email ID** ([46-ISEA call](https://ncpor.res.in/files/Webpage%20advertisment.pdf)). Ny-Ålesund (Himadri) is a **radio-silent zone: Wi-Fi, Bluetooth and mobile phones are banned within 20 km** ([Research Council of Norway](https://www.forskningsradet.no/en/svalbard-science-forum/planning-research/)). The field app must sync over wired or plain SATCOM links, and email-to-archive cannot identify a scientist by sender address because the inbox is shared.
- **Some of our submission's claims are now out of date.** PRITHVI's ₹4,797 cr covered **2021–26, a period that has ended**, although PRITHVI continues in Budget 2026-27 at ₹2,767.29 cr ([Demand No. 24](https://www.indiabudget.gov.in/doc/eb/sbe24.pdf)). The 46th ISEA launches in **Oct/Nov 2026**, so by the December finale the correct wording is "45 completed, 46th underway". Two of our citations break: ncaor.gov.in has a TLS certificate that does not match the host, and isea.ncpor.res.in returns 502. Official NCPOR pages also contain factual errors ("Ronald Amundsen", a Hindi coordinate missing a digit), so our "cited = correct" story needs an editorial layer on top of the sources.

---

## 1. Official PS 26063 and the SIH 2026 format

### 1.1 PS 26063 as listed on sih.gov.in ([source](https://sih.gov.in/sih2026PS), fetched 30 Sep 2026)

| Field | Value |
|---|---|
| PS ID | SIH26063 |
| Title | Integrated Polar Science Outreach, Knowledge Repository and Media Dissemination Portal |
| Description (verbatim) | "Develop a comprehensive outreach portal that archives expedition reports, scientific datasets, publications, photographs, videos and institutional activities while generating content for websites and social media." |
| Organisation / Dept | Ministry of Earth Sciences (MoES) / National Centre for Polar and Ocean Research (NCPOR) |
| Category / Theme | Software / Smart Education |
| Ideas submitted | **116 / 500** (counter shown on the portal) |
| Idea deadline | 30 September 2026 |
| Dataset / YouTube link | None provided |

**Sibling NCPOR PSs in SIH 2026.** HIMVANI must not drift into their scope ([sih.gov.in](https://sih.gov.in/sih2026PS)).

| PS | Title (short) | Theme | Ideas | Boundary for HIMVANI |
|---|---|---|---|---|
| 26059 | AI sea-ice / iceberg navigation DSS | Transportation | 167 | Do not forecast sea ice |
| 26060 | Digital twin for Maitri and Bharati | Smart Automation | 143 | Show station status only; no infrastructure twin |
| 26061 | AI energy management for polar stations | Clean & Green | 141 | No energy features |
| 26062 | Expedition logistics and asset management | Smart Automation | 169 | No cargo or personnel tracking |
| **26063** | **Outreach, repository, media portal** | **Smart Education** | **116** | **Ours** |
| 26064 | Seafloor metal-detection sensor | Robotics | 84 | n/a |
| 26065 | Autonomous ocean observation platform | Robotics | 85 | n/a |

### 1.2 SIH 2026 rules that constrain us ([SIH 2026 Guidelines](https://sih.gov.in/letters/2026/SIH%202026%20Guidelines.pdf))

| Rule | Value |
|---|---|
| Team | 6 members including leader, at least 1 female, same college; up to 2 mentors with 5+ years of experience |
| PS limit | A team may submit ideas for at most 2 PSs; each PS freezes at 500 ideas |
| Finalists per PS | "4-5 teams per problem statement may be selected"; the PS organisation "isn't obligated to declare a winner" |
| Idea-stage criteria (verbatim) | "novelty of the idea, complexity, clarity and details in the prescribed format, feasibility, practicability, sustainability, scale of impact, user experience and potential for future work progression" |
| Finale mode | Offline at nodal centres across India, "proposed to be organized in December 2026" |
| Prize | ₹1,50,000 per PS, paid only if the organisation likes the idea |
| IP | "split equally between industry that gave the problem statements and the winning team" or by mutual agreement |
| Originality | Ideas "must not have been present in any previous event/program" |
| Travel | Reimbursed up to ₹3,000 per person |

### 1.3 Finale format, based on last year

| Item | SIH 2025 fact | Source |
|---|---|---|
| Duration | **36 hours**, 8:00 am on 8 Dec to 8:00 pm on 9 Dec 2025, "under continuous mentoring and evaluation" | [PIB](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2202893) |
| Judging | "evaluation by an expert panel" and a winner per PS | [PIB](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2202893) |
| Scale | 60 nodal centres | [BW Education](https://www.bweducation.com/article/smart-india-hackathon-2025-begins-583012) |
| 2026 duration | **Not stated** in the 2026 guidelines or [FAQ](https://sih.gov.in/faqs). We assume 36 h based on precedent. | — |

---

## 2. NCPOR: mandate, structure, outreach

| Aspect | Fact | Source |
|---|---|---|
| Founded | 25 May 1998 as NCAOR, an autonomous body of MoES (formerly Dept of Ocean Development); now NCPOR "(erstwhile NCAOR)" | [NCPOR welcome](https://ncpor.res.in/pages/view/260-welcome-to-ncaor), [home](https://ncpor.res.in/) |
| Mandate | Nodal agency for the Indian Antarctic Programme, Arctic, Southern Ocean and Himalaya; runs Maitri, Bharati and Himadri; manages ORV Sagar Kanya; EEZ/ECS surveys; IODP; gas hydrates | [NCPOR welcome](https://ncpor.res.in/pages/view/260-welcome-to-ncaor) |
| Campus | 147,660 m², Headland Sada, Vasco-da-Gama, Goa | [NCPOR welcome](https://ncpor.res.in/pages/view/260-welcome-to-ncaor) |
| Governance | 13-member Governing Body chaired by Secretary MoES (Dr M. Ravichandran); Director Dr Thamban Meloth; 12-member RAC chaired by Dr Shailesh Nayak; 8-member Finance Committee | [Organisation](https://ncpor.res.in/pages/display/275-organisation) |
| Line groups seen in 2026 | GD-Polar Science (Dr Rahul Mohan); GD-Antarctic Operations (Dr Shailendra Saini) | [News 1009](https://ncpor.res.in/news/view/1009) |
| Research divisions (site taxonomy) | **Polar Science & Cryosphere** (8 programmes: polar precipitation, sea ice–ocean–climate, microbial diversity, cryosphere & climate, Southern Ocean ecosystems, environmental monitoring, Kongsfjorden flagship, paleoclimate); **Geoscience** (EEZ, Extended Continental Shelf, Himalaya/monsoon, Indian Ocean Geoid Low); **Mineral exploration** (hydrothermal, gas hydrate) | [Home](https://ncpor.res.in/) |
| Outreach "cell" | **No dedicated outreach unit or page is current.** The "Outreach Program" page lists only 2016 events (IISF 2016, SCI-FFI, IITF 2016). | [Outreach](https://ncpor.res.in/antarcticas/display/373-outreach-program) |
| Actual outreach activity | Antarctica Day (1 Dec) with exhibitions and meet-the-scientist sessions; "Unveiling the Poles" exhibition in Kochi with CUSAT (700+ students); Swachh Sagar beach clean-ups; Hindi Diwas/Pakhwada; NCPS conference | [X post](https://x.com/ncaor_goa/status/1895613296520413354), [News 1058](https://ncpor.res.in/news/view/1058), [News](https://ncpor.res.in/news) |
| Social reach | YouTube "NCPOR, Goa Vasco": **1.2K subscribers, 92 videos** (verified live); X handle still **@ncaor_goa** (old name); Facebook ncpor.goa; MoES runs @moesgoi on X and Instagram | [YouTube](https://www.youtube.com/channel/UC1h2xM-VmB1opmtTa4IreQQ), [X](https://twitter.com/ncaor_goa), [Instagram](https://www.instagram.com/moesgoi/) |
| Post volume | RSS news items per year: 2023 = 60, 2024 = 84, **2025 = 131**, 2026 (to 25 Sep) = 106; our count from [news.xml](https://ncpor.res.in/upload/rssfeed/news.xml) | Our count |

---

## 3. Audit of the NCPOR web estate (30 Sep 2026)

### 3.1 Properties

| # | Property | Hosts | Tech / format | Languages | Status on 30 Sep 2026 |
|---|---|---|---|---|---|
| 1 | [ncpor.res.in](https://ncpor.res.in/) | Institutional pages, news, expeditions, photo gallery, annual reports, tenders | Legacy jQuery "templete1" CMS; RSS at [/upload/rssfeed/news.xml](https://ncpor.res.in/upload/rssfeed/news.xml) | EN + HI toggle | Up |
| 2 | ncaor.gov.in | Byte-identical copy of #1 (same 35,309-byte homepage) | Same server | EN/HI | **HTTPS certificate valid only for `*.ncpor.res.in`**, so browsers show a TLS error |
| 3 | [npdc.ncpor.res.in](https://npdc.ncpor.res.in/npdc/homepage.action) | Dataset metadata, submission, browse | Java Struts 2 (`.action`, `jsessionid` in URLs) on **Tomcat 8.5.96**, which reached EOL on 31 Mar 2024 ([Apache](https://tomcat.apache.org/tomcat-85-eol.html)) | EN | Up; XML export gives **HTTP 500 with a stack trace** |
| 4 | [data.ncpor.res.in](https://data.ncpor.res.in/) | Live AWS weather for Maitri, Bharati, Himadri and Himansh; charts; [Polar Directory](https://data.ncpor.res.in/PolarDirectory/) of expedition members | JSP | EN (Polar Directory header in HI) | Up; on 29 Sep 2026 at 23:00 it showed Maitri −21.0 °C and Bharati −14.4 °C |
| 5 | [DSpace](http://14.139.119.23:8080/dspace/index.jsp) | ISEA Scientific Reports, technical publications | Legacy DSpace JSPUI on a **bare IP over plain HTTP**; OAI-PMH via OCLC OAICat 1.5.26 ([Identify](http://14.139.119.23:8080/dspace-oai/request?verb=Identify)) | EN only | Up. Handle prefix is `123456789`, the default placeholder, which **does not resolve** on hdl.handle.net ([Handle API](https://hdl.handle.net/api/handles/123456789/124)) |
| 6 | isea.ncpor.res.in | ISEA proposal submission, forms, user manual | — | — | **HTTP 502 / connection reset** |
| 7 | onlineform.ncpor.res.in | "Common Project Proposal Form" for expeditions | — | EN | Up |
| 8 | synopticdata.ncpor.res.in, las.ncaor.gov.in | Synoptic data from Bharati (2016–21); Live Access Server | — | EN | **TLS failure / 502** |
| 9 | YouTube, X, Facebook | Video, posts | — | EN-first | Up |

### 3.2 UX and content gaps

| Gap | Evidence | What HIMVANI does instead |
|---|---|---|
| Stale sections | Expedition Updates stops at 42-ISEA (Nov 2022) ([page](https://ncpor.res.in/pages/view/247-expedition-updates)); newest photo album is from June 2023 ([gallery](https://ncpor.res.in/photogallery)); Southern Ocean page says "7 expeditions" ([page](https://ncpor.res.in/pages/display/270-southern-ocean)) against 12 by 2025; the Voyage page names MV Ivan Papanin "since the last four years" ([page](https://ncpor.res.in/antarcticas/display/378-voyage)) | Timeline built from dated items, with a freshness badge on every page |
| Hindi coverage is partial | The Hindi toggle translates static pages, but the news list stays English; only **57 of 835** RSS items have Devanagari titles (our count). The language is held in a session cookie, so the URL stays the same and Hindi pages cannot be shared or indexed | Language in the URL (`/ta/…`) with hreflang |
| Translation errors | The Hindi Maitri page gives "1°44'03" पूर्व" for **11°**44'03"E ([page](https://ncpor.res.in/antarcticas/display/376-maitri-), with the Hindi session) | Numeric-token preservation check on every translation |
| Factual errors on official pages | "Ronald Amundsen"; Scott reached the Pole "only 3 weeks later"; "over 70 lakes" ([Discovery page](https://ncpor.res.in/antarcticas/display/162-discovery-of-antarctica)). In fact Amundsen reached the Pole on 14 Dec 1911 and Scott on 17 Jan 1912, about 5 weeks later ([Amundsen](https://en.wikipedia.org/wiki/Amundsen%27s_South_Pole_expedition), [Terra Nova](https://en.wikipedia.org/wiki/Terra_Nova_Expedition)), and **675** Antarctic subglacial lakes are known ([Livingstone et al. 2022](https://www.nature.com/articles/s43017-021-00246-9)). The About page also says "James cook discovered Antarctica" ([Antarctica](https://ncpor.res.in/antarcticas)). | "Source conflict / outdated" flags in Ask; editor queue |
| Internal inconsistencies | Maitri coordinates are 70°45'52"S 11°44'03"E on the [station page](https://ncpor.res.in/antarcticas/display/376-maitri-) but 70°45'58"S 11°43'56"E in the [46-ISEA call](https://ncpor.res.in/files/Webpage%20advertisment.pdf); distance to the ice-shelf edge is ~100 km vs ~80 km; Bharati is dated 2011 on the [welcome page](https://ncpor.res.in/pages/view/260-welcome-to-ncaor) but "commissioned 18 March 2012" on the [Bharati page](https://ncpor.res.in/antarcticas/display/377-bharati); NPDC is "established in 2013" on its [About page](https://npdc.ncpor.res.in/npdc/mainmenu_home.action?ref_id=REF-30169&main_menu_id=5&main_menu_name=About) and "2014" in its [manual](https://npdc.ncpor.res.in/user_manual/National_Polar_Data_Center.pdf) | A single canonical facts table (`station`, `expedition`) that every page reads from |
| Sorting and noise in news | The news list is sorted oldest first, many items share one bulk date (03-09-2026, 11-09-2026), and a 2025 SHEBOX notice is pinned as item 1 ([news](https://ncpor.res.in/news)) | Reverse-chronological feed, typed items |
| Popups | External links open `window.open` popups behind `confirm()` dialogs (home page JS) | Normal links |
| Dead analytics | Polar Directory still loads Universal Analytics `UA-145422957-1`, which stopped processing data on 1 Jul 2023 ([Google](https://support.google.com/analytics/answer/11583528?hl=en)) | Self-hosted, privacy-safe analytics |
| Weak outreach reach | 1.2K YouTube subscribers for India's national polar agency ([YouTube](https://www.youtube.com/channel/UC1h2xM-VmB1opmtTa4IreQQ)) | Studio exports sized for Shorts and Reels |

---

## 4. NPDC in detail

| Question | Finding | Evidence |
|---|---|---|
| Metadata standard | **DIF-style, not named publicly.** Record fields match GCMD DIF: Personnel, Data Center, Data Set Progress, Dataset Citation, ISO Topic Category, Instrument, Platform, Location. Science keywords cover **12 of the 14** GCMD Earth-Science topics; Human Dimensions and Terrestrial Hydrosphere are absent | [Sample record](https://npdc.ncpor.res.in/npdc/search_mf_data.action?search=title&expedition_type=Antarctic&parameter=MF-1025844776&userType=user&parameter1=Glaciers%2FIce+Sheets), [GCMD KMS v24.8](https://cmr.earthdata.nasa.gov/kms/concepts/concept_scheme/sciencekeywords?format=csv), [DIF standard](https://www.earthdata.nasa.gov/esdis/esco/standards-and-practices/directory-interchange-format-dif-standard) |
| Guidance | A "Metadata Guidance" page asks for title, abstract, keywords, geo-location, depth/altitude, dates, access and use constraints, **ORCID**, funding, instruments and methods | [Metadata Guidance](https://npdc.ncpor.res.in/npdc/mainmenu_home.action?ref_id=REF-17269&main_menu_id=122&main_menu_name=Metadata+Guidance) |
| DOIs | **None.** Records show a "Dataset Citation" with no identifier. DataCite has no NCPOR client; Indian polar DOIs exist only where individual scientists deposited in Zenodo, NOAA or Dryad | [DataCite API](https://api.datacite.org/dois?query=ncpor) |
| API / OAI-PMH / CSW | **None found** for NPDC: `/oai/request` returns 404, the per-record `xml_report.jsp` returns 500, and there is a PDF export. The only harvestable NCPOR endpoint is the **DSpace OAI-PMH** (oai_dc) | [XML export](https://npdc.ncpor.res.in/npdc/xml_report.jsp?id=MF-1025844776), [DSpace OAI](http://14.139.119.23:8080/dspace-oai/request?verb=Identify) |
| Visibility in AMD / GCMD | The data policy says metadata will be shared on the SCAR/COMNAP (SC-ADM) network. NASA CMR returns only 1 record for "Maitri", 1 for "NCAOR" and **0 for "Himadri"** | [Data policy](https://npdc.ncpor.res.in/npdc/mainmenu_home.action?ref_id=REF14329&main_menu_id=55&main_menu_name=Data+Policy+%26amp%3B+Guidelines), [CMR Himadri](https://cmr.earthdata.nasa.gov/search/collections.json?keyword=Himadri), [CMR Maitri](https://cmr.earthdata.nasa.gov/search/collections.json?keyword=Maitri) |
| Record counts (by location) | **About 900 metadata records**: Antarctic 675 (Maitri 307, Schirmacher 87, Bharati 63, Dakshin Gangotri 60, …), Arctic 125 (Ny-Ålesund 79, Kongsfjorden 33), Southern Ocean 98, **Himalaya 2** | [Browse by location](https://npdc.ncpor.res.in/npdc/browse_by_location.action) (our sum) |
| Record counts (by keyword) | Atmosphere 165, Oceans 133, Cryosphere 112, Paleoclimate 99, Land Surface 83, Bio-Classification 58, Solid Earth 39, Biosphere 37, Sun-Earth 19, Agriculture 9, Spectral 7, Climate Indicators 3, for **764 tag hits** | [NPDC home](https://npdc.ncpor.res.in/npdc/homepage.action) |
| Vocabulary quality | Location labels are free text: "Larsemann Hill" vs "Larsemann Hills", "Queen Maud Land" vs "Central Dronning Maud Land", "indian ocean" vs "Indian Ocean", "Maitri and Bharati" as a single location. The sampled glacier record carries ISO topic "Meteorology" | [Browse by location](https://npdc.ncpor.res.in/npdc/browse_by_location.action), [sample record](https://npdc.ncpor.res.in/npdc/search_mf_data.action?search=title&expedition_type=Antarctic&parameter=MF-1025844776&userType=user&parameter1=Glaciers%2FIce+Sheets) |
| Access policy | Metadata is open. Data is the collector's IP for a **2-year lock-in from the end of the season, extendable to 5 years**. Exceptions for human subjects, traditional knowledge and sensitive sites (e.g. nests) | [Data policy](https://npdc.ncpor.res.in/npdc/mainmenu_home.action?ref_id=REF14329&main_menu_id=55&main_menu_name=Data+Policy+%26amp%3B+Guidelines) |
| Enforcement | "If an organization or Principal Investigator (PI) has not submitted previous data to NPDC, NCPOR reserves the right not to forward the project(s) further." | [46-ISEA call §12](https://ncpor.res.in/files/Webpage%20advertisment.pdf) |
| Submission flow | PI files a project proposal before the expedition; after returning, submits metadata and data (data can follow later); a dashboard supports edits; registration requires NCPOR approval | [NPDC manual](https://npdc.ncpor.res.in/user_manual/National_Polar_Data_Center.pdf) |
| Privacy | The public record shows the PI's personal email and phone number | [Sample record](https://npdc.ncpor.res.in/npdc/search_mf_data.action?search=title&expedition_type=Antarctic&parameter=MF-1025844776&userType=user&parameter1=Glaciers%2FIce+Sheets); DPDP context at [MeitY](https://www.meity.gov.in/data-protection-framework) |

---

## 5. Stations (map-ready)

| Station | Region | Lat (dec) | Lon (dec) | Elev | Est. | Capacity | Source |
|---|---|---|---|---|---|---|---|
| **Maitri** | Schirmacher Oasis, cDML, East Antarctica | **−70.7661** | **11.7322** | ~50 m (NCPOR) / 117 m (Wikipedia) | Site chosen 1988; operating 1989 | 25 in main building year-round, plus ~40 in summer modules | [46-ISEA call](https://ncpor.res.in/files/Webpage%20advertisment.pdf), [Maitri page](https://ncpor.res.in/antarcticas/display/376-maitri-), [Wikipedia](https://en.wikipedia.org/wiki/Maitri_%28research_station%29) |
| **Bharati** | Larsemann Hills (N. Grovnes Is.), Prydz Bay | **−69.4068** | **76.1953** | ~35 m | Commissioned 18 Mar 2012 | 47 year-round + 25 summer = 72 | [Bharati page](https://ncpor.res.in/antarcticas/display/377-bharati) |
| **Himadri** | Ny-Ålesund, Spitsbergen, Svalbard | **78.9167** | **11.9333** | ~8 m | Inaugurated 1 Jul 2008 | 8 scientists | [Wikipedia](https://en.wikipedia.org/wiki/Himadri_Station), [NCPOR](https://ncpor.res.in/app/webroot/pages/view/340-himadri-station), [PIB](https://www.pib.gov.in/PressReleasePage.aspx?PRID=1987724) |
| **Himansh** | Sutri Dhaka, Chandra basin, Lahaul-Spiti, HP | **32.4094** | **77.6089** | 4,080 m | Unveiled 9 Oct 2016 | 8 persons | [NPDC Himansh](https://npdc.ncpor.res.in/npdc/himansh.action), [Himalaya page](https://ncpor.res.in/pages/display/268-himalaya) |
| Dakshin Gangotri (historic) | Ice shelf, cDML | −70.0742 | 12.0033 | on ice shelf | Built during the 3rd expedition, completed Jan 1984 | Now a supply base and transit camp | [PIB 2015](https://pib.gov.in/newsite/PrintRelease.aspx?relid=123510), [Wikipedia](https://en.wikipedia.org/wiki/Dakshin_Gangotri) |
| Maitri-II (planned) | Near Maitri | TBD | TBD | — | ₹29.2 cr approved for design and DPR; operational ~**2032** | Year-round | [PIB Dec 2025](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2201536) |

**Dakshin Gangotri history.** India's first permanent station, built on the ice shelf. It hosted the first Indian winter-over and, in 1984, the first Indian post office in Antarctica. It was buried by ice, decommissioned on 25 Feb 1990 and replaced by Maitri about 90 km away ([Wikipedia](https://en.wikipedia.org/wiki/Dakshin_Gangotri)). NPDC still files **60 datasets** under "Dakshin Gangotri" ([browse](https://npdc.ncpor.res.in/npdc/browse_by_location.action)).

**Maitri-II status.** The Dec 2023 Rajya Sabha reply said the site had been identified and a road survey was under way, with a phased plan of 18 + 18 + 18 + 12 months ([PIB](https://www.pib.gov.in/PressReleasePage.aspx?PRID=1989168)). By Dec 2025 the target had moved to "seven years… completion by 2032" ([PIB](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2201536)). Wikipedia's "₹1250 crore to design and prepare a DPR" conflicts with PIB's ₹29.2 cr, so use PIB.

### 5.1 Connectivity and what it means for design

| Site | What is documented | Design implication |
|---|---|---|
| Maitri | Dedicated SATCOM (SAC + ECIL) since 2008, **4 MHz bandwidth**, voice/video/data ([Achievements](https://ncpor.res.in/antarcticas/display/369-significant-achievements-)); ECIL "revamping of NCPOR-Maitri link" began in 2022 ([Updates](https://ncpor.res.in/pages/view/247-expedition-updates)); 2026: "high-speed internet" with no Mbps figure ([46-ISEA](https://ncpor.res.in/files/Webpage%20advertisment.pdf)) | Resumable chunked upload (tus-style); overnight sync windows; thumbnails and transcripts first, originals later |
| Bharati | Earth station with X/S-band remote-sensing reception and a **C-band data link to NRSC Hyderabad** ([Achievements](https://ncpor.res.in/antarcticas/display/369-significant-achievements-)) | Same as Maitri |
| Both Antarctic stations | IP EPABX since 2015–16; personal calls **6 min/month in summer, 20 min/month in winter**; **one common email ID per station and ship** ([46-ISEA §4.3](https://ncpor.res.in/files/Webpage%20advertisment.pdf)) | Email-to-archive **cannot trust the From address**. Use per-person upload codes in the subject line, or signed tokens |
| Himadri | Ny-Ålesund fibre since June 2015 ([NORDUnet](https://nordu.net/uninett-deploys-arctic-fibre/)); **radio silence at 2–32 GHz within 20 km, with Wi-Fi, Bluetooth and mobile phones prohibited** ([RCN](https://www.forskningsradet.no/en/svalbard-science-forum/planning-research/)) | The field app must sync over **wired LAN**; no Wi-Fi or Bluetooth pairing flows |
| Himansh | Road open only June–Nov; AWS data appears live on [data.ncpor.res.in](https://data.ncpor.res.in/) ([Himansh](https://npdc.ncpor.res.in/npdc/himansh.action)) | Offline for months; batch sync after the season |

---

## 6. Expeditions

| Programme | Since | Count (as of 30 Sep 2026) | Current | Cadence | Source |
|---|---|---|---|---|---|
| ISEA (Antarctica) | 1981–82: led by Dr S.Z. Qasim, reached Antarctica 8 Jan 1982 per PIB (other sources say 9 Jan) | **44 completed; 45th underway** | 45-ISEA first team reached Maitri 4 Nov 2025; **46-ISEA induction Nov 2026** (theme: "Climate Change and its signatures in Antarctica"; new GeoEAIS Amery Ice Shelf programme) | Yearly | [PIB 2015](https://pib.gov.in/newsite/PrintRelease.aspx?relid=123510), [News 929](https://ncpor.res.in/news/view/929), [46-ISEA call](https://ncpor.res.in/files/Webpage%20advertisment.pdf) |
| Arctic (Himadri) | Team visit 2007; station 2008; Arctic Council observer 2013; first **winter** expedition flagged off 18 Dec 2023 | ~13 expeditions by 2023 (medium confidence, secondary source) | 2026–27 call covers Apr 2026–Mar 2027 | Yearly, now year-round | [NCPOR Arctic](https://ncpor.res.in/arctics), [PIB](https://www.pib.gov.in/PressReleasePage.aspx?PRID=1987724), [call](https://ncpor.res.in/news/view/924), [Nature India](https://www.nature.com/articles/d44151-023-00203-z) |
| Southern Ocean (ISESO) | Pilot 2004 on ORV Sagar Kanya | 11 by the 2022 call; **12th in Feb 2025** from Mauritius on SA Agulhas | — | Roughly every 1–2 years | [SO page](https://ncpor.res.in/pages/display/270-southern-ocean), [2023 call](https://ncpor.res.in/news/view/613), [IMPRI](https://www.impriindia.com/insights/india-scientific-expeditions-southern-ocean/) |
| Himalaya (Himansh) | Recce 2012; station 2016 | Seasonal campaigns | 6 glaciers (280 km²) monitored; 2 AWS; 5 water-level recorders | June–Nov | [Himalaya](https://ncpor.res.in/pages/display/268-himalaya) |

**Annual ISEA cycle** (from [Timeline](https://ncpor.res.in/antarcticas/display/385-timeline) and the 46-ISEA dates): call for proposals Feb → online submission by 20 Feb 2026 → screening by 30 Mar → defence workshop 22–23 Apr → personnel and permit forms in May → leader nominations by 31 Jul → cargo 31 Aug / 1 Oct → medicals and Auli snow training Jul–Oct → **air induction Nov** (Cape Town → Novo, ~6 h) → voyage Dec/Jan (Cape Town → Bharati 10–12 d → Maitri 5–7 d → Cape Town 8–12 d) → **post-activity permit report (R1–R3) within 3 months** → NPDC submission on return ([46-ISEA call](https://ncpor.res.in/files/Webpage%20advertisment.pdf)).

### 6.1 What expeditions produce: the content HIMVANI archives

| Output | Producer | Format | Where it lives today | Machine access | Volume found | Embargo |
|---|---|---|---|---|---|---|
| Scientific Reports of ISEA (1–30; reports 6–8 marked "Not Published") and Technical Publications | NCPOR/DOD | PDF chapters, EN | [DSpace](http://14.139.119.23:8080/dspace/index.jsp) | **OAI-PMH oai_dc** ([endpoint](http://14.139.119.23:8080/dspace-oai/request?verb=ListRecords&metadataPrefix=oai_dc)) | 825 OAI records: 679 Technical Report, 22 Book; 789 PDF; 100% English (our harvest). The web UI shows 787 items ([browse](http://14.139.119.23:8080/dspace/browse-title)) | None |
| Dataset metadata and data | PIs | Web form + files | [NPDC](https://npdc.ncpor.res.in/npdc/homepage.action) | HTML and PDF only | ~900 records | 2–5 yr lock-in |
| AWS / meteorological data | Stations | Live values, charts, CSV | [data.ncpor.res.in](https://data.ncpor.res.in/) | HTML | 4 stations live | None |
| News and institutional activities | NCPOR | HTML + **RSS 2.0** | [news](https://ncpor.res.in/news), [news.xml](https://ncpor.res.in/upload/rssfeed/news.xml) | RSS with full descriptions but no per-item links | **835 items, 2012-02-22 → 2026-09-25** | None |
| Expedition calls and advertisements | NCPOR | PDF | ncpor.res.in/files | — | Yearly | None |
| Photos | Members, NCPOR | JPG albums | [photogallery](https://ncpor.res.in/photogallery) | HTML | Albums up to 2023 | Consent and credit needed |
| Videos | NCPOR | YouTube | [channel](https://www.youtube.com/channel/UC1h2xM-VmB1opmtTa4IreQQ) | YouTube API | 92 videos | None |
| Publications lists | NCPOR groups | HTML with DOIs | e.g. [SO publications](https://ncpor.res.in/pages/view/77/335-list-of-publications) | HTML → Crossref lookup | Hundreds | Publisher licences |
| Post-activity permit reports | PIs → CAG-EP | Forms R1–R3 | MoES | Not public | — | Internal |
| Treaty information exchange | MoES/NCPOR | PDF | ATS EIES, e.g. [inpre08e.pdf](https://documents.ats.aq/EIES/IE/inpre08e.pdf) | Public | Yearly | None |
| Expedition member directory | NCPOR | Web search | [Polar Directory](https://data.ncpor.res.in/PolarDirectory/) | HTML | — | Personal data (DPDP) |
| Annual reports, in-house magazine | NCPOR | PDF | [/annualreports](https://ncpor.res.in/annualreports) | — | Yearly | None |

---

## 7. Benchmarks worth copying

| Portal | Best at | Steal for HIMVANI | Source |
|---|---|---|---|
| **Discovering Antarctica** (BAS + RGS) | Curriculum-mapped learning for ages 7–18 (KS2–KS5) across 8 themes (ecosystems, climate change, governance, …), with interactives and explorer diaries | A "Learn" hub mapped to class bands (6–8, 9–10, 11–12) with printable activities | [discoveringantarctica.org.uk](https://discoveringantarctica.org.uk/) |
| **UK Polar Data Centre** (BAS) | A CoreTrustSeal-approved publishing workflow ending in a DOI-backed citation | Draft → curator check → publish with DOI → "cite this" box | [re3data](https://www.re3data.org/repository/r3d100010120) |
| **Australian Antarctic Data Centre** | DIF as the canonical store, auto-converted to ISO 19115; ~800 dataset DOIs; hosts the SCAR gazetteer | Store DIF-10 JSON internally, emit ISO 19115 and schema.org on demand | [re3data](https://www.re3data.org/repository/r3d100000038), [CoreTrustSeal](https://www.coretrustseal.org/wp-content/uploads/2018/11/Australian-Antarctic-Data-Centre-AADC.pdf) |
| **NSIDC** | "Sea Ice Today": monthly expert analysis on top of near-real-time charts; a searchable Cryosphere Glossary | A "Station Today" card from AWS feeds; seed the locked glossary from NSIDC terms | [Sea Ice Today](https://nsidc.org/sea-ice-today), [Glossary](https://nsidc.org/learn/cryosphere-glossary) |
| **SCAR** | Composite Gazetteer: 39,187 names for 20,159 features from 22 countries; SCADM runs the data system | Use CGA IDs as the canonical location tags, which fixes NPDC's free-text locations | [SCAR CGA](https://data.aad.gov.au/aadc/gaz/scar/), [ADMS](https://scar.org/library-data/data/adms) |
| **GCMD / Antarctic Master Directory** | The AMD is an IDN node of DIF records; KMS serves controlled keywords as CSV/JSON (v24.8) | Use KMS keywords as the AI tagger's closed label set; push DIF to the AMD | [ADMS](https://scar.org/library-data/data/adms), [KMS CSV](https://cmr.earthdata.nasa.gov/kms/concepts/concept_scheme/sciencekeywords?format=csv) |
| **PANGAEA** | 447,489 datasets, each with a DOI; scientist-editors review every submission; feeds DataCite, GBIF, OpenAIRE and Google Dataset Search | A curator review queue, plus schema.org `Dataset` markup so records appear in Google Dataset Search | [PANGAEA about](https://www.pangaea.de/about/) |
| **Polar Data Catalogue** (Canada) | ISO 19115/FGDC records (3,055 records, 460 DOIs); CoreTrustSeal; map search; metadata API in JSON/XML | Map-first search and a public read API | [polardata.ca](https://www.polardata.ca/) |
| Quantarctica (NPI) | Free offline QGIS basemap package, already linked from NPDC | Offline basemap for the field app and Explore | [NPDC link list](https://npdc.ncpor.res.in/npdc/homepage.action) |

---

## 8. Personas

These are synthesised from the sources cited in each row. Each needs 2 validation interviews. Names are fictional.

| Persona | Context (sourced) | Top jobs | Pains | Must-haves in HIMVANI |
|---|---|---|---|---|
| **Dr Kavya Nair, 34, atmospheric scientist, winter-over at Bharati (45-ISEA)** | Personal calls limited to 20 min/month in winter; one shared station email; fieldwork within ~100 km; must file metadata with NPDC or future proposals may be blocked; post-activity report due within 3 months ([46-ISEA](https://ncpor.res.in/files/Webpage%20advertisment.pdf)) | Get 40 GB of instrument data and 3,000 photos off-site safely; keep them under embargo; tick the NPDC box without filling forms | A slow link; a shared inbox; 2-year lock-in anxiety; forms after the season | Offline queue with per-file embargo; AI-drafted DIF she only confirms; a subject-line upload code for the shared mailbox; embargo date defaulting to season end + 2 years |
| **Rohan Naik, NPDC data manager, Goa** | About 900 records, free-text locations, broken XML export, no DOIs, near-absent from AMD ([§4](#4-npdc-in-detail)) | Clean records, get DOIs, report compliance per expedition, meet SCADM duties | Legacy Struts on EOL Tomcat; PIs skip fields | Bulk import of NPDC records; gazetteer and keyword normaliser; DIF-10 export; DOI-ready DataCite XML; compliance dashboard by ISEA number |
| **Priya Sharma, outreach consultant, MoES (New Delhi)** | NCPOR published 131 news items in 2025 ([RSS](https://ncpor.res.in/upload/rssfeed/news.xml)); press communiqués must be in Hindi and English ([Official Languages Act §3(3)](https://rajbhasha.gov.in/en/official-languages-act-1963)); runs @moesgoi ([Instagram](https://www.instagram.com/moesgoi/)) | Turn a station update into a bilingual press note plus social posts the same day | Hand-writing each post; no photo credits; approval chains | Studio with EN+HI press note by default; one-click reviewer approval; asset rights and credit fields; a scheduled-posting export |
| **Meena, 13, Class 8, Tamil-medium government school (Madurai)** | Tamil-medium admissions still dominate Class 1 in TN government schools (72,646 Tamil vs 19,053 English in 2025-26) ([DT Next](https://www.dtnext.in/news/tamilnadu/over-72k-kids-enrol-in-tamil-medium-schools-for-class-1-across-tn-827304)); uses a shared family phone | Ask "பனிக்கட்டி ஏன் உருகுகிறது?" ("why does ice melt?") and understand the answer | English-only pages; jargon; data costs | No login (children's data needs verifiable parental consent under the [DPDP framework](https://www.meity.gov.in/data-protection-framework)); Tamil text and voice; answers under 120 words with glossary pop-ups; light pages |
| **Mr Senthil Kumar, science teacher, same school** | Only **58.6%** of government schools have internet, against 77.1% of private schools ([UDISE+ 2024-25](https://educationforallinindia.com/school-infrastructure-insights-from-udise-2024-25/)) | A 40-minute lesson on the poles and the monsoon | No offline material; content not mapped to class | Printable PDF worksheets; projector mode; lesson packs by class band; QR codes linking to the Ask page |
| **Ananya Rao, science correspondent, Hindi daily** | Relies on PIB-style releases; official pages carry errors ([§3.2](#32-ux-and-content-gaps)) | Verify a figure by 6 pm, get a quote and a photo | Stale or contradictory pages; unclear image rights | Press room with embargo timestamps, sourced fact cards, hi-res images with licence and credit, a scientist contact request form |
| **Rajesh, 45, Goa resident, Antarctica Day visitor** | NCPOR runs public exhibitions and Antarctica Day events ([X](https://x.com/ncaor_goa/status/1895613296520413354)) | "Why does Antarctica matter for our rain?" | Dense sites; no Konkani or Marathi | Short videos, map explorer with live station weather, Ask in Konkani |

---

## 9. PRITHVI and REACHOUT

| Fact | Value | Source |
|---|---|---|
| PRITHVI approval | Cabinet approved on 5 Jan 2024 for **2021–26**, ₹4,797 cr, with 5 sub-schemes: ACROSS, O-SMART, **PACER** (polar), SAGE, **REACHOUT** | [PIB](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2003592), [PMIndia](https://www.pmindia.gov.in/en/news_updates/cabinet-approves-overarching-scheme-prithvi-vigyan-prithvi-of-the-ministry-of-earth-sciences/) |
| PRITHVI after March 2026 | **Continues as a budget head**: BE 2026-27 ₹2,767.29 cr (RE 2025-26 ₹2,400 cr); MoES net total ₹3,789.23 cr. We found no appraisal for 2026–31 | [Demand No. 24, 2026-27](https://www.indiabudget.gov.in/doc/eb/sbe24.pdf) |
| REACHOUT role | "enhances awareness through exhibitions, workshops, and knowledge resource centres" | [Demand No. 24](https://www.indiabudget.gov.in/doc/eb/sbe24.pdf) |
| REACHOUT sub-schemes | (1) RDESS, (2) **Outreach and awareness**, (3) **Knowledge Resources Center Network (KRCNet)**, (4) BIMSTEC Centre for Weather & Climate, (5) ITCOocean, (6) DESK (skilled workforce) | [ISTI portal](https://www.indiascienceandtechnology.gov.in/programme-schemes/research-and-development/research-education-training-and-outreach-reachout) |
| Fit for HIMVANI | Ask and Studio fit **Outreach and awareness**; the archive fits **KRCNet**; station operations fit PACER | Our inference |

---

## Recommendations for HIMVANI

1. **Add "Activity" (institutional event) and "Publication" as first-class content types.** The official PS names both, and our submission covers neither.
2. **Seed the corpus by harvesting DSpace OAI-PMH (825 records) and NCPOR RSS (835 items) before writing any scraper.** Both are live, structured, legal to reuse and ready for Week 1.
3. **Import NPDC's ~900 records by crawling the HTML record pages (the XML export is broken) and map them to DIF-10 JSON.** This shows day-1 value to the NPDC data manager and fixes the gap in the AMD.
4. **Make GCMD KMS keywords (v24.8) the AI tagger's closed label set, and SCAR CGA the location authority.** A closed set stops hallucinated tags and fixes free-text locations such as "Larsemann Hill" vs "Larsemann Hills".
5. **Build a canonical `station` / `expedition` facts table and render every page from it.** NCPOR's own pages disagree on Maitri's coordinates and Bharati's year.
6. **Add a "source conflict / outdated" flag to Ask answers and an editor queue for disputed source passages.** Official pages have factual errors, so a cited answer can still be wrong.
7. **Preserve numbers in translation: block publication if a digit, coordinate or date differs between the source and translated text.** The Hindi Maitri page dropped a digit from 11°.
8. **Email-to-archive must authenticate with per-person codes, not the sender address.** Stations and the ship share one email ID.
9. **The field app must sync over wired LAN; no Wi-Fi or Bluetooth pairing.** Ny-Ålesund bans 2–32 GHz within 20 km.
10. **Use resumable, chunked uploads and send derivatives first (thumbnail, transcript, metadata) and originals later.** Maitri's link is 4 MHz, and people have only minutes of personal calls a month.
11. **Default the embargo to season end + 2 years (up to 5) with a public/internal flag per file.** This matches NPDC policy exactly, so data managers can trust it.
12. **Replace "216 drafts per update" with a default of EN + HI + 2–3 target languages and generate other languages on demand.** At 131 updates a year, 216 drafts each is about 28,000 drafts a year to review, which no MoES team can do. The Official Languages Act makes EN+HI mandatory anyway.
13. **Mint DOIs through DataCite, via an Indian consortium route (INFLIBNET) or NCPOR membership, and write DataCite XML now.** NCPOR has no DataCite client today ([INFLIBNET DataCite](https://hrd.inflibnet.ac.in/DataCite-GAF/datacite.php)), and the DOI claim is only credible with a named path.
14. **Emit schema.org `Dataset` / `NewsArticle` markup and put the language in the URL.** This fixes zero Hindi SEO today and makes records visible in Google Dataset Search, as PANGAEA's are.
15. **Mask personal contact details and route contact through a relay form.** NPDC exposes PI emails and phones, which carries DPDP risk.
16. **Show live AWS data on the Explore map (4 stations) and add Himansh plus Dakshin Gangotri as a historic site.** It is free, live, eye-catching content and covers the Himalaya, which the submission omits.
17. **Keep station operations, logistics, energy and sea-ice forecasting out of scope and say so in the pitch.** Those belong to sibling PSs 26059–26062, and judges will check the boundary.
18. **Pitch sustainability under REACHOUT's "Outreach and awareness" and KRCNet sub-schemes, not just "REACHOUT".** Naming the exact sub-schemes shows we know the funding path.
19. **Build the demo around the December 2026 moment: the 46-ISEA induction goes into the archive, Ask and Studio.** The expedition will be live news during the finale.

## Corrections to our submission

| # | Claim in `00-problem-statement.md` | Status | Correct version |
|---|---|---|---|
| 1 | "Split across **two websites**: the NCPOR site and NPDC" | **Understated** | At least 8 properties: ncpor.res.in/ncaor.gov.in, NPDC, data.ncpor.res.in, DSpace (bare IP), isea, onlineform, synopticdata/LAS, plus YouTube/X/Facebook ([§3.1](#31-properties)) |
| 2 | "Reports… mostly **untagged**" | **Partly wrong** | DSpace items do carry `dc:subject` tags, and NPDC uses GCMD-style keywords. The real problems are **uncontrolled vocabularies, English-only PDFs, no DOIs and unresolvable handles** ([DSpace OAI](http://14.139.119.23:8080/dspace-oai/request?verb=Identify), [browse](https://npdc.ncpor.res.in/npdc/browse_by_location.action)) |
| 3 | "44 completed… 45th underway" | **True today; outdated by the finale** | 46-ISEA induction is in Nov 2026 ([call](https://ncpor.res.in/files/Webpage%20advertisment.pdf)). For December say "45 expeditions since 1981-82; 46th underway" |
| 4 | "PRITHVI scheme **2021–26**: ₹4,797 cr" | **Outdated** | That period ended on 31 Mar 2026. PRITHVI continues in Budget 2026-27 (BE ₹2,767.29 cr) ([Demand No. 24](https://www.indiabudget.gov.in/doc/eb/sbe24.pdf)). Name the REACHOUT sub-schemes "Outreach and awareness" and "KRCNet" ([ISTI](https://www.indiascienceandtechnology.gov.in/programme-schemes/research-and-development/research-education-training-and-outreach-reachout)) |
| 5 | Inputs come from "Maitri and Bharati… and Himadri" | **Incomplete** | Add Himansh (Himalaya, 2016), the Southern Ocean expeditions (12 by 2025) and historic Dakshin Gangotri ([§5](#5-stations-map-ready), [§6](#6-expeditions)) |
| 6 | The PS was paraphrased as reports, photos and data | **Incomplete** | The official text also lists **publications** and **institutional activities** ([sih.gov.in](https://sih.gov.in/sih2026PS)) |
| 7 | Ref [1] `ncaor.gov.in/news/view/929` | **Broken over HTTPS** | The TLS certificate covers only `*.ncpor.res.in`. Use https://ncpor.res.in/news/view/929 |
| 8 | Ref [2] `isea.ncpor.res.in/forms/46-ISEA…pdf` | **Unreachable (502) on 30 Sep 2026** | Mirror at https://ncpor.res.in/files/Webpage%20advertisment.pdf |
| 9 | Ref [3] PIB relid=123510 | **Dated 22 Jul 2015** (says "thirty five expeditions") | Use it only for the 1981 start. Note the landing date: PIB says 8 Jan 1982, other sources 9 Jan |
| 10 | Ref [4] Wikipedia, Indian Antarctic Programme | **Stale** (says 40 expeditions, table ends at the 42nd) | Cite the NCPOR Bharati page and PIB instead |
| 11 | "Outreach… in **two languages**" / NCPOR site "2" languages | **Generous** | English-first. The Hindi toggle covers static pages only; 57 of 835 news items (6.8%) have Hindi titles; Hindi URLs cannot be shared ([§3.2](#32-ux-and-content-gaps)) |
| 12 | "NCPOR reports, photos and NPDC datasets are **already public**" | **Partly true** | Metadata and reports are public. NPDC data sits under a 2–5 yr lock-in; photos lack stated licences ([data policy](https://npdc.ncpor.res.in/npdc/mainmenu_home.action?ref_id=REF14329&main_menu_id=55&main_menu_name=Data+Policy+%26amp%3B+Guidelines)) |
| 13 | "FAIR datasets with DOIs" (implied as a platform feature) | **Needs a path** | NCPOR has no DataCite client today. State the route (DataCite via INFLIBNET or NCPOR membership) |
| 14 | "One upload gives **216 drafts**" | **Operationally unrealistic** | At about 131 updates a year this is about 28,000 drafts a year to review. Present it as "up to 216 on demand; default EN+HI+regional" |
