const fetch = require('node-fetch');

async function testLearnChat() {
  const API_KEY = 'AIzaSyDQLirYTllwUuTc2CpddevvPhkuWpDDi3I'; // Your API key
  const TOKEN = 'your-auth-token-here'; // You'll need to get this from localStorage
  
  console.log('🧪 Testing learn-chat endpoint...\n');
  
  try {
    const response = await fetch('http://localhost:5000/api/ai/learn-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
        'X-Gemini-Key': API_KEY
      },
      body: JSON.stringify({
        message: 'Hello, can you help me?',
        conversationHistory: []
      })
    });
    
    const data = await response.json();
    
    console.log('📊 Response Status:', response.status);
    console.log('📦 Response Data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ SUCCESS! Chatbot is working!');
      console.log('💬 Response:', data.response);
    } else {
      console.log('\n❌ ERROR!');
      console.log('Error:', data.error);
      console.log('Message:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

// Run test
testLearnChat();
