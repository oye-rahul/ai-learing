// List all available models for the API key
require('dotenv').config();
const axios = require('axios');

async function listAvailableModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('🔑 API Key:', apiKey ? 'Found' : 'NOT FOUND');
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found');
    return;
  }

  const versions = ['v1beta', 'v1'];

  for (const version of versions) {
    try {
      console.log(`\n📡 Listing models for API ${version}...`);
      const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
      
      const response = await axios.get(url);
      
      console.log(`✅ Found ${response.data.models?.length || 0} models:\n`);
      
      if (response.data.models) {
        response.data.models.forEach(model => {
          console.log(`  📦 ${model.name}`);
          console.log(`     Display Name: ${model.displayName}`);
          console.log(`     Supported: ${model.supportedGenerationMethods?.join(', ')}`);
          console.log('');
        });
      }
      
      break; // Stop after first successful call
      
    } catch (error) {
      console.log(`❌ ${version} failed: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

listAvailableModels();
