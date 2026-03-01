const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const geminiService = require('../services/geminiService');
const { getFallbackResponse } = require('../services/fallbackResponses');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Helper to handle Gemini API errors consistently
const handleGeminiError = (error, res) => {
  console.error('Gemini API error:', error);

  if (error.message === 'FALLBACK_MODE') {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'The AI service is currently in demo mode or unavailable. Please try again later or check your API key.',
    });
  }

  if (error.message === 'API_QUOTA_EXCEEDED' || error.message.includes('quota') || error.message.includes('limit')) {
    return res.status(429).json({
      error: 'API quota exceeded',
      message: 'Gemini API quota has been exceeded. Please try again later.',
    });
  }

  if (error.message.includes('API key') || error.message.includes('API_KEY_INVALID') || error.status === 400) {
    return res.status(400).json({
      error: 'Invalid API Key',
      message: 'The Gemini API key is invalid or missing. Please ensure you have a valid key in backend/.env'
    });
  }

  if (error.status === 404 || error.message.includes('not found')) {
    return res.status(404).json({
      error: 'Model Unavailable',
      message: 'The AI model is not accessible. Please ensure you are using the correct model (gemini-2.5-flash) and it is enabled for your API key.'
    });
  }

  return res.status(error.status || 500).json({
    error: 'Internal server error',
    message: error.message || 'Failed to process AI request',
  });
};

// Helper to get Gemini service with custom API key if provided
const getGeminiService = (req) => {
  const customApiKey = req.headers['x-gemini-key'];

  // Only use custom key if it's a non-empty string and not the string "null" or "undefined"
  if (customApiKey &&
    customApiKey.trim() !== '' &&
    customApiKey !== 'null' &&
    customApiKey !== 'undefined' &&
    customApiKey !== 'undefined') {

    console.log(`✅ Using custom API key from request header (Starts with: ${customApiKey.substring(0, 10)}...)`);
    const { GeminiService } = require('../services/geminiService');
    return new GeminiService(customApiKey);
  }

  console.log('ℹ️ Using default API key from environment');
  return geminiService;
};

