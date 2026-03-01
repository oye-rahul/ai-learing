import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { aiAPI } from '../services/api';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import LoadingSpinner from '../components/shared/LoadingSpinner';

// Function to format AI response with better styling (reused from AILearnixoPage logic)
const formatAIResponse = (content: string) => {
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

    const formatInlineCode = (text: string, baseKey: string = 'inline') => {
        const parts: (string | JSX.Element)[] = [];
        let keyOffset = 0;
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

    const lines = content.split('\n');
    const formatted: JSX.Element[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeLanguage = '';

    lines.forEach((line, index) => {
        if (line.trim().startsWith('```')) {
            if (!inCodeBlock) {
                inCodeBlock = true;
                codeLanguage = line.trim().replace('```', '');
                codeBlockContent = [];
            } else {
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
        else if (line.trim() === '') {
            formatted.push(<div key={`empty-${index}`} className="h-2" />);
        }
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

const CodeExplainerPage: React.FC = () => {
    const [code, setCode] = useState('// Paste your code here\nfunction calculateSum(a, b) {\n  return a + b;\n}\n\nconsole.log(calculateSum(5, 10));');
    const [language, setLanguage] = useState('javascript');
    const [explanation, setExplanation] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleExplain = async () => {
        if (!code.trim() || isLoading) return;
        setIsLoading(true);
        setExplanation('');
        try {
            const response = await aiAPI.explainCodeBetter({ code, language });
            setExplanation(response.data.explanation);
        } catch (error: any) {
            console.error('Explainer error:', error);
            setExplanation(`### ❌ Error\nFailed to generate explanation: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-full flex flex-col space-y-6 container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Smart Code <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Explainer</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Break down complex code step-by-step with AI</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="appearance-none bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600"
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="typescript">TypeScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                            <option value="rust">Rust</option>
                            <option value="go">Go</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                    <Button
                        onClick={handleExplain}
                        disabled={isLoading || !code.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 px-6 py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <LoadingSpinner size="sm" />
                                Analyzing...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Explain This
                            </span>
                        )}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-[600px]">
                {/* Editor Side */}
                <div className="flex flex-col h-full group">
                    <Card className="flex-1 flex flex-col p-0 overflow-hidden border-2 border-slate-200 dark:border-slate-800 focus-within:border-indigo-500/50 transition-all shadow-lg rounded-2xl bg-slate-900">
                        <div className="bg-slate-800/80 backdrop-blur-md px-4 py-3 border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1.5 mr-2">
                                    <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                                </div>
                                <span className="text-xs font-mono uppercase tracking-widest text-slate-400">editor.exe</span>
                            </div>
                        </div>
                        <div className="flex-1 min-h-0">
                            <Editor
                                height="100%"
                                language={language}
                                theme="vs-dark"
                                value={code}
                                onChange={(value) => setCode(value || '')}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 15,
                                    lineNumbers: 'on',
                                    roundedSelection: true,
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    padding: { top: 20 },
                                    cursorStyle: 'block',
                                    fontFamily: '"Fira Code", monospace',
                                    fontLigatures: true
                                }}
                            />
                        </div>
                    </Card>
                </div>

                {/* Explanation Side */}
                <div className="flex flex-col h-full">
                    <Card className="flex-1 bg-white dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-800 shadow-lg rounded-2xl overflow-hidden flex flex-col">
                        <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
                            <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">AI Intelligence</span>
                        </div>
                        <div className="flex-1 overflow-auto p-6 md:p-8">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-6 py-20">
                                    <div className="relative">
                                        <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <svg className="w-8 h-8 text-indigo-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Analyzing Logic</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">Claude is breaking down your code into understandable chunks...</p>
                                    </div>
                                </div>
                            ) : explanation ? (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {formatAIResponse(explanation)}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20 text-center">
                                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-300 dark:text-slate-600">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Ready for analysis</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-500 max-w-xs mx-auto">
                                        Paste your code in the editor and click "Explain This" to uncover the magic behind the lines.
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CodeExplainerPage;
