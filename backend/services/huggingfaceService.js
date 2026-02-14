const axios = require('axios');

class HuggingFaceService {
  constructor(customApiKey = null) {
    const apiKey = customApiKey || process.env.HUGGINGFACE_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ No Hugging Face API key found - AI features will use fallback responses');
      this.apiKey = null;
      this.fallbackMode = true;
      return;
    }

    try {
      console.log('🔑 Initializing Hugging Face AI with API key:', apiKey.substring(0, 10) + '...');
      this.apiKey = apiKey;
      this.fallbackMode = false;
      // Using Microsoft's Phi-3 model (fast, reliable, always available)
      this.model = 'microsoft/Phi-3-mini-4k-instruct';
      console.log('✅ Hugging Face AI initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Hugging Face AI:', error.message);
      this.apiKey = null;
      this.fallbackMode = true;
    }
  }

  // Create instance with custom API key
  static withApiKey(apiKey) {
    return new HuggingFaceService(apiKey);
  }

  async callAPI(prompt, maxTokens = 1000) {
    if (!this.apiKey) {
      throw new Error('FALLBACK_MODE');
    }

    try {
      // Using the new Hugging Face Inference API
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct',
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: maxTokens,
            temperature: 0.7,
            return_full_text: false,
          },
          options: {
            wait_for_model: true,
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60 seconds
        }
      );

      // Handle different response formats
      if (Array.isArray(response.data) && response.data[0]?.generated_text) {
        return response.data[0].generated_text.trim();
      } else if (response.data?.generated_text) {
        return response.data.generated_text.trim();
      } else if (typeof response.data === 'string') {
        return response.data.trim();
      }

      throw new Error('Invalid response format from Hugging Face API');
    } catch (error) {
      if (error.response?.status === 503) {
        // Model is loading
        console.log('Model is loading, waiting 20 seconds...');
        await new Promise(resolve => setTimeout(resolve, 20000));
        return this.callAPI(prompt, maxTokens);
      }
      throw error;
    }
  }

  async explainCode(code, language) {
    if (!this.apiKey) {
      throw new Error('FALLBACK_MODE');
    }
    
    const prompt = `You are an expert programming instructor. Explain the following ${language} code in detail:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. What the code does overall
2. How each part works step by step
3. Key concepts and patterns used
4. Best practices and potential improvements
5. Common use cases

Make your explanation clear and educational.`;

    try {
      return await this.callAPI(prompt, 1500);
    } catch (error) {
      console.error('Hugging Face API error:', error.message);
      throw new Error('FALLBACK_MODE');
    }
  }

  async optimizeCode(code, language) {
    if (!this.apiKey) {
      throw new Error('FALLBACK_MODE');
    }
    
    const prompt = `You are a senior software engineer. Optimize the following ${language} code for better performance and readability:

Original code:
\`\`\`${language}
${code}
\`\`\`

Provide:
1. The optimized version of the code
2. Explanation of improvements made
3. Performance benefits
4. Why these changes are better

Focus on efficiency and maintainability.`;

    try {
      return await this.callAPI(prompt, 1500);
    } catch (error) {
      console.error('Hugging Face API error:', error.message);
      throw new Error('Failed to optimize code');
    }
  }

  async debugCode(code, language, errorMessage = '') {
    if (!this.apiKey) {
      throw new Error('FALLBACK_MODE');
    }
    
    const prompt = `You are an expert debugger. Fix this ${language} code.

Code:
\`\`\`${language}
${code}
\`\`\`

${errorMessage ? `Error: ${errorMessage}\n\n` : ''}

Provide:
1. The COMPLETE fixed code in a code block
2. Explanation of what was wrong
3. How you fixed it

Start with the fixed code, then explain.`;

    try {
      return await this.callAPI(prompt, 2000);
    } catch (error) {
      console.error('Hugging Face API error:', error.message);
      throw new Error('Failed to debug code');
    }
  }

  async convertCode(code, fromLanguage, toLanguage) {
    if (!this.apiKey) {
      throw new Error('FALLBACK_MODE');
    }
    
    const prompt = `Convert this ${fromLanguage} code to ${toLanguage}:

${fromLanguage} code:
\`\`\`${fromLanguage}
${code}
\`\`\`

Provide:
1. The converted ${toLanguage} code
2. Key differences between languages
3. ${toLanguage}-specific optimizations used

Make it idiomatic ${toLanguage} code.`;

    try {
      return await this.callAPI(prompt, 1500);
    } catch (error) {
      console.error('Hugging Face API error:', error.message);
      throw new Error('Failed to convert code');
    }
  }

  async generateCode(description, language) {
    if (!this.apiKey) {
      throw new Error('FALLBACK_MODE');
    }
    
    const prompt = `Generate ${language} code based on these requirements:

Requirements: ${description}

Provide:
1. Complete, working ${language} code
2. Comments explaining the logic
3. Brief explanation of the approach
4. Usage examples if applicable

Make it production-ready and well-documented.`;

    try {
      return await this.callAPI(prompt, 1500);
    } catch (error) {
      console.error('Hugging Face API error:', error.message);
      throw new Error('Failed to generate code');
    }
  }

  async chatWithCode(message, code, language, conversationHistory = []) {
    if (!this.apiKey) {
      throw new Error('FALLBACK_MODE');
    }
    
    let prompt = `You are an expert programming assistant.\n\n`;
    
    if (conversationHistory.length > 0) {
      prompt += `Previous conversation:\n`;
      conversationHistory.slice(-3).forEach(msg => {
        prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
      prompt += `\n`;
    }

    if (code) {
      prompt += `Current ${language} code:\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
    }

    prompt += `User question: ${message}\n\nProvide a helpful, clear response.`;

    try {
      return await this.callAPI(prompt, 1000);
    } catch (error) {
      console.error('Hugging Face API error:', error.message);
      throw new Error('Failed to chat');
    }
  }

  async getCodeSuggestions(partialCode, language, cursorPosition) {
    if (!this.apiKey) {
      throw new Error('FALLBACK_MODE');
    }
    
    const prompt = `As a code completion assistant, suggest completions for this ${language} code:

\`\`\`${language}
${partialCode}
\`\`\`

Cursor at position: ${cursorPosition}

Suggest:
1. Possible completions
2. Next logical steps
3. Common patterns
4. Variable/function names

Be practical and contextual.`;

    try {
      return await this.callAPI(prompt, 800);
    } catch (error) {
      console.error('Hugging Face API error:', error.message);
      throw new Error('Failed to get suggestions');
    }
  }

  async executeCode(code, language) {
    if (!this.apiKey) {
      throw new Error('FALLBACK_MODE');
    }
    
    const prompt = `Simulate execution of this ${language} code and show the terminal output:

\`\`\`${language}
${code}
\`\`\`

Provide ONLY the console output as it would appear. No explanations.`;

    try {
      return await this.callAPI(prompt, 1000);
    } catch (error) {
      console.error('Hugging Face API error:', error.message);
      throw new Error('Failed to execute code');
    }
  }

  async learningChat(message, conversationHistory = []) {
    if (!this.apiKey) {
      throw new Error('FALLBACK_MODE');
    }
    
    let prompt = `You are AI Learnixo, a friendly programming tutor. Help students learn programming clearly and patiently.\n\n`;
    
    if (conversationHistory.length > 0) {
      prompt += `Previous conversation:\n`;
      conversationHistory.slice(-4).forEach(msg => {
        prompt += `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}\n`;
      });
      prompt += `\n`;
    }

    prompt += `Student question: ${message}\n\nProvide a helpful, educational response with examples when relevant.`;

    try {
      console.log('Calling Hugging Face API for learning chat...');
      const response = await this.callAPI(prompt, 1200);
      console.log('Hugging Face API response received successfully');
      return response;
    } catch (error) {
      console.error('Hugging Face API error in learningChat:', error.message);
      throw new Error('FALLBACK_MODE');
    }
  }
}

// Export both the class and a default instance
module.exports = new HuggingFaceService();
module.exports.HuggingFaceService = HuggingFaceService;
