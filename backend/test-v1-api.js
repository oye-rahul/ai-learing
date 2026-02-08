// Test with v1 API and different approach
require('dotenv').config();
const axios = require('axios');

async function testV1API() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('🔑 API Key:', apiKey ? 'Found' : 'NOT FOUND');
  console.log('🔑 Key (first 10):', apiKey?.substring(0, 10));
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found');
    return;
  }

  // Try different API versions and models
  const tests = [
    {
      name: 'v1beta - gemini-pro',
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    },
    {
      name: 'v1 - gemini-pro',
      url: `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
    },
    {
      name: 'v1beta - gemini-1.5-flash',
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    },
    {
      name: 'v1 - gemini-1.5-flash',
      url: `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    },
  ];

  const payload = {
    contents: [{
      parts: [{
        text: 'Say hello in one sentence'
      }]
    }]
  };

  for (const test of tests) {
    try {
      console.log(`\n📡 Testing: ${test.name}...`);
      const response = await axios.post(test.url, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      const text = response.data.candidates[0].content.parts[0].text;
      console.log(`✅ SUCCESS! Response: ${text}`);
      console.log(`✅ Use this configuration: ${test.name}`);
      break;
      
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

testV1API();
