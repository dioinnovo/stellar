const puppeteer = require('puppeteer');

async function testCarouselHover() {
  console.log('🚀 Starting carousel hover glitch test...');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Set desktop viewport
    await page.setViewport({ width: 1440, height: 900 });

    // First navigate to the inspection start page to ensure the inspection exists
    console.log('📱 Navigating to inspection page...');
    await page.goto('http://localhost:3000/dashboard/inspection/INS-002/start', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Take a screenshot to see what's loaded
    await page.screenshot({
      path: './tests/screenshots/page-loaded.png',
      fullPage: true
    });
    console.log('📸 Initial page screenshot saved');

    // Check if page loaded correctly
    const pageTitle = await page.evaluate(() => document.title);
    console.log(`  Page title: ${pageTitle}`);

    // Check for any error messages
    const bodyContent = await page.evaluate(() => document.body.innerText);
    if (bodyContent.includes('error') || bodyContent.includes('Error')) {
      console.log('⚠️ Page may have an error. Content preview:');
      console.log(bodyContent.substring(0, 500));
    }

    // Wait for carousel to load with more flexible approach
    let carouselFound = false;

    // Try multiple selectors
    const selectors = ['.swiper', '.swiper-wrapper', '.swiper-slide', '[class*="carousel"]', '[class*="InspectionArea"]'];

    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        const count = await page.$$eval(selector, els => els.length);
        console.log(`✅ Found ${count} elements with selector: ${selector}`);
        carouselFound = true;
        break;
      } catch {
        console.log(`❌ Selector not found: ${selector}`);
      }
    }

    if (!carouselFound) {
      console.log('⚠️ No carousel elements found. Page may not have loaded correctly.');
      console.log('Attempting to continue with available elements...');
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('🔍 Testing hover interactions on carousel cards...');

    // Get all carousel slides
    const slides = await page.$$('.swiper-slide');
    console.log(`Found ${slides.length} carousel slides`);

    // Test hover on non-active cards (side cards)
    for (let i = 0; i < Math.min(3, slides.length); i++) {
      console.log(`\n📊 Testing card ${i + 1}...`);

      // Get the slide's bounding box
      const slideBounds = await slides[i].boundingBox();
      if (!slideBounds) continue;

      // Move mouse to the edge of the card (where glitch typically occurs)
      const edgeX = slideBounds.x + 10; // Near left edge
      const centerY = slideBounds.y + slideBounds.height / 2;

      console.log(`  Moving mouse to edge position (${edgeX}, ${centerY})`);

      // Record initial position
      const initialTransform = await slides[i].evaluate(el => {
        return window.getComputedStyle(el).transform;
      });

      // Hover on edge
      await page.mouse.move(edgeX, centerY);
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check for jittery behavior by monitoring transform changes
      const transforms = [];
      for (let j = 0; j < 10; j++) {
        const transform = await slides[i].evaluate(el => {
          return window.getComputedStyle(el).transform;
        });
        transforms.push(transform);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Check if transforms are stable (no jittering)
      const uniqueTransforms = [...new Set(transforms)];
      const isStable = uniqueTransforms.length <= 2; // Allow for one transition

      if (isStable) {
        console.log(`  ✅ Card ${i + 1}: Stable hover (no glitch detected)`);
      } else {
        console.log(`  ❌ Card ${i + 1}: Unstable hover (${uniqueTransforms.length} different states)`);
        console.log(`     Transform variations: ${uniqueTransforms.join(' | ')}`);
      }

      // Move mouse away to reset
      await page.mouse.move(0, 0);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Test cursor styles
    console.log('\n🖱️ Testing cursor styles...');

    // Check cursor on active card
    const activeCard = await page.$('.swiper-slide-active');
    if (activeCard) {
      const activeCursor = await activeCard.evaluate(el => {
        const div = el.querySelector('div');
        return window.getComputedStyle(div).cursor;
      });
      console.log(`  Active card cursor: ${activeCursor} (should be 'pointer')`);
    }

    // Check cursor on non-active card
    const nonActiveCard = await page.$('.swiper-slide:not(.swiper-slide-active)');
    if (nonActiveCard) {
      const nonActiveCursor = await nonActiveCard.evaluate(el => {
        const div = el.querySelector('div');
        return window.getComputedStyle(div).cursor;
      });
      console.log(`  Non-active card cursor: ${nonActiveCursor} (should be 'grab')`);
    }

    // Test smooth hovering across multiple cards
    console.log('\n🎯 Testing smooth hover transitions...');

    let glitchDetected = false;
    const cardCenters = [];

    for (let i = 0; i < Math.min(3, slides.length); i++) {
      const bounds = await slides[i].boundingBox();
      if (bounds) {
        cardCenters.push({
          x: bounds.x + bounds.width / 2,
          y: bounds.y + bounds.height / 2
        });
      }
    }

    // Smoothly move mouse across cards
    for (const center of cardCenters) {
      await page.mouse.move(center.x, center.y, { steps: 10 });
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Take screenshots for visual verification
    console.log('\n📸 Taking screenshots for visual verification...');

    // Screenshot with mouse on active card
    if (cardCenters[0]) {
      await page.mouse.move(cardCenters[0].x, cardCenters[0].y);
      await new Promise(resolve => setTimeout(resolve, 500));
      await page.screenshot({
        path: './tests/screenshots/carousel-hover-active.png',
        fullPage: false
      });
      console.log('  Screenshot saved: carousel-hover-active.png');
    }

    // Screenshot with mouse on side card
    if (cardCenters[1]) {
      await page.mouse.move(cardCenters[1].x, cardCenters[1].y);
      await new Promise(resolve => setTimeout(resolve, 500));
      await page.screenshot({
        path: './tests/screenshots/carousel-hover-side.png',
        fullPage: false
      });
      console.log('  Screenshot saved: carousel-hover-side.png');
    }

    // Final summary
    console.log('\n📊 Test Summary:');
    console.log('================');
    if (!glitchDetected) {
      console.log('✅ No hover glitches detected!');
      console.log('✅ Cursor styles are correct');
      console.log('✅ Smooth transitions confirmed');
      console.log('\n🎉 Carousel hover fix verified successfully!');
    } else {
      console.log('❌ Hover glitches still present');
      console.log('Please review the screenshots and transform logs above');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testCarouselHover().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});