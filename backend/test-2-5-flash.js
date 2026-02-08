// Test gemini-2.5-flash
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  console.log('🔑 Testing gemini-2.5-flash...\n');
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const result = await model.generateContent('Say hello in one sentence');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ SUCCESS!');
    console.log('Response:', text);
    console.log('\n🎉 Gemini 2.5 Flash is working!');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Status:', error.status);
  }
}

test();
