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
  await expect(page.getByRole("heading", { name: "Salaries" })).toBeVisible();
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

