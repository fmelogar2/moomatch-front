const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:4200/', { waitUntil: 'networkidle' });
    const screenshotPath = 'C:\Users\fmelo\AppData\Local\Temp\claude\c--fmelo-Cattle-moomatch-front\78ee1ba6-d444-48ea-ab10-4a9fae02aa2d\screenshots\login.png';
    await page.screenshot({ path: screenshotPath });
    console.log('Screenshot saved to:', screenshotPath);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
