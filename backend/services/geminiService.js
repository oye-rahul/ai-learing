const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY not found in environment variables');
    } else {
      console.log('✅ Gemini API Key loaded');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.5-flash (latest model with free tier access)
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to explain code with Gemini AI');
    }
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

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to optimize code with Gemini AI');
    }
  }

  async debugCode(code, language, errorMessage = '') {
    const prompt = `As an expert debugger, analyze and fix this ${language} code.

Original Code:
\`\`\`${language}
${code}
\`\`\`

${errorMessage ? `Error: ${errorMessage}\n\n` : ''}

CRITICAL INSTRUCTIONS:
1. START your response with the FIXED CODE in a code block
2. Use this EXACT format for the fixed code:

\`\`\`${language}
[put the complete corrected code here]
\`\`\`

3. AFTER the code block, explain what you fixed

Example response format:
\`\`\`${language}
[corrected code]
\`\`\`

### Issues Fixed:
1. [issue 1]
2. [issue 2]

### Explanation:
[detailed explanation]

Now fix the code above following this format exactly.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to debug code with Gemini AI');
    }
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

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to convert code with Gemini AI');
    }
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

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate code with Gemini AI');
    }
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

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to chat with Gemini AI');
    }
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

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to get code suggestions with Gemini AI');
    }
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

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to execute code with Gemini AI');
    }
  }

  async learningChat(message, conversationHistory = []) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

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

    try {
      console.log('Calling Gemini API for learning chat...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('Gemini API response received successfully');
      return text;
    } catch (error) {
      console.error('Gemini API error in learningChat:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
      });

      if (error.message.includes('API_KEY_INVALID')) {
        throw new Error('Invalid Gemini API key. Please check your configuration.');
      }

      throw new Error(`Failed to chat with AI Learnixo: ${error.message}`);
    }
  }
}

module.exports = new GeminiService();