import { test, expect } from '@playwright/test';

test.describe('Prescription Cache Fix - Issue #6', () => {
  // Test the prescription pause/unpause cache invalidation bug fix
  test.describe('Prescription Schedule Cache Invalidation', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to the app
      await page.goto('/');
      
      // Wait for the app to load
      await page.waitForLoadState('networkidle');
      
      // Add a family member first
      await page.locator('nav').getByRole('link', { name: 'Family' }).first().click();
      await page.getByRole('link', { name: 'Add Member' }).click();
      
      await page.getByLabel('Name').fill('Test Person');
      await page.getByLabel('Type').selectOption('human');
      await page.getByLabel('Date of Birth').fill('1990-01-01');
      await page.getByLabel('Gender').selectOption('male');
      await page.getByRole('button', { name: 'Add Family Member' }).click();
      
      // Add a medication
      await page.locator('nav').getByRole('link', { name: 'Medications' }).first().click();
      await page.getByRole('link', { name: 'Add Medication' }).click();
      
      await page.getByLabel('Name').fill('Test Medication');
      await page.getByLabel('Dosage').fill('100mg');
      await page.getByLabel('Frequency').fill('Daily');
      await page.getByLabel('Instructions').fill('Take with food');
      await page.getByRole('button', { name: 'Add Medication' }).click();
      
      // Add a prescription
      await page.getByRole('link', { name: 'Prescriptions' }).click();
      await page.getByRole('link', { name: 'Add Prescription' }).click();
      
      await page.getByLabel('Family Member').selectOption({ label: 'Test Person' });
      await page.getByLabel('Medication').selectOption({ label: 'Test Medication' });
      await page.getByLabel('Start Date').fill('2024-01-01');
      await page.getByRole('button', { name: 'Add Prescription' }).click();
      
      // Verify prescription was created
      await expect(page.getByText('Test Person')).toBeVisible();
      await expect(page.getByText('Test Medication')).toBeVisible();
    });

    test('should show active prescription in schedule initially', async ({ page }) => {
      // Navigate to schedule page
      await page.locator('nav').getByRole('link', { name: 'Schedule' }).first().click();
      
      // Verify active prescription appears in schedule
      await expect(page.getByText('Test Person')).toBeVisible();
      await expect(page.getByText('Test Medication')).toBeVisible();
    });

    test('should immediately remove prescription from schedule when deactivated', async ({ page }) => {
      // Go to prescriptions page
      await page.getByRole('link', { name: 'Prescriptions' }).click();
      
      // Verify prescription is in active section
      await expect(page.getByText('Active Prescriptions')).toBeVisible();
      await expect(page.getByText('Test Person')).toBeVisible();
      await expect(page.getByText('Test Medication')).toBeVisible();
      
      // Go to schedule and verify prescription is there
      await page.locator('nav').getByRole('link', { name: 'Schedule' }).first().click();
      await expect(page.getByText('Test Person')).toBeVisible();
      await expect(page.getByText('Test Medication')).toBeVisible();
      
      // Go back to prescriptions
      await page.getByRole('link', { name: 'Prescriptions' }).click();
      
      // Deactivate the prescription (click the pause/deactivate button)
      await page.getByRole('button', { name: 'Deactivate' }).first().click();
      
      // Verify prescription moved to inactive section
      await expect(page.getByText('Inactive Prescriptions')).toBeVisible();
      
      // Navigate to schedule page immediately (no refresh needed)
      await page.locator('nav').getByRole('link', { name: 'Schedule' }).first().click();
      
      // Verify prescription is NO LONGER in schedule (this is the bug fix)
      await expect(page.getByText('No medications scheduled for this date')).toBeVisible();
      await expect(page.getByText('Test Person')).not.toBeVisible();
      await expect(page.getByText('Test Medication')).not.toBeVisible();
    });

    test('should immediately show prescription in schedule when reactivated', async ({ page }) => {
      // Go to prescriptions page and deactivate first
      await page.getByRole('link', { name: 'Prescriptions' }).click();
      await page.getByRole('button', { name: 'Deactivate' }).first().click();
      
      // Verify it's in inactive section
      await expect(page.getByText('Inactive Prescriptions')).toBeVisible();
      
      // Verify schedule is empty
      await page.locator('nav').getByRole('link', { name: 'Schedule' }).first().click();
      await expect(page.getByText('No medications scheduled for this date')).toBeVisible();
      
      // Go back to prescriptions
      await page.getByRole('link', { name: 'Prescriptions' }).click();
      
      // Reactivate the prescription (click the play/reactivate button)
      await page.getByRole('button', { name: 'Reactivate' }).first().click();
      
      // Verify prescription is back in active section
      await expect(page.getByText('Active Prescriptions')).toBeVisible();
      
      // Navigate to schedule page immediately (no refresh needed)
      await page.locator('nav').getByRole('link', { name: 'Schedule' }).first().click();
      
      // Verify prescription is BACK in schedule (this is the bug fix)
      await expect(page.getByText('Test Person')).toBeVisible();
      await expect(page.getByText('Test Medication')).toBeVisible();
      await expect(page.getByText('No medications scheduled for this date')).not.toBeVisible();
    });

    test('should handle multiple pause/unpause cycles correctly', async ({ page }) => {
      // Test multiple cycles to ensure consistency
      for (let i = 0; i < 3; i++) {
        // Deactivate
        await page.getByRole('link', { name: 'Prescriptions' }).click();
        await page.getByRole('button', { name: 'Deactivate' }).first().click();
        
        // Check schedule is empty
        await page.locator('nav').getByRole('link', { name: 'Schedule' }).first().click();
        await expect(page.getByText('No medications scheduled for this date')).toBeVisible();
        
        // Reactivate
        await page.getByRole('link', { name: 'Prescriptions' }).click();
        await page.getByRole('button', { name: 'Reactivate' }).first().click();
        
        // Check schedule has prescription
        await page.locator('nav').getByRole('link', { name: 'Schedule' }).first().click();
        await expect(page.getByText('Test Person')).toBeVisible();
        await expect(page.getByText('Test Medication')).toBeVisible();
      }
    });

    test('should maintain consistency across page refreshes', async ({ page }) => {
      // Deactivate prescription
      await page.getByRole('link', { name: 'Prescriptions' }).click();
      await page.getByRole('button', { name: 'Deactivate' }).first().click();
      
      // Navigate to schedule
      await page.locator('nav').getByRole('link', { name: 'Schedule' }).first().click();
      await expect(page.getByText('No medications scheduled for this date')).toBeVisible();
      
      // Refresh the page
      await page.reload();
      
      // Schedule should still be empty
      await expect(page.getByText('No medications scheduled for this date')).toBeVisible();
      
      // Reactivate prescription
      await page.getByRole('link', { name: 'Prescriptions' }).click();
      await page.getByRole('button', { name: 'Reactivate' }).first().click();
      
      // Navigate to schedule
      await page.locator('nav').getByRole('link', { name: 'Schedule' }).first().click();
      await expect(page.getByText('Test Person')).toBeVisible();
      
      // Refresh the page
      await page.reload();
      
      // Schedule should still show prescription
      await expect(page.getByText('Test Person')).toBeVisible();
      await expect(page.getByText('Test Medication')).toBeVisible();
    });

    test('should show proper counts in prescription summary', async ({ page }) => {
      // Initially should show 1 active, 0 inactive
      await page.getByRole('link', { name: 'Prescriptions' }).click();
      await expect(page.getByText('Active Prescriptions (1)')).toBeVisible();
      await expect(page.getByText('Total Prescriptions')).toBeVisible();
      await expect(page.getByText('1')).toBeVisible(); // Total count
      
      // After deactivation should show 0 active, 1 inactive
      await page.getByRole('button', { name: 'Deactivate' }).first().click();
      await expect(page.getByText('Active Prescriptions (0)')).toBeVisible();
      await expect(page.getByText('Inactive Prescriptions (1)')).toBeVisible();
      
      // After reactivation should show 1 active, 0 inactive
      await page.getByRole('button', { name: 'Reactivate' }).first().click();
      await expect(page.getByText('Active Prescriptions (1)')).toBeVisible();
      await expect(page.getByText('Inactive Prescriptions')).not.toBeVisible();
    });
  });

  test.describe('Regression Tests', () => {
    test('should not break existing prescription functionality', async ({ page }) => {
      // Navigate to prescriptions
      await page.getByRole('link', { name: 'Prescriptions' }).click();
      
      // Should be able to add new prescriptions
      await page.getByRole('link', { name: 'Add Prescription' }).click();
      await expect(page).toHaveURL(/\/prescriptions\/new/);
      
      // Should be able to view existing prescriptions
      await page.getByRole('link', { name: 'Prescriptions' }).click();
      await expect(page.getByText('Manage prescriptions for family members')).toBeVisible();
      
      // Should be able to navigate to schedule
      await page.locator('nav').getByRole('link', { name: 'Schedule' }).first().click();
      await expect(page.getByText('Medication Schedule')).toBeVisible();
    });

    test('should handle no prescriptions gracefully', async ({ page }) => {
      // Navigate to empty prescriptions page
      await page.getByRole('link', { name: 'Prescriptions' }).click();
      await expect(page.getByText('No active prescriptions yet')).toBeVisible();
      
      // Navigate to empty schedule
      await page.locator('nav').getByRole('link', { name: 'Schedule' }).first().click();
      await expect(page.getByText('No medications scheduled for this date')).toBeVisible();
    });
  });

  test.describe('Performance Tests', () => {
    test('should handle rapid pause/unpause operations', async ({ page }) => {
      // Setup prescription first
      await page.goto('/');
      await page.locator('nav').getByRole('link', { name: 'Family' }).first().click();
      await page.getByRole('link', { name: 'Add Member' }).click();
      
      await page.getByLabel('Name').fill('Performance Test');
      await page.getByLabel('Type').selectOption('human');
      await page.getByLabel('Date of Birth').fill('1990-01-01');
      await page.getByLabel('Gender').selectOption('male');
      await page.getByRole('button', { name: 'Add Family Member' }).click();
      
      await page.locator('nav').getByRole('link', { name: 'Medications' }).first().click();
      await page.getByRole('link', { name: 'Add Medication' }).click();
      
      await page.getByLabel('Name').fill('Performance Med');
      await page.getByLabel('Dosage').fill('50mg');
      await page.getByLabel('Frequency').fill('Daily');
      await page.getByRole('button', { name: 'Add Medication' }).click();
      
      await page.getByRole('link', { name: 'Prescriptions' }).click();
      await page.getByRole('link', { name: 'Add Prescription' }).click();
      
      await page.getByLabel('Family Member').selectOption({ label: 'Performance Test' });
      await page.getByLabel('Medication').selectOption({ label: 'Performance Med' });
      await page.getByLabel('Start Date').fill('2024-01-01');
      await page.getByRole('button', { name: 'Add Prescription' }).click();
      
      // Perform rapid operations
      for (let i = 0; i < 5; i++) {
        await page.getByRole('button', { name: 'Deactivate' }).first().click();
        await page.getByRole('button', { name: 'Reactivate' }).first().click();
      }
      
      // Verify final state is consistent
      await expect(page.getByText('Active Prescriptions (1)')).toBeVisible();
      
      // Check schedule reflects final state
      await page.locator('nav').getByRole('link', { name: 'Schedule' }).first().click();
      await expect(page.getByText('Performance Test')).toBeVisible();
      await expect(page.getByText('Performance Med')).toBeVisible();
    });
  });
});