// Test Hugging Face API Key
require('dotenv').config();
const axios = require('axios');

async function testApiKey() {
  console.log('\n🔑 Testing Hugging Face API Key...\n');
  console.log('API Key:', process.env.HUGGINGFACE_API_KEY ? process.env.HUGGINGFACE_API_KEY.substring(0, 10) + '...' : 'NOT FOUND');
  
  if (!process.env.HUGGINGFACE_API_KEY) {
    console.error('❌ No API key found in .env file');
    console.log('\n💡 Get your FREE API key from: https://huggingface.co/settings/tokens');
    console.log('   1. Sign up at https://huggingface.co/join');
    console.log('   2. Go to https://huggingface.co/settings/tokens');
    console.log('   3. Click "New token"');
    console.log('   4. Copy the token');
    console.log('   5. Add to backend/.env');
    return;
  }

  try {
    console.log('📊 Testing with a simple request...\n');
    console.log('⏳ Please wait, model may take 20-30 seconds to load on first request...\n');
    
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct',
      {
        inputs: 'Say "Hello" in one word',
        parameters: {
          max_new_tokens: 10,
          temperature: 0.7,
          return_full_text: false,
        },
        options: {
          wait_for_model: true,
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 60 seconds
      }
    );

    if (response.data && response.data[0] && response.data[0].generated_text) {
      const text = response.data[0].generated_text.trim();
      console.log('✅ SUCCESS! Hugging Face API is working!');
      console.log('Response:', text);
      console.log('\n🎉 All AI features are now ready to use!\n');
      console.log('💡 Note: First request may be slow (20-30s) as model loads.');
      console.log('    Subsequent requests will be much faster!\n');
    } else if (response.data?.generated_text) {
      const text = response.data.generated_text.trim();
      console.log('✅ SUCCESS! Hugging Face API is working!');
      console.log('Response:', text);
      console.log('\n🎉 All AI features are now ready to use!\n');
    } else {
      console.log('⚠️ Unexpected response format:', response.data);
    }
    
  } catch (error) {
    if (error.response?.status === 503) {
      console.log('⏳ Model is loading... This is normal for first request.');
      console.log('   Wait 20 seconds and try again: node test-huggingface-key.js');
    } else if (error.response?.status === 401) {
      console.error('\n❌ Error: Invalid API key');
      console.log('\n💡 Your API key is invalid.');
      console.log('Get a new FREE key from: https://huggingface.co/settings/tokens');
    } else if (error.response?.status === 403) {
      console.error('\n❌ Error: Access denied');
      console.log('\n💡 Your API key doesn\'t have access.');
      console.log('Create a new token at: https://huggingface.co/settings/tokens');
    } else {
      console.error('\n❌ Error:', error.message);
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Data:', error.response.data);
      }
    }
  }
}

testApiKey();
