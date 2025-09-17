const puppeteer = require('puppeteer');

async function simpleDebug() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1200, height: 800 }
  });

  const page = await browser.newPage();

  // Listen to ALL console messages
  page.on('console', msg => {
    console.log('BROWSER:', msg.text());
  });

  try {
    console.log('🚀 Testing Master Bedroom area...');

    await page.goto('http://localhost:3000/dashboard/inspection/INS-002/area/interior-bedrooms', {
      waitUntil: 'networkidle0'
    });

    // Wait a bit for React to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check what we actually see on the page
    const pageTitle = await page.title();
    console.log('📄 Page title:', pageTitle);

    // Look for photos
    const photos = await page.$$eval('img', imgs =>
      imgs.filter(img => img.src && img.src.includes('unsplash')).length
    );
    console.log('📸 Unsplash photos found:', photos);

    // Look for any upload interface
    const uploadText = await page.$eval('body', body =>
      body.textContent.includes('Upload Photos') ? 'YES' : 'NO'
    );
    console.log('📤 Upload interface visible:', uploadText);

    // Look for completed status
    const completedText = await page.$eval('body', body =>
      body.textContent.includes('Completed') ? 'YES' : 'NO'
    );
    console.log('✅ Completed status visible:', completedText);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

simpleDebug().catch(console.error);