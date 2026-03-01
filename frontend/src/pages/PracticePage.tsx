import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { aiAPI } from '../services/api';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import { toast } from 'react-toastify';

interface PracticeProblem {
    id?: string;
    title: string;
    description: string;
    difficulty: string;
    starting_code?: string;
    test_cases: { input: string; expected: string }[];
    solution: string;
    hints: string[];
    topic: string;
}

const PracticePage: React.FC = () => {
    const [topic, setTopic] = useState('javascript');
    const [skillLevel, setSkillLevel] = useState('beginner');
    const [problem, setProblem] = useState<PracticeProblem | null>(null);
    const [userCode, setUserCode] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showHints, setShowHints] = useState(false);
    const [currentHintIndex, setCurrentHintIndex] = useState(0);
    const [results, setResults] = useState<{ passed: boolean; message: string } | null>(null);

    const generateProblem = async () => {
        setIsGenerating(true);
        setResults(null);
        setShowHints(false);
        setCurrentHintIndex(0);
        try {
            const response = await aiAPI.generatePractice({ topic, skillLevel });
            const problemData = response.data;
            setProblem(problemData);
            setUserCode(problemData.starting_code || `// Write your ${topic} solution here\n`);
            toast.success('New challenge generated! Ready?');
        } catch (error) {
            console.error('Generation error:', error);
            toast.error('Failed to generate problem. Try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async () => {
        if (!problem || !userCode.trim()) return;
        setIsSubmitting(true);

        // In a real app, we'd run the code against test cases. 
        // For this AI-centric demo, we'll ask AI to evaluate the solution or simulate it.
        try {
            // Simulate evaluation - in reality, would use backend code execution or AI review
            const response = await aiAPI.executeCode({ code: userCode, language: topic });

            // Just a basic check for the demo
            const isCorrect = response.data.output && !response.data.output.toLowerCase().includes('error');

            setResults({
                passed: isCorrect,
                message: isCorrect
                    ? "Great job! Your solution passed the basic checks."
                    : "Something's not right. Check your logic or look at the hints."
            });

            if (isCorrect) {
                toast.success('Challenge Completed! 🎉');
            } else {
                toast.warn('Logic error detected. Try again!');
            }
        } catch (error) {
            toast.error('Submission failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 min-h-screen">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="p-2 bg-amber-500 rounded-xl text-white shadow-lg shadow-amber-500/20">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </span>
                        AI Practice <span className="text-amber-500 font-light">Laboratory</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Hone your skills with infinite AI-generated challenges</p>
                </div>

                <div className="flex bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex flex-col px-4 border-r border-slate-100 dark:border-slate-700">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Topic</label>
                        <select
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="bg-transparent border-none p-0 text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer"
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="react">React</option>
                            <option value="sql">SQL</option>
                        </select>
                    </div>
                    <div className="flex flex-col px-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Level</label>
                        <select
                            value={skillLevel}
                            onChange={(e) => setSkillLevel(e.target.value)}
                            className="bg-transparent border-none p-0 text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer"
                        >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="expert">Expert</option>
                        </select>
                    </div>
                </div>
            </header>

            {!problem ? (
                <Card className="flex flex-col items-center justify-center py-24 border-dashed border-4 border-slate-200 dark:border-slate-800 shadow-none bg-slate-50/50 dark:bg-transparent rounded-[3rem]">
                    <div className="w-24 h-24 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white mb-8 shadow-2xl animate-pulse">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Ready to test your limits?</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md text-center mb-10 text-lg">
                        Select your preferred topic and skill level above, then click the button below to generate a unique coding problem just for you.
                    </p>
                    <Button
                        onClick={generateProblem}
                        disabled={isGenerating}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-10 py-5 rounded-3xl text-xl font-bold hover:scale-105 transition-all shadow-xl shadow-amber-500/30"
                    >
                        {isGenerating ? 'Generating Power...' : 'Generate New Challenge'}
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Problem Details */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-2 border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                            <div className={`px-6 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center ${problem.difficulty === 'Hard' ? 'bg-rose-500/10' :
                                problem.difficulty === 'Medium' ? 'bg-amber-500/10' : 'bg-emerald-500/10'
                                }`}>
                                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Subject: {problem.topic}</span>
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${problem.difficulty === 'Hard' ? 'bg-rose-500 text-white' :
                                    problem.difficulty === 'Medium' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                                    }`}>
                                    {problem.difficulty}
                                </span>
                            </div>
                            <div className="p-8 space-y-6">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">{problem.title}</h2>
                                <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
                                    {problem.description}
                                </div>

                                {problem.hints.length > 0 && (
                                    <div className="mt-8">
                                        {!showHints ? (
                                            <button
                                                onClick={() => setShowHints(true)}
                                                className="text-sm font-bold text-amber-500 hover:text-amber-600 underline decoration-2 underline-offset-4"
                                            >
                                                Need a hint?
                                            </button>
                                        ) : (
                                            <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-200 dark:border-amber-700/50">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-2">Hint #{currentHintIndex + 1}</span>
                                                    <p className="text-sm text-amber-900 dark:text-amber-200 font-medium">{problem.hints[currentHintIndex]}</p>
                                                    <div className="flex justify-between mt-4">
                                                        <button
                                                            onClick={() => setCurrentHintIndex(prev => Math.max(0, prev - 1))}
                                                            disabled={currentHintIndex === 0}
                                                            className="text-xs font-bold disabled:opacity-30"
                                                        >
                                                            Previous
                                                        </button>
                                                        <button
                                                            onClick={() => setCurrentHintIndex(prev => Math.min(problem.hints.length - 1, prev + 1))}
                                                            disabled={currentHintIndex === problem.hints.length - 1}
                                                            className="text-xs font-bold disabled:opacity-30"
                                                        >
                                                            Next Hint
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>

                        <Button
                            onClick={generateProblem}
                            variant="ghost"
                            className="w-full text-slate-500 py-4 hover:bg-slate-100"
                        >
                            Skip this problem
                        </Button>
                    </div>

                    {/* Editor Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-0 overflow-hidden border-2 border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl bg-slate-900 min-h-[500px] flex flex-col">
                            <div className="bg-slate-800/80 px-4 py-3 border-b border-white/5 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                    <span className="text-[10px] font-mono ml-4 text-slate-500 uppercase tracking-widest">
                                        practice_session.{topic === 'python' ? 'py' : topic === 'sql' ? 'sql' : 'js'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 min-h-[500px]">
                                <Editor
                                    height="500px"
                                    language={topic === 'react' ? 'javascript' : topic}
                                    theme="vs-dark"
                                    value={userCode}
                                    onChange={(val) => setUserCode(val || '')}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 16,
                                        padding: { top: 20 },
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        contextmenu: true,
                                        lineNumbers: 'on',
                                        renderLineHighlight: 'all',
                                        scrollbar: {
                                            vertical: 'visible',
                                            horizontal: 'visible'
                                        }
                                    }}
                                />
                            </div>
                        </Card>

                        <div className="flex gap-4">
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl text-lg font-black shadow-xl shadow-emerald-500/20"
                            >
                                {isSubmitting ? 'Evaluating...' : 'Submit Solution'}
                            </Button>
                        </div>

                        {results && (
                            <div className={`p-6 rounded-2xl border-2 animate-in slide-in-from-top-4 duration-300 ${results.passed
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-200'
                                : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-200'
                                }`}>
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-full ${results.passed ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                        {results.passed ? (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg mb-1">{results.passed ? 'Success!' : 'Keep Trying!'}</h4>
                                        <p className="text-sm opacity-90">{results.message}</p>

                                        {results.passed && (
                                            <div className="mt-4 flex gap-3">
                                                <Button size="sm" onClick={generateProblem} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Try Another</Button>
                                                <Button size="sm" variant="ghost" className="text-emerald-600 border-emerald-600 border px-4 font-bold">Back to Dashboard</Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PracticePage;
