# AI Pipeline: Enrichment + Grounded RAG with Sentence-Level Citations (HIMVANI, Sept 2026)

> Research note for PS 26063. Scope: what a 6-student team (2 backend+AI, 1 data) can build, run and defend in 12 weeks. It traces back to [`docs/00-problem-statement.md`](../00-problem-statement.md). Facts were checked on 2026-09-30. "(est.)" means the number is our own arithmetic, not a published figure.

## TL;DR

- **Keep everything in Postgres, then let an LLM write *and a checker verify*.** Retrieval runs three legs: **bge-m3** dense (`halfvec(1024)`) + bge-m3 sparse (`sparsevec`) + English `tsvector`. RRF (k=60) fuses them and **bge-reranker-v2-m3** reranks. Every answer sentence has to (a) quote a chunk verbatim and (b) pass an NLI entailment check. Sentences that fail are dropped, and if nothing survives the system refuses. Grounded generation alone is not enough: ALCE found the best models lacked full citation support [50% of the time](https://arxiv.org/abs/2305.14627).
- **Answer in English first, then translate.** The archive is mostly English. Multilingual NLI checkers cover only a few Indic languages ([mDeBERTa-xnli: hi/bn/mr/ta/ur, no te](https://huggingface.co/MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7/raw/main/README.md)). LLMs also prefer to cite English sources anyway ([Ki et al., ICML 2026](https://arxiv.org/abs/2509.13930)). So we retrieve cross-lingually, generate and verify in English, translate with Bhashini plus a locked glossary, and always show the original English quote.
- **LLM:** for the demo, use **Claude Opus 5.5** (`claude-opus-5-5`, [$4/$20 per MTok](https://platform.claude.com/docs/en/about-claude/pricing)). Its `search_result` blocks return sentence-level `cited_text` natively ([docs](https://platform.claude.com/docs/en/build-with-claude/search-results)). For sovereign production, self-host **Gemma 4 26B-A4B** ([Apache-2.0, 3.8B active, 256K ctx](https://ai.google.dev/gemma/docs/core/model_card_4)) on vLLM on one L40S/H100 via IndiaAI compute. The fallback is **Claude on Bedrock with India in-country inference** (`in.anthropic.claude-sonnet-5`, Mumbai/Hyderabad; [announced 2026-09-30](https://rss.boorghani.com/amazon-bedrock-expands-claude-model-availability-to-in-country-inferencing-in-india)).
- **Enrichment needs different models from the ones the submission named.** OCR: **Docling + PaddleOCR-VL** ([Apache-2.0, 109 languages](https://huggingface.co/PaddlePaddle/PaddleOCR-VL)), with Tesseract Indic as the fallback. ASR: **IndicConformer-600M** ([MIT, 22 languages](https://huggingface.co/ai4bharat/indic-conformer-600m-multilingual)) or Bhashini for Indic audio, and faster-whisper only for English. Images: **SigLIP 2**, not CLIP ([CLIP is English-only](https://github.com/openai/CLIP/blob/main/model-card.md)). Metadata: extract with an LLM into a JSON schema, and choose GCMD keywords only from retrieved **GCMD v24.8** candidates ([KMS CSV](https://cmr.earthdata.nasa.gov/kms/concepts/concept_scheme/sciencekeywords?format=csv)).
- **Guardrails belong in the database, not in the prompt.** Postgres RLS plus per-leg `WHERE` filters stop embargoed text from ever reaching the LLM. Only human-confirmed documents are indexed for public Ask, which is our defence against poisoning and indirect injection ([OWASP LLM01/LLM08](https://www.indusface.com/learning/owasp-llm-vector-and-embedding-weaknesses/)). Studio has a claim ledger and a numeric-match check, human approval, and AI labels as the [IT Amendment Rules 2026](https://www.khaitanco.com/thought-leadership/MeitY-notifies-the-IT-Amendment-Rules-2026) require.

---

## 0. Assumptions and the pipeline in one picture

| Assumption | Why it matters |
|---|---|
| The corpus is mostly English: ISEA scientific reports, NPDC metadata, press releases. There is some Hindi, and a few scans are decades old. | This supports the English-pivot design and English BM25. |
| The MVP corpus is 10³–10⁴ documents, which is about 10⁴–10⁵ chunks (est.) | One Postgres instance holds this. No separate vector DB is needed. |
| The demo uses public NCPOR/NPDC documents only | A foreign API is acceptable for the demo but not for embargoed data. |
| Pilot GPU budget: 1× L40S (LLM) + 1× L4 (everything else) | This sets the model sizes below. |

```
UPLOAD (web / email / field-app sync)
  └─► quarantine bucket ──► Docling parse ──► [scanned? → PaddleOCR-VL | Tesseract fallback]
                              ├─► audio/video → VAD → IndicConformer | faster-whisper → (pyannote) → timed transcript
                              ├─► images → EXIF strip → SigLIP 2 tags + VLM alt-text → face/PII flag
                              └─► text → Prompt-Guard scan → Presidio PII → LLM metadata (JSON schema + GCMD candidates)
  └─► HUMAN CONFIRM (metadata UX)  ← doubles as moderation gate
  └─► INDEX: chunk(dense halfvec, sparse sparsevec, tsvector, ACL, embargo) in Postgres + object store
ASK:   query → script/lang detect → translate→EN (Bhashini) → 3-leg retrieval (RLS-filtered) → RRF → rerank
       → generate (Claude search_result | Gemma JSON) → quote check → NLI check → drop/refuse → translate back
STUDIO: source update → claim ledger (verified) → 6 English masters (claim-ids per sentence) → checks
       → human approve → Bhashini ×36 + glossary → auto-QA → sampled human check → publish (AI label)
```

---

## 1. Citation-grounded RAG

### 1.1 Hybrid retrieval inside Postgres

| Leg | What | Why | Source |
|---|---|---|---|
| Dense | bge-m3 dense, `halfvec(1024)`, HNSW `halfvec_cosine_ops` | Cross-lingual semantic match. A Hindi query can find an English chunk. | [bge-m3](https://huggingface.co/BAAI/bge-m3), [pgvector halfvec](https://github.com/pgvector/pgvector) |
| Sparse (lexical, multilingual) | bge-m3 lexical weights → `sparsevec(250002)`, HNSW `sparsevec_ip_ops` | Postgres has **no Hindi or Indic stemmer**. `simple` FTS treats every inflection as a different word ([write-up](https://kdpisda.in/hindi-semantic-search-pgvector-django/)). M3-sparse still beats BM25 on MIRACL-hi (48.2 vs 35.0) ([paper T1](https://arxiv.org/html/2402.03216v4)). pgvector can index sparsevec up to 1,000 non-zero entries ([README](https://github.com/pgvector/pgvector)), which covers a chunk of 400 tokens or fewer. | vLLM serves the full model with `--hf-overrides '{"architectures":["BgeM3EmbeddingModel"]}'` ([vLLM docs](https://docs.vllm.ai/en/stable/models/pooling_models/specific_models)) |
| Lexical (English) | `tsvector` (`english` config) queried with the English-translated query | This is the exact-term leg for station and instrument names, expedition numbers and species. | [pgvector hybrid guidance](https://github.com/pgvector/pgvector) |
| Fuzzy names only | `pg_trgm` on titles, people, station and instrument names | pg_trgm skips non-alphanumerics ([docs](https://www.postgresql.org/docs/current/pgtrgm.html)) and cannot bridge romanized and Devanagari spellings ([write-up](https://kdpisda.in/hindi-semantic-search-pgvector-django/)). Do not use it on Indic body text. | — |
| Fusion | RRF, k=60, top-50 per leg → 40 candidates | Rank-only fusion, so no score normalisation is needed. k=60 is the value from the original RRF paper ([ParadeDB](https://www.paradedb.com/blog/hybrid-search-in-postgresql-the-missing-manual)). pgvector's own docs recommend RRF or a cross-encoder ([README](https://github.com/pgvector/pgvector)). | — |
| Filtered ANN | `SET hnsw.iterative_scan = relaxed_order` (pgvector ≥0.8; current release 0.8.6) | Without it, ACL/embargo filters can return fewer than `LIMIT` rows ([README](https://github.com/pgvector/pgvector), [Supabase](https://supabase.com/docs/guides/ai/vector-indexes/hnsw-indexes)) | `hnsw.max_scan_tuples` default 20,000 |

```sql
-- pgvector 0.8.6 · Postgres 18
CREATE TABLE chunk (
  id            bigserial PRIMARY KEY,
  doc_id        bigint NOT NULL REFERENCES document(id),
  lang          text   NOT NULL,                       -- BCP-47 of chunk text
  text          text   NOT NULL,
  heading_path  text,                                  -- "ISEA-27 Report > 4 Glaciology > 4.2 Ice cores"
  page_from int, page_to int, bboxes jsonb,            -- Docling provenance → PDF highlight
  sent_spans    int4range[],                           -- sentence char offsets (for highlight + Claude blocks)
  dense         halfvec(1024) NOT NULL,                -- bge-m3 dense
  sparse        sparsevec(250002),                     -- bge-m3 lexical weights (XLM-R vocab = 250,002)
  tsv           tsvector GENERATED ALWAYS AS (
                  to_tsvector(CASE WHEN lang='en' THEN 'english'::regconfig ELSE 'simple'::regconfig END,
                              coalesce(heading_path,'')||' '||text)) STORED,
  visibility    smallint NOT NULL DEFAULT 2,           -- 0 public · 1 registered · 2 internal
  embargo_until timestamptz
);
CREATE INDEX ON chunk USING hnsw (dense  halfvec_cosine_ops);
CREATE INDEX ON chunk USING hnsw (sparse sparsevec_ip_ops);
CREATE INDEX ON chunk USING gin  (tsv);
ALTER TABLE chunk ENABLE ROW LEVEL SECURITY;                       -- Ask connects as role ask_public
CREATE POLICY public_read ON chunk FOR SELECT TO ask_public
  USING (visibility = 0 AND (embargo_until IS NULL OR embargo_until <= now()));

-- $1 dense q, $2 sparse q, $3 English query text. RLS applies the ACL in every leg.
SET hnsw.iterative_scan = relaxed_order;
WITH d AS (SELECT id, row_number() OVER (ORDER BY dist) r FROM
            (SELECT id, dense <=> $1 dist FROM chunk ORDER BY dist LIMIT 50) x),
     s AS (SELECT id, row_number() OVER (ORDER BY dist) r FROM
            (SELECT id, sparse <#> $2 dist FROM chunk ORDER BY dist LIMIT 50) x),
     l AS (SELECT id, row_number() OVER (ORDER BY rk DESC) r FROM
            (SELECT id, ts_rank_cd(tsv, q) rk FROM chunk, websearch_to_tsquery('english', $3) q
             WHERE tsv @@ q ORDER BY rk DESC LIMIT 50) x)
SELECT id, sum(1.0/(60+r)) rrf FROM (SELECT * FROM d UNION ALL SELECT * FROM s UNION ALL SELECT * FROM l) u
GROUP BY id ORDER BY rrf DESC LIMIT 40;
```

Storage: halfvec(1024) takes about 2 KB per chunk, so 10⁵ chunks come to about 0.2 GB before index overhead (est.). Storing the column as `halfvec` directly avoids the expression-index cast pattern ([README](https://github.com/pgvector/pgvector)).

### 1.2 Reranking (MIRACL nDCG@10, from [jina-reranker-v3 paper, Table](https://arxiv.org/html/2509.25085))

| Reranker | Size | Licence | Avg | bn | hi | te | Verdict |
|---|---|---|---|---|---|---|---|
| **bge-reranker-v2-m3** | 0.6B | [Apache-2.0](https://huggingface.co/BAAI/bge-reranker-v2-m3) | **69.32** | **81.85** | 67.66 | **76.69** | **Pick.** Best on bn and te and small. Recommended max_length is 512, so keep chunks ≤ ~400 tokens. |
| Qwen3-Reranker-4B | 4B | Apache-2.0 ([repo](https://github.com/QwenLM/Qwen3-Embedding)) | 67.52 | 81.51 | **68.71** | 75.60 | Upgrade only if hi recall is the bottleneck. It is 7× the size. |
| jina-reranker-v3 | 0.6B | **CC BY-NC-SA 4.0** | 66.83 | 79.47 | 61.52 | 74.53 | Not allowed: non-commercial licence. |
| Qwen3-Reranker-0.6B | 0.6B | Apache-2.0 | 56.16 | 66.67 | 60.36 | 69.86 | Weaker |
| mxbai-rerank-large-v2 | 1.5B | — | 57.94 | 63.48 | 45.12 | 62.41 | Weak on Indic |

vLLM serves cross-encoders at `/rerank` ([docs](https://docs.vllm.ai/en/stable/examples/pooling/score)). The same server stack then handles LLM, embeddings and reranking. In Anthropic's study, reranking on top of contextual hybrid retrieval took top-20 failures from 3.7% (contextual dense only) to 1.9%, against a 5.7% baseline ([Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval)).

### 1.3 Chunking for PDFs and reports (layout-aware)

| Decision | Setting | Why / source |
|---|---|---|
| Parser | Docling → `DoclingDocument` → `HybridChunker(tokenizer=bge-m3, max_tokens≈400)` | Chunks follow headings, lists and tables, and each carries page and bbox provenance ([Docling docs via Context7](https://github.com/docling-project/docling/blob/main/docs/examples/advanced_chunking_and_serialization.ipynb)). Docling is MIT, v2.131.0, released 2026-09-29 ([repo](https://github.com/docling-project/docling)). |
| Size | ≤ 400 tokens, with no overlap because tables stay whole | Sized to the reranker's 512-token window ([card](https://huggingface.co/BAAI/bge-reranker-v2-m3)) and the sparsevec index cap of 1,000 non-zero entries. |
| Context header | Prepend `doc title · ISEA n · station · heading_path` to the embedded text, but not to the displayed text | This is a cheap, deterministic version of Contextual Retrieval. The LLM-written context version cut failures by 35% (dense) and 49% (with BM25) ([Anthropic](https://www.anthropic.com/news/contextual-retrieval)). Add the LLM context only if eval shows misses. |
| Sentence spans | Store sentence offsets per chunk. English uses a standard splitter. Indic uses `indic_nlp_library` sentence tokenizer (handles `।`, [MIT](https://github.com/anoopkunchukuttan/indic_nlp_library)). | Needed for highlighting, and for handing Claude one text block per sentence (§1.4). |
| Tables | Keep as Markdown in one chunk and also as JSON on the document | Numeric claims need the whole table in view. |
| Scanned PDFs | Always OCR before indexing | Claude **cannot cite scanned PDFs** because "PDFs that are scans… are not citable" ([Citations docs](https://platform.claude.com/docs/en/build-with-claude/citations)). |

### 1.4 Generation contract and per-sentence attribution

| Path | How citations are produced | Pros | Cons |
|---|---|---|---|
| **A. Claude (demo)** | Send the top-k chunks as `search_result` blocks, each with `content` = one text block per **sentence**, and `citations.enabled=true`. The response returns `search_result_location{source,title,cited_text,start_block_index,end_block_index}` ([docs](https://platform.claude.com/docs/en/build-with-claude/search-results)). | Pointers are "guaranteed to contain valid pointers". `cited_text` does not count toward output tokens. Anthropic reports it quotes more relevant passages than prompt-only approaches ([Citations docs](https://platform.claude.com/docs/en/build-with-claude/citations)). It is available on Bedrock too ([platform table](https://platform.claude.com/docs/en/build-with-claude/citations)). | **It cannot be combined with structured outputs** (returns 400). A valid pointer does not mean the claim is entailed, so NLI is still required. |
| **B. Self-hosted (prod)** | vLLM structured output with this JSON schema ([docs](https://docs.vllm.ai/en/stable/examples/features/structured_outputs)): `{sentences:[{text, cites:[{chunk_id, quote}]}], unanswerable:bool}` | Same schema on any model, and it is sovereign. | The model can invent quotes, so the deterministic check below is mandatory. |

### 1.5 Verification and refusal (the "claim check" from the brief)

| Step | Check | Implementation | On fail |
|---|---|---|---|
| 0 Pre-gen | Top reranker score ≥ τ_ret, calibrated on the golden set | sigmoid(logit) from bge-reranker-v2-m3 | Refuse before generating. This saves cost. |
| 1 Quote | `quote` is an exact substring of the cited chunk after NFC and whitespace normalisation | stdlib string operations | Drop the citation |
| 2 Entail | NLI(premise = quote ± 1 neighbouring sentence, hypothesis = sentence) ≥ τ_nli | `mDeBERTa-v3-base-xnli-multilingual-nli-2mil7` ([MIT, 0.3B](https://huggingface.co/MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7)). Run on the **English** answer. | Drop the sentence |
| 2b Numbers | Every number, date and expedition number in the sentence appears in the cited quote | regex | Drop the sentence |
| 3 Coverage | At least 1 supported sentence and ≥ 60% of sentences kept | — | Refuse: "Not found in the NCPOR archive", plus the 3 closest documents |
| 4 Render | Re-check the ACL of every cited chunk at render time | the same RLS role | Hard fail and log |
| Offline only | LLM-as-judge (Claude Haiku 4.5 or Gemma) plus span detector LettuceDetect-v2 ([MIT, 14-lang PsiloQA](https://github.com/KRLabsOrg/LettuceDetect)) | eval harness | — |

Granite Guardian is another open groundedness detector ([paper](https://arxiv.org/abs/2412.07724)). We skip it and keep one NLI model.

### 1.6 Answer in the query language, or pivot through English?

| | **Pivot (recommended)**: query→EN, answer in EN, verify, translate | Direct: answer in the query language |
|---|---|---|
| Verification | Works for every language. NLI and judges are strongest in English. | NLI coverage is patchy: the mDeBERTa checker lacks te, kn, ml, gu, pa and or ([card languages](https://huggingface.co/MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7/raw/main/README.md)). |
| Language reach | All **36 Bhashini text languages** ([PIB, Jun 2026](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2267632&reg=48&lang=2)) | Limited to what the LLM writes well. Indic-native pre-training does not guarantee quality: on IndicQuest-v2, Sarvam-30B scored 48.7 and Gemma4-31B scored 62.2 ([L3Cube, Aug 2026](https://arxiv.org/html/2608.15535)). |
| Citation bias | Neutral, because the sources are English | Models trade relevance for "linguistic nepotism" ([Ki et al.](https://arxiv.org/abs/2509.13930)) |
| Costs | One extra MT hop of about 1 s (est.). MT errors are handled by the glossary lock and the "show original" toggle. | Lower latency, and more natural phrasing in hi and bn |
| Decision | **Use for MVP in all languages.** | Revisit for hi and bn after the eval |

Query handling: detect the script from Unicode blocks (stdlib). When the script is ambiguous, e.g. Devanagari, which covers hi, mr, ne, sa and kok, use the UI locale as the tie-breaker. Transliterate romanized input with IndicXlit ([MIT](https://github.com/AI4Bharat/IndicXlit)). The dense leg takes the original query and the lexical legs take the English translation. Voice Ask covers only Bhashini's **23 voice languages** ([PIB](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2267632&reg=48&lang=2)).

### 1.7 Evaluation: metrics, golden set, gates

| Metric | Definition / tool | MVP gate |
|---|---|---|
| Retrieval Recall@20, nDCG@10 | Checked against gold chunk IDs | ≥ 0.90 / ≥ 0.70 |
| Citation recall (ALCE) | Is each sentence entailed by its cited passages (NLI)? ([ALCE](https://arxiv.org/abs/2305.14627), [code MIT](https://github.com/princeton-nlp/ALCE)) | ≥ 0.85 |
| Citation precision (ALCE) | Is each citation necessary and relevant? | ≥ 0.90 |
| Faithfulness / ResponseGroundedness | RAGAS v0.4 collections API ([docs](https://docs.ragas.io/en/stable/howtos/migrations/migrate_from_v03_to_v04)); v0.4.3 ([repo](https://github.com/vibrantlabsai/ragas)) | ≥ 0.90 |
| Unanswerable handling | Refusal rate on questions with no answer, and false refusals on answerable ones | ≥ 0.90 and ≤ 0.10 |
| **Embargo leak** | Any embargoed chunk ID appearing in a candidate list or answer | **= 0 (CI hard fail)** |
| Translation fidelity | Native-speaker spot check plus a numeral and glossary match rate | 100% numerals and glossary terms |
| Latency p95 | End to end | ≤ 8 s EN, ≤ 10 s translated (est.) |
| ARES (optional) | Fine-tuned small judges plus PPI with a few hundred human labels ([paper](https://arxiv.org/abs/2311.09476), [Apache-2.0](https://github.com/stanford-futuredata/ARES)) | Only if time allows |

**Golden set (owned by the data person):** 300 items in JSONL in the repo.

- Language mix: 40% en, 20% hi, and 40% across the team's native Indic languages. Indic questions are **written by native speakers**, not machine-translated.
- Question types: 15% unanswerable, 5% embargo bait (the only answer sits in an embargoed document), 10% numeric/date, 10% multi-document.
- Each item holds `{q, lang, gold_chunk_ids[], gold_answer, gold_quote}`.
- Drafting: generate candidates with the RAGAS testset generator, then rewrite them by hand into real student questions. Draw on 40 documents spanning 1981–2026 and every document type.
- Run it nightly in CI. With Claude Haiku 4.5 as judge ([$1/$5](https://platform.claude.com/docs/en/about-claude/pricing)) a run costs under $1 (est.).

---

## 2. Embedding model for multilingual Indic retrieval

MIRACL nDCG@10. Figures for M3 and mE5 come from [bge-m3 paper Table 1](https://arxiv.org/html/2402.03216v4). Qwen3-0.6B figures come from [MILCO Table 1](https://arxiv.org/html/2510.00671). MIRACL's only Indic languages are bn, hi and te.

| Model | Dims | Max tok | Licence | MIRACL bn / hi / te | Notes |
|---|---|---|---|---|---|
| **BAAI/bge-m3** | **1024** | 8192 | **MIT** ([card](https://huggingface.co/BAAI/bge-m3)) | Dense 80.0 / 59.5 / 86.2. All three modes 81.5 / 63.3 / 88.1. | Dense + sparse + multi-vector from one model. Led 8 of 13 Indic languages on IndicMSMarco ([IndicRAGSuite](https://arxiv.org/abs/2506.01615)). Caveat: its fine-tuning included MIRACL train, so these are in-domain numbers ([paper](https://arxiv.org/html/2402.03216v4)). |
| multilingual-e5-large-(instruct) | 1024 | **512** | MIT ([card](https://huggingface.co/intfloat/multilingual-e5-large-instruct)) | mE5-large 75.9 / 62.0 / 84.6 | Very short context and no sparse output |
| Qwen3-Embedding-0.6B / 4B / 8B | 1024 / 2560 / 4096 (MRL) | 32K | Apache-2.0 ([repo](https://github.com/QwenLM/Qwen3-Embedding)) | 0.6B: 66.3 / 51.3 / 77.2 | The 8B ranked #1 on MMTEB (70.58, Jun 2025). 8B at 4096 dims exceeds halfvec's HNSW limit of 4,000, so it must be MRL-truncated ([pgvector](https://github.com/pgvector/pgvector)). |
| jina-embeddings-v3 | 1024 (MRL) | 8192 | **CC BY-NC 4.0** ([Jina](https://jina.ai/models/jina-embeddings-v3/)) | — | Not allowed (non-commercial) |
| jina-embeddings-v4 | 2048 (MRL→128) | — | **Qwen Research Licence (non-commercial)** ([HF](https://huggingface.co/jinaai/jina-embeddings-v4)) | — | Not allowed |
| EmbeddingGemma-300M | 768 (MRL 512/256/128) | 2048 | Gemma Terms ([card](https://huggingface.co/google/embeddinggemma-300m)) | not reported | For on-device or offline field-app search only |

**Recommendation: `BAAI/bge-m3`, stored as `halfvec(1024)`, with its sparse output in `sparsevec(250002)`.** It is MIT-licensed and leads open models on Indic retrieval, and one forward pass fills two of the three retrieval legs. The upgrade path is Qwen3-Embedding-4B with MRL truncation to 1024, which keeps the schema unchanged, but only after it wins on *our* golden set.

---

## 3. LLM for generation: sovereignty, sizing, recommendation

| Model | Total / active | Licence | Ctx | Indic evidence | Serving | Verdict |
|---|---|---|---|---|---|---|
| **Gemma 4 26B-A4B-it** | 25.2B / 3.8B | Apache-2.0 | 256K | 140+ pretraining languages, 35+ out of the box. MMMLU 86.3 ([card](https://ai.google.dev/gemma/docs/core/model_card_4)). The 31B sibling beat Sarvam-30B on IndicQuest-v2 ([L3Cube](https://arxiv.org/html/2608.15535)). | vLLM. FP8 is about 26 GB, so it fits 1× L40S 48 GB (est.). Accepts image input, so it can also caption images. | **Prod primary** |
| Qwen3.6-35B-A3B | 35B / 3B | Apache-2.0 ([card](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)) | 262K | The Qwen3.5 family lists 201 languages ([repo](https://github.com/QwenLM/Qwen3.8)) | vLLM recipe: FP8 on 1× H100, BF16 on 2× H100 ([recipe](https://recipes.vllm.ai/Qwen/Qwen3.6-35B-A3B)) | Alternative primary |
| Sarvam-30B | 32B / 2.4B | Apache-2.0 ([card](https://huggingface.co/sarvamai/sarvam-30b)) | 64K | 22 Indic languages, trained from scratch ([blog](https://www.sarvam.ai/blogs/sarvam-30b-105b)). The 89% pairwise-win figure is self-reported with an LLM judge. | **Needs a vLLM fork or a hot-patch on vLLM 0.15.0** ([card](https://huggingface.co/sarvamai/sarvam-30b)). Current vLLM is v0.30.0 ([releases](https://github.com/vllm-project/vllm/releases)). | Indic-native option with an ops risk. Good "Made in India" story for judges. |
| Sarvam-105B | 106B / 10.3B | Apache-2.0 | 128K | same | Examples use TP 4–8 ([card](https://huggingface.co/sarvamai/sarvam-105b)) | Too large for our budget |
| BharatGen Param2-17B-A2.4B | 17B / 2.4B | **BharatGen non-commercial licence** ([card](https://huggingface.co/bharatgenai/Param2-17B-A2.4B-Thinking)) | 32K | 22 scheduled languages ([Business Standard](https://www.business-standard.com/companies/news/bharatgen-unveils-param2-17b-multilingual-moe-model-under-sovereign-ai-push-126021801194_1.html)) | — | Licence blocks government production use |
| Krutrim-2 12B | 12B | Krutrim Community Licence ([card](https://huggingface.co/krutrim-ai-labs/Krutrim-2-instruct)) | 128K | 22 | — | Licence risk |
| **Claude Opus 5.5** (Claude API) | — | Commercial | 1M | Strong | `inference_geo` supports only `us` or `global`, and workspace data at rest is stored only in `us` ([data residency](https://platform.claude.com/docs/en/manage-claude/data-residency)), so data leaves India | **Demo primary**, public data only |
| Claude Sonnet 5 / Opus 5 / Haiku 4.5 on **Bedrock, India geo** | — | Commercial | — | — | `in.anthropic.claude-*`, routed only between ap-south-1 and ap-south-2 ([AWS post mirror](https://rss.boorghani.com/amazon-bedrock-expands-claude-model-availability-to-in-country-inferencing-in-india)). Regional endpoints cost +10% ([pricing](https://platform.claude.com/docs/en/about-claude/pricing)). AWS is a MeitY-empanelled CSP ([AWS](https://aws.amazon.com/compliance/MeitY/)). | **Sovereign fallback** |

**Claude API prices** ([pricing](https://platform.claude.com/docs/en/about-claude/pricing)):

| Model | Input $/MTok | Output $/MTok |
|---|---|---|
| Opus 5.5 | 4 | 20 |
| Sonnet 5.5 | 2 | 10 |
| Haiku 4.5 | 1 | 5 |

- The Batch API is 50% off, which suits metadata back-fill.
- Opus 5.5 cache reads cost 0.05× the input price.
- One Ask is about 8K tokens in and 600 out, roughly $0.044 on Opus 5.5 or $0.022 on Sonnet 5.5 (est.).
- A full demo plus testing (about 2K queries) costs under $100 (est.).

### GPU sizing for the pilot (vLLM)

| Workload | Model | VRAM (est. unless cited) | GPU |
|---|---|---|---|
| LLM | Gemma 4 26B-A4B FP8 | about 26 GB weights plus KV cache | 1× L40S 48 GB (or 1× H100) |
| Embed + rerank | bge-m3 + bge-reranker-v2-m3 (0.6B each) | about 4 GB total | 1× L4 24 GB, shared |
| OCR | PaddleOCR-VL 0.9B | about 4 GB | shared L4 |
| ASR | IndicConformer 0.6B. faster-whisper large-v2 INT8 used [2.9 GB](https://github.com/SYSTRAN/faster-whisper) in its benchmark. | about 3 GB each | shared L4 |
| Vision | SigLIP 2 So400m | about 2 GB | shared L4 |

**Cost:** IndiaAI-portal third-party rates are about ₹102/h for an L40S, ₹49/h for an L4 and ₹92/h for a subsidised H100 ([Spheron](https://www.spheron.network/blog/gpu-cloud-india-2026/), [HF blog](https://huggingface.co/blog/daya-shankar/nvidia-h100-price-india)). At 10 h/day for 12 weeks, one L40S plus one L4 comes to about **₹1.3 lakh** (est.). The IndiaAI compute pool has 38,000+ GPUs across 14 providers ([IndiaAI](https://compute.indiaai.gov.in/)).

**Sovereignty:**

- MeghRaj 2.0 adds AWS Outposts in NIC data centres via Yotta (Feb 2026) ([AWS press](https://press.aboutamazon.com/aws/2026/2/aws-and-yotta-data-services-collaborate-to-deploy-hybrid-cloud-infrastructure-for-national-informatics-centres-meghraj-2-0)). The press release does not mention Bedrock or GPUs, so GPU capacity on MeghRaj itself is unverified.
- Plan: self-hosted weights on India-hosted GPUs for everything internal. Claude handles only public-tier content, either through the API for the demo or through Bedrock India for production.

---

## 4. Speech: transcripts with timestamps

| Option | Languages | Licence | Evidence | Timestamps | Role |
|---|---|---|---|---|---|
| **IndicConformer-600M-multilingual** | 22 scheduled | MIT ([card](https://huggingface.co/ai4bharat/indic-conformer-600m-multilingual)) | "Voice of India" (Apr 2026) WER: hi 8.2, ta 19.9, te 23.7, bn 10.7, about 18% on average ([paper](https://arxiv.org/html/2604.19151v1)) | Segment-level from VAD chunks | **Indic, self-hosted** |
| Bhashini ASR | 23 voice languages ([PIB](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2267632&reg=48&lang=2)) | Government API | — | — | Indic without GPUs. Stays in India. |
| **faster-whisper large-v3 / turbo** | 99 languages | MIT ([repo](https://github.com/SYSTRAN/faster-whisper), v1.2.1) | Up to 4× faster than openai/whisper, with INT8 and a batched pipeline. Turbo has 809M params and 4 decoder layers, with "minor quality degradation" ([card](https://huggingface.co/openai/whisper-large-v3-turbo)). | `word_timestamps=True` plus VAD | **English audio** |
| Whisper on Indic | — | — | Whisper-medium baseline WER: ta 23.9, te 23.3, ml 36.0 ([Sony, Jun 2026](https://arxiv.org/html/2606.09535)). Fine-tuned IndicWhisper had the lowest WER on 39 of 59 Vistaar benchmarks ([Vistaar](https://github.com/AI4Bharat/vistaar)). | — | Not for Indic |
| Sarvam Saaras v3 (API) | about 10 languages | Commercial | 19.31% WER on IndicVoices ([docs](https://docs.sarvam.ai/api/getting-started/models/saarika)). Saarika 2.5 averages about 12% on Voice of India ([paper](https://arxiv.org/html/2604.19151v1)). | — | Paid fallback |
| Bodhan Indic-Transcribe (IIT-M, Sep 2026) | 22 + en + 4 dialects | Open weights, licence **not yet confirmed** | 8.7 "OIWER" on Voice of India, self-reported ([AV](https://www.analyticsvidhya.com/blog/2026/09/bodhan-ai-indic-models/)) | — | Evaluate in week 5 |
| **pyannote community-1** | — | CC-BY-4.0, gated ([card](https://huggingface.co/pyannote/speaker-diarization-community-1)). pyannote.audio 4.0.7 (MIT). | AMI DER about 17% ([blog](https://www.pyannote.ai/blog/community-1)). "Exclusive" mode simplifies aligning speakers with ASR. | Speaker turns | Interviews and panels only |

**Pipeline:**

1. Silero VAD splits audio into 5–20 s segments.
2. Language ID: Whisper's LID for English versus Indic, then the UI or metadata language.
3. Route each segment to IndicConformer or faster-whisper.
4. Store `[{start,end,speaker?,text,lang}]`.
5. Chunk every ~60 s of transcript. Each chunk carries `t_start`, so a citation links to `video#t=312`.
6. Named entities are the known weak spot. Indic ASR on entity-dense audio has a very low entity-hit-rate ([Menta, May 2026](https://arxiv.org/abs/2605.03073)). Pass the polar glossary as a hotword or post-correction list.

---

## 5. Images: tagging, search, alt-text

| Model | Licence | Use |
|---|---|---|
| **SigLIP 2 So400m-patch16-naflex** | Apache-2.0 ([card](https://huggingface.co/google/siglip2-so400m-patch16-naflex/raw/main/README.md)) | Zero-shot tags through the `zero-shot-image-classification` pipeline ([HF blog](https://huggingface.co/blog/siglip2)). Image embeddings are 1152-d (`halfvec(1152)`) and power "more like this". The Gemma tokenizer (256k vocab) gives it "much better multilingual understanding" ([paper](https://arxiv.org/abs/2502.14786)). |
| OpenAI CLIP | MIT | **Don't use.** Its card says to limit it to English ([model card](https://github.com/openai/CLIP/blob/main/model-card.md)). |
| **Gemma 4 26B-A4B** (same server as the LLM) or Qwen3-VL-8B-Instruct | Apache-2.0 ([Gemma](https://ai.google.dev/gemma/docs/core/model_card_4), [Qwen3-VL](https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct)) | Captions and alt-text. Qwen3-VL does OCR in 32 languages including Hindi ([repo](https://github.com/qwenlm/qwen3-vl)). |

**Text→image search needs no new code.** Embed each VLM caption with bge-m3 as a chunk (`modality='image'`), and the Ask and search hybrid retrieval then finds images in any language.

**Tagging rules:**

- Use the prompt template "a photo of {label}".
- Calibrate a threshold per label on about 20 hand-labelled images.
- Apply a **geo-prior veto**: no penguins with station=Himadri (Arctic), no polar bears in Antarctica.
- Any `people` tag above threshold sends the image to the PII and consent queue (§9).

**Polar label taxonomy (v0.1):** have NCPOR biologists and glaciologists validate the species list. The GCMD paths are verified against KMS v24.8 ([science keywords CSV](https://cmr.earthdata.nasa.gov/kms/concepts/concept_scheme/sciencekeywords?format=csv)).

| Group | Labels | GCMD mapping (science keyword path / instrument short name) |
|---|---|---|
| Sea ice and ice | sea ice, fast ice, pack ice, iceberg, ice shelf, glacier, crevasse, blue ice, sastrugi, ice core | CRYOSPHERE > SEA ICE (> FAST ICE); CRYOSPHERE > GLACIERS/ICE SHEETS |
| Landforms | nunatak, moraine, Schirmacher oasis lake, rock outcrop, coastline | TERRESTRIAL HYDROSPHERE / LAND SURFACE (map at extraction) |
| Sky | aurora, nacreous/polar stratospheric cloud, blizzard/whiteout, halo/sundog, midnight sun, polar night | SUN-EARTH INTERACTIONS > IONOSPHERE/MAGNETOSPHERE DYNAMICS > AURORAE |
| Antarctic fauna | Emperor penguin, Adélie penguin, Weddell seal, crabeater seal, leopard seal, elephant seal, South Polar skua, snow petrel, Wilson's storm-petrel | BIOLOGICAL CLASSIFICATION > ANIMALS/VERTEBRATES > BIRDS > PENGUINS (etc.) |
| Arctic fauna (Himadri) | polar bear, Arctic fox, Svalbard reindeer, walrus, kittiwake, Arctic tern, barnacle goose | ANIMALS/VERTEBRATES > MAMMALS / BIRDS |
| Flora | moss, lichen | BIOLOGICAL CLASSIFICATION > PLANTS / FUNGI |
| Stations and logistics | Maitri, Bharati, Himadri, Dakshin Gangotri (historic), ship, helicopter, tracked vehicle, container modules, fuel farm, satellite dish, wind/solar | GCMD *locations*: CONTINENT > ANTARCTICA ([locations CSV](https://cmr.earthdata.nasa.gov/kms/concepts/concept_scheme/locations?format=csv)) |
| Instruments | automatic weather station, GPR, ice-core drill, magnetometer, ionosonde, riometer, all-sky camera, LIDAR, GNSS receiver, seismometer, ozone spectrometer, CTD rosette, sediment corer, UAV | GCMD *instruments*: GPR, IONOSONDE, PROTON MAGNETOMETER… ([instruments CSV](https://cmr.earthdata.nasa.gov/kms/concepts/concept_scheme/instruments?format=csv)) |
| People and activities (PII trigger) | field party, sampling, group photo, flag ceremony, medical | — |
| Media type | chart, map, document scan, screenshot, micrograph | Routes the image to OCR or chart handling |

**Alt-text rules:**

- Keep it to one or two sentences and put the scientific subject first.
- Never name people unless the metadata names them.
- A human confirms alt-text on images with people.
- Translate alt-text like every other string.
- Use the accessibility skill's WCAG 2.2 AA checklist for the UI.

---

## 6. OCR for decades-old expedition reports

| Tool | Licence | Indic | Evidence | Role |
|---|---|---|---|---|
| **Docling** v2.131 | MIT | Pluggable OCR (Tesseract, RapidOCR, EasyOCR, Nemotron) ([OCR docs](https://docling-project.github.io/docling/concepts/OCR/)) | Layout, tables, reading order, and page and bbox provenance | **Orchestrator.** Born-digital PDFs skip OCR. |
| **PaddleOCR-VL** (0.9B; v1.5/1.6) | Apache-2.0 ([card](https://huggingface.co/PaddlePaddle/PaddleOCR-VL)) | 109 languages including Devanagari, Tamil, Telugu | OmniDocBench v1.5 score 92.56 ([paper](https://arxiv.org/html/2510.14528v1)). Supported in vLLM. | **Primary for scans** and table-heavy pages |
| **Tesseract 5.5.3** + tessdata_best | Apache-2.0 | `hin ben tam tel mar guj kan mal pan ori asm san urd nep snd` ([tessdata_best](https://github.com/tesseract-ocr/tessdata_best)) | CPU only. Gives per-word confidence. | Fallback and confidence signal |
| olmOCR 2 | Apache-2.0 ([repo](https://github.com/allenai/olmocr)) | English-tuned | 82.4 on olmOCR-Bench ([Ai2](https://allenai.org/blog/olmocr-2)) | Optional for English typewritten reports |
| Surya / Marker | Code Apache-2.0, **weights under a modified OpenRAIL-M** (free only under $5M funding/revenue) ([Surya](https://github.com/datalab-to/surya), [Marker](https://github.com/datalab-to/marker)) | 91 languages; hi 82.2%, bn 82.7% | 83.3 on olmOCR-bench | **Avoid.** Government use is not a "startup" case, so the licence is ambiguous. |
| Bodhan IndicOCR (IIT-M, Sep 2026) | Open weights, licence TBC | 22 languages + en, handwriting in 12 | 86.2% word accuracy on an internal benchmark ([AV](https://www.analyticsvidhya.com/blog/2026/09/bodhan-ai-indic-models/)) | Evaluate once the licence is confirmed |

**Routing:**

1. Docling detects the text layer. If it exists, use it.
2. Otherwise run PaddleOCR-VL page by page.
3. Where the average Tesseract word confidence is below 70, or the PaddleOCR and Tesseract outputs disagree by more than 15% CER (est. thresholds), flag the page for human review.
4. Keep the page image and bboxes so citations can highlight the scan.

---

## 7. Auto-metadata with confidence and human confirmation

**Schema:** this is what the extraction model must emit. Claude uses `output_config.format` and Gemma uses vLLM structured outputs. Citations are off for this call, because the two features are incompatible.

```json
{ "title": {"v": "...", "evidence": "...", "page": 1},
  "abstract": {"v": "...", "evidence": "..."},
  "authors": [{"name": "...", "affiliation": "...", "evidence": "..."}],
  "isea_no": {"v": 27, "evidence": "Twenty Seventh Indian Expedition"},
  "station": {"v": "MAITRI", "enum": ["MAITRI","BHARATI","HIMADRI","DAKSHIN_GANGOTRI","SHIP","OTHER"]},
  "temporal": {"start": "2007-12-01", "end": "2008-03-15"},
  "bbox": {"w": 11.0, "e": 12.0, "s": -71.0, "n": -70.5},
  "gcmd_science": [{"uuid": "860e2af9-…", "path": "EARTH SCIENCE>CRYOSPHERE>SEA ICE"}],
  "gcmd_instruments": [{"uuid": "56d66737-…", "short": "GPR"}],
  "language": "en", "doc_type": "expedition_report" }
```

**Confidence per field:** do not use the model's self-reported confidence. Combine deterministic signals instead.

| Signal | Rule |
|---|---|
| Evidence present | The `evidence` string is a verbatim substring of the document, checked the same way as §1.5 |
| Validators | `isea_no` must match the season (1st ISEA = 1981–82 per [PIB](https://pib.gov.in/newsite/PrintRelease.aspx?relid=123510), so the nth ISEA ≈ (1980+n)–(1981+n)). The bbox must be south of −60° for Antarctica or north of 66.5° for Arctic stations. Dates must parse and start before end. The station must be in the enum. |
| Agreement | Two extractions (different temperature or chunk order) must agree, or at least one token logprob must exceed a threshold (vLLM returns logprobs) |
| Score | Green if all three pass, amber if 2 of 3, red otherwise |

**Confirmation UX** (Upload → "Review details"):

- Green fields are pre-filled and editable.
- Amber fields need a click to confirm.
- Red fields are empty and show 3 suggestions.
- Hovering a field shows its evidence with a page link.
- "Accept all green" is one keystroke.
- The GCMD picker shows the top 5 suggestions with a searchable tree.
- Confirmation is the **publish gate** into the public index (§9).

**GCMD mapping:** the list is closed-set, which prevents invented keywords.

1. Embed all **3,779 science-keyword paths, 2,110 instruments and 658 locations** in KMS v24.8 (revision 2026-09-16) with bge-m3 in a `gcmd_concept` table. Counts are CSV rows minus headers ([science](https://cmr.earthdata.nasa.gov/kms/concepts/concept_scheme/sciencekeywords?format=csv), [instruments](https://cmr.earthdata.nasa.gov/kms/concepts/concept_scheme/instruments?format=csv), [locations](https://cmr.earthdata.nasa.gov/kms/concepts/concept_scheme/locations?format=csv)).
2. For each document, retrieve the top 30 candidates using the abstract and headings.
3. The LLM picks UUIDs **only from those candidates**.
4. Store the UUID plus `kms_version`.
5. Re-sync the KMS list monthly.

The six-level hierarchy ([NASA](https://ntrs.nasa.gov/api/citations/20230015694/downloads/GCMD%20Keywords.pdf)) lets the UI roll tags up. NPDC already asks for GCMD keywords, expedition, station, bbox and temporal coverage ([NPDC manual](https://npdc.ncpor.res.in/user_manual/National_Polar_Data_Center.pdf)), so our fields map one-to-one onto NPDC submission.

---

## 8. Content Studio: one update → six formats with claim carry-over

**Pipeline:**

1. **Build the claim ledger.** The LLM extracts atomic claims from the source update: `{claim_id, text, chunk_id, quote, numbers[]}`. Each claim is verified with the §1.5 checks. Only verified claims enter the ledger.
2. **Write the English master for each format.** The prompt contains the ledger, a format card (table below) and the glossary. The output schema is `[{sentence, claim_ids[] | "framing"}]`. "Framing" sentences such as hooks and calls to action must contain **no numbers and no named entities** (regex check).
3. **Check the output.** Every sentence with claims must be entailed by the union of its claims. Every number in the output must appear in the ledger (a regex set comparison). Length and readability limits must hold (`textstat` FKGL for English).
4. **Human approves the 6 English masters.** The reviewer sees each sentence linked to its claim and to the highlighted source.
5. **Translate to 36 languages** with Bhashini and the glossary lock. Automated QA checks glossary hits, numerals, length limits, and back-translation similarity. A human spot-checks a sample: 2 rotating languages per update, plus any language QA flags.

| Format | Length / platform limit | Target reading level (EN) | Hard rules |
|---|---|---|---|
| Web article | 600–900 words | FKGL 9–11 | H2 sections and at least 3 inline citations |
| Press release | 300–450 words, dateline | FKGL 11–13 | **No invented quotes.** Quotes must be verbatim from the source with attribution, or left as a placeholder `[QUOTE — to be supplied]`. |
| Kids explainer (8–12) | 250–400 words | FKGL ≤ 5 | One analogy and one "did you know". Glossary "kid" variants. |
| X thread | 4–7 posts ≤ 280 chars each ([limits](https://en.wikipedia.org/wiki/Character_limit)) | ≤ 8 | Last post links to the source page |
| Instagram carousel | Caption ≤ 2,200 chars; first 125 chars are the hook ([Outfy](https://www.outfy.com/blog/instagram-character-limit/)); **≤ 5 hashtags** (reported cap, [2026](https://creatorlanehq.com/blog/instagram-5-hashtag-limit-2026)); slide text ≤ 20 words | ≤ 7 | Alt-text on every slide |
| YouTube Short script | ≤ 180 s ([YouTube, Oct 2024](https://en.wikipedia.org/wiki/YouTube_Shorts)); aim for 45–60 s ≈ 110–150 words at 150 wpm (est.) | ≤ 7 | Hook in the first 3 s, with on-screen text lines |

**Workload:** this turns "216 drafts to review" into **6 human approvals plus automated QA** per update. Draft generation costs about $0.26 per update on Opus 5.5 (est.: 6 × (6K in + 1K out)).

**AI labelling:** every published asset carries an "AI-assisted, reviewed by NCPOR" label, plus embedded metadata where the platform allows. The IT Amendment Rules 2026 (in force from 20 Feb 2026) require synthetically generated information to be labelled prominently ([Khaitan](https://www.khaitanco.com/thought-leadership/MeitY-notifies-the-IT-Amendment-Rules-2026), [Freshfields](https://www.freshfields.com/en/our-thinking/blogs/technology-quotient/india-targets-deepfakes-and-ai-generated-content-key-changes-under-meitys-2026-102mjwn)).

---

## 9. Guardrails

| Threat | Attack path | Control (the lazy, robust version) | Source |
|---|---|---|---|
| Indirect prompt injection (LLM01) | Hidden instructions in an uploaded PDF, image or transcript | (1) Scan at ingest with **Llama Prompt Guard 2 86M**, which is multilingual and evaluated in Hindi; Llama 4 Community Licence ([card](https://github.com/meta-llama/PurpleLlama/blob/main/Llama-Prompt-Guard-2/86M/MODEL_CARD.md)). (2) Quarantine until a human confirms the metadata. (3) Delimit and datamark retrieved text (spotlighting, [Hines et al.](https://arxiv.org/abs/2403.14720)). (4) **The Ask LLM has no tools and no URL fetch.** (5) The renderer allowlists links and disables Markdown images, which closes the exfiltration path. | [OWASP 2025](https://www.promptfoo.dev/docs/red-team/owasp-llm-top-10/) |
| Corpus poisoning and embedding attacks (LLM08) | A malicious document retrieved as "truth". Recovering text from vectors (inversion). | Only human-confirmed documents enter `visibility=0`. Show provenance on every citation. Never expose vectors through the API. | [Indusface LLM08](https://www.indusface.com/learning/owasp-llm-vector-and-embedding-weaknesses/) |
| **Embargo leakage through RAG** | Embargoed chunk ranked, quoted, cached, or summarised in Studio | Filter **at retrieval time in every leg** through RLS, never after generation. The cache key includes the visibility tier. Re-check the ACL at render. DB constraint `publish_at >= max(source.embargo_until)` on Studio posts. CI test: embargo bait must return 0 chunks. | [pgvector filtering](https://github.com/pgvector/pgvector) |
| PII in field photos, scans and audio | Faces, name tags, screens, and ID cards in frame. EXIF GPS and device serials. Phone numbers in transcripts. | Strip EXIF from public derivatives and keep originals internal. Face detection (OpenCV YuNet) raises a consent flag and offers blur. **Presidio** runs on OCR and ASR text, but its Indian recognizers (`IN_AADHAAR`, `IN_PAN`, `IN_PASSPORT`, `IN_VOTER`, …) are **disabled by default** and must be enabled ([Presidio](https://presidio.dataprivacystack.org/supported_entities/), [MIT](https://github.com/data-privacy-stack/presidio)). | DPDP Rules notified 14 Nov 2025, full obligations from May 2027 ([PIB PDF](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf)) |
| Hallucination | Unsupported sentence shown to the public | **Budget:** 0 unverified sentences reach public Ask, because they are dropped and not flagged. Golden-set citation precision ≥ 0.90 and recall ≥ 0.85. Refusal on unanswerables ≥ 0.90. Studio: 100% human approval of English masters. | §1.5, §1.7 |
| Mistranslated science | "Ice shelf" rendered as "ice shelf (storage)" | Glossary lock covering each term in 36 languages. Numeral preservation check. "Show original English" on every answer. | Brief, risk table |
| Jailbreak or off-topic Ask | "Ignore rules…", non-polar questions | Prompt Guard on the query, the pre-generation retrieval threshold refusal (§1.5 step 0), and rate limiting | — |

---

## 10. Licence bill of materials (does "zero licence cost" hold?)

| Component | Licence | OK for government production? |
|---|---|---|
| pgvector 0.8.6, Postgres 18, Docling, PaddleOCR(-VL), Tesseract, olmOCR, faster-whisper, IndicConformer, IndicTrans2, IndicXlit, indic_nlp_library, Presidio, LettuceDetect, RAGAS, ALCE, ARES | PostgreSQL / MIT / Apache-2.0 / BSD | ✓ |
| bge-m3 (MIT), bge-reranker-v2-m3 (Apache), SigLIP 2 (Apache), Gemma 4 (Apache), Qwen3.x (Apache), Sarvam-30B (Apache), mDeBERTa-xnli (MIT) | Open | ✓ |
| pyannote community-1 (CC-BY-4.0), Prompt Guard 2 (Llama 4 Community) | Attribution / community | ✓ with attribution and a gated download |
| jina-embeddings-v3/v4, jina-reranker-v3, Param2-17B, Surya/Marker weights, Krutrim-2 | NC / restricted | ✗ |
| Claude, Bhashini, IndiaAI GPUs | Paid service or usage-based | Not a licence, but not zero cost |

---

## 11. Build order mapped to the 12-week plan

| Weeks | AI deliverable | Done when |
|---|---|---|
| 1–2 | Docling + PaddleOCR ingest, bge-m3 3-leg retrieval, RLS, golden set v0 (100 items) | Recall@20 ≥ 0.85 on v0 |
| 3–4 | Ask with Claude `search_result` citations, quote and NLI verifier, refusal, Bhashini pivot | Citation precision ≥ 0.9; leak = 0 |
| 5–6 | Metadata extractor + GCMD closed-set picker + confirm UX; SigLIP tags + captions; ASR routing | 80% of fields green or amber-correct on 30 documents |
| 7–8 | Studio claim ledger, 6 formats, checks, translation QA | 6 approvals per update end to end |
| 9–10 | Self-hosted Gemma 4 on vLLM behind the same interface; A/B against Claude on the golden set (300) | Within 5 points of Claude on citation metrics |
| 11–12 | Guardrail red-team (injection, embargo, PII); pilot on one ISEA update | All §9 CI tests green |

---

## Recommendations for HIMVANI

1. **Use bge-m3 for dense and sparse retrieval, stored as `halfvec(1024)` + `sparsevec` in Postgres, fused with English FTS by RRF.** One MIT model gives Indic-strong dense and lexical signals, and Postgres has no Indic stemmer.
2. **Rerank with bge-reranker-v2-m3 on the top 40, and keep chunks ≤ 400 tokens.** It is the best open reranker on MIRACL bn and te, Apache-licensed, and has a 512-token window.
3. **Pivot through English for generation and verification. Translate with Bhashini, and show the English quote.** Verification tools are reliable only in English, and our sources are English.
4. **Refuse unless every shown sentence passes the verbatim-quote check, the NLI check and the number match.** This implements "Each answer sentence is matched to a source" as code rather than a promise.
5. **Demo on Claude Opus 5.5 with `search_result` blocks at one block per sentence.** It gives native sentence-level citations with guaranteed valid pointers and costs under $100 for the whole demo.
6. **For production, self-host Gemma 4 26B-A4B on one L40S through IndiaAI compute. Keep Claude on Bedrock India (`in.anthropic.claude-sonnet-5`) as the public-tier fallback.** This combines an Apache licence, in-country inference and one model for text and images.
7. **Offer Sarvam-30B only as an optional "Indic-native" toggle, and only after vLLM supports it upstream.** Its licence is good, but it needs a vLLM fork today, and on the one third-party Indic benchmark it trailed Gemma 4.
8. **OCR: Docling orchestrates, PaddleOCR-VL handles scans, Tesseract Indic is the fallback. Skip Surya and Marker.** This gives the best Apache-licensed accuracy and avoids the OpenRAIL-M revenue clause.
9. **ASR: IndicConformer (or Bhashini) for Indic audio, faster-whisper only for English, pyannote only for multi-speaker audio.** Whisper is measurably weaker on Indic languages.
10. **Replace "CLIP" with SigLIP 2 for tags, and use VLM captions embedded by bge-m3 for multilingual image search.** CLIP is English-only, and caption search reuses the existing pipeline.
11. **Pick GCMD keywords only from bge-m3-retrieved KMS v24.8 candidates, and store UUID plus version.** Closed-set selection cannot invent keywords and maps directly to NPDC.
12. **Score metadata confidence from evidence substring, validators and agreement, never from the model's self-report.** Self-reported LLM confidence is uncalibrated, while these signals are deterministic and explainable in the UX.
13. **Make metadata confirmation the publish gate into the public index.** One human click covers FAIR quality, poisoning defence and prompt-injection quarantine.
14. **Enforce embargo with Postgres RLS on the Ask role, and add a CI "embargo bait" test that must return 0.** Database-level enforcement cannot be bypassed by an application bug.
15. **Studio: claim ledger, then the 6 English masters with a claim ID on every sentence, then human approval, then 36-language translation with automated QA.** That makes "216 drafts" reviewable with 6 approvals.
16. **Ban invented quotes in press releases with a schema rule and a placeholder.** Fabricated attribution to an NCPOR official is the worst failure we could have.
17. **Label every published asset as AI-assisted and human-reviewed.** The IT Amendment Rules 2026 require labels on synthetic content.
18. **Build the 300-item golden set, with native-speaker Indic questions, in weeks 1–4, and gate merges on it.** Without it, none of the thresholds above can be measured.

## Corrections to our submission

| # | Submission says | Issue | Fix | Confidence |
|---|---|---|---|---|
| 1 | "AI enrichment: … **CLIP** image tags" | Outdated and English-only. The CLIP card limits it to English ([card](https://github.com/openai/CLIP/blob/main/model-card.md)). | Say "SigLIP 2 (multilingual) tags + VLM captions". | High |
| 2 | "**Whisper** transcripts" / "proven parts: pgvector, Whisper, CLIP" | Whisper is weak on many Indic languages. Indic-specialised models beat it ([Vistaar](https://github.com/AI4Bharat/vistaar), [Voice of India](https://arxiv.org/html/2604.19151v1)). | Say "IndicConformer / Bhashini ASR for Indic; Whisper for English". | High |
| 3 | "Zero licence cost thanks to the open-source stack" | Holds only with careful choices. Several popular parts are NC or restricted (jina v3/v4, jina-reranker-v3, Surya/Marker weights, Param2). GPU and API usage are not free. | Say "zero *licence* cost with an audited Apache/MIT bill of materials (§10); compute is about ₹1.3 lakh for a 12-week pilot (est.)". | High |
| 4 | "Hosting: NIC MeghRaj cloud" / "runs on NIC cloud" | No public source confirms GPU inference on MeghRaj. MeghRaj 2.0 (Feb 2026) adds AWS Outposts with no GPU or Bedrock mention ([AWS](https://press.aboutamazon.com/aws/2026/2/aws-and-yotta-data-services-collaborate-to-deploy-hybrid-cloud-infrastructure-for-national-informatics-centres-meghraj-2-0)). | Say "App and DB on MeghRaj; GPU inference on IndiaAI-empanelled GPUs; optional Claude via Bedrock India in-country". | Medium |
| 5 | "One upload gives **216 drafts to review**" | Implies 216 human reviews per update, which is not feasible for a small outreach cell. | Say "216 drafts generated; 6 human approvals + automated per-language QA and sampled checks". | High |
| 6 | "Every claim cited" (implied: citations alone make it correct) | Citations are not the same as correctness. The best models lack full citation support 50% of the time ([ALCE](https://arxiv.org/abs/2305.14627)). | Add "…and every sentence verified (quote + entailment); unverified sentences are dropped". | High |
| 7 | "Ask … in 36 languages" (including by voice) | Bhashini has 36 *text* but only **23 voice** languages ([PIB](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2267632&reg=48&lang=2)) | Say "type in 36, speak in 23". | High |
| 8 | "45th expedition underway, 44 completed" | Dated by the finale. 46-ISEA proposals were evaluated in Apr 2026 ([NCPOR](https://ncpor.res.in/news/view/1009)), and 46-ISEA is scheduled to launch in Oct–Nov 2026 ([46-ISEA call](http://isea.ncpor.res.in/forms/46-ISEA%20Webpage%20Advertisment.pdf)). | Re-state the counts on the finale date, e.g. "45 expeditions since 1981; 46th launching". | Medium |
| 9 | "PRITHVI scheme 2021–26" | The scheme period ended 31 Mar 2026 ([PIB](https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=1993366)). We found no public 2026–31 continuation. | Say "REACHOUT under PRITHVI (2021–26; successor cycle to be confirmed)". | Medium |
| 10 | "Bhashini is a government API covering 36 text languages" | **Correct**: 36 text, 23 voice, 35 international ([PIB, Jun 2026](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2267632&reg=48&lang=2)) | None | High |
