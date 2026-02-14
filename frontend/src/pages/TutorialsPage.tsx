import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/shared/Button';
import Card from '../components/shared/Card';

const LANGUAGES = [
    'HTML', 'CSS', 'JAVASCRIPT', 'SQL', 'PYTHON', 'JAVA', 'PHP', 'HOW TO', 'W3.CSS', 'C', 'C++', 'C#', 'BOOTSTRAP', 'REACT', 'MYSQL', 'JQUERY'
];

const TOPICS: Record<string, string[]> = {
    HTML: [
        'HTML HOME', 'HTML Introduction', 'HTML Editors', 'HTML Basic', 'HTML Elements', 'HTML Attributes',
        'HTML Headings', 'HTML Paragraphs', 'HTML Styles', 'HTML Formatting', 'HTML Quotations',
        'HTML Comments', 'HTML Colors', 'HTML CSS', 'HTML Links', 'HTML Images', 'HTML Favicon',
        'HTML Page Title', 'HTML Tables', 'HTML Lists', 'HTML Block & Inline', 'HTML Div', 'HTML Classes'
    ],
    CSS: [
        'CSS HOME', 'CSS Introduction', 'CSS Syntax', 'CSS Selectors', 'CSS How To', 'CSS Comments',
        'CSS Colors', 'CSS Backgrounds', 'CSS Borders', 'CSS Margins', 'CSS Padding', 'CSS Height/Width',
        'CSS Box Model', 'CSS Outline', 'CSS Text', 'CSS Fonts', 'CSS Icons'
    ],
    JAVASCRIPT: [
        'JS HOME', 'JS Introduction', 'JS Where To', 'JS Output', 'JS Statements', 'JS Syntax',
        'JS Comments', 'JS Variables', 'JS Let', 'JS Const', 'JS Operators', 'JS Arithmetic',
        'JS Assignment', 'JS Data Types', 'JS Functions', 'JS Objects', 'JS Events'
    ],
    // Fallback for others
    DEFAULT: ['Introduction', 'Getting Started', 'Syntax', 'Variables', 'Comments', 'Data Types']
};

const TUTORIAL_CONTENT: Record<string, any> = {
    'HTML HOME': {
        title: 'HTML Tutorial',
        description: 'HTML is the standard markup language for Web pages. With HTML you can create your own Website. HTML is easy to learn - You will enjoy it!',
        code: `<!DOCTYPE html>
<html>
<head>
<title>Page Title</title>
</head>
<body>

<h1>This is a Heading</h1>
<p>This is a paragraph.</p>

</body>
</html>`,
        language: 'html'
    },
    'HTML Introduction': {
        title: 'HTML Introduction',
        description: 'HTML stands for Hyper Text Markup Language. HTML is the standard markup language for creating Web pages. HTML describes the structure of a Web page. HTML consists of a series of elements. HTML elements tell the browser how to display the content.',
        code: `<h1>My First Heading</h1>
<p>My first paragraph.</p>`,
        language: 'html'
    },
    // Add more content as needed, fallback generic content otherwise
};

const TutorialsPage: React.FC = () => {
    const [selectedLanguage, setSelectedLanguage] = useState('HTML');
    const [selectedTopic, setSelectedTopic] = useState('HTML HOME');

    const topics = TOPICS[selectedLanguage] || TOPICS.DEFAULT;
    const currentContent = TUTORIAL_CONTENT[selectedTopic] || {
        title: selectedTopic,
        description: `Learn everything about ${selectedTopic} in ${selectedLanguage}. This tutorial covers the fundamentals and advanced concepts.`,
        code: `// Example code for ${selectedTopic}\nconsole.log("Hello ${selectedLanguage}!");`,
        language: selectedLanguage.toLowerCase()
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900">
            {/* Top Language Bar */}
            <div className="flex overflow-x-auto bg-slate-800 text-white scrollbar-hide">
                {LANGUAGES.map(lang => (
                    <button
                        key={lang}
                        onClick={() => {
                            setSelectedLanguage(lang);
                            setSelectedTopic(TOPICS[lang]?.[0] || TOPICS.DEFAULT[0]);
                        }}
                        className={`px-4 py-3 text-sm font-medium hover:bg-slate-700 transition-colors whitespace-nowrap ${selectedLanguage === lang ? 'bg-green-600 hover:bg-green-600' : ''
                            }`}
                    >
                        {lang}
                    </button>
                ))}
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar Topics */}
                <div className="w-64 bg-slate-50 dark:bg-slate-800 overflow-y-auto border-r border-slate-200 dark:border-slate-700 flex-shrink-0 hidden md:block">
                    <h2 className="px-4 py-4 text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">
                        {selectedLanguage} Tutorial
                    </h2>
                    <div className="py-2">
                        {topics.map(topic => (
                            <button
                                key={topic}
                                onClick={() => setSelectedTopic(topic)}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${selectedTopic === topic
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold border-l-4 border-green-600'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {topic}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
                            {currentContent.title}
                        </h1>

                        <div className="flex justify-between mb-8">
                            <Button variant="secondary" size="sm" onClick={() => {
                                const currentIndex = topics.indexOf(selectedTopic);
                                if (currentIndex > 0) setSelectedTopic(topics[currentIndex - 1]);
                            }}>
                                &larr; Previous
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => {
                                const currentIndex = topics.indexOf(selectedTopic);
                                if (currentIndex < topics.length - 1) setSelectedTopic(topics[currentIndex + 1]);
                            }}>
                                Next &rarr;
                            </Button>
                        </div>

                        <div className="prose dark:prose-invert max-w-none mb-8">
                            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                                {currentContent.description}
                            </p>
                        </div>

                        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg border-l-4 border-green-500 mb-8 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Example</h3>
                            <div className="bg-white dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-700 font-mono text-sm overflow-x-auto mb-4 text-slate-800 dark:text-slate-200">
                                <pre>{currentContent.code}</pre>
                            </div>
                            <Link to="/code-editor">
                                <Button className="bg-green-600 hover:bg-green-700 text-white">
                                    Try it Yourself &raquo;
                                </Button>
                            </Link>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{selectedLanguage} Exercises</h2>
                            <Card className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                <p className="mb-4">Test your {selectedLanguage} skills with a quiz.</p>
                                <Link to="/exams">
                                    <Button variant="primary">Start {selectedLanguage} Quiz</Button>
                                </Link>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorialsPage;
