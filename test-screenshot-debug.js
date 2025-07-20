const puppeteer = require('puppeteer');

async function testScreenshotDebug() {
  console.log('🔍 Starting screenshot debug test...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const page = await browser.newPage();
  
  // Listen to console messages
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('🔍') || text.includes('ChatInput') || text.includes('screenshot') || text.includes('useEffect')) {
      console.log('BROWSER:', msg.type().toUpperCase(), text);
    }
  });
  
  // Listen to page errors
  page.on('pageerror', error => {
    console.error('PAGE ERROR:', error.message);
  });
  
  try {
    console.log('🌐 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    console.log('⏱️ Waiting 3 seconds for page to fully load...');
    await page.waitForTimeout(3000);
    
    console.log('📸 Taking screenshot via API...');
    
    // Take screenshot using API
    const response = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/screenshot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({})
        });
        return await response.json();
      } catch (error) {
        console.error('API Error:', error);
        return { error: error.message };
      }
    });
    
    console.log('📸 Screenshot API response:', response);
    
    console.log('⏱️ Waiting 10 seconds to observe browser console logs...');
    await page.waitForTimeout(10000);
    
    console.log('✅ Debug test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  await browser.close();
}

testScreenshotDebug().catch(console.error); 