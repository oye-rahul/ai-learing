import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/shared/Button';
import Card from '../components/shared/Card';

const HomePage: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference or localStorage
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };
  const features = [
    {
      icon: (
        <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'AI-Powered Learning',
      description: 'Get personalized explanations, code optimization, and debugging assistance from our advanced AI.',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      title: 'Interactive Playground',
      description: 'Write, test, and experiment with code in our Monaco-powered editor with real-time AI assistance.',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with detailed analytics and skill progression charts.',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      title: 'Project-Based Learning',
      description: 'Build real projects with guided tutorials and collaborate with other developers.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-slate-900 dark:to-slate-800">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">FlowState</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <Link to="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/auth/signup">
                <Button variant="primary">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Gradient Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary-400/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <span className="inline-block py-1 px-3 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 text-sm font-semibold mb-6 border border-primary-200 dark:border-primary-800">
              🚀 AI-Powered Learning Evolution
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-8 tracking-tight leading-tight">
              Master Coding with <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-600 bg-clip-text text-transparent animate-gradient-x">
                Intelligent AI Guidance
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              FlowState combines personalized AI mentorship with an interactive playground to help you
              <span className="text-primary-600 dark:text-primary-400 font-semibold"> learn faster</span>,
              <span className="text-purple-600 dark:text-purple-400 font-semibold"> code better</span>, and
              <span className="text-secondary-600 dark:text-secondary-400 font-semibold"> build smarter</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link to="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40 transform hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300 text-lg px-8 py-4">
                  Start Learning Free
                </Button>
              </Link>
              <Button variant="secondary" size="lg" className="w-full sm:w-auto hover:bg-white dark:hover:bg-slate-800 border-2 text-lg px-8 py-4 hover:scale-105 active:scale-95 transition-all duration-300">
                View Interactive Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Live Code Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="relative max-w-5xl mx-auto">
          {/* Decorative Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl blur opacity-20 dark:opacity-40 animate-pulse-slow"></div>

          <Card className="relative p-8 border-0 ring-1 ring-slate-900/5 dark:ring-white/10 shadow-2xl backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 animate-float">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
              <span className="mr-2">✨</span> Experience Next-Gen Coding
            </h3>
            <div className="bg-[#1a1b26] rounded-xl p-6 font-mono text-sm shadow-inner overflow-hidden relative group">
              {/* Window Controls */}
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>

              <div className="text-slate-500 mb-2 italic">{'// Explain this complex logic in plain English'}</div>
              <div className="text-purple-300">
                <span className="text-blue-400">function</span>
                <span className="text-yellow-300"> optimizeNetwork</span>
                <span className="text-slate-300">(</span>
                <span className="text-orange-300">graph</span>
                <span className="text-slate-300">) {'{'}</span>
              </div>
              <div className="ml-4 text-slate-300">
                <div className="border-l-2 border-slate-700 pl-4 py-1">
                  <span className="text-cyan-400">const</span> nodes = graph.
                  <span className="text-blue-300">getAllNodes</span>();
                </div>
                <div>
                  <span className="text-purple-400">return</span> nodes.
                  <span className="text-blue-300">reduce</span>((acc, node) {'=>'} ...);
                </div>
              </div>
              <div className="text-slate-300">{'}'}</div>
            </div>

            <div className="mt-6 p-5 bg-gradient-to-r from-primary-50 to-white dark:from-slate-800 dark:to-slate-800/50 rounded-xl border border-primary-100 dark:border-slate-700 transform transition-all duration-500 translate-y-2 opacity-0 animate-slide-up" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400">
                  🤖
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                    AI Analysis Result
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    This function attempts to optimize a graph network. However, using <code className="text-red-500 bg-red-50 dark:bg-red-900/20 px-1 rounded">getAllNodes()</code> might be memory intensive for large datasets. Consider using a generator or streaming approach for O(1) space complexity.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Real-time AI Mentorship Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Real-time AI Mentorship
            </h2>
            <p className="text-xl text-slate-300">
              Get instant code explanations, debugging tips, and architectural advice as you type
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Code Editor Mock */}
            <div className="bg-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
              {/* Editor Header */}
              <div className="bg-slate-900 px-4 py-2 flex items-center space-x-2 border-b border-slate-700">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-slate-400 text-sm ml-4">App.js</span>
              </div>

              {/* Code Content */}
              <div className="p-6 font-mono text-sm">
                <div className="space-y-2">
                  <div className="flex">
                    <span className="text-slate-500 w-8">1</span>
                    <span className="text-purple-400">const</span>
                    <span className="text-white"> fetchData = </span>
                    <span className="text-blue-400">async</span>
                    <span className="text-white"> () =&gt; {'{'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 w-8">2</span>
                    <span className="text-white ml-4">  </span>
                    <span className="text-purple-400">try</span>
                    <span className="text-white"> {'{'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 w-8">3</span>
                    <span className="text-white ml-8">    </span>
                    <span className="text-purple-400">const</span>
                    <span className="text-white"> res = </span>
                    <span className="text-blue-400">await</span>
                    <span className="text-white"> </span>
                    <span className="text-yellow-400">fetch</span>
                    <span className="text-white">(</span>
                    <span className="text-green-400">'/api/data'</span>
                    <span className="text-white">);</span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 w-8">4</span>
                    <span className="text-white ml-8">    </span>
                    <span className="text-purple-400">const</span>
                    <span className="text-white"> data = </span>
                    <span className="text-blue-400">await</span>
                    <span className="text-white"> res.</span>
                    <span className="text-yellow-400">json</span>
                    <span className="text-white">();</span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 w-8">5</span>
                    <span className="text-white ml-8">    </span>
                    <span className="text-yellow-400">setData</span>
                    <span className="text-white">(data);</span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 w-8">6</span>
                    <span className="text-white ml-4">  {'}'} </span>
                    <span className="text-purple-400">catch</span>
                    <span className="text-white"> (err) {'{'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 w-8">7</span>
                    <span className="text-white ml-8">    console.</span>
                    <span className="text-yellow-400">error</span>
                    <span className="text-white">(err);</span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 w-8">8</span>
                    <span className="text-white ml-4">  {'}'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 w-8">9</span>
                    <span className="text-white">{'}'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Explanation Panel */}
            <div className="bg-slate-800 rounded-xl p-6 shadow-2xl border border-slate-700">
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="text-xl font-bold text-white">AI EXPLANATION</h3>
              </div>

              <div className="space-y-4 text-slate-300">
                <p className="leading-relaxed">
                  "On line 4, we are parsing the response stream into a JSON object.
                  Using <span className="text-blue-400 font-mono">await</span> here is critical because{' '}
                  <span className="text-yellow-400 font-mono">res.json()</span> returns a Promise."
                </p>

                <div className="bg-slate-900 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="text-sm text-slate-400 mb-2">💡 TIP</p>
                  <p className="text-sm">
                    Consider adding a loading state before starting the fetch request to improve UX.
                  </p>
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                  Refactor This Block
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learn by Doing Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Learn by Doing.
              </h2>
              <h3 className="text-4xl font-bold text-cyan-400 mb-6">
                In the Cloud.
              </h3>
              <p className="text-xl text-slate-300 mb-8">
                Don't just watch videos. Code alongside experts in our pre-configured Jupyter environments with GPU acceleration included.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">Zero-config GPU workspaces</h4>
                    <p className="text-slate-400">Start coding immediately with pre-configured environments</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">Interactive code reviews by AI mentors</h4>
                    <p className="text-slate-400">Get instant feedback on your code quality and style</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">Real-world dataset access</h4>
                    <p className="text-slate-400">Work with actual data from industry projects</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Code Editor Mock */}
            <div className="bg-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
              {/* Editor Header */}
              <div className="bg-slate-900 px-4 py-2 flex items-center space-x-2 border-b border-slate-700">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-slate-400 text-sm ml-4">trainer.py</span>
              </div>

              {/* Code Content */}
              <div className="p-6 font-mono text-sm">
                <div className="space-y-2">
                  <div className="flex">
                    <span className="text-slate-500 w-8">1</span>
                    <span className="text-purple-400">import</span>
                    <span className="text-white"> torch</span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 w-8">2</span>
                    <span className="text-purple-400">from</span>
                    <span className="text-white"> transformers </span>
                    <span className="text-purple-400">import</span>
                    <span className="text-white"> Trainer</span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 w-8">3</span>
                    <span className="text-slate-600"># Configure architecture</span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 w-8">4</span>
                    <span className="text-white">model = </span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 w-8">5</span>
                    <span className="text-white ml-4">  </span>
                    <span className="text-cyan-400">AutoModelForCausalLM</span>
                    <span className="text-white">.</span>
                    <span className="text-yellow-400">from_pretrained</span>
                    <span className="text-white">(</span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 w-8">6</span>
                    <span className="text-white ml-8">    </span>
                    <span className="text-green-400">"academy-base-v1"</span>
                    <span className="text-white">, device_map=</span>
                    <span className="text-green-400">"auto"</span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 w-8">7</span>
                    <span className="text-white ml-4">  )</span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 w-8">8</span>
                    <span className="text-white"></span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 w-8">9</span>
                    <span className="text-white">trainer.</span>
                    <span className="text-yellow-400">train</span>
                    <span className="text-white">()</span>
                  </div>
                </div>

                {/* Compiling Status */}
                <div className="mt-6 bg-slate-900 rounded-lg p-3 border border-cyan-500/30">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span className="text-cyan-400 text-xs">COMPILING...</span>
                    <span className="text-slate-500 text-xs ml-auto">Avg Latency</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Built by the Community.
            </h2>
            <h3 className="text-4xl font-bold text-cyan-400 mb-6">
              Free for Everyone.
            </h3>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              We believe that high-quality coding education should be a universal right.
              Our platform is an open-source initiative supported by thousands of developers worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Stats Cards */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="text-4xl font-bold text-white mb-2">45k+</div>
              <div className="text-slate-400">Active Learners</div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="text-4xl font-bold text-white mb-2">100%</div>
              <div className="text-slate-400">Free Content</div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col items-center justify-center">
              <svg className="w-12 h-12 text-cyan-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <div className="text-slate-400 text-center">OPEN SOURCE</div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col items-center justify-center">
              <svg className="w-12 h-12 text-cyan-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <div className="text-slate-400 text-center">NON-PROFIT</div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col items-center justify-center">
              <svg className="w-12 h-12 text-cyan-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div className="text-slate-400 text-center">COLLABORATIVE</div>
            </div>
          </div>

          <div className="text-center">
            <button className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg border border-slate-700 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>Join the Global Discord Community</span>
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Comprehensive tools and features designed for modern developers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center group hover:-translate-y-2 hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
              >
                <div className="flex justify-center mb-6">
                  <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-2xl group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors duration-300 group-hover:animate-bounce-slow">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100 dark:divide-slate-800">
            <div className="p-4 transform hover:scale-105 transition-transform duration-300">
              <div className="text-5xl font-extrabold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-2 animate-pulse-slow">50K+</div>
              <div className="font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider text-sm">Active Learners</div>
            </div>
            <div className="p-4 transform hover:scale-105 transition-transform duration-300">
              <div className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent mb-2 animate-pulse-slow" style={{ animationDelay: '0.5s' }}>1M+</div>
              <div className="font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider text-sm">Code Executions</div>
            </div>
            <div className="p-4 transform hover:scale-105 transition-transform duration-300">
              <div className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent mb-2 animate-pulse-slow" style={{ animationDelay: '1s' }}>500+</div>
              <div className="font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider text-sm">Learning Paths</div>
            </div>
            <div className="p-4 transform hover:scale-105 transition-transform duration-300">
              <div className="text-5xl font-extrabold bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent mb-2 animate-pulse-slow" style={{ animationDelay: '1.5s' }}>98%</div>
              <div className="font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider text-sm">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Loved by Developers Worldwide
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              See what our community has to say
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  S
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-slate-900 dark:text-white">Sarah Chen</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Full Stack Developer</div>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 italic">
                "FlowState's AI assistant helped me understand complex algorithms in minutes. The interactive playground is a game-changer!"
              </p>
              <div className="flex mt-4 text-yellow-400">
                {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  M
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-slate-900 dark:text-white">Marcus Johnson</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Software Engineer</div>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 italic">
                "I went from beginner to landing my first dev job in 6 months. The project-based learning approach is incredibly effective."
              </p>
              <div className="flex mt-4 text-yellow-400">
                {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  A
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-slate-900 dark:text-white">Aisha Patel</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Data Scientist</div>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 italic">
                "The AI code explanations are spot-on. It's like having a senior developer mentor available 24/7. Absolutely worth it!"
              </p>
              <div className="flex mt-4 text-yellow-400">
                {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
              </div>
            </Card>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Coding Journey?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of developers who are learning faster and coding better with FlowState.
            </p>
            <Link to="/auth/signup">
              <Button variant="secondary" size="lg">
                Get Started Today
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-8 w-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">FlowState</span>
            </div>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">
                Privacy
              </Link>
              <Link to="/terms" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">
                Terms
              </Link>
              <Link to="/support" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">
                Support
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              © 2024 FlowState. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
