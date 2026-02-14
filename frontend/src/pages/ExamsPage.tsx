import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '../components/shared/Button';
import Card from '../components/shared/Card';
import ProgressBar from '../components/shared/ProgressBar';

interface Exam {
    id: string;
    title: string;
    category: string;
    duration: string;
    questions: number;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

const EXAMS: Exam[] = [
    { id: 'html-basic', title: 'HTML Basic', category: 'HTML', duration: '30 mins', questions: 20, difficulty: 'Beginner' },
    { id: 'css-basic', title: 'CSS Fundamentals', category: 'CSS', duration: '45 mins', questions: 25, difficulty: 'Intermediate' },
    { id: 'js-basic', title: 'JavaScript Essentials', category: 'JavaScript', duration: '60 mins', questions: 30, difficulty: 'Intermediate' },
    { id: 'python-intro', title: 'Python Introduction', category: 'Python', duration: '40 mins', questions: 20, difficulty: 'Beginner' },
    { id: 'react-advanced', title: 'React Advanced patterns', category: 'React', duration: '90 mins', questions: 40, difficulty: 'Advanced' },
    { id: 'sql-mastery', title: 'SQL Mastery', category: 'SQL', duration: '60 mins', questions: 30, difficulty: 'Advanced' },
];

// Mock Questions for HTML Basic
const HTML_QUESTIONS = [
    { id: 1, text: "What does HTML stand for?", options: ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language", "Hyperlinking Text Mark Language"], correct: 0 },
    { id: 2, text: "Who is making the Web standards?", options: ["Mozilla", "Microsoft", "The World Wide Web Consortium", "Google"], correct: 2 },
    { id: 3, text: "Choose the correct HTML element for the largest heading:", options: ["<h6>", "<head>", "<heading>", "<h1>"], correct: 3 },
    { id: 4, text: "What is the correct HTML element for inserting a line break?", options: ["<lb>", "<br>", "<break>", "<newline>"], correct: 1 },
    { id: 5, text: "What is the correct HTML for adding a background color?", options: ["<body bg='yellow'>", "<body style='background-color:yellow;'>", "<background>yellow</background>", "<body background='yellow'>"], correct: 1 },
    { id: 6, text: "Choose the correct HTML element to define important text", options: ["<important>", "<b>", "<strong>", "<i>"], correct: 2 },
    { id: 7, text: "Choose the correct HTML element to define emphasized text", options: ["<i>", "<em>", "<italic>", "<emphasized>"], correct: 1 },
    { id: 8, text: "Which character is used to indicate an end tag?", options: ["*", "^", "/", "<"], correct: 2 },
    { id: 9, text: "How can you open a link in a new tab/browser window?", options: ["<a href='url' target='new'>", "<a href='url' target='_blank'>", "<a href='url' new>", "<a href='url' target='window'>"], correct: 1 },
    { id: 10, text: "Which of these elements are all <table> elements?", options: ["<table><tr><td>", "<table><head><tfoot>", "<table><tr><tt>", "<thead><body><tr>"], correct: 0 },
    { id: 11, text: "Inline elements are normally displayed without starting a new line.", options: ["True", "False"], correct: 0 },
    { id: 12, text: "How can you make a numbered list?", options: ["<dl>", "<ol>", "<list>", "<ul>"], correct: 1 },
    { id: 13, text: "How can you make a bulleted list?", options: ["<ol>", "<list>", "<dl>", "<ul>"], correct: 3 },
    { id: 14, text: "What is the correct HTML for making a checkbox?", options: ["<input type='checkbox'>", "<check>", "<checkbox>", "<input type='check'>"], correct: 0 },
    { id: 15, text: "What is the correct HTML for making a text input field?", options: ["<input type='text'>", "<textfield>", "<textinput>", "<input type='textfield'>"], correct: 0 },
    { id: 16, text: "What is the correct HTML for making a drop-down list?", options: ["<input type='dropdown'>", "<list>", "<input type='list'>", "<select>"], correct: 3 },
    { id: 17, text: "Which HTML attribute specifies an alternate text for an image, if the image cannot be displayed?", options: ["title", "src", "alt", "longdesc"], correct: 2 },
    { id: 18, text: "Which doctype is correct for HTML5?", options: ["<!DOCTYPE html>", "<!DOCTYPE HTML5>", "<!DOCTYPEhtml public 'html5'>", "<!DOCTYPE html SYSTEM 'about:legacy-compat'>"], correct: 0 },
    { id: 19, text: "Which HTML element is used to specify a footer for a document or section?", options: ["<bottom>", "<footer>", "<section>", "<aside>"], correct: 1 },
    { id: 20, text: "In HTML, text inputs are of type...", options: ["text", "input", "string", "txt"], correct: 0 },
];

const ExamsPage: React.FC = () => {
    const [filter, setFilter] = useState('All');
    const [activeExam, setActiveExam] = useState<Exam | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
    const [examStatus, setExamStatus] = useState<'idle' | 'running' | 'completed'>('idle');
    const [timeLeft, setTimeLeft] = useState(0); // in seconds
    const [score, setScore] = useState(0);

    const filteredExams = filter === 'All' ? EXAMS : EXAMS.filter(exam => exam.category === filter);
    const categories = ['All', ...Array.from(new Set(EXAMS.map(e => e.category)))];

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (examStatus === 'running' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleSubmitExam();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [examStatus, timeLeft]);

    const handleStartExam = (exam: Exam) => {
        if (exam.id !== 'html-basic') {
            toast.info(`Only 'HTML Basic' exam is available in this demo.`);
            return;
        }
        setActiveExam(exam);
        setExamStatus('running');
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setScore(0);
        // Parse "30 mins" to seconds
        const mins = parseInt(exam.duration.split(' ')[0]);
        setTimeLeft(mins * 60);

        // Enter fullscreen for immersive experience (optional, browser blocks auto-fullscreen usually)
        toast.success(`Started ${exam.title} Exam! Good luck.`);
    };

    const handleOptionSelect = (optionIndex: number) => {
        setUserAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: optionIndex
        }));
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < HTML_QUESTIONS.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmitExam = () => {
        let calculatedScore = 0;
        HTML_QUESTIONS.forEach((q, index) => {
            if (userAnswers[index] === q.correct) {
                calculatedScore++;
            }
        });
        setScore(calculatedScore);
        setExamStatus('completed');
    };

