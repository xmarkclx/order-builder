import { test, expect } from '@playwright/test';

// Feature: Stage 2 - Product & Plan Selection
// As a user, I want to select a product and plan and optionally adjust the price,
// so that I can proceed to the contract terms step.

test.describe('Feature: Product & Plan Selection', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Step 1 and complete minimal required fields
    await page.goto('/');
    await page.getByRole('button', { name: /Start Building Your Order/i }).click();
    await expect(page).toHaveURL(/.*step-1/);

    await page.getByTestId('name').fill('Eve Adams');
    await page.getByTestId('wizardNext').click();
    await expect(page).toHaveURL(/.*step-2/);
  });

  test('Scenario: Require product and plan selection before continuing', async ({ page }) => {
    // Next should be disabled until selections are made
    await expect(page.getByTestId('wizardNext')).toBeDisabled();

    // Select a product by visible label (from sampleProducts)
    // Click the card label for the first product by name 'Analytics Suite' or fallback by selecting first radio label
    // Use a robust generic approach: click first product card label
    // Select a sample product by its visible name (label wraps the card)
    await page.getByText('API Gateway Pro', { exact: true }).click();

    // After selecting product, Next is still disabled until a plan is selected
    await expect(page.getByTestId('wizardNext')).toBeDisabled();

    // Select a plan by its visible name
    await page.getByText('Starter Plan', { exact: true }).click();

    // Now Next should be enabled (as long as custom price is >= 0)
    await expect(page.getByTestId('wizardNext')).toBeEnabled();
  });

  test('Scenario: Negative custom price is invalid and blocks continuing', async ({ page }) => {
    // Select product & plan by visible names
    await page.getByText('API Gateway Pro', { exact: true }).click();
    await page.getByText('Starter Plan', { exact: true }).click();

    // Enable price editing
    await page.getByRole('button', { name: /Edit price/i }).click();

    // Set custom price to a negative value
    const customPrice = page.locator('textarea#customPrice');
    await customPrice.fill('');
    await customPrice.type('-1');

    // Next should be disabled
    await expect(page.getByTestId('wizardNext')).toBeDisabled();

    // Change to valid non-negative price and continue to step-3
    await customPrice.fill('199');
    await expect(page.getByTestId('wizardNext')).toBeEnabled();
    await page.getByTestId('wizardNext').click();
    await expect(page).toHaveURL(/.*step-3/);
  });
});
