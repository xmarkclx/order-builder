import { test, expect, Page } from '@playwright/test';

// Goal: Ensure UI never displays floating point rounding artifacts like 0.899999...
// This test edits the base plan to $0.30 and adds an add-on totaling $0.60,
// then asserts the UI shows $0.90 (not $0.8999) with correct two-decimal formatting.

test.describe('Rounding precision in UI rendering', () => {
  async function goToStep2(page: Page) {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole('button', { name: /Start Building Your Order/i }).click();
    await expect(page).toHaveURL(/.*step-1/);
    await page.getByTestId('name').fill('Decimal Rounding');
    await page.getByTestId('wizardNext').click();
    await expect(page).toHaveURL(/.*step-2/);
  }

  async function completeStep3(page: Page) {
    await expect(page).toHaveURL(/.*step-3/);
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
  }

  test('0.30 + 0.60 renders exactly as $0.90 in totals and line items', async ({ page }) => {
    // Step 1/2: Select product & plan, then edit plan price to $0.30
    await goToStep2(page);
    await page.getByText('API Gateway Pro', { exact: true }).click();
    await page.getByText('Starter Plan', { exact: true }).click();

    await page.getByTestId('editPrice-gateway-starter').click();
    const dialog = page.getByTestId('editPriceDialog');
    await expect(dialog).toBeVisible();
    const input = page.getByTestId('editPriceInput');
    await input.fill('0.30');
    await page.getByTestId('savePrice').click();
    await expect(dialog).toBeHidden();

    // Proceed through Step 3 (date + 12 months)
    await page.getByTestId('wizardNext').click();
    await completeStep3(page);

    // Step 4: Include the add-on "Extra Storage" priced at $0.10 per GB and set quantity to 6 => $0.60
    // Anchor add-on row via its role (each row is role=button) and accessible name
    const storageRow = page.getByRole('button', { name: /Extra Storage/ });
    await expect(storageRow).toBeVisible();
    // Toggle include via the Radix checkbox (stable data-slot attr)
    await storageRow.locator('[data-slot="checkbox"]').first().click();
    // Set quantity to 6 in place (wait until enabled)
    const qtyInput = storageRow.getByRole('spinbutton');
    await expect(qtyInput).toBeEnabled();
    await qtyInput.fill('6');

    // Order Summary assertions
    const orderSummary = page.getByText('Order Summary').locator('..').locator('..');

    // Base should be exactly $0.30
    await expect(orderSummary.getByTestId('basePlanAmount')).toHaveText('$0.30');

    // Add-on line should read "Extra Storage (6 × $0.10):" and amount exactly "$0.60"
    const addOnLine = orderSummary.locator('div.flex.justify-between.text-sm.text-gray-600', { hasText: 'Extra Storage (6 × $0.10):' });
    await expect(addOnLine).toHaveCount(1);
    const addOnAmount = addOnLine.locator('span').last();
    await expect(addOnAmount).toHaveText('$0.60');

    // Total Monthly must be exactly $0.90 (not $0.8999)
    await expect(orderSummary.getByTestId('totalMonthly')).toHaveText('$0.90');

    // Contract total for 12 months must be exactly $10.80
    await expect(orderSummary.getByTestId('contractTotal')).toHaveText('$10.80');
  });
});