    const handleExitExam = () => {
        if (window.confirm("Are you sure you want to exit? Process will be lost.")) {
            setExamStatus('idle');
            setActiveExam(null);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // --- Active Exam View ---
    if (examStatus === 'running' && activeExam) {
        const question = HTML_QUESTIONS[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / HTML_QUESTIONS.length) * 100;

        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 absolute inset-0 z-50 flex flex-col">
                {/* Exam Header */}
                <header className="bg-white dark:bg-slate-800 shadow px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">{activeExam.title}</h2>
                        <span className="text-sm text-slate-500">Question {currentQuestionIndex + 1} of {HTML_QUESTIONS.length}</span>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className={`text-xl font-mono font-bold ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-slate-700 dark:text-slate-300'}`}>
                            ⏱ {formatTime(timeLeft)}
                        </div>
                        <Button variant="danger" size="sm" onClick={handleExitExam}>Exit Exam</Button>
                    </div>
                </header>

                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5">
                    <div className="bg-indigo-600 h-1.5 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>

                {/* Question Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
                    <div className="w-full max-w-3xl space-y-8">
                        <Card className="p-8">
                            <h3 className="text-xl md:text-2xl font-medium text-slate-900 dark:text-white mb-8 leading-relaxed">
                                {question.id}. {question.text}
                            </h3>

                            <div className="space-y-4">
                                {question.options.map((option, index) => (
                                    <label
                                        key={index}
                                        className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${userAnswers[currentQuestionIndex] === index
                                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${question.id}`}
                                            className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                                            checked={userAnswers[currentQuestionIndex] === index}
                                            onChange={() => handleOptionSelect(index)}
                                        />
                                        <span className="ml-4 text-base md:text-lg text-slate-700 dark:text-slate-200">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </Card>

                        <div className="flex justify-between pt-4">
                            <Button
                                variant="secondary"
                                onClick={handlePrevQuestion}
                                disabled={currentQuestionIndex === 0}
                            >
                                Previous
                            </Button>

                            {currentQuestionIndex === HTML_QUESTIONS.length - 1 ? (
                                <Button
                                    variant="primary"
                                    onClick={handleSubmitExam}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    Submit Exam
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    onClick={handleNextQuestion}
                                >
                                    Next Question
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Results View ---
    if (examStatus === 'completed' && activeExam) {
        const percentage = Math.round((score / HTML_QUESTIONS.length) * 100);
        const passed = percentage >= 70;

        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
                <Card className="max-w-2xl w-full text-center p-12">
                    <div className="mb-8">
                        {passed ? (
                            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-6xl">
                                🏆
                            </div>
                        ) : (
                            <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-6xl">
                                📚
                            </div>
                        )}
                    </div>

                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        {passed ? 'Congratulations!' : 'Keep Learning!'}
                    </h2>
                    <p className="text-slate-600 mb-8">
                        You {passed ? 'passed' : 'did not pass'} the <span className="font-semibold">{activeExam.title}</span> exam.
                    </p>

                    <div className="grid grid-cols-3 gap-6 mb-8 max-w-md mx-auto">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{score}/{HTML_QUESTIONS.length}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide">Score</div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <div className={`text-3xl font-bold ${passed ? 'text-green-600' : 'text-red-500'} mb-1`}>{percentage}%</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide">Accuracy</div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{activeExam.duration}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide">Time Limit</div>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <Button variant="secondary" onClick={() => setExamStatus('idle')}>
                            Back to Exams
                        </Button>
                        <Button variant="primary" onClick={() => handleStartExam(activeExam)}>
                            Retry Exam
                        </Button>
                    </div>

                    {/* Simple summary of answers could go here */}
                </Card>
            </div>
        );
    }

    // --- Dashboard View (Default) ---
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Certification Exams</h1>
                    <p className="text-slate-600 dark:text-slate-400">Validate your skills and earn certificates.</p>
                </div>
                <div className="flex space-x-2 mt-4 md:mt-0 overflow-x-auto pb-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === cat
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExams.map(exam => (
                    <Card key={exam.id} className="hover:shadow-lg transition-shadow border-t-4 border-indigo-500">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${exam.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                                exam.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                {exam.difficulty}
                            </span>
                            <span className="text-slate-400 text-sm">{exam.duration}</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{exam.title}</h3>
                        <p className="text-slate-500 text-sm mb-6">{exam.questions} Questions • Multiple Choice</p>
                        <Button
                            className="w-full justify-center"
                            onClick={() => handleStartExam(exam)}
                        >
                            Start Exam
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ExamsPage;
