// Test all AI features with the Gemini API
require('dotenv').config();
const geminiService = require('./services/geminiService');

async function testAllFeatures() {
  console.log('\n🧪 Testing All AI Features with Gemini API\n');
  console.log('API Key:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'NOT FOUND');
  console.log('═'.repeat(60));

  const testCode = `function greet(name) {
  console.log("Hello, " + name);
}
greet("World");`;

  try {
    // Test 1: Learning Chat (AI Learnixo)
    console.log('\n1️⃣ Testing AI Learnixo (Learning Chat)...');
    const chatResponse = await geminiService.learningChat('What is a function in JavaScript?', []);
    console.log('✅ Learning Chat works!');
    console.log('Response preview:', chatResponse.substring(0, 100) + '...');

    // Test 2: Explain Code
    console.log('\n2️⃣ Testing Explain Code...');
    const explainResponse = await geminiService.explainCode(testCode, 'javascript');
    console.log('✅ Explain Code works!');
    console.log('Response preview:', explainResponse.substring(0, 100) + '...');

    // Test 3: Debug Code
    console.log('\n3️⃣ Testing Debug Code...');
    const debugResponse = await geminiService.debugCode('console.log(x', 'javascript', 'SyntaxError: missing )');
    console.log('✅ Debug Code works!');
    console.log('Response preview:', debugResponse.substring(0, 100) + '...');

    // Test 4: Optimize Code
    console.log('\n4️⃣ Testing Optimize Code...');
    const optimizeResponse = await geminiService.optimizeCode(testCode, 'javascript');
    console.log('✅ Optimize Code works!');
    console.log('Response preview:', optimizeResponse.substring(0, 100) + '...');

    // Test 5: Generate Code
    console.log('\n5️⃣ Testing Generate Code...');
    const generateResponse = await geminiService.generateCode('Create a function that adds two numbers', 'javascript');
    console.log('✅ Generate Code works!');
    console.log('Response preview:', generateResponse.substring(0, 100) + '...');

    // Test 6: Convert Code
    console.log('\n6️⃣ Testing Convert Code...');
    const convertResponse = await geminiService.convertCode('print("Hello")', 'python', 'javascript');
    console.log('✅ Convert Code works!');
    console.log('Response preview:', convertResponse.substring(0, 100) + '...');

    // Test 7: Chat with Code
    console.log('\n7️⃣ Testing Chat with Code...');
    const codeChat = await geminiService.chatWithCode('How can I improve this?', testCode, 'javascript', []);
    console.log('✅ Chat with Code works!');
    console.log('Response preview:', codeChat.substring(0, 100) + '...');

    console.log('\n' + '═'.repeat(60));
    console.log('\n🎉 ALL AI FEATURES ARE WORKING PERFECTLY!\n');
    console.log('✅ AI Learnixo - Ready');
    console.log('✅ Explain Code - Ready');
    console.log('✅ Debug Code - Ready');
    console.log('✅ Optimize Code - Ready');
    console.log('✅ Generate Code - Ready');
    console.log('✅ Convert Code - Ready');
    console.log('✅ Chat with Code - Ready');
    console.log('\n🚀 Your application is fully functional!\n');

  } catch (error) {
    console.error('\n❌ Error during testing:', error.message);
    console.error('Full error:', error);
  }
}

testAllFeatures();
