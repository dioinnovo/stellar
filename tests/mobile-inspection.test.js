const puppeteer = require('puppeteer');

async function testMobileInspectionPage() {
  console.log('🚀 Starting mobile inspection page test...');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for headless testing
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Test different mobile viewports
    const devices = [
      { name: 'iPhone 12', viewport: { width: 390, height: 844 } },
      { name: 'iPhone SE', viewport: { width: 375, height: 667 } },
      { name: 'Samsung Galaxy S21', viewport: { width: 360, height: 800 } },
      { name: 'Tablet', viewport: { width: 768, height: 1024 } }
    ];
    
    for (const device of devices) {
      console.log(`📱 Testing ${device.name} (${device.viewport.width}x${device.viewport.height})`);
      
      await page.setViewport(device.viewport);
      await page.goto('http://localhost:3000/dashboard/inspection/INS-001/start', { 
        waitUntil: 'networkidle2' 
      });
      
      // Wait for page to load
      await page.waitForSelector('[data-testid="claim-information"]', { timeout: 10000 });
      
      // Test: Check if header is properly responsive
      const headerHeight = await page.evaluate(() => {
        const header = document.querySelector('header, .bg-white.border-b');
        return header ? header.offsetHeight : 0;
      });
      console.log(`  ✓ Header height: ${headerHeight}px`);
      
      // Test: Check content padding/margins
      const contentPadding = await page.evaluate(() => {
        const container = document.querySelector('.max-w-7xl.mx-auto');
        const style = window.getComputedStyle(container);
        return {
          paddingLeft: style.paddingLeft,
          paddingRight: style.paddingRight,
          paddingTop: style.paddingTop,
          paddingBottom: style.paddingBottom
        };
      });
      console.log(`  ✓ Container padding: ${JSON.stringify(contentPadding)}`);
      
      // Test: Check if content is squeezed (width utilization)
      const contentWidth = await page.evaluate(() => {
        const container = document.querySelector('.max-w-7xl.mx-auto');
        const viewport = window.innerWidth;
        const containerWidth = container ? container.offsetWidth : 0;
        return {
          viewport: viewport,
          container: containerWidth,
          utilization: Math.round((containerWidth / viewport) * 100)
        };
      });
      console.log(`  ✓ Width utilization: ${contentWidth.utilization}% (${contentWidth.container}px / ${contentWidth.viewport}px)`);
      
      // Test: Check if cards are properly spaced
      const cardSpacing = await page.evaluate(() => {
        const cards = document.querySelectorAll('.bg-white.rounded-xl, .bg-white.rounded-2xl');
        if (cards.length < 2) return 0;
        
        const rect1 = cards[0].getBoundingClientRect();
        const rect2 = cards[1].getBoundingClientRect();
        return Math.abs(rect2.top - rect1.bottom);
      });
      console.log(`  ✓ Card spacing: ${cardSpacing}px`);
      
      // Test: Check if text is readable (font sizes)
      const textSizes = await page.evaluate(() => {
        const elements = {
          title: document.querySelector('h1'),
          cardTitle: document.querySelector('h2'),
          bodyText: document.querySelector('.text-sm')
        };
        
        const sizes = {};
        for (const [key, element] of Object.entries(elements)) {
          if (element) {
            const style = window.getComputedStyle(element);
            sizes[key] = style.fontSize;
          }
        }
        return sizes;
      });
      console.log(`  ✓ Text sizes: ${JSON.stringify(textSizes)}`);
      
      // Test: Check if buttons are properly sized for touch
      const buttonSizes = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        const sizes = [];
        buttons.forEach((btn, index) => {
          const rect = btn.getBoundingClientRect();
          if (rect.height > 0) {
            sizes.push({
              index,
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              touchFriendly: rect.height >= 44 // Apple's recommended minimum
            });
          }
        });
        return sizes;
      });
      console.log(`  ✓ Button sizes (should be ≥44px height for touch):`, buttonSizes);
      
      // Test: Check for horizontal scrolling (should be none)
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });
      console.log(`  ${hasHorizontalScroll ? '❌' : '✓'} Horizontal scrolling: ${hasHorizontalScroll ? 'YES (BAD)' : 'NO (GOOD)'}`);
      
      // Screenshot for visual verification
      await page.screenshot({ 
        path: `./tests/screenshots/mobile-${device.name.toLowerCase().replace(/\s+/g, '-')}-${device.viewport.width}x${device.viewport.height}.png`,
        fullPage: true 
      });
      console.log(`  📸 Screenshot saved for ${device.name}`);
      
      console.log(`  ✅ ${device.name} test completed\n`);
    }
    
    console.log('🎉 All mobile tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testMobileInspectionPage().catch(console.error);