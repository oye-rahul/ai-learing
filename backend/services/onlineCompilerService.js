const axios = require('axios');

/**
 * Online Compiler Service
 * Uses Piston API (free, open-source) for code execution
 * No installation required - works entirely online
 */

// Piston API endpoint (free, no API key needed)
const PISTON_API = 'https://emkc.org/api/v2/piston';

// Language mapping for Piston API
const LANGUAGE_MAP = {
  javascript: { language: 'javascript', version: '18.15.0' },
  python: { language: 'python', version: '3.10.0' },
  java: { language: 'java', version: '15.0.2' },
  cpp: { language: 'c++', version: '10.2.0' },
  c: { language: 'c', version: '10.2.0' },
  csharp: { language: 'csharp', version: '6.12.0' },
  go: { language: 'go', version: '1.16.2' },
  rust: { language: 'rust', version: '1.68.2' },
  php: { language: 'php', version: '8.2.3' },
  typescript: { language: 'typescript', version: '5.0.3' },
  ruby: { language: 'ruby', version: '3.0.1' },
  swift: { language: 'swift', version: '5.3.3' },
  kotlin: { language: 'kotlin', version: '1.8.20' },
  scala: { language: 'scala', version: '3.2.2' },
  perl: { language: 'perl', version: '5.36.0' },
  lua: { language: 'lua', version: '5.4.4' },
  r: { language: 'r', version: '4.1.1' },
  dart: { language: 'dart', version: '2.19.6' },
  elixir: { language: 'elixir', version: '1.11.3' },
  haskell: { language: 'haskell', version: '9.0.1' }
};

/**
 * Execute code using Piston API
 * @param {string} code - Source code to execute
 * @param {string} language - Programming language
 * @param {string} input - Standard input for the program
 * @returns {Promise<Object>} Execution result
 */
async function executeCode(code, language, input = '') {
  try {
    const langConfig = LANGUAGE_MAP[language.toLowerCase()];
    
    if (!langConfig) {
      throw new Error(`Unsupported language: ${language}. Supported languages: ${Object.keys(LANGUAGE_MAP).join(', ')}`);
    }

    const startTime = Date.now();

    // Prepare request for Piston API
    const requestData = {
      language: langConfig.language,
      version: langConfig.version,
      files: [
        {
          name: getFileName(language),
          content: code
        }
      ],
      stdin: input || '',
      args: [],
      compile_timeout: 10000,
      run_timeout: 3000,
      compile_memory_limit: -1,
      run_memory_limit: -1
    };

    // Execute code via Piston API
    const response = await axios.post(`${PISTON_API}/execute`, requestData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    const executionTime = Date.now() - startTime;
    const result = response.data;

    // Check if compilation failed
    if (result.compile && result.compile.code !== 0) {
      return {
        success: false,
        output: result.compile.stdout || '',
        error: result.compile.stderr || 'Compilation failed',
        exitCode: result.compile.code,
        executionTime: `${executionTime}ms`,
        language: language,
        online: true
      };
    }

    // Check if execution failed
    if (result.run && result.run.code !== 0) {
      return {
        success: false,
        output: result.run.stdout || '',
        error: result.run.stderr || 'Runtime error',
        exitCode: result.run.code,
        executionTime: `${executionTime}ms`,
        language: language,
        online: true
      };
    }

    // Success
    return {
      success: true,
      output: result.run.stdout || '',
      error: result.run.stderr || '',
      exitCode: result.run.code || 0,
      executionTime: `${executionTime}ms`,
      language: language,
      online: true
    };

  } catch (error) {
    console.error('Online compiler error:', error.message);
    
    if (error.response) {
      return {
        success: false,
        output: '',
        error: `API Error: ${error.response.data?.message || error.message}`,
        exitCode: -1,
        executionTime: '0ms',
        language: language,
        online: true
      };
    }

    return {
      success: false,
      output: '',
      error: `Execution failed: ${error.message}`,
      exitCode: -1,
      executionTime: '0ms',
      language: language,
      online: true
    };
  }
}

/**
 * Get appropriate filename for language
 */
function getFileName(language) {
  const fileNames = {
    javascript: 'main.js',
    python: 'main.py',
    java: 'Main.java',
    cpp: 'main.cpp',
    c: 'main.c',
    csharp: 'Main.cs',
    go: 'main.go',
    rust: 'main.rs',
    php: 'main.php',
    typescript: 'main.ts',
    ruby: 'main.rb',
    swift: 'main.swift',
    kotlin: 'Main.kt',
    scala: 'Main.scala',
    perl: 'main.pl',
    lua: 'main.lua',
    r: 'main.r',
    dart: 'main.dart',
    elixir: 'main.exs',
    haskell: 'main.hs'
  };
  
  return fileNames[language.toLowerCase()] || 'main.txt';
}

/**
 * Get list of supported languages
 */
function getSupportedLanguages() {
  return Object.keys(LANGUAGE_MAP).map(lang => ({
    name: lang,
    displayName: lang.charAt(0).toUpperCase() + lang.slice(1),
    version: LANGUAGE_MAP[lang].version,
    online: true
  }));
}

/**
 * Check if online compiler service is available
 */
async function checkHealth() {
  try {
    const response = await axios.get(`${PISTON_API}/runtimes`, {
      timeout: 5000
    });
    
    return {
      available: true,
      runtimes: response.data.length,
      message: 'Online compiler service is available'
    };
  } catch (error) {
    return {
      available: false,
      runtimes: 0,
      message: `Service unavailable: ${error.message}`
    };
  }
}

module.exports = {
  executeCode,
  getSupportedLanguages,
  checkHealth,
  LANGUAGE_MAP
};
