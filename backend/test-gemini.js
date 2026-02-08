require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  console.log('Testing Gemini API...');

  const apiKey = process.env.GEMINI_API_KEY;
  console.log('API Key:', apiKey ? `Present (length: ${apiKey.length})` : 'Missing');

  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY is not set in .env file');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash as it's the current standard model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    console.log('Sending test prompt to gemini-1.5-flash...');
    const result = await model.generateContent('Say hello in one sentence.');
    const response = await result.response;
    const text = response.text();

    console.log('✅ Success! Response:', text);
    console.log('\n✅ Gemini API is working correctly!');
  } catch (error) {
    console.error('❌ Error testing Gemini API:');
    console.error('Message:', error.message);

    // Check for common error types
    if (error.message.includes('404') || error.message.includes('not found')) {
      console.error('\n⚠️  Model not found or API version not supported.');
      console.error('Possible fixes:');
      console.error('1. Check if "Generative Language API" is enabled in Google Cloud Console.');
      console.error('2. Verify if the API key has access to "gemini-1.5-flash".');
    } else if (error.message.includes('API_KEY_INVALID')) {
      console.error('\n⚠️  Invalid API Key.');
    }
  }
}

testGemini();
