import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { aiAPI } from '../services/api';
import Button from '../components/shared/Button';
import LoadingSpinner from '../components/shared/LoadingSpinner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Function to format AI response with better styling
const formatAIResponse = (content: string) => {
  // Split by lines
  const lines = content.split('\n');
  const formatted: JSX.Element[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeLanguage = '';

  lines.forEach((line, index) => {
    // Check for code blocks
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        // Starting code block
        inCodeBlock = true;
        codeLanguage = line.trim().replace('```', '');
        codeBlockContent = [];
      } else {
        // Ending code block
        inCodeBlock = false;
        formatted.push(
          <div key={`code-${index}`} className="my-4 rounded-lg overflow-hidden border border-slate-700">
            {codeLanguage && (
              <div className="bg-slate-800 px-4 py-2 text-xs font-mono text-slate-400 border-b border-slate-700">
                {codeLanguage}
              </div>
            )}
            <pre className="bg-slate-900 p-4 overflow-x-auto">
              <code className="text-sm text-slate-300 font-mono">
                {codeBlockContent.join('\n')}
              </code>
            </pre>
          </div>
        );
        codeBlockContent = [];
        codeLanguage = '';
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      return;
    }

    // Headers (###, ##, #)
    if (line.trim().startsWith('###')) {
      formatted.push(
        <h3 key={index} className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-6 mb-3">
          {line.replace(/^###\s*/, '')}
        </h3>
      );
    } else if (line.trim().startsWith('##')) {
      formatted.push(
        <h2 key={index} className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-6 mb-3">
          {line.replace(/^##\s*/, '')}
        </h2>
      );
    } else if (line.trim().startsWith('#')) {
      formatted.push(
        <h1 key={index} className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-6 mb-4">
          {line.replace(/^#\s*/, '')}
        </h1>
      );
    }
    // Bullet points
    else if (line.trim().startsWith('*') || line.trim().startsWith('-') || line.trim().startsWith('•')) {
      const content = line.replace(/^[*\-•]\s*/, '');
      formatted.push(
        <div key={index} className="flex items-start space-x-2 my-2">
          <span className="text-indigo-500 mt-1">•</span>
          <span className="flex-1">{formatInlineCode(content)}</span>
        </div>
      );
    }
    // Numbered lists
    else if (/^\d+\.\s/.test(line.trim())) {
      const match = line.match(/^(\d+)\.\s(.+)$/);
      if (match) {
        formatted.push(
          <div key={index} className="flex items-start space-x-3 my-2">
            <span className="text-indigo-500 font-semibold min-w-[24px]">{match[1]}.</span>
            <span className="flex-1">{formatInlineCode(match[2])}</span>
          </div>
        );
      }
    }
    // Empty lines
    else if (line.trim() === '') {
      formatted.push(<div key={index} className="h-2" />);
    }
    // Regular paragraphs
    else {
      formatted.push(
        <p key={index} className="my-3 leading-relaxed">
          {formatInlineCode(line)}
        </p>
      );
    }
  });

  return <div className="space-y-1">{formatted}</div>;
};

// Format inline code and bold text
const formatInlineCode = (text: string) => {
  const parts: (string | JSX.Element)[] = [];
  let key = 0;

  // Handle inline code `code`
  const codeRegex = /`([^`]+)`/g;
  let lastIndex = 0;
  let match;

  while ((match = codeRegex.exec(text)) !== null) {
    // Add text before code
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      parts.push(formatBoldText(beforeText, key++));
    }
    // Add code
    parts.push(
      <code
        key={`code-${key++}`}
        className="px-1.5 py-0.5 bg-slate-800 text-indigo-300 rounded text-sm font-mono"
      >
        {match[1]}
      </code>
    );
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(formatBoldText(text.substring(lastIndex), key++));
  }

  return parts.length > 0 ? parts : text;
};

// Format bold text **text**
const formatBoldText = (text: string, baseKey: number) => {
  const parts: (string | JSX.Element)[] = [];
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(
      <strong key={`bold-${baseKey}-${key++}`} className="font-bold text-slate-900 dark:text-white">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : text;
};

const AILearnixoPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Hello! I'm AI Learnixo, your personal learning assistant. I can help you:\n\n• Understand programming concepts\n• Explain code and algorithms\n• Debug and optimize code\n• Learn best practices\n• Answer programming questions\n\nWhat would you like to learn today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [showFixCodeModal, setShowFixCodeModal] = useState(false);
  const [buggyCode, setBuggyCode] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [errorDescription, setErrorDescription] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle search query from URL parameter
  useEffect(() => {
    const query = searchParams.get('q');
    if (query && query.trim()) {
      setInputMessage(query);
      // Clear the query parameter after reading it
      setSearchParams({});
      // Auto-send the message after a short delay
      setTimeout(() => {
        if (query.trim()) {
          const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: query,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, userMessage]);
          setIsLoading(true);
          
          aiAPI.learnChat({
            message: query,
            conversationHistory: [],
          }).then(({ data }) => {
            if (data.fallback) {
              setIsFallbackMode(true);
            }
            const assistantMessage: Message = {
              id: data.id || Date.now().toString(),
              role: 'assistant',
              content: data.response,
              timestamp: new Date(data.timestamp || Date.now()),
            };
            setMessages((prev) => [...prev, assistantMessage]);
          }).catch((error) => {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
              id: Date.now().toString(),
              role: 'assistant',
              content: `I'm sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details and make sure the backend server is running.`,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
          }).finally(() => {
            setIsLoading(false);
            setInputMessage('');
          });
        }
      }, 500);
    }
  }, [searchParams, setSearchParams]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data } = await aiAPI.learnChat({
        message: inputMessage,
        conversationHistory: messages.slice(-10).map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      if (data.fallback) {
        setIsFallbackMode(true);
      }

      const assistantMessage: Message = {
        id: data.id || Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(data.timestamp || Date.now()),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I'm sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details and make sure the backend server is running.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFixCode = async () => {
    if (!buggyCode.trim()) return;

    // Close modal
    setShowFixCodeModal(false);

    // Create the fix code prompt
    const fixPrompt = `Please analyze and fix this ${codeLanguage} code:\n\n\`\`\`${codeLanguage}\n${buggyCode}\n\`\`\`\n\n${errorDescription ? `Error/Issue: ${errorDescription}\n\n` : ''}Please:\n1. Identify all bugs and issues\n2. Provide the corrected code\n3. Explain what was wrong and how you fixed it`;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: fixPrompt,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Clear form
    setBuggyCode('');
    setErrorDescription('');
    setCodeLanguage('javascript');

    try {
      const { data } = await aiAPI.learnChat({
        message: fixPrompt,
        conversationHistory: messages.slice(-10).map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      if (data.fallback) {
        setIsFallbackMode(true);
      }

      const assistantMessage: Message = {
        id: data.id || Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(data.timestamp || Date.now()),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error fixing code:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I'm sorry, I encountered an error while analyzing your code: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex flex-col">
      {isFallbackMode && (
        <div className="flex-shrink-0 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
          <div className="flex items-center space-x-2 max-w-5xl mx-auto">
            <svg className="w-4 h-4 text-amber-600 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Demo Mode - Configure Gemini API key for full AI capabilities
            </p>
          </div>
        </div>
      )}

      {/* Chat Container */}
      <div className="flex-1 flex flex-col w-full mx-auto overflow-hidden px-6">
        {/* Quick Action Bar */}
        <div className="flex-shrink-0 py-4">
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={() => setShowFixCodeModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="font-semibold">Fix Code</span>
            </button>
            <button
              onClick={() => setInputMessage('Explain how this code works: ')}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">Explain Code</span>
            </button>
            <button
              onClick={() => setInputMessage('Optimize this code: ')}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-semibold">Optimize</span>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto py-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              <div
                className={`max-w-[80%] rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 shadow-lg'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-5 py-3 shadow-md border border-slate-200 dark:border-slate-700'
                }`}
              >
                {message.role === 'user' ? (
                  <div className="text-sm whitespace-pre-wrap break-words">{message.content}</div>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                    {formatAIResponse(message.content)}
                  </div>
                )}
                <div
                  className={`text-[10px] mt-1.5 ${
                    message.role === 'user' ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 rounded-2xl px-5 py-3 shadow-md border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span className="text-xs text-slate-600 dark:text-slate-400">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 bg-white dark:bg-slate-900 rounded-2xl border-t border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-end space-x-3 max-w-6xl mx-auto rounded-2xl">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about programming..."
                className="w-full px-5 py-3.5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 resize-none transition-all duration-200 shadow-sm hover:shadow-md"
                rows={1}
                disabled={isLoading}
                style={{ minHeight: '52px', maxHeight: '120px' }}
              />
              {inputMessage.trim() && (
                <div className="absolute right-3 bottom-3 text-xs text-slate-400 dark:text-slate-500">
                  Press Enter to send
                </div>
              )}
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-5 py-3.5 h-[52px] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl rounded-2xl"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Fix Code Modal */}
      {showFixCodeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <h2 className="text-xl font-bold text-white">Fix My Code</h2>
              </div>
              <button
                onClick={() => setShowFixCodeModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-4">
                {/* Language Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Programming Language
                  </label>
                  <select
                    value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="csharp">C#</option>
                    <option value="php">PHP</option>
                    <option value="ruby">Ruby</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                    <option value="typescript">TypeScript</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="sql">SQL</option>
                  </select>
                </div>

                {/* Code Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Paste Your Buggy Code
                  </label>
                  <textarea
                    value={buggyCode}
                    onChange={(e) => setBuggyCode(e.target.value)}
                    placeholder="Paste your code here..."
                    className="w-full h-64 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Error Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Describe the Error or Issue (Optional)
                  </label>
                  <textarea
                    value={errorDescription}
                    onChange={(e) => setErrorDescription(e.target.value)}
                    placeholder="e.g., 'Getting undefined error on line 5' or 'Function not returning expected value'"
                    className="w-full h-24 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 flex items-center justify-end space-x-3 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowFixCodeModal(false)}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <Button
                onClick={handleFixCode}
                disabled={!buggyCode.trim() || isLoading}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Fix My Code
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AILearnixoPage;
