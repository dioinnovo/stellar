const puppeteer = require('puppeteer');

async function focusedDebug() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Capture console logs properly
  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    logs.push(text);
    if (text.includes('🔄') || text.includes('🔍') || text.includes('🎯') || text.includes('❌')) {
      console.log('CONSOLE:', text);
    }
  });

  try {
    await page.goto('http://localhost:3000/dashboard/inspection/INS-002/area/interior-bedrooms');
    await new Promise(resolve => setTimeout(resolve, 4000)); // Wait for all React effects

    // Get the actual inspection data state
    const inspectionState = await page.evaluate(() => {
      // Try to access the inspection data from window or React DevTools
      return {
        pathname: window.location.pathname,
        hasReactDevTools: !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__,
        timestamp: new Date().toISOString()
      };
    });

    console.log('🌐 Page state:', inspectionState);

    // Check if the data is actually loaded by looking at DOM elements
    const hasPhotos = await page.evaluate(() => {
      const photoGrid = document.querySelector('[class*="grid"]');
      const images = document.querySelectorAll('img[src*="unsplash"]');
      return {
        photoGridExists: !!photoGrid,
        unsplashImagesCount: images.length,
        allImagesCount: document.querySelectorAll('img').length
      };
    });

    console.log('📸 Photo state:', hasPhotos);

    // Check for demo data in localStorage
    const storageData = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const inspectionKeys = keys.filter(k => k.includes('inspection') || k.includes('INS-002'));
      return {
        allKeys: keys,
        inspectionKeys,
        hasINS002Data: !!localStorage.getItem('inspection-INS-002-data')
      };
    });

    console.log('💾 Storage state:', storageData);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    console.log('\n📝 All console logs:');
    logs.forEach(log => console.log('  ', log));
    await browser.close();
  }
}

focusedDebug();