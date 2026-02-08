const express = require('express');
const router = express.Router();
const onlineCompiler = require('../services/onlineCompilerService');

/**
 * Online Code Execution API
 * Uses Piston API - No local installation required!
 * All code runs on remote servers
 */

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

    console.log(`🚀 Executing ${language} code online...`);

    // Execute code using online compiler service
    const result = await onlineCompiler.executeCode(code, language, input || '');

    console.log(`✅ Execution complete: ${result.success ? 'Success' : 'Failed'} (${result.executionTime})`);

    res.json({
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Code execution error:', error);
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
    message: '🌐 All languages run online - no installation required!'
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
    },
    go: {
      hello: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
      input: 'package main\n\nimport (\n    "fmt"\n)\n\nfunc main() {\n    var name string\n    var age int\n    \n    fmt.Print("Enter your name: ")\n    fmt.Scan(&name)\n    \n    fmt.Print("Enter your age: ")\n    fmt.Scan(&age)\n    \n    fmt.Printf("Hello %s, you are %d years old!\\n", name, age)\n}'
    },
    rust: {
      hello: 'fn main() {\n    println!("Hello, World!");\n}',
      input: 'use std::io;\n\nfn main() {\n    let mut name = String::new();\n    let mut age = String::new();\n    \n    println!("Enter your name: ");\n    io::stdin().read_line(&mut name).expect("Failed to read");\n    \n    println!("Enter your age: ");\n    io::stdin().read_line(&mut age).expect("Failed to read");\n    \n    println!("Hello {}, you are {} years old!", name.trim(), age.trim());\n}'
    },
    php: {
      hello: '<?php\necho "Hello, World!\\n";\n?>',
      input: '<?php\necho "Enter your name: ";\n$name = trim(fgets(STDIN));\n\necho "Enter your age: ";\n$age = trim(fgets(STDIN));\n\necho "Hello $name, you are $age years old!\\n";\n?>'
    },
    csharp: {
      hello: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}',
      input: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.Write("Enter your name: ");\n        string name = Console.ReadLine();\n        \n        Console.Write("Enter your age: ");\n        int age = int.Parse(Console.ReadLine());\n        \n        Console.WriteLine($"Hello {name}, you are {age} years old!");\n    }\n}'
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
