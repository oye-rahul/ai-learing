import React, { useState } from 'react';
import CodeEditor from './CodeEditor';
import { toast } from 'react-toastify';
import playgroundAPI, { CodeExecutionRequest } from '../../services/playgroundApi';
import { aiAPI } from '../../services/api';

interface AdvancedCodeEnvironmentProps {
  environment: {
    id: string;
    title: string;
    description: string;
    icon: string;
    languages: string[];
    features: string[];
  };
  onBack: () => void;
}

interface FileItem {
  id: string;
  name: string;
  content: string;
  language: string;
}

const AdvancedCodeEnvironment: React.FC<AdvancedCodeEnvironmentProps> = ({ environment, onBack }) => {
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'index.html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Web App</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Welcome to Web Development!</h1>
        <p>Edit HTML, CSS, and JavaScript files to build your web app.</p>
        <button id="myButton" class="btn">Click Me!</button>
        <div id="output"></div>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
      language: 'html'
    },
    {
      id: '2',
      name: 'style.css',
      content: `/* CSS Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

.container {
    background: white;
    padding: 40px;
    border-radius: 15px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 600px;
    width: 100%;
    text-align: center;
}

h1 {
    color: #667eea;
    margin-bottom: 20px;
    font-size: 2.5em;
}

p {
    color: #555;
    margin-bottom: 30px;
    font-size: 1.1em;
}

.btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 15px 40px;
    font-size: 1.1em;
    border-radius: 50px;
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;
    font-weight: bold;
}

.btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.5);
}

.btn:active {
    transform: translateY(-1px);
}

#output {
    margin-top: 30px;
    padding: 20px;
    background: #f0f0f0;
    border-radius: 10px;
    min-height: 50px;
    color: #333;
    font-size: 1.2em;
    font-weight: bold;
}`,
      language: 'css'
    },
    {
      id: '3',
      name: 'script.js',
      content: `// JavaScript Code
console.log('Page loaded successfully!');

// Get elements
const button = document.getElementById('myButton');
const output = document.getElementById('output');

let clickCount = 0;

// Add click event listener
button.addEventListener('click', function() {
    clickCount++;
    output.textContent = \`Button clicked \${clickCount} time\${clickCount !== 1 ? 's' : ''}! 🎉\`;
    
    // Add animation
    output.style.animation = 'none';
    setTimeout(() => {
        output.style.animation = 'fadeIn 0.5s';
    }, 10);
});

// Add CSS animation
const style = document.createElement('style');
style.textContent = \`
    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
    }
\`;
document.head.appendChild(style);

// Display welcome message
output.textContent = 'Click the button above! 👆';`,
      language: 'javascript'
    }
  ]);
  const [activeFileId, setActiveFileId] = useState('1');
  const [isExecuting, setIsExecuting] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [newFileName, setNewFileName] = useState('');
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  const activeFile = files.find(f => f.id === activeFileId);
  const code = activeFile?.content || '';
  const language = activeFile?.language || environment.languages[0];

  const handleCodeChange = (value: string | undefined) => {
    if (!activeFileId || !value) return;
    setFiles(prev => prev.map(f =>
      f.id === activeFileId ? { ...f, content: value } : f
    ));
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) {
      toast.error('Please enter a file name');
      return;
    }

    const ext = newFileName.split('.').pop()?.toLowerCase() || 'txt';
    const langMap: Record<string, string> = {
      js: 'javascript', py: 'python', java: 'java', cpp: 'cpp',
      c: 'c', go: 'go', rs: 'rust', php: 'php', cs: 'csharp',
      html: 'html', css: 'css', ts: 'typescript'
    };
    const fileLang = langMap[ext] || 'javascript';

    const newFile: FileItem = {
      id: Date.now().toString(),
      name: newFileName,
      content: `// New ${fileLang} file\n`,
      language: fileLang
    };

    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setNewFileName('');
    setShowNewFileModal(false);
    toast.success('File created!');
  };

  const handleDeleteFile = (fileId: string) => {
    if (files.length === 1) {
      toast.error('Cannot delete the last file');
      return;
    }

    if (window.confirm('Are you sure you want to delete this file?')) {
      setFiles(prev => prev.filter(f => f.id !== fileId));
      if (activeFileId === fileId) {
        setActiveFileId(files[0].id);
      }
      toast.success('File deleted!');
    }
  };

  const handleRenameFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    const newName = prompt('Enter new file name:', file.name);
    if (newName && newName.trim()) {
      setFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, name: newName.trim() } : f
      ));
      toast.success('File renamed!');
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setIsExecuting(true);
    setShowOutput(true);
    setExecutionResult(null);

    // For HTML/CSS/JS, combine all files and show preview
    if (language === 'html' || language === 'css' || language === 'javascript') {
      // Get all files
      const htmlFile = files.find(f => f.name.endsWith('.html'));
      const cssFile = files.find(f => f.name.endsWith('.css'));
      const jsFile = files.find(f => f.name.endsWith('.js'));

      let htmlContent = htmlFile?.content || code;

      // Remove external CSS link and inject inline
      if (cssFile) {
        htmlContent = htmlContent.replace(/<link[^>]*href=["']style\.css["'][^>]*>/gi, '');
        htmlContent = htmlContent.replace('</head>', `<style>${cssFile.content}</style></head>`);
      }

      // Remove external JS script and inject inline
      if (jsFile) {
        htmlContent = htmlContent.replace(/<script[^>]*src=["']script\.js["'][^>]*><\/script>/gi, '');
        htmlContent = htmlContent.replace('</body>', `<script>${jsFile.content}</script></body>`);
      }

      setExecutionResult({
        success: true,
        output: 'HTML/CSS/JS Preview - All files combined and rendered',
        executionTime: '0ms',
        isPreview: true,
        previewContent: htmlContent
      });
      setIsExecuting(false);
      toast.success('Preview updated - All files combined!');
      return;
    }

    // For other languages (not used in Web Dev environment)
    try {
      const request: CodeExecutionRequest = {
        code,
        language,
        input: ''
      };

      const result = await playgroundAPI.executeCode(request);
      setExecutionResult(result);

      if (result.success) {
        toast.success('Code executed successfully');
      } else {
        toast.error('Code execution failed');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to execute code';
      setExecutionResult({ success: false, error: errorMsg });
      toast.error('Execution error');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExplainCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setIsExplaining(true);
    setShowExplanation(true);
    setExplanation('');

    try {
      const response = await aiAPI.explainCode({ code, language });
      setExplanation(response.data.explanation || 'No explanation available');
      toast.success('Code explained successfully!');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to explain code';
      setExplanation(`Error: ${errorMsg}\n\nNote: This feature requires Gemini API key. Check backend logs for details.`);
      toast.error('Failed to explain code');
    } finally {
      setIsExplaining(false);
    }
  };

  const handleFixCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setIsFixing(true);
    setShowOutput(true);

    try {
      const response = await aiAPI.debugCode({ code, language });
      const aiResponse = response.data.debug_suggestions || 'No issues found';
      
      // Try multiple patterns to extract fixed code
      let fixedCode: string | null = null;
      
      // Pattern 1: Standard code block with language
      let codeBlockMatch = aiResponse.match(/```[\w]*\n([\s\S]*?)\n```/);
      
      // Pattern 2: Look for "Corrected Code" or "Fixed Code" section
      if (!codeBlockMatch) {
        const correctedSection = aiResponse.match(/(?:Corrected|Fixed|Updated)\s+(?:Code|Version)[:\s]*\n*```[\w]*\n([\s\S]*?)\n```/i);
        if (correctedSection) codeBlockMatch = correctedSection;
      }
      
      // Pattern 3: First code block in response
      if (!codeBlockMatch) {
        codeBlockMatch = aiResponse.match(/```([\s\S]*?)```/);
      }
      
      if (codeBlockMatch) {
        // Extract code (handle both with and without language specifier)
        const extractedCode = codeBlockMatch[1] || codeBlockMatch[0];
        if (extractedCode) {
          // Remove language identifier if present at start
          fixedCode = extractedCode.replace(/^[\w]+\n/, '').trim();
        }
      }
      
      if (fixedCode && fixedCode.length > 10) {
        // Apply the fixed code automatically to the active file
        const codeToApply = fixedCode; // Create const to satisfy TypeScript
        setFiles(prev => prev.map(f =>
          f.id === activeFileId ? { ...f, content: codeToApply } : f
        ));
        
        setExecutionResult({
          success: true,
          output: codeToApply, // Show only the fixed code
          isPreview: false,
        });
        toast.success('Code fixed and applied automatically!');
      } else {
        // No code block found, just show suggestions
        setExecutionResult({
          success: true,
          output: `📋 AI Code Analysis:\n\n${aiResponse}\n\n💡 The AI provided analysis but no automatic fix.\n   Review the suggestions above and apply changes manually.`,
          isPreview: false,
        });
        toast.success('Code analyzed successfully!');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to analyze code';
      setExecutionResult({
        success: false,
        error: errorMsg,
        output: `Error: ${errorMsg}\n\nNote: This feature requires Gemini API key. Check backend logs for details.`,
        isPreview: false,
      });
      toast.error('Failed to analyze code');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="h-full flex bg-[#1e1e1e] text-white">
      {/* Left Sidebar - File Explorer */}
      <div className="w-64 bg-[#252526] border-r border-[#3e3e42] flex flex-col">
        <div className="h-12 flex items-center justify-between px-4 border-b border-[#3e3e42]">
          <span className="text-sm font-medium">Files</span>
          <button
            onClick={() => setShowNewFileModal(true)}
            className="p-1 hover:bg-[#3e3e42] rounded transition-colors"
            title="New File"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {files.map(file => (
            <div
              key={file.id}
              className={`group flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-[#2a2d2e] ${activeFileId === file.id ? 'bg-[#37373d]' : ''
                }`}
              onClick={() => setActiveFileId(file.id)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm truncate">{file.name}</span>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRenameFile(file.id);
                  }}
                  className="p-1 hover:bg-[#3e3e42] rounded"
                  title="Rename"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(file.id);
                  }}
                  className="p-1 hover:bg-red-500/20 rounded text-red-400"
                  title="Delete"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-12 flex items-center justify-between px-4 bg-[#2d2d30] border-b border-[#3e3e42]">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ← Back
            </button>
            <span className="text-white font-medium">{environment.title}</span>
            <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
              🌐 Online
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExplainCode}
              disabled={isExplaining}
              className="flex items-center gap-2 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors disabled:opacity-50"
              title="Explain Code with AI"
            >
              {isExplaining ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Explaining...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Explain Code
                </>
              )}
            </button>

            <button
              onClick={() => setShowOutput(!showOutput)}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
            >
              {showOutput ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Code
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview
                </>
              )}
            </button>

            <button
              onClick={handleFixCode}
              disabled={isFixing}
              className="flex items-center gap-2 px-4 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors disabled:opacity-50"
              title="Fix Code with AI"
            >
              {isFixing ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Fixing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Fix Code
                </>
              )}
            </button>

            <button
              onClick={handleRunCode}
              disabled={isExecuting}
              className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors disabled:opacity-50"
            >
              {isExecuting ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Running...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Run
                </>
              )}
            </button>
          </div>
        </div>

        {/* Editor/Output Area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Main Editor/Output */}
          <div className="flex-1 overflow-hidden">
            {showOutput ? (
              <div className="h-full bg-[#1e1e1e] p-6 overflow-auto">
                {executionResult ? (
                  <div className="h-full">
                    {executionResult.isPreview ? (
                      // HTML/CSS Preview
                      <div className="h-full flex flex-col">
                        <div className="mb-4 text-lg font-bold text-green-400">
                          ✓ HTML Preview
                        </div>
                        <div className="flex-1 bg-white rounded-lg overflow-hidden border border-[#3e3e42]">
                          <iframe
                            srcDoc={executionResult.previewContent}
                            className="w-full h-full border-0"
                            title="HTML Preview"
                            sandbox="allow-scripts"
                          />
                        </div>
                      </div>
                    ) : (
                      // Code Execution Output
                      <div>
                        <div className={`mb-4 text-lg font-bold ${executionResult.success ? 'text-green-400' : 'text-red-400'}`}>
                          {executionResult.success ? '✓ Execution Successful' : '✗ Execution Failed'}
                          {executionResult.executionTime && ` (${executionResult.executionTime})`}
                        </div>
                        <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
                          <div className="text-xs text-slate-500 uppercase mb-2">Output:</div>
                          <pre className="whitespace-pre-wrap text-slate-300 font-mono text-sm">
                            {executionResult.output || executionResult.error || 'No output'}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-slate-500">
                      <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>Click "Run" to execute your code</p>
                      <p className="text-sm mt-2">Output will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <CodeEditor
                value={code}
                onChange={handleCodeChange}
                language={language}
                height="100%"
              />
            )}
          </div>
        </div>
      </div>

      {/* New File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#252526] rounded-lg p-6 w-96 border border-[#3e3e42]">
            <h3 className="text-lg font-semibold mb-4">Create New File</h3>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFile()}
              placeholder="filename.js"
              className="w-full px-3 py-2 bg-[#3e3e42] border border-[#555] rounded text-white mb-4 focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowNewFileModal(false);
                  setNewFileName('');
                }}
                className="px-4 py-2 bg-[#3e3e42] hover:bg-[#4e4e4e] rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFile}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Explanation Modal */}
      {showExplanation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#252526] rounded-lg p-6 w-[800px] max-h-[80vh] overflow-auto border border-[#3e3e42] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="text-xl font-semibold text-white">AI Code Explanation</h3>
              </div>
              <button
                onClick={() => setShowExplanation(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4 mb-4">
              <p className="text-sm text-purple-300">
                🤖 AI-powered code explanation using Gemini AI
              </p>
            </div>

            {isExplaining ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <svg className="animate-spin w-12 h-12 mx-auto mb-4 text-purple-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-slate-400">Analyzing your code...</p>
                </div>
              </div>
            ) : (
              <div className="bg-[#1e1e1e] rounded-lg p-6 border border-[#3e3e42]">
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-slate-300 text-sm leading-relaxed">
                    {explanation || 'No explanation available'}
                  </pre>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowExplanation(false)}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors text-white font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedCodeEnvironment;