// Helper function to log AI interactions (SQLite placeholders)
const logAIInteraction = async (userId, promptType, inputCode, output, tokensUsed = 0) => {
  try {
    await query(
      `INSERT INTO ai_interactions (id, user_id, prompt_type, input_code, output, tokens_used, created_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [uuidv4(), userId, promptType, inputCode, output, tokensUsed]
    );
  } catch (error) {
    console.error('Failed to log AI interaction:', error);
  }
};

// Explain code
router.post('/explain', authenticateToken, [
  body('code').notEmpty().trim(),
  body('language').notEmpty().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { code, language } = req.body;

    const service = getGeminiService(req);
    const explanation = await service.explainCode(code, language);

    // Log the interaction
    await logAIInteraction(req.user.id, 'explain', code, explanation, 0);

    res.json({
      id: uuidv4(),
      explanation,
      input_code: code,
      language,
      tokens_used: 0,
    });
  } catch (error) {
    return handleGeminiError(error, res);
  }
});

// Optimize code
router.post('/optimize', authenticateToken, [
  body('code').notEmpty().trim(),
  body('language').notEmpty().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { code, language } = req.body;

    const service = getGeminiService(req);
    const response = await service.optimizeCode(code, language);

    // Extract optimized code (simple extraction, could be improved)
    const codeMatch = response.match(/```[\w]*\n([\s\S]*?)\n```/);
    const optimizedCode = codeMatch ? codeMatch[1] : code;

    // Log the interaction
    await logAIInteraction(req.user.id, 'optimize', code, response, 0);

    res.json({
      id: uuidv4(),
      optimized_code: optimizedCode,
      explanation: response,
      input_code: code,
      language,
      tokens_used: 0,
    });
  } catch (error) {
    console.error('Optimize code error:', error);

    if (error.message.includes('quota') || error.message.includes('limit')) {
      return res.status(429).json({
        error: 'API quota exceeded',
        message: 'Gemini API quota has been exceeded. Please try again later.',
      });
    }

    if (error.message.includes('API key') || error.message.includes('API_KEY_INVALID') || error.status === 400) {
      return res.status(400).json({
        error: 'Invalid API Key',
        message: 'The Gemini API key is invalid or missing. Please update backend/.env with a valid key.'
      });
    }

    if (error.status === 404 || error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Model Unavailable',
        message: 'The AI model (gemini-2.5-flash) is currently unavailable or not supported by your API key. Please ensure Generative Language API is enabled.'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to optimize code',
    });
  }
});

// Debug code
router.post('/debug', authenticateToken, [
  body('code').notEmpty().trim(),
  body('language').notEmpty().trim(),
  body('error').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { code, language, error: errorMessage } = req.body;

    const service = getGeminiService(req);
    const debugSuggestions = await service.debugCode(code, language, errorMessage);

    // Log the interaction
    await logAIInteraction(req.user.id, 'debug', code, debugSuggestions, 0);

    res.json({
      id: uuidv4(),
      debug_suggestions: debugSuggestions,
      input_code: code,
      language,
      error_message: errorMessage,
      tokens_used: 0,
    });
  } catch (error) {
    console.error('Debug code error:', error);

    if (error.message.includes('quota') || error.message.includes('limit')) {
      return res.status(429).json({
        error: 'API quota exceeded',
        message: 'Gemini API quota has been exceeded. Please try again later.',
      });
    }

    if (error.message.includes('API key') || error.message.includes('API_KEY_INVALID') || error.status === 400) {
      return res.status(400).json({
        error: 'Invalid API Key',
        message: 'The Gemini API key is invalid or missing. Please update backend/.env with a valid key.'
      });
    }

    if (error.status === 404 || error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Model Unavailable',
        message: 'The AI model (gemini-2.5-flash) is currently unavailable or not supported by your API key. Please ensure Generative Language API is enabled.'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to debug code',
    });
  }
});

// Convert code between languages
router.post('/convert', authenticateToken, [
  body('code').notEmpty().trim(),
  body('fromLanguage').notEmpty().trim(),
  body('toLanguage').notEmpty().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { code, fromLanguage, toLanguage } = req.body;

    const service = getGeminiService(req);
    const response = await service.convertCode(code, fromLanguage, toLanguage);

    // Extract converted code
    const codeMatch = response.match(/```[\w]*\n([\s\S]*?)\n```/);
    const convertedCode = codeMatch ? codeMatch[1] : response;

    await logAIInteraction(req.user.id, 'convert', code, response, 0);

    res.json({
      id: uuidv4(),
      converted_code: convertedCode,
      explanation: response,
      input_code: code,
      from_language: fromLanguage,
      to_language: toLanguage,
      tokens_used: 0,
    });
  } catch (error) {
    console.error('Convert code error:', error);

    if (error.message.includes('quota') || error.message.includes('limit')) {
      return res.status(429).json({
        error: 'API quota exceeded',
        message: 'Gemini API quota has been exceeded. Please try again later.',
      });
    }

    if (error.message.includes('API key') || error.message.includes('API_KEY_INVALID') || error.status === 400) {
      return res.status(400).json({
        error: 'Invalid API Key',
        message: 'The Gemini API key is invalid or missing. Please update backend/.env with a valid key.'
      });
    }

    if (error.status === 404 || error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Model Unavailable',
        message: 'The AI model (gemini-2.5-flash) is currently unavailable or not supported by your API key. Please ensure Generative Language API is enabled.'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to convert code',
    });
  }
});

// Generate code from description
router.post('/generate', authenticateToken, [
  body('description').notEmpty().trim(),
  body('language').notEmpty().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { description, language } = req.body;

    const service = getGeminiService(req);
    const response = await service.generateCode(description, language);

    // Extract generated code
    const codeMatch = response.match(/```[\w]*\n([\s\S]*?)\n```/);
    const generatedCode = codeMatch ? codeMatch[1] : response;

    // Log the interaction
    await logAIInteraction(req.user.id, 'generate', description, response, 0);

    res.json({
      id: uuidv4(),
      generated_code: generatedCode,
      explanation: response,
      description,
      language,
      tokens_used: 0,
    });
  } catch (error) {
    console.error('Generate code error:', error);

    if (error.message.includes('quota') || error.message.includes('limit')) {
      return res.status(429).json({
        error: 'API quota exceeded',
        message: 'Gemini API quota has been exceeded. Please try again later.',
      });
    }

    if (error.message.includes('API key') || error.message.includes('API_KEY_INVALID') || error.status === 400) {
      return res.status(400).json({
        error: 'Invalid API Key',
        message: 'The Gemini API key is invalid or missing. Please update backend/.env with a valid key.'
      });
    }

    if (error.status === 404 || error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Model Unavailable',
        message: 'The AI model (gemini-2.5-flash) is currently unavailable or not supported by your API key. Please ensure Generative Language API is enabled.'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate code',
    });
  }
});

// Chat with AI about code
router.post('/chat', authenticateToken, [
  body('message').notEmpty().trim(),
  body('code').optional().trim(),
  body('language').optional().trim(),
  body('conversationHistory').optional().isArray(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { message, code = '', language = 'javascript', conversationHistory = [] } = req.body;

    const service = getGeminiService(req);
    const response = await service.chatWithCode(message, code, language, conversationHistory);

    // Log the interaction
    await logAIInteraction(req.user.id, 'chat', message, response, 0);

    res.json({
      id: uuidv4(),
      response,
      message,
      code,
      language,
      tokens_used: 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat error:', error);

    if (error.message.includes('quota') || error.message.includes('limit')) {
      return res.status(429).json({
        error: 'API quota exceeded',
        message: 'Gemini API quota has been exceeded. Please try again later.',
      });
    }

    if (error.message.includes('API key') || error.message.includes('API_KEY_INVALID') || error.status === 400) {
      return res.status(400).json({
        error: 'Invalid API Key',
        message: 'The Gemini API key is invalid or missing. Please update backend/.env with a valid key.'
      });
    }

    if (error.status === 404 || error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Model Unavailable',
        message: 'The AI model (gemini-2.5-flash) is currently unavailable or not supported by your API key. Please ensure Generative Language API is enabled.'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to chat with AI',
    });
  }
});

// Get code suggestions
router.post('/suggestions', authenticateToken, [
  body('partialCode').notEmpty().trim(),
  body('language').notEmpty().trim(),
  body('cursorPosition').optional().isNumeric(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { partialCode, language, cursorPosition = 0 } = req.body;

    const service = getGeminiService(req);
    const suggestions = await service.getCodeSuggestions(partialCode, language, cursorPosition);

    // Log the interaction
    await logAIInteraction(req.user.id, 'suggestions', partialCode, suggestions, 0);

    res.json({
      id: uuidv4(),
      suggestions,
      partial_code: partialCode,
      language,
      cursor_position: cursorPosition,
      tokens_used: 0,
    });
  } catch (error) {
    console.error('Get suggestions error:', error);

    if (error.message.includes('quota') || error.message.includes('limit')) {
      return res.status(429).json({
        error: 'API quota exceeded',
        message: 'Gemini API quota has been exceeded. Please try again later.',
      });
    }

    if (error.message.includes('API key') || error.message.includes('API_KEY_INVALID') || error.status === 400) {
      return res.status(400).json({
        error: 'Invalid API Key',
        message: 'The Gemini API key is invalid or missing. Please update backend/.env with a valid key.'
      });
    }

    if (error.status === 404 || error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Model Unavailable',
        message: 'The AI model (gemini-2.5-flash) is currently unavailable or not supported by your API key. Please ensure Generative Language API is enabled.'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get code suggestions',
    });
  }
});

// Execute code (AI Simulation)
router.post('/execute', authenticateToken, [
  body('code').notEmpty().trim(),
  body('language').notEmpty().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { code, language } = req.body;

    const service = getGeminiService(req);
    const output = await service.executeCode(code, language);

    // Log the interaction
    await logAIInteraction(req.user.id, 'execute', code, output, 0);

    res.json({
      id: uuidv4(),
      output,
      input_code: code,
      language,
      tokens_used: 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Execute code error:', error);

    if (error.message.includes('quota') || error.message.includes('limit')) {
      return res.status(429).json({
        error: 'API quota exceeded',
        message: 'Gemini API quota has been exceeded. Please try again later.',
      });
    }

    if (error.message.includes('API key') || error.message.includes('API_KEY_INVALID') || error.status === 400) {
      return res.status(400).json({
        error: 'Invalid API Key',
        message: 'The Gemini API key is invalid or missing. Please update backend/.env with a valid key.'
      });
    }

    if (error.status === 404 || error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Model Unavailable',
        message: 'The AI model (gemini-2.5-flash) is currently unavailable or not supported by your API key. Please ensure Generative Language API is enabled.'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to execute code simulation',
    });
  }
});

// AI Learnixo - Learning focused chat
router.post('/learn-chat', authenticateToken, [
  body('message').notEmpty().trim(),
  body('conversationHistory').optional().isArray(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { message, conversationHistory = [] } = req.body;
    console.log('Learning chat request:', { message, historyLength: conversationHistory.length });

    const service = getGeminiService(req);
    console.log('🔑 Using Gemini service for learning chat...');
    const response = await service.learningChat(message, conversationHistory);
    const usedFallback = service.lastResponseUsedFallback;

    if (usedFallback) {
      console.warn('⚠️ Response was generated using fallback mode');
    } else {
      console.log('✅ Learning chat response received from Gemini');
    }

    // Log the interaction
    try {
      await logAIInteraction(req.user.id, 'learn-chat', message, response, 0);
    } catch (logError) {
      console.error('Failed to log interaction:', logError);
    }

    res.json({
      id: uuidv4(),
      response,
      message,
      tokens_used: 0,
      timestamp: new Date().toISOString(),
      fallback: usedFallback,
    });
  } catch (error) {
    console.error('Learning chat error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      status: error.status
    });

    if (error.message.includes('quota') || error.message.includes('limit')) {
      return res.status(429).json({
        error: 'API quota exceeded',
        message: 'Gemini API quota has been exceeded. Please try again later.',
      });
    }

    if (error.message.includes('API key') || error.message.includes('API_KEY_INVALID')) {
      return res.status(400).json({
        error: 'Invalid API Key',
        message: 'The Gemini API key is invalid. Please create a NEW key from Google AI Studio: https://aistudio.google.com/app/apikey'
      });
    }

    if (error.status === 404 || error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Model Unavailable',
        message: 'The AI model is not accessible. Your API key might not have Generative Language API enabled. Please create a NEW key from Google AI Studio: https://aistudio.google.com/app/apikey'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Failed to chat with AI Learnixo',
    });
  }
});

// AI Assistant - Mode-specific chat
router.post('/assistant-chat', authenticateToken, [
  body('message').notEmpty().trim(),
  body('mode').notEmpty().trim(),
  body('conversationHistory').optional().isArray(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { message, mode, conversationHistory = [] } = req.body;
    const service = getGeminiService(req);
    const response = await service.assistantModeChat(message, mode, conversationHistory);
    const usedFallback = service.lastResponseUsedFallback;

    // Log the interaction
    await logAIInteraction(req.user.id, `assistant-${mode}`, message, response, 0);

    res.json({
      id: uuidv4(),
      response,
      message,
      mode,
      fallback: usedFallback,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Assistant chat error:', error);
    return handleGeminiError(error, res);
  }
});

// Test API key endpoint
router.post('/test-key', authenticateToken, async (req, res) => {
  try {
    const customApiKey = req.headers['x-gemini-key'];

    if (!customApiKey) {
      return res.status(400).json({
        success: false,
        error: 'No API key provided',
        message: 'Please provide an API key in X-Gemini-Key header'
      });
    }

    console.log('🔑 Testing API key:', customApiKey.substring(0, 10) + '...');

    // Test the API key with a simple request
    const { GeminiService } = require('../services/geminiService');
    const service = new GeminiService(customApiKey);

    // Simple test prompt
    const testResponse = await service.learningChat('Say "Hello" in one word', []);

    console.log('✅ API key test successful!');

    res.json({
      success: true,
      message: 'API key is valid and working! All AI features are now active.',
      tested: true
    });
  } catch (error) {
    console.error('❌ API key test error:', error.message);

    if (error.message.includes('API_KEY_INVALID') || error.message.includes('API key')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid API Key',
        message: 'The API key is invalid. Please create a NEW key from Google AI Studio: https://aistudio.google.com/app/apikey'
      });
    }

    if (error.status === 404 || error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: 'Model Not Accessible',
        message: 'Your API key cannot access Gemini models. Please create a NEW key from Google AI Studio (not Google Cloud Console): https://aistudio.google.com/app/apikey'
      });
    }

    if (error.message.includes('quota') || error.message.includes('limit')) {
      return res.status(429).json({
        success: false,
        error: 'Quota Exceeded',
        message: 'API quota has been exceeded. Please try again later or use a different key.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Test failed',
      message: error.message || 'Failed to verify API key. Please try creating a NEW key from Google AI Studio.'
    });
  }
});

// Get user's files (SQLite)
router.get('/files', authenticateToken, async (req, res) => {
  try {
    const files = await query(
      'SELECT * FROM user_files WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({
      files: files.rows || [],
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve files',
    });
  }
});

// Create a new file
router.post('/files/create', authenticateToken, [
  body('fileName').notEmpty().trim(),
  body('content').optional(),
  body('language').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { fileName, content = '', language = 'javascript' } = req.body;
    const fileId = uuidv4();

    await query(
      `INSERT INTO user_files (id, user_id, name, content, language, type, path, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [fileId, req.user.id, fileName, content, language, 'file', `/files/${fileName}`]
    );

    const newFile = {
      id: fileId,
      name: fileName,
      content,
      language,
      type: 'file',
      path: `/files/${fileName}`,
    };

    res.json({
      message: 'File created successfully',
      file: newFile,
    });
  } catch (error) {
    console.error('Create file error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create file',
    });
  }
});

