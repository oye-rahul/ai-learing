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

const LearningPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { modules, learningPath, loading } = useSelector((state: RootState) => state.learning);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [showAssessment, setShowAssessment] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState(1);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // AI/ML Course Data with Transformer Architecture
  const webDevCourse = {
    id: 'ai-ml-mastery',
    title: 'AI & Machine Learning Mastery',
    description: 'Complete AI/ML course covering neural networks, transformers, and modern deep learning architectures',
    track: 'AI Mastery Track',
    progress: 45,
    totalLessons: 12,
    currentLesson: currentLesson,
    lessons: [
      {
        id: 'transformer-architecture',
        title: 'Transformer Architecture',
        description: 'Deep dive into the Self-Attention mechanism, the core innovation behind the Transformer architecture. Learn how to implement scaled dot-product attention from scratch using Python and PyTorch.',
        videoUrl: 'https://youtu.be/KBXVGcUvFjk',
        duration: '12:45',
        transcript: 'Welcome to lesson 4 on Transformer Architecture. Today we\'ll explore the revolutionary self-attention mechanism that powers modern language models like GPT and BERT. The key insight is that attention allows models to weigh the importance of different parts of the input sequence when processing each element. This overcomes the bottleneck of fixed-length context windows in RNNs and enables parallel processing of sequences.',
        keyPoints: [
          'Attention allows the model to dynamically focus on relevant parts of the input sequence',
          'Self-attention mechanism enables parallel processing unlike RNNs',
          'Scaled dot-product attention is the core building block of transformers'
        ],
        codeExample: `# Simple Attention Mechanism (No External Libraries)
# This demonstrates the core concept without PyTorch

import math

def scaled_dot_product_attention(q, k, v):
    """
    Simplified attention mechanism using only Python built-ins
    q, k, v are lists of lists (matrices)
    """
    d_k = len(k[0])  # dimension of keys
    
    # Calculate attention scores: Q * K^T
    scores = []
    for i in range(len(q)):
        row = []
        for j in range(len(k)):
            # Dot product of q[i] and k[j]
            dot = sum(q[i][m] * k[j][m] for m in range(d_k))
            # Scale by sqrt(d_k)
            row.append(dot / math.sqrt(d_k))
        scores.append(row)
    
    # Apply softmax to get attention weights
    attention_weights = []
    for row in scores:
        # Softmax: exp(x) / sum(exp(x))
        exp_row = [math.exp(x) for x in row]
        sum_exp = sum(exp_row)
        attention_weights.append([x / sum_exp for x in exp_row])
    
    # Multiply attention weights with values
    output = []
    for i in range(len(attention_weights)):
        row = []
        for j in range(len(v[0])):
            weighted_sum = sum(attention_weights[i][k] * v[k][j] 
                             for k in range(len(v)))
            row.append(weighted_sum)
        output.append(row)
    
    return output, attention_weights

# Example usage with simple 2D matrices
q = [[1.0, 0.5], [0.5, 1.0]]  # Query
k = [[1.0, 0.0], [0.0, 1.0]]  # Key  
v = [[2.0, 1.0], [1.0, 2.0]]  # Value

output, weights = scaled_dot_product_attention(q, k, v)

print("Attention Output:")
for row in output:
    print([f"{x:.4f}" for x in row])

print("\\nAttention Weights:")
for row in weights:
    print([f"{x:.4f}" for x in row])`,
        language: 'python',
        resources: [
          { title: 'Attention Is All You Need (Original Paper)', url: 'https://arxiv.org/abs/1706.03762', type: 'documentation' },
          { title: 'PyTorch MultiheadAttention Documentation', url: 'https://pytorch.org/docs/stable/generated/torch.nn.MultiheadAttention.html', type: 'documentation' },
          { title: 'The Illustrated Transformer', url: 'https://jalammar.github.io/illustrated-transformer/', type: 'tutorial' }
        ]
      },
      {
        id: 'css-styling',
        title: 'CSS Styling & Layout',
        description: 'Master CSS for beautiful, responsive designs with Flexbox, Grid, and modern CSS features.',
        videoUrl: '/videos/css-styling.mp4',
        duration: '15:30',
        transcript: 'CSS, or Cascading Style Sheets, is what makes websites beautiful and responsive. In this lesson, we\'ll explore modern CSS techniques including Flexbox, Grid, and responsive design principles.',
        keyPoints: [
          'CSS Grid and Flexbox provide powerful layout capabilities',
          'Responsive design ensures your site works on all devices',
          'Modern CSS features like custom properties improve maintainability'
        ],
        codeExample: `/* Modern CSS with Grid and Flexbox */
:root {
    --primary-color: #3b82f6;
    --secondary-color: #1e40af;
    --text-color: #1f2937;
    --bg-color: #f9fafb;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    color: var(--text-color);
    background-color: var(--bg-color);
    line-height: 1.6;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Header with Flexbox */
header {
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 100;
}

nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
}

nav ul {
    display: flex;
    list-style: none;
    gap: 2rem;
}

nav a {
    text-decoration: none;
    color: var(--text-color);
    font-weight: 500;
    transition: color 0.3s ease;
}

nav a:hover {
    color: var(--primary-color);
}

/* Main content with Grid */
.hero {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
    min-height: 80vh;
    padding: 4rem 0;
}

.hero-content h1 {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.hero-content p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    color: #6b7280;
}

.btn {
    display: inline-block;
    padding: 1rem 2rem;
    background: var(--primary-color);
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
}

.btn:hover {
    background: var(--secondary-color);
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
}

/* Features Grid */
.features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    padding: 4rem 0;
}

.feature-card {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-5px);
}

/* Responsive Design */
@media (max-width: 768px) {
    .hero {
        grid-template-columns: 1fr;
        text-align: center;
    }
    
    .hero-content h1 {
        font-size: 2rem;
    }
    
    nav {
        flex-direction: column;
        gap: 1rem;
    }
    
    nav ul {
        gap: 1rem;
    }
}`,
        language: 'css',
        resources: [
          { title: 'CSS Grid Guide', url: 'https://css-tricks.com/snippets/css/complete-guide-grid/', type: 'tutorial' },
          { title: 'Flexbox Guide', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/', type: 'tutorial' },
          { title: 'Modern CSS Features', url: 'https://web.dev/learn/css/', type: 'documentation' }
        ]
      },
      {
        id: 'javascript-fundamentals',
        title: 'JavaScript Fundamentals',
        description: 'Learn JavaScript ES6+ features, DOM manipulation, and asynchronous programming.',
        videoUrl: '/videos/javascript-fundamentals.mp4',
        duration: '18:20',
        transcript: 'JavaScript is the programming language of the web. In this comprehensive lesson, we\'ll cover ES6+ features, DOM manipulation, event handling, and asynchronous programming with promises and async/await.',
        keyPoints: [
          'ES6+ features like arrow functions, destructuring, and modules modernize JavaScript',
          'DOM manipulation allows dynamic interaction with web pages',
          'Asynchronous programming handles time-consuming operations without blocking the UI'
        ],
        codeExample: `// Modern JavaScript ES6+ Features
console.log('🚀 Welcome to JavaScript Fundamentals!');

// 1. Variables and Constants
const APP_NAME = 'FlowState';
let currentUser = null;
var legacyVariable = 'avoid using var';

// 2. Arrow Functions
const greetUser = (name) => {
    return \`Hello, \${name}! Welcome to \${APP_NAME}\`;
};

// Shorter arrow function
const square = x => x * x;

// 3. Destructuring
const user = {
    name: 'Alice',
    age: 30,
    skills: ['JavaScript', 'React', 'Node.js']
};

const { name, age, skills } = user;
const [primarySkill, ...otherSkills] = skills;

console.log(\`\${name} is \${age} years old\`);
console.log(\`Primary skill: \${primarySkill}\`);

// 4. Template Literals
const userInfo = \`
    Name: \${name}
    Age: \${age}
    Skills: \${skills.join(', ')}
\`;

// 5. Array Methods
const numbers = [1, 2, 3, 4, 5];

const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((acc, n) => acc + n, 0);

console.log('Doubled:', doubled);
console.log('Evens:', evens);
console.log('Sum:', sum);

// 6. Classes
class Developer {
    constructor(name, language) {
        this.name = name;
        this.language = language;
        this.projects = [];
    }
    
    addProject(project) {
        this.projects.push(project);
        console.log(\`\${this.name} added project: \${project}\`);
    }
    
    getInfo() {
        return \`\${this.name} develops in \${this.language}\`;
    }
}

const developer = new Developer('Bob', 'JavaScript');
developer.addProject('FlowState Clone');

// 7. Promises and Async/Await
const fetchUserData = async (userId) => {
    try {
        console.log(\`Fetching data for user \${userId}...\`);
        
        // Simulate API call
        const response = await new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: userId,
                    name: 'John Doe',
                    email: 'john@example.com'
                });
            }, 1000);
        });
        
        console.log('User data received:', response);
        return response;
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
};

// 8. DOM Manipulation
const initializeApp = () => {
    // Create elements
    const container = document.createElement('div');
    container.className = 'app-container';
    
    const title = document.createElement('h1');
    title.textContent = 'FlowState JavaScript Demo';
    title.style.color = '#3b82f6';
    
    const button = document.createElement('button');
    button.textContent = 'Click me!';
    button.className = 'btn btn-primary';
    
    // Event handling
    button.addEventListener('click', async () => {
        button.textContent = 'Loading...';
        button.disabled = true;
        
        const userData = await fetchUserData(123);
        
        button.textContent = 'Data Loaded!';
        button.style.backgroundColor = '#10b981';
        
        // Show user data
        const userDisplay = document.createElement('div');
        userDisplay.innerHTML = \`
            <h3>User Information:</h3>
            <p>Name: \${userData.name}</p>
            <p>Email: \${userData.email}</p>
        \`;
        container.appendChild(userDisplay);
    });
    
    // Append to DOM
    container.appendChild(title);
    container.appendChild(button);
    
    // Add to page (if body exists)
    if (document.body) {
        document.body.appendChild(container);
    }
};

// 9. Module Pattern
const MathUtils = {
    add: (a, b) => a + b,
    multiply: (a, b) => a * b,
    factorial: (n) => n <= 1 ? 1 : n * MathUtils.factorial(n - 1)
};

// 10. Error Handling
const safeOperation = (operation) => {
    try {
        return operation();
    } catch (error) {
        console.error('Operation failed:', error.message);
        return null;
    }
};

// Execute demo
console.log(greetUser('Developer'));
console.log('Square of 5:', square(5));
console.log('Factorial of 5:', MathUtils.factorial(5));

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Fetch user data
fetchUserData(456);`,
        language: 'javascript',
        resources: [
          { title: 'MDN JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', type: 'documentation' },
          { title: 'ES6 Features', url: 'https://github.com/lukehoban/es6features', type: 'tutorial' },
          { title: 'JavaScript.info', url: 'https://javascript.info/', type: 'tutorial' }
        ]
      }
    ]
  };

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
    if (courseId === 'ai-ml-mastery') {
      setSelectedCourse(webDevCourse);
      setCurrentLesson(4);
    } else {
      const module = modules.find((m: any) => m.id === courseId);
      if (module) handleStartModule(module);
    }
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

      {/* Featured Course - AI & Machine Learning */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="bg-white/20 text-xs px-2 py-1 rounded-full">FEATURED COURSE</span>
              <span className="bg-green-500/20 text-xs px-2 py-1 rounded-full">🔥 POPULAR</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">AI & Machine Learning Mastery</h2>
            <p className="text-purple-100 mb-4">
              Complete AI/ML course covering neural networks, transformers, and modern deep learning architectures.
              Build real AI applications and master cutting-edge technologies.
            </p>
            <div className="flex items-center space-x-6 text-sm mb-4">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>28 hours</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>12 lessons</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Certificate included</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => handleStartCourse('ai-ml-mastery')}
                className="bg-white text-gray-700 hover:bg-purple-50 font-semibold"
              >
                Start Course
              </Button>
              <div className="flex items-center space-x-2">
                <span className="text-sm">Progress: 45%</span>
                <div className="w-24 bg-white/20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: '45%' }}></div>
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

            {/* Demo Course 1: AI & Machine Learning */}
            <Card hover onClick={() => handleStartCourse('ai-ml-demo')}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  🤖 AI & Machine Learning Fundamentals
                </h3>
                <span className="text-xs font-medium px-2 py-1 rounded-full text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300">
                  Advanced
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                Dive into the world of artificial intelligence and machine learning. Learn neural networks,
                deep learning, and build AI applications with Python and TensorFlow.
              </p>

              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  16h
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  8 lessons
                </span>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                    Python
                  </span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                    TensorFlow
                  </span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                    Neural Networks
                  </span>
                </div>
              </div>

              <Button className="w-full">
                Start Demo Course
              </Button>
            </Card>

            {/* Demo Course 2: Mobile App Development */}
            <Card hover onClick={() => handleStartCourse('mobile-dev-demo')}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  📱 Mobile App Development
                </h3>
                <span className="text-xs font-medium px-2 py-1 rounded-full text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300">
                  Intermediate
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                Build cross-platform mobile applications using React Native. Learn navigation,
                state management, and how to publish apps to app stores.
              </p>

              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  20h
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  10 lessons
                </span>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                    React Native
                  </span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                    JavaScript
                  </span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                    iOS & Android
                  </span>
                </div>
              </div>

              <Button className="w-full">
                Start Demo Course
              </Button>
            </Card>

            {/* Demo Course 3: Cloud Computing */}
            <Card hover onClick={() => handleStartCourse('cloud-computing-demo')}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  ☁️ Cloud Computing with AWS
                </h3>
                <span className="text-xs font-medium px-2 py-1 rounded-full text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                  Intermediate
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                Master cloud computing concepts with Amazon Web Services. Learn about EC2, S3,
                Lambda, and how to deploy scalable applications in the cloud.
              </p>

              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  14h
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  7 lessons
                </span>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                    AWS
                  </span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                    Docker
                  </span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                    DevOps
                  </span>
                </div>
              </div>

              <Button className="w-full">
                Start Demo Course
              </Button>
            </Card>

            {/* Demo Course 4: Data Science */}
            <Card hover onClick={() => handleStartCourse('data-science-demo')}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  📊 Data Science & Analytics
                </h3>
                <span className="text-xs font-medium px-2 py-1 rounded-full text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300">
                  Beginner
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                Learn data science fundamentals with Python. Master pandas, numpy, matplotlib,
                and build your first machine learning models for data analysis.
              </p>

              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  12h
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  6 lessons
                </span>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                    Python
                  </span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                    Pandas
                  </span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                    Visualization
                  </span>
                </div>
              </div>

              <Button className="w-full">
                Start Demo Course
              </Button>
            </Card>

            {/* Demo Course 5: Cybersecurity */}
            <Card hover onClick={() => handleStartCourse('cybersecurity-demo')}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  🔒 Cybersecurity Fundamentals
                </h3>
                <span className="text-xs font-medium px-2 py-1 rounded-full text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300">
                  Advanced
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                Learn essential cybersecurity concepts, ethical hacking, network security,
                and how to protect systems from cyber threats and vulnerabilities.
              </p>

              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  18h
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  9 lessons
                </span>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                    Ethical Hacking
                  </span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                    Network Security
                  </span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                    Penetration Testing
                  </span>
                </div>
              </div>

              <Button className="w-full">
                Start Demo Course
              </Button>
            </Card>

            {/* Demo Course 6: Game Development */}
            <Card hover onClick={() => handleStartCourse('game-dev-demo')}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  🎮 Game Development with Unity
                </h3>
                <span className="text-xs font-medium px-2 py-1 rounded-full text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300">
                  Intermediate
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                Create amazing 2D and 3D games using Unity and C#. Learn game physics,
                animation, UI design, and publish your games to multiple platforms.
              </p>

              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  22h
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  11 lessons
                </span>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                    Unity
                  </span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                    C#
                  </span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                    3D Graphics
                  </span>
                </div>
              </div>

              <Button className="w-full">
                Start Demo Course
              </Button>
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

              {module.prerequisites && module.prerequisites.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Prerequisites:</p>
                  <div className="flex flex-wrap gap-1">
                    {module.prerequisites.map((prereq, index) => (
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
