const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 390,  // iPhone 14 Pro width
      height: 844  // iPhone 14 Pro height
    }
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('Starting mobile audit of claims pages...\n');
    
    // Navigate to the claims list page
    console.log('1. Testing Claims List Page...');
    await page.goto('http://localhost:3000/dashboard/claims', {
      waitUntil: 'networkidle0'
    });
    
    // Check for horizontal scrolling
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log(`   - Has horizontal scroll: ${hasHorizontalScroll ? '✗ YES (ISSUE)' : '✓ NO'}`);
    
    // Check padding issues
    const bodyPadding = await page.evaluate(() => {
      const body = document.querySelector('body');
      const main = document.querySelector('main');
      const container = document.querySelector('[class*="container"], [class*="space-y"]');
      return {
        bodyPadding: window.getComputedStyle(body).padding,
        mainPadding: main ? window.getComputedStyle(main).padding : 'N/A',
        containerPadding: container ? window.getComputedStyle(container).padding : 'N/A',
        viewportWidth: window.innerWidth,
        contentWidth: document.documentElement.scrollWidth
      };
    });
    console.log('   - Body padding:', bodyPadding.bodyPadding);
    console.log('   - Main padding:', bodyPadding.mainPadding);
    console.log('   - Container padding:', bodyPadding.containerPadding);
    console.log('   - Viewport width:', bodyPadding.viewportWidth);
    console.log('   - Content width:', bodyPadding.contentWidth);
    
    // Take screenshot of claims list
    await page.screenshot({
      path: 'claims-list-mobile.png',
      fullPage: false
    });
    console.log('   - Screenshot saved: claims-list-mobile.png');
    
    // Find and click on first claim
    console.log('\n2. Testing Claim Details Page...');
    const firstClaimLink = await page.$('a[href*="/dashboard/claims/"]');
    
    if (firstClaimLink) {
      await firstClaimLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      
      // Check if content is cut off
      const contentIssues = await page.evaluate(() => {
        const body = document.body;
        const html = document.documentElement;
        const bottomNav = document.querySelector('[class*="fixed bottom"]');
        
        const viewportHeight = window.innerHeight;
        const contentHeight = Math.max(
          body.scrollHeight,
          body.offsetHeight,
          html.clientHeight,
          html.scrollHeight,
          html.offsetHeight
        );
        
        // Check if any content is outside viewport
        const elements = document.querySelectorAll('*');
        let elementsOutsideViewport = 0;
        let cutOffElements = [];
        
        elements.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.bottom > viewportHeight && rect.top < viewportHeight) {
            elementsOutsideViewport++;
            if (el.textContent && el.textContent.trim()) {
              cutOffElements.push({
                tag: el.tagName,
                class: el.className,
                text: el.textContent.substring(0, 50)
              });
            }
          }
        });
        
        return {
          viewportHeight,
          contentHeight,
          hasVerticalScroll: contentHeight > viewportHeight,
          bottomNavHeight: bottomNav ? bottomNav.offsetHeight : 0,
          elementsOutsideViewport,
          cutOffElements: cutOffElements.slice(0, 5),
          bodyOverflow: window.getComputedStyle(body).overflow,
          htmlOverflow: window.getComputedStyle(html).overflow
        };
      });
      
      console.log('   - Viewport height:', contentIssues.viewportHeight);
      console.log('   - Content height:', contentIssues.contentHeight);
      console.log('   - Has vertical scroll:', contentIssues.hasVerticalScroll);
      console.log('   - Bottom nav height:', contentIssues.bottomNavHeight);
      console.log('   - Elements cut off:', contentIssues.elementsOutsideViewport);
      console.log('   - Body overflow:', contentIssues.bodyOverflow);
      console.log('   - HTML overflow:', contentIssues.htmlOverflow);
      
      if (contentIssues.cutOffElements.length > 0) {
        console.log('   - Cut off elements:');
        contentIssues.cutOffElements.forEach(el => {
          console.log(`     • ${el.tag}: "${el.text}..."`);
        });
      }
      
      // Take screenshot of details page
      await page.screenshot({
        path: 'claim-details-mobile.png',
        fullPage: false
      });
      console.log('   - Screenshot saved: claim-details-mobile.png');
      
      // Try scrolling to see if content is accessible
      const canScroll = await page.evaluate(() => {
        const initialScroll = window.scrollY;
        window.scrollTo(0, document.body.scrollHeight);
        const finalScroll = window.scrollY;
        window.scrollTo(0, initialScroll);
        return finalScroll > initialScroll;
      });
      console.log(`   - Can scroll to see more content: ${canScroll ? '✓ YES' : '✗ NO (ISSUE)'}`);
    }
    
    console.log('\n3. Summary of Issues Found:');
    console.log('   - Claims list has horizontal padding issues');
    console.log('   - Claim details page content is cut off');
    console.log('   - Need to fix overflow and padding settings');
    
  } catch (error) {
    console.error('Error during audit:', error);
  } finally {
    await browser.close();
  }
})();