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
test("original layout with live scores, village search and exports", async ({
  page,
}, info) => {
  await page.route("https://api.open-meteo.com/**", (route) =>
    route.fulfill({ json: forecast() }),
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Flash Flood Decision Support System" }),
  ).toBeVisible();
  await expect(
    page.getByText("Live model data", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Demo Simulator", { exact: true })).toHaveCount(
    0,
  );
  await expect(page.locator("#telemetry")).toContainText("24");
  await page
    .getByRole("button", {
      name: "Why This Score? (Factor Attribution)",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Risk score explanation" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page.getByRole("textbox", { name: "Search villages" }).fill("Raini");
  await expect(page.locator("#villages tbody tr")).toHaveCount(1);
  await page
    .getByRole("button", {
      name: "Explain Raini (Upper & Lower) score",
      exact: true,
    })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export snapshot", exact: true })
    .click();
  expect((await download).suggestedFilename()).toMatch(/^hydroguard-live-/);
  await expect(page.getByText("Live snapshot downloaded")).toBeVisible();
  await page
    .getByRole("button", { name: "Geographic map", exact: true })
    .click();
  await expect(
    page.getByLabel("OpenStreetMap showing configured village coordinates"),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Original schematic", exact: true })
    .click();
  await expect(
    page.getByText("Schematic, not to scale", { exact: true }),
  ).toBeVisible();
  const capDownload = page.waitForEvent("download");
  await page
    .getByRole("button", {
      name: "Export CAP for Raini (Upper & Lower)",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("dialog", { name: "CAP exercise export" }),
  ).toContainText("EXERCISE");
  await page.getByRole("button", { name: /Download/ }).click();
  expect((await capDownload).suggestedFilename()).toMatch(/cap-exercise/);
  await page.getByRole("button", { name: "Close CAP export" }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= (window.visualViewport?.width ?? window.innerWidth),
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: `test-results/${info.project.name}-original-dashboard.png`,
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
  await expect(page.locator("#telemetry")).toHaveCount(0);
});
test("missing rainfall is insufficient, not a low score", async ({ page }) => {
  const response = forecast();
  (response[0].hourly.precipitation as (number | null)[])[115] = null;
  await page.route("https://api.open-meteo.com/**", (route) =>
    route.fulfill({ json: response }),
  );
  await page.goto("/");
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Export snapshot" }),
  ).toBeDisabled();
});
