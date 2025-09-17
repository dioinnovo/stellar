const puppeteer = require('puppeteer');

async function checkRenderLogs() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1200, height: 800 }
  });

  const page = await browser.newPage();

  // Collect ALL console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(text);
    console.log('BROWSER:', text);
  });

  try {
    console.log('🚀 Checking render logs...');

    await page.goto('http://localhost:3000/dashboard/inspection/INS-002/area/interior-bedrooms', {
      waitUntil: 'networkidle0'
    });

    // Wait for all React effects to run
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('\n📋 All console messages:');
    consoleMessages.forEach((msg, i) => {
      console.log(`${i + 1}. ${msg}`);
    });

    // Look specifically for render check messages
    const renderChecks = consoleMessages.filter(msg => msg.includes('🖼️ RENDER CHECK'));
    console.log('\n🔍 Render check messages:', renderChecks.length);
    renderChecks.forEach(msg => console.log('  -', msg));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

checkRenderLogs().catch(console.error);