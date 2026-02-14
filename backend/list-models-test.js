const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
    const logStream = fs.createWriteStream('gemini_models_list.txt');
    const log = (msg) => {
        console.log(msg);
        logStream.write(msg + '\n');
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        log('❌ No API KEY found!');
        return;
    }

    log(`🔑 Listing models for key: ${apiKey.substring(0, 10)}...`);

    try {
        // We cannot easily list models with GoogleGenerativeAI class directly in some versions,
        // but let's try assuming the SDK supports getGenerativeModel checking or if there is a listModels method on a manager class.
        // Actually, looking at docs, there isn't a top-level listModels on GoogleGenerativeAI instance easily.
        // But we can try a direct fetch to the API endpoint which is easier to debug.

        // Using fetch locally since node 18+ has fetch
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            log('✅ Successfully listed models:');
            if (data.models) {
                data.models.forEach(m => {
                    log(`- ${m.name}`);
                    log(`  Supported: ${m.supportedGenerationMethods}`);
                });
            } else {
                log('No models found in response.');
            }
        } else {
            log(`❌ Failed to list models: ${response.status} ${response.statusText}`);
            log(`Response: ${JSON.stringify(data, null, 2)}`);
        }

    } catch (error) {
        log(`❌ Error: ${error.message}`);
    }
    logStream.end();
}

listModels();
