const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Navigating to http://localhost:5416...');
  await page.goto('http://localhost:5416');
  
  console.log('Page title:', await page.title());
  
  console.log('\n=== DASHBOARD PAGE CONTENT ===');
  const content = await page.textContent('body');
  console.log(content.substring(0, 500) + '...');
  
  console.log('\n=== FAMILY PAGE ===');
  await page.click('nav a[href="/family"]');
  await page.waitForLoadState('networkidle');
  const familyContent = await page.textContent('main');
  console.log(familyContent.substring(0, 500) + '...');
  
  await browser.close();
})();