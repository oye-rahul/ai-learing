import React, { useState } from 'react';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import AdvancedCodeEnvironment from '../components/features/AdvancedCodeEnvironment';
import PythonEnvironment from '../components/features/PythonEnvironment';
import JavaEnvironment from '../components/features/JavaEnvironment';

const PlaygroundPage: React.FC = () => {
  const [selectedEnvironment, setSelectedEnvironment] = useState<string | null>(null);

  const programmingEnvironments = [
    {
      id: 'web-dev',
      title: 'Web Development',
      description: 'HTML, CSS, JavaScript, React, Vue, Angular',
      icon: '🌐',
      color: 'from-blue-500 to-cyan-500',
      languages: ['html', 'css', 'javascript', 'typescript', 'react', 'vue'],
      features: ['Live Preview', 'Responsive Design', 'Browser DevTools', 'Package Manager'],
      locked: false,
    },
    {
      id: 'python',
      title: 'Python',
      description: 'Data Science, Web Development, Automation',
      icon: '🐍',
      color: 'from-green-500 to-emerald-500',
      languages: ['python'],
      features: ['Jupyter Notebooks', 'Data Visualization', 'ML Libraries', 'Package Installation'],
      locked: false,
    },
    {
      id: 'java',
      title: 'Java',
      description: 'Enterprise Applications, Android Development',
      icon: '☕',
      color: 'from-orange-500 to-red-500',
      languages: ['java'],
      features: ['Maven/Gradle', 'Spring Framework', 'JUnit Testing', 'Android SDK'],
      locked: false,
    },
    {
      id: 'cpp',
      title: 'C/C++',
      description: 'System Programming, Game Development',
      icon: '⚡',
      color: 'from-purple-500 to-indigo-500',
      languages: ['c', 'cpp'],
      features: ['GCC/Clang', 'Memory Management', 'Performance Profiling', 'CMake'],
      locked: true,
    },
    {
      id: 'csharp',
      title: 'C#',
      description: '.NET Development, Unity Game Development',
      icon: '🔷',
      color: 'from-indigo-500 to-purple-500',
      languages: ['csharp'],
      features: ['.NET Framework', 'Visual Studio', 'NuGet Packages', 'Unity Integration'],
      locked: true,
    },
    {
      id: 'universal',
      title: 'Universal IDE',
      description: 'Multi-language support like VS Code',
      icon: '💻',
      color: 'from-slate-500 to-slate-500',
      languages: ['javascript', 'python', 'java', 'cpp', 'csharp', 'go', 'rust', 'php'],
      features: ['Multi-language', 'Extensions', 'Git Integration', 'Terminal'],
      locked: true,
    },
    {
      id: 'go',
      title: 'Go',
      description: 'Cloud-native and microservices development',
      icon: '🐹',
      color: 'from-cyan-500 to-blue-500',
      languages: ['go'],
      features: ['Goroutines', 'Built-in Testing', 'Cross Compilation', 'Package Management'],
      locked: true,
    },
    {
      id: 'rust',
      title: 'Rust',
      description: 'Systems programming with memory safety',
      icon: '🦀',
      color: 'from-orange-600 to-red-600',
      languages: ['rust'],
      features: ['Memory Safety', 'Zero-cost Abstractions', 'Cargo Package Manager', 'WebAssembly'],
      locked: true,
    },
    {
      id: 'php',
      title: 'PHP',
      description: 'Web development and server-side scripting',
      icon: '🐘',
      color: 'from-purple-600 to-indigo-600',
      languages: ['php'],
      features: ['Laravel Framework', 'Composer', 'Database Integration', 'Web APIs'],
      locked: true,
    },
    {
      id: 'nodejs',
      title: 'Node.js',
      description: 'Server-side JavaScript development',
      icon: '🟢',
      color: 'from-green-600 to-emerald-600',
      languages: ['javascript', 'typescript'],
      features: ['NPM Packages', 'Express.js', 'Real-time Apps', 'Microservices'],
      locked: true,
    },
  ];
  if (selectedEnvironment) {
    const env = programmingEnvironments.find(e => e.id === selectedEnvironment);
    if (env) {
      // Use PythonEnvironment for Python, AdvancedCodeEnvironment for Web Dev
      if (env.id === 'python') {
        return (
          <PythonEnvironment
            environment={env}
            onBack={() => setSelectedEnvironment(null)}
          />
        );
      } else if (env.id === 'web-dev') {
        return (
          <AdvancedCodeEnvironment
            environment={env}
            onBack={() => setSelectedEnvironment(null)}
          />
        );
      } else if (env.id === 'java') {
        return (
          <JavaEnvironment
            environment={env}
            onBack={() => setSelectedEnvironment(null)}
          />
        );
      } else {
        // For other environments, use simple Python-style editor
        return (
          <PythonEnvironment
            environment={env}
            onBack={() => setSelectedEnvironment(null)}
          />
        );
      }
    }
  }
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            🚀 Online Code Compiler
          </h1>
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm font-semibold rounded-full">
            🌐 100% Online
          </span>
        </div>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Write, compile, and run code in 20+ languages - No installation required! Everything runs in the cloud.
        </p>
      </div>

      {/* Environment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {programmingEnvironments.map((env) => (
          <div key={env.id} className="relative group h-full">
            <Card
              hover={!env.locked}
              className={`h-full ${env.locked ? 'opacity-60 cursor-not-allowed grayscale-[50%]' : 'cursor-pointer transform transition-all duration-200 hover:scale-105'}`}
              onClick={() => {
                if (!env.locked) {
                  setSelectedEnvironment(env.id);
                }
              }}
            >
              <div className={`h-2 bg-gradient-to-r ${env.color} rounded-t-lg -m-6 mb-4`} />
              <div className="text-center">
                <div className="text-4xl mb-3 relative inline-block">
                  {env.icon}
                  {env.locked && (
                    <div className="absolute -bottom-2 -right-2 bg-slate-800 text-white p-1 rounded-full text-xs shadow-lg">
                      🔒
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {env.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {env.description}
                </p>
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {env.languages.slice(0, 3).map((lang, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs"
                    >
                      {lang}
                    </span>
                  ))}
                  {env.languages.length > 3 && (
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs">
                      +{env.languages.length - 3} more
                    </span>
                  )}
                </div>
                <Button 
                  variant={env.locked ? "ghost" : "primary"} 
                  size="sm" 
                  className="w-full"
                  disabled={env.locked}
                >
                  {env.locked ? "Coming Soon" : "Launch Environment"}
                </Button>
              </div>
            </Card>
          </div>
        ))}
      </div>
      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="text-center">
          <div className="text-3xl mb-3">🌐</div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">100% Online</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No installation needed - runs entirely in your browser
          </p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl mb-3">⚡</div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Instant Execution</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Run your code instantly and see results in real-time
          </p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl mb-3">🔧</div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">20+ Languages</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Python, Java, C++, JavaScript, Go, Rust, and many more
          </p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl mb-3">💻</div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Any Device</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Works on desktop, tablet, and mobile - code anywhere
          </p>
        </Card>
      </div>

      {/* Quick Start Templates */}
      <Card>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          🚀 Quick Start Templates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-xl">🌐</span>
              <span className="font-medium text-slate-900 dark:text-white">React Todo App</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Complete React application with hooks and state management
            </p>
          </div>
          <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-xl">🐍</span>
              <span className="font-medium text-slate-900 dark:text-white">Data Analysis</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Python script for data visualization with pandas and matplotlib
            </p>
          </div>
          <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-xl">☕</span>
              <span className="font-medium text-slate-900 dark:text-white">Spring Boot API</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              RESTful API with Spring Boot and JPA
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PlaygroundPage;
