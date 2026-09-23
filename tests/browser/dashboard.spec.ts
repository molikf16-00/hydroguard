import { test, expect } from "@playwright/test";
// Test-only deterministic API responses. No fixture is shipped in the application.
function forecast() {
  const end = new Date();
  end.setUTCMinutes(0, 0, 0);
  const time = Array.from({ length: 120 }, (_, i) =>
    new Date(end.getTime() - (119 - i) * 3600000).toISOString().slice(0, 16),
  );
  return Array.from({ length: 5 }, () => ({
    latitude: 30.5,
    longitude: 79.5,
    hourly: {
      time,
      precipitation: Array(120).fill(1),
      soil_moisture_0_to_7cm: Array(120).fill(0.3),
    },
  }));
}
test.beforeEach(async ({ page }) => {
  await page.route("https://tile.openstreetmap.org/**", (route) =>
    route.abort(),
  );
  await page.route("https://flood-api.open-meteo.com/**", (route) =>
    route.fulfill({ status: 503, body: "{}" }),
  );
});
test("live results, navigation, search and export", async ({ page }, info) => {
  await page.route("https://api.open-meteo.com/**", (route) =>
    route.fulfill({ json: forecast() }),
  );
  await page.goto("/");
  await expect(
    page.getByText("Live model data", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".metric-card").first()).toContainText("24.0");
  await page.getByRole("button", { name: "Understand this score" }).click();
  await expect(page.getByRole("dialog")).toContainText("WHY THIS SCORE");
  await page.getByRole("button", { name: "Close dialog" }).click();
  if (info.project.name === "mobile")
    await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("button", { name: "Village monitor", exact: true })
    .click();
  await page.getByRole("textbox", { name: "Search villages" }).fill("Raini");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByRole("button", { name: "Inspect", exact: true }).click();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export snapshot", exact: true })
    .click();
  expect((await download).suggestedFilename()).toMatch(/^hydroguard-live-/);
  await expect(page.getByText("Live snapshot downloaded")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: `test-results/${info.project.name}-dashboard.png`,
    fullPage: true,
  });
});
test("outage shows no scores and disables export", async ({ page }) => {
  await page.route("https://api.open-meteo.com/**", (route) =>
    route.fulfill({ status: 503, body: "{}" }),
  );
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText(
    "Live data isn’t available",
  );
  await expect(
    page.getByRole("button", { name: "Export snapshot" }),
  ).toBeDisabled();
  await expect(page.locator(".hero-tier")).toHaveText("AWAITING DATA");
  await expect(page.locator(".metric-card").first()).toContainText(
    "No measurement",
  );
});
test("missing rainfall is insufficient, not a low score", async ({ page }) => {
  const response = forecast();
  (response[0].hourly.precipitation as (number | null)[])[115] = null;
  await page.route("https://api.open-meteo.com/**", (route) =>
    route.fulfill({ json: response }),
  );
  await page.goto("/");
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.locator(".score-ring strong")).toHaveText("—");
});
