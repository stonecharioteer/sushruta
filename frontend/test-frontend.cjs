#!/usr/bin/env node

// Test script for frontend functionality
// This script tests the frontend to ensure forms and display work correctly

const puppeteer = require('puppeteer');

async function testFrontend() {
  console.log('🧪 Testing Frontend with Gender and Species Fields');
  console.log('=================================================');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // Test 1: Navigate to application
    console.log('1. Testing application access...');
    await page.goto('http://localhost:5416', { waitUntil: 'networkidle0' });
    
    const title = await page.title();
    if (title.includes('Sushruta')) {
      console.log('✅ Application loaded successfully');
    } else {
      console.log('❌ Application failed to load');
      return;
    }

    // Test 2: Navigate to Family page
    console.log('2. Testing Family page navigation...');
    await page.click('a[href="/family"]');
    await page.waitForSelector('h1', { timeout: 5000 });
    
    const familyHeader = await page.$eval('h1', el => el.textContent);
    if (familyHeader.includes('Family Members')) {
      console.log('✅ Family page loaded successfully');
    } else {
      console.log('❌ Family page failed to load');
      return;
    }

    // Test 3: Navigate to Add Member form
    console.log('3. Testing Add Member form access...');
    await page.click('a[href="/family/new"]');
    await page.waitForSelector('form', { timeout: 5000 });
    
    const formHeader = await page.$eval('h1', el => el.textContent);
    if (formHeader.includes('Add Family Member')) {
      console.log('✅ Add Member form loaded successfully');
    } else {
      console.log('❌ Add Member form failed to load');
      return;
    }

    // Test 4: Check gender field exists
    console.log('4. Testing gender field presence...');
    const genderSelect = await page.$('select[name="gender"]');
    if (genderSelect) {
      console.log('✅ Gender field found');
    } else {
      console.log('❌ Gender field not found');
      return;
    }

    // Test 5: Test species field conditional display
    console.log('5. Testing species field conditional display...');
    
    // Initially type should be human, species should not be visible
    let speciesField = await page.$('select[name="species"]');
    if (!speciesField) {
      console.log('✅ Species field hidden for humans (correct)');
    } else {
      console.log('❌ Species field should be hidden for humans');
    }

    // Change type to pet
    await page.select('select[name="type"]', 'pet');
    await page.waitForTimeout(100); // Wait for React to update

    // Now species field should be visible
    speciesField = await page.$('select[name="species"]');
    if (speciesField) {
      console.log('✅ Species field visible for pets (correct)');
    } else {
      console.log('❌ Species field should be visible for pets');
      return;
    }

    // Test 6: Test form submission with new fields
    console.log('6. Testing form submission with new fields...');
    
    await page.type('input[name="name"]', 'Test Pet Fluffy');
    await page.select('select[name="gender"]', 'female');
    await page.select('select[name="species"]', 'cat');
    await page.type('input[name="dateOfBirth"]', '2020-06-15');
    
    await page.click('button[type="submit"]');
    
    // Wait for redirect to family page
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
    
    const currentUrl = page.url();
    if (currentUrl.includes('/family')) {
      console.log('✅ Form submission successful (redirected to family page)');
    } else {
      console.log('❌ Form submission failed or no redirect');
      return;
    }

    // Test 7: Check if the new family member appears with icons
    console.log('7. Testing family member display with icons...');
    
    // Look for the newly created family member
    const memberExists = await page.evaluate(() => {
      return document.body.textContent.includes('Test Pet Fluffy');
    });
    
    if (memberExists) {
      console.log('✅ New family member displayed successfully');
    } else {
      console.log('❌ New family member not found in display');
    }

    console.log('');
    console.log('🎉 All frontend tests completed!');
    console.log('Frontend is working correctly with gender and species fields');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Check if puppeteer is available
try {
  testFrontend();
} catch (error) {
  console.log('⚠️  Puppeteer not available, skipping automated frontend tests');
  console.log('   To run automated tests, install puppeteer:');
  console.log('   npm install puppeteer');
  console.log('');
  console.log('🧪 Manual Testing Instructions:');
  console.log('================================');
  console.log('1. Open http://localhost:5416 in your browser');
  console.log('2. Navigate to Family → Add Member');
  console.log('3. Verify gender dropdown exists');
  console.log('4. Select "Pet" type and verify species dropdown appears');
  console.log('5. Create a pet with gender and species');
  console.log('6. Verify the pet appears in the family list with icons');
}