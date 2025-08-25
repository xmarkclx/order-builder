import { test, expect } from '@playwright/test';

// Feature: All Steps - Validations across the wizard
// This spec walks through each step and verifies that the key validations
// are enforced before proceeding, using robust selectors consistent with
// the app's UI components.

test.describe('Feature: All Steps - Validations', () => {
  test('Scenario: Validations block progress until satisfied on each step', async ({ page }) => {
    // Home -> Step 1
    await page.goto('/');
    await page.getByRole('button', { name: /Start Building Your Order/i }).click();
    await expect(page).toHaveURL(/.*step-1/);

    // STEP 1: Customer Information
    // When clicking Next with empty name -> error and stay on step-1
    await page.getByTestId('wizardNext').click();
    await expect(page.getByText(/Name is required/i)).toBeVisible();
    await expect(page).toHaveURL(/.*step-1/);

    // Fill name and continue
    await page.getByTestId('name').fill('Validation Runner');
    await page.getByTestId('wizardNext').click();
    await expect(page).toHaveURL(/.*step-2/);

    // STEP 2: Product & Plan
    // Next disabled until both product and plan are selected
    await expect(page.getByTestId('wizardNext')).toBeDisabled();

    // Select a known product and plan
    await page.getByText('API Gateway Pro', { exact: true }).click();
    await expect(page.getByTestId('wizardNext')).toBeDisabled();

    await page.getByText('Starter Plan', { exact: true }).click();
    await expect(page.getByTestId('wizardNext')).toBeEnabled();

    // Negative custom price should disable Next
    const customPrice = page.locator('input#customPrice');
    if (await customPrice.count()) {
      await customPrice.fill('');
      await customPrice.type('-1');
      await expect(page.getByTestId('wizardNext')).toBeDisabled();

      // Fix price
      await customPrice.fill('199');
      await expect(page.getByTestId('wizardNext')).toBeEnabled();
    }

    // Continue to Step 3
    await page.getByTestId('wizardNext').click();
    await expect(page).toHaveURL(/.*step-3/);

    // STEP 3: Contract Terms
    // Next is disabled until date and duration are chosen
    await expect(page.getByTestId('wizardNext')).toBeDisabled();

    // Open date picker and pick first enabled day
    await page.getByRole('button', { name: /Pick a date/i }).click();
    const calendar = page.locator('[data-slot="calendar"]');
    await expect(calendar).toBeVisible();
    await calendar.locator('button[data-day]:not([disabled])').first().click();
    // Close popover to avoid overlay blocking select
    await page.keyboard.press('Escape');
    await expect(calendar).toBeHidden();

    // Select duration 12 months
    await page.locator('[data-slot="select-trigger"]').first().click();
    await page.getByRole('option', { name: /12 months/i }).click();

    // Next should be enabled now
    await expect(page.getByTestId('wizardNext')).toBeEnabled();

    // Continue to Step 4
    await page.getByTestId('wizardNext').click();
    await expect(page).toHaveURL(/.*step-4/);

    // STEP 4: Review & Finalize
    // No additional required fields; ensure Submit exists
    await expect(page.getByTestId('wizardSubmit')).toBeVisible();
  });
});
