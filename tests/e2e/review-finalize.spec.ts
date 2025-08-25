import { test, expect } from '@playwright/test';

// Feature: Stage 4 - Review & Finalize
// As a user, I want to finalize my order and see it appear on the homepage Orders list.

test.describe('Feature: Review & Finalize', () => {
  test('Scenario: Complete end-to-end flow and order appears on home', async ({ page }) => {
    // Step 1
    await page.goto('/');
    await page.getByRole('button', { name: /Start Building Your Order/i }).click();
    await expect(page).toHaveURL(/.*step-1/);

    await page.getByTestId('firstName').fill('Rita');
    await page.getByTestId('lastName').fill('Booker');
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
    // Choose first enabled day
    const enabledDay = page.locator('button[aria-disabled="false"]');
    await enabledDay.first().click();

    await page.getByRole('button', { name: /Select duration/i }).click();
    await page.getByRole('option', { name: /12 months/i }).click();

    await page.getByTestId('wizardNext').click();
    await expect(page).toHaveURL(/.*step-4/);

    // Step 4 - finalize
    await page.getByTestId('wizardSubmit').click();

    // Expect success dialog to open
    await expect(page.getByText(/Order Finalized!/i)).toBeVisible();

    // Close -> navigates home
    await page.getByRole('button', { name: /^Close$/ }).click();
    await expect(page).toHaveURL('/');

    // Orders list should show at least one order
    // Allow a brief moment for OrdersList to read from localStorage
    await expect(page.getByText(/Recent Orders/i)).toBeVisible();

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
