import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CodeEditor from './CodeEditor';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { setChatOpen, setChatContext } from '../../store/slices/aiSlice';
import { AppDispatch, RootState } from '../../store/store';
import Modal from '../shared/Modal';
import { aiAPI } from '../../services/api';
import playgroundAPI from '../../services/playgroundApi';
import { toast } from 'react-toastify';

// Local interface definition to match usage in LearningPage.tsx
interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  transcript: string;
  keyPoints: string[];
  codeExample: string;
  language: string;
  resources: Array<{ title: string; url: string; type: string }>;
}

interface Course {
  id: string;
  title: string;
  totalLessons: number;
  currentLesson: number;
  progress: number;
  lessons: Lesson[];
}

interface CourseLessonViewProps {
  course: Course;
  onBack: () => void;
  onNextLesson: () => void;
  onPreviousLesson: () => void;
}

const CourseLessonView: React.FC<CourseLessonViewProps> = ({
  course,
  onBack,
  onNextLesson,
  onPreviousLesson,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isChatOpen } = useSelector((state: RootState) => state.ai);

  // Get current lesson
  const currentLesson = course.lessons?.[course.currentLesson - 1] || course.lessons?.[0];

  const [code, setCode] = useState(currentLesson?.codeExample || '// No code example available');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false); // New state for editor visibility

  // Quiz State
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);

  // Update code when lesson changes
  useEffect(() => {
    if (currentLesson?.codeExample) {
      setCode(currentLesson.codeExample);
      setOutput('');
    }
  }, [currentLesson]);

  // Sync code context with AI Tutor whenever it changes
  useEffect(() => {
    dispatch(setChatContext({
      code,
      language: currentLesson?.language || 'python'
    }));
  }, [code, currentLesson, dispatch]);

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    // Check for unsupported libraries
    const unsupportedLibraries = ['torch', 'tensorflow', 'keras', 'numpy', 'pandas', 'sklearn', 'scipy'];
    const codeLines = code.toLowerCase();
    const foundUnsupported = unsupportedLibraries.find(lib =>
      codeLines.includes(`import ${lib}`) || codeLines.includes(`from ${lib}`)
    );

    if (foundUnsupported) {
      setOutput(`>>> Warning: External Library Detected\n\nThe code contains '${foundUnsupported}' which is not available in the online compiler.\n\nThe online compiler supports:\n✓ Standard library modules only\n✓ Built-in Python functions\n✓ Basic JavaScript/Node.js\n✓ Standard C/C++ libraries\n\nFor machine learning code, please use a local environment or Google Colab.\n\nTry running anyway? The code will execute but may fail if the library is required.`);
      toast.warning(`Library '${foundUnsupported}' not available in online compiler`);
    }

    setLoading(true);
    setOutput('>>> Executing code...\n');

    try {
      console.log('Executing code:', {
        code: code.substring(0, 100) + '...',
        language: currentLesson?.language || 'python'
      });

      const result = await playgroundAPI.executeCode({
        code,
        language: currentLesson?.language || 'python',
        input: ''
      });

      console.log('Execution result:', result);

      if (result.success) {
        setOutput(`>>> Execution successful (${result.executionTime})\n\n${result.output || '(no output)'}`);
        toast.success('Code executed successfully!');
      } else {
        const errorMsg = result.error || 'Unknown error';
        let helpfulMessage = errorMsg;

        // Provide helpful messages for common errors
        if (errorMsg.includes('ModuleNotFoundError') || errorMsg.includes('No module named')) {
          const moduleName = errorMsg.match(/No module named '([^']+)'/)?.[1] || 'unknown';
          helpfulMessage = `>>> Module Not Found\n\nThe module '${moduleName}' is not available in the online compiler.\n\nOnline compiler limitations:\n- Only standard library modules are available\n- No external packages (pip install won't work)\n- No machine learning libraries (torch, tensorflow, etc.)\n\nOriginal error:\n${errorMsg}`;
        }

        setOutput(`>>> Execution failed\n\n${helpfulMessage}`);
        toast.error('Code execution failed - check console output');
        console.error('Execution failed:', result);
      }
    } catch (error: any) {
      console.error('Execution error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to execute code';
      setOutput(`>>> Error\n\n${errorMsg}\n\nPlease check:\n- Backend server is running on port 5000\n- Code syntax is correct\n- Only standard libraries are used (no pip packages)`);
      toast.error('Execution error: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setIsGeneratingQuiz(true);
    setIsQuizOpen(true);
    setQuizQuestions([]);
    setUserAnswers({});
    setQuizScore(null);
    setShowQuizResult(false);

    try {
      const prompt = `Create a short multiple-choice quiz (3 questions) based on this lesson content.
      
      Lesson Title: ${currentLesson?.title}
      Description: ${currentLesson?.description}
      Key Points: ${currentLesson?.keyPoints?.join(', ')}

      Return ONLY a JSON array with this structure:
      [
        {
          "question": "Question text",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctIndex": 0 // 0-based index of correct option
        }
      ]
      Do not include any other text or markdown formatting. just raw json.
      `;

      const response = await aiAPI.chatWithAI({
        message: prompt,
        code: '',
        language: 'plaintext'
      });

      const responseText = response.data.response;
      // Clean up markdown code blocks if present
      const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

      try {
        const questions = JSON.parse(jsonString);
        if (Array.isArray(questions)) {
          setQuizQuestions(questions);
        } else {
          throw new Error('Invalid quiz format');
        }
      } catch (e) {
        console.error('Failed to parse quiz JSON', e);
        toast.error('AI failed to generate a valid quiz. Please try again.');
        setIsQuizOpen(false);
      }

    } catch (error) {
      console.error('Quiz generation error:', error);
      toast.error('Failed to generate quiz');
      setIsQuizOpen(false);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    quizQuestions.forEach((q, index) => {
      if (userAnswers[index] === q.correctIndex) {
        score++;
      }
    });
    setQuizScore(score);
    setShowQuizResult(true);
    if (score === quizQuestions.length) {
      toast.success('Perfect score! 🎉');
    } else {
      toast.info(`You scored ${score} out of ${quizQuestions.length}`);
    }
  };

  const handleCloseQuiz = () => {
    setIsQuizOpen(false);
    setQuizQuestions([]);
    setUserAnswers({});
    setQuizScore(null);
    setShowQuizResult(false);
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden animate-fade-in font-sans p-6">
      {/* Navigation Header */}
      <header className="px-6 py-4 bg-white dark:bg-slate-900 border-x border-t border-slate-200 dark:border-slate-800 rounded-t-2xl flex items-center justify-between shadow-sm relative z-10">
        <div className="flex items-center space-x-3 text-sm">
          <button
            onClick={onBack}
            className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
          >
            ← Back to Learning Path
          </button>
          <span className="text-slate-300">|</span>
          <span className="text-slate-900 dark:text-white font-bold">{course.title}</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-500">Lesson {course.currentLesson}: {currentLesson?.title}</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">🌐 Online Compiler Active</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        {/* Video-First Layout */}
        <div className={`h-full transition-all duration-300 ${showCodeEditor ? 'w-1/2' : 'w-full'} float-left overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900`}>
          {/* Video Player */}
          <div className="p-6">
            <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative shadow-2xl group">
              {currentLesson?.videoUrl ? (
                <iframe
                  src={(() => {
                    const url = currentLesson.videoUrl;
                    if (url.includes('youtube.com/embed/')) return url;
                    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
                    if (url.includes('watch?v=')) return url.replace('watch?v=', 'embed/');
                    return url;
                  })()}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={currentLesson.title}
                />
              ) : (
                <>
                  <img
                    src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200"
                    className="w-full h-full object-cover opacity-60"
                    alt="Lesson Video"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <p className="text-sm">Video coming soon</p>
                    </div>
                  </div>
                </>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between text-white text-xs font-bold uppercase tracking-wider">
                  <span>{currentLesson?.title}</span>
                  <span>{currentLesson?.duration}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 pb-10 space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{currentLesson?.title}</h1>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full">
                  {currentLesson?.language?.toUpperCase()}
                </span>
                <span className="text-slate-400 text-xs font-medium">Duration: {currentLesson?.duration}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[15px]">
                {currentLesson?.description}
              </p>
            </div>

            <div className="flex space-x-3">
              <Button variant={showTranscript ? "primary" : "secondary"} size="sm" onClick={() => setShowTranscript(!showTranscript)}>
                {showTranscript ? "Hide Transcript" : "Show Transcript"}
              </Button>
              <Button variant={showResources ? "primary" : "secondary"} size="sm" onClick={() => setShowResources(!showResources)}>
                {showResources ? "Hide Resources" : "Resources"}
              </Button>
              <Button variant={isChatOpen ? "primary" : "secondary"} size="sm" onClick={() => dispatch(setChatOpen(!isChatOpen))}>
                {isChatOpen ? "Close AI Tutor" : "Ask AI Tutor"}
              </Button>
              <Button variant="secondary" size="sm" onClick={handleGenerateQuiz} className="border border-indigo-500 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                ⚡ Take AI Quiz
              </Button>
            </div>

            {/* Transcript */}
            {showTranscript && currentLesson?.transcript && (
              <Card padding="sm" className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Transcript
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {currentLesson.transcript}
                </p>
              </Card>
            )}

            {/* Key Points */}
            {currentLesson?.keyPoints && currentLesson.keyPoints.length > 0 && (
              <Card padding="sm" className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
                <div className="flex items-start space-x-4">
                  <div className="mt-1 p-2 bg-indigo-600 text-white rounded-lg shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">Key Concepts</h4>
                    <ul className="space-y-2">
                      {currentLesson.keyPoints.map((point, index) => (
                        <li key={index} className="text-sm text-slate-600 dark:text-slate-400 flex items-start">
                          <span className="text-indigo-600 dark:text-indigo-400 mr-2">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            )}

            {/* Resources */}
            {showResources && currentLesson?.resources && currentLesson.resources.length > 0 && (
              <Card padding="sm" className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Additional Resources
                </h4>
                <div className="space-y-2">
                  {currentLesson.resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-white dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded">
                            {resource.type}
                          </span>
                          <span className="text-sm font-medium text-slate-900 dark:text-white">{resource.title}</span>
                        </div>
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Split-Screen Code Editor (when toggled) */}
        {showCodeEditor && (
          <div className="w-1/2 h-full float-right flex flex-col bg-slate-950 relative border-l border-slate-700 shadow-2xl animate-slide-up">
            {/* Code Editor Header */}
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex items-center px-4 py-1.5 bg-slate-800 border-t-2 border-indigo-500 text-xs font-bold text-white rounded-t shadow-sm">
                  <svg className="w-4 h-4 mr-2 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 19.77L3.6 22L12 18L20.4 22L22 19.77L12 2Z" />
                  </svg>
                  main.{currentLesson?.language === 'python' ? 'py' : currentLesson?.language === 'javascript' ? 'js' : 'txt'}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="primary" size="sm" onClick={handleRunCode} loading={loading} className="!py-1.5 shadow-sm">
                  <svg className="w-4 h-4 mr-1.5 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Run Code
                </Button>
                <button
                  onClick={() => setShowCodeEditor(false)}
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                  title="Close Code Editor"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Editor Container */}
            <div className="flex-1 overflow-hidden">
              <CodeEditor
                value={code}
                onChange={(value) => setCode(value || '')}
                language={currentLesson?.language || 'python'}
                height="100%"
                className="!border-none !rounded-none"
              />
            </div>

            {/* Console Area */}
            <div className="h-64 flex flex-col bg-slate-900 border-t border-slate-800 font-mono">
              <div className="px-4 py-2 bg-slate-800/50 flex items-center justify-between border-b border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                  <svg className="w-3 h-3 mr-2 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  Console Output
                </span>
                <button onClick={() => setOutput('')} className="text-slate-500 hover:text-slate-300 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 p-6 text-[13px] text-indigo-300/80 overflow-y-auto custom-scrollbar leading-relaxed whitespace-pre-wrap">
                {output || ">>> System Ready. Click 'Run Code' to execute your program."}
              </div>
            </div>
          </div>
        )}

        {/* Floating Code Editor Toggle Button */}
        {!showCodeEditor && (
          <button
            onClick={() => {
              console.log('Practice Code button clicked');
              // Use requestAnimationFrame to avoid ResizeObserver errors
              requestAnimationFrame(() => {
                setShowCodeEditor(true);
              });
            }}
            className="fixed bottom-8 right-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-4 rounded-2xl shadow-2xl transition-all hover:scale-110 active:scale-95 z-[100] flex items-center gap-3 font-bold text-lg group"
            title="Open Code Editor"
          >
            <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Practice Code
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
            </span>
          </button>
        )}
      </main>

      {/* Progress Footer */}
      <footer className="px-8 py-4 bg-white dark:bg-slate-900 border border-t-0 border-slate-200 dark:border-slate-800 flex items-center justify-between rounded-b-2xl shadow-sm relative z-10">
        <Button variant="secondary" onClick={onPreviousLesson} disabled={course.currentLesson === 1} size="sm">
          ← Previous: {course.lessons?.[course.currentLesson - 2]?.title || 'Previous Lesson'}
        </Button>

        <div className="flex-1 max-w-xl mx-12 flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Course Progress</span>
            <span className="text-indigo-600 dark:text-indigo-400">{course.progress}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-1000 ease-out"
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
        </div>

        <Button onClick={onNextLesson} disabled={course.currentLesson === course.totalLessons} size="sm">
          Next Lesson: {course.lessons?.[course.currentLesson]?.title || 'Complete'} →
        </Button>
      </footer>

      {/* Quiz Modal */}
      <Modal
        isOpen={isQuizOpen}
        onClose={() => !showQuizResult && setIsQuizOpen(false)}
        title="AI Generated Quiz"
        size="lg"
      >
        <div className="p-4">
          {isGeneratingQuiz ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Generating questions from lesson content...</p>
              <p className="text-sm text-slate-500 mt-2">Our AI is analyzing the transcript and key points.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {!showQuizResult ? (
                <>
                  <div className="space-y-6">
                    {quizQuestions.map((q, qIndex) => (
                      <div key={qIndex} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                        <h3 className="font-semibold text-lg mb-4 text-slate-900 dark:text-white">
                          {qIndex + 1}. {q.question}
                        </h3>
                        <div className="space-y-3">
                          {q.options.map((option: string, oIndex: number) => (
                            <button
                              key={oIndex}
                              onClick={() => handleAnswerSelect(qIndex, oIndex)}
                              className={`w-full text-left p-4 rounded-lg transition-all border ${userAnswers[qIndex] === oIndex
                                ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 ring-1 ring-indigo-500'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                                }`}
                            >
                              <div className="flex items-center">
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${userAnswers[qIndex] === oIndex
                                  ? 'border-indigo-600 bg-indigo-600 text-white'
                                  : 'border-slate-400'
                                  }`}>
                                  {userAnswers[qIndex] === oIndex && (
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                <span className={userAnswers[qIndex] === oIndex ? 'text-indigo-900 dark:text-indigo-100 font-medium' : 'text-slate-700 dark:text-slate-300'}>
                                  {option}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(userAnswers).length < quizQuestions.length}
                      variant="primary"
                      size="lg"
                    >
                      Submit Answers
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 animate-fade-in">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-6">
                    <span className="text-4xl">
                      {quizScore === quizQuestions.length ? '🏆' : quizScore && quizScore > quizQuestions.length / 2 ? '👏' : '📚'}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Quiz Complete!
                  </h2>
                  <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
                    You scored <span className="font-bold text-indigo-600 dark:text-indigo-400">{quizScore}</span> out of {quizQuestions.length}
                  </p>

                  {/* Review Answers */}
                  <div className="text-left max-w-2xl mx-auto space-y-4 mb-8">
                    {quizQuestions.map((q, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${userAnswers[index] === q.correctIndex
                        ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                        }`}>
                        <p className="font-medium mb-2">{q.question}</p>
                        <p className="text-sm">
                          Your answer: <span className={userAnswers[index] === q.correctIndex ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                            {q.options[userAnswers[index]]}
                          </span>
                        </p>
                        {userAnswers[index] !== q.correctIndex && (
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                            Correct answer: <span className="font-bold">{q.options[q.correctIndex]}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center space-x-4">
                    <Button variant="secondary" onClick={handleCloseQuiz}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={handleGenerateQuiz}>
                      Try Another Quiz
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CourseLessonView;