// Update a file
router.put('/files/:fileId', authenticateToken, [
  body('content').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { fileId } = req.params;
    const { content } = req.body;

    const result = await query(
      'UPDATE user_files SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [content, fileId, req.user.id]
    );

    if ((result.rowCount || 0) === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'File not found or you do not have permission to edit it',
      });
    }

    res.json({
      message: 'File updated successfully',
    });
  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update file',
    });
  }
});

// Delete a file
router.delete('/files/:fileId', authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params;

    const result = await query(
      'DELETE FROM user_files WHERE id = ? AND user_id = ?',
      [fileId, req.user.id]
    );

    if ((result.rowCount || 0) === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'File not found or you do not have permission to delete it',
      });
    }

    res.json({
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete file',
    });
  }
});

// Alias for explain code
router.post('/explain-code', authenticateToken, [
  body('code').notEmpty().trim(),
  body('language').notEmpty().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    const { code, language } = req.body;
    const service = getGeminiService(req);
    const explanation = await service.explainCode(code, language);
    await logAIInteraction(req.user.id, 'explain', code, explanation, 0);
    res.json({ id: uuidv4(), explanation, input_code: code, language });
  } catch (error) {
    return handleGeminiError(error, res);
  }
});

// Alias for debug help
router.post('/debug-help', authenticateToken, [
  body('code').notEmpty().trim(),
  body('language').notEmpty().trim(),
  body('error').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    const { code, language, error: errorMessage } = req.body;
    const service = getGeminiService(req);
    const debugSuggestions = await service.debugCode(code, language, errorMessage);
    await logAIInteraction(req.user.id, 'debug', code, debugSuggestions, 0);
    res.json({ id: uuidv4(), debug_suggestions: debugSuggestions, input_code: code, language, error_message: errorMessage });
  } catch (error) {
    return handleGeminiError(error, res);
  }
});

