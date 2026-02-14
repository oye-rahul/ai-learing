const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGeminiKey() {
    const logStream = fs.createWriteStream('gemini_test_output.txt');
    const log = (msg) => {
        console.log(msg);
        logStream.write(msg + '\n');
    };

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        log('❌ No API KEY found in environment!');
        return;
    }

    log(`🔑 Testing Gemini API Key: ${apiKey.substring(0, 10)}...`);

    const modelsToTry = [
        'gemini-1.5-flash',
        'gemini-pro'
    ];

    for (const modelName of modelsToTry) {
        try {
            log(`\n📤 Trying model: ${modelName}...`);
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent('Say "Hello" in one word.');
            const response = await result.response;
            const text = response.text();

            log(`✅ SUCCESS with ${modelName}!`);
            log(`📥 Response: ${text}`);
            logStream.end();
            return;

        } catch (error) {
            log(`❌ Failed with ${modelName}:`);
            log(`   Error: ${error.message}`);
        }
    }

    log('\n🔴 All models failed! Please check your API key.');
    logStream.end();
}

testGeminiKey();
