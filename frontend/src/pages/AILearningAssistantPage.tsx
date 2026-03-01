import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { aiAPI } from '../services/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import {
  Sparkles,
  Lightbulb,
  Zap,
  BookOpen,
  Bug,
  FileText,
  ArrowLeft,
  Send,
  User,
  Bot
} from 'lucide-react';

interface AssistantMode {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
}

const ASSISTANT_MODES: AssistantMode[] = [
  {
    id: 'concept-explainer',
    title: 'Concept Explainer',
    description: 'Break down complex technical concepts into simple, understandable explanations',
    icon: <Sparkles className="w-8 h-8" />,
    color: 'from-blue-500 to-indigo-600',
    features: ['ELI5 Mode', 'Analogy Engine', 'Concept Mapping', 'Interactive Q&A']
  },
  {
    id: 'code-tutor',
    title: 'Code Tutor',
    description: 'Learn programming through guided practice and instant feedback',
    icon: <Zap className="w-8 h-8" />,
    color: 'from-emerald-500 to-teal-600',
    features: ['Code Feedback', 'Step-by-Step Logic', 'Best Practices', 'Quiz Mode']
  },
  {
    id: 'workflow-optimizer',
    title: 'Workflow Optimizer',
    description: 'Streamline your development process and boost productivity',
    icon: <Zap className="w-8 h-8" />,
    color: 'from-purple-500 to-pink-600',
    features: ['Automation Tips', 'Tool Stack Advice', 'Refactoring', 'CI/CD Insights']
  },
  {
    id: 'knowledge-organizer',
    title: 'Knowledge Organizer',
    description: 'Summarize and organize information for better retention',
    icon: <BookOpen className="w-8 h-8" />,
    color: 'from-orange-500 to-red-600',
    features: ['Smart Summaries', 'Note Strategy', 'Spaced Repetition', 'Roadmap Builder']
  },
  {
    id: 'debugging-assistant',
    title: 'Debugging Assistant',
    description: 'Find and fix bugs faster with AI-powered analysis',
    icon: <Bug className="w-8 h-8" />,
    color: 'from-rose-500 to-red-700',
    features: ['Fix Strategies', 'Bug Hunting', 'Log Analysis', 'Prevention Tips']
  },
  {
    id: 'documentation-helper',
    title: 'Documentation Helper',
    description: 'Generate clear, comprehensive documentation automatically',
    icon: <FileText className="w-8 h-8" />,
    color: 'from-sky-500 to-blue-700',
    features: ['API Docs', 'Readme Generator', 'Comment Buddy', 'Style Guide']
  }
];