// Generate practice problems
router.post('/generate-practice', authenticateToken, [
  body('skillLevel').optional().trim(),
  body('topic').optional().trim(),
], async (req, res) => {
  try {
    const { skillLevel = 'beginner', topic = 'javascript' } = req.body;
    const service = getGeminiService(req);
    const problem = await service.generatePracticeProblem(skillLevel, topic);

    // Save to database
    const problemId = uuidv4();
    await query(
      'INSERT INTO practice_problems (id, user_id, problem, difficulty) VALUES (?, ?, ?, ?)',
      [problemId, req.user.id, JSON.stringify(problem), problem.difficulty]
    );

    res.json({ id: problemId, ...problem });
  } catch (error) {
    return handleGeminiError(error, res);
  }
});

// Get learning insights
router.get('/insights/:userId', authenticateToken, async (req, res) => {
  try {
    if (req.params.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const userProgress = await query('SELECT * FROM user_progress WHERE user_id = ?', [req.params.userId]);
    const aiInteractions = await query('SELECT prompt_type, COUNT(*) as count FROM ai_interactions WHERE user_id = ? GROUP BY prompt_type', [req.params.userId]);
    const assessments = await query('SELECT * FROM assessment_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [req.params.userId]);

    const userData = {
      progress: userProgress.rows[0] || {},
      aiUsage: aiInteractions.rows || [],
      assessment: assessments.rows[0] || {}
    };

    const service = getGeminiService(req);
    const insights = await service.getLearningInsights(userData);

    const insightId = uuidv4();
    const existing = await query('SELECT id FROM learning_insights WHERE user_id = ?', [req.params.userId]);

    if (existing.rows.length > 0) {
      await query(
        'UPDATE learning_insights SET strengths = ?, weaknesses = ?, recommendations = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [JSON.stringify(insights.strengths || []), JSON.stringify(insights.weaknesses || []), JSON.stringify(insights.recommendations || []), req.params.userId]
      );
    } else {
      await query(
        'INSERT INTO learning_insights (id, user_id, strengths, weaknesses, recommendations) VALUES (?, ?, ?, ?, ?)',
        [insightId, req.params.userId, JSON.stringify(insights.strengths || []), JSON.stringify(insights.weaknesses || []), JSON.stringify(insights.recommendations || [])]
      );
    }

    res.json(insights);
  } catch (error) {
    return handleGeminiError(error, res);
  }
});

module.exports = router;
