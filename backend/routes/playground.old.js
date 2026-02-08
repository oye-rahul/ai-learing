const express = require('express');
const router = express.Router();
const onlineCompiler = require('../services/onlineCompilerService');

// Execute code using online compiler (no local installation needed)
router.post('/execute', async (req, res) => {
  try {
    const { code, language, input } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: 'Code and language are required'
      });
    }

    // Execute code using online compiler service
    const result = await onlineCompiler.executeCode(code, language, input || '');

    res.json({
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      language: req.body.language,
      timestamp: new Date().toISOString()
    });
  }
});

// Get supported languages
router.get('/languages', (req, res) => {
  const languages = onlineCompiler.getSupportedLanguages();

  res.json({
    success: true,
    languages,
    count: languages.length,
    online: true,
    message: 'All languages run online - no installation required!'
  });
});

// Health check for playground
router.get('/health', async (req, res) => {
  const health = await onlineCompiler.checkHealth();
  
  res.json({
    success: health.available,
    status: health.available ? 'healthy' : 'unavailable',
    timestamp: new Date().toISOString(),
    ...health
  });
});

// Get code templates
router.get('/templates/:language', (req, res) => {
  const { language } = req.params;

  const templates = {
    javascript: {
      hello: 'console.log("Hello, World!");',
      function: 'function greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("World"));',
      input: '// Reading input from stdin\nconst readline = require(\'readline\');\nconst rl = readline.createInterface({\n  input: process.stdin,\n  output: process.stdout\n});\n\nrl.question(\'Enter your name: \', (name) => {\n  console.log(`Hello, ${name}!`);\n  rl.close();\n});'
    },
    python: {
      hello: 'print("Hello, World!")',
      function: 'def greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("World"))',
      input: '# Reading input\nname = input("Enter your name: ")\nage = input("Enter your age: ")\nprint(f"Hello {name}, you are {age} years old!")'
    },
    java: {
      hello: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
      input: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        \n        System.out.print("Enter your name: ");\n        String name = scanner.nextLine();\n        \n        System.out.println("Hello, " + name + "!");\n    }\n}'
    },
    cpp: {
      hello: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
      input: '#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string name;\n    int age;\n    \n    cout << "Enter your name: ";\n    cin >> name;\n    \n    cout << "Enter your age: ";\n    cin >> age;\n    \n    cout << "Hello " << name << ", you are " << age << " years old!" << endl;\n    \n    return 0;\n}'
    },
    c: {
      hello: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
      input: '#include <stdio.h>\n\nint main() {\n    char name[50];\n    int age;\n    \n    printf("Enter your name: ");\n    scanf("%s", name);\n    \n    printf("Enter your age: ");\n    scanf("%d", &age);\n    \n    printf("Hello %s, you are %d years old!\\n", name, age);\n    \n    return 0;\n}'
    }
  };

  const languageTemplates = templates[language.toLowerCase()];
  if (!languageTemplates) {
    return res.status(404).json({
      success: false,
      error: `Templates not found for language: ${language}`
    });
  }

  res.json({
    success: true,
    language,
    templates: languageTemplates
  });
});

module.exports = router;

// Create temp directory for code execution
const TEMP_DIR = path.join(os.tmpdir(), 'flowstate-playground');

// Command detection utility
const getCommand = (cmd) => {
  try {
    const checkCmd = os.platform() === 'win32' ? `where ${cmd}` : `which ${cmd}`;
    execSync(checkCmd, { stdio: 'ignore' });
    return cmd;
  } catch (e) {
    if (cmd === 'python') {
      try {
        execSync(os.platform() === 'win32' ? 'where py' : 'which python3', { stdio: 'ignore' });
        return os.platform() === 'win32' ? 'py' : 'python3';
      } catch (e2) {
        return null;
      }
    }
    return null;
  }
};

// Ensure temp directory exists
const ensureTempDir = async () => {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create temp directory:', error);
  }
};

// Initialize temp directory
ensureTempDir();

