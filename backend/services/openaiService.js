const OpenAI = require('openai');

class OpenAIService {
  constructor(customApiKey = null) {
    const apiKey = customApiKey || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ No OpenAI API key found - AI features will use fallback responses');
      this.client = null;
      this.fallbackMode = true;
      return;
    }

    try {
      console.log('🔑 Initializing OpenAI with API key:', apiKey.substring(0, 10) + '...');
      this.client = new OpenAI({
        apiKey: apiKey,
      });
      this.fallbackMode = false;
      console.log('✅ OpenAI initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize OpenAI:', error.message);
      this.client = null;
      this.fallbackMode = true;
    }
  }

  // Create instance with custom API key
  static withApiKey(apiKey) {
    return new OpenAIService(apiKey);
  }

  async explainCode(code, language) {
    if (!this.client) {
      throw new Error('FALLBACK_MODE');
    }
    
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
      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an expert programming instructor who explains code clearly and educationally." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('FALLBACK_MODE');
    }
  }

  async optimizeCode(code, language) {
    if (!this.client) {
      throw new Error('FALLBACK_MODE');
    }
    
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
      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a senior software engineer who optimizes code for performance and readability." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to optimize code with OpenAI');
    }
  }

  async debugCode(code, language, errorMessage = '') {
    if (!this.client) {
      throw new Error('FALLBACK_MODE');
    }
    
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

    try {
      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an expert debugger who fixes code issues and provides complete working solutions." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to debug code with OpenAI');
    }
  }

  async convertCode(code, fromLanguage, toLanguage) {
    if (!this.client) {
      throw new Error('FALLBACK_MODE');
    }
    
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
      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an expert in multiple programming languages who converts code accurately." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to convert code with OpenAI');
    }
  }

  async generateCode(description, language) {
    if (!this.client) {
      throw new Error('FALLBACK_MODE');
    }
    
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
      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an expert programmer who generates clean, well-documented code." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate code with OpenAI');
    }
  }

  async chatWithCode(message, code, language, conversationHistory = []) {
    if (!this.client) {
      throw new Error('FALLBACK_MODE');
    }
    
    const messages = [
      { 
        role: "system", 
        content: `You are an expert programming assistant helping a developer with their ${language} code. Be helpful, clear, and provide practical examples.` 
      }
    ];

    // Add conversation history
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // Add current message with code context
    const prompt = code 
      ? `Current code:\n\`\`\`${language}\n${code}\n\`\`\`\n\nQuestion: ${message}`
      : message;

    messages.push({ role: "user", content: prompt });

    try {
      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to chat with OpenAI');
    }
  }

  async getCodeSuggestions(partialCode, language, cursorPosition) {
    if (!this.client) {
      throw new Error('FALLBACK_MODE');
    }
    
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
      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a code completion assistant who provides intelligent suggestions." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get code suggestions with OpenAI');
    }
  }

  async executeCode(code, language) {
    if (!this.client) {
      throw new Error('FALLBACK_MODE');
    }
    
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
      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a code execution simulator that provides accurate terminal output." },
          { role: "user", content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 1000,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to execute code with OpenAI');
    }
  }

  async learningChat(message, conversationHistory = []) {
    if (!this.client) {
      throw new Error('FALLBACK_MODE');
    }
    
    const messages = [
      { 
        role: "system", 
        content: `You are AI Learnixo, a friendly and knowledgeable programming tutor. Your goal is to help students learn programming concepts, understand code, and develop their skills. Explain concepts clearly, use examples and analogies, break down complex topics, encourage learning, provide code examples with explanations, and be patient and supportive.` 
      }
    ];

    // Add conversation history
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // Add current message
    messages.push({ role: "user", content: message });

    try {
      console.log('Calling OpenAI API for learning chat...');
      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        temperature: 0.8,
        max_tokens: 1200,
      });

      const text = completion.choices[0].message.content;
      console.log('OpenAI API response received successfully');
      return text;
    } catch (error) {
      console.error('OpenAI API error in learningChat:', {
        message: error.message,
        status: error.status,
      });

      // Throw error to trigger fallback
      throw new Error('FALLBACK_MODE');
    }
  }
}

// Export both the class and a default instance
module.exports = new OpenAIService();
module.exports.OpenAIService = OpenAIService;
