// Test Fallback Responses
const { getFallbackResponse } = require('./services/fallbackResponses');

console.log('\n🧪 Testing Fallback Responses\n');
console.log('='.repeat(80));

const testMessages = [
  'Hello',
  'What are variables?',
  'Explain loops',
  'How do functions work?',
  'Create a React component',
  'Show me my files',
  'Help me with JavaScript'
];

testMessages.forEach((message, index) => {
  console.log(`\n${index + 1}. User: "${message}"`);
  console.log('-'.repeat(80));
  const response = getFallbackResponse(message);
  console.log('AI Response:', response.substring(0, 200) + '...\n');
});

console.log('='.repeat(80));
console.log('\n✅ Fallback responses are working!\n');
console.log('💡 These responses will be used until you add a valid Gemini API key.\n');
