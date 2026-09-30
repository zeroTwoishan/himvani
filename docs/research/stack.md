# HIMVANI Engineering Stack: Verified Versions, APIs and Gotchas (as of 2026-09-30)

> Scope: frontend, maps, backend, storage, uploads, email ingest, auth, social APIs, DOIs/FAIR, ops. Versions were pulled live from the npm registry, PyPI, GitHub releases and official docs on **2026-09-30**. Every version in the tables below links to its registry or release page.

## TL;DR

- **Frontend is settled:** Next.js **16.3.x** (App Router, Turbopack default, `middleware.ts` renamed to **`proxy.ts`**), React **19.3.0**, next-intl **4.14**, Serwist **9.5** (`@serwist/turbopack`), Dexie **4.4**, TanStack Query **5.104**, Tailwind **4.3** plus shadcn CLI **4.x**, whose default primitives are now Base UI. The **Background Sync API works only in Chromium browsers**, so the field app must also sync when it is opened ([MDN BCD](https://github.com/mdn/browser-compat-data/blob/main/api/SyncManager.json)).
- **Maps: use OpenLayers 10 as the primary 2D polar map**, with native proj4 support for EPSG:3031 and EPSG:3413 and NASA GIBS polar WMTS tiles (checked: tiles return HTTP 200). Load **CesiumJS 1.145 + Resium** lazily for an optional 3D globe. Our submission names Leaflet, but that is a weak choice for polar work: Proj4Leaflet was last published about 9 years ago and Leaflet 2.0 is still in alpha ([npm](https://www.npmjs.com/package/proj4leaflet), [Leaflet](https://leafletjs.com/2025/05/18/leaflet-2.0.0-alpha.html)).
- **Backend:** FastAPI **0.142** (native OpenTelemetry since yesterday, SSE since 0.135, strict JSON `Content-Type` since 0.132), Pydantic **2.13**, SQLAlchemy **2.1** (its default PG driver is now psycopg 3), PostgreSQL **18.6** (19 is only at Beta 4), pgvector **0.8.6** (HNSW, halfvec, iterative scans). For jobs use **Procrastinate**, a Postgres-only queue, so we run no Redis. PostgreSQL 18 ships stemmers for **Hindi, Tamil and Nepali only**. Every other Indic language gets the `simple` config plus vector search.
- **Storage and ingest:** **MinIO Community is archived (25 Apr 2026)**, so do not use it. If MeghRaj offers native object storage, use it. Otherwise self-host **SeaweedFS** (Apache-2.0). Uploads go through **tusd 2.10 + tus-js-client 4.3 / Uppy 6**. tus-js-client has **no checksum support**, so we hash the whole file ourselves. Email-to-archive works by **IMAP polling with imap-tools**, which needs no MX change on a government domain.
- **External dependencies that break "zero cost / just works":** **X API has no free tier** (pay-per-use: **$0.015 per post, $0.20 if the post contains a URL**). **YouTube uploads from an unaudited project are forced private.** Instagram accepts **JPEG only, from a public URL, max 100 posts per 24 h**. **NCPOR has no DataCite repository account that we could find**, so minting DOIs needs a membership first. Auth: **Keycloak 26.7** brokers **NIC Parichay** (SAML 2.0 / OAuth 2.0) for staff, and the public stays anonymous.

---

## 0. Version pin sheet

| Component | Version (2026-09-30) | Released | Source |
|---|---|---|---|
| Next.js | 16.3.7 (security release **16.3.8** scheduled for 30 Sep) | 16.3: 3 Aug 2026 | [npm](https://www.npmjs.com/package/next), [blog](https://nextjs.org/blog) |
| React | 19.3.0 | 9 Sep 2026 | [npm](https://www.npmjs.com/package/react), [releases](https://github.com/react/react/releases) |
| next-intl | 4.14.8 | — | [npm](https://www.npmjs.com/package/next-intl) |
| Serwist (`serwist`, `@serwist/turbopack`, `@serwist/next`) | 9.5.12 (10.0 in preview) | Jul 2026 | [npm](https://www.npmjs.com/package/@serwist/turbopack) |
| Dexie / dexie-react-hooks | 4.4.6 / 4.4.0 | — | [npm](https://www.npmjs.com/package/dexie) |
| TanStack Query | 5.104.0 | — | [npm](https://www.npmjs.com/package/@tanstack/react-query) |
| Tailwind CSS | 4.3.3 | — | [npm](https://www.npmjs.com/package/tailwindcss) |
| shadcn CLI | 4.21.0 | CLI v4: Mar 2026 | [npm](https://www.npmjs.com/package/shadcn), [changelog](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4) |
| Better Auth | 1.7.6 | — | [npm](https://www.npmjs.com/package/better-auth) |
| CesiumJS / Resium | 1.145 / 1.26.0 | 1 Sep 2026 | [GitHub](https://github.com/CesiumGS/cesium/releases), [npm](https://www.npmjs.com/package/resium) |
| OpenLayers / proj4 | 10.10.0 / 2.22.0 | — | [npm](https://www.npmjs.com/package/ol), [npm](https://www.npmjs.com/package/proj4) |
| Leaflet / Proj4Leaflet | 1.9.4 (2.0.0-alpha.1) / 1.0.2 | Proj4Leaflet: ~2017 | [npm](https://www.npmjs.com/package/leaflet), [npm](https://www.npmjs.com/package/proj4leaflet) |
| FastAPI | 0.142.1 (Python ≥3.10) | 29 Sep 2026 | [PyPI](https://pypi.org/project/fastapi/), [notes](https://fastapi.tiangolo.com/release-notes/) |
| Pydantic | 2.13.5 | — | [PyPI](https://pypi.org/project/pydantic/) |
| SQLAlchemy | 2.1.1 (Python ≥3.11) | — | [PyPI](https://pypi.org/project/SQLAlchemy/) |
| psycopg / asyncpg | 3.3.6 / 0.31.0 | — | [PyPI](https://pypi.org/project/psycopg/), [PyPI](https://pypi.org/project/asyncpg/) |
| Alembic | 1.20.0 | — | [PyPI](https://pypi.org/project/alembic/) |
| pgvector (ext) / pgvector-python | 0.8.6 / 0.5.0 | 29 Jul 2026 / 6 Jul 2026 | [CHANGELOG](https://github.com/pgvector/pgvector/blob/master/CHANGELOG.md), [PyPI](https://pypi.org/project/pgvector/) |
| PostgreSQL | **18.6** (17.11 supported; 19 = Beta 4) | 18.0: 25 Sep 2025 | [versioning](https://www.postgresql.org/support/versioning/) |
| Procrastinate / PgQueuer | 3.10.0 / 1.4.0 | 23 Sep / 14 Sep 2026 | [PyPI](https://pypi.org/project/procrastinate/), [PyPI](https://pypi.org/project/pgqueuer/) |
| Celery / Dramatiq / arq | 5.6.3 / 2.2.1 / 0.28.0 (maintenance-only) | — | [PyPI](https://pypi.org/project/celery/), [PyPI](https://pypi.org/project/dramatiq/), [arq](https://github.com/python-arq/arq) |
| tusd / tus-js-client / Uppy | 2.10.1 / 4.3.1 / 6.x | tusd: 16 Sep 2026 | [GitHub](https://github.com/tus/tusd/releases), [npm](https://www.npmjs.com/package/tus-js-client), [npm](https://www.npmjs.com/package/@uppy/core) |
| SeaweedFS / Garage / RustFS / Ceph | 4.48 / 2.4.1 / 1.0.0 / v20.2.x, v21.x tags | 28 Sep / 8 Sep / 16 Sep 2026 | [GitHub](https://github.com/seaweedfs/seaweedfs/releases), [Garage](https://git.deuxfleurs.fr/Deuxfleurs/garage/releases), [GitHub](https://github.com/rustfs/rustfs/releases), [tags](https://github.com/ceph/ceph/tags) |
| MinIO Community | RELEASE.2025-10-15 (**archived**) | archived 25 Apr 2026 | [GitHub](https://github.com/minio/minio) |
| Keycloak | 26.7.4 | 16 Sep 2026 | [GitHub](https://github.com/keycloak/keycloak/releases) |
| imap-tools | 1.15.0 | 6 Aug 2026 | [PyPI](https://pypi.org/project/imap-tools/) |
| Haraka | 3.3.4 | 5 Sep 2026 | [GitHub](https://github.com/haraka/Haraka/releases) |
| Pillow (AVIF in wheels since 11.3) | 12.3.0 | — | [PyPI](https://pypi.org/project/pillow/), [11.3 notes](https://pillow.readthedocs.io/en/stable/releasenotes/11.3.0.html) |
| FFmpeg | 9.0.2 "Lei" | — | [download](https://ffmpeg.org/download.html) |
| OTel Python SDK / Collector | 1.45.0 / v0.162.0 | 29 Sep 2026 | [PyPI](https://pypi.org/project/opentelemetry-sdk/), [GitHub](https://github.com/open-telemetry/opentelemetry-collector-releases/releases) |
| Prometheus / Grafana / Loki / Tempo | 3.15.0 / 13.2.3 / 3.7.8 / 3.1.0 | Sep 2026 | [Prom](https://github.com/prometheus/prometheus/releases), [Grafana](https://github.com/grafana/grafana/releases), [Loki](https://github.com/grafana/loki/releases), [Tempo](https://github.com/grafana/tempo/releases) |
| Sentry self-hosted | 26.9.0 | 16 Sep 2026 | [GitHub](https://github.com/getsentry/self-hosted/releases) |
| DataCite Metadata Schema | **4.7** | 3 Mar 2026 | [schema.datacite.org](https://schema.datacite.org/) |
| DCAT-AP | 3.0.1 | 27 Oct 2025 | [SEMIC](https://semiceu.github.io/DCAT-AP/releases/3.0.1/) |

---

## 1. Frontend

### 1.1 Next.js 16.3 + React 19.3

| Item | Detail |
|---|---|
| Breaking changes in 16 | Async `params`; **Turbopack is the default bundler**; AMP removed; `next lint` removed; caching reworked around `use cache` / Cache Components ([Next 16](https://nextjs.org/blog/next-16)) |
| `middleware.ts` renamed `proxy.ts` | The export must be named `proxy` (or be a default export). Proxy runs on **Node.js only**, and the `runtime` config is unavailable ([docs](https://nextjs.org/docs/app/getting-started/proxy)) |
| 16.3 headline | Instant Navigations, Partial Prefetching, persistent Turbopack build cache, up to 90% less dev memory ([blog](https://nextjs.org/blog)) |
| Node | `engines.node >= 20.9.0` ([npm](https://www.npmjs.com/package/next)) |
| Security cadence | 16.3.3 (Aug 25, 2 critical), 16.3.6 (Sep 22, out-of-band critical), **16.3.8 scheduled for Sep 30 (1 critical, 2 high)** ([blog](https://nextjs.org/blog), [Vercel](https://vercel.com/changelog/next-js-may-2026-security-release)). React Server Components had a CVSS 10 RCE, **CVE-2025-55182** ([react.dev](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)) |

**Gotchas:** Pin to `>=16.3.8` and let Renovate/Dependabot bump patch releases weekly. Our `proxy.ts` hosts next-intl only; auth checks belong in the data layer, not the proxy.

### 1.2 next-intl 4.14: 36 locales and RTL

```ts
// src/i18n/routing.ts
import {defineRouting} from 'next-intl/routing';
export const routing = defineRouting({ locales: ['en','hi','ta','bn','ur','ks','sd', /* …36 */], defaultLocale: 'en' });

// src/proxy.ts  (was middleware.ts before Next 16)
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
export default createMiddleware(routing);
export const config = { matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)' };

// app/[locale]/layout.tsx
const RTL = new Set(['ur','ks','sd']);            // Perso-Arabic scripts
export function generateStaticParams() { return routing.locales.map(locale => ({locale})); }
export default async function Layout({children, params}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);                        // enables static rendering
  return <html lang={locale} dir={RTL.has(locale) ? 'rtl' : 'ltr'}><body>{children}</body></html>;
}
```
Sources: [routing setup](https://github.com/amannn/next-intl/blob/main/docs/src/pages/docs/routing/setup.mdx), [proxy docs](https://next-intl.dev/docs/routing/middleware), [RTL guidance](https://github.com/amannn/next-intl/blob/main/docs/src/pages/docs/usage/translations.mdx). next-intl also documents a `next/root-params` variant that removes `setRequestLocale` ([blog](https://github.com/amannn/next-intl/blob/main/docs/src/pages/blog/nextjs-root-params.mdx)). Stay on `setRequestLocale` until that variant is marked stable.

| Gotcha | Fix |
|---|---|
| RTL applies to **ur, ks, sd (Arab script)**. `sd-Deva` is LTR. `Intl.Locale('mni').maximize()` resolves to **Bengali** script, but Manipuri's official script is Meetei Mayek (`mni-Mtei`). Santali is Ol Chiki (`sat` → `Olck`). Output from Node 24 `Intl.Locale.getTextInfo()`, run locally ([MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getTextInfo)) | Hard-code the RTL set. Use explicit script subtags (`mni-Mtei`, `sat-Olck`) that match Bhashini's codes |
| 36 locales × N static pages makes builds slow | Statically render only the landing and Explore shells. Everything else renders on demand with `use cache` |
| Indic fonts | Use `next/font` Noto families per script (Devanagari, Bengali, Tamil, Nastaliq Urdu, Ol Chiki, Meetei Mayek…) with `preload:false` for non-current scripts ([next/font](https://nextjs.org/docs/app/api-reference/components/font)) |
| Mirroring | Use Tailwind logical utilities (`ms-*`, `pe-*`, `start-*`, `text-start`) and the `rtl:` variant ([Tailwind](https://tailwindcss.com/docs/margin#using-logical-properties)). The shadcn CLI converts physical classes to logical ones since Jan 2026 ([shadcn RTL](https://ui.shadcn.com/docs/changelog/2026-01-rtl)) |

### 1.3 PWA and offline: Serwist 9.5 (Turbopack)

```ts
// app/serwist/[path]/route.ts
import {createSerwistRoute} from '@serwist/turbopack';
export const {dynamic, dynamicParams, revalidate, generateStaticParams, GET} =
  createSerwistRoute({ swSrc: 'app/sw.ts', additionalPrecacheEntries: [{url: '/~offline', revision}], useNativeEsbuild: true });
// layout: <SerwistProvider swUrl="/serwist/sw.js">…</SerwistProvider>   (from '@serwist/turbopack/react')

// app/sw.ts: queue failed POSTs (metadata, drafts; NOT the file bytes, which go via tus)
import {BackgroundSyncPlugin, NetworkOnly, Serwist} from 'serwist';
serwist.registerCapture(/\/api\/v1\/(assets|drafts)/, new NetworkOnly({plugins: [
  new BackgroundSyncPlugin('outbox', {maxRetentionTime: 7 * 24 * 60})]}), 'POST');
```
Sources: [Serwist Turbopack](https://serwist.pages.dev/docs/next/turbo), [BackgroundSyncPlugin](https://serwist.pages.dev/docs/serwist/runtime-caching/plugins/background-sync-plugin).

| Gotcha | Evidence |
|---|---|
| `SyncManager` exists in **Chrome/Edge/Android Chrome only**. Firefox, Safari and iOS return `false` | [MDN BCD](https://github.com/mdn/browser-compat-data/blob/main/api/SyncManager.json) |
| Without the Sync API, Serwist replays the queue **when the service worker starts**, which needs the page to be active | [Serwist](https://serwist.pages.dev/docs/serwist/guide/background-syncing) |
| Safari evicts storage for sites the user has not interacted with recently. Safari 17 grants `navigator.storage.persist()` on heuristics such as being installed to the Home Screen | [WebKit](https://webkit.org/blog/14403/updates-to-storage-policy/) |
| `next-pwa` is webpack-only and conflicts with the Turbopack default | [Serwist](https://serwist.pages.dev/docs/next/turbo) |
| Serwist 10 (in preview) will require Next ≥15 | [Serwist](https://serwist.pages.dev/docs/next/turbo) |

### 1.4 Dexie 4.4: the field-app outbox

```ts
import {Dexie, type EntityTable} from 'dexie';
interface Pending { id: string; blob: Blob; meta: object; tusUrl?: string; sha256?: string; state: 'queued'|'uploading'|'done' }
export const db = new Dexie('himvani') as Dexie & { pending: EntityTable<Pending,'id'> };
db.version(1).stores({ pending: 'id, state' });
// UI: const q = useLiveQuery(() => db.pending.where('state').notEqual('done').toArray());
```
Source: [Dexie TS](https://dexie.org/docs/Typescript), [useLiveQuery](https://dexie.org/docs/dexie-react-hooks/useLiveQuery%28%29).
**Gotcha:** tus can only resume if it still has the **File/Blob**. After a reload the browser forgets the `File`, so **store the Blob itself in IndexedDB**. Otherwise tus's default localStorage fingerprint is useless.

### 1.5 TanStack Query 5.104

```ts
const qc = new QueryClient({ defaultOptions: { queries: { networkMode: 'offlineFirst', gcTime: 864e5 } } });
const persister = createAsyncStoragePersister({ storage: { getItem: get, setItem: set, removeItem: del } }); // idb-keyval
<PersistQueryClientProvider client={qc} persistOptions={{persister}} onSuccess={() => qc.resumePausedMutations()} />
```
Source: [persistQueryClient](https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient).
**Gotcha:** A paused mutation only survives a reload if it is registered with `qc.setMutationDefaults(key, {mutationFn})`. Use TanStack Query for reads and the Dexie outbox for writes. Do not use both for writes.

### 1.6 shadcn/ui + Tailwind CSS 4.3

```css
/* app/globals.css: v4 is CSS-first, with no tailwind.config.js */
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
@theme { --font-sans: "Noto Sans", system-ui, sans-serif; --color-ice-500: oklch(0.72 0.09 230); }
```
Sources: [theme](https://tailwindcss.com/docs/theme), [dark mode](https://tailwindcss.com/docs/dark-mode).
**Gotchas:** shadcn CLI v4 (`npx shadcn init --base base|radix`). **Base UI has been the default since July 2026**, and Radix is consolidated into a single `radix-ui` package ([Base UI default](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default), [CLI v4](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4)). Pick one base and do not mix them.

### 1.7 Auth in Next.js

Auth.js (next-auth) is **maintained by the Better Auth team and receives security fixes only**. v5 is still on the `beta` npm tag (5.0.0-beta.32) ([discussion](https://github.com/nextauthjs/next-auth/discussions/13252), [npm tags](https://www.npmjs.com/package/next-auth?activeTab=versions)). Better Auth ships a Keycloak preset:
```ts
import {genericOAuth} from 'better-auth/plugins'; import {keycloak} from 'better-auth/plugins/generic-oauth';
export const auth = betterAuth({ plugins: [genericOAuth({ config: [keycloak({ clientId, clientSecret, issuer: process.env.KEYCLOAK_ISSUER })] })] });
```
Source: [Better Auth 1.4 blog](https://github.com/better-auth/better-auth/blob/main/docs/content/blogs/1-4.mdx).

---

## 2. Maps

### 2.1 Library comparison

| | OpenLayers 10.10 | Leaflet 1.9.4 + Proj4Leaflet 1.0.2 | CesiumJS 1.145 + Resium 1.26 |
|---|---|---|---|
| EPSG:3031 / 3413 | **Native**: `proj4.defs` + `register(proj4)` ([OL tutorial](https://github.com/openlayers/openlayers/blob/main/site/src/doc/tutorials/raster-reprojection.md)) | Plugin last published ~2017 ([npm](https://www.npmjs.com/package/proj4leaflet)). Leaflet 2.0 is still `2.0.0-alpha.1` and moves to ESM with no global `L`, which breaks plugins ([Leaflet](https://leafletjs.com/2025/05/18/leaflet-2.0.0-alpha.html)) | 3D globe on the WGS84 ellipsoid. Poles are fine with Geographic tiling, but **Web Mercator imagery stops at about ±85°** |
| WMTS capabilities | `optionsFromCapabilities` built in | Manual | `WebMapTileServiceImageryProvider` ([ref](https://cesium.com/learn/cesiumjs/ref-doc/WebMapTileServiceImageryProvider.html)) |
| Raster reprojection on the client | Yes | No | n/a |
| Weight / low-end devices | Medium, 2D canvas | Lightest | Heaviest, WebGL2, plus copied `Workers/Assets` |
| React | Thin wrapper (useRef/useEffect) | react-leaflet 5 (React 19) | Resium (`react >=18.2`) |

**Recommendation:** use **OpenLayers as the default Explore map**, with an Antarctica view in EPSG:3031 and an Arctic view in EPSG:3413. Use **Cesium via Resium only for a lazy-loaded "3D globe" tab**. Drop Leaflet. It adds no polar capability and needs a stale plugin.

### 2.2 Polar tile sources (all checked 2026-09-30)

| Source | What | Access | Notes |
|---|---|---|---|
| **NASA GIBS EPSG:3031 / 3413 / 4326** | `BlueMarble_ShadedRelief_Bathymetry`, `SCAR_Land_Water_Map`, `Coastlines`, `Graticule`, MODIS/VIIRS true colour, `AMSRU2_Sea_Ice_Concentration_12km` | `https://gibs.earthdata.nasa.gov/wmts/epsg3031/best/{Layer}/default/{Time}/{TMS}/{z}/{y}/{x}.jpg`. TMS values are 250m, 500m, 1km, 2km. No API key ([GIBS](https://nasa-gibs.github.io/gibs-api-docs/access-basics/)) | Tile `…/epsg3031/best/BlueMarble_ShadedRelief_Bathymetry/default/default/500m/0/0/0.jpg` returned **200**. The capabilities XML is **~1 MB**, so cache it server-side or hard-code the grid |
| **REMA v2** (PGC) | 2 m Antarctic DEM mosaics, COG | [PGC](https://www.pgc.umn.edu/data/rema/), [AWS Open Data](https://registry.opendata.aws/pgc-rema/) | Serve hillshade derivatives ourselves. Too heavy to stream raw |
| **IBCSO v2** (2022) | Southern Ocean bathymetry | [doi:10.1594/PANGAEA.937574](https://doi.org/10.1594/PANGAEA.937574) | Pre-render once to tiles |
| **Quantarctica 3.2** (NPI) | QGIS package of basemaps, including IBCSO 500 m | [npolar.no](https://npolar.no/en/quantarctica/), [IBCSO dir](https://media.npolar.no/download/quantarctica/Quantarctica3/TerrainModels/IBCSO/) | A **desktop GIS bundle, not a tile service**. Export the vector layers we need (coastline, stations) to GeoJSON |

### 2.3 Key code

```ts
// OpenLayers: Antarctic view
import proj4 from 'proj4'; import {register} from 'ol/proj/proj4';
proj4.defs('EPSG:3031','+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs');
proj4.defs('EPSG:3413','+proj=stere +lat_0=90 +lat_ts=70 +lon_0=-45 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs');
register(proj4);
const opts = optionsFromCapabilities(new WMTSCapabilities().read(xml), {layer: 'BlueMarble_ShadedRelief_Bathymetry', matrixSet: '500m'});
new TileLayer({ source: new WMTS({...opts, wrapX: false}) });   // wrapX is now derived from the matrix; force false for polar
```
Sources: [OL proj4](https://github.com/openlayers/openlayers/blob/main/changelog/upgrade-notes.md) (the `register(proj4)` and `wrapX` notes).

```tsx
// Cesium (client-only). Assets are copied to /public/cesium by postinstall; no Cesium ion.
window.CESIUM_BASE_URL = '/cesium';
const gibs = new WebMapTileServiceImageryProvider({
  url: 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/BlueMarble_ShadedRelief_Bathymetry/default/default/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpg',
  layer: 'BlueMarble_ShadedRelief_Bathymetry', style: 'default', tileMatrixSetID: '500m',
  tilingScheme: new GeographicTilingScheme(), tileWidth: 512, tileHeight: 512, maximumLevel: 7 });
<Viewer baseLayer={ImageryLayer.fromProviderAsync(Promise.resolve(gibs))} geocoder={false} />   // dynamic(() => import(...), {ssr:false})
```
Sources: [Resium Next.js install](https://github.com/reearth/resium/blob/main/docs/src/content/docs/installation.md), [GeographicTilingScheme](https://cesium.com/learn/cesiumjs/ref-doc/GeographicTilingScheme.html). **Gotcha:** the default Viewer pulls imagery from Cesium ion, which needs a token and sends data off-shore. Always pass your own `baseLayer`.

---

## 3. Backend

### 3.1 FastAPI 0.142 + Pydantic 2.13

| Release | Change that affects us | Source |
|---|---|---|
| 0.125 / 0.129 | Dropped Python 3.8 / 3.9. **Use Python 3.12+** (SQLAlchemy 2.1 needs ≥3.11, pygeometa ≥3.12) | [notes](https://fastapi.tiangolo.com/release-notes/) |
| 0.126 / 0.128 | Pydantic v1 and `pydantic.v1` removed | [notes](https://fastapi.tiangolo.com/release-notes/) |
| 0.129.2 | `fastapi-slim` discontinued. Use `fastapi[standard]` | [notes](https://fastapi.tiangolo.com/release-notes/) |
| 0.130 / 0.131 | JSON is serialized by Pydantic in Rust. `ORJSONResponse` is deprecated | [notes](https://fastapi.tiangolo.com/release-notes/) |
| **0.132** | **`strict_content_type`: JSON bodies without `Content-Type: application/json` are rejected.** Watch webhook senders | [docs](https://fastapi.tiangolo.com/advanced/strict-content-type/) |
| 0.135 | **Native SSE**, which we use to stream Ask answers and citations | [SSE](https://fastapi.tiangolo.com/tutorial/server-sent-events/) |
| **0.142 (29 Sep 2026)** | **Native OpenTelemetry**, auto-configured through `OTEL_*` env vars. `FastAPI(telemetry={...})` | [OTel](https://fastapi.tiangolo.com/advanced/opentelemetry/) |

```python
from fastapi.sse import EventSourceResponse, ServerSentEvent
@app.get("/v1/ask/stream", response_class=EventSourceResponse)
async def ask(q: str) -> AsyncIterable[ServerSentEvent]:
    async for chunk in rag.answer(q):                       # tokens, then a final 'citations' event
        yield ServerSentEvent(data=chunk.model_dump(), event=chunk.kind)
```
**Gotcha:** native OTel is one day old. Pin `fastapi==0.142.*`, and keep `opentelemetry-instrumentation-fastapi` as the fallback. Do not run both at once, because they use global providers ([docs](https://fastapi.tiangolo.com/advanced/opentelemetry/)).

### 3.2 SQLAlchemy 2.1 async, driver choice, Alembic, pgvector-python

| Point | Detail |
|---|---|
| 2.1 changes | **Default PG driver is now psycopg 3.** `greenlet` only comes with `sqlalchemy[asyncio]`. Autoflush now fires on all statements ([migration_21](https://docs.sqlalchemy.org/en/21/changelog/migration_21.html)) |
| Driver | **psycopg 3** (`postgresql+psycopg://`). SQLAlchemy defaults to it, Procrastinate's `PsycopgConnector` uses it, and pgvector supports it, so we run one driver for everything |
| pgvector types | `from pgvector.sqlalchemy import HALFVEC, VECTOR`. The ORM types serialize on their own; `register_vector*` is only needed for raw driver calls ([pgvector-python](https://github.com/pgvector/pgvector-python)) |
| Alembic 1.20 | The first migration runs `CREATE EXTENSION IF NOT EXISTS vector, pg_trgm, unaccent`. Import `pgvector.sqlalchemy` in `env.py`. Build HNSW indexes with `op.execute("CREATE INDEX CONCURRENTLY …")` inside `with op.get_context().autocommit_block():` |

```python
engine = create_async_engine("postgresql+psycopg://app@db/himvani", pool_size=10)
class Chunk(Base):
    __tablename__ = "chunk"
    id: Mapped[int] = mapped_column(primary_key=True)
    embedding: Mapped[list[float]] = mapped_column(HALFVEC(1024))
    visibility: Mapped[str]                                     # 'public' | 'internal'
stmt = select(Chunk).where(Chunk.visibility == "public").order_by(Chunk.embedding.cosine_distance(q)).limit(20)
```

### 3.3 PostgreSQL 18 + pgvector 0.8.6

| Feature | Use in HIMVANI | Source |
|---|---|---|
| PG18 `uuidv7()` | Time-ordered primary keys for assets and chunks | [PG18](https://www.postgresql.org/about/news/postgresql-18-released-3142/) |
| PG18 async I/O, skip scan, OLD/NEW in `RETURNING`, virtual generated columns, `casefold()` | Faster ingest scans. Audit triggers become simpler | [PG18](https://www.postgresql.org/about/news/postgresql-18-released-3142/) |
| PG18 `md5` auth deprecated; page checksums on by default | Use SCRAM | [PG18](https://www.postgresql.org/about/news/postgresql-18-released-3142/) |
| HNSW | `CREATE INDEX … USING hnsw (embedding halfvec_cosine_ops) WITH (m=16, ef_construction=64)` | [pgvector](https://github.com/pgvector/pgvector) |
| halfvec | Index up to **4,000 dims** (`vector` indexes cap at 2,000; `bit` at 64,000). Halves storage | [README](https://github.com/pgvector/pgvector/blob/master/README.md) |
| Iterative scans (0.8+) | `SET LOCAL hnsw.iterative_scan = relaxed_order; SET LOCAL hnsw.max_scan_tuples = 20000;` fixes filtered queries that return fewer than k results | [README](https://github.com/pgvector/pgvector#iterative-index-scans) |
| **Partial HNSW** | `CREATE INDEX … USING hnsw (embedding halfvec_cosine_ops) WHERE visibility='public';` Public Ask then never touches embargoed vectors | [README: filtering](https://github.com/pgvector/pgvector#filtering) |
| Build memory | Index builds are slow if the graph exceeds `maintenance_work_mem`. Also raise `max_parallel_maintenance_workers` | [README](https://github.com/pgvector/pgvector#hnsw) |
| Hygiene | 0.8.2 fixed a buffer overflow in parallel HNSW builds. 0.8.3/0.8.4 fixed HNSW corruption and vacuum. **Run ≥0.8.6** | [CHANGELOG](https://github.com/pgvector/pgvector/blob/master/CHANGELOG.md) |

### 3.4 Full-text search for 36 Indian languages

| Fact | Source |
|---|---|
| PG 17 and 18 ship Snowball configs for **hindi, tamil, nepali** (and english). There is **no stemmer for Bengali, Telugu, Marathi, Gujarati, Kannada, Malayalam, Odia, Punjabi, Urdu…** | [snowball_create.pl (REL_18)](https://github.com/postgres/postgres/blob/REL_18_STABLE/src/backend/snowball/snowball_create.pl), [Makefile](https://github.com/postgres/postgres/blob/REL_18_STABLE/src/backend/snowball/Makefile) |
| pg_trgm "ignores non-word characters (non-alphanumerics)". Devanagari vowel signs (matras) are Unicode category **Mc**, not letters, so test whether words are split at the matras | [pg_trgm](https://www.postgresql.org/docs/current/pgtrgm.html), [r12a](https://r12a.github.io/scripts/deva/hi) |
| `unaccent` only helps Latin script (for example romanized queries). Never apply it to Indic text | [unaccent](https://www.postgresql.org/docs/current/unaccent.html) |

**Pattern:** store `lang` per chunk. The tsvector uses `to_tsvector(CASE lang WHEN 'hi' THEN 'hindi' WHEN 'ta' THEN 'tamil' WHEN 'ne' THEN 'nepali' WHEN 'en' THEN 'english' ELSE 'simple' END::regconfig, text)`. Retrieval is **hybrid**: pgvector with multilingual embeddings, plus FTS, merged by reciprocal-rank fusion in SQL. Semantic recall comes from the vectors. FTS is there to catch exact names such as "Maitri" or "ISEA-45".

### 3.5 Background jobs

| | Broker | Async | Periodic | Status | Verdict |
|---|---|---|---|---|---|
| Celery 5.6.3 | Redis/RabbitMQ | Weak | beat | 5.7 in alpha | Overkill, adds a broker |
| Dramatiq 2.2.1 | Redis/RabbitMQ | Partial | via extension | Active | Adds a broker |
| arq 0.28 | Redis | Yes | cron | **"maintenance only mode"** ([README](https://github.com/python-arq/arq)) | No |
| **Procrastinate 3.10** | **PostgreSQL** (LISTEN/NOTIFY) | Yes | `@app.periodic(cron=…)` | Released 23 Sep 2026 | **Pick this** |
| PgQueuer 1.4 | PostgreSQL | Yes | Yes | Active | Fine alternative |

```python
app = procrastinate.App(connector=procrastinate.PsycopgConnector())
@app.task(queue="gpu", retry=5)
async def transcribe(asset_id: str): ...
# In a FastAPI route (app opened in the lifespan): await transcribe.configure(queueing_lock=asset_id).defer_async(asset_id=asset_id)
# Workers: `procrastinate worker -q cpu` on the app VM, `-q gpu --concurrency 1` on the GPU VM
```
Source: [Procrastinate](https://procrastinate.readthedocs.io/en/stable/). Use `queueing_lock` to deduplicate re-enrichment, and use the periodic `retry_stalled_jobs` recipe for crashed GPU workers ([howto](https://procrastinate.readthedocs.io/en/stable/howto/production/retry_stalled_jobs.html)).

---

## 4. Object storage (S3-compatible on MeghRaj)

| Option | Licence | Status (2026-09) | S3 features | Verdict |
|---|---|---|---|---|
| **MeghRaj native object storage** | Service | NICSI lists "Object, block, archival and backup storage" (Tier I) and managed PostgreSQL (Tier II) ([NICSI](https://nicsi.nic.in/nicsi/nicsi-cloud/)). **MeghRaj 2.0** adds AWS Outposts in Yotta DCs with **S3, EKS, RDS** (17 Feb 2026) ([AWS](https://press.aboutamazon.com/aws/2026/2/aws-and-yotta-data-services-collaborate-to-deploy-hybrid-cloud-infrastructure-for-national-informatics-centres-meghraj-2-0)) | Full | **First choice.** Nothing to operate |
| MinIO Community | AGPL-3.0 | "Maintenance mode" 3 Dec 2025, "no longer maintained" Feb 2026, **archived 25 Apr 2026**, source-only. Upstream now points to paid AIStor ([repo](https://github.com/minio/minio), [#21714](https://github.com/minio/minio/issues/21714)) | Full | **Do not use** |
| **SeaweedFS 4.48** | Apache-2.0 | Very active (release 28 Sep 2026) | Versioning, object lock, lifecycle, presigned, browser POST, multipart ([GitHub](https://github.com/seaweedfs/seaweedfs)) | **Self-host pick** |
| Garage 2.4.1 | AGPL-3.0 ([LICENSE](https://git.deuxfleurs.fr/Deuxfleurs/garage/raw/branch/main-v2/LICENSE)) | Active | Presigned and multipart yes. **No versioning, object lock, bucket policies or SSE** ([compat](https://garagehq.deuxfleurs.fr/documentation/reference-manual/s3-compatibility/)) | Too thin for an archive |
| RustFS 1.0.0 | Apache-2.0 | GA **16 Sep 2026** ([release](https://github.com/rustfs/rustfs/releases)) | MinIO-like | Too new for government production |
| Ceph RGW (v20/21) | LGPL-2.1/3 ([COPYING](https://github.com/ceph/ceph/blob/main/COPYING)) | Mature | Full | Needs an operations team. Not for a 6-person pilot |

```python
s3 = boto3.client("s3", endpoint_url=S3_URL, config=Config(signature_version="s3v4",
      s3={"addressing_style": "path"}, request_checksum_calculation="when_required",
      response_checksum_validation="when_required"))
url = s3.generate_presigned_url("get_object", Params={"Bucket": "archive", "Key": key}, ExpiresIn=300)
```
**Gotchas:** (1) Recent AWS SDKs send CRC checksums by default, and many non-AWS stores reject them. Set `when_required` ([AWS SDK ref](https://docs.aws.amazon.com/sdkref/latest/guide/feature-dataintegrity.html)). (2) Use presigned **GET only**, short-lived, for embargoed files. All uploads go through tus (§5), which gives one upload path. (3) tusd requires **strong read-after-write consistency** from the store ([tusd S3](https://github.com/tus/tusd/blob/main/docs/_storage-backends/aws-s3.md)).

---

## 5. Resumable uploads over satellite links

| Piece | Setting | Why / source |
|---|---|---|
| tusd 2.10 | `-s3-bucket archive -s3-endpoint https://s3.local -s3-min-part-size 5MiB -s3-part-size 8MiB -max-size 20GiB -network-timeout 180s -behind-proxy -hooks-http http://api:8000/v1/tus-hook -hooks-http-forward-headers Authorization -hooks-enabled-events pre-create,post-finish` | Flag names and defaults (part size 50 MiB, min 5 MiB, network timeout 60 s) come from [flags.go](https://github.com/tus/tusd/blob/main/cmd/tusd/cli/flags.go). Raise the timeout for high-latency links |
| Auth | Validate the JWT and the `project_id` metadata in **pre-create**, returning `RejectUpload: true` on failure. Start enrichment on **post-finish** | [hooks](https://github.com/tus/tusd/blob/main/docs/_advanced-topics/hooks.md). Hook order is not guaranteed, except that pre-create always comes first |
| Metadata | tusd replaces **non-ASCII S3 metadata with `?`** (so "मैत्री" becomes "??????"). The `.info` object keeps the original | [tusd S3](https://github.com/tus/tusd/blob/main/docs/_storage-backends/aws-s3.md). Read filenames from the hook or `.info`, never from S3 headers |
| tus-js-client 4.3 | `chunkSize: 8*1024*1024`, `retryDelays: [0,3e3,1e4,3e4,6e4,12e4,3e5,6e5]`, `onShouldRetry` returns false only on 401/403/413, `removeFingerprintOnSuccess: true` | The default chunk size is `Infinity` and the default retries are `[0,1000,3000,5000]`, which gives up too soon ([API](https://github.com/tus/tus-js-client/blob/main/docs/api.md)). 8 MiB stays above S3's 5 MiB minimum and below proxy body limits |
| Checksum | **tus-js-client does not implement the checksum extension** ([FAQ](https://github.com/tus/tus-js-client/blob/main/docs/faq.md)) | Compute a streaming SHA-256 in a Web Worker with `hash-wasm` ([npm](https://www.npmjs.com/package/hash-wasm)), send it as tus metadata `sha256`, verify on post-finish, and reject or requeue on mismatch |
| Uppy 6 | `@uppy/tus` + `@uppy/golden-retriever` for staff web uploads | Restores files after a crash ([Golden Retriever](https://uppy.io/docs/golden-retriever/)) |
| IETF resumable uploads | tusd `-enable-experimental-protocol` | Experimental ([flags.go](https://github.com/tus/tusd/blob/main/cmd/tusd/cli/flags.go)). Skip |

**Compression policy. Archive originals and compress only derivatives:**

| Asset | On device (optional "low-bandwidth mode") | Server derivatives |
|---|---|---|
| Photo | `OffscreenCanvas.convertToBlob({type:'image/webp', quality:0.8})` preview first, original later. **Safari cannot encode WebP from canvas** ([BCD](https://github.com/mdn/browser-compat-data/blob/main/api/OffscreenCanvas.json)), so fall back to JPEG | Pillow 12 (AVIF in wheels since 11.3 ([notes](https://pillow.readthedocs.io/en/stable/releasenotes/11.3.0.html))): AVIF `quality=50, speed=6` and WebP `quality=80, method=4` for web ([formats](https://pillow.readthedocs.io/en/stable/handbook/image-file-formats.html)). **JPEG 1080 px for Instagram** (§8) |
| Video | None in the browser (ffmpeg.wasm is too heavy for field laptops). Station PCs can run native FFmpeg 9.0 ([download](https://ffmpeg.org/download.html)) | `ffmpeg -i in -c:v libx264 -crf 26 -preset slow -vf scale=-2:720 -c:a aac -b:a 96k -movflags +faststart out.mp4` for web and social, plus a 360p proxy |
| Datasets / PDFs | Never lossy. zstd/gzip happens only in transport (HTTP) | OCR text, thumbnails |

---

## 6. Email-to-archive

| Option | Infra change needed | Effort | Verdict |
|---|---|---|---|
| **IMAP polling / IDLE with imap-tools 1.15** on a dedicated mailbox (for example `archive@ncpor.res.in`) | **None.** The mailbox only needs creating | ~100 LOC | **Pick** |
| Postfix + `pipe(8)` to a script that POSTs raw MIME to FastAPI | An MX/subdomain delegation from NIC mail | Medium | Phase 2 if volume grows ([pipe(8)](https://www.postfix.org/pipe.8.html)) |
| Haraka 3.3.4 (Node SMTP + plugins) | Same MX change, plus a Node service | Medium | No: it is a second runtime |

```python
from imap_tools import MailBox, AND
with MailBox(IMAP_HOST).login(USER, PWD, "INBOX") as mb:
    for msg in mb.fetch(AND(seen=False), mark_seen=False, bulk=10):
        ar = msg.headers.get("authentication-results", ("",))[0]
        if msg.from_values.email.split("@")[-1] not in ALLOWED or "dmarc=pass" not in ar:
            mb.move(msg.uid, "Quarantine"); continue
        for att in msg.attachments:          # .filename .content_type .payload(bytes)
            archive(att.payload, att.filename, sender=msg.from_values.email, subject=msg.subject)
        mb.move(msg.uid, "Processed")
```
Sources: [imap-tools fetch](https://github.com/ikvk/imap_tools/blob/master/_autodocs/api-reference/mailbox-search.md), [attachments](https://github.com/ikvk/imap_tools/blob/master/_autodocs/api-reference/mail-attachment.md), [RFC 8601 Authentication-Results](https://www.rfc-editor.org/rfc/rfc8601).

**Gotchas:** (1) Trust the `Authentication-Results` header only when **our own receiving MTA** stamped it. Match the `authserv-id`. (2) Allow-list the sender address against registered scientists, not just the domain. (3) Scan every attachment with ClamAV (`clamdscan --stream`) before it reaches the archive ([ClamAV](https://docs.clamav.net/manual/Usage/Scanning.html)). The Python clamd clients are stale (last releases in 2014 and 2017), so call the CLI. (4) Reply automatically with a tus upload link when attachments exceed the mail size limit. (5) Whether NIC mail permits IMAP from a server with app passwords **is unverified. Ask NCPOR ICT.**

---

## 7. Auth and RBAC

### 7.1 Identity providers

| IdP | Audience | Protocols | Fit |
|---|---|---|---|
| **NIC Parichay** (G2G) | Government employees (NCPOR staff, MoES outreach cell) | REST, **SAML 2.0, OAuth 2.0**. Onboarding is a requirements form, then a support-team checklist ([NIC](https://www.nic.gov.in/project/parichay/), [Parichay](https://parichay.nic.in/pnv1/assets/?sid=1234567899)) | **Staff login**, brokered by Keycloak |
| **Jan Parichay / Meri Pehchaan** (G2C) | Citizens. Meri Pehchaan federates **JanParichay, e-Pramaan and DigiLocker** ([Digital India](https://www.digitalindia.gov.in/initiative/janparichay-meri-pehchaan-the-national-single-sign-on/), [about](https://janparichay.meripehchaan.gov.in/v1/pehchaan/about-us.html)) | SAML / OAuth | Only needed if the public must log in. **Not for MVP**: Ask stays anonymous |
| DigiLocker | Document wallet | OAuth via Meri Pehchaan | Irrelevant to our roles |
| Keycloak local accounts | Non-government PIs and foreign collaborators (for example Ny-Ålesund partners) | OIDC | This is why we need a broker at all |

**Keycloak 26.7:** `kc.sh start --optimized --hostname=auth.himvani… --db=postgres --health-enabled=true --metrics-enabled=true` with `KC_BOOTSTRAP_ADMIN_USERNAME/PASSWORD` ([containers guide](https://github.com/keycloak/keycloak/blob/main/docs/guides/server/containers.adoc)). Add Parichay as a **SAML or OIDC identity provider** ([identity brokering](https://www.keycloak.org/docs/latest/server_admin/#_identity_broker)). FastAPI validates access tokens against the realm JWKS with PyJWT `PyJWKClient` ([PyJWT](https://pyjwt.readthedocs.io/en/stable/usage.html#retrieve-rsa-signing-keys-from-a-jwks-endpoint)). Realm roles: `scientist`, `curator`, `reviewer`, `outreach`, `admin`.

### 7.2 Embargo with Postgres row-level security

```sql
ALTER TABLE asset ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset FORCE ROW LEVEL SECURITY;              -- the owner is not exempt
CREATE POLICY read_asset ON asset FOR SELECT USING (
  (visibility = 'public' AND (embargo_until IS NULL OR embargo_until <= now()))
  OR owner_id = current_setting('app.user_id', true)::uuid
  OR 'curator' = ANY (string_to_array(current_setting('app.roles', true), ',')));
-- In every request transaction (SQLAlchemy):
-- SELECT set_config('app.user_id', :uid, true), set_config('app.roles', :roles, true);
```
Sources: [RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html), [set_config](https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-ADMIN-SET).
**Gotchas:** (1) Superusers and `BYPASSRLS` roles skip policies, so the app must connect as a plain `himvani_app` role. (2) `set_config(…, true)` is transaction-local, which keeps it safe with pooled connections. Never use a session-level `SET`. (3) RLS filters run **after** the HNSW scan, so the public Ask path should hit the **partial `WHERE visibility='public'` index** (§3.3) and rely on RLS as defence in depth. (4) Objects are embargoed separately: private bucket, and presigned GET issued only after an RLS-checked lookup.

---

## 8. Social publishing APIs

| Channel | Access requirement | Limits / cost (verified) | Gotchas |
|---|---|---|---|
| **X API v2** | Developer account. **Prepaid credits** | **Pay-per-use, no subscription and no free tier.** Post create **$0.015**, **$0.200 if it contains a URL**. Reads $0.005 each, capped at 3 M/month ([pricing](https://docs.x.com/x-api/getting-started/pricing)). Legacy Basic/Pro moved to pay-per-use in Jun and Sep 2026 per third-party reports ([postzen](https://www.postzen.dev/blog/twitter-api-pricing)) | Put the link in the **first reply**, not the post, or budget $0.20 per post. Media goes through v2 `POST /2/media/upload/initialize → /{id}/append (≤5 MB chunks) → /{id}/finalize` ([media](https://docs.x.com/x-api/media/quickstart/media-upload-chunked)). A government body buying prepaid credits may be the real blocker |
| **YouTube Data API v3** | Google Cloud project + OAuth consent. **API compliance audit** | Since 1 Jun 2026 `videos.insert` has its **own bucket: 1 unit per call, 100 calls/day default**, and a separate 10,000-unit bucket covers everything else. `thumbnails.set` costs 50 ([quota](https://developers.google.com/youtube/v3/determine_quota_cost), [revision history](https://developers.google.com/youtube/v3/revision_history)) | **Uploads from unverified projects created after 28 Jul 2020 are locked private** ([revision history](https://developers.google.com/youtube/v3/revision_history)). Start the audit in week 1 |
| **Instagram** (Graph / Instagram API) | **Professional (Business/Creator) account**. Perms `instagram_business_basic` + `instagram_business_content_publish` (Instagram Login), or `instagram_basic` + `instagram_content_publish` + `pages_read_engagement` (Facebook Login). App review needed | **100 API posts per 24 h**. Carousel of up to **10** items counts as one post ([docs](https://developers.facebook.com/docs/instagram-platform/content-publishing/)) | **JPEG only.** Media must be on a **publicly reachable URL**, so a short-lived presigned GET works. Two steps: `POST /{ig-id}/media` then `POST /{ig-id}/media_publish`. Large video uses `rupload.facebook.com` |
| **Facebook Page** | Page access token. `pages_manage_posts`, `pages_read_engagement`, … and the `CREATE_CONTENT` task on the Page | — | `POST /{page-id}/feed` (`message`, `link`), `POST /{page-id}/photos` (`url`). Video needs `publish_video` ([docs](https://developers.facebook.com/docs/pages-api/posts)) |

**Fallback "export pack"**, always generated, so API access is never on the critical path. It is a ZIP per approved update containing:
- `captions/{channel}/{lang}.txt` with alt-text
- `images/ig_1080x1350.jpg`, `images/x_1600x900.jpg`, `images/yt_thumb_1280x720.jpg`
- `video/720p.mp4`
- `schedule.csv`
- one-click share links. The X web intent `https://x.com/intent/tweet?text=…&url=…&hashtags=…` needs no API and costs nothing ([web intent](https://docs.x.com/x-for-websites/post-button/guides/web-intent)).

---

## 9. DOIs and FAIR metadata

| Standard | Version / endpoint | How we use it | Source |
|---|---|---|---|
| **DataCite Metadata Schema** | **4.7** (3 Mar 2026). New: `Poster` and `Presentation` resource types, RAiD/SWHID identifiers, `relationType=Other`, `relationTypeInformation` | Canonical internal metadata record, generated by AI and confirmed by a human | [schema](https://schema.datacite.org/) |
| **DataCite REST API** | `POST https://api.datacite.org/dois` (test: `api.test.datacite.org`), `Content-Type: application/vnd.api+json`, Basic auth with a **repository ID and password**. Omitting `"event"` creates a Draft; `"event":"publish"` makes it Findable | Mint on curator approval. Create a Draft at upload time | [create DOIs](https://support.datacite.org/docs/api-create-dois) |
| Who can mint | **No NCPOR/NPDC repository appears in the DataCite API** (queries run 2026-09-30). The NPDC user manual v1.4 describes PDF/XML metadata but **no DOIs** | NCPOR must join DataCite directly or through a consortium. **Demo on Zenodo Sandbox** in the meantime | [DataCite clients API](https://api.datacite.org/clients?query=polar), [NPDC manual](https://npdc.ncpor.res.in/user_manual/National_Polar_Data_Center.pdf), [Zenodo dev](https://developers.zenodo.org/) |
| schema.org `Dataset` JSON-LD | `name, description, identifier (DOI), license, creator, spatialCoverage, temporalCoverage, distribution` | Embedded in every dataset page for Google Dataset Search | [Google guide](https://developers.google.com/search/docs/appearance/structured-data/dataset) |
| DCAT 3 / DCAT-AP 3.0.1 | W3C Rec / SEMIC (27 Oct 2025) | `/catalog.ttl` feed for aggregators | [DCAT 3](https://www.w3.org/TR/vocab-dcat-3/), [DCAT-AP](https://semiceu.github.io/DCAT-AP/releases/3.0.1/) |
| OAI-PMH 2.0 | 6 verbs, `oai_dc` + `oai_datacite` | Hand-write a ~150-line FastAPI router. `pyoai` was last released Mar 2022 ([PyPI](https://pypi.org/project/pyoai/)) | [spec](https://www.openarchives.org/OAI/openarchivesprotocol.html) |
| ISO 19115-1 / 19115-3 XML | Geospatial profile | `pygeometa` 0.21 (MCF YAML to ISO 19139/19115-3, Python ≥3.12) | [ISO](https://www.iso.org/standard/53798.html), [pygeometa](https://geopython.github.io/pygeometa/) |
| GCMD DIF / SCAR Antarctic Master Directory | National Antarctic Data Centres submit DIF records to the AMD (hosted by GCMD) | Phase 2 export so NPDC records reach the AMD | [SCADM](https://scar.org/science/standing/scadm) |

---

## 10. Observability and operations

| Concern | Pick | Why / source |
|---|---|---|
| Traces, metrics and logs from the API | FastAPI 0.142 native OTel exporting OTLP to an **OTel Collector v0.162** | Zero code ([FastAPI OTel](https://fastapi.tiangolo.com/advanced/opentelemetry/)) |
| Pilot backend | **`grafana/otel-lgtm`**: one container with Collector, Prometheus, Tempo, Loki, Pyroscope and Grafana. "Intended for development, demo, and testing" | [repo](https://github.com/grafana/docker-otel-lgtm). Split into separate Prometheus 3.15, Loki 3.7, Tempo 3.1 and Grafana 13.2 for production |
| Errors | **GlitchTip** (MIT, Sentry-SDK compatible, **256 MB RAM** all-in-one, Postgres only) | [install](https://glitchtip.com/documentation/install) |
| Sentry self-hosted 26.9 | **4 CPU, 16 GB RAM + 16 GB swap, 20 GB disk**, FSL licence | [requirements](https://develop.sentry.dev/self-hosted/). Too heavy for the pilot |
| Next.js | `instrumentation.ts` + `@sentry/nextjs` 11 pointed at the GlitchTip DSN | [npm](https://www.npmjs.com/package/@sentry/nextjs) |
| Orchestration | **Docker Compose for the pilot.** MeghRaj offers Kubernetes (Tier III) and, via MeghRaj 2.0, EKS for later | [NICSI](https://nicsi.nic.in/nicsi/nicsi-cloud/), [AWS](https://press.aboutamazon.com/aws/2026/2/aws-and-yotta-data-services-collaborate-to-deploy-hybrid-cloud-infrastructure-for-national-informatics-centres-meghraj-2-0) |
| Procurement | Register on the **NGC portal (ngc.gov.in)**, then plan quotas, then provision | [NICSI](https://nicsi.nic.in/nicsi/nicsi-cloud/) |

### Minimal pilot topology (week-12 NCPOR pilot)

VM sizes below are our estimates, not sourced.

```
                    Internet ─── Caddy (TLS, gzip/zstd, rate-limit /v1/ask)
                                   │
 VM-1 "app" (8 vCPU / 32 GB / 500 GB)                     VM-2 "gpu" (1× GPU, 8 vCPU / 32 GB)
 ├─ next (standalone Node 24)         :3000               ├─ procrastinate worker -q gpu  (Whisper, CLIP, OCR, embeddings)
 ├─ api  (FastAPI 0.142, 4 workers)   :8000  ◄── tus hooks└─ (reads/writes the same PG + S3)
 ├─ procrastinate worker -q cpu,mail  (IMAP poll, thumbnails, ffmpeg, DOI, social)
 ├─ tusd 2.10                         :8080  → S3
 ├─ keycloak 26.7                     :8443  (DB: same PG cluster, separate database)
 ├─ postgres 18 + pgvector 0.8.6 (or MeghRaj managed PG if it permits the `vector` extension)
 ├─ seaweedfs 4.48 (only if MeghRaj object storage is unavailable)
 ├─ glitchtip + grafana/otel-lgtm
 └─ clamav (clamd)
 Backups: nightly pg_dump plus bucket replication to a second MeghRaj zone. Restore is tested in week 10.
```
There is no Redis, RabbitMQ or Kubernetes in the pilot. Add Kubernetes when the reuse partners (INCOIS, NCCR, IMD) need multi-tenant scaling.

---

## Recommendations for HIMVANI

1. **Pin Next.js ≥16.3.8, React 19.3 and next-intl 4.14. Put next-intl in `proxy.ts`.** Why: Next 16 renamed middleware, and the 16.3.x line is shipping critical security fixes monthly.
2. **Hard-code `RTL = {ur, ks, sd}` and use script-qualified locale codes (`mni-Mtei`, `sat-Olck`).** Why: CLDR defaults would render Manipuri in Bengali script.
3. **Keep file bytes in a Dexie outbox (Blob) and upload with tus. Use Serwist Background Sync only for small JSON.** Why: Background Sync is Chromium-only, and tus cannot resume without the Blob.
4. **Make the field app "sync on open + sync in background where supported", and call `navigator.storage.persist()` at install.** Why: it avoids iOS/Safari eviction and missing-sync surprises.
5. **OpenLayers is the primary map (EPSG:3031/3413 with GIBS). Cesium/Resium is an optional lazy 3D tab. Drop Leaflet.** Why: native polar projections, versus a plugin that has not been published in about 9 years.
6. **Never use Cesium ion. Pass our own `baseLayer`.** Why: token dependency and off-shore data flow.
7. **FastAPI 0.142 + SSE for Ask, with Python 3.12, psycopg 3 as the single driver, and SQLAlchemy 2.1 with `[asyncio]`.** Why: one driver serves ORM, queue and pgvector, and SSE streams citations natively.
8. **PostgreSQL 18 + pgvector ≥0.8.6, halfvec embeddings, a partial HNSW index `WHERE visibility='public'`, and iterative scans for internal search.** Why: the embargo stays physically out of the public ANN path, at half the storage.
9. **Hybrid retrieval: multilingual vectors plus FTS (hindi/tamil/nepali/english configs, `simple` for the rest), merged with RRF.** Why: Postgres has no stemmer for most of the 36 languages.
10. **Procrastinate for all background jobs (`cpu`, `gpu`, `mail` queues).** Why: it runs on Postgres we already operate. arq is maintenance-only and Celery or Dramatiq would add a broker.
11. **Use MeghRaj object storage if it exists. Otherwise SeaweedFS. Never MinIO Community.** Why: MinIO was archived in April 2026, and SeaweedFS is Apache-2.0 with object lock and versioning.
12. **tusd with an 8 MiB chunk size, `-network-timeout 180s`, pre-create auth, a client-side SHA-256 in metadata, and verification on post-finish.** Why: tus-js-client has no checksum, and satellite links stall longer than 60 s.
13. **Read filenames from tusd `.info` or hook payloads, never from S3 object metadata.** Why: tusd turns non-ASCII (Hindi) metadata into `?`.
14. **Archive originals. Generate AVIF/WebP for the web, JPEG for Instagram, and H.264 720p for video with Pillow 12 and FFmpeg 9.** Why: FAIR provenance plus platform format rules.
15. **Email-to-archive = IMAP polling of a dedicated mailbox, with DMARC-pass, sender allow-list and ClamAV gates.** Why: no MX change on the government domain, and every trust boundary is checked.
16. **Keycloak 26.7 brokering NIC Parichay for staff, local accounts for external PIs, anonymous public.** Why: one token format for FastAPI, and no citizen-login onboarding needed for MVP.
17. **Embargo = RLS (`FORCE`, non-owner app role, `set_config(...,true)`) plus a private bucket with presigned GET after the RLS check.** Why: defence in depth for the "embargoed data goes public" risk (High).
18. **Social: X via pay-per-use with the link in a reply, the YouTube audit started in week 1, Instagram as JPEG through a presigned URL. Always ship the export pack plus X web intent.** Why: every API has an approval or cost gate, and the pack keeps the demo independent of them.
19. **Store DataCite 4.7 metadata from day 1. Mint on Zenodo Sandbox for the demo, and ask NCPOR to obtain a DataCite repository account.** Why: NCPOR currently has no DataCite presence.
20. **Pilot on Docker Compose on 2 VMs (app + GPU), with otel-lgtm and GlitchTip for observability. Plan the Kubernetes/EKS move after the pilot.** Why: a 6-person team cannot operate K8s, Ceph or Sentry during a 12-week build.

## Corrections to our submission

| # | Submission says | Reality (verified 2026-09-30) | Suggested wording |
|---|---|---|---|
| 1 | Records are "split across **two websites**: NCPOR site and NPDC" | At least **three live public properties**: `ncpor.res.in`, `npdc.ncpor.res.in` and `data.ncpor.res.in` (all HTTP 200). The NPDC manual itself points users to data.ncpor.res.in. Plus `isea.ncpor.res.in` for expedition calls ([NPDC manual v1.4](https://npdc.ncpor.res.in/user_manual/National_Polar_Data_Center.pdf)) | "split across **three or more NCPOR websites** (NCPOR, NPDC, NCPOR data portal)" |
| 2 | Inputs are Maitri, Bharati, Himadri | NPDC also archives **Himansh** (Himalaya) and **Southern Ocean expedition** data ([NPDC manual](https://npdc.ncpor.res.in/user_manual/National_Polar_Data_Center.pdf)) | Add Himansh and the Southern Ocean expeditions to the sources |
| 3 | Interface: "CesiumJS, **Leaflet**" | Leaflet 2.0 is still alpha and Proj4Leaflet has not been published in about 9 years. OpenLayers handles EPSG:3031/3413 natively ([npm](https://www.npmjs.com/package/proj4leaflet), [Leaflet](https://leafletjs.com/2025/05/18/leaflet-2.0.0-alpha.html)) | "CesiumJS (3D) + **OpenLayers** (polar 2D)" |
| 4 | "**Zero licence cost**" and posting to X/YouTube/Instagram | Software licences are free, but the **X API has no free tier** ($0.015/post, $0.20 with a URL) ([X pricing](https://docs.x.com/x-api/getting-started/pricing)). **YouTube uploads stay private until an API audit passes** ([YouTube](https://developers.google.com/youtube/v3/revision_history)). Instagram needs Meta app review ([Meta](https://developers.facebook.com/docs/instagram-platform/content-publishing/)) | "Zero **software licence** cost. Social APIs need platform approvals and small usage fees, with an export-pack fallback" |
| 5 | "FAIR datasets **with DOIs**" as a given | No NCPOR/NPDC DataCite repository was found. The NPDC manual does not mention DOIs. Minting needs a DataCite membership first ([DataCite API](https://api.datacite.org/clients?query=polar), [how to mint](https://support.datacite.org/docs/api-create-dois)) | "**DOI-ready** DataCite 4.7 metadata. DOIs are minted once NCPOR has a DataCite repository account" |
| 6 | Offline field app "syncs when a link is available" | Automatic background sync works only on Chromium browsers. On Safari/iOS/Firefox, sync happens when the app is opened ([MDN BCD](https://github.com/mdn/browser-compat-data/blob/main/api/SyncManager.json)) | "syncs automatically on Android/Chrome, and on app open elsewhere" |
| 7 | Reference [1] `ncaor.gov.in/news/view/929` | The legacy NCAOR domain **did not respond** from our check on 2026-09-30. The institute's current domain is `ncpor.res.in` (medium confidence, possibly a transient or geo-block issue) | Re-verify, or cite the same news item on `ncpor.res.in` |
| 8 | Hosting "NIC MeghRaj cloud" (no detail) | Correct, and it has grown: NICSI lists object storage, managed PostgreSQL, Kubernetes and GPU. **MeghRaj 2.0 (Feb 2026)** adds AWS Outposts (S3/EKS/RDS) in Yotta DCs. Access is through the NGC portal ([NICSI](https://nicsi.nic.in/nicsi/nicsi-cloud/), [AWS](https://press.aboutamazon.com/aws/2026/2/aws-and-yotta-data-services-collaborate-to-deploy-hybrid-cloud-infrastructure-for-national-informatics-centres-meghraj-2-0)) | Not wrong. Add "managed object storage / PostgreSQL on MeghRaj 2.0" |
