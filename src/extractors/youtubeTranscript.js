const { YoutubeTranscript } = require('youtube-transcript');

async function extractWithYoutubeTranscript(videoId, languages = ['en', 'hi']) {
  try {
    console.log(`Attempting youtube-transcript for video: ${videoId}`);
    
    // Try different language options
    let transcripts = null;
    const languageOptions = ['en', 'en-US', 'en-GB', ...languages];
    
    // Try without options first
    try {
      transcripts = await YoutubeTranscript.fetchTranscript(videoId);
    } catch (error) {
      console.log('No auto-generated transcript, trying with language options...');
    }
    
    // If empty, try with different languages
    if (!transcripts || transcripts.length === 0) {
      for (const lang of languageOptions) {
        try {
          transcripts = await YoutubeTranscript.fetchTranscript(videoId, { lang });
          if (transcripts && transcripts.length > 0) {
            console.log(`Found transcript in language: ${lang}`);
            break;
          }
        } catch (langError) {
          console.log(`Language ${lang} failed: ${langError.message}`);
          continue;
        }
      }
    }
    
    console.log(`youtube-transcript result: ${transcripts ? transcripts.length : 0} items`);
    
    // If we have transcripts, process them
    if (transcripts && transcripts.length > 0) {
      const cleanText = transcripts.map(item => item.text).join(' ');
      
      return {
        success: true,
        method: 'youtube-transcript',
        transcript: transcripts,
        text: cleanText,
        language: languages[0]
      };
    } else {
      // Return failure to trigger fallback
      return { success: false, error: 'no_transcripts_found' };
    }
  } catch (error) {
    console.log(`youtube-transcript error: ${error.message}`);
    // Handle rate limiting and other errors
    if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
      return { success: false, error: 'rate_limited' };
    }
    // Return failure to trigger fallback instead of throwing
    return { success: false, error: 'extraction_failed' };
  }
}

module.exports = { extractWithYoutubeTranscript }; 