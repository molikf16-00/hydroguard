# HydroGuard

A flash flood **decision-support prototype** for Himalayan valleys, built for Smart India Hackathon. The prototype catchment is Chamoli / Rishi Ganga, Uttarakhand.

HydroGuard takes modelled rainfall, topsoil moisture and modelled river discharge for each village, turns them into an explainable 0-100 risk score, and shows the result with evacuation guidance and a CAP 1.2 exercise export.

> **Status: prototype.** It has no field sensors, is not calibrated against gauge records, and is not connected to any alerting authority. Nothing it produces is an official warning.

## What is real, simulated and planned

| Built | Simulated / illustrative | Planned |
|---|---|---|
| Live Open-Meteo forecast-model rainfall and soil moisture, fetched per village | Demo Simulator scenarios (synthetic inputs) | Field rain gauges, river radar, soil probes |
| GloFAS modelled river discharge (daily), when available | Channel test pings (nothing is sent) | Calibration against USDMA / CWC / IMD gauge records |
| Explainable per-village scoring and a "Why this score" breakdown | Village populations, shelters, routes, river distances (not surveyed) | DEM and Sentinel-1 terrain analysis; cryospheric trigger detection |
| ERA5 event replay with computed peak and threshold-crossing times | Wave speed (2-5 m/s) and soil field capacity (0.42 m³/m³) are assumptions | Real SMS, cell broadcast, siren and LoRa integration with the authorities |
| CAP 1.2 export, marked `status=Exercise` | | ML evaluation once calibration data exists |

## Data sources

- **Open-Meteo forecast API**: hourly `precipitation` and `soil_moisture_0_to_7cm` (weather-model output, roughly 10-25 km grid; not gauge observations).
- **Open-Meteo Flood API**: daily `river_discharge` from Copernicus GloFAS (a model on a ~5 km grid; not a river gauge).
- **Open-Meteo Archive API (ERA5)**: hourly history for the Event Replay tab (roughly 25 km, so it can understate local cloudburst intensity).

If the network fails, only a previously fetched real response (at most 6 hours old) is shown, clearly labelled as cached. With no data, the app says "No live data available" and shows no risk values.

## How the score works

Rule-based and uncalibrated. Base weights: rainfall 35, 72 h antecedent rainfall 20, topsoil moisture 25, river discharge 20. If discharge is unavailable, that factor is excluded and the others are renormalized to 44 / 25 / 31.

- Only the **24-hour rainfall cut-offs** follow IMD categories (Heavy 64.5-115.5, Very Heavy 115.6-204.4, Extremely Heavy >= 204.5 mm).
- The 1 h / 3 h triggers, antecedent cut-offs, soil cut-offs, discharge-ratio cut-offs and the weights are HydroGuard heuristics.
- The four indicators are all rain-driven, so they are correlated. "Indicator agreement" is not independent confirmation.
- Tiers: Low 0-29, Medium 30-59, High 60-79, Severe 80-100.

## Known limitations

- Rainfall-based scoring cannot detect cryospheric triggers. The 7 Feb 2021 Chamoli event (a rock-and-ice avalanche) is included in the replay as an out-of-scope example.
- "Wave travel time" is distance from an upstream trigger point divided by an assumed 2-5 m/s. It is not a forecast of warning lead time and has not been calibrated against any event.
- Model grids are coarse compared with mountain valleys.
- Village data (population, shelters, routes) is illustrative and must be replaced with surveyed data.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint     # type-check (tsc --noEmit)
npm run build
```

Village coordinates, distances and assumptions live in `src/config/catchmentConfig.ts`.
