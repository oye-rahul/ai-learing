require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor(customApiKey = null) {
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    this.apiKey = apiKey;
    this.fallbackMode = !apiKey;
    // Use models that are confirmed to work with this API key
    this.modelsToTry = [
      'gemini-2.5-flash',      // Primary - fast and efficient
      'gemini-2.0-flash',      // Backup 1
      'gemini-flash-latest',   // Backup 2 - always points to latest
      'gemini-2.5-pro'         // Backup 3 - more powerful but slower
    ];
    this.currentModelIndex = 0;
    this.lastResponseUsedFallback = false;

    if (!apiKey) {
      console.warn('⚠️ No Gemini API key found - AI features will use fallback responses');
      this.genAI = null;
      this.model = null;
      this.fallbackMode = true;
      this.lastResponseUsedFallback = true;
      return;
    }

    this._initializeModel();
  }

  _initializeModel() {
    this.lastResponseUsedFallback = false;
    try {
      const modelName = this.modelsToTry[this.currentModelIndex];
      console.log(`🔑 Initializing Gemini AI with key: ${this.apiKey.substring(0, 10)}... (Model: ${modelName})`);
      this.genAI = new GoogleGenerativeAI(this.apiKey);

      this.model = this.genAI.getGenerativeModel({
        model: modelName,
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      });

      this.fallbackMode = false;
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error.message);
      this.fallbackMode = true;
    }
  }

  // Helper to handle API calls with logging and error mapping
  async _callApi(prompt, taskName = 'AI Task') {
    if (this.fallbackMode || !this.model) {
      console.warn(`⚠️ Using fallback mode for ${taskName}`);
      this.lastResponseUsedFallback = true;
      const { getFallbackResponse } = require('./fallbackResponses');
      return getFallbackResponse(prompt);
    }

    try {
      console.log(`🤖 [Gemini] Executing ${taskName} using ${this.modelsToTry[this.currentModelIndex]}...`);
      const result = await this.model.generateContent(prompt);

      if (!result || !result.response) {
        throw new Error('Empty response from Gemini API');
      }

      const response = await result.response;
      const text = response.text();

      if (!text) {
        if (response.promptFeedback && response.promptFeedback.blockReason) {
          this.lastResponseUsedFallback = true;
          return "I'm sorry, but I cannot fulfill this request due to safety restrictions. Please try rephrasing your prompt.";
        }
        throw new Error('No text generated');
      }

      console.log(`✅ [Gemini] ${taskName} SUCCESS`);
      this.lastResponseUsedFallback = false;
      return text;
    } catch (error) {
      console.error(`❌ [Gemini] ${taskName} ERROR:`, error.message);

      // If quota or heavy traffic, try the next model
      if ((error.message.includes('quota') || error.message.includes('429') || error.message.includes('503')) &&
        this.currentModelIndex < this.modelsToTry.length - 1) {

        console.warn(`🔄 Quota hit for ${this.modelsToTry[this.currentModelIndex]}. Trying next model...`);
        this.currentModelIndex++;
        this._initializeModel();
        return this._callApi(prompt, taskName);
      }

      // Final fallback to pre-defined responses
      console.warn('⚠️ All API attempts failed or terminal error. Using fallback response.');
      this.lastResponseUsedFallback = true;
      const { getFallbackResponse } = require('./fallbackResponses');
      return getFallbackResponse(prompt);
    }
  }

  async explainCode(code, language) {
    const prompt = `As an expert programming instructor, please explain the following ${language} code in detail:

\`\`\`${language}
${code}
\`\`\`

Please provide:
1. What the code does overall
2. How each part works step by step
3. Key concepts and patterns used
4. Best practices and potential improvements
5. Common use cases for this type of code

Make your explanation clear and educational for developers learning ${language}.`;

    return this._callApi(prompt, 'Explain Code');
  }

  async optimizeCode(code, language) {
    const prompt = `As a senior software engineer, please optimize the following ${language} code for better performance, readability, and best practices:

Original code:
\`\`\`${language}
${code}
\`\`\`

Please provide:
1. The optimized version of the code
2. Explanation of what improvements were made
3. Performance benefits (if any)
4. Why these changes are better
5. Any additional best practices to consider

Focus on making the code more efficient, readable, and maintainable.`;

    return this._callApi(prompt, 'Optimize Code');
  }

  async debugCode(code, language, errorMessage = '') {
    const prompt = `As an expert debugger, analyze and fix this ${language} code.

Original Code:
\`\`\`${language}
${code}
\`\`\`

${errorMessage ? `Error: ${errorMessage}\n\n` : ''}

CRITICAL INSTRUCTIONS - FOLLOW THIS FORMAT EXACTLY:

1. START your response with the COMPLETE FIXED CODE in a code block
2. Use this EXACT format:

\`\`\`${language}
[put the complete corrected code here - include ALL the code, not just the changed parts]
\`\`\`

3. AFTER the code block, explain what you fixed

Example response format:

\`\`\`${language}
// Complete corrected code goes here
function example() {
  return "fixed";
}
\`\`\`

### Issues Fixed:
1. [issue 1]
2. [issue 2]

### Explanation:
[detailed explanation]

IMPORTANT: 
- Include the COMPLETE working code, not just snippets
- Make sure the code is ready to run immediately
- Don't add comments like "// rest of code unchanged" - include everything

Now fix the code above following this format exactly.`;

    return this._callApi(prompt, 'Debug Code');
  }

  async convertCode(code, fromLanguage, toLanguage) {
    const prompt = `Convert the following ${fromLanguage} code to ${toLanguage}, maintaining the same functionality and following ${toLanguage} best practices:

${fromLanguage} code:
\`\`\`${fromLanguage}
${code}
\`\`\`

Please provide:
1. The converted ${toLanguage} code
2. Explanation of key differences between the languages
3. Any ${toLanguage}-specific optimizations or patterns used
4. Notes about language-specific features utilized
5. Potential considerations when using this code in ${toLanguage}

Ensure the converted code is idiomatic and follows ${toLanguage} conventions.`;

    return this._callApi(prompt, 'Convert Code');
  }

  async generateCode(description, language) {
    const prompt = `Generate clean, well-documented ${language} code based on the following requirements:

Requirements: ${description}

Please provide:
1. Complete, working ${language} code
2. Detailed comments explaining the logic
3. Brief explanation of the approach used
4. Usage examples if applicable
5. Any dependencies or setup requirements

Make sure the code follows ${language} best practices and is production-ready.`;

    return this._callApi(prompt, 'Generate Code');
  }

  async chatWithCode(message, code, language, conversationHistory = []) {
    const historyContext = conversationHistory.length > 0
      ? `Previous conversation:\n${conversationHistory.map(h => `${h.role}: ${h.content}`).join('\n')}\n\n`
      : '';

    const prompt = `${historyContext}You are an expert programming assistant helping a developer with their ${language} code. 

Current code:
\`\`\`${language}
${code}
\`\`\`

Developer's question/request: ${message}

Please provide a helpful, detailed response that:
1. Directly addresses their question
2. References the specific code when relevant
3. Provides practical examples or suggestions
4. Explains concepts clearly
5. Offers best practices and tips

Be conversational but professional, and focus on being genuinely helpful for their coding journey.`;

    return this._callApi(prompt, 'Chat with Code');
  }

  async getCodeSuggestions(partialCode, language, cursorPosition) {
    const prompt = `As a code completion assistant, analyze this partial ${language} code and provide intelligent suggestions:

Code so far:
\`\`\`${language}
${partialCode}
\`\`\`

Cursor position: ${cursorPosition}

Please suggest:
1. Possible completions for the current line
2. Next logical steps in the code
3. Common patterns that might fit here
4. Variable names or function calls that make sense
5. Any syntax corrections needed

Provide practical, contextually relevant suggestions that would help the developer continue coding efficiently.`;

    return this._callApi(prompt, 'Get Suggestions');
  }

  async executeCode(code, language) {
    const prompt = `As a code execution environment for ${language}, please simulate the execution of the following code and provide the output as it would appear in a terminal/console.

Code:
\`\`\`${language}
${code}
\`\`\`

Rules for output:
1. Provide ONLY the console output (stdout/stderr).
2. If there's an error, provide the stack trace/error message as the language would.
3. If there's no output (e.g., no print statements), say "Process finished with exit code 0".
4. Do not include any meta-commentary or explanations outside of the terminal output.
5. If the code requires simple inputs, assume reasonable defaults.

Terminal Output:`;

    return this._callApi(prompt, 'Code Simulation');
  }

  async learningChat(message, conversationHistory = []) {
    const historyContext = conversationHistory.length > 0
      ? `Previous conversation:\n${conversationHistory.map(h => `${h.role}: ${h.content}`).join('\n')}\n\n`
      : '';

    const prompt = `${historyContext}You are AI Learnixo, a friendly and knowledgeable programming tutor. Your goal is to help students learn programming concepts, understand code, and develop their skills.

Student's question: ${message}

Please provide a helpful response that:
1. Explains concepts clearly and simply
2. Uses examples and analogies when helpful
3. Breaks down complex topics into digestible parts
4. Encourages learning and curiosity
5. Provides code examples when relevant (with explanations)
6. Suggests next steps or related topics to explore
7. Is patient, supportive, and encouraging

Remember: You're not just answering questions, you're helping someone learn and grow as a developer. Make learning enjoyable and accessible!`;

    return this._callApi(prompt, 'Learning Chat');
  }
}

// Export both the class and a default instance
module.exports = new GeminiService();
module.exports.GeminiService = GeminiService;