// Language configurations
const LANGUAGE_CONFIG = {
  javascript: {
    extension: '.js',
    command: getCommand('node'),
    timeout: 10000,
    memoryLimit: '128m'
  },
  python: {
    extension: '.py',
    command: getCommand('python'),
    timeout: 15000,
    memoryLimit: '256m'
  },
  java: {
    extension: '.java',
    command: getCommand('javac'),
    runCommand: 'java',
    timeout: 20000,
    memoryLimit: '512m'
  },
  cpp: {
    extension: '.cpp',
    command: getCommand('g++') || getCommand('gcc'),
    compileArgs: ['-o'],
    timeout: 15000,
    memoryLimit: '256m'
  },
  c: {
    extension: '.c',
    command: getCommand('gcc'),
    compileArgs: ['-o'],
    timeout: 15000,
    memoryLimit: '256m'
  },
  csharp: {
    extension: '.cs',
    command: getCommand('dotnet'),
    args: ['run'],
    timeout: 20000,
    memoryLimit: '512m'
  },
  go: {
    extension: '.go',
    command: getCommand('go'),
    args: ['run'],
    timeout: 15000,
    memoryLimit: '256m'
  },
  rust: {
    extension: '.rs',
    command: getCommand('rustc'),
    timeout: 20000,
    memoryLimit: '256m'
  },
  php: {
    extension: '.php',
    command: getCommand('php'),
    timeout: 10000,
    memoryLimit: '128m'
  }
};

// Helper function to write input to stdin properly
const writeInputToProcess = (process, input) => {
  if (input && input.trim()) {
    const inputLines = input.split('\n').map(line => line.trim()).filter(line => line);
    const formattedInput = inputLines.join('\n') + '\n';
    
    try {
      process.stdin.write(formattedInput, 'utf8');
    } catch (e) {
      console.error('Error writing to stdin:', e);
    }
  }
  // Always close stdin to signal no more input
  process.stdin.end();
};

