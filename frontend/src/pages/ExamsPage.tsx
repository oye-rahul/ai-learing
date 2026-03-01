import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '../components/shared/Button';
import Card from '../components/shared/Card';

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
    { id: 'css-basic', title: 'CSS Fundamentals', category: 'CSS', duration: '20 mins', questions: 10, difficulty: 'Intermediate' },
    { id: 'js-basic', title: 'JavaScript Essentials', category: 'JavaScript', duration: '30 mins', questions: 10, difficulty: 'Intermediate' },
    { id: 'python-intro', title: 'Python Introduction', category: 'Python', duration: '40 mins', questions: 20, difficulty: 'Beginner' },
    { id: 'react-advanced', title: 'React Advanced patterns', category: 'React', duration: '90 mins', questions: 40, difficulty: 'Advanced' },
    { id: 'sql-mastery', title: 'SQL Mastery', category: 'SQL', duration: '60 mins', questions: 30, difficulty: 'Advanced' },
];

// Define which exams are unlocked
const UNLOCKED_EXAMS = ['html-basic', 'css-basic', 'js-basic'];

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

const CSS_QUESTIONS = [
    { id: 1, text: "What does CSS stand for?", options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"], correct: 1 },
    { id: 2, text: "Which HTML attribute is used to define inline styles?", options: ["class", "font", "style", "styles"], correct: 2 },
    { id: 3, text: "Which is the correct CSS syntax?", options: ["{body;color:black;}", "body:color=black;", "body {color: black;}", "{body:color=black;}"], correct: 2 },
    { id: 4, text: "How do you insert a comment in a CSS file?", options: ["// this is a comment //", "/* this is a comment */", "' this is a comment", "// this is a comment"], correct: 1 },
    { id: 5, text: "Which property is used to change the background color?", options: ["color", "bgcolor", "background-color", "cellspacing"], correct: 2 },
    { id: 6, text: "How do you add a background color for all <h1> elements?", options: ["h1.all {background-color:#FFFFFF;}", "h1 {background-color:#FFFFFF;}", "all.h1 {background-color:#FFFFFF;}", "h1 {bg-color:#FFFFFF;}"], correct: 1 },
    { id: 7, text: "Which CSS property is used to change the text color of an element?", options: ["fgcolor", "color", "text-color", "font-color"], correct: 1 },
    { id: 8, text: "Which CSS property controls the text size?", options: ["font-style", "text-size", "font-size", "text-style"], correct: 2 },
    { id: 9, text: "What is the correct CSS syntax for making all the <p> elements bold?", options: ["p {font-weight:bold;}", "p {text-size:bold;}", "<p style='text-size:bold;'>", "p {font:bold;}"], correct: 0 },
    { id: 10, text: "How do you display hyperlinks without an underline?", options: ["a {text-decoration:none;}", "a {text-underline:none;}", "a {decoration:no-underline;}", "a {underline:none;}"], correct: 0 },
];

const JS_QUESTIONS = [
    { id: 1, text: "Inside which HTML element do we put the JavaScript?", options: ["<javascript>", "<scripting>", "<script>", "<js>"], correct: 2 },
    { id: 2, text: "What is the correct JavaScript syntax to change the content of <p id='demo'>?", options: ["document.getElementById('demo').innerHTML = 'Hello World!';", "document.getElement('p').innerHTML = 'Hello World!';", "#demo.innerHTML = 'Hello World!';", "document.getElementByName('p').innerHTML = 'Hello World!';"], correct: 0 },
    { id: 3, text: "Where is the correct place to insert a JavaScript?", options: ["The <head> section", "The <body> section", "Both the <head> and <body> section", "The <footer> section"], correct: 2 },
    { id: 4, text: "What is the correct syntax for referring to an external script 'xxx.js'?", options: ["<script name='xxx.js'>", "<script src='xxx.js'>", "<script href='xxx.js'>", "<script link='xxx.js'>"], correct: 1 },
    { id: 5, text: "How do you write 'Hello World' in an alert box?", options: ["alertBox('Hello World');", "msg('Hello World');", "msgBox('Hello World');", "alert('Hello World');"], correct: 3 },
    { id: 6, text: "How do you create a function in JavaScript?", options: ["function myFunction()", "function:myFunction()", "function = myFunction()", "def myFunction()"], correct: 0 },
    { id: 7, text: "How do you call a function named 'myFunction'?", options: ["call myFunction()", "myFunction()", "call function myFunction()", "run myFunction()"], correct: 1 },
    { id: 8, text: "How to write an IF statement in JavaScript?", options: ["if i = 5 then", "if i == 5 then", "if (i == 5)", "if i = 5"], correct: 2 },
    { id: 9, text: "How does a FOR loop start?", options: ["for (i <= 5; i++)", "for (i = 0; i <= 5; i++)", "for i = 1 to 5", "for (i = 0; i <= 5)"], correct: 1 },
    { id: 10, text: "How can you add a comment in a JavaScript?", options: ["'This is a comment", "<!--This is a comment-->", "//This is a comment", "*This is a comment*"], correct: 2 },
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

    const getQuestions = (examId: string) => {
        switch (examId) {
            case 'html-basic': return HTML_QUESTIONS;
            case 'css-basic': return CSS_QUESTIONS;
            case 'js-basic': return JS_QUESTIONS;
            default: return HTML_QUESTIONS;
        }
    };

    const currentQuestions = activeExam ? getQuestions(activeExam.id) : [];

    const handleSubmitExam = React.useCallback(() => {
        if (!activeExam) return;
        const questions = getQuestions(activeExam.id);
        let calculatedScore = 0;
        questions.forEach((q, index) => {
            if (userAnswers[index] === q.correct) {
                calculatedScore++;
            }
        });
        setScore(calculatedScore);
        setExamStatus('completed');
    }, [userAnswers, activeExam]);

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
    }, [examStatus, timeLeft, handleSubmitExam]);

    const handleStartExam = (exam: Exam) => {
        // Check if exam is locked
        if (!UNLOCKED_EXAMS.includes(exam.id)) {
            toast.warning(`🔒 ${exam.title} exam is locked! Complete HTML and CSS basics first to unlock more exams.`, {
                position: 'top-center',
                autoClose: 3000,
            });
            return;
        }

        if (exam.id !== 'html-basic' && exam.id !== 'css-basic' && exam.id !== 'js-basic') {
            toast.info(`Only 'HTML', 'CSS', and 'JS' exams are available in this demo.`);
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
        if (currentQuestionIndex < currentQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
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
        const question = currentQuestions[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;

        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 absolute inset-0 z-50 flex flex-col">
                {/* Exam Header */}
                <header className="bg-white dark:bg-slate-800 shadow px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">{activeExam.title}</h2>
                        <span className="text-sm text-slate-500">Question {currentQuestionIndex + 1} of {currentQuestions.length}</span>
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

                            {currentQuestionIndex === currentQuestions.length - 1 ? (
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
        const percentage = Math.round((score / currentQuestions.length) * 100);
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
                            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{score}/{currentQuestions.length}</div>
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
                {filteredExams.map(exam => {
                    const isLocked = !UNLOCKED_EXAMS.includes(exam.id);
                    return (
                        <Card
                            key={exam.id}
                            className={`hover:shadow-lg transition-shadow border-t-4 border-indigo-500 ${isLocked ? 'opacity-75 relative' : ''}`}
                        >
                            {isLocked && (
                                <div className="absolute top-4 right-4 bg-slate-800 text-white p-2 rounded-full">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
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
                                className={`w-full justify-center ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => handleStartExam(exam)}
                                disabled={isLocked}
                            >
                                {isLocked ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                        Locked
                                    </span>
                                ) : (
                                    'Start Exam'
                                )}
                            </Button>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default ExamsPage;
