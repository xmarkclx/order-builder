import { test, expect } from '@playwright/test';

// Feature: Stage 1 - Customer Information
// As a user, I want to be required to enter a name, and optionally enter address
// so that my order has valid customer details.

test.describe('Feature: Customer Information', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Start Building Your Order/i }).click();
    await expect(page).toHaveURL(/.*step-1/);
  });

  test('Scenario: Block advancing when name is missing', async ({ page }) => {
    // When I click Next without filling name
    await page.getByTestId('wizardNext').click();

    // Then I should see validation error for required name
    await expect(page.getByText(/Name is required/i)).toBeVisible();

    // And I remain on step-1
    await expect(page).toHaveURL(/.*step-1/);

    // When I fill name
    await page.getByTestId('name').fill('Alice Walker');

    // And click Next
    await page.getByTestId('wizardNext').click();

    // Then I arrive at step-2
    await expect(page).toHaveURL(/.*step-2/);
  });

  test('Scenario: Address becomes required when "Use company address" is checked', async ({ page }) => {
    // Fill minimal required name
    await page.getByTestId('name').fill('Bob Stone');

    // When I enable company address
    await page.getByTestId('useCompanyAddress').click();

    // And click Next without filling address
    await page.getByTestId('wizardNext').click();

    // Then I should see address field errors
    await expect(page.getByText(/Address line 1 is required/i)).toBeVisible();
    await expect(page.getByText(/City is required/i)).toBeVisible();
    await expect(page.getByText(/State is required/i)).toBeVisible();
    await expect(page.getByText(/ZIP is required/i)).toBeVisible();

    // When I fill address fields
    await page.getByLabel(/Address Line 1/i).fill('123 Main St');
    await page.getByLabel(/^City/i).fill('Springfield');
    // Open the state select and choose CA
    await page.getByText('Select state').click();
    await page.getByRole('option', { name: 'California' }).click();
    await page.getByLabel(/ZIP Code/i).fill('90210');

    // And click Next
    await page.getByTestId('wizardNext').click();

    // Then I arrive at step-2
    await expect(page).toHaveURL(/.*step-2/);
  });
});
