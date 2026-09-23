import test from "node:test";
import assert from "node:assert/strict";
import {
  completeSum,
  contiguousHours,
  cacheAgeMinutes,
  daysBefore,
} from "../src/utils/dataQuality";
import { calculateTransparentRiskScore } from "../src/utils/riskScoring";
import {
  processBundle,
  dischargeRatioForDate,
  type RawBundle,
} from "../src/utils/openMeteo";
import { DEFAULT_CATCHMENT_CONFIG } from "../src/config/catchmentConfig";
import { generateCapXml } from "../src/utils/capGenerator";

const current = new Date("2026-09-23T12:00:00Z");
const times = Array.from({ length: 120 }, (_, i) =>
  new Date(current.getTime() - (119 - i) * 3600000).toISOString().slice(0, 16),
);
function bundle(): RawBundle {
  return {
    fetchedAtIso: current.toISOString(),
    coordKey: "",
    flood: Array(5).fill(null),
    forecast: DEFAULT_CATCHMENT_CONFIG.villages.map((v) => ({
      latitude: v.lat,
      longitude: v.lon,
      hourly: {
        time: [...times],
        precipitation: Array(120).fill(1),
        soil_moisture_0_to_7cm: Array(120).fill(0.3),
      },
    })),
  };
}
test("missing rainfall and incomplete windows are not zero rainfall", () => {
  assert.equal(completeSum([1, null, 3], 2, 3), null);
  assert.equal(completeSum([1, 2], 1, 3), null);
  assert.equal(completeSum([1, NaN, 3], 2, 3), null);
  assert.equal(completeSum([1, -1, 3], 2, 3), null);
  assert.equal(completeSum([0, 0, 0], 2, 3), 0);
});
test("history must have consecutive hourly timestamps", () => {
  assert.ok(contiguousHours(times, 119, 72));
  const gap = [...times];
  gap[100] = times[99];
  assert.equal(contiguousHours(gap, 119, 72), false);
});
test("warm-up crosses calendar boundaries correctly", () => {
  assert.equal(daysBefore("2024-03-01", 3), "2024-02-27");
  assert.equal(daysBefore("2026-01-01", 3), "2025-12-29");
});
test("cache rejects expiry, future timestamps and corrupt timestamps", () => {
  const now = current.getTime();
  assert.equal(cacheAgeMinutes("invalid", now), null);
  assert.equal(cacheAgeMinutes(new Date(now + 60000).toISOString(), now), null);
  assert.equal(
    cacheAgeMinutes(new Date(now - 361 * 60000).toISOString(), now),
    null,
  );
  assert.equal(
    cacheAgeMinutes(new Date(now - 60 * 60000).toISOString(), now),
    60,
  );
});
test("live processing produces one genuine score per village", () => {
  const result = processBundle(
    bundle(),
    DEFAULT_CATCHMENT_CONFIG,
    current,
    false,
    0,
  );
  assert.equal(result.villages.length, 5);
  assert.equal(result.metrics.rainfall.numericValue, 24);
  assert.equal(result.trendHistory.length, 24);
  assert.equal(result.metrics.riverLevel.unavailable, true);
  assert.equal(
    result.villageScores["v-raini"].factors.reduce(
      (s, f) => s + f.weightPercent,
      0,
    ),
    100,
  );
  assert.equal(result.validAtIso, current.toISOString().replace(".000", ""));
});
test("null rainfall or soil aborts scoring instead of lowering risk", () => {
  const raw = bundle();
  raw.forecast[0].hourly.precipitation[110] = null;
  assert.throws(
    () => processBundle(raw, DEFAULT_CATCHMENT_CONFIG, current, false, 0),
    /Insufficient data/,
  );
  const soil = bundle();
  soil.forecast[0].hourly.soil_moisture_0_to_7cm[119] = null;
  assert.throws(
    () => processBundle(soil, DEFAULT_CATCHMENT_CONFIG, current, false, 0),
    /Insufficient data/,
  );
});
test("stale model hours cannot masquerade as current", () => {
  assert.throws(
    () =>
      processBundle(
        bundle(),
        DEFAULT_CATCHMENT_CONFIG,
        new Date(current.getTime() + 3600000),
        false,
        0,
      ),
    /current hour/,
  );
});
test("discharge requires a positive baseline and sufficient history", () => {
  assert.equal(
    dischargeRatioForDate({ time: ["a", "b"], river_discharge: [2, 3] }, "b"),
    null,
  );
  assert.equal(
    dischargeRatioForDate(
      { time: ["a", "b", "c", "d"], river_discharge: [0, 0, 0, 2] },
      "d",
    ),
    null,
  );
  assert.equal(
    dischargeRatioForDate(
      { time: ["a", "b", "c", "d"], river_discharge: [2, 4, 6, 8] },
      "d",
    )?.ratio,
    2,
  );
});
test("scores stay bounded and rise monotonically with rainfall", () => {
  let previous = -1;
  for (let rain = 0; rain <= 300; rain++) {
    const score = calculateTransparentRiskScore({
      rain1hMm: rain / 24,
      rain3hMm: rain / 8,
      rain24hMm: rain,
      rain72hAntecedentMm: rain * 3,
      soilMoistureSaturationPct: 75,
      riverDischargeRatio: 1.5,
    });
    assert.ok(score.totalScore >= previous && score.totalScore <= 100);
    previous = score.totalScore;
    assert.equal(
      score.riskLevel,
      score.totalScore >= 80
        ? "SEVERE"
        : score.totalScore >= 60
          ? "HIGH"
          : score.totalScore >= 30
            ? "MEDIUM"
            : "LOW",
    );
  }
});
test("invalid numeric inputs are rejected", () => {
  assert.throws(
    () =>
      calculateTransparentRiskScore({
        rain1hMm: NaN,
        rain3hMm: 0,
        rain24hMm: 0,
        rain72hAntecedentMm: 0,
        soilMoistureSaturationPct: 50,
        riverDischargeRatio: null,
      }),
    /Invalid risk input/,
  );
});
test("CAP utility preserves an explicit identity and escapes XML", () => {
  const params = {
    identifier: "fixed-id",
    sentAt: current,
    headline: "A & B",
    description: "<test>",
    instruction: "exercise",
    villageName: "Raini",
    cluster: "Rishi Ganga",
    lat: 30,
    lon: 79,
    leadTimeDisplay: "Unavailable",
    riskLevel: "LOW" as const,
  };
  const xml = generateCapXml(params);
  assert.equal(xml, generateCapXml(params));
  assert.ok(
    xml.includes("<status>Exercise</status>") &&
      xml.includes("A &amp; B") &&
      xml.includes("&lt;test&gt;"),
  );
});
