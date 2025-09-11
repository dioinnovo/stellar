const puppeteer = require('puppeteer');

async function auditConsole() {
  console.log('🔍 Starting browser console audit...');
  
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Track console messages
  const consoleMessages = [];
  const errorPatterns = new Map();
  
  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();
    
    // Store all console messages
    consoleMessages.push({
      type,
      text,
      timestamp: new Date().toISOString()
    });
    
    // Track error patterns
    if (type === 'error' || type === 'warning') {
      // Extract key parts of the error message
      const key = text.split('\n')[0].substring(0, 100);
      if (errorPatterns.has(key)) {
        errorPatterns.set(key, errorPatterns.get(key) + 1);
      } else {
        errorPatterns.set(key, 1);
      }
    }
  });
  
  // Track page errors
  page.on('pageerror', (error) => {
    console.log('❌ Page Error:', error.message);
  });
  
  try {
    console.log('📡 Navigating to localhost:3000/claim-assessment...');
    await page.goto('http://localhost:3000/claim-assessment', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    
    console.log('⏳ Waiting 10 seconds to collect console messages...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Interact with the page to trigger more potential errors
    console.log('🖱️  Simulating user interactions...');
    
    // Click on property type
    try {
      await page.click('button:has-text("Residential")');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (e) {
      // Try alternative selector
      await page.evaluate(() => {
        const button = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Residential'));
        if (button) button.click();
      });
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Type in address field
    try {
      await page.type('input[placeholder*="address"]', '123 Main St');
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (e) {
      console.log('Could not interact with address field');
    }
    
    console.log('📊 Analyzing console messages...');
    
    // Analyze the results
    console.log('\n=== CONSOLE AUDIT RESULTS ===');
    console.log(`Total console messages: ${consoleMessages.length}`);
    
    // Count by type
    const typeCounts = {};
    consoleMessages.forEach(msg => {
      typeCounts[msg.type] = (typeCounts[msg.type] || 0) + 1;
    });
    
    console.log('\n📈 Message Types:');
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
    // Show most frequent errors
    console.log('\n🔥 Most Frequent Issues:');
    const sortedErrors = Array.from(errorPatterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    sortedErrors.forEach(([pattern, count]) => {
      if (count > 1) {
        console.log(`  ${count}x: ${pattern}`);
      }
    });
    
    // Look for recursive patterns
    console.log('\n🔄 Potential Recursive Issues:');
    const recursivePatterns = sortedErrors.filter(([pattern, count]) => count > 50);
    
    if (recursivePatterns.length > 0) {
      recursivePatterns.forEach(([pattern, count]) => {
        console.log(`  🚨 RECURSIVE (${count}x): ${pattern}`);
      });
    } else {
      console.log('  No clear recursive patterns detected in top errors');
    }
    
    // Show recent error samples
    console.log('\n📝 Recent Error Samples:');
    const recentErrors = consoleMessages
      .filter(msg => msg.type === 'error' || msg.type === 'warning')
      .slice(-5);
    
    recentErrors.forEach((msg, index) => {
      console.log(`  ${index + 1}. [${msg.type}] ${msg.text.substring(0, 200)}...`);
    });
    
    // Export full log for detailed analysis
    require('fs').writeFileSync(
      'console-audit-full.json',
      JSON.stringify({
        summary: {
          totalMessages: consoleMessages.length,
          typeCounts,
          topErrors: sortedErrors,
          recursivePatterns
        },
        allMessages: consoleMessages
      }, null, 2)
    );
    
    console.log('\n✅ Full audit saved to console-audit-full.json');
    
  } catch (error) {
    console.error('❌ Audit failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the audit
auditConsole().catch(console.error);