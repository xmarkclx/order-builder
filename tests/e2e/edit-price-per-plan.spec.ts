import { test, expect } from '@playwright/test';

// Feature: Edit price per plan with popup

test.describe('Feature: Edit price per plan', () => {
  test('Scenario: Edit selected plan price via popup and see it reflected in review', async ({ page }) => {
    // Step 1 - start
    await page.goto('/');
    await page.getByRole('button', { name: /Start Building Your Order/i }).click();
    await expect(page).toHaveURL(/.*step-1/);

    await page.getByTestId('name').fill('Alex Planner');
    await page.getByTestId('wizardNext').click();
    await expect(page).toHaveURL(/.*step-2/);

    // Step 2 - select product & plan
    await page.getByText('API Gateway Pro', { exact: true }).click();
    await page.getByText('Starter Plan', { exact: true }).click();

    // Open per-plan edit price dialog for the selected plan
    await page.getByTestId('editPrice-gateway-starter').click();
    const dialog = page.getByTestId('editPriceDialog');
    await expect(dialog).toBeVisible();

    // Change the price and save
    const input = page.getByTestId('editPriceInput');
    await input.fill('123.45');
    await page.getByTestId('savePrice').click();
    await expect(dialog).toBeHidden();

    // Verify summary reflects new price (could appear in multiple places; assert at least one visible)
    await expect(page.getByText('$123.45').first()).toBeVisible();

    // Continue to Step 3
    await page.getByTestId('wizardNext').click();
    await expect(page).toHaveURL(/.*step-3/);

    // Pick a start date and 12 months duration
    await page.getByRole('button', { name: /Pick a date/i }).click();
    const calendar = page.locator('[data-slot="calendar"]');
    await expect(calendar).toBeVisible();
    await calendar.locator('button[data-day]:not([disabled])').first().click();
    await page.keyboard.press('Escape');
    await expect(calendar).toBeHidden();

    await page.locator('[data-slot="select-trigger"]').first().click();
    await page.getByRole('option', { name: /12 months/i }).click();

    await page.getByTestId('wizardNext').click();
    await expect(page).toHaveURL(/.*step-4/);

    // Step 4 - verify base plan and totals use new price
    await expect(page.getByTestId('basePlanAmount')).toHaveText('$123.45');
    await expect(page.getByTestId('totalMonthly')).toHaveText('$123.45');
    await expect(page.getByTestId('contractTotal')).toHaveText('$1,481.40'); // 123.45 * 12
  });
});
