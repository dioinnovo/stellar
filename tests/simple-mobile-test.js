const puppeteer = require('puppeteer');

async function simpleMobileTest() {
  console.log('🚀 Starting simple mobile test for inspection start page...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Test mobile viewport
    await page.setViewport({ width: 375, height: 667 }); // iPhone SE size
    
    console.log('📱 Navigating to inspection start page...');
    await page.goto('http://localhost:3000/dashboard/inspection/INS-001/start', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    // Wait a bit for content to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Take screenshot
    await page.screenshot({ 
      path: './tests/screenshots/mobile-inspection-start.png',
      fullPage: true 
    });
    console.log('📸 Mobile screenshot saved: ./tests/screenshots/mobile-inspection-start.png');
    
    // Check basic mobile optimizations
    const mobileChecks = await page.evaluate(() => {
      const container = document.querySelector('.max-w-7xl');
      const header = document.querySelector('.bg-white.border-b');
      
      return {
        hasContainer: !!container,
        hasHeader: !!header,
        containerWidth: container ? container.offsetWidth : 0,
        headerHeight: header ? header.offsetHeight : 0,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        hasHorizontalScroll: document.body.scrollWidth > window.innerWidth
      };
    });
    
    console.log('✅ Mobile optimization check results:');
    console.log(`   • Container found: ${mobileChecks.hasContainer}`);
    console.log(`   • Header found: ${mobileChecks.hasHeader}`);
    console.log(`   • Container width: ${mobileChecks.containerWidth}px`);
    console.log(`   • Header height: ${mobileChecks.headerHeight}px`);
    console.log(`   • Viewport: ${mobileChecks.viewport.width}x${mobileChecks.viewport.height}`);
    console.log(`   • Has horizontal scroll: ${mobileChecks.hasHorizontalScroll ? '❌ YES (BAD)' : '✅ NO (GOOD)'}`);
    
    // Also test tablet size
    await page.setViewport({ width: 768, height: 1024 }); // iPad size
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await page.screenshot({ 
      path: './tests/screenshots/tablet-inspection-start.png',
      fullPage: true 
    });
    console.log('📸 Tablet screenshot saved: ./tests/screenshots/tablet-inspection-start.png');
    
    console.log('🎉 Mobile test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
simpleMobileTest().catch(console.error);