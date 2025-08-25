import { test, expect } from '@playwright/test';

// Feature: Stage 3 - Contract Terms
// As a user, I want to set a valid start date and duration so that I can proceed to review.

test.describe('Feature: Contract Terms', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate through Step 1 and Step 2 quickly with valid data
    await page.goto('/');
    await page.getByRole('button', { name: /Start Building Your Order/i }).click();
    await expect(page).toHaveURL(/.*step-1/);

    await page.getByTestId('name').fill('Cara Jones');
    await page.getByTestId('wizardNext').click();
    await expect(page).toHaveURL(/.*step-2/);

    // Select a known product and plan by visible names
    await page.getByText('API Gateway Pro', { exact: true }).click();
    await page.getByText('Starter Plan', { exact: true }).click();

    await page.getByTestId('wizardNext').click();
    await expect(page).toHaveURL(/.*step-3/);
  });

  test('Scenario: Require start date and valid duration; then proceed to review', async ({ page }) => {
    // Initially Next should be disabled
    await expect(page.getByTestId('wizardNext')).toBeDisabled();

    // Open the date picker and select a near-future date
    // Click the Start Date button (shows 'Pick a date' when empty)
    await page.getByRole('button', { name: /Pick a date/i }).click();

    // Select the first enabled day within the calendar popover
    const calendar = page.locator('[data-slot="calendar"]');
    await expect(calendar).toBeVisible();
    await calendar.locator('button[data-day]:not([disabled])').first().click();
    // Close the calendar popover to avoid overlay blocking next interactions
    await page.keyboard.press('Escape');
    await expect(calendar).toBeHidden();

    // Choose duration = 12 months from the select
    await page.locator('[data-slot="select-trigger"]').first().click();
    await page.getByRole('option', { name: /12 months/i }).click();

    // Now Next should be enabled
    await expect(page.getByTestId('wizardNext')).toBeEnabled();

    // Continue to review (step-4)
    await page.getByTestId('wizardNext').click();
    await expect(page).toHaveURL(/.*step-4/);
  });
});
