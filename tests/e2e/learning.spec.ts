import { expect, test } from "@playwright/test";
import { loginAsDemo } from "./helpers";

test.beforeEach(async ({ page }) => loginAsDemo(page));

test("save a word and see its enriched entry", async ({ page }) => {
  await page.goto("/vocabulary");
  await page.getByLabel("Save a Dutch word").fill("de bibliotheek");
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page).toHaveURL(/\/vocabulary\/.+\?added=1/);
  await expect(page.getByRole("heading", { name: "de bibliotheek" })).toBeVisible();
  await expect(page.getByText("library", { exact: true })).toBeVisible();
});

test("review a flashcard with FSRS ratings", async ({ page }) => {
  await page.goto("/vocabulary/review");
  const show = page.getByRole("button", { name: /Show answer/ });
  if (await show.isVisible()) {
    await show.click();
    await expect(page.getByRole("group", { name: "How well did you remember?" })).toBeVisible();
    await page.getByRole("button", { name: /^Good/ }).click();
  } else {
    await expect(page.getByText("All caught up")).toBeVisible();
  }
});

test("tap a word in a reading text and answer a question", async ({ page }) => {
  await page.goto("/reading/een-nieuwe-buurvrouw");
  await page.locator("article button", { hasText: /^verhuisd$/ }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("to move (house)")).toBeVisible();
  await page.keyboard.press("Escape");

  const first = page.locator("ol > li").first();
  await first.getByText("Ingrid draagt dozen naar binnen.").click();
  await first.getByRole("button", { name: "Check" }).click();
  await expect(first.getByRole("status")).toContainText("Correct");
});

test("grammar quiz records a score", async ({ page }) => {
  await page.goto("/grammar/de-or-het");
  const quiz = page.locator("section", { has: page.getByRole("heading", { name: "Quiz" }) });
  await quiz.getByRole("button", { name: "Finish & save score" }).click();
  await expect(quiz.getByText(/Score: \d+ \/ \d+/)).toBeVisible();
});

test("speaking tutor corrects a perfect-tense error", async ({ page }) => {
  await page.goto("/speaking");
  await page.getByText("At the supermarket").click();
  await page.getByRole("button", { name: "Start conversation" }).click();
  await expect(page).toHaveURL(/\/speaking\/.+/);
  await page.getByLabel("Your message in Dutch").fill("Ik ben gisteren naar de markt gaan.");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText("Ik ben gisteren naar de markt gegaan.")).toBeVisible();
});

test("mobile bottom navigation @mobile", async ({ page }) => {
  await page.goto("/dashboard");
  const nav = page.getByRole("navigation", { name: "Main" }).last();
  await nav.getByRole("link", { name: "Words" }).click();
  await expect(page).toHaveURL(/\/vocabulary/);
});
