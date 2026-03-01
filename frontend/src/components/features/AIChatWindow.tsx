import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { chatWithAI, addChatMessage } from '../../store/slices/aiSlice';
import { AppDispatch } from '../../store/store';
import Button from '../shared/Button';


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

  const handleRunCodeFromChat = (code: string, lang: string) => {
    // In a real implementation, this would communicate with the terminal
    // For now, we'll suggest applying it to the editor first
    dispatch(addChatMessage({
      id: Date.now().toString() + '-info',
      role: 'assistant',
      content: `💡 To run this code, it's been auto-applied to your editor. Just click the **Run** button at the top!`,
      timestamp: new Date().toISOString()
    }));
  };

  if (isMinimized && variant !== 'sidebar') {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full w-16 h-16 shadow-[0_0_20px_rgba(79,70,229,0.4)] bg-gradient-to-br from-indigo-600 to-purple-600 hover:scale-110 transition-all border-2 border-white/20"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.456L3 21l2.544-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
          </svg>
        </Button>
      </div>
    );
  }

  const containerClasses = variant === 'sidebar'
    ? "h-full flex flex-col w-full bg-[#1e1e1e] border-l border-[#3e3e42]"
    : "h-[600px] w-[400px] fixed bottom-6 right-6 z-50 flex flex-col bg-white dark:bg-[#111111] rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 backdrop-blur-xl";

  return (
    <div className={containerClasses + " transition-all duration-300 animate-in slide-in-from-bottom-4"}>
      {/* Header */}
      <div className="flex items-center justify-between p-5 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white tracking-tight">AI Coding Companion</h3>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                {isTyping ? 'Thinking...' : 'Active'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 p-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 p-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${message.role === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-none'
                : 'bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-white/5 rounded-tl-none'
                }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>

              {/* Code blocks in messages */}
              {message.content.includes('```') && (
                <div className="mt-4">
                  {message.content.split('```').map((part, index) => {
                    if (index % 2 === 1) {
                      const lines = part.split('\n');
                      const firstLine = lines[0].trim();
                      const lang = firstLine || 'code';
                      const code = lines.slice(1).join('\n').trim();
                      return (
                        <div key={index} className="bg-[#0d0d0d] rounded-xl overflow-hidden border border-white/10 my-2 group/code">
                          <div className="flex justify-between items-center px-3 py-2 bg-white/5 border-b border-white/5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{lang}</span>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => copyToClipboard(code)}
                                className="text-slate-500 hover:text-indigo-400 p-1 transition-colors"
                                title="Copy code"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleRunCodeFromChat(code, lang)}
                                className="text-slate-500 hover:text-emerald-400 p-1 transition-colors"
                                title="Run code"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => insertCodeIntoEditor(code)}
                                className="text-slate-500 hover:text-indigo-400 p-1 transition-colors"
                                title="Apply to editor"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <pre className="p-4 text-xs font-mono text-indigo-300 overflow-x-auto bg-transparent">
                            <code>{code}</code>
                          </pre>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}

              <div className={`text-[9px] mt-2 font-medium uppercase tracking-wider ${message.role === 'user'
                ? 'text-indigo-200'
                : 'text-slate-400 dark:text-slate-500'
                }`}>
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer Area */}
      <div className="p-5 bg-slate-50 dark:bg-black/20 border-t border-slate-200 dark:border-white/5 space-y-4">
        {/* Quick Actions Scrollable */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="whitespace-nowrap px-3 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all shadow-sm"
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Input Field */}
        <div className="relative group">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm shadow-inner transition-all group-focus-within:shadow-indigo-500/10"
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-md transition-all active:scale-95"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatWindow;
