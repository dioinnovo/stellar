const puppeteer = require('puppeteer');

async function checkPhotosSimple() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1200, height: 800 }
  });

  const page = await browser.newPage();

  try {
    console.log('🚀 Checking photos in Master Bedroom...');

    await page.goto('http://localhost:3000/dashboard/inspection/INS-002/area/interior-bedrooms', {
      waitUntil: 'networkidle0'
    });

    // Wait for the page to settle
    await new Promise(resolve => setTimeout(resolve, 4000));

    // Simple check - count the inspection photos
    const photoCount = await page.evaluate(() => {
      const inspectionImages = document.querySelectorAll('img[alt="Inspection"]');
      return inspectionImages.length;
    });

    console.log('📸 Found', photoCount, 'inspection photos');

    // Check if we see the "Uploaded Photos" header
    const hasPhotoHeader = await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll('h3'));
      return headers.some(h => h.textContent.includes('Uploaded Photos'));
    });

    console.log('📋 "Uploaded Photos" header present:', hasPhotoHeader);

    // If no photos, check what's actually on the page
    if (photoCount === 0) {
      const pageContent = await page.evaluate(() => {
        return {
          hasUploadButton: !!document.querySelector('button[class*="Upload"]'),
          hasDragDrop: !!document.querySelector('[class*="border-dashed"]'),
          bodyTextSnippet: document.body.textContent.substring(0, 500)
        };
      });
      console.log('❌ No photos found. Page content check:', pageContent);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    console.log('\n⏸️  Keeping browser open for inspection...');
    // await browser.close();
  }
}

checkPhotosSimple().catch(console.error);