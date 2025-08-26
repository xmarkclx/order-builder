import { test, expect } from '@playwright/test';

// Feature: Stage 4 - Review & Finalize
// As a user, I want to finalize my order and see it appear on the homepage Orders list.

test.describe('Feature: Review & Finalize', () => {
  test('Scenario: Complete end-to-end flow and order appears on Recent Orders page', async ({ page }) => {
    // Step 1
    await page.goto('/');
    await page.getByRole('button', { name: /Start Building Your Order/i }).click();
    await expect(page).toHaveURL(/.*step-1/);

    await page.getByTestId('name').fill('Rita Booker');
    await page.getByTestId('wizardNext').click();
    await expect(page).toHaveURL(/.*step-2/);

    // Step 2 - pick product & plan
    // Select a known product and plan by visible names
    await page.getByText('API Gateway Pro', { exact: true }).click();
    await page.getByText('Starter Plan', { exact: true }).click();
    await page.getByTestId('wizardNext').click();
    await expect(page).toHaveURL(/.*step-3/);

    // Step 3 - pick date and duration
    await page.getByRole('button', { name: /Pick a date/i }).click();
    // Select the first enabled day within the calendar popover
    const calendar = page.locator('[data-slot="calendar"]');
    await expect(calendar).toBeVisible();
    await calendar.locator('button[data-day]:not([disabled])').first().click();
    // Close the calendar popover to avoid overlay blocking next interactions
    await page.keyboard.press('Escape');
    await expect(calendar).toBeHidden();

    await page.locator('[data-slot="select-trigger"]').first().click();
    await page.getByRole('option', { name: /12 months/i }).click();

    await page.getByTestId('wizardNext').click();
    await expect(page).toHaveURL(/.*step-4/);

    // Step 4 - finalize
    await page.getByTestId('wizardSubmit').click();

    // App should navigate directly to Recent Orders page
    await expect(page).toHaveURL(/.*\/recent-orders$/);

    // Orders list should show at least one order
    await expect(page.getByRole('main').getByText(/Recent Orders/i)).toBeVisible();

    // Either 'Order #' blocks appear or at least not 'No orders yet.'
    const noOrders = page.getByText(/No orders yet\./i);
    if (await noOrders.count()) {
      // Wait up to 2s for list to refresh
      await expect(noOrders).not.toBeVisible({ timeout: 2000 });
    }

    const orderRow = page.getByText(/Order #/i).first();
    await expect(orderRow).toBeVisible();
  });
});
