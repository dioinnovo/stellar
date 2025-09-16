const puppeteer = require('puppeteer');

async function finalTest() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      width: 820,  // iPad Mini width
      height: 1180 // iPad Mini height
    }
  });

  try {
    const page = await browser.newPage();

    console.log('Taking final screenshots of the application...\n');

    // Dashboard page
    await page.goto('http://localhost:3002/dashboard', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'final-dashboard.png', fullPage: false });
    console.log('✓ Dashboard screenshot: final-dashboard.png');

    // Inspection page
    await page.goto('http://localhost:3002/dashboard/inspection', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'final-inspection.png', fullPage: false });
    console.log('✓ Inspection page screenshot: final-inspection.png');

    // Reports page
    await page.goto('http://localhost:3002/dashboard/reports', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'final-reports.png', fullPage: false });
    console.log('✓ Reports page screenshot: final-reports.png');

    // Claims page
    await page.goto('http://localhost:3002/dashboard/claims', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'final-claims.png', fullPage: false });
    console.log('✓ Claims page screenshot: final-claims.png');

    console.log('\n✅ All screenshots captured successfully!');
    console.log('\nChanges implemented:');
    console.log('• Schedule page has been deleted');
    console.log('• Inspection page title updated to "Scheduled Inspections"');
    console.log('• Navigation links updated in sidebar and mobile nav');
    console.log('• Dashboard "View All" link points to /dashboard/inspection');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

finalTest();