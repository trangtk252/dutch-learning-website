import { expect, test } from "@playwright/test";

test("protected pages redirect to login", async ({ page }) => {
  await page.goto("/vocabulary");
  await expect(page).toHaveURL(/\/login\?next=%2Fvocabulary/);
});

test("sign up, complete onboarding and see a personal plan", async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;
  await page.goto("/signup");
  await page.getByLabel("Your name").fill("Robin");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("correct-horse-42");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/onboarding/);
  await page.getByText("Intermediate — work, study", { exact: false }).first().click(); // current B1
  await page.locator("fieldset").nth(1).getByText("B2", { exact: true }).click(); // target B2
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByText("Show exam practice and track readiness").click();
  await page.getByText("Programma II", { exact: true }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByText("30 min", { exact: true }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Create my plan" }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: "What to study today" })).toBeVisible();
  await expect(page.getByText(/Today's plan · 30 min/)).toBeVisible();
  await expect(page.getByText("NT2 Programma II (B2)")).toBeVisible();
});
