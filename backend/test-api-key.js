// Test Gemini API Key
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testApiKey() {
  console.log('\n🔑 Testing Gemini API Key...\n');
  console.log('API Key:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 20) + '...' : 'NOT FOUND');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ No API key found in .env file');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try different models
    const models = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
      'gemini-1.5-flash-latest'
    ];

    for (const modelName of models) {
      console.log(`\n📊 Testing model: ${modelName}`);
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say "Hello" in one word');
        const response = await result.response;
        const text = response.text();
        console.log(`✅ ${modelName} works! Response:`, text);
        console.log('\n🎉 SUCCESS! This model works. Updating service...\n');
        return modelName;
      } catch (error) {
        console.log(`❌ ${modelName} failed:`, error.message);
      }
    }

    console.error('\n❌ All models failed. API key might be invalid or restricted.');
    console.log('\n💡 Solutions:');
    console.log('1. Create a NEW API key at: https://aistudio.google.com/app/apikey');
    console.log('2. Make sure "Generative Language API" is enabled');
    console.log('3. Use Google AI Studio (not Google Cloud Console)');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nFull error:', error);
  }
}

testApiKey();
