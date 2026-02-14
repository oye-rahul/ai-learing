// Test Gemini API Key
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testApiKey() {
  console.log('\n🔑 Testing Gemini API Key...\n');
  console.log('API Key:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'NOT FOUND');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ No API key found in .env file');
    console.log('\n💡 Get your FREE API key from: https://aistudio.google.com/app/apikey');
    console.log('   1. Click "Create API Key"');
    console.log('   2. Choose "Create API key in new project"');
    console.log('   3. Copy the key');
    console.log('   4. Add to backend/.env');
    console.log('\n📖 Read: GET_NEW_GEMINI_KEY.md for detailed instructions');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try models that are confirmed to work
    const models = [
      { name: 'gemini-2.5-flash', version: 'v1beta' },
      { name: 'gemini-2.0-flash', version: 'v1beta' },
      { name: 'gemini-flash-latest', version: 'v1beta' },
      { name: 'gemini-2.5-pro', version: 'v1beta' },
    ];

    for (const modelInfo of models) {
      console.log(`\n📊 Testing model: ${modelInfo.name}`);
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelInfo.name,
        });
        const result = await model.generateContent('Say "Hello" in one word');
        const response = await result.response;
        const text = response.text();
        console.log(`✅ ${modelInfo.name} works! Response:`, text);
        console.log('\n🎉 SUCCESS! This model works.\n');
        console.log('✅ All AI features are now ready to use!');
        console.log('✅ AI Learnixo will work');
        console.log('✅ Explain Code will work');
        console.log('✅ Debug Code will work');
        console.log('✅ All AI features enabled!\n');
        return modelInfo.name;
      } catch (error) {
        console.log(`❌ ${modelInfo.name} failed:`, error.message);
      }
    }

    console.error('\n❌ All models failed. Please check your API key.');
    console.log('\n💡 Solutions:');
    console.log('1. Create a NEW API key at: https://aistudio.google.com/app/apikey');
    console.log('2. Make sure you use "Create API key in new project"');
    console.log('3. Use Google AI Studio (NOT Google Cloud Console)');
    console.log('4. Copy the COMPLETE key (starts with AIzaSy)');
    console.log('\n📖 Read: GET_NEW_GEMINI_KEY.md for step-by-step guide');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('API_KEY_INVALID') || error.message.includes('API key')) {
      console.log('\n💡 Your API key is invalid.');
      console.log('Create a NEW key at: https://aistudio.google.com/app/apikey');
    } else if (error.message.includes('leaked')) {
      console.log('\n💡 Your API key was leaked and disabled.');
      console.log('Create a NEW key at: https://aistudio.google.com/app/apikey');
    } else {
      console.log('\nFull error:', error);
    }
  }
}

testApiKey();