const AILearningAssistantPage: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isProcessing]);

  const handleModeSelect = (modeId: string) => {
    setSelectedMode(modeId);
    const mode = ASSISTANT_MODES.find(m => m.id === modeId);
    setChatHistory([{
      role: 'assistant',
      content: `### 🚀 Welcome to ${mode?.title}! 
      
      I'm your specialized AI assistant. ${mode?.description}
      
      How can I help you excel today? Try asking me something complex or paste some code you're working on!`
    }]);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isProcessing) return;

    const currentMode = selectedMode;
    if (!currentMode) return;

    const userMessage = { role: 'user', content: userInput };
    setChatHistory(prev => [...prev, userMessage]);
    const inputToProcess = userInput;
    setUserInput('');
    setIsProcessing(true);

    try {
      const response = await aiAPI.assistantChat({
        message: inputToProcess,
        mode: currentMode,
        conversationHistory: chatHistory
      });

      setChatHistory(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('The AI is resting right now. Please try again in a moment.');
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please check your connection or API key and try again."
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-2 max-w-full animate-in fade-in duration-500">
      {!selectedMode ? (
        <div className="space-y-12">
          <div className="text-center max-w-4xl mx-auto py-12">
            <h1 className="text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
              Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Full Potential</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 font-medium">
              Choose a specialized AI companion designed to help you master any technolgoy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ASSISTANT_MODES.map((mode) => (
              <div
                key={mode.id}
                onClick={() => handleModeSelect(mode.id)}
                className="group cursor-pointer relative"
              >
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${mode.color} rounded-3xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200`}></div>
                <div className="relative p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col h-full hover:shadow-2xl transition-all">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${mode.color} flex items-center justify-center text-white shadow-xl mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    {mode.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 transition-all">
                    {mode.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                    {mode.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {mode.features.map((feature, i) => (
                      <span key={i} className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 transition-colors">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-120px)] min-h-[500px] animate-in slide-in-from-bottom-8 duration-700">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col h-full border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className={`p-4 px-6 bg-gradient-to-r ${ASSISTANT_MODES.find(m => m.id === selectedMode)?.color} flex justify-between items-center shadow-lg relative z-10`}>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedMode(null)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all backdrop-blur-md text-white group"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div className="text-white">
                  <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                    {ASSISTANT_MODES.find(m => m.id === selectedMode)?.icon}
                    {ASSISTANT_MODES.find(m => m.id === selectedMode)?.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 opacity-90">
                    <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse shadow-[0_0_8px_rgba(110,231,183,1)]"></span>
                    <span className="text-xs font-bold uppercase tracking-widest">Enhanced Intelligence Active</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex gap-4">
                <div className="px-4 py-2 bg-black/20 backdrop-blur-md rounded-xl text-white/90 text-xs font-bold flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Context-Aware
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/20 custom-scrollbar">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                  <div className={`flex items-start gap-4 max-w-[90%] md:max-w-[80%]`}>
                    {msg.role === 'assistant' && (
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${ASSISTANT_MODES.find(m => m.id === selectedMode)?.color} flex items-center justify-center text-white shadow-lg shrink-0 mt-1`}>
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div className={`p-4 rounded-2xl shadow-sm ${msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-sm px-6'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-tl-sm prose-amazing'
                      }`}>
                      {msg.role === 'user' ? (
                        <p className="text-md font-medium leading-relaxed">{msg.content}</p>
                      ) : (
                        <div className="prose dark:prose-invert prose-indigo max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-2xl">
                          <ReactMarkdown
                            components={{
                              code({ node, inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                  <div className="relative group my-4">
                                    <div className="absolute right-4 top-4 text-[10px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {match[1].toUpperCase()}
                                    </div>
                                    <SyntaxHighlighter
                                      style={atomDark}
                                      language={match[1]}
                                      PreTag="div"
                                      className="!rounded-2xl !p-6 !m-0 !bg-slate-950/80 border border-white/5 shadow-2xl"
                                      {...props}
                                    >
                                      {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                  </div>
                                ) : (
                                  <code className={`${className} bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded text-indigo-500 font-mono text-sm`} {...props}>
                                    {children}
                                  </code>
                                );
                              },
                              h1: ({ children }) => <h1 className="text-3xl font-black mb-4 mt-2 text-slate-900 dark:text-white uppercase tracking-tight">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-2xl font-bold mb-3 mt-6 border-l-4 border-indigo-500 pl-4 text-slate-900 dark:text-white">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-xl font-bold mb-2 mt-4 text-indigo-600 dark:text-indigo-400">{children}</h3>,
                              ul: ({ children }) => <ul className="list-disc pl-6 space-y-2 my-4">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-6 space-y-2 my-4">{children}</ol>,
                              blockquote: ({ children }) => <blockquote className="border-l-4 border-slate-300 dark:border-slate-600 italic pl-6 my-6 text-slate-500">{children}</blockquote>,
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 mt-1">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start animate-in fade-in">
                  <div className="flex items-start gap-4 max-w-[90%]">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${ASSISTANT_MODES.find(m => m.id === selectedMode)?.color} flex items-center justify-center text-white shadow-lg shrink-0 mt-1`}>
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Processing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
              <div className="max-w-4xl mx-auto relative group">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Ask the ${ASSISTANT_MODES.find(m => m.id === selectedMode)?.title}...`}
                  className="w-full pl-6 pr-14 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-slate-900 dark:text-white shadow-inner font-medium text-sm"
                  disabled={isProcessing}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!userInput.trim() || isProcessing}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 bg-gradient-to-r ${ASSISTANT_MODES.find(m => m.id === selectedMode)?.color} text-white`}
                >
                  {isProcessing ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-center mt-3 text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                Powered by Gemini AI • Enhanced Learning Models
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AILearningAssistantPage;