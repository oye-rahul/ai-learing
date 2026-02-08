// Fallback responses when Gemini API is not available
const fallbackResponses = {
  greetings: [
    "Hello! I'm AI Learnixo. While I'm currently in demo mode (API key needed), I can still help guide you. What would you like to learn about?",
    "Hi there! I'm here to help you learn programming. Note: I'm in demo mode right now, but I can still provide some guidance!",
  ],
  
  createFile: `I can help you create files! Here's how:

**Using the UI:**
1. Click the "📄 Create File" button in the sidebar
2. Enter a file name (e.g., "app.js", "index.html")
3. Choose the language/type
4. Add your initial content
5. Click "Create File"

**File Types I Support:**
- JavaScript (.js)
- TypeScript (.ts)
- Python (.py)
- HTML (.html)
- CSS (.css)
- React Components (.jsx, .tsx)

**Example Files You Can Create:**
- React Component: \`MyComponent.tsx\`
- API Endpoint: \`api.js\`
- Stylesheet: \`styles.css\`
- Python Script: \`data_analysis.py\`

Try clicking the "Create File" button to get started!

*Note: I'm in demo mode. Configure Gemini API key for AI-powered file generation!*`,

  showFiles: `To view and manage your files:

**View Files:**
- Check the "My Files" section in the right sidebar
- You'll see all your created files listed there

**Manage Files:**
- **Edit**: Click the pencil icon next to any file
- **Delete**: Click the trash icon to remove a file
- **Create New**: Use the "Create File" button

**File Actions:**
1. **Create** - Make new files with templates
2. **Edit** - Modify file content in the code editor
3. **Delete** - Remove files you no longer need
4. **View** - See file details and content

Your files are saved and associated with your account!

*Demo mode active. Full AI file management available with API key.*`,
  
  variables: `Great question about variables! 

Variables are like containers that store data in your program. Think of them as labeled boxes where you can put different things.

**Example in JavaScript:**
\`\`\`javascript
let name = "John";        // String variable
let age = 25;             // Number variable
let isStudent = true;     // Boolean variable
\`\`\`

**Key Concepts:**
1. **Declaration**: Creating the variable (let, const, var)
2. **Assignment**: Giving it a value (=)
3. **Usage**: Using the variable in your code

**Best Practices:**
- Use meaningful names (userName, not x)
- Use const for values that won't change
- Use let for values that will change

Would you like to know more about any specific type of variable?

*Note: I'm currently in demo mode. For full AI responses, please configure a valid Gemini API key.*`,

  loops: `Loops are fundamental programming concepts that let you repeat code multiple times!

**Types of Loops:**

1. **For Loop** - When you know how many times to repeat:
\`\`\`javascript
for (let i = 0; i < 5; i++) {
  console.log("Count: " + i);
}
// Output: Count: 0, 1, 2, 3, 4
\`\`\`

2. **While Loop** - When you repeat until a condition is false:
\`\`\`javascript
let count = 0;
while (count < 5) {
  console.log(count);
  count++;
}
\`\`\`

3. **For...of Loop** - For iterating over arrays:
\`\`\`javascript
let fruits = ["apple", "banana", "orange"];
for (let fruit of fruits) {
  console.log(fruit);
}
\`\`\`

**When to Use:**
- Use for loop when you know the number of iterations
- Use while loop when the condition is more complex
- Use for...of for arrays and iterables

*Note: I'm in demo mode. Configure Gemini API key for personalized responses!*`,

  functions: `Functions are reusable blocks of code that perform specific tasks!

**Basic Function:**
\`\`\`javascript
function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("Alice")); // "Hello, Alice!"
\`\`\`

**Arrow Function (Modern JavaScript):**
\`\`\`javascript
const add = (a, b) => a + b;
console.log(add(5, 3)); // 8
\`\`\`

**Key Concepts:**
1. **Parameters**: Input values (name, a, b)
2. **Return**: Output value
3. **Calling**: Using the function

**Benefits:**
- Code reusability
- Better organization
- Easier testing
- Reduced repetition

*Demo mode active. Get full AI assistance with a valid API key!*`,

  reactComponent: `Let me help you create a React component!

**Basic React Component Structure:**
\`\`\`jsx
import React from 'react';

const MyComponent = () => {
  return (
    <div className="container">
      <h1>Hello World!</h1>
      <p>This is my component</p>
    </div>
  );
};

export default MyComponent;
\`\`\`

**With State:**
\`\`\`jsx
import React, { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
};

export default Counter;
\`\`\`

**To create this:**
1. Click "Create File" button
2. Choose "React Component"
3. Name it (e.g., "MyComponent.tsx")
4. Customize the template

*Demo mode. Full AI code generation with API key!*`,

  default: `I'd love to help you with that! However, I'm currently in demo mode because the Gemini API key needs to be configured.

**What I Can Help With:**
- Create files and pages
- Edit code
- Explain programming concepts
- Provide code templates
- Manage your files

**Quick Actions:**
- Click "📄 Create File" to make a new file
- Click "📋 View Files" to see your files
- Ask about: variables, loops, functions, React components

**To get full AI assistance:**
1. Get a valid Gemini API key from https://makersuite.google.com/app/apikey
2. Add it to backend/.env file
3. Restart the backend server
4. Run: node test-gemini.js to verify

**Try these commands:**
- "Create a new React component"
- "Show me my files"
- "Create a Python file"
- "Help me with JavaScript"

*Check GET_GEMINI_API_KEY.md for detailed instructions.*`,
};

function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return fallbackResponses.greetings[Math.floor(Math.random() * fallbackResponses.greetings.length)];
  }
  
  if (lowerMessage.includes('create') && (lowerMessage.includes('file') || lowerMessage.includes('page'))) {
    return fallbackResponses.createFile;
  }
  
  if (lowerMessage.includes('show') && lowerMessage.includes('file')) {
    return fallbackResponses.showFiles;
  }
  
  if (lowerMessage.includes('react') && lowerMessage.includes('component')) {
    return fallbackResponses.reactComponent;
  }
  
  if (lowerMessage.includes('variable')) {
    return fallbackResponses.variables;
  }
  
  if (lowerMessage.includes('loop') || lowerMessage.includes('iteration')) {
    return fallbackResponses.loops;
  }
  
  if (lowerMessage.includes('function')) {
    return fallbackResponses.functions;
  }
  
  return fallbackResponses.default;
}

module.exports = { getFallbackResponse };
