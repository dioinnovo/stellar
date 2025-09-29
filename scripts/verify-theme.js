const puppeteer = require('puppeteer');

const pages = [
  '/',
  '/dashboard',
  '/dashboard/assistant',
  '/dashboard/claims',
  '/dashboard/inspection',
];

async function verifyTheme() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  console.log('=== THEME VERIFICATION REPORT ===\n');

  for (const path of pages) {
    try {
      const page = await browser.newPage();

      // Test Dark Mode
      await page.goto(`http://localhost:3000${path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });

      // Set dark mode
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
      });

      // Check for dark mode classes
      const hasDarkClasses = await page.evaluate(() => {
        const elements = document.querySelectorAll('[class*="dark:"]');
        return elements.length;
      });

      // Check background color
      const bgColor = await page.evaluate(() => {
        const body = document.querySelector('body');
        return window.getComputedStyle(body).backgroundColor;
      });

      // Check text contrast
      const textColors = await page.evaluate(() => {
        const texts = document.querySelectorAll('p, h1, h2, h3, span');
        const colors = [];
        texts.forEach(el => {
          const color = window.getComputedStyle(el).color;
          if (color && el.offsetWidth > 0) {
            colors.push(color);
          }
        });
        return colors.slice(0, 5);
      });

      console.log(`✓ ${path}`);
      console.log(`  Dark classes found: ${hasDarkClasses}`);
      console.log(`  Background: ${bgColor}`);
      console.log(`  Sample text colors: ${textColors.slice(0, 3).join(', ')}`);
      console.log('');

      await page.close();
    } catch (error) {
      console.log(`✗ ${path} - Error: ${error.message}`);
    }
  }

  await browser.close();
  console.log('Verification complete!');
}

verifyTheme().catch(console.error);