#!/usr/bin/env node

/**
 * Test script for LeetCode API endpoints
 * Run this to verify the backend is working correctly
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:8000';

async function testHealthEndpoint() {
  console.log('🔍 Testing health endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ Health check:', data.status);
    return true;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }
}

async function testTextSolving() {
  console.log('\n🔍 Testing text problem solving...');
  try {
    const response = await fetch(`${BASE_URL}/solve/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        problem_text: "Write a function that returns the sum of two numbers. Input: add(2, 3) should return 5",
        max_corrections: 2,
        store_solution: false,
        timeout: 30
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Text solving result:', {
      success: data.success,
      processing_time: data.processing_time,
      solution_length: data.solution?.length || 0,
      error: data.error
    });
    return data.success;
  } catch (error) {
    console.log('❌ Text solving failed:', error.message);
    return false;
  }
}

async function testEnhancedSolving() {
  console.log('\n🔍 Testing enhanced problem solving...');
  try {
    const response = await fetch(`${BASE_URL}/solve/enhanced`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        problem_text: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        max_corrections: 2,
        store_solution: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Enhanced solving result:', {
      success: data.success,
      processing_time: data.processing_time,
      has_explanation: !!data.explanation,
      has_complexity_analysis: !!data.complexity_analysis,
      error: data.error
    });
    return data.success;
  } catch (error) {
    console.log('❌ Enhanced solving failed:', error.message);
    return false;
  }
}

async function testTwoSumExample() {
  console.log('\n🔍 Testing Two Sum example endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/examples/two-sum`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Two Sum example result:', {
      success: data.success,
      processing_time: data.processing_time,
      solution_length: data.solution?.length || 0,
      error: data.error
    });
    return data.success;
  } catch (error) {
    console.log('❌ Two Sum example failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting LeetCode API Tests');
  console.log('================================');

  const results = [];
  
  // Test health endpoint
  results.push(await testHealthEndpoint());
  
  // Test basic text solving
  results.push(await testTextSolving());
  
  // Test enhanced solving
  results.push(await testEnhancedSolving());
  
  // Test example endpoint
  results.push(await testTwoSumExample());

  console.log('\n📊 Test Results Summary');
  console.log('========================');
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  console.log(`📈 Success Rate: ${((passed/total) * 100).toFixed(1)}%`);

  if (passed === total) {
    console.log('\n🎉 All tests passed! The LeetCode API is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the backend server and try again.');
    console.log('\nTo start the backend server:');
    console.log('cd pythonBackend');
    console.log('python APIServer/api_server.py');
  }

  return passed === total;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };
