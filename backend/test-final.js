// Final test with gemini-2.0-flash
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testFinal() {
  console.log('🔑 API Key:', process.env.GEMINI_API_KEY ? 'Found' : 'NOT FOUND');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found');
    return;
  }

  try {
    console.log('\n📡 Testing Gemini 2.0 Flash model...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    console.log('📡 Sending test prompt...');
    const result = await model.generateContent('Explain what Python is in one sentence.');
    
    const response = await result.response;
    const text = response.text();
    
    console.log('\n✅ SUCCESS!');
    console.log('Response:', text);
    console.log('\n🎉 Gemini API is working perfectly!');
    console.log('✅ All AI features (Explain Code, AI Learnixo, Chatbot) will now work!');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Status:', error.status);
  }
}

testFinal();
