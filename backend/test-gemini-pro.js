// Test Gemini Pro model
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiPro() {
  console.log('🔑 API Key:', process.env.GEMINI_API_KEY ? 'Found' : 'NOT FOUND');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in environment');
    return;
  }

  try {
    console.log('\n📡 Testing Gemini Pro model...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    console.log('📡 Sending test prompt...');
    const result = await model.generateContent('Explain what Python is in one sentence.');
    
    const response = await result.response;
    const text = response.text();
    
    console.log('\n✅ SUCCESS!');
    console.log('Response:', text);
    console.log('\n✅ Gemini API is working correctly!');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    
    if (error.status === 404) {
      console.error('\n💡 Solution: The API key might not have access to Gemini models.');
      console.error('   Please enable the Generative Language API at:');
      console.error('   https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
    } else if (error.status === 400) {
      console.error('\n💡 Solution: The API key might be invalid.');
      console.error('   Please get a new API key from:');
      console.error('   https://makersuite.google.com/app/apikey');
    }
  }
}

testGeminiPro();
