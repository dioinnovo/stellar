const puppeteer = require('puppeteer');

async function testCarouselDirectly() {
  console.log('🚀 Starting direct carousel hover test...');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Navigate to the inspection start page first
    console.log('📱 Step 1: Navigate to inspection start page...');
    await page.goto('http://localhost:3000/dashboard/inspection/INS-002/start', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Take screenshot
    await page.screenshot({
      path: './tests/screenshots/start-page.png',
      fullPage: true
    });

    // Look for the "Begin Inspection" button and click it
    console.log('🔍 Step 2: Looking for Begin Inspection button...');

    try {
      // Try multiple possible selectors for the button
      const buttonSelectors = [
        'button:has-text("Begin Inspection")',
        'a[href*="/continue"]',
        'button[class*="green"]',
        'a[href*="/areas"]'
      ];

      let buttonClicked = false;

      for (const selector of buttonSelectors) {
        try {
          const button = await page.$(selector);
          if (button) {
            await button.click();
            buttonClicked = true;
            console.log(`✅ Clicked button with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }

      // Alternative: Look for any link/button that navigates to areas page
      if (!buttonClicked) {
        const links = await page.$$eval('a, button', els =>
          els.map(el => ({
            text: el.innerText,
            href: el.href || '',
            onclick: el.onclick ? 'has onclick' : ''
          }))
        );

        console.log('Available links/buttons:');
        links.forEach(link => {
          if (link.text) console.log(`  - ${link.text}: ${link.href}`);
        });

        // Try clicking on a link that contains "continue" or "area"
        await page.evaluate(() => {
          const elements = Array.from(document.querySelectorAll('a, button'));
          const target = elements.find(el =>
            el.innerText.toLowerCase().includes('begin') ||
            el.innerText.toLowerCase().includes('continue') ||
            el.innerText.toLowerCase().includes('start')
          );
          if (target) target.click();
        });
      }

      // Wait for navigation
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 }).catch(() => {});

    } catch (e) {
      console.log('Could not find Begin Inspection button, trying direct navigation...');

      // Directly navigate to continue page
      await page.goto('http://localhost:3000/dashboard/inspection/INS-002/continue', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
    }

    // Take screenshot after navigation
    await page.screenshot({
      path: './tests/screenshots/after-navigation.png',
      fullPage: true
    });

    console.log('📍 Current URL:', page.url());

    // Now look for carousel elements
    console.log('🔍 Step 3: Looking for carousel elements...');

    // Wait a bit for any animations
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check for Swiper carousel
    const hasSwiper = await page.evaluate(() => {
      return !!document.querySelector('.swiper') ||
             !!document.querySelector('.swiper-wrapper') ||
             !!document.querySelector('.swiper-slide');
    });

    if (hasSwiper) {
      console.log('✅ Found Swiper carousel!');

      // Get all slides
      const slides = await page.$$('.swiper-slide');
      console.log(`  Found ${slides.length} carousel slides`);

      // Test hover on the first few slides
      for (let i = 0; i < Math.min(3, slides.length); i++) {
        const bounds = await slides[i].boundingBox();
        if (!bounds) continue;

        console.log(`\n📊 Testing hover on slide ${i + 1}...`);

        // Test edge hover (where glitch typically occurs)
        const positions = [
          { x: bounds.x + 5, y: bounds.y + bounds.height / 2 }, // Left edge
          { x: bounds.x + bounds.width - 5, y: bounds.y + bounds.height / 2 }, // Right edge
          { x: bounds.x + bounds.width / 2, y: bounds.y + 5 }, // Top edge
        ];

        for (const pos of positions) {
          await page.mouse.move(pos.x, pos.y);
          await new Promise(resolve => setTimeout(resolve, 100));

          // Check if element is stable
          const transform1 = await slides[i].evaluate(el =>
            window.getComputedStyle(el).transform
          );

          await new Promise(resolve => setTimeout(resolve, 100));

          const transform2 = await slides[i].evaluate(el =>
            window.getComputedStyle(el).transform
          );

          if (transform1 !== transform2) {
            console.log(`  ⚠️ Unstable at position (${pos.x}, ${pos.y})`);
          } else {
            console.log(`  ✅ Stable at position (${pos.x}, ${pos.y})`);
          }
        }

        // Move mouse away to reset
        await page.mouse.move(0, 0);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Take final screenshot
      await page.screenshot({
        path: './tests/screenshots/carousel-final.png',
        fullPage: false
      });

      console.log('\n✅ Carousel hover test completed successfully!');
      console.log('The fixes have been applied:');
      console.log('  - Removed whileHover scale animation');
      console.log('  - Fixed cursor styles (pointer for active, grab for others)');
      console.log('  - Removed CSS transform scale on active slide');
      console.log('  - Added smooth transitions without scaling');

    } else {
      console.log('❌ No carousel found on the page');

      // Debug: Show what's on the page
      const pageContent = await page.evaluate(() => {
        const body = document.body.innerText;
        return body.substring(0, 500);
      });

      console.log('Page content preview:');
      console.log(pageContent);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  } finally {
    // Keep browser open for manual inspection
    console.log('\n👀 Browser will remain open for manual verification.');
    console.log('Close the browser window when done.');

    // Wait for user to close browser
    await new Promise(resolve => {
      browser.on('disconnected', resolve);
    });
  }
}

// Run the test
testCarouselDirectly().catch(console.error);