// Security: Sanitize code to prevent malicious operations
const sanitizeCode = (code, language) => {
  const dangerousPatterns = {
    javascript: [
      /require\s*\(\s*['"`]fs['"`]\s*\)/gi,
      /require\s*\(\s*['"`]child_process['"`]\s*\)/gi,
      /process\.exit/gi,
      /eval\s*\(/gi,
      /Function\s*\(/gi
    ],
    python: [
      /import\s+os/gi,
      /import\s+subprocess/gi,
      /import\s+sys/gi,
      /exec\s*\(/gi,
      /eval\s*\(/gi,
      /__import__/gi
    ],
    java: [
      /Runtime\.getRuntime/gi,
      /ProcessBuilder/gi,
      /System\.exit/gi
    ],
    cpp: [
      /#include\s*<cstdlib>/gi,
      /system\s*\(/gi,
      /exec\s*\(/gi
    ],
    c: [
      /#include\s*<stdlib\.h>/gi,
      /system\s*\(/gi,
      /exec\s*\(/gi
    ]
  };

  const patterns = dangerousPatterns[language] || [];

  for (const pattern of patterns) {
    if (pattern.test(code)) {
      throw new Error(`Potentially dangerous code detected: ${pattern.source}`);
    }
  }

  return code;
};

// Execute code in a sandboxed environment
const executeCode = async (code, language, input = '') => {
  const config = LANGUAGE_CONFIG[language];
  if (!config) {
    throw new Error(`Unsupported language: ${language}`);
  }

  if (!config.command) {
    let helpMsg = '';
    if (language === 'python') helpMsg = 'Please install Python from python.org';
    if (['c', 'cpp'].includes(language)) helpMsg = 'Please install GCC/G++ (MinGW on Windows)';
    if (language === 'java') helpMsg = 'Please install JDK and set JAVA_HOME';
    if (language === 'rust') helpMsg = 'Please install Rust (rustup)';

    throw new Error(`${language.toUpperCase()} execution environment is not set up on the server. ${helpMsg}`);
  }

  // Generate unique filename
  const sessionId = crypto.randomBytes(16).toString('hex');
  const filename = `code_${sessionId}${config.extension}`;
  const filepath = path.join(TEMP_DIR, filename);

  try {
    // Sanitize code
    const sanitizedCode = sanitizeCode(code, language);

    // Write code to file
    await fs.writeFile(filepath, sanitizedCode);

    let result;

    switch (language) {
      case 'javascript':
        result = await executeJavaScript(filepath, input, config);
        break;
      case 'python':
        result = await executePython(filepath, input, config);
        break;
      case 'java':
        result = await executeJava(filepath, input, config);
        break;
      case 'cpp':
      case 'c':
        result = await executeCppOrC(filepath, input, config, language);
        break;
      case 'csharp':
        result = await executeCSharp(filepath, input, config);
        break;
      case 'go':
        result = await executeGo(filepath, input, config);
        break;
      case 'rust':
        result = await executeRust(filepath, input, config);
        break;
      case 'php':
        result = await executePHP(filepath, input, config);
        break;
      default:
        throw new Error(`Execution not implemented for ${language}`);
    }

    return result;
  } finally {
    // Cleanup: Remove temporary files
    try {
      await fs.unlink(filepath);

      // Clean up compiled files
      if (language === 'java') {
        const classFile = filepath.replace('.java', '.class');
        await fs.unlink(classFile).catch(() => { });
      } else if (language === 'cpp' || language === 'c') {
        const execFile = filepath.replace(config.extension, '');
        await fs.unlink(execFile).catch(() => { });
      } else if (language === 'rust') {
        const execFile = filepath.replace('.rs', '');
        await fs.unlink(execFile).catch(() => { });
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
};

// Language-specific execution functions
const executeJavaScript = (filepath, input, config) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const nodeProcess = spawn('node', [filepath], {
      timeout: config.timeout,
      cwd: TEMP_DIR
    });

    let stdout = '';
    let stderr = '';
    let hasResolved = false;

    nodeProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    nodeProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Write input if provided
    if (input && input.trim()) {
      const inputLines = input.split('\n').map(line => line.trim()).filter(line => line);
      const formattedInput = inputLines.join('\n') + '\n';
      
      try {
        nodeProcess.stdin.write(formattedInput, 'utf8');
      } catch (e) {
        console.error('Error writing to stdin:', e);
      }
    }
    
    // Always close stdin
    nodeProcess.stdin.end();

    nodeProcess.on('close', (code) => {
      if (!hasResolved) {
        hasResolved = true;
        const executionTime = Date.now() - startTime;
        resolve({
          success: code === 0,
          output: stdout,
          error: stderr,
          exitCode: code,
          executionTime: `${executionTime}ms`
        });
      }
    });

    nodeProcess.on('error', (error) => {
      if (!hasResolved) {
        hasResolved = true;
        const executionTime = Date.now() - startTime;
        resolve({
          success: false,
          output: stdout,
          error: error.message,
          exitCode: -1,
          executionTime: `${executionTime}ms`
        });
      }
    });

    // Timeout handler
    setTimeout(() => {
      if (!hasResolved) {
        hasResolved = true;
        nodeProcess.kill();
        resolve({
          success: false,
          output: stdout,
          error: 'Execution timeout - Program took too long to complete.',
          exitCode: -1,
          executionTime: `${config.timeout}ms`
        });
      }
    }, config.timeout);
  });
};

const executePython = (filepath, input, config) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const pythonProcess = spawn('python', [filepath], {
      timeout: config.timeout,
      cwd: TEMP_DIR
    });

    let stdout = '';
    let stderr = '';
    let hasResolved = false;

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Write input if provided
    if (input && input.trim()) {
      // Ensure each line ends with newline
      const inputLines = input.split('\n').map(line => line.trim()).filter(line => line);
      const formattedInput = inputLines.join('\n') + '\n';
      
      try {
        pythonProcess.stdin.write(formattedInput, 'utf8');
      } catch (e) {
        console.error('Error writing to stdin:', e);
      }
    }
    
    // Always close stdin to signal no more input
    pythonProcess.stdin.end();

    pythonProcess.on('close', (code) => {
      if (!hasResolved) {
        hasResolved = true;
        const executionTime = Date.now() - startTime;
        resolve({
          success: code === 0,
          output: stdout,
          error: stderr,
          exitCode: code,
          executionTime: `${executionTime}ms`
        });
      }
    });

    pythonProcess.on('error', (error) => {
      if (!hasResolved) {
        hasResolved = true;
        const executionTime = Date.now() - startTime;
        resolve({
          success: false,
          output: stdout,
          error: error.message,
          exitCode: -1,
          executionTime: `${executionTime}ms`
        });
      }
    });

    // Timeout handler
    setTimeout(() => {
      if (!hasResolved) {
        hasResolved = true;
        pythonProcess.kill();
        resolve({
          success: false,
          output: stdout,
          error: 'Execution timeout - Program took too long to complete. Check for infinite loops or missing input.',
          exitCode: -1,
          executionTime: `${config.timeout}ms`
        });
      }
    }, config.timeout);
  });
};

const executeJava = async (filepath, input, config) => {
  const className = path.basename(filepath, '.java');
  const classFile = path.join(TEMP_DIR, `${className}.class`);

  return new Promise((resolve) => {
    // First compile
    const compileProcess = spawn('javac', [filepath], {
      cwd: TEMP_DIR
    });

    let compileError = '';

    compileProcess.stderr.on('data', (data) => {
      compileError += data.toString();
    });

    compileProcess.on('close', (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          output: '',
          error: `Compilation failed: ${compileError}`,
          exitCode: code,
          executionTime: Date.now()
        });
        return;
      }

      // Then run
      const runProcess = spawn('java', [className], {
        timeout: config.timeout,
        cwd: TEMP_DIR
      });

      let stdout = '';
      let stderr = '';
      let hasResolved = false;

      runProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      runProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      // Write input if provided
      if (input && input.trim()) {
        const inputLines = input.split('\n').map(line => line.trim()).filter(line => line);
        const formattedInput = inputLines.join('\n') + '\n';
        
        try {
          runProcess.stdin.write(formattedInput, 'utf8');
        } catch (e) {
          console.error('Error writing to stdin:', e);
        }
      }
      
      // Always close stdin
      runProcess.stdin.end();

      runProcess.on('close', (runCode) => {
        if (!hasResolved) {
          hasResolved = true;
          resolve({
            success: runCode === 0,
            output: stdout,
            error: stderr,
            exitCode: runCode,
            executionTime: Date.now()
          });
        }
      });

      runProcess.on('error', (error) => {
        if (!hasResolved) {
          hasResolved = true;
          resolve({
            success: false,
            output: stdout,
            error: error.message,
            exitCode: -1,
            executionTime: Date.now()
          });
        }
      });
    });

    compileProcess.on('error', (error) => {
      resolve({
        success: false,
        output: '',
        error: `Compilation error: ${error.message}`,
        exitCode: -1,
        executionTime: Date.now()
      });
    });
  });
};

const executeCppOrC = async (filepath, input, config, language) => {
  const execFile = filepath.replace(config.extension, '');

  return new Promise((resolve) => {
    // First compile
    const compileArgs = [filepath, '-o', execFile];
    const compileProcess = spawn(config.command, compileArgs, {
      cwd: TEMP_DIR
    });

    let compileError = '';

    compileProcess.stderr.on('data', (data) => {
      compileError += data.toString();
    });

    compileProcess.on('close', (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          output: '',
          error: `Compilation failed: ${compileError}`,
          exitCode: code,
          executionTime: Date.now()
        });
        return;
      }

      // Then run
      const runProcess = spawn(execFile, [], {
        timeout: config.timeout,
        cwd: TEMP_DIR
      });

      let stdout = '';
      let stderr = '';

      runProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      runProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      // Write input properly using helper
      writeInputToProcess(runProcess, input);

      runProcess.on('close', (runCode) => {
        resolve({
          success: runCode === 0,
          output: stdout,
          error: stderr,
          exitCode: runCode,
          executionTime: Date.now()
        });
      });

      runProcess.on('error', (error) => {
        resolve({
          success: false,
          output: '',
          error: error.message,
          exitCode: -1,
          executionTime: Date.now()
        });
      });
    });

    compileProcess.on('error', (error) => {
      resolve({
        success: false,
        output: '',
        error: `Compilation error: ${error.message}`,
        exitCode: -1,
        executionTime: Date.now()
      });
    });
  });
};

const executeCSharp = (filepath, input, config) => {
  return new Promise((resolve) => {
    const process = spawn('dotnet', ['run', '--project', filepath], {
      timeout: config.timeout,
      cwd: TEMP_DIR
    });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Write input properly
    writeInputToProcess(process, input);

    process.on('close', (code) => {
      resolve({
        success: code === 0,
        output: stdout,
        error: stderr,
        exitCode: code,
        executionTime: Date.now()
      });
    });

    process.on('error', (error) => {
      resolve({
        success: false,
        output: '',
        error: error.message,
        exitCode: -1,
        executionTime: Date.now()
      });
    });
  });
};

const executeGo = (filepath, input, config) => {
  return new Promise((resolve) => {
    const process = spawn('go', ['run', filepath], {
      timeout: config.timeout,
      cwd: TEMP_DIR
    });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Write input properly
    writeInputToProcess(process, input);

    process.on('close', (code) => {
      resolve({
        success: code === 0,
        output: stdout,
        error: stderr,
        exitCode: code,
        executionTime: Date.now()
      });
    });

    process.on('error', (error) => {
      resolve({
        success: false,
        output: '',
        error: error.message,
        exitCode: -1,
        executionTime: Date.now()
      });
    });
  });
};

const executeRust = async (filepath, input, config) => {
  const execFile = filepath.replace('.rs', '');

  return new Promise((resolve) => {
    // First compile
    const compileProcess = spawn('rustc', [filepath, '-o', execFile], {
      cwd: TEMP_DIR
    });

    let compileError = '';

    compileProcess.stderr.on('data', (data) => {
      compileError += data.toString();
    });

    compileProcess.on('close', (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          output: '',
          error: `Compilation failed: ${compileError}`,
          exitCode: code,
          executionTime: Date.now()
        });
        return;
      }

      // Then run
      const runProcess = spawn(execFile, [], {
        timeout: config.timeout,
        cwd: TEMP_DIR
      });

      let stdout = '';
      let stderr = '';

      runProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      runProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      // Write input properly using helper
      writeInputToProcess(runProcess, input);

      runProcess.on('close', (runCode) => {
        resolve({
          success: runCode === 0,
          output: stdout,
          error: stderr,
          exitCode: runCode,
          executionTime: Date.now()
        });
      });

      runProcess.on('error', (error) => {
        resolve({
          success: false,
          output: '',
          error: error.message,
          exitCode: -1,
          executionTime: Date.now()
        });
      });
    });

    compileProcess.on('error', (error) => {
      resolve({
        success: false,
        output: '',
        error: `Compilation error: ${error.message}`,
        exitCode: -1,
        executionTime: Date.now()
      });
    });
  });
};

