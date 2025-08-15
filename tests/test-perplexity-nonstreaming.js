const fetch = require('node-fetch');

// Test the Perplexity Search API without streaming to check citations
async function testPerplexityNonStreaming() {
  console.log('🚀 Testing Perplexity Search API (Non-Streaming) for citations...\n');
  
  try {
    console.log('📝 Testing citation extraction...');
    console.log('❓ Query: "What are the latest AI developments in 2024?"');
    console.log('🔄 Making non-streaming request...\n');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || 'your-api-key-here'}`,
        'HTTP-Referer': 'https://localhost:3000',
        'X-Title': 'Perplexity Citation Test',
      },
      body: JSON.stringify({
        model: 'perplexity/sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that searches the web and provides comprehensive, accurate, and up-to-date information. Always cite your sources with [number] references and provide the complete source URLs at the end of your response. Include detailed citations with URLs for all sources used in your research.'
          },
          {
            role: 'user',
            content: 'What are the latest AI developments in 2024?'
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: false, // Non-streaming
        return_citations: true,
        return_images: false,
        return_related_questions: false
      }),
    });

    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📊 Response Headers:`, Object.fromEntries(response.headers));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error: ${response.status} - ${errorText}`);
      return;
    }

    const data = await response.json();
    
    console.log('\n📋 Full Response Structure:');
    console.log('----------------------------------------');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.citations) {
      console.log('\n📚 CITATIONS FOUND:');
      console.log('----------------------------------------');
      data.citations.forEach((citation, index) => {
        console.log(`[${index + 1}] ${citation.title || citation.url || citation}`);
        if (citation.url) {
          console.log(`    🔗 ${citation.url}`);
        }
      });
    } else {
      console.log('\n❌ No citations found in response');
    }
    
    if (data.choices && data.choices[0]) {
      console.log('\n📝 Response Content:');
      console.log('----------------------------------------');
      console.log(data.choices[0].message.content);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPerplexityNonStreaming(); 