const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const geminiService = require('../services/geminiService');
const { getFallbackResponse } = require('../services/fallbackResponses');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

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

    const explanation = await geminiService.explainCode(code, language);

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
    console.error('Explain code error:', error);

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
        message: 'The AI model (gemini-1.5-flash) is currently unavailable or not supported by your API key. Please ensure Generative Language API is enabled.'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to explain code',
    });
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

    const response = await geminiService.optimizeCode(code, language);

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
        message: 'The AI model (gemini-1.5-flash) is currently unavailable or not supported by your API key. Please ensure Generative Language API is enabled.'
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

    const debugSuggestions = await geminiService.debugCode(code, language, errorMessage);

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
        message: 'The AI model (gemini-1.5-flash) is currently unavailable or not supported by your API key. Please ensure Generative Language API is enabled.'
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

    const response = await geminiService.convertCode(code, fromLanguage, toLanguage);

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
        message: 'The AI model (gemini-1.5-flash) is currently unavailable or not supported by your API key. Please ensure Generative Language API is enabled.'
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

    const response = await geminiService.generateCode(description, language);

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
        message: 'The AI model (gemini-1.5-flash) is currently unavailable or not supported by your API key. Please ensure Generative Language API is enabled.'
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

    const response = await geminiService.chatWithCode(message, code, language, conversationHistory);

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
        message: 'The AI model (gemini-1.5-flash) is currently unavailable or not supported by your API key. Please ensure Generative Language API is enabled.'
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

    const suggestions = await geminiService.getCodeSuggestions(partialCode, language, cursorPosition);

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
        message: 'The AI model (gemini-1.5-flash) is currently unavailable or not supported by your API key. Please ensure Generative Language API is enabled.'
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

    const output = await geminiService.executeCode(code, language);

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
        message: 'The AI model (gemini-1.5-flash) is currently unavailable or not supported by your API key. Please ensure Generative Language API is enabled.'
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

    let response;
    let usedFallback = false;

    try {
      response = await geminiService.learningChat(message, conversationHistory);
      console.log('Learning chat response received from Gemini');
    } catch (geminiError) {
      console.warn('Gemini API failed, using fallback response:', geminiError.message);
      response = getFallbackResponse(message);
      usedFallback = true;
    }

    // Log the interaction
    try {
      await logAIInteraction(req.user.id, 'learn-chat', message, response, 0);
    } catch (logError) {
      console.error('Failed to log interaction:', logError);
      // Continue even if logging fails
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
    });

    if (error.message.includes('quota') || error.message.includes('limit')) {
      return res.status(429).json({
        error: 'API quota exceeded',
        message: 'Gemini API quota has been exceeded. Please try again later.',
      });
    }

    if (error.message.includes('API key')) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'AI service is not properly configured. Please check API key.',
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Failed to chat with AI Learnixo',
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

module.exports = router;
