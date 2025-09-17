const puppeteer = require('puppeteer');

async function debugPhotoRendering() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1200, height: 800 }
  });

  const page = await browser.newPage();

  // Listen to console messages
  page.on('console', msg => {
    console.log('BROWSER:', msg.text());
  });

  try {
    console.log('🚀 Testing photo rendering in Master Bedroom...');

    await page.goto('http://localhost:3000/dashboard/inspection/INS-002/area/interior-bedrooms', {
      waitUntil: 'networkidle0',
      timeout: 10000
    });

    // Wait for React to fully load
    await page.waitForTimeout(3000);

    // Check the photo section specifically
    const photoSection = await page.evaluate(() => {
      // Look for the photo grid section
      const photoHeaders = Array.from(document.querySelectorAll('h3')).filter(h =>
        h.textContent.includes('Uploaded Photos')
      );

      const photoGrids = document.querySelectorAll('[class*="grid"]');
      const imgElements = document.querySelectorAll('img[alt="Inspection"]');

      return {
        photoHeadersCount: photoHeaders.length,
        photoHeaderText: photoHeaders[0]?.textContent || 'NO HEADER',
        photoGridsCount: photoGrids.length,
        inspectionImagesCount: imgElements.length,
        allImagesCount: document.querySelectorAll('img').length,
        hasPhotoSection: photoHeaders.length > 0
      };
    });

    console.log('📸 Photo section analysis:', photoSection);

    // Check if areaData has mediaFiles by looking at the DOM structure
    const hasUploadInterface = await page.evaluate(() => {
      const uploadAreas = document.querySelectorAll('[class*="border-dashed"]');
      const uploadButtons = Array.from(document.querySelectorAll('button')).filter(btn =>
        btn.textContent.includes('Upload Photos')
      );

      return {
        uploadAreasCount: uploadAreas.length,
        uploadButtonsCount: uploadButtons.length,
        hasUploadInterface: uploadAreas.length > 0 || uploadButtons.length > 0
      };
    });

    console.log('📤 Upload interface check:', hasUploadInterface);

    // Check if there are any photos with unsplash URLs
    const unsplashCheck = await page.evaluate(() => {
      const allImages = Array.from(document.querySelectorAll('img'));
      const unsplashImages = allImages.filter(img => img.src.includes('unsplash'));

      return {
        allImagesDetails: allImages.map(img => ({
          src: img.src,
          alt: img.alt,
          className: img.className
        })),
        unsplashImagesCount: unsplashImages.length,
        unsplashImagesSrcs: unsplashImages.map(img => img.src)
      };
    });

    console.log('🖼️ Image details:', unsplashCheck);

    console.log('\n✅ Photo rendering debug complete');

  } catch (error) {
    console.error('❌ Error during debug:', error.message);
  } finally {
    // Keep browser open for manual inspection
    console.log('\n⏸️  Browser kept open for manual inspection. Close manually when done.');
    // await browser.close();
  }
}

debugPhotoRendering().catch(console.error);