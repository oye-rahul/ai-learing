import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { chatWithAI, addChatMessage, clearChatMessages } from '../../store/slices/aiSlice';
import { AppDispatch } from '../../store/store';
import Button from '../shared/Button';
import Card from '../shared/Card';
import LoadingSpinner from '../shared/LoadingSpinner';

interface AIChatWindowProps {
  onClose: () => void;
  currentCode: string;
  language: string;
  onCodeUpdate: (code: string) => void;
  variant?: 'floating' | 'sidebar';
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  code?: string;
  language?: string;
}

const AIChatWindow: React.FC<AIChatWindowProps> = ({
  onClose,
  currentCode,
  language,
  onCodeUpdate,
  variant = 'floating',
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { chatMessages, loading, isTyping } = useSelector((state: RootState) => state.ai);

  const [inputMessage, setInputMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  useEffect(() => {
    // Initialize with welcome message if no messages
    if (chatMessages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Hi! I'm your AI coding assistant. I can help you with:

🔍 **Code Analysis** - Explain what your code does
⚡ **Optimization** - Make your code faster and cleaner  
🐛 **Debugging** - Find and fix issues
🔄 **Conversion** - Convert between programming languages
💡 **Suggestions** - Get coding tips and best practices
❓ **Questions** - Ask me anything about programming!

What would you like to work on today?`,
        timestamp: new Date().toISOString(),
      };
      dispatch(addChatMessage(welcomeMessage));
    }
  }, [dispatch, chatMessages.length]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
      code: currentCode,
      language,
    };

    dispatch(addChatMessage(userMessage));
    setInputMessage('');

    try {
      const result: any = await dispatch(chatWithAI({
        message: inputMessage,
        code: currentCode,
        language,
        conversationHistory: chatMessages.slice(-10), // Last 10 messages for context
      })).unwrap();

      // Check for code blocks in the response and auto-apply
      if (result && result.response) {
        // Extract code block - Regex matches ```language (optional) [content] ```
        const codeBlockRegex = /```(?:\w+)?\s*([\s\S]*?)```/;
        const match = result.response.match(codeBlockRegex);

        if (match && match[1]) {
          const extractedCode = match[1].trim();

          // Auto-apply the code to the editor
          insertCodeIntoEditor(extractedCode);

          // Add a system note that code was applied
          // verify we don't duplicate messages too fast?
          dispatch(addChatMessage({
            id: Date.now().toString() + '-system',
            role: 'assistant',
            content: '✅ Code auto-applied to editor.',
            timestamp: new Date().toISOString()
          }));
        }
      }

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
      };
      dispatch(addChatMessage(errorMessage));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    {
      label: '🔍 Explain this code',
      action: () => setInputMessage('Can you explain what this code does?'),
    },
    {
      label: '⚡ Optimize this code',
      action: () => setInputMessage('How can I optimize this code for better performance?'),
    },
    {
      label: '🐛 Find bugs',
      action: () => setInputMessage('Can you help me find any bugs or issues in this code?'),
    },
    {
      label: '💡 Improve this code',
      action: () => setInputMessage('What improvements would you suggest for this code?'),
    },
    {
      label: '📚 Best practices',
      action: () => setInputMessage('What are the best practices for this type of code?'),
    },
    {
      label: '🔄 Convert language',
      action: () => setInputMessage('Can you convert this code to Python?'),
    },
  ];

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const insertCodeIntoEditor = (codeSnippet: string) => {
    onCodeUpdate(codeSnippet);
  };

  if (isMinimized && variant !== 'sidebar') {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full w-14 h-14 shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.456L3 21l2.544-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
          </svg>
        </Button>
      </div>
    );
  }

  const containerClasses = variant === 'sidebar'
    ? "h-full flex flex-col w-full bg-[#1e1e1e] border-l border-[#3e3e42]"
    : "h-full flex flex-col max-w-md mx-auto bg-white dark:bg-[#1e1e1e] rounded-xl shadow-xl overflow-hidden border border-slate-200 dark:border-[#3e3e42]";

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-slate-900 dark:text-white">AI Assistant</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isTyping ? 'Typing...' : 'Online'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={() => dispatch(clearChatMessages())}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
            title="Clear chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.role === 'user'
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                }`}
            >
              <div className="whitespace-pre-wrap text-sm">{message.content}</div>

              {/* Code blocks in messages */}
              {message.content.includes('```') && (
                <div className="mt-2">
                  {message.content.split('```').map((part, index) => {
                    if (index % 2 === 1) {
                      const lines = part.split('\n');
                      const lang = lines[0];
                      const code = lines.slice(1).join('\n');
                      return (
                        <div key={index} className="bg-slate-900 text-green-400 p-2 rounded text-xs font-mono mt-2 relative">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-slate-400">{lang}</span>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => copyToClipboard(code)}
                                className="text-slate-400 hover:text-white p-1"
                                title="Copy code"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => insertCodeIntoEditor(code)}
                                className="text-slate-400 hover:text-white p-1"
                                title="Insert into editor (Auto-Applied)"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <pre className="whitespace-pre-wrap">{code}</pre>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}

              <p className={`text-xs mt-1 ${message.role === 'user'
                ? 'text-primary-100'
                : 'text-slate-500 dark:text-slate-400'
                }`}>
                {formatTimestamp(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-lg flex items-center space-x-2">
              <LoadingSpinner size="sm" />
              <p className="text-sm text-slate-600 dark:text-slate-400">AI is thinking...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-2 gap-2 mb-4">
          {quickActions.slice(0, 4).map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={action.action}
              className="text-xs justify-start"
            >
              {action.label}
            </Button>
          ))}
        </div>

        {/* Input */}
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your code..."
            className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm"
            disabled={loading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || loading}
            size="sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIChatWindow;
