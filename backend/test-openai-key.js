// Test OpenAI API Key
require('dotenv').config();
const OpenAI = require('openai');

async function testApiKey() {
  console.log('\n🔑 Testing OpenAI API Key...\n');
  console.log('API Key:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'NOT FOUND');
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ No API key found in .env file');
    console.log('\n💡 Get your API key from: https://platform.openai.com/api-keys');
    return;
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('📊 Testing with a simple request...\n');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say 'Hello' in one word" }
      ],
      max_tokens: 10,
    });

    const response = completion.choices[0].message.content;
    console.log('✅ SUCCESS! OpenAI API is working!');
    console.log('Response:', response);
    console.log('\n🎉 All AI features are now ready to use!\n');
    console.log('Model:', completion.model);
    console.log('Tokens used:', completion.usage.total_tokens);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.status === 401) {
      console.log('\n💡 Your API key is invalid or expired.');
      console.log('Get a new key from: https://platform.openai.com/api-keys');
    } else if (error.status === 429) {
      console.log('\n💡 Rate limit exceeded or quota reached.');
      console.log('Check your usage at: https://platform.openai.com/usage');
    } else if (error.status === 403) {
      console.log('\n💡 Your API key doesn\'t have access to this model.');
      console.log('Check your plan at: https://platform.openai.com/account/billing');
    } else {
      console.log('\nFull error:', error);
    }
  }
}

testApiKey();
