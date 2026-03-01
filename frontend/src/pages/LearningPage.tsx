import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { fetchLearningModules, startModule, fetchLearningPath, completeLesson } from '../store/slices/learningSlice';
import { AppDispatch } from '../store/store';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import ProgressBar from '../components/shared/ProgressBar';
import Input from '../components/shared/Input';
import CourseLessonView from '../components/features/CourseLessonView';
import { toast } from 'react-toastify';
import { bookmarksAPI } from '../services/api';

// Web Development Course Data - Stable reference outside component
const webDevCourseData = {
  id: 'web-dev-mastery',
  title: 'Web Development Mastery',
  description: 'Master the building blocks of the web. Learn HTML5, CSS3, JavaScript, and modern frameworks like React.',
  track: 'Web Development Track',
  progress: 0,
  totalLessons: 6,
  currentLesson: 1,
  lessons: [
    {
      id: 'html-fundamentals',
      title: 'HTML5 Foundations',
      description: 'Learn the structural foundation of the web. Semantic HTML, forms, and accessibility.',
      videoUrl: 'https://www.youtube.com/embed/ok-plXXHlWw',
      duration: '15:45',
      transcript: 'HTML is the skeleton of every website. Today we learn about tags, structure, and semantic elements.',
      keyPoints: ['Semantic Tags', 'Document Structure', 'Forms & Input'],
      codeExample: `<!DOCTYPE html>\n<html>\n  <head>\n    <title>My Page</title>\n  </head>\n  <body>\n    <h1>Hello World</h1>\n    <p>Welcome to web development!</p>\n  </body>\n</html>`,
      language: 'html',
      resources: [{ title: 'MDN HTML Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML', type: 'documentation' }]
    },
    {
      id: 'css-mastery',
      title: 'CSS3 Styling',
      description: 'Master Flexbox, Grid, and responsive design to style beautiful web interfaces.',
      videoUrl: 'https://www.youtube.com/embed/yfoY53qxEnI',
      duration: '20:30',
      transcript: 'CSS brings style to the web. We will explore selectors, the box model, and modern layouts.',
      keyPoints: ['Flexbox & Grid', 'Responsive Design', 'Animations'],
      codeExample: `body {\n  font-family: sans-serif;\n  background: #f0f0f0;\n}\n.container {\n  display: flex;\n  justify-content: center;\n  padding: 20px;\n}`,
      language: 'css',
      resources: [{ title: 'CSS-Tricks Guide', url: 'https://css-tricks.com/', type: 'tutorial' }]
    },
    {
      id: 'javascript-fundamentals',
      title: 'JavaScript Fundamentals',
      description: 'Learn JavaScript ES6+ features, DOM manipulation, and asynchronous programming.',
      videoUrl: 'https://www.youtube.com/embed/W6NZfCO5SIk',
      duration: '18:20',
      transcript: 'JavaScript is the logic of the web. In this lesson, we cover variables, functions, and the DOM.',
      keyPoints: ['ES6 Syntax', 'DOM Manipulation', 'Async/Await'],
      codeExample: `const greet = (name) => {\n  console.log("Hello, " + name);\n};\ngreet("Developer");`,
      language: 'javascript',
      resources: [{ title: 'MDN JS Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', type: 'documentation' }]
    },
    {
      id: 'python-essentials',
      title: 'Python Essentials',
      description: 'Start your journey with Python. Learn syntax, data types, and basic automation.',
      videoUrl: 'https://www.youtube.com/embed/rfscVS0vtbw',
      duration: '22:15',
      transcript: 'Python is powerful. Let\'s explore the basics of syntax and structure.',
      keyPoints: ['Indentation', 'Loops', 'Functions'],
      codeExample: `def hello_world():\n    print("Hello from Python!")\n\nhello_world()`,
      language: 'python',
      resources: [{ title: 'Python.org', url: 'https://docs.python.org/3/', type: 'documentation' }]
    },
    {
      id: 'react-basics',
      title: 'React.js Components',
      description: 'Build modern user interfaces with React components, hooks, and state management.',
      videoUrl: 'https://www.youtube.com/embed/bMknfKXIFA8',
      duration: '25:40',
      transcript: 'React is for UIs. Today we learn about components and useState.',
      keyPoints: ['Hooks', 'Props', 'JSX'],
      codeExample: `import React, { useState } from 'react';\n\nfunction App() {\n  return <h1>Hello React</h1>;\n}`,
      language: 'javascript',
      resources: [{ title: 'React.dev', url: 'https://react.dev/', type: 'documentation' }]
    },
    {
      id: 'node-backend',
      title: 'Node.js Backend',
      description: 'Build scalable server-side applications with Node.js and Express.',
      videoUrl: 'https://www.youtube.com/embed/fBNz5xF-Kx4',
      duration: '19:10',
      transcript: 'Server-side JS. We will set up an Express server and handle API requests.',
      keyPoints: ['Express', 'Middleware', 'REST APIs'],
      codeExample: `const express = require('express');\nconst app = express();\n\napp.get('/', (req, res) => res.send('API running!'));`,
      language: 'javascript',
      resources: [{ title: 'Node.js Docs', url: 'https://nodejs.org/en/docs/', type: 'documentation' }]
    }
  ]
};

const LearningPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { modules, learningPath, loading } = useSelector((state: RootState) => state.learning);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [showAssessment, setShowAssessment] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState(1);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());



  useEffect(() => {
    dispatch(fetchLearningModules());
    dispatch(fetchLearningPath());
  }, [dispatch]);

  useEffect(() => {
    bookmarksAPI.list().then((r) => {
      const ids = new Set<string>((r.data.bookmarks || []).map((b: { module_id: string }) => b.module_id));
      setBookmarkedIds(ids);
    }).catch(() => { });
  }, []);

  const buildCourseFromModule = (module: any) => {
    const content = typeof module.content === 'object' ? module.content : (module.content ? JSON.parse(module.content) : {});
    const lessons = (content.lessons || []).map((l: any, i: number) => ({
      id: l.id || `lesson-${i + 1}`,
      title: l.title || `Lesson ${i + 1}`,
      duration: l.duration || 0,
      type: l.type || 'video',
      description: l.description || '',
      transcript: l.transcript || '',
      keyPoints: l.keyPoints || [],
      codeExample: l.codeExample || '',
      language: l.language || 'javascript',
      resources: l.resources || [],
    }));
    return {
      id: module.id,
      title: module.title,
      description: module.description,
      track: content.track || 'Learning',
      progress: 0,
      totalLessons: lessons.length || 1,
      currentLesson: 1,
      lessons,
    };
  };

  const handleStartModule = async (moduleOrId: any) => {
    const moduleId = typeof moduleOrId === 'string' ? moduleOrId : moduleOrId?.id;
    const module = typeof moduleOrId === 'object' ? moduleOrId : modules.find((m: any) => m.id === moduleId);
    if (!module) return;
    try {
      await dispatch(startModule(moduleId)).unwrap();
      const course = buildCourseFromModule(module);
      setSelectedCourse(course);
      setCurrentLesson(1);
      toast.success('Module started! Good luck with your learning journey.');
    } catch (error) {
      toast.error('Failed to start module');
    }
  };

  const handleStartCourse = (courseId: string) => {
    let lessonIndex = 1;
    if (courseId === 'web-dev-mastery' || courseId === 'html-demo') lessonIndex = 1;
    else if (courseId === 'css-demo') lessonIndex = 2;
    else if (courseId === 'js-demo') lessonIndex = 3;
    else if (courseId === 'python-demo') lessonIndex = 4;
    else if (courseId === 'react-demo') lessonIndex = 5;
    else if (courseId === 'node-demo') lessonIndex = 6;
    else {
      const module = modules.find((m: any) => m.id === courseId);
      if (module) handleStartModule(module);
      return;
    }

    setSelectedCourse({ ...webDevCourseData, currentLesson: lessonIndex });
    setCurrentLesson(lessonIndex);
  };

  const handleNextLesson = async () => {
    if (!selectedCourse) return;
    const lessonId = selectedCourse.lessons?.[currentLesson - 1]?.id || `lesson-${currentLesson}`;
    try {
      await dispatch(completeLesson({ moduleId: selectedCourse.id, lessonId })).unwrap();
    } catch (_) { }
    if (currentLesson < selectedCourse.totalLessons) {
      const next = currentLesson + 1;
      setCurrentLesson(next);
      setSelectedCourse({
        ...selectedCourse,
        currentLesson: next,
        progress: Math.min(100, Math.round((next / selectedCourse.totalLessons) * 100))
      });
    }
  };

  const handlePreviousLesson = () => {
    if (selectedCourse && currentLesson > 1) {
      setCurrentLesson(currentLesson - 1);
      setSelectedCourse({
        ...selectedCourse,
        currentLesson: currentLesson - 1,
        progress: Math.round(((currentLesson - 1) / selectedCourse.totalLessons) * 100)
      });
    }
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setCurrentLesson(1);
  };

  const handleBookmark = async (moduleId: string) => {
    const isBookmarked = bookmarkedIds.has(moduleId);
    try {
      if (isBookmarked) {
        await bookmarksAPI.remove(moduleId);
        setBookmarkedIds((prev) => { const s = new Set(prev); s.delete(moduleId); return s; });
        toast.success('Removed from bookmarks');
      } else {
        await bookmarksAPI.add(moduleId);
        setBookmarkedIds((prev) => new Set(prev).add(moduleId));
        toast.success('Saved for later');
      }
    } catch (_) {
      toast.error('Failed to update bookmark');
    }
  };

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = !selectedDifficulty || module.difficulty.toString() === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyLabel = (difficulty: number) => {
    const labels = ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'];
    return labels[difficulty] || 'Unknown';
  };

  const getDifficultyColor = (difficulty: number) => {
    const colors = ['', 'text-green-600', 'text-blue-600', 'text-yellow-600', 'text-red-600', 'text-purple-600'];
    return colors[difficulty] || 'text-slate-600';
  };

  // Show course lesson view if a course is selected
  if (selectedCourse) {
    return (
      <CourseLessonView
        course={selectedCourse}
        onBack={handleBackToCourses}
        onNextLesson={handleNextLesson}
        onPreviousLesson={handlePreviousLesson}
      />
    );
  }

  if (showAssessment) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Skill Assessment
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Let's assess your current skills to create a personalized learning path
            </p>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Answer a few questions to get personalized module recommendations.
              </p>
              <Link to="/learn/assessment">
                <Button className="mr-2">Take assessment</Button>
              </Link>
              <Button variant="secondary" onClick={() => setShowAssessment(false)}>
                Browse Modules
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Learning Path
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Discover and master new skills with AI-powered learning modules
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => setShowAssessment(true)} variant="secondary">
            Take Skill Assessment
          </Button>
        </div>
      </div>

      {/* Featured Course - Web Development */}
      <Card className="bg-gradient-to-r from-indigo-600 to-emerald-600 text-white mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="bg-white/20 text-xs px-2 py-1 rounded-full">FEATURED COURSE</span>
              <span className="bg-green-500/20 text-xs px-2 py-1 rounded-full">🌐 WEB DEV</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Web Development (HTML, CSS, JS)</h2>
            <p className="text-indigo-100 mb-4">
              Master the building blocks of the web. Learn HTML5 for structure, CSS3 for styling,
              and JavaScript for interactivity. Start from scratch and build real-world websites.
            </p>
            <div className="flex items-center space-x-6 text-sm mb-4">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>35 hours</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>6 lessons</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Full Access</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => handleStartCourse('web-dev-mastery')}
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold shadow-lg border-0"
              >
                Start Learning
              </Button>
              <div className="flex items-center space-x-2">
                <span className="text-sm">Progress: 0%</span>
                <div className="w-24 bg-white/20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden lg:block ml-8">
            <div className="w-32 h-32 bg-white/10 rounded-lg flex items-center justify-center">
              <svg className="w-16 h-16 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
        </div>
      </Card>

      {/* Learning Path Overview */}
      {learningPath && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Your Progress
            </h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {learningPath.completed_modules}/{learningPath.total_modules} modules completed
            </span>
          </div>
          <ProgressBar
            progress={learningPath.completion_percentage}
            showLabel
            label="Overall Progress"
            size="lg"
          />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {learningPath.completed_modules}
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-300">Completed</div>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {learningPath.current_module ? 1 : 0}
              </div>
              <div className="text-sm text-yellow-800 dark:text-yellow-300">In Progress</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                {learningPath.total_modules - learningPath.completed_modules}
              </div>
              <div className="text-sm text-slate-800 dark:text-slate-300">Remaining</div>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
          <div className="md:w-48">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="">All Difficulties</option>
              <option value="1">Beginner</option>
              <option value="2">Intermediate</option>
              <option value="3">Advanced</option>
              <option value="4">Expert</option>
              <option value="5">Master</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </Card>
          ))
        ) : filteredModules.length === 0 ? (
          // Demo courses when no modules found
          <>
            <div className="col-span-full text-center py-8">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                🚀 Demo Courses Available
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Explore our sample courses to get started with your learning journey
              </p>
            </div>

            {/* HTML Demo */}
            <Card hover onClick={() => handleStartCourse('html-demo')}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  📄 HTML5 Foundations
                </h3>
                <span className="text-xs font-medium px-2 py-1 rounded-full text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300">
                  Beginner
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                Learn to build the structure of modern websites using semantic HTML5.
              </p>
              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>5h</span>
                <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>0%</span>
              </div>
              <Button className="w-full">Start Course</Button>
            </Card>

            {/* CSS Demo */}
            <Card hover onClick={() => handleStartCourse('css-demo')}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  🎨 CSS3 Mastery
                </h3>
                <span className="text-xs font-medium px-2 py-1 rounded-full text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300">
                  Beginner
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                Master styling, layouts with Grid/Flexbox, and responsive design.
              </p>
              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>8h</span>
                <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>0%</span>
              </div>
              <Button className="w-full">Start Course</Button>
            </Card>

            {/* JS Demo */}
            <Card hover onClick={() => handleStartCourse('js-demo')}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  📜 JavaScript Fundamentals
                </h3>
                <span className="text-xs font-medium px-2 py-1 rounded-full text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300">
                  Beginner
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                Core logic, ES6 features, and DOM manipulation for the web.
              </p>
              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>12h</span>
                <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>0%</span>
              </div>
              <Button className="w-full">Start Course</Button>
            </Card>

            {/* Python Demo */}
            <Card hover onClick={() => handleStartCourse('python-demo')}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  🐍 Python Essentials
                </h3>
                <span className="text-xs font-medium px-2 py-1 rounded-full text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                  Beginner
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                Learn Python syntax, data structures, and automation basics.
              </p>
              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>10h</span>
                <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>0%</span>
              </div>
              <Button className="w-full">Start Course</Button>
            </Card>

            {/* React Demo */}
            <Card hover onClick={() => handleStartCourse('react-demo')}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  ⚛️ React.js Libraries
                </h3>
                <span className="text-xs font-medium px-2 py-1 rounded-full text-cyan-600 bg-cyan-100 dark:bg-cyan-900 dark:text-cyan-300">
                  Beginner
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                Build reactive interfaces using components and state hooks.
              </p>
              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>15h</span>
                <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>0%</span>
              </div>
              <Button className="w-full">Start Course</Button>
            </Card>

            {/* Node Demo */}
            <Card hover onClick={() => handleStartCourse('node-demo')}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  🟢 Node.js Backend
                </h3>
                <span className="text-xs font-medium px-2 py-1 rounded-full text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300">
                  Intermediate
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                Scale your applications using Node.js and Express servers.
              </p>
              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>12h</span>
                <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>0%</span>
              </div>
              <Button className="w-full">Start Course</Button>
            </Card>
          </>
        ) : (
          filteredModules.map((module) => (
            <Card key={module.id} hover>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {module.title}
                </h3>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(module.difficulty)} bg-current bg-opacity-10`}>
                  {getDifficultyLabel(module.difficulty)}
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3">
                {module.description}
              </p>

              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {module.estimated_hours}h
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {module.progress || 0}%
                </span>
              </div>

              {module.progress > 0 && (
                <div className="mb-4">
                  <ProgressBar progress={module.progress} size="sm" />
                </div>
              )}

              {module.prerequisites && Array.isArray(module.prerequisites) && module.prerequisites.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Prerequisites:</p>
                  <div className="flex flex-wrap gap-1">
                    {module.prerequisites.map((prereq: string, index: number) => (
                      <span key={index} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                        {prereq}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {module.completed ? (
                  <Button variant="secondary" className="flex-1" disabled>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Completed
                  </Button>
                ) : module.progress > 0 ? (
                  <Button
                    className="flex-1"
                    onClick={() => handleStartModule(module)}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    className="flex-1"
                    onClick={() => handleStartModule(module)}
                  >
                    Start Learning
                  </Button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleBookmark(module.id); }}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
                  title={bookmarkedIds.has(module.id) ? 'Remove from bookmarks' : 'Save for later'}
                >
                  {bookmarkedIds.has(module.id) ? (
                    <svg className="w-5 h-5 text-primary-500 fill-current" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                  )}
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default LearningPage;
