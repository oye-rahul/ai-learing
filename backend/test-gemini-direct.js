// Direct test of Gemini API
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  console.log('🔑 API Key:', process.env.GEMINI_API_KEY ? 'Found' : 'NOT FOUND');
  console.log('🔑 API Key (first 10 chars):', process.env.GEMINI_API_KEY?.substring(0, 10));
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in environment');
    return;
  }

  try {
    console.log('\n📡 Initializing Gemini API...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    console.log('📡 Getting model...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    console.log('📡 Sending test prompt...');
    const result = await model.generateContent('Say hello in one sentence');
    
    console.log('📡 Getting response...');
    const response = await result.response;
    const text = response.text();
    
    console.log('\n✅ SUCCESS!');
    console.log('Response:', text);
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Status:', error.status);
    console.error('Status Text:', error.statusText);
    console.error('Full error:', JSON.stringify(error, null, 2));
  }
}

testGemini();
