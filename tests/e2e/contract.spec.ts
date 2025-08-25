import { test, expect } from '@playwright/test';

// Feature: Stage 3 - Contract Terms
// As a user, I want to set a valid start date and duration so that I can proceed to review.

test.describe('Feature: Contract Terms', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate through Step 1 and Step 2 quickly with valid data
    await page.goto('/');
    await page.getByRole('button', { name: /Start Building Your Order/i }).click();
    await expect(page).toHaveURL(/.*step-1/);

    await page.getByTestId('firstName').fill('Cara');
    await page.getByTestId('lastName').fill('Jones');
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

    // Try selecting day 15 of the displayed month (should be enabled in future months)
    // If today is after 15th and current month days before now are disabled, this still works because we have not constrained month.
    // To be robust, if clicking '15' fails, click on any enabled day button.
    const anyDayButton = page.locator('button:has-text("15")');
    if (await anyDayButton.count()) {
      // If '15' exists and is enabled, click it
      try {
        await anyDayButton.first().click({ trial: true });
        await anyDayButton.first().click();
      } catch {
        // If it was disabled, move to next month and pick day 15
        const nextMonth = page.getByRole('button', { name: /next month/i });
        if (await nextMonth.count()) {
          await nextMonth.click();
        }
        await page.locator('button:has-text("15")').first().click();
      }
    } else {
      // Fallback: click the first enabled day button
      const enabledDay = page.locator('button[aria-disabled="false"]');
      await enabledDay.first().click();
    }

    // Choose duration = 12 months from the select
    await page.getByRole('button', { name: /Select duration/i }).click();
    await page.getByRole('option', { name: /12 months/i }).click();

    // Now Next should be enabled
    await expect(page.getByTestId('wizardNext')).toBeEnabled();

    // Continue to review (step-4)
    await page.getByTestId('wizardNext').click();
    await expect(page).toHaveURL(/.*step-4/);
  });
});
