import { expect, test } from "@playwright/test";

test("home shows the editorial headline and living stats", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /One lattice/ })).toBeVisible();
  await expect(page.getByText("open now", { exact: false })).toBeVisible();
  await expect(page.getByRole("link", { name: "Browse roles" })).toBeVisible();
});

test("roles index lists open roles", async ({ page }) => {
  await page.goto("/roles");
  await expect(page.getByTestId("roles-count")).toContainText("open roles");
  await expect(page.getByTestId("job-card").first()).toBeVisible({ timeout: 25_000 });
});

test("role detail exposes the apply form", async ({ page }) => {
  await page.goto("/roles");
  await page.getByTestId("job-card").first().getByRole("link").first().click();
  await expect(page.getByTestId("apply-form")).toBeVisible({ timeout: 15_000 });
});

test("salaries observatory renders the band and calculator", async ({ page }) => {
  await page.goto("/salaries");
  await expect(page.getByRole("heading", { name: /Web3 salary observatory/i })).toBeVisible();
  await expect(page.getByTestId("comp-calc")).toBeVisible();
  await expect(page.getByText(/avg/i).first()).toBeVisible();
});

test("URL is the source of truth for role filters", async ({ page }) => {
  await page.goto("/roles?chain=solana&seniority=senior");
  await expect(page).toHaveURL(/chain=solana/);
  await expect(page).toHaveURL(/seniority=senior/);
  await expect(page.getByTestId("roles-count")).toBeVisible();
});

test("roles board lists live openings", async ({ page }) => {
  await page.goto("/roles");
  await expect(page.getByTestId("roles-count")).toContainText("live listings", { timeout: 25_000 });
});

test("coinbase company page lists live roles", async ({ page }) => {
  await page.goto("/companies/coinbase");
  await expect(page.getByRole("heading", { name: "Coinbase" })).toBeVisible();
  await expect(page.getByTestId("job-card").first()).toBeVisible({ timeout: 25_000 });
});

test("sitemap and llms.txt are public", async ({ request }) => {
  const sm = await request.get("/sitemap.xml");
  expect(sm.ok()).toBeTruthy();
  const xml = await sm.text();
  expect(xml).toContain("lattice-devtechedge1.vercel.app");
  expect(xml).toContain("/companies/coinbase");
  const ll = await request.get("/llms.txt");
  expect(ll.ok()).toBeTruthy();
  expect(await ll.text()).toMatch(/Lattice/i);
});

