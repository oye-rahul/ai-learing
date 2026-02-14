import React, { useState, useRef, useEffect } from 'react';
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
    // List items (bullet or numbered)
    else if (line.trim().startsWith('*') || line.trim().startsWith('-') || line.trim().startsWith('•') || /^\d+\.\s/.test(line.trim())) {
      const isNumbered = /^\d+\.\s/.test(line.trim());
      const content = isNumbered ? line.replace(/^\d+\.\s/, '') : line.replace(/^[*\-•]\s*/, '');
      const number = isNumbered ? line.match(/^(\d+)/)?.[1] : null;

      formatted.push(
        <div key={`line-${index}`} className="flex items-start space-x-3 my-2 text-slate-700 dark:text-slate-300">
          {isNumbered ? (
            <span className="text-indigo-500 font-semibold min-w-[20px]">{number}.</span>
          ) : (
            <span className="text-indigo-500 mt-1">•</span>
          )}
          <div className="flex-1">{formatInlineCode(content, `line-${index}`)}</div>
        </div>
      );
    }
    // Empty lines
    else if (line.trim() === '') {
      formatted.push(<div key={`empty-${index}`} className="h-2" />);
    }
    // Regular paragraphs
    else {
      formatted.push(
        <p key={`p-${index}`} className="my-3 leading-relaxed text-slate-700 dark:text-slate-300">
          {formatInlineCode(line, `p-${index}`)}
        </p>
      );
    }
  });

  return <div className="space-y-1">{formatted}</div>;
};

// Format inline code and bold text
const formatInlineCode = (text: string, baseKey: string = 'inline') => {
  const parts: (string | JSX.Element)[] = [];
  let keyOffset = 0;

  // Handle inline code `code`
  const codeRegex = /`([^`]+)`/g;
  let lastIndex = 0;
  let match;

  while ((match = codeRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      parts.push(formatBoldText(beforeText, `${baseKey}-text-${keyOffset++}`));
    }
    parts.push(
      <code
        key={`code-${baseKey}-${keyOffset++}`}
        className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 rounded text-[0.9em] font-mono border border-slate-300 dark:border-slate-700 mx-0.5"
      >
        {match[1]}
      </code>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(formatBoldText(text.substring(lastIndex), `${baseKey}-text-${keyOffset++}`));
  }

  return parts.length > 0 ? <React.Fragment key={`inline-wrapper-${baseKey}`}>{parts}</React.Fragment> : text;
};

// Format bold text **text**
const formatBoldText = (text: string, baseKey: string | number) => {
  const parts: (string | JSX.Element)[] = [];
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match;
  let keyOffset = 0;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(
      <strong key={`bold-${baseKey}-${keyOffset++}`} className="font-bold text-slate-900 dark:text-white">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? <React.Fragment key={`fragment-${baseKey}`}>{parts}</React.Fragment> : text;
};

const AILearnixoPage: React.FC = () => {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">AI Learnixo</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your Personal Learning Assistant</p>
          </div>
        </div>
        {isFallbackMode && (
          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full dark:bg-yellow-900/30 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-700">
            Demo Mode
          </span>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl ${message.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/50 text-slate-900 dark:text-slate-200 px-6 py-4 border border-slate-200 dark:border-slate-700/50'
                  }`}
              >
                {message.role === 'user' ? (
                  <div className="whitespace-pre-wrap break-words">{message.content}</div>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {formatAIResponse(message.content)}
                  </div>
                )}
                <div
                  className={`text-[10px] mt-2 opacity-70 ${message.role === 'user' ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
                    }`}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl px-6 py-4 border border-slate-200 dark:border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm text-slate-600 dark:text-slate-400 animate-pulse">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-end bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message AI Learnixo..."
              className="flex-1 max-h-48 min-h-[56px] py-4 pl-4 pr-12 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none resize-none overflow-y-auto"
              rows={1}
              style={{ height: 'auto', minHeight: '56px' }}
              disabled={isLoading}
            />
            <div className="absolute right-2 bottom-2">
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className={`p-2 rounded-lg transition-all ${!inputMessage.trim() || isLoading
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </Button>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2">
            AI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AILearnixoPage;