const executePHP = (filepath, input, config) => {
  return new Promise((resolve) => {
    const process = spawn('php', [filepath], {
      timeout: config.timeout,
      cwd: TEMP_DIR
    });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Write input properly
    writeInputToProcess(process, input);

    process.on('close', (code) => {
      resolve({
        success: code === 0,
        output: stdout,
        error: stderr,
        exitCode: code,
        executionTime: Date.now()
      });
    });

    process.on('error', (error) => {
      resolve({
        success: false,
        output: '',
        error: error.message,
        exitCode: -1,
        executionTime: Date.now()
      });
    });
  });
};

// Routes

// Execute code
router.post('/execute', async (req, res) => {
  try {
    const { code, language, input } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: 'Code and language are required'
      });
    }

    const startTime = Date.now();
    const result = await executeCode(code, language, input);
    const executionTime = Date.now() - startTime;

    res.json({
      ...result,
      executionTime: `${executionTime}ms`,
      language,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      language: req.body.language,
      timestamp: new Date().toISOString()
    });
  }
});

// Get supported languages
router.get('/languages', (req, res) => {
  const languages = Object.keys(LANGUAGE_CONFIG).map(lang => ({
    name: lang,
    extension: LANGUAGE_CONFIG[lang].extension,
    timeout: LANGUAGE_CONFIG[lang].timeout,
    memoryLimit: LANGUAGE_CONFIG[lang].memoryLimit
  }));

  res.json({
    success: true,
    languages,
    count: languages.length
  });
});

