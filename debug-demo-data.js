const puppeteer = require('puppeteer');

async function debugDemoData() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1200, height: 800 }
  });

  const page = await browser.newPage();

  // Listen to console messages
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('🔍') || text.includes('🎯') || text.includes('❌') || text.includes('📊')) {
      console.log('BROWSER:', text);
    }
  });

  try {
    console.log('🚀 Starting demo data debug test...');

    // Navigate to Master Bedroom area directly
    console.log('📍 Navigating to Master Bedroom area...');
    await page.goto('http://localhost:3000/dashboard/inspection/INS-002/area/interior-bedrooms', {
      waitUntil: 'networkidle0',
      timeout: 10000
    });

    // Wait for page to fully load
    await page.waitForTimeout(2000);

    console.log('✅ Page loaded, checking console output above for debug info...');

    // Check if we see any photos
    const photoElements = await page.$$('img[alt="Inspection"]');
    console.log(`📸 Found ${photoElements.length} inspection photos`);

    // Check if we see any voice notes
    const voiceNoteElements = await page.$$('[data-testid="voice-note"], .voice-note, [class*="audio"]');
    console.log(`🎤 Found ${voiceNoteElements.length} voice note elements`);

    // Check if findings are populated
    const findingsTextarea = await page.$('textarea[placeholder*="Document visible damage"]');
    if (findingsTextarea) {
      const findingsValue = await page.evaluate(el => el.value, findingsTextarea);
      console.log(`📝 Findings text length: ${findingsValue.length} characters`);
      if (findingsValue.length > 0) {
        console.log(`📝 Findings preview: "${findingsValue.substring(0, 100)}..."`);
      }
    }

    // Check for upload interfaces (should NOT be present for completed areas)
    const uploadArea = await page.$('[class*="border-dashed"]');
    console.log(`📤 Upload interface present: ${!!uploadArea}`);

    // Check completion status
    const completedBadge = await page.$('text="Completed"');
    console.log(`✅ Completed badge present: ${!!completedBadge}`);

    console.log('\n🔍 Debug complete. Check console output above for detailed data flow.');

  } catch (error) {
    console.error('❌ Error during debug:', error.message);
  } finally {
    // Keep browser open for manual inspection
    console.log('\n⏸️  Browser kept open for manual inspection. Close manually when done.');
    // await browser.close();
  }
}

debugDemoData().catch(console.error);