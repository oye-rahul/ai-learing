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

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const crypto = require('crypto');

/**
 * Execute code using local child_process (Fallback because Piston public API is whitelist-only)
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
    
    // Create temp directory if not exists
    const tempDir = path.join(__dirname, '../temp');
    try {
      await fs.mkdir(tempDir, { recursive: true });
    } catch(err) {}

    const fileId = crypto.randomBytes(8).toString('hex');
    const langLower = language.toLowerCase();
    const isJava = langLower === 'java';
    
    // Map language to correct file extension
    const extMap = {
      python: 'py', javascript: 'js', java: 'java',
      cpp: 'cpp', c: 'c', go: 'go', rust: 'rs',
      php: 'php', typescript: 'ts', ruby: 'rb',
    };
    const ext = extMap[langLower] || 'txt';

    let fileName;
    
    if (isJava) {
      // Find class name from code if it's java, else use Main
      const classNameMatch = code.match(/public\s+class\s+([a-zA-Z0-9_]+)/);
      const className = classNameMatch ? classNameMatch[1] : 'Main';
      fileName = `${className}.java`;
    } else {
      fileName = `script_${fileId}.${ext}`;
    }
    
    const filePath = path.join(tempDir, fileName);
    await fs.writeFile(filePath, code);

    // Write input to a temp file
    const inputPath = path.join(tempDir, `input_${fileId}.txt`);
    await fs.writeFile(inputPath, input || '');

    return new Promise((resolve) => {
      let command = '';
      if (langLower === 'python') {
        command = `python "${filePath}" < "${inputPath}"`;
      } else if (langLower === 'javascript') {
        command = `node "${filePath}" < "${inputPath}"`;
      } else if (langLower === 'java') {
        command = `cd "${tempDir}" && javac "${fileName}" && java "${fileName.replace('.java', '')}" < "${inputPath}"`;
      } else {
        resolve({
          success: false,
          output: '',
          error: `Local execution for '${language}' is not yet supported. Try Python, JavaScript, or Java.`,
          exitCode: -1,
          executionTime: '0ms',
          language: language,
          online: false
        });
        return;
      }

      exec(command, { timeout: 10000 }, async (error, stdout, stderr) => {
        const executionTime = Date.now() - startTime;
        
        // Cleanup temp files (best effort)
        try {
          await fs.unlink(filePath).catch(()=>null);
          await fs.unlink(inputPath).catch(()=>null);
          if (isJava) {
            await fs.unlink(filePath.replace('.java', '.class')).catch(()=>null);
          }
        } catch (e) {}

        if (error) {
          resolve({
            success: false,
            output: stdout || '',
            error: stderr || error.message,
            exitCode: error.code || -1,
            executionTime: `${executionTime}ms`,
            language: language,
            online: false
          });
        } else {
          resolve({
            success: true,
            output: stdout || '',
            error: stderr || '',
            exitCode: 0,
            executionTime: `${executionTime}ms`,
            language: language,
            online: false
          });
        }
      });
    });

  } catch (error) {
    console.error('Local compiler error:', error.message);
    return {
      success: false,
      output: '',
      error: `Execution failed: ${error.message}`,
      exitCode: -1,
      executionTime: '0ms',
      language: language,
      online: false
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
