const fetch = require('node-fetch');

// Test the Perplexity Search API
async function testPerplexitySearch() {
  console.log('🚀 Testing Perplexity Search API...\n');
  
  const testQueries = [
    {
      query: "What are the latest developments in AI language models in 2024?",
      description: "AI developments query"
    },
    {
      query: "Current weather in San Francisco",
      description: "Simple weather query"
    },
    {
      query: "OpenRouter API pricing and features",
      description: "Specific service query"
    }
  ];

  for (const test of testQueries) {
    console.log(`\n📝 Testing: ${test.description}`);
    console.log(`❓ Query: "${test.query}"`);
    console.log('🔄 Starting streaming request...\n');
    
    try {
      const response = await fetch('http://localhost:3000/api/perplexity-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: test.query,
          model: 'perplexity/sonar-pro',
          max_tokens: 2000,
          temperature: 0.7,
          return_citations: true,
          search_domain_filter: ['wikipedia.org', 'github.com'],
          top_p: 0.9,
          frequency_penalty: 0.1
        }),
      });

      console.log(`📊 Response Status: ${response.status}`);
      console.log(`📊 Response Headers:`, Object.fromEntries(response.headers));

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Error: ${response.status} - ${errorText}`);
        continue;
      }

      // Handle streaming response
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        
        console.log('🌊 Streaming response:');
        console.log('----------------------------------------');
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              console.log('\n✅ Stream completed');
              break;
            }
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                
                if (data.trim()) {
                  try {
                    const parsed = JSON.parse(data);
                    
                    switch (parsed.type) {
                      case 'start':
                        console.log(`🚀 ${parsed.message}`);
                        break;
                      case 'content':
                        process.stdout.write(parsed.content);
                        fullResponse += parsed.content;
                        break;
                      case 'end':
                        console.log(`\n✅ ${parsed.message}`);
                        break;
                      case 'error':
                        console.error(`\n❌ Error: ${parsed.error}`);
                        break;
                      default:
                        console.log(`\n📦 Unknown type: ${parsed.type}`);
                    }
                  } catch (parseError) {
                    console.warn(`\n⚠️ Could not parse: ${data}`);
                  }
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
        
        console.log('\n----------------------------------------');
        console.log(`📝 Full response length: ${fullResponse.length} characters`);
        console.log(`📊 Query processed successfully: "${test.query}"`);
      }
      
    } catch (error) {
      console.error(`❌ Test failed for "${test.description}":`, error.message);
    }
    
    console.log('\n' + '='.repeat(80));
  }
}

// Test with simple fetch (non-streaming) for comparison
async function testSimpleRequest() {
  console.log('\n🧪 Testing simple non-streaming request...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/perplexity-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: "What is the capital of France?",
        max_tokens: 200,
        temperature: 0.3
      }),
    });

    console.log(`📊 Response Status: ${response.status}`);
    
    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      console.log('🌊 Response is streaming (SSE)');
      
      // Read the full stream at once for testing
      const text = await response.text();
      console.log('📝 Raw response:');
      console.log(text);
    } else {
      const data = await response.json();
      console.log('📦 Response data:', data);
    }
    
  } catch (error) {
    console.error('❌ Simple test failed:', error.message);
  }
}

// Error handling test
async function testErrorHandling() {
  console.log('\n🚫 Testing error handling...\n');
  
  const errorTests = [
    {
      description: "Empty query",
      body: { query: "" }
    },
    {
      description: "Missing query",
      body: { max_tokens: 100 }
    },
    {
      description: "Invalid method",
      method: "GET"
    }
  ];
  
  for (const test of errorTests) {
    console.log(`\n📝 Testing: ${test.description}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/perplexity-search', {
        method: test.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: test.body ? JSON.stringify(test.body) : JSON.stringify({ query: "test" }),
      });

      console.log(`📊 Response Status: ${response.status}`);
      
      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        console.log('📦 Error response:', data);
      } else {
        const text = await response.text();
        console.log('📝 Error text:', text);
      }
      
    } catch (error) {
      console.error(`❌ Error test failed for "${test.description}":`, error.message);
    }
  }
}

// Main test runner
async function runTests() {
  console.log('🧪 Perplexity Search API Test Suite');
  console.log('=====================================\n');
  
  console.log('ℹ️  Make sure your server is running on http://localhost:3000');
  console.log('ℹ️  And that OPENROUTER_API_KEY is set in your environment\n');
  
  // Wait a bit to ensure server is ready
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    await testPerplexitySearch();
    await testSimpleRequest();
    await testErrorHandling();
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
  }
}

// Run the tests
runTests().catch(console.error); 