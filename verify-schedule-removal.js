const puppeteer = require('puppeteer');

async function verifyScheduleRemoval() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      width: 820,  // iPad Mini width
      height: 1180 // iPad Mini height
    }
  });

  try {
    const page = await browser.newPage();

    console.log('Verifying Schedule page removal and navigation updates...\n');

    // Test 1: Verify Schedule page no longer exists
    console.log('1. Testing Schedule page removal:');
    const scheduleResponse = await page.goto('http://localhost:3002/dashboard/schedule', {
      waitUntil: 'domcontentloaded'
    });

    if (scheduleResponse.status() === 404) {
      console.log('✓ Schedule page returns 404 (correctly removed)');
    } else {
      console.log('✗ Schedule page still exists (status: ' + scheduleResponse.status() + ')');
    }

    // Test 2: Check Dashboard page
    await page.goto('http://localhost:3002/dashboard', { waitUntil: 'networkidle0' });

    // Check that "View All" link points to inspection page
    const viewAllLink = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href="/dashboard/inspection"]'));
      return links.find(link => link.textContent.includes('View All'));
    });

    if (viewAllLink) {
      console.log('✓ Dashboard "View All" link correctly points to /dashboard/inspection');
    } else {
      console.log('✗ Dashboard "View All" link not found or incorrect');
    }

    // Test 3: Check Inspection page title
    await page.goto('http://localhost:3002/dashboard/inspection', { waitUntil: 'networkidle0' });

    const inspectionTitle = await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll('h2'));
      return headers.find(h => h.textContent.includes('Scheduled Inspections'));
    });

    if (inspectionTitle) {
      console.log('✓ Inspection page title updated to "Scheduled Inspections"');
    } else {
      console.log('✗ Inspection page title not updated');
    }

    // Test 4: Check Sidebar navigation (desktop)
    const sidebarScheduleLink = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href="/dashboard/schedule"]'));
      return links.length;
    });

    if (sidebarScheduleLink === 0) {
      console.log('✓ Schedule link removed from sidebar navigation');
    } else {
      console.log('✗ Schedule link still present in sidebar');
    }

    // Test 5: Check Mobile navigation
    await page.setViewport({ width: 375, height: 812 });
    await page.reload({ waitUntil: 'networkidle0' });

    const mobileScheduleLink = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href="/dashboard/schedule"]'));
      return links.length;
    });

    if (mobileScheduleLink === 0) {
      console.log('✓ Schedule link removed from mobile navigation');
    } else {
      console.log('✗ Schedule link still present in mobile navigation');
    }

    // Test 6: Take screenshots
    await page.setViewport({ width: 820, height: 1180 });
    await page.goto('http://localhost:3002/dashboard', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'dashboard-final.png', fullPage: false });
    console.log('\n✓ Dashboard screenshot saved: dashboard-final.png');

    await page.goto('http://localhost:3002/dashboard/inspection', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'inspection-final.png', fullPage: false });
    console.log('✓ Inspection page screenshot saved: inspection-final.png');

    console.log('\n✅ All verification checks completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

verifyScheduleRemoval();