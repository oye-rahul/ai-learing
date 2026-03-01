import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { aiAPI } from '../services/api';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import LoadingSpinner from '../components/shared/LoadingSpinner';

// Reuse the formatting logic
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
                <h3 key={index} className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-6 mb-3">
                    {line.replace(/^###\s*/, '')}
                </h3>
            );
        } else if (line.trim().startsWith('##')) {
            formatted.push(
                <h2 key={index} className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-6 mb-3">
                    {line.replace(/^##\s*/, '')}
                </h2>
            );
        } else if (line.trim().startsWith('#')) {
            formatted.push(
                <h1 key={index} className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-6 mb-4">
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
                        <span className="text-rose-500 font-semibold min-w-[20px]">{number}.</span>
                    ) : (
                        <span className="text-rose-500 mt-1">•</span>
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

const DebugHelperPage: React.FC = () => {
    const [code, setCode] = useState('// Paste buggy code here\nfunction findMax(arr) {\n  let max = 0;\n  for (let i = 0; i <= arr.length; i++) {\n    if (arr[i] > max) {\n      max = arr[i];\n    }\n  }\n  return max;\n}\n\nconsole.log(findMax([1, 5, 2, 8, 3]));');
    const [error, setError] = useState('Result is sometimes wrong for negative numbers or empty arrays.');
    const [language, setLanguage] = useState('javascript');
    const [solution, setSolution] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleDebug = async () => {
        if (!code.trim() || isLoading) return;
        setIsLoading(true);
        setSolution('');
        try {
            const response = await aiAPI.debugHelp({ code, language, error });
            setSolution(response.data.debug_suggestions);
        } catch (error: any) {
            console.error('Debug error:', error);
            setSolution(`### ❌ Error\nFailed to debug code: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-full flex flex-col space-y-8 container mx-auto px-4 py-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-lg shadow-rose-500/10">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">AI Debug <span className="text-rose-500">Helper</span></h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Identify mistakes and get instant fixes for your buggy code</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-transparent border-none text-sm font-semibold text-slate-600 dark:text-slate-300 focus:ring-0 cursor-pointer"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                    </select>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                {/* Left Side: Inputs */}
                <div className="space-y-6">
                    <Card className="p-0 overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl bg-slate-900">
                        <div className="bg-slate-800/80 px-4 py-3 border-b border-white/5 flex justify-between items-center">
                            <span className="text-xs font-mono uppercase tracking-widest text-slate-400">Buggy Code</span>
                        </div>
                        <div className="h-[400px]">
                            <Editor
                                height="100%"
                                language={language}
                                theme="vs-dark"
                                value={code}
                                onChange={(value) => setCode(value || '')}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    padding: { top: 16 }
                                }}
                            />
                        </div>
                    </Card>

                    <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">
                            Error Message or Description (Optional)
                        </label>
                        <textarea
                            value={error}
                            onChange={(e) => setError(e.target.value)}
                            placeholder="What's going wrong? Paste the error log or describe the bug..."
                            className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none"
                        ></textarea>
                    </Card>

                    <Button
                        onClick={handleDebug}
                        disabled={isLoading || !code.trim()}
                        className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-rose-500/20 transform active:scale-95 transition-all"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-3">
                                <LoadingSpinner size="md" />
                                Hunting for Bugs...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                                Find and Fix Bugs
                            </span>
                        )}
                    </Button>
                </div>

                {/* Right Side: Results */}
                <div className="h-full">
                    <Card className="h-full min-h-[600px] border-2 border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl overflow-hidden flex flex-col bg-white dark:bg-slate-900/50">
                        <div className="bg-rose-500/5 px-4 py-3 border-b border-rose-500/10 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                            <span className="text-xs font-bold uppercase tracking-widest text-rose-500">Fix & Suggestions</span>
                        </div>
                        <div className="flex-1 overflow-auto p-6 md:p-8">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-6 py-20 text-center">
                                    <div className="relative">
                                        <div className="w-24 h-24 border-4 border-rose-500/10 border-t-rose-500 rounded-full animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <svg className="w-10 h-10 text-rose-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">AI is Inspecting...</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">We're tracing your code logic and identifying the root cause.</p>
                                    </div>
                                </div>
                            ) : solution ? (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                    {formatAIResponse(solution)}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full py-20 text-center text-slate-400">
                                    <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-300 dark:text-slate-600 border-4 border-white dark:border-slate-900 shadow-inner">
                                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">No bugs selected yet</h3>
                                    <p className="text-sm max-w-xs mx-auto text-slate-500">
                                        Click "Find and Fix Bugs" to let our AI scan your code and provide a working solution.
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

export default DebugHelperPage;
