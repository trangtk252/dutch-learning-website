import { expect, type Page } from "@playwright/test";

/**
 * Signs in with an existing account, then opens the dashboard. Create one first:
 *   npm run user:create -- e2e@example.com e2e-password-123 "E2E"
 * (and finish its onboarding once). Override with E2E_EMAIL / E2E_PASSWORD.
 */
export const E2E_EMAIL = process.env.E2E_EMAIL ?? "e2e@example.com";
export const E2E_PASSWORD = process.env.E2E_PASSWORD ?? "e2e-password-123";

export async function logIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(E2E_EMAIL);
  await page.getByLabel("Password").fill(E2E_PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/(dashboard|onboarding)/);
}

export async function openApp(page: Page) {
  await logIn(page);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard/);
}
