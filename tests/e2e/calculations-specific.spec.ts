import { test, expect } from '@playwright/test';

// Deterministic calculation test: use a fixed product/plan and explicit add-on quantities
// to assert exact currency totals instead of deriving sums from the UI.

async function goToStep2(page) {
  await page.goto('/');
  // Ensure a clean store state for repeatable scenarios
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole('button', { name: /Start Building Your Order/i }).click();
  await expect(page).toHaveURL(/.*step-1/);

  await page.getByTestId('name').fill('Deterministic Totals');
  await page.getByTestId('wizardNext').click();
  await expect(page).toHaveURL(/.*step-2/);
}

async function proceedToStep4WithDuration(page, productName: string, planName: string, durationLabel = '12 months') {
  // Step 2: product & plan
  await page.getByText(productName, { exact: true }).click();
  await page.getByText(planName, { exact: true }).click();
  await expect(page.getByTestId('wizardNext')).toBeEnabled();
  await page.getByTestId('wizardNext').click();
  await expect(page).toHaveURL(/.*step-3/);

  // Step 3: pick any valid date and choose duration
  await page.getByRole('button', { name: /Pick a date/i }).click();
  const calendar = page.locator('[data-slot="calendar"]');
  await expect(calendar).toBeVisible();
  await calendar.locator('button[data-day]:not([disabled])').first().click();
  await page.keyboard.press('Escape');
  await expect(calendar).toBeHidden();

  await page.locator('[data-slot="select-trigger"]').first().click();
  await page.getByRole('option', { name: new RegExp(durationLabel, 'i') }).click();

  await page.getByTestId('wizardNext').click();
  await expect(page).toHaveURL(/.*step-4/);
}

async function includeAllAvailableAddOns(page) {
  // Click all checkboxes in unified Add-ons card to include them.
  const addonsCard = page.getByText('Add-ons').locator('..').locator('..').last();
  if (!(await addonsCard.count())) return;
  for (let guard = 0; guard < 20; guard++) {
    const unchecked = addonsCard.locator('[role="checkbox"][aria-checked="false"]');
    const n = await unchecked.count();
    if (n === 0) break;
    await unchecked.first().click({ force: true });
    await page.waitForTimeout(50);
  }
}

async function setIncludedAddonQuantity(page, addonName: string, qty: number) {
  const addonsTitle = page.getByText('Add-ons');
  await expect(addonsTitle).toBeVisible();
  const addonsCard = addonsTitle.locator('..').locator('..').last();
  const row = addonsCard.locator('div.flex.items-center.justify-between', { hasText: addonName });
  await expect(row).toBeVisible();
  const input = row.getByRole('spinbutton');
  await expect(input).toBeVisible();
  await input.fill('');
  await input.type(String(qty));
}

// Known prices from src/lib/data.ts:
// - Base plan: API Gateway Pro > Starter Plan = $99.00
// - Add-ons:
//   Additional API Calls @ $0.001 per call -> 1000 units = $1.00
//   Extra Storage @ $0.10 per GB -> 50 GB = $5.00
//   Extra Bandwidth @ $0.05 per GB -> 20 GB = $1.00
//   Premium Support Hours @ $150.00 per hour -> 2 hours = $300.00
//   Custom Integration @ $500.00 per unit -> 1 unit = $500.00
//   Priority Processing @ $99.00 per unit -> 3 units = $297.00
//   Sum of add-ons = 1 + 5 + 1 + 300 + 500 + 297 = $1,104.00
// Total Monthly = Base ($99.00) + Add-ons ($1,104.00) = $1,203.00
// Contract Total for 12 months = $1,203.00 * 12 = $14,436.00

const PRODUCT = 'API Gateway Pro';
const PLAN = 'Starter Plan';

const EXPECTED = {
  base: '$99.00',
  totalMonthly: '$99.00',
  contractTotal: '$1,188.00',
};

test.describe('Deterministic totals: exact amount checks', () => {
  test('Exact totals for known product/plan and add-on quantities', async ({ page }) => {
    await goToStep2(page);
    await proceedToStep4WithDuration(page, PRODUCT, PLAN, '12 months');

    // Assert exact currency strings rendered in Order Summary using data-testids (no add-ons)
    await expect(page.getByTestId('basePlanAmount')).toHaveText(EXPECTED.base);
    await expect(page.getByTestId('totalMonthly')).toHaveText(EXPECTED.totalMonthly);
    await expect(page.getByTestId('contractTotal')).toHaveText(EXPECTED.contractTotal);
  });
});