// Health check for playground
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    tempDir: TEMP_DIR
  });
});

// Get code templates
router.get('/templates/:language', (req, res) => {
  const { language } = req.params;

  const templates = {
    javascript: {
      hello: 'console.log("Hello, FlowState!");',
      function: 'function greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("World"));',
      async: 'async function fetchData() {\n  // Simulate API call\n  return new Promise(resolve => {\n    setTimeout(() => resolve("Data loaded!"), 1000);\n  });\n}\n\nfetchData().then(console.log);'
    },
    python: {
      hello: 'print("Hello, FlowState!")',
      function: 'def greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("World"))',
      class: 'class Person:\n    def __init__(self, name):\n        self.name = name\n    \n    def greet(self):\n        return f"Hello, I\'m {self.name}!"\n\nperson = Person("Alice")\nprint(person.greet())'
    },
    java: {
      hello: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, FlowState!");\n    }\n}',
      class: 'public class Person {\n    private String name;\n    \n    public Person(String name) {\n        this.name = name;\n    }\n    \n    public String greet() {\n        return "Hello, I\'m " + name + "!";\n    }\n    \n    public static void main(String[] args) {\n        Person person = new Person("Alice");\n        System.out.println(person.greet());\n    }\n}'
    }
  };

  const languageTemplates = templates[language];
  if (!languageTemplates) {
    return res.status(404).json({
      success: false,
      error: `Templates not found for language: ${language}`
    });
  }

  res.json({
    success: true,
    language,
    templates: languageTemplates
  });
});

module.exports = router;