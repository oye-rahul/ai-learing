import React, { useState } from 'react';
import CodeEditor from './CodeEditor';
import { toast } from 'react-toastify';
import playgroundAPI, { CodeExecutionRequest } from '../../services/playgroundApi';
import { aiAPI } from '../../services/api';

interface JavaEnvironmentProps {
  environment: {
    id: string;
    title: string;
    description: string;
    icon: string;
  };
  onBack: () => void;
}

const JavaEnvironment: React.FC<JavaEnvironmentProps> = ({ environment, onBack }) => {
  const [code, setCode] = useState(`// Java Code Editor
// Write your Java code here

public class Main {
    public static void greet(String name) {
        System.out.println("Hello, " + name + "!");
    }

    public static void main(String[] args) {
        System.out.println("Welcome to Java Playground!");
        greet("Developer");
        
        // Example: Calculate factorial
        System.out.println("Factorial of 5: " + factorial(5));
    }
    
    public static int factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }
}
`);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [userInput, setUserInput] = useState('');
  const [showInputModal, setShowInputModal] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    // Check if code has input() calls - if yes, show modal for input
    const hasInput = /input\(|scanf|Scanner|cin\s*>>|gets|getline|readline/i.test(code);
    
    if (hasInput) {
      setShowInputModal(true);
    } else {
      // No input needed, execute directly
      handleExecuteWithInput();
    }
  };

  const handleExecuteWithInput = async () => {
    setShowInputModal(false);
    setIsExecuting(true);
    setShowOutput(true);
    setExecutionResult(null);

    try {
      const request: CodeExecutionRequest = {
        code,
        language: 'java',
        input: userInput
      };

      const result = await playgroundAPI.executeCode(request);
      
      // Combine output with input prompts for display
      let displayOutput = result.output || '';
      if (userInput && result.success) {
        // Input was provided
        displayOutput = result.output || '';
      }
      
      setExecutionResult({
        ...result,
        displayOutput
      });

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
      const response = await aiAPI.explainCode({ code, language: 'java' });
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
      const response = await aiAPI.debugCode({ code, language: 'java' });
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
        // Apply the fixed code automatically
        setCode(fixedCode);
        
        setExecutionResult({
          success: true,
          displayOutput: fixedCode, // Show only the fixed code
        });
        toast.success('Code fixed and applied automatically!');
      } else {
        // No code block found, just show suggestions
        setExecutionResult({
          success: true,
          displayOutput: `📋 AI Code Analysis:\n\n${aiResponse}\n\n💡 The AI provided analysis but no automatic fix.\n   Review the suggestions above and apply changes manually.`,
        });
        toast.success('Code analyzed successfully!');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to analyze code';
      setExecutionResult({
        success: false,
        error: errorMsg,
        displayOutput: `Error: ${errorMsg}`,
      });
      toast.error('Failed to analyze code');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-white">
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
          <span className="text-xs text-slate-500">Python 3</span>
          <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
            🌐 Online
          </span>
        </div>

        <div className="flex items-center gap-2">
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
                Output
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

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {showOutput ? (
          <div className="h-full bg-[#1e1e1e] flex flex-col">
            {/* Output Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-[#3e3e42]">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-400">Output</span>
                {executionResult && (
                  <span className={`text-xs px-2 py-0.5 rounded ${executionResult.success ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {executionResult.success ? '✓ Success' : '✗ Failed'}
                  </span>
                )}
              </div>
              {executionResult?.executionTime && (
                <span className="text-xs text-slate-500">{executionResult.executionTime}</span>
              )}
            </div>

            {/* Output Content */}
            <div className="flex-1 p-6 overflow-auto">
              {executionResult ? (
                <div className="font-mono text-sm">
                  <pre className="whitespace-pre-wrap text-slate-300">
                    {executionResult.output || executionResult.error || 'No output'}
                  </pre>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-slate-500">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p>Executing code...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <CodeEditor
            value={code}
            onChange={(value) => setCode(value || '')}
            language="java"
            height="100%"
          />
        )}
      </div>

      {/* Input Modal - Shows BEFORE execution */}
      {showInputModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#252526] rounded-lg p-6 w-[600px] max-h-[80vh] border border-[#3e3e42] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <h3 className="text-lg font-semibold text-white">Your program needs input</h3>
              </div>
              <button
                onClick={() => setShowInputModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-300">
                💡 Your code uses <code className="px-1.5 py-0.5 bg-blue-900/40 rounded">input()</code>. 
                Provide all input values below before running.
              </p>
            </div>

            <p className="text-sm text-slate-400 mb-3">
              Enter all input values your program needs (one per line):
            </p>

            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Enter input here (one value per line)&#10;&#10;Example:&#10;John&#10;25&#10;New York"
              className="w-full h-64 bg-[#1e1e1e] text-slate-300 border border-[#3e3e42] rounded p-4 font-mono text-sm resize-none focus:outline-none focus:border-blue-500 mb-4"
              autoFocus
            />

            <div className="bg-[#1e1e1e] rounded p-3 mb-4">
              <p className="text-xs text-slate-500 mb-2">📝 How it works:</p>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Each line = one input value</li>
                <li>• First line goes to first input(), second to second input(), etc.</li>
                <li>• The output will show your input values inline</li>
                <li>• Leave empty if your code doesn't need input</li>
              </ul>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowInputModal(false);
                  setUserInput('');
                }}
                className="px-4 py-2 bg-[#3e3e42] hover:bg-[#4e4e4e] rounded transition-colors text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteWithInput}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors text-white font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Run with Input
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

export default JavaEnvironment;
