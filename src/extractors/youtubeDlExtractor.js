const youtubedl = require('youtube-dl-exec');

async function processSubtitleData(info) {
  console.log('Processing subtitle data...');
  
  // For now, let's just return the available languages without downloading
  // We can enhance this later to actually download and parse the subtitles
  
  let availableLanguages = [];
  let subtitleType = '';
  
  if (info.subtitles && Object.keys(info.subtitles).length > 0) {
    availableLanguages = Object.keys(info.subtitles);
    subtitleType = 'manual_subtitles';
    console.log(`Found manual subtitles in languages: ${availableLanguages.join(', ')}`);
  } else if (info.automatic_captions && Object.keys(info.automatic_captions).length > 0) {
    availableLanguages = Object.keys(info.automatic_captions);
    subtitleType = 'automatic_captions';
    console.log(`Found automatic captions in languages: ${availableLanguages.slice(0, 10).join(', ')}... (${availableLanguages.length} total)`);
  }

  // Try to get English subtitles if available
  const preferredLangs = ['en', 'en-US', 'en-GB'];
  let selectedLang = null;
  
  for (const lang of preferredLangs) {
    if (availableLanguages.includes(lang)) {
      selectedLang = lang;
      break;
    }
  }
  
  if (!selectedLang && availableLanguages.length > 0) {
    selectedLang = availableLanguages[0];
  }

  if (selectedLang) {
    try {
      // Try to download and parse the subtitle
      const subtitleSource = info.subtitles?.[selectedLang] || info.automatic_captions?.[selectedLang];
      if (subtitleSource && subtitleSource.length > 0) {
        // Find a suitable format (prefer vtt or srt)
        let selectedSub = subtitleSource.find(sub => sub.ext === 'vtt') || 
                         subtitleSource.find(sub => sub.ext === 'srv3') ||
                         subtitleSource[0];
        
        console.log(`Downloading ${selectedLang} subtitles from: ${selectedSub.url}`);
        
        const axios = require('axios');
        const response = await axios.get(selectedSub.url, { 
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/vtt,application/ttml+xml,text/xml',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.youtube.com/'
          }
        });
        const content = response.data;
        
        // Simple text extraction (remove timestamps and formatting)
        const lines = content.split('\n');
        const textLines = [];
        
        for (const line of lines) {
          const trimmed = line.trim();
          // Skip empty lines, timestamps, and metadata
          if (trimmed && 
              !trimmed.match(/^\d+$/) && 
              !trimmed.match(/^\d{2}:\d{2}:\d{2}/) &&
              !trimmed.match(/^WEBVTT/) &&
              !trimmed.match(/^Kind:/) &&
              !trimmed.match(/^Language:/) &&
              !trimmed.startsWith('<') &&
              !trimmed.startsWith('NOTE ')) {
            // Remove HTML tags and clean up
            const cleanLine = trimmed.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
            if (cleanLine) {
              textLines.push(cleanLine);
            }
          }
        }
        
        const cleanText = textLines.join(' ').replace(/\s+/g, ' ').trim();
        
        console.log(`Extracted ${cleanText.length} characters of text`);
        
        return {
          success: true,
          method: 'youtube-dl',
          transcript: textLines.map(text => ({ text })),
          text: cleanText,
          language: selectedLang,
          subtitleType: subtitleType,
          availableLanguages: availableLanguages.slice(0, 20) // Limit to first 20
        };
      }
    } catch (downloadError) {
      console.log(`Failed to download subtitles: ${downloadError.message}`);
      
      // Check if it's a rate limiting error
      if (downloadError.response && downloadError.response.status === 429) {
        return {
          success: false,
          error: 'rate_limited',
          message: 'YouTube is rate limiting subtitle requests'
        };
      }
    }
  }

  // If we get here, we found subtitles but couldn't download them
  return {
    success: false,
    error: 'subtitle_download_failed',
    method: 'youtube-dl',
    transcript: [],
    text: `Found ${subtitleType} in ${availableLanguages.length} languages: ${availableLanguages.slice(0, 10).join(', ')}${availableLanguages.length > 10 ? '...' : ''} but failed to download`,
    language: selectedLang || 'unknown',
    subtitleType: subtitleType,
    availableLanguages: availableLanguages.slice(0, 20)
  };
}

async function extractWithYoutubeDl(videoId) {
  console.log(`Attempting youtube-dl-exec for video: ${videoId}`);
  
  const configs = [
    { 'write-subs': true, 'write-auto-subs': true, 'skip-download': true, 'dump-json': true },
    { 'write-auto-subs': true, 'skip-download': true, 'sub-lang': 'en', 'dump-json': true }
  ];
  
  for (const config of configs) {
    try {
      console.log(`Trying config:`, config);
      const info = await youtubedl(`https://www.youtube.com/watch?v=${videoId}`, config);
      
      console.log(`Available subtitles:`, Object.keys(info.subtitles || {}));
      console.log(`Available automatic captions:`, Object.keys(info.automatic_captions || {}));
      
      // Process subtitle information
      if (info.subtitles || info.automatic_captions) {
        return await processSubtitleData(info);
      }
    } catch (error) {
      console.log(`Config failed: ${error.message}`);
      continue;
    }
  }
  
  return { success: false, error: 'no_subtitles_found' };
}

module.exports = { extractWithYoutubeDl }; 