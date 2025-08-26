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

    // Open per-plan edit dialog for the selected plan
    await page.getByTestId('editPrice-gateway-starter').click();
    const dialog = page.getByTestId('editPriceDialog');
    await expect(dialog).toBeVisible();

    // Set custom price to a negative value and save
    const input = page.getByTestId('editPriceInput');
    await input.fill('-1');
    await page.getByTestId('savePrice').click();

    // Next should be disabled
    await expect(page.getByTestId('wizardNext')).toBeDisabled();

    // Dialog remains open after invalid save; reuse it to enter a valid price
    await expect(dialog).toBeVisible();
    await input.fill('199');
    await page.getByTestId('savePrice').click();

    // Now Next should be enabled and we can proceed to step-3
    await expect(page.getByTestId('wizardNext')).toBeEnabled();
    await page.getByTestId('wizardNext').click();
    await expect(page).toHaveURL(/.*step-3/);
  });
});
