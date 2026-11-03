import { expect, test } from "@playwright/test";

// Needs network access (YouTube captions). Adds items to the local learner's library.
test("add a YouTube link: transcript, summary and quiz appear", async ({ page }) => {
  await page.goto("/listening/mine");
  await page.getByLabel("What is it?").selectOption("VIDEO");
  await page.getByLabel("Link").fill("https://www.youtube.com/watch?v=NC45Tott-NY");
  await page.getByRole("button", { name: "Add to my library" }).click();
  await expect(page).toHaveURL(/\/listening\/(?!mine)[\w-]+/, { timeout: 60_000 });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("ongezond eten");
  await expect(page.getByRole("heading", { name: "Summary" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Questions" })).toBeVisible();
  await page.getByRole("button", { name: "Show transcript" }).click();
  await expect(page.getByRole("list", { name: "Transcript" })).toContainText("middelbare school");
  // Re-adding the same link opens the existing item instead of duplicating it.
  const url = page.url();
  await page.goto("/listening/mine");
  await page.getByLabel("Link").fill("https://www.youtube.com/watch?v=NC45Tott-NY");
  await page.getByRole("button", { name: "Add to my library" }).click();
  await expect(page).toHaveURL(url);
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page).toHaveURL(/\/listening\/mine$/);
});

test("a link we can't read asks for a pasted transcript", async ({ page }) => {
  await page.goto("/listening/mine");
  await page.getByLabel("What is it?").selectOption("FILM_TV");
  await page.getByLabel("Link").fill("https://www.netflix.com/title/80057281");
  await page.getByLabel("Title (optional)").fill("Test serie aflevering 1");
  await page.getByRole("button", { name: "Add to my library" }).click();
  await expect(page.getByRole("heading", { name: "Add a transcript" })).toBeVisible({ timeout: 30_000 });
  await page.getByLabel("Transcript or subtitles").fill("Goedemorgen allemaal.\nVandaag gaan we naar de markt om verse groenten te kopen.\nDaarna drinken we koffie bij mijn zus thuis.\nZe woont in een groot huis aan de gracht.");
  await page.getByRole("button", { name: "Create summary & quiz" }).click();
  await expect(page.getByRole("heading", { name: "Summary" })).toBeVisible({ timeout: 30_000 });
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page).toHaveURL(/\/listening\/mine$/);
});
