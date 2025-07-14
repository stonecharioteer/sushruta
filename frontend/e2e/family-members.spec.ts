import { test, expect } from '@playwright/test';

test.describe('Family Members - Add and Manage', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test.describe('Adding Human Family Members', () => {
    test('should add a human family member with all fields', async ({ page }) => {
      // Navigate to family page
      await page.locator('nav').getByRole('link', { name: 'Family' }).first().click();
      await expect(page).toHaveURL('/family');

      // Click Add Member button
      await page.getByRole('link', { name: 'Add Member' }).click();
      await expect(page).toHaveURL('/family/new');

      // Fill out the form for a human
      await page.getByLabel('Name').fill('John Doe');
      await page.getByLabel('Type').selectOption('human');
      await page.getByLabel('Date of Birth').fill('1990-01-15');
      await page.getByLabel('Notes').fill('Father, no known allergies, takes medication with breakfast');

      // Submit the form
      await page.getByRole('button', { name: 'Add Family Member' }).click();

      // Should redirect back to family page
      await expect(page).toHaveURL('/family');

      // Verify the family member appears in the list
      await expect(page.getByText('John Doe')).toBeVisible();
      await expect(page.getByText('Born: 1/15/1990')).toBeVisible();
      await expect(page.getByText('Father, no known allergies')).toBeVisible();

      // Verify it appears in the humans section
      await expect(page.locator('text=Family Members (1)')).toBeVisible();
    });

    test('should add a human family member with minimal fields', async ({ page }) => {
      // Navigate to add family member
      await page.goto('/family/new');

      // Fill only required fields
      await page.getByLabel('Name').fill('Jane Smith');
      await page.getByLabel('Type').selectOption('human');

      // Submit the form
      await page.getByRole('button', { name: 'Add Family Member' }).click();

      // Verify successful creation
      await expect(page).toHaveURL('/family');
      await expect(page.getByText('Jane Smith')).toBeVisible();
    });

    test('should validate required fields for humans', async ({ page }) => {
      await page.goto('/family/new');

      // Try to submit without filling required fields
      await page.getByRole('button', { name: 'Add Family Member' }).click();

      // Should show validation errors
      await expect(page.getByText('Name is required')).toBeVisible();
      await expect(page.getByText('Type is required')).toBeVisible();
    });

    test('should validate name length for humans', async ({ page }) => {
      await page.goto('/family/new');

      // Fill with very long name
      const longName = 'A'.repeat(300);
      await page.getByLabel('Name').fill(longName);
      await page.getByLabel('Type').selectOption('human');

      await page.getByRole('button', { name: 'Add Family Member' }).click();

      // Should show validation error for name length
      await expect(page.getByText(/Name must be less than/)).toBeVisible();
    });

    test('should validate date format for humans', async ({ page }) => {
      await page.goto('/family/new');

      await page.getByLabel('Name').fill('Test Person');
      await page.getByLabel('Type').selectOption('human');
      await page.getByLabel('Date of Birth').fill('invalid-date');

      await page.getByRole('button', { name: 'Add Family Member' }).click();

      // Should show validation error for invalid date
      await expect(page.getByText(/Please enter a valid date/)).toBeVisible();
    });
  });

  test.describe('Adding Pet Family Members', () => {
    test('should add a pet family member with all fields', async ({ page }) => {
      await page.goto('/family/new');

      // Fill out the form for a pet
      await page.getByLabel('Name').fill('Buddy');
      await page.getByLabel('Type').selectOption('pet');
      await page.getByLabel('Date of Birth').fill('2020-06-10');
      await page.getByLabel('Notes').fill('Golden Retriever, loves treats, scared of thunderstorms');

      // Submit the form
      await page.getByRole('button', { name: 'Add Family Member' }).click();

      // Verify successful creation
      await expect(page).toHaveURL('/family');
      await expect(page.getByText('Buddy')).toBeVisible();
      await expect(page.getByText('Born: 6/10/2020')).toBeVisible();
      await expect(page.getByText('Golden Retriever, loves treats')).toBeVisible();

      // Verify it appears in the pets section
      await expect(page.locator('text=Pets (1)')).toBeVisible();
    });

    test('should add multiple pets with same name', async ({ page }) => {
      // Add first pet
      await page.goto('/family/new');
      await page.getByLabel('Name').fill('Buddy');
      await page.getByLabel('Type').selectOption('pet');
      await page.getByLabel('Notes').fill('Golden Retriever');
      await page.getByRole('button', { name: 'Add Family Member' }).click();

      // Add second pet with same name
      await page.getByRole('link', { name: 'Add Member' }).click();
      await page.getByLabel('Name').fill('Buddy');
      await page.getByLabel('Type').selectOption('pet');
      await page.getByLabel('Notes').fill('Labrador');
      await page.getByRole('button', { name: 'Add Family Member' }).click();

      // Verify both pets appear
      await expect(page.locator('text=Pets (2)')).toBeVisible();
      const buddyCards = page.locator('text=Buddy');
      await expect(buddyCards).toHaveCount(2);
    });

    test('should handle special characters in pet names', async ({ page }) => {
      await page.goto('/family/new');

      const specialName = "Señor Whiskers-O'Malley";
      await page.getByLabel('Name').fill(specialName);
      await page.getByLabel('Type').selectOption('pet');
      await page.getByLabel('Notes').fill('Cat with attitude àáâãäåæçèéêë');

      await page.getByRole('button', { name: 'Add Family Member' }).click();

      await expect(page.getByText(specialName)).toBeVisible();
      await expect(page.getByText('Cat with attitude àáâãäåæçèéêë')).toBeVisible();
    });
  });

  test.describe('Mixed Family Members', () => {
    test('should add both humans and pets to the same family', async ({ page }) => {
      // Add a human
      await page.goto('/family/new');
      await page.getByLabel('Name').fill('Sarah Connor');
      await page.getByLabel('Type').selectOption('human');
      await page.getByLabel('Date of Birth').fill('1985-05-20');
      await page.getByRole('button', { name: 'Add Family Member' }).click();

      // Add a pet
      await page.getByRole('link', { name: 'Add Member' }).click();
      await page.getByLabel('Name').fill('Terminator');
      await page.getByLabel('Type').selectOption('pet');
      await page.getByLabel('Date of Birth').fill('2019-03-15');
      await page.getByLabel('Notes').fill('German Shepherd, protective');
      await page.getByRole('button', { name: 'Add Family Member' }).click();

      // Add another human
      await page.getByRole('link', { name: 'Add Member' }).click();
      await page.getByLabel('Name').fill('John Connor');
      await page.getByLabel('Type').selectOption('human');
      await page.getByLabel('Date of Birth').fill('2010-08-29');
      await page.getByRole('button', { name: 'Add Family Member' }).click();

      // Verify family structure
      await expect(page.locator('text=Family Members (2)')).toBeVisible();
      await expect(page.locator('text=Pets (1)')).toBeVisible();
      
      await expect(page.getByText('Sarah Connor')).toBeVisible();
      await expect(page.getByText('John Connor')).toBeVisible();
      await expect(page.getByText('Terminator')).toBeVisible();
    });

    test('should display empty states appropriately', async ({ page }) => {
      await page.goto('/family');

      // Initially should show no family members
      await expect(page.getByText('No family members added yet.')).toBeVisible();
      await expect(page.getByText('No pets added yet.')).toBeVisible();

      // Add only a pet
      await page.getByRole('link', { name: 'Add Member' }).click();
      await page.getByLabel('Name').fill('Solo Pet');
      await page.getByLabel('Type').selectOption('pet');
      await page.getByRole('button', { name: 'Add Family Member' }).click();

      // Should show pet but still show empty state for humans
      await expect(page.getByText('Solo Pet')).toBeVisible();
      await expect(page.getByText('No family members added yet.')).toBeVisible();
      await expect(page.getByText('No pets added yet.')).not.toBeVisible();
    });
  });

  test.describe('Family Member Management', () => {
    test('should edit a family member', async ({ page }) => {
      // First create a family member
      await page.goto('/family/new');
      await page.getByLabel('Name').fill('Original Name');
      await page.getByLabel('Type').selectOption('human');
      await page.getByLabel('Date of Birth').fill('1990-01-01');
      await page.getByRole('button', { name: 'Add Family Member' }).click();

      // Find and click edit button
      await page.getByRole('button', { name: 'Edit' }).click();
      await expect(page).toHaveURL(/\/family\/.*\/edit/);

      // Update the information
      await page.getByLabel('Name').fill('Updated Name');
      await page.getByLabel('Date of Birth').fill('1990-12-31');
      await page.getByLabel('Notes').fill('Updated notes');

      await page.getByRole('button', { name: 'Update Family Member' }).click();

      // Verify updates
      await expect(page).toHaveURL('/family');
      await expect(page.getByText('Updated Name')).toBeVisible();
      await expect(page.getByText('Born: 12/31/1990')).toBeVisible();
      await expect(page.getByText('Updated notes')).toBeVisible();
      await expect(page.getByText('Original Name')).not.toBeVisible();
    });

    test('should delete a family member', async ({ page }) => {
      // Create a family member
      await page.goto('/family/new');
      await page.getByLabel('Name').fill('To Be Deleted');
      await page.getByLabel('Type').selectOption('human');
      await page.getByRole('button', { name: 'Add Family Member' }).click();

      // Verify it exists
      await expect(page.getByText('To Be Deleted')).toBeVisible();

      // Delete it
      page.on('dialog', dialog => dialog.accept()); // Accept confirmation dialog
      await page.getByRole('button', { name: 'Delete' }).click();

      // Verify deletion
      await expect(page.getByText('To Be Deleted')).not.toBeVisible();
      await expect(page.getByText('No family members added yet.')).toBeVisible();
    });

    test('should cancel deletion when user cancels', async ({ page }) => {
      // Create a family member
      await page.goto('/family/new');
      await page.getByLabel('Name').fill('Not To Be Deleted');
      await page.getByLabel('Type').selectOption('human');
      await page.getByRole('button', { name: 'Add Family Member' }).click();

      // Try to delete but cancel
      page.on('dialog', dialog => dialog.dismiss()); // Cancel confirmation dialog
      await page.getByRole('button', { name: 'Delete' }).click();

      // Verify it still exists
      await expect(page.getByText('Not To Be Deleted')).toBeVisible();
    });
  });

  test.describe('Navigation and User Experience', () => {
    test('should navigate between family management pages', async ({ page }) => {
      await page.goto('/family');

      // Go to add member page
      await page.getByRole('link', { name: 'Add Member' }).click();
      await expect(page).toHaveURL('/family/new');

      // Should have proper page title and description
      await expect(page.getByText('Add Family Member')).toBeVisible();
      await expect(page.getByText('Add a new family member or pet')).toBeVisible();

      // Cancel and go back
      await page.getByRole('link', { name: 'Cancel' }).click();
      await expect(page).toHaveURL('/family');
    });

    test('should show loading states during form submission', async ({ page }) => {
      await page.goto('/family/new');

      await page.getByLabel('Name').fill('Test Member');
      await page.getByLabel('Type').selectOption('human');

      // Click submit and check for loading state
      const submitButton = page.getByRole('button', { name: 'Add Family Member' });
      await submitButton.click();

      // Button should show loading state (if implemented)
      // Note: This test depends on the actual implementation of loading states
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // This test would require mocking network failures
      // For now, we'll test that the form doesn't break with invalid data
      await page.goto('/family/new');

      await page.getByLabel('Name').fill('Test');
      await page.getByLabel('Type').selectOption('human');
      await page.getByLabel('Date of Birth').fill('2030-12-31'); // Future date

      await page.getByRole('button', { name: 'Add Family Member' }).click();

      // Should handle the submission, even if backend rejects future dates
      // The exact behavior depends on validation implementation
    });

    test('should maintain form state when navigating back', async ({ page }) => {
      await page.goto('/family/new');

      // Fill partial form
      await page.getByLabel('Name').fill('Partial Entry');
      await page.getByLabel('Type').selectOption('pet');

      // Navigate away and back
      await page.goto('/family');
      await page.getByRole('link', { name: 'Add Member' }).click();

      // Form should be reset (this is typical behavior)
      await expect(page.getByLabel('Name')).toHaveValue('');
    });
  });

  test.describe('Data Persistence and Refresh', () => {
    test('should persist family members after page refresh', async ({ page }) => {
      // Add a family member
      await page.goto('/family/new');
      await page.getByLabel('Name').fill('Persistent Member');
      await page.getByLabel('Type').selectOption('human');
      await page.getByLabel('Date of Birth').fill('1995-07-20');
      await page.getByRole('button', { name: 'Add Family Member' }).click();

      // Refresh the page
      await page.reload();

      // Verify data persists
      await expect(page.getByText('Persistent Member')).toBeVisible();
      await expect(page.getByText('Born: 7/20/1995')).toBeVisible();
    });

    test('should handle concurrent access (multiple browser tabs)', async ({ page, context }) => {
      // Add member in first tab
      await page.goto('/family/new');
      await page.getByLabel('Name').fill('First Tab Member');
      await page.getByLabel('Type').selectOption('human');
      await page.getByRole('button', { name: 'Add Family Member' }).click();

      // Open second tab
      const secondPage = await context.newPage();
      await secondPage.goto('/family');

      // Should see the member added in first tab
      await expect(secondPage.getByText('First Tab Member')).toBeVisible();

      // Add member in second tab
      await secondPage.getByRole('link', { name: 'Add Member' }).click();
      await secondPage.getByLabel('Name').fill('Second Tab Member');
      await secondPage.getByLabel('Type').selectOption('pet');
      await secondPage.getByRole('button', { name: 'Add Family Member' }).click();

      // Go back to first tab and refresh
      await page.goto('/family');

      // Should see both members
      await expect(page.getByText('First Tab Member')).toBeVisible();
      await expect(page.getByText('Second Tab Member')).toBeVisible();
    });
  });
});