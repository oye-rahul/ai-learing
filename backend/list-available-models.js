// List all available Gemini models for this API key
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  console.log('\n🔍 Listing Available Gemini Models...\n');
  console.log('API Key:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'NOT FOUND');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ No API key found in .env file');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // List all available models
    console.log('\n📋 Fetching available models...\n');
    
    // Try to list models using the API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GEMINI_API_KEY);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.models && data.models.length > 0) {
      console.log(`✅ Found ${data.models.length} available models:\n`);
      
      data.models.forEach((model, index) => {
        console.log(`${index + 1}. ${model.name}`);
        console.log(`   Display Name: ${model.displayName || 'N/A'}`);
        console.log(`   Description: ${model.description || 'N/A'}`);
        console.log(`   Supported Methods: ${model.supportedGenerationMethods ? model.supportedGenerationMethods.join(', ') : 'N/A'}`);
        console.log('');
      });
      
      // Find models that support generateContent
      const contentModels = data.models.filter(m => 
        m.supportedGenerationMethods && 
        m.supportedGenerationMethods.includes('generateContent')
      );
      
      if (contentModels.length > 0) {
        console.log('\n✅ Models that support generateContent (use these!):\n');
        contentModels.forEach(model => {
          // Extract just the model name (remove "models/" prefix)
          const modelName = model.name.replace('models/', '');
          console.log(`   - ${modelName}`);
        });
        
        // Test the first available model
        console.log('\n🧪 Testing first available model...\n');
        const testModelName = contentModels[0].name.replace('models/', '');
        console.log(`Testing: ${testModelName}`);
        
        const testModel = genAI.getGenerativeModel({ model: testModelName });
        const result = await testModel.generateContent('Say "Hello" in one word');
        const testResponse = await result.response;
        const text = testResponse.text();
        
        console.log(`✅ SUCCESS! Response: ${text}`);
        console.log(`\n🎉 Use this model in your code: ${testModelName}\n`);
      } else {
        console.log('\n❌ No models support generateContent method');
      }
    } else {
      console.log('❌ No models found for this API key');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('403') || error.message.includes('API_KEY_INVALID')) {
      console.log('\n💡 Your API key might be invalid or restricted.');
      console.log('Create a NEW key at: https://aistudio.google.com/app/apikey');
    } else if (error.message.includes('404')) {
      console.log('\n💡 API endpoint not found. Your key might not have access to the Generative Language API.');
      console.log('Create a NEW key at: https://aistudio.google.com/app/apikey');
    } else {
      console.log('\nFull error:', error);
    }
  }
}

listModels();
