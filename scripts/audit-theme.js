const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const pages = [
  { path: '/', name: 'Landing Page' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/dashboard/assistant', name: 'Assistant' },
  { path: '/dashboard/claims', name: 'Claims' },
  { path: '/dashboard/inspection', name: 'Inspections' },
  { path: '/dashboard/reports', name: 'Reports' },
  { path: '/presentation', name: 'Presentation' },
];

const checkContrast = (color1, color2) => {
  // Simple contrast ratio calculation
  const getLuminance = (rgb) => {
    const [r, g, b] = rgb.match(/\d+/g).map(Number);
    const sRGB = [r, g, b].map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

async function auditTheme() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 }
  });

  const results = { light: [], dark: [] };

  for (const pageInfo of pages) {
    console.log(`\nAuditing ${pageInfo.name}...`);

    // Test Light Mode
    const page = await browser.newPage();
    await page.goto(`http://localhost:3000${pageInfo.path}`, { waitUntil: 'networkidle2' });

    // Set light mode
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
    });
    await page.reload({ waitUntil: 'networkidle2' });

    const lightIssues = await page.evaluate(() => {
      const issues = [];
      const elements = document.querySelectorAll('*');

      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const bgColor = style.backgroundColor;
        const textColor = style.color;

        // Check for dark colors in light mode
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
          const rgb = bgColor.match(/\d+/g);
          if (rgb) {
            const brightness = (parseInt(rgb[0]) + parseInt(rgb[1]) + parseInt(rgb[2])) / 3;
            if (brightness < 50 && el.offsetWidth > 0 && el.offsetHeight > 0) {
              issues.push({
                selector: el.className || el.tagName,
                issue: 'Dark background in light mode',
                bgColor,
                textColor
              });
            }
          }
        }
      });

      return issues;
    });

    results.light.push({ page: pageInfo.name, issues: lightIssues });

    // Test Dark Mode
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    });
    await page.reload({ waitUntil: 'networkidle2' });

    const darkIssues = await page.evaluate(() => {
      const issues = [];
      const elements = document.querySelectorAll('*');

      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const bgColor = style.backgroundColor;
        const textColor = style.color;

        // Check for contrast issues in dark mode
        if (textColor && bgColor &&
            textColor !== 'rgba(0, 0, 0, 0)' &&
            bgColor !== 'rgba(0, 0, 0, 0)') {

          const textRgb = textColor.match(/\d+/g);
          const bgRgb = bgColor.match(/\d+/g);

          if (textRgb && bgRgb) {
            const textBrightness = (parseInt(textRgb[0]) + parseInt(textRgb[1]) + parseInt(textRgb[2])) / 3;
            const bgBrightness = (parseInt(bgRgb[0]) + parseInt(bgRgb[1]) + parseInt(bgRgb[2])) / 3;

            // Check if text is too dark on dark background
            if (bgBrightness < 100 && textBrightness < 150 && el.offsetWidth > 0 && el.offsetHeight > 0) {
              issues.push({
                selector: el.className || el.tagName,
                issue: 'Poor contrast in dark mode',
                bgColor,
                textColor,
                textBrightness,
                bgBrightness
              });
            }

            // Check if background is too light in dark mode
            if (bgBrightness > 200 && el.offsetWidth > 0 && el.offsetHeight > 0) {
              issues.push({
                selector: el.className || el.tagName,
                issue: 'Light background in dark mode',
                bgColor,
                textColor
              });
            }
          }
        }
      });

      return issues.slice(0, 10); // Limit to first 10 issues per page
    });

    results.dark.push({ page: pageInfo.name, issues: darkIssues });

    await page.close();
  }

  await browser.close();

  // Generate report
  console.log('\n=== THEME AUDIT REPORT ===\n');

  console.log('LIGHT MODE ISSUES:');
  results.light.forEach(pageResult => {
    if (pageResult.issues.length > 0) {
      console.log(`\n${pageResult.page}:`);
      pageResult.issues.forEach(issue => {
        console.log(`  - ${issue.selector}: ${issue.issue}`);
      });
    }
  });

  console.log('\n\nDARK MODE ISSUES:');
  results.dark.forEach(pageResult => {
    if (pageResult.issues.length > 0) {
      console.log(`\n${pageResult.page}:`);
      pageResult.issues.forEach(issue => {
        console.log(`  - ${issue.selector}: ${issue.issue}`);
        if (issue.textBrightness !== undefined) {
          console.log(`    Text brightness: ${issue.textBrightness.toFixed(0)}, BG brightness: ${issue.bgBrightness.toFixed(0)}`);
        }
      });
    }
  });

  // Save to file
  fs.writeFileSync(
    path.join(__dirname, 'theme-audit-report.json'),
    JSON.stringify(results, null, 2)
  );

  console.log('\n\nFull report saved to scripts/theme-audit-report.json');

  return results;
}

auditTheme().catch(console.error);