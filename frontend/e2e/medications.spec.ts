import { test, expect } from '@playwright/test';

test.describe('Medications - Add and Manage', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test.describe('Adding Prescription Medications', () => {
    test('should add a prescription medication with all fields', async ({ page }) => {
      // Navigate to medications page
      await page.locator('nav').getByRole('link', { name: 'Medications' }).first().click();
      await expect(page).toHaveURL('/medications');

      // Click Add Medication button
      await page.getByRole('link', { name: 'Add Medication' }).click();
      await expect(page).toHaveURL('/medications/new');

      // Fill out the form for a prescription medication
      await page.getByLabel('Name').fill('Amoxicillin');
      await page.getByLabel('Description').fill('Antibiotic for bacterial infections');
      await page.getByLabel('Dosage').fill('500mg');
      await page.getByLabel('Unit').fill('tablets');
      await page.getByLabel('Quantity').fill('30');
      await page.getByLabel('Expiry Date').fill('2025-12-31');
      await page.getByLabel('Prescription Medication').check();
      await page.getByLabel('Notes').fill('Take with food. Complete full course even if feeling better.');

      // Submit the form
      await page.getByRole('button', { name: 'Add Medication' }).click();

      // Should redirect back to medications page
      await expect(page).toHaveURL('/medications');

      // Verify the medication appears in the list
      await expect(page.getByText('Amoxicillin')).toBeVisible();
      await expect(page.getByText('500mg')).toBeVisible();
      await expect(page.getByText('30 tablets')).toBeVisible();
      await expect(page.getByText('Antibiotic for bacterial infections')).toBeVisible();
      await expect(page.getByText('Take with food')).toBeVisible();
    });

    test('should add prescription medication with minimal fields', async ({ page }) => {
      await page.goto('/medications/new');

      // Fill only required fields
      await page.getByLabel('Name').fill('Lisinopril');
      await page.getByLabel('Dosage').fill('10mg');
      await page.getByLabel('Unit').fill('tablets');
      await page.getByLabel('Quantity').fill('90');
      await page.getByLabel('Prescription Medication').check();

      await page.getByRole('button', { name: 'Add Medication' }).click();

      // Verify successful creation
      await expect(page).toHaveURL('/medications');
      await expect(page.getByText('Lisinopril')).toBeVisible();
      await expect(page.getByText('10mg')).toBeVisible();
      await expect(page.getByText('90 tablets')).toBeVisible();
    });

    test('should handle complex prescription dosages', async ({ page }) => {
      await page.goto('/medications/new');

      await page.getByLabel('Name').fill('Insulin Glargine');
      await page.getByLabel('Description').fill('Long-acting insulin');
      await page.getByLabel('Dosage').fill('100 units/mL (10 mL vial)');
      await page.getByLabel('Unit').fill('vials');
      await page.getByLabel('Quantity').fill('3');
      await page.getByLabel('Prescription Medication').check();
      await page.getByLabel('Notes').fill('Refrigerate. Rotate injection sites. Use within 28 days of opening.');

      await page.getByRole('button', { name: 'Add Medication' }).click();

      await expect(page.getByText('Insulin Glargine')).toBeVisible();
      await expect(page.getByText('100 units/mL (10 mL vial)')).toBeVisible();
      await expect(page.getByText('3 vials')).toBeVisible();
      await expect(page.getByText('Refrigerate. Rotate injection sites')).toBeVisible();
    });
  });

  test.describe('Adding Over-the-Counter Medications', () => {
    test('should add OTC medication with all fields', async ({ page }) => {
      await page.goto('/medications/new');

      await page.getByLabel('Name').fill('Ibuprofen');
      await page.getByLabel('Description').fill('Pain reliever and anti-inflammatory');
      await page.getByLabel('Dosage').fill('200mg');
      await page.getByLabel('Unit').fill('capsules');
      await page.getByLabel('Quantity').fill('50');
      await page.getByLabel('Expiry Date').fill('2026-06-15');
      // Leave Prescription Medication unchecked (default OTC)
      await page.getByLabel('Notes').fill('Do not exceed 6 capsules in 24 hours. Take with food if stomach upset occurs.');

      await page.getByRole('button', { name: 'Add Medication' }).click();

      await expect(page.getByText('Ibuprofen')).toBeVisible();
      await expect(page.getByText('Pain reliever and anti-inflammatory')).toBeVisible();
      await expect(page.getByText('200mg')).toBeVisible();
      await expect(page.getByText('50 capsules')).toBeVisible();
      await expect(page.getByText('Do not exceed 6 capsules')).toBeVisible();
    });

    test('should add vitamins and supplements', async ({ page }) => {
      await page.goto('/medications/new');

      await page.getByLabel('Name').fill('Vitamin D3');
      await page.getByLabel('Description').fill('Vitamin D supplement');
      await page.getByLabel('Dosage').fill('2000 IU');
      await page.getByLabel('Unit').fill('softgels');
      await page.getByLabel('Quantity').fill('120');
      await page.getByLabel('Expiry Date').fill('2027-03-01');
      await page.getByLabel('Notes').fill('Take with fat-containing meal for better absorption');

      await page.getByRole('button', { name: 'Add Medication' }).click();

      await expect(page.getByText('Vitamin D3')).toBeVisible();
      await expect(page.getByText('2000 IU')).toBeVisible();
      await expect(page.getByText('120 softgels')).toBeVisible();
      await expect(page.getByText('Take with fat-containing meal')).toBeVisible();
    });

    test('should handle different unit types', async ({ page }) => {
      const medicationTypes = [
        { name: 'Cough Syrup', dosage: '15mL', unit: 'bottles', quantity: '2', notes: 'Liquid medication' },
        { name: 'Protein Powder', dosage: '30g', unit: 'servings', quantity: '30', notes: 'Dietary supplement' },
        { name: 'Eye Drops', dosage: '1 drop', unit: 'bottles', quantity: '1', notes: 'Lubricating drops' },
        { name: 'Topical Cream', dosage: 'Apply thin layer', unit: 'tubes', quantity: '2', notes: 'External use only' },
        { name: 'Nasal Spray', dosage: '2 sprays', unit: 'bottles', quantity: '1', notes: 'Saline solution' }
      ];

      for (const med of medicationTypes) {
        await page.goto('/medications/new');
        
        await page.getByLabel('Name').fill(med.name);
        await page.getByLabel('Dosage').fill(med.dosage);
        await page.getByLabel('Unit').fill(med.unit);
        await page.getByLabel('Quantity').fill(med.quantity);
        await page.getByLabel('Notes').fill(med.notes);

        await page.getByRole('button', { name: 'Add Medication' }).click();

        await expect(page.getByText(med.name)).toBeVisible();
        await expect(page.getByText(med.dosage)).toBeVisible();
        await expect(page.getByText(`${med.quantity} ${med.unit}`)).toBeVisible();
      }
    });
  });

  test.describe('Form Validation', () => {
    test('should validate required fields', async ({ page }) => {
      await page.goto('/medications/new');

      // Try to submit without filling required fields
      await page.getByRole('button', { name: 'Add Medication' }).click();

      // Should show validation errors
      await expect(page.getByText('Name is required')).toBeVisible();
      await expect(page.getByText('Dosage is required')).toBeVisible();
      await expect(page.getByText('Unit is required')).toBeVisible();
      await expect(page.getByText('Quantity is required')).toBeVisible();
    });

    test('should validate quantity is positive number', async ({ page }) => {
      await page.goto('/medications/new');

      await page.getByLabel('Name').fill('Test Med');
      await page.getByLabel('Dosage').fill('10mg');
      await page.getByLabel('Unit').fill('tablets');
      await page.getByLabel('Quantity').fill('-5');

      await page.getByRole('button', { name: 'Add Medication' }).click();

      await expect(page.getByText('Quantity must be a positive number')).toBeVisible();
    });

    test('should validate quantity is a number', async ({ page }) => {
      await page.goto('/medications/new');

      await page.getByLabel('Name').fill('Test Med');
      await page.getByLabel('Dosage').fill('10mg');
      await page.getByLabel('Unit').fill('tablets');
      await page.getByLabel('Quantity').fill('not-a-number');

      await page.getByRole('button', { name: 'Add Medication' }).click();

      await expect(page.getByText('Quantity must be a valid number')).toBeVisible();
    });

    test('should validate expiry date format', async ({ page }) => {
      await page.goto('/medications/new');

      await page.getByLabel('Name').fill('Test Med');
      await page.getByLabel('Dosage').fill('10mg');
      await page.getByLabel('Unit').fill('tablets');
      await page.getByLabel('Quantity').fill('10');
      await page.getByLabel('Expiry Date').fill('invalid-date');

      await page.getByRole('button', { name: 'Add Medication' }).click();

      await expect(page.getByText('Please enter a valid date')).toBeVisible();
    });

    test('should validate name length', async ({ page }) => {
      await page.goto('/medications/new');

      const longName = 'A'.repeat(600);
      await page.getByLabel('Name').fill(longName);
      await page.getByLabel('Dosage').fill('10mg');
      await page.getByLabel('Unit').fill('tablets');
      await page.getByLabel('Quantity').fill('10');

      await page.getByRole('button', { name: 'Add Medication' }).click();

      await expect(page.getByText(/Name must be less than/)).toBeVisible();
    });

    test('should allow past expiry dates with warning', async ({ page }) => {
      await page.goto('/medications/new');

      await page.getByLabel('Name').fill('Expired Med');
      await page.getByLabel('Dosage').fill('10mg');
      await page.getByLabel('Unit').fill('tablets');
      await page.getByLabel('Quantity').fill('10');
      await page.getByLabel('Expiry Date').fill('2020-01-01');

      await page.getByRole('button', { name: 'Add Medication' }).click();

      // Should allow but might show warning
      await expect(page).toHaveURL('/medications');
      await expect(page.getByText('Expired Med')).toBeVisible();
    });
  });

  test.describe('Medication Search and Filtering', () => {
    test.beforeEach(async ({ page }) => {
      // Add some test medications
      const medications = [
        { name: 'Amoxicillin', dosage: '500mg', unit: 'tablets', quantity: '30', prescription: true },
        { name: 'Ibuprofen', dosage: '200mg', unit: 'capsules', quantity: '50', prescription: false },
        { name: 'Vitamin D3', dosage: '2000 IU', unit: 'softgels', quantity: '120', prescription: false },
        { name: 'Lisinopril', dosage: '10mg', unit: 'tablets', quantity: '90', prescription: true }
      ];

      for (const med of medications) {
        await page.goto('/medications/new');
        await page.getByLabel('Name').fill(med.name);
        await page.getByLabel('Dosage').fill(med.dosage);
        await page.getByLabel('Unit').fill(med.unit);
        await page.getByLabel('Quantity').fill(med.quantity);
        if (med.prescription) {
          await page.getByLabel('Prescription Medication').check();
        }
        await page.getByRole('button', { name: 'Add Medication' }).click();
      }
    });

    test('should search medications by name', async ({ page }) => {
      await page.goto('/medications');

      // Search for specific medication
      await page.getByPlaceholder('Search medications...').fill('Ibuprofen');

      // Should show only matching medication
      await expect(page.getByText('Ibuprofen')).toBeVisible();
      await expect(page.getByText('Amoxicillin')).not.toBeVisible();
      await expect(page.getByText('Vitamin D3')).not.toBeVisible();
    });

    test('should search medications by partial name', async ({ page }) => {
      await page.goto('/medications');

      await page.getByPlaceholder('Search medications...').fill('Vitamin');

      await expect(page.getByText('Vitamin D3')).toBeVisible();
      await expect(page.getByText('Amoxicillin')).not.toBeVisible();
    });

    test('should handle case-insensitive search', async ({ page }) => {
      await page.goto('/medications');

      await page.getByPlaceholder('Search medications...').fill('IBUPROFEN');

      await expect(page.getByText('Ibuprofen')).toBeVisible();
    });

    test('should clear search results', async ({ page }) => {
      await page.goto('/medications');

      // Search first
      await page.getByPlaceholder('Search medications...').fill('Vitamin');
      await expect(page.getByText('Vitamin D3')).toBeVisible();
      await expect(page.getByText('Amoxicillin')).not.toBeVisible();

      // Clear search
      await page.getByPlaceholder('Search medications...').fill('');

      // Should show all medications
      await expect(page.getByText('Vitamin D3')).toBeVisible();
      await expect(page.getByText('Amoxicillin')).toBeVisible();
      await expect(page.getByText('Ibuprofen')).toBeVisible();
      await expect(page.getByText('Lisinopril')).toBeVisible();
    });
  });

  test.describe('Medication Management', () => {
    test('should edit a medication', async ({ page }) => {
      // First create a medication
      await page.goto('/medications/new');
      await page.getByLabel('Name').fill('Original Med');
      await page.getByLabel('Dosage').fill('100mg');
      await page.getByLabel('Unit').fill('tablets');
      await page.getByLabel('Quantity').fill('60');
      await page.getByRole('button', { name: 'Add Medication' }).click();

      // Find and click edit button
      await page.getByRole('button', { name: 'Edit' }).click();
      await expect(page).toHaveURL(/\/medications\/.*\/edit/);

      // Update the information
      await page.getByLabel('Name').fill('Updated Med');
      await page.getByLabel('Dosage').fill('200mg');
      await page.getByLabel('Quantity').fill('120');
      await page.getByLabel('Notes').fill('Updated notes');

      await page.getByRole('button', { name: 'Update Medication' }).click();

      // Verify updates
      await expect(page).toHaveURL('/medications');
      await expect(page.getByText('Updated Med')).toBeVisible();
      await expect(page.getByText('200mg')).toBeVisible();
      await expect(page.getByText('120 tablets')).toBeVisible();
      await expect(page.getByText('Updated notes')).toBeVisible();
      await expect(page.getByText('Original Med')).not.toBeVisible();
    });

    test('should delete a medication', async ({ page }) => {
      // Create a medication
      await page.goto('/medications/new');
      await page.getByLabel('Name').fill('To Be Deleted');
      await page.getByLabel('Dosage').fill('50mg');
      await page.getByLabel('Unit').fill('tablets');
      await page.getByLabel('Quantity').fill('30');
      await page.getByRole('button', { name: 'Add Medication' }).click();

      // Verify it exists
      await expect(page.getByText('To Be Deleted')).toBeVisible();

      // Delete it
      page.on('dialog', dialog => dialog.accept()); // Accept confirmation dialog
      await page.getByRole('button', { name: 'Delete' }).click();

      // Verify deletion
      await expect(page.getByText('To Be Deleted')).not.toBeVisible();
      await expect(page.getByText('No medications added yet.')).toBeVisible();
    });

    test('should update medication quantity (inventory management)', async ({ page }) => {
      // Create a medication with initial quantity
      await page.goto('/medications/new');
      await page.getByLabel('Name').fill('Inventory Test');
      await page.getByLabel('Dosage').fill('25mg');
      await page.getByLabel('Unit').fill('tablets');
      await page.getByLabel('Quantity').fill('100');
      await page.getByRole('button', { name: 'Add Medication' }).click();

      // Edit to reduce quantity (simulating medication taken)
      await page.getByRole('button', { name: 'Edit' }).click();
      await page.getByLabel('Quantity').fill('95');
      await page.getByRole('button', { name: 'Update Medication' }).click();

      // Verify quantity update
      await expect(page.getByText('95 tablets')).toBeVisible();
      await expect(page.getByText('100 tablets')).not.toBeVisible();
    });

    test('should handle zero quantity (out of stock)', async ({ page }) => {
      await page.goto('/medications/new');
      await page.getByLabel('Name').fill('Out of Stock');
      await page.getByLabel('Dosage').fill('10mg');
      await page.getByLabel('Unit').fill('tablets');
      await page.getByLabel('Quantity').fill('0');
      await page.getByRole('button', { name: 'Add Medication' }).click();

      await expect(page.getByText('Out of Stock')).toBeVisible();
      await expect(page.getByText('0 tablets')).toBeVisible();
    });
  });

  test.describe('Edge Cases and Special Scenarios', () => {
    test('should handle medications with special characters', async ({ page }) => {
      await page.goto('/medications/new');

      const specialName = "Tylenol® Extra Strength";
      const specialNotes = "Don't exceed 3000mg/day. Avoid alcohol. Contains acetaminophen.";

      await page.getByLabel('Name').fill(specialName);
      await page.getByLabel('Dosage').fill('500mg');
      await page.getByLabel('Unit').fill('caplets');
      await page.getByLabel('Quantity').fill('24');
      await page.getByLabel('Notes').fill(specialNotes);

      await page.getByRole('button', { name: 'Add Medication' }).click();

      await expect(page.getByText(specialName)).toBeVisible();
      await expect(page.getByText("Don't exceed 3000mg/day")).toBeVisible();
    });

    test('should handle duplicate medication names with different dosages', async ({ page }) => {
      // Add first medication
      await page.goto('/medications/new');
      await page.getByLabel('Name').fill('Ibuprofen');
      await page.getByLabel('Dosage').fill('200mg');
      await page.getByLabel('Unit').fill('tablets');
      await page.getByLabel('Quantity').fill('50');
      await page.getByRole('button', { name: 'Add Medication' }).click();

      // Add second medication with same name but different dosage
      await page.getByRole('link', { name: 'Add Medication' }).click();
      await page.getByLabel('Name').fill('Ibuprofen');
      await page.getByLabel('Dosage').fill('400mg');
      await page.getByLabel('Unit').fill('tablets');
      await page.getByLabel('Quantity').fill('30');
      await page.getByRole('button', { name: 'Add Medication' }).click();

      // Both should appear in the list
      await expect(page.getByText('Ibuprofen').first()).toBeVisible();
      await expect(page.getByText('200mg')).toBeVisible();
      await expect(page.getByText('400mg')).toBeVisible();
    });

    test('should handle large quantity numbers', async ({ page }) => {
      await page.goto('/medications/new');

      await page.getByLabel('Name').fill('Bulk Vitamin');
      await page.getByLabel('Dosage').fill('100mg');
      await page.getByLabel('Unit').fill('tablets');
      await page.getByLabel('Quantity').fill('999999');

      await page.getByRole('button', { name: 'Add Medication' }).click();

      await expect(page.getByText('999999 tablets')).toBeVisible();
    });

    test('should handle very long descriptions and notes', async ({ page }) => {
      await page.goto('/medications/new');

      const longDescription = 'A'.repeat(1000);
      const longNotes = 'B'.repeat(2000);

      await page.getByLabel('Name').fill('Long Description Med');
      await page.getByLabel('Description').fill(longDescription);
      await page.getByLabel('Dosage').fill('10mg');
      await page.getByLabel('Unit').fill('tablets');
      await page.getByLabel('Quantity').fill('30');
      await page.getByLabel('Notes').fill(longNotes);

      await page.getByRole('button', { name: 'Add Medication' }).click();

      await expect(page.getByText('Long Description Med')).toBeVisible();
      // Should truncate or handle long text gracefully
    });
  });

  test.describe('Data Persistence and Refresh', () => {
    test('should persist medications after page refresh', async ({ page }) => {
      // Add a medication
      await page.goto('/medications/new');
      await page.getByLabel('Name').fill('Persistent Med');
      await page.getByLabel('Dosage').fill('75mg');
      await page.getByLabel('Unit').fill('capsules');
      await page.getByLabel('Quantity').fill('60');
      await page.getByLabel('Prescription Medication').check();
      await page.getByRole('button', { name: 'Add Medication' }).click();

      // Refresh the page
      await page.reload();

      // Verify data persists
      await expect(page.getByText('Persistent Med')).toBeVisible();
      await expect(page.getByText('75mg')).toBeVisible();
      await expect(page.getByText('60 capsules')).toBeVisible();
    });

    test('should maintain search state after navigation', async ({ page }) => {
      // Add multiple medications first
      const meds = ['Aspirin', 'Tylenol', 'Advil'];
      for (const med of meds) {
        await page.goto('/medications/new');
        await page.getByLabel('Name').fill(med);
        await page.getByLabel('Dosage').fill('100mg');
        await page.getByLabel('Unit').fill('tablets');
        await page.getByLabel('Quantity').fill('30');
        await page.getByRole('button', { name: 'Add Medication' }).click();
      }

      // Search for specific medication
      await page.getByPlaceholder('Search medications...').fill('Aspirin');
      await expect(page.getByText('Aspirin')).toBeVisible();
      await expect(page.getByText('Tylenol')).not.toBeVisible();

      // Navigate to add new medication
      await page.getByRole('link', { name: 'Add Medication' }).click();
      
      // Navigate back
      await page.getByRole('link', { name: 'Cancel' }).click();

      // Search should be reset (typical behavior)
      await expect(page.getByText('Aspirin')).toBeVisible();
      await expect(page.getByText('Tylenol')).toBeVisible();
      await expect(page.getByText('Advil')).toBeVisible();
    });
  });
});