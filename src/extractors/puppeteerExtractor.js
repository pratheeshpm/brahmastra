const puppeteer = require('puppeteer');

// Function to validate if content is actually transcript text vs JavaScript/HTML
function isValidTranscriptContent(text) {
  if (!text || text.length < 10) return false;
  
  // Check for common JavaScript patterns that indicate we got the wrong content
  const jsPatterns = [
    /window\./,
    /function\s*\(/,
    /\{.*\}/,
    /console\./,
    /document\./,
    /var\s+\w+\s*=/,
    /const\s+\w+\s*=/,
    /let\s+\w+\s*=/,
    /<script/i,
    /<\/script>/i,
    /ytcfg\.set/,
    /\)\(\)/,
    /\.prototype\./
  ];
  
  // If more than 2 JS patterns match, it's likely JavaScript code
  const jsMatches = jsPatterns.filter(pattern => pattern.test(text)).length;
  if (jsMatches > 2) {
    console.log(`Content appears to be JavaScript (${jsMatches} patterns matched)`);
    return false;
  }
  
  // Check if it's mostly readable text (transcript should have spaces and normal words)
  const wordsCount = text.split(/\s+/).length;
  const readableWordsCount = text.split(/\s+/).filter(word => 
    /^[a-zA-Z0-9',.-]+$/.test(word) && word.length > 1
  ).length;
  
  const readabilityRatio = readableWordsCount / wordsCount;
  if (readabilityRatio < 0.5) {
    console.log(`Content has low readability ratio: ${readabilityRatio}`);
    return false;
  }
  
  return true;
}

async function extractWithPuppeteer(videoId) {
  let browser = null;
  
  try {
    console.log(`Attempting puppeteer for video: ${videoId}`);
    browser = await puppeteer.launch({ 
      headless: "new",
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    
    const page = await browser.newPage();
    
    // Enhanced user agent and headers to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    });
    
    // Navigate to video page
    console.log(`Loading YouTube page for video: ${videoId}`);
    await page.goto(`https://www.youtube.com/watch?v=${videoId}`, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Wait for page to load and try multiple transcript button selectors
    await page.waitForTimeout(3000);
    
    const transcriptButtonSelectors = [
      '[aria-label*="transcript" i]',
      '[aria-label*="Show transcript" i]',
      'button[aria-label*="transcript" i]',
      '.ytd-video-secondary-info-renderer button[aria-label*="transcript" i]',
      '#show-hide-transcript',
      'yt-button-renderer[aria-label*="transcript" i]'
    ];
    
    let transcriptButtonFound = false;
    for (const selector of transcriptButtonSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        console.log(`Found transcript button with selector: ${selector}`);
        await page.click(selector);
        transcriptButtonFound = true;
        break;
      } catch (error) {
        console.log(`Transcript button selector failed: ${selector}`);
        continue;
      }
    }
    
    if (!transcriptButtonFound) {
      return { success: false, error: 'transcript_button_not_found' };
    }
    
    // Wait for transcript content to load with multiple selectors
    await page.waitForTimeout(2000);
    
    const transcriptContentSelectors = [
      '.ytd-transcript-segment-renderer',
      '.ytd-transcript-segment-list-renderer .segment-text',
      '.transcript-segment',
      '[data-testid="transcript-segment"]',
      '.ytd-transcript-renderer .segment'
    ];
    
    let transcriptElements = [];
    for (const selector of transcriptContentSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        console.log(`Found transcript content with selector: ${selector}`);
        
        transcriptElements = await page.$$eval(selector, 
          elements => elements.map(el => {
            // Get text content and clean it
            let text = el.textContent || el.innerText || '';
            text = text.trim();
            
            // Remove timestamp patterns like "0:00", "1:23", etc.
            text = text.replace(/^\d+:\d+\s*/, '');
            text = text.replace(/\s*\d+:\d+\s*$/, '');
            
            return text;
          }).filter(text => text.length > 0)
        );
        
        if (transcriptElements.length > 0) break;
      } catch (error) {
        console.log(`Transcript content selector failed: ${selector}`);
        continue;
      }
    }
    
    if (transcriptElements.length === 0) {
      return { success: false, error: 'no_transcript_elements_found' };
    }
    
    const cleanText = transcriptElements.join(' ').trim();
    
    // Validate that we got actual transcript content, not JavaScript
    if (!isValidTranscriptContent(cleanText)) {
      console.log('Extracted content appears to be JavaScript/HTML, not transcript');
      return { success: false, error: 'invalid_content_extracted' };
    }
    
    if (cleanText.length > 50) { // Reasonable minimum length for a transcript
      console.log(`Successfully extracted ${cleanText.length} characters of transcript`);
      return {
        success: true,
        method: 'puppeteer',
        text: cleanText,
        transcript: transcriptElements.map(text => ({ text }))
      };
    } else {
      return { success: false, error: 'transcript_too_short' };
    }
    
  } catch (error) {
    console.log(`Puppeteer error: ${error.message}`);
    
    if (error.message.includes('Target closed') || error.message.includes('Protocol error')) {
      return { success: false, error: 'browser_crashed' };
    } else if (error.message.includes('timeout')) {
      return { success: false, error: 'timeout' };
    } else if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
      return { success: false, error: 'rate_limited' };
    } else {
      return { success: false, error: 'extraction_failed' };
    }
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.log('Error closing browser:', closeError.message);
      }
    }
  }
}

module.exports = { extractWithPuppeteer }; 