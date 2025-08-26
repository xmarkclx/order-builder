import { test, expect } from '@playwright/test';

// This test validates that totals are calculated accurately across different
// products, plans, and add-on combinations by comparing the displayed
// Order Summary values. It avoids relying on internal modules by summing
// the UI-rendered amounts.

const PRODUCTS = [
  'API Gateway Pro',
  'Analytics Suite',
  'Data Processing Engine',
] as const;

// Helper to parse currency like "$1,234.56" -> 1234.56
function parseCurrencyToNumber(text: string): number {
  const cleaned = text.replace(/[^0-9.-]+/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

async function goToStep2(page) {
  await page.goto('/');
  // Ensure a clean store state for repeatable scenarios
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole('button', { name: /Start Building Your Order/i }).click();
  await expect(page).toHaveURL(/.*step-1/);

  await page.getByTestId('name').fill('Total Checker');
  await page.getByTestId('wizardNext').click();
  await expect(page).toHaveURL(/.*step-2/);
}

async function selectPlanAndProceed(page, productName: string, planName: string) {
  // Select product & plan on Step 2
  await page.getByText(productName, { exact: true }).click();
  await page.getByText(planName, { exact: true }).click();
  await expect(page.getByTestId('wizardNext')).toBeEnabled();
  await page.getByTestId('wizardNext').click();
  await expect(page).toHaveURL(/.*step-3/);

  // Step 3: pick a date and choose duration 12 months
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

async function readOrderSummary(page) {
  const baseTxt = await page.getByTestId('basePlanAmount').innerText();
  const totalMonthlyTxt = await page.getByTestId('totalMonthly').innerText();
  const contractTotalTxt = await page.getByTestId('contractTotal').innerText();
  const base = parseCurrencyToNumber(baseTxt);
  const totalMonthly = parseCurrencyToNumber(totalMonthlyTxt);
  const contractTotal = parseCurrencyToNumber(contractTotalTxt);

  // Sum the add-on line totals within the Order Summary card; they contain a multiplication sign (×)
  const orderSummaryCard = page.getByText('Order Summary').locator('..').locator('..');
  const addOnRows = orderSummaryCard.locator('div.flex.justify-between.text-sm.text-gray-600', { hasText: '×' });
  const addOnCount = await addOnRows.count();
  let addOnsSum = 0;
  for (let i = 0; i < addOnCount; i++) {
    const amountTxt = await addOnRows.nth(i).locator('span').last().innerText();
    addOnsSum += parseCurrencyToNumber(amountTxt);
  }
  return { base, addOnsSum, totalMonthly, contractTotal };
}

async function includeAllAvailableAddOns(page) {
  // Click all checkboxes in unified Add-ons card to include them
  const addonsCard = page.getByText('Add-ons').locator('..').locator('..').last();
  if (await addonsCard.count()) {
    const rows = addonsCard.locator('div.flex.items-center.justify-between');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const checkbox = row.getByRole('checkbox');
      const ariaChecked = await checkbox.getAttribute('aria-checked');
      if (ariaChecked !== 'true') {
        await checkbox.click();
      }
    }
  }
}

async function setQuantitiesForIncludedAddOns(page) {
  // For each included add-on row in the unified Add-ons card, set a unique quantity (1-based index)
  const addonsTitle = page.getByText('Add-ons');
  if (!(await addonsTitle.count())) return;
  const addonsCard = addonsTitle.locator('..').locator('..').last();
  const rows = addonsCard.locator('div.flex.items-center.justify-between');
  const count = await rows.count();
  let idx = 0;
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const checkbox = row.getByRole('checkbox');
    const ariaChecked = await checkbox.getAttribute('aria-checked');
    if (ariaChecked === 'true') {
      const qtyInput = row.getByRole('spinbutton');
      const qty = idx + 1; // 1,2,3,... for included items only
      await qtyInput.fill('');
      await qtyInput.type(String(qty));
      idx++;
    }
  }
}

test.describe('Feature: Accurate Totals across products, plans, add-ons', () => {
  test('Validate calculations across products/plans and add-on combinations', async ({ page }) => {
    for (const product of PRODUCTS) {
      // Go to step-2 and collect plan names for this product
      await goToStep2(page);
      await page.getByText(product, { exact: true }).click();

      // Collect visible plan names: read plan titles rendered in plan cards
      const planNames = await page.locator('div.font-medium.text-gray-900').allInnerTexts();
      const filteredPlanNames = planNames.filter(n => n && !['Product & Plan','Contract Details','Customer Information','Add-ons','Order Summary'].includes(n));

      // Use a Set to avoid duplicates if other headings present
      const uniquePlanNames = Array.from(new Set(filteredPlanNames));

      for (const plan of uniquePlanNames) {
        // Start fresh for each plan
        await goToStep2(page);
        await selectPlanAndProceed(page, product, plan);

        // Scenario A: No add-ons => Total Monthly == Base Plan
        let { base, addOnsSum, totalMonthly, contractTotal } = await readOrderSummary(page);
        expect(addOnsSum).toBeCloseTo(0, 2);
        expect(totalMonthly).toBeCloseTo(base, 2);
        // duration is 12 months (selected), so contract total should be base * 12
        {
          const monthlyRounded = parseFloat(totalMonthly.toFixed(2));
          const expectedContract = parseFloat((monthlyRounded * 12).toFixed(2));
          expect(contractTotal).toBeCloseTo(expectedContract, 2);
        }

        // Scenario B: Include all available add-ons, set quantities 1..N
        await includeAllAvailableAddOns(page);
        await setQuantitiesForIncludedAddOns(page);
        // allow UI to recalculate totals
        await page.waitForTimeout(50);
        ({ base, addOnsSum, totalMonthly, contractTotal } = await readOrderSummary(page));
        expect(totalMonthly).toBeCloseTo(base + addOnsSum, 2);
        {
          const expectedContract = parseFloat((totalMonthly * 12).toFixed(2));
          expect(contractTotal).toBeCloseTo(expectedContract, 2);
        }
      }
    }
  });
});
