# HydroGuard 2.0

A redesigned **live-data-only** catchment intelligence workspace for the Rishi Ganga valley in Uttarakhand. React + TypeScript + Vite, with an optional persistent Node/Express collector.

## What is included

- Live Open-Meteo rainfall and topsoil moisture; daily GloFAS river discharge when available.
- Explainable per-village risk scores, current input provenance, timestamped snapshots and trend inspection.
- Geographic OpenStreetMap with village selection, search, responsive navigation and keyboard-accessible controls.
- Historical ERA5 replay in a separate archive view, including three days of warm-up data.
- Optional server collection every ten minutes, deduplicated requests, atomic snapshot writes and seven-day bounded retention.
- Strict TypeScript, dependency lockfile, data-integrity tests and GitHub Actions browser checks.

There is **no demo mode or synthetic fallback**. Test fixtures exist only inside `tests/` and are not included in the app bundle. Illustrative populations, shelters, routes, sensors and delivery receipts have been removed.

## Run on your computer

Install Node.js 22 or newer, open this folder in VS Code, then run:

```bash
npm ci
npm run dev
```

Open **http://127.0.0.1:3000**. The default configuration fetches provider APIs directly from the browser. No API key is needed for the public endpoints used here. Provider availability and usage limits still apply.

## Build for static hosting

```bash
npm run build
```

Deploy the `dist/` directory. Leave `VITE_DATA_MODE` unset. This mode works without a backend; collection occurs while the dashboard is open. The separate `dist-server/` output is not needed for static hosting.

## Run the persistent server

1. Copy `.env.example` to `.env` and uncomment `VITE_DATA_MODE=server` **before building**. Vite reads this at build time.
2. Run `npm run build`, then `npm start`.
3. Open http://localhost:3000.

Runtime defaults: port 3000 and `./data` for storage. Set `PORT` and `HYDROGUARD_DATA_DIR` in your host environment to override them; the server does not load runtime values from `.env` automatically. Attach a persistent disk to the data directory. Use one collector instance per directory. HTTPS and process supervision should be supplied by your hosting platform.

Endpoints:

- `GET /api/catchment`: latest validated result; 503 when there is no recent valid data.
- `GET /api/health`: source freshness and last collection status; 503 when unavailable.

The collector runs every ten minutes, independent of connected browsers. Raw responses are persisted atomically and up to 1,008 snapshots are retained. This is a small single-process deployment, not a distributed monitoring service. It does not send alerts.

## Data integrity

- A complete, consecutive 72-hour rainfall window and a valid current soil reading are mandatory. Missing values never become zero.
- A malformed or insufficient village response suppresses the catchment result conservatively.
- Missing discharge excludes that factor and renormalizes the remaining weights.
- Network failure can use only a previously validated real response up to six hours old, labelled cached. Expired/future/invalid timestamps are rejected.
- Refreshes cancel superseded browser requests. Returning to the page or reconnecting triggers a refresh.
- Retrieval time and model valid hour are displayed separately. Daily discharge has a different temporal resolution from hourly weather data.

## Model and limitations

The index is **rule-based, uncalibrated, and not a flood probability or an official warning**. Base weights: rainfall 35, 72-hour rainfall 20, topsoil 25, discharge 20. Without discharge: 44 / 25 / 31. Tiers: Low 0–29, Medium 30–59, High 60–79, Severe 80–100.

Only the 24-hour rainfall cut-offs follow IMD categories. Other thresholds and the assumed soil field capacity of 0.42 m³/m³ are heuristics. Inputs are correlated, model grids are coarse, and nearby villages can share a grid cell. These are modelled values, not field observations.

The map uses configured point coordinates and OpenStreetMap tiles; it does not calculate inundation or route safety. Physical sensor feeds, verified shelters and evacuation routing are not integrated.

Historical replay explicitly requests ERA5 and fetches three warm-up days. Missing hours are excluded. Reanalysis and whole-day historical discharge contain retrospective information, so threshold-crossing times are **not validated warning lead times**. Calibration requires gauge records, verified flood and non-flood periods, and a separate evaluation set.

## Verification

```bash
npm run check                 # strict types, unit tests, production bundles
npx playwright install chromium
npm run test:e2e              # desktop + mobile interaction tests
```

Browser tests use clearly isolated API fixtures to verify failure cases consistently. GitHub Actions runs the same checks and uploads browser screenshots/reports. To inspect current provider behaviour, use the live dashboard or `/api/health`; test results do not establish hydrological accuracy.

## Source layout

- `src/hooks/useLiveCatchment.ts`: refresh, cancellation and freshness lifecycle.
- `src/utils/dataQuality.ts`: numeric, window and cache validity.
- `src/utils/openMeteo.ts`: provider integration and provenance.
- `src/utils/riskScoring.ts`: deterministic scoring.
- `src/components/LiveMap.tsx`, `LiveTrend.tsx`: geographic and trend views.
- `src/components/EventReplayView.tsx`: historical archive explorer.
- `server/collector.ts`: persisted collection and rotation.

Data attribution: [Open-Meteo](https://open-meteo.com/), Copernicus GloFAS / ERA5. Map attribution: [OpenStreetMap contributors](https://www.openstreetmap.org/copyright). Review provider terms and capacity before operational or commercial deployment.
