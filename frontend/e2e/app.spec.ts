import { test, expect } from '@playwright/test';

test.describe('Sushruta Medicine Tracker', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should load the homepage successfully', async ({ page }) => {
    // Check that the page loads
    await expect(page).toHaveTitle(/Sushruta - Medicine Tracker/);
    
    // Check for the main heading in the main content area
    await expect(page.locator('main').getByText('Dashboard')).toBeVisible();
    
    // Check for the Sushruta branding in header
    await expect(page.locator('header').getByText('Sushruta')).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    // Check navigation items are present
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Family' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Medications' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Schedule' })).toBeVisible();
  });

  test('should navigate to Family page', async ({ page }) => {
    // Click on Family navigation in header
    await page.locator('nav').getByRole('link', { name: 'Family' }).first().click();
    
    // Check we're on the Family page
    await expect(page).toHaveURL('/family');
    await expect(page.locator('main').getByText('Family Members')).toBeVisible();
    
    // Should show empty state initially
    await expect(page.getByText('No family members added yet.')).toBeVisible();
  });

  test('should navigate to Medications page', async ({ page }) => {
    // Click on Medications navigation in header
    await page.locator('nav').getByRole('link', { name: 'Medications' }).first().click();
    
    // Check we're on the Medications page
    await expect(page).toHaveURL('/medications');
    await expect(page.locator('main').getByText('Medications')).toBeVisible();
    
    // Should show empty state initially
    await expect(page.getByText('No medications added yet.')).toBeVisible();
  });

  test('should navigate to Schedule page', async ({ page }) => {
    // Click on Schedule navigation
    await page.getByRole('link', { name: 'Schedule' }).click();
    
    // Check we're on the Schedule page
    await expect(page).toHaveURL('/schedule');
    await expect(page.getByText('Medication Schedule')).toBeVisible();
    
    // Should show empty state initially
    await expect(page.getByText('No medications scheduled for this date.')).toBeVisible();
  });

  test('should display dashboard statistics', async ({ page }) => {
    // Check for stats cards on dashboard (the stat cards have dt elements)
    await expect(page.locator('dt').getByText('Family Members')).toBeVisible();
    await expect(page.locator('dt').getByText('Medications')).toBeVisible();
    await expect(page.locator('dt').getByText("Today's Schedule")).toBeVisible();
    await expect(page.locator('dt').getByText('Compliance Rate')).toBeVisible();
    
    // Should show stats values (any numeric values) in dd elements
    await expect(page.locator('dd').first()).toBeVisible();
  });

  test('should display quick actions section', async ({ page }) => {
    // Check for quick actions
    await expect(page.getByText('Quick Actions')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Add Family Member' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Add Medication' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'New Prescription' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Log Medication' })).toBeVisible();
  });

  test('should be responsive for mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that mobile navigation hamburger menu is present
    await expect(page.locator('header button svg')).toBeVisible(); // Mobile menu button should be visible
    
    // Check that content is still accessible
    await expect(page.locator('main').getByText('Dashboard')).toBeVisible();
  });

  test('should show proper pulse icon', async ({ page }) => {
    // Check that the Activity (pulse) icon is present in header
    const logo = page.locator('header').getByRole('link').first();
    await expect(logo).toBeVisible();
    
    // Should contain SVG icon
    await expect(logo.locator('svg')).toBeVisible();
  });

  test('should handle API backend connection', async ({ page }) => {
    // Wait for page to load and make API calls
    await page.waitForLoadState('networkidle');
    
    // Check that API calls were made (even if they return empty data)
    // The absence of error messages indicates successful API connection
    await expect(page.getByText('Error')).not.toBeVisible();
    
    // Dashboard should load without errors
    await expect(page.getByText('Welcome to your family medicine tracker')).toBeVisible();
  });

  test('should display correct page titles and descriptions', async ({ page }) => {
    // Check Dashboard
    await expect(page.getByText('Welcome to your family medicine tracker')).toBeVisible();
    
    // Navigate to Family page
    await page.locator('nav').getByRole('link', { name: 'Family' }).first().click();
    await expect(page.getByText('Manage your family members and pets')).toBeVisible();
    
    // Navigate to Medications page
    await page.locator('nav').getByRole('link', { name: 'Medications' }).first().click();
    await expect(page.getByText('Manage your medication inventory')).toBeVisible();
    
    // Navigate to Schedule page
    await page.locator('nav').getByRole('link', { name: 'Schedule' }).first().click();
    await expect(page.getByText('Track daily medication intake')).toBeVisible();
  });
});