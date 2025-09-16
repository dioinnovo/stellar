const puppeteer = require('puppeteer');

async function takeScreenshots() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      width: 820,  // iPad Mini width
      height: 1180 // iPad Mini height
    }
  });

  try {
    const page = await browser.newPage();

    console.log('Taking screenshots...');

    // Dashboard
    await page.goto('http://localhost:3001/dashboard', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'screenshot-dashboard.png', fullPage: false });
    console.log('✓ Dashboard screenshot saved');

    // Schedule
    await page.goto('http://localhost:3001/dashboard/schedule', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'screenshot-schedule.png', fullPage: false });
    console.log('✓ Schedule screenshot saved');

    // Reports
    await page.goto('http://localhost:3001/dashboard/reports', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'screenshot-reports.png', fullPage: false });
    console.log('✓ Reports screenshot saved');

    // Inspection with expanded sidebar
    await page.goto('http://localhost:3001/dashboard/inspection', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'screenshot-inspection-expanded.png', fullPage: false });
    console.log('✓ Inspection (expanded sidebar) screenshot saved');

    console.log('\n✅ All screenshots saved successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

takeScreenshots();