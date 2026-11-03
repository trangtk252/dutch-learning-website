import { expect, test } from "@playwright/test";
import { logIn } from "./helpers";

test("pages that need an account send visitors to the login page", async ({ page }) => {
  for (const path of ["/dashboard", "/vocabulary", "/settings"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login/);
  }
});

test("a wrong password is rejected", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("nobody@example.com");
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByText("Wrong email or password.")).toBeVisible();
});

test("log in, then log out", async ({ page }) => {
  await logIn(page);
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Log out" }).first().click();
  await expect(page).toHaveURL(/\/login/);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});
