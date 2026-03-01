import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import Button from '../components/shared/Button';
import Card from '../components/shared/Card';
import {
  Zap,
  Code2,
  Cpu,
  LineChart,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Lock,
  Moon,
  Sun,
  ChevronRight,
  Monitor,
  Terminal,
  BrainCircuit,
  Globe,
  Users,
  MousePointer2,
  Database,
  Layers,
  CheckCircle2,
  Network
} from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isDark, setIsDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleAction = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-500 selection:bg-indigo-500/30 font-inter overflow-x-hidden">
      {/* Dynamic Background System */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Animated Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-cyan-600/10 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '4s' }}></div>

        {/* Subtle Canvas Pattern */}
        <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1]" style={{
          backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'backdrop-blur-xl bg-white/70 dark:bg-[#020617]/80 border-b border-slate-200/50 dark:border-white/5 py-3 shadow-xl' : 'py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-300 dark:to-white">
              FLOWSTATE
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-3 rounded-full hover:bg-slate-200 dark:hover:bg-white/5 transition-colors text-slate-600 dark:text-slate-400"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-2 hidden sm:block"></div>

            <Link to="/auth/login" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white font-bold transition-colors hidden sm:block">
              Login
            </Link>
            <Button onClick={() => navigate('/auth/signup')} className="rounded-full px-8 py-2.5 font-black shadow-2xl shadow-indigo-500/20 border-0 bg-indigo-600 hover:bg-indigo-500 text-white">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-[10px] font-black tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-10 animate-fade-in shadow-sm uppercase">
            <Network className="w-4 h-4" />
            <span>Distributed Neural Learning Framework</span>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.85] mb-10 animate-fade-in">
            <span className="block text-slate-900 dark:text-white mb-2">CODE AT THE</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
              SPEED OF LIGHT
            </span>
          </h1>

          <p className="text-base md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-16 leading-relaxed animate-fade-in font-medium" style={{ animationDelay: '0.1s' }}>
            Elevate your engineering potential with FlowState. A hyper-integrated ecosystem
            designed for the architects of the next-generation digital frontier.
            Pair-program with neural agents, deploy cloud GPUs, and master complex systems.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={() => handleAction('/auth/signup')}
              className="group relative flex items-center gap-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-[0_20px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_60px_rgba(255,255,255,0.05)]"
            >
              <Zap className="w-6 h-6 fill-current text-indigo-500" />
              START FREE TRIAL
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
            <button
              onClick={() => handleAction('/auth/login')}
              className="px-12 py-5 rounded-2xl border-2 border-slate-200 dark:border-white/10 font-black text-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-slate-600 dark:text-slate-400"
            >
              LOG-IN
            </button>
          </div>
        </div>

        {/* Cinematic Preview Section */}
        <div className="max-w-6xl mx-auto mt-32 perspective-1000 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="relative group rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rotate-x-12 animate-tilt shadow-2xl">
            {/* System Bar */}
            <div className="bg-slate-100 dark:bg-slate-800/80 px-8 py-4 flex items-center justify-between border-b border-slate-200 dark:border-white/5">
              <div className="flex gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-rose-500/90 shadow-lg shadow-rose-500/20"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-amber-500/90 shadow-lg shadow-amber-500/20"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/90 shadow-lg shadow-emerald-500/20"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-32 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-2/3 animate-pulse"></div>
                </div>
                <div className="text-[9px] font-black font-mono text-slate-400 tracking-widest uppercase">Encryption: AES-256-GCM</div>
              </div>
            </div>

            <div className="aspect-[21/10] flex items-center justify-center relative bg-slate-50 dark:bg-[#01040f]">
              {/* Visual Grid Mockup */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-6 p-8 opacity-20 dark:opacity-40">
                <div className="col-span-2 row-span-2 bg-slate-300 dark:bg-white/5 rounded-3xl backdrop-blur-sm"></div>
                <div className="col-span-4 row-span-1 bg-slate-300 dark:bg-white/5 rounded-3xl backdrop-blur-sm"></div>
                <div className="col-span-1 row-span-3 bg-slate-300 dark:bg-white/5 rounded-3xl backdrop-blur-sm"></div>
                <div className="col-span-3 row-span-3 bg-slate-300 dark:bg-white/5 rounded-3xl backdrop-blur-sm"></div>
              </div>

              {/* Authentication Lockout Interface */}
              <div className="relative z-20 flex flex-col items-center justify-center p-12 glass-premium rounded-[3.5rem] shadow-[0_0_80px_rgba(79,70,229,0.3)]">
                <div className="w-24 h-24 rounded-[2rem] bg-slate-900 dark:bg-white flex items-center justify-center mb-8 shadow-2xl animate-float">
                  <Lock className="w-10 h-10 text-white dark:text-indigo-600" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter uppercase italic">Protected Workspace</h3>
                <p className="text-slate-600 dark:text-slate-400 font-bold tracking-[0.2em] uppercase text-xs mb-10 text-center max-w-sm">
                  Enter your credentials to initialize neural handshake and unlock the full learning suite.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <button onClick={() => navigate('/auth/login')} className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 px-8">LOGIN NOW</button>
                  <button onClick={() => navigate('/auth/signup')} className="flex-1 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 text-slate-900 dark:text-white font-black py-4 rounded-2xl hover:bg-white/20 transition-all px-8">REGISTER</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Impact Section */}
      <section className="relative py-40 px-6 border-y border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#030712] overflow-hidden">
        {/* Section Local Background Blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl opacity-20 dark:opacity-40 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '3s' }}></div>
        </div>

        {/* Subtle Grid for this section */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none" style={{
          backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
          <div className="flex-1 space-y-10">
            <div className="space-y-4">
              <div className="w-12 h-1 bg-indigo-600 rounded-full"></div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] uppercase italic">
                A Global Network of <br />
                <span className="text-indigo-600 dark:text-indigo-400">Elite Engineers</span>
              </h2>
            </div>

            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
              Our infrastructure spans 24 regions, providing low-latency cognitive synchronization
              for thousands of architects worldwide.
            </p>

            <div className="grid grid-cols-2 gap-10">
              {[
                { label: "Daily Executions", value: "1.2M+" },
                { label: "Active Nodes", value: "48,201" },
                { label: "Cloud Regions", value: "24" },
                { label: "Auth Efficiency", value: "99.9%" }
              ].map((stat, i) => (
                <div key={i} className="group cursor-default">
                  <p className="text-3xl font-black group-hover:text-indigo-500 transition-colors duration-500">{stat.value}</p>
                  <p className="text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-6 relative">
            {/* Decorative lines connecting cards */}
            <div className="absolute inset-0 translate-y-8 translate-x-4 pointer-events-none">
              <div className="w-full h-full border border-indigo-500/10 rounded-[3rem] animate-pulse"></div>
            </div>

            <div className="space-y-6 translate-y-12">
              <div className="p-10 space-y-6 glass-premium h-72 flex flex-col justify-center items-center rounded-[2.5rem] hover:-translate-y-2 hover:shadow-indigo-500/20 hover:border-indigo-500/30 transition-all duration-500 group cursor-pointer border-white/10">
                <div className="p-4 rounded-2xl bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                  <Globe className="w-10 h-10 text-indigo-500 group-hover:scale-110 transition-transform" />
                </div>
                <p className="font-black text-center text-sm uppercase tracking-[0.2em] leading-relaxed">Latency-Free<br />Syncronization</p>
              </div>
              <div className="p-10 space-y-6 glass-premium h-72 flex flex-col justify-center items-center rounded-[2.5rem] hover:-translate-y-2 hover:shadow-purple-500/20 hover:border-purple-500/30 transition-all duration-500 group cursor-pointer border-white/10">
                <div className="p-4 rounded-2xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                  <Users className="w-10 h-10 text-purple-500 group-hover:scale-110 transition-transform" />
                </div>
                <p className="font-black text-center text-sm uppercase tracking-[0.2em] leading-relaxed">Collaborative<br />Intelligence</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="p-10 space-y-6 glass-premium h-72 flex flex-col justify-center items-center rounded-[2.5rem] hover:-translate-y-2 hover:shadow-emerald-500/20 hover:border-emerald-500/30 transition-all duration-500 group cursor-pointer border-white/10">
                <div className="p-4 rounded-2xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                  <ShieldCheck className="w-10 h-10 text-emerald-500 group-hover:scale-110 transition-transform" />
                </div>
                <p className="font-black text-center text-sm uppercase tracking-[0.2em] leading-relaxed">Military Grade<br />Security</p>
              </div>
              <div className="p-10 space-y-6 glass-premium h-72 flex flex-col justify-center items-center rounded-[2.5rem] hover:-translate-y-2 hover:shadow-cyan-500/20 hover:border-cyan-500/30 transition-all duration-500 group cursor-pointer border-white/10">
                <div className="p-4 rounded-2xl bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
                  <BrainCircuit className="w-10 h-10 text-cyan-500 group-hover:scale-110 transition-transform" />
                </div>
                <p className="font-black text-center text-sm uppercase tracking-[0.2em] leading-relaxed">Self-Evolving<br />Curriculum</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tighter">Your Neural Evolution</h2>
          <p className="text-base text-slate-500 dark:text-slate-400 font-medium">From authentication to architectural mastery. The FlowState journey is systematic and proven.</p>
        </div>

        <div className="max-w-5xl mx-auto space-y-12 relative">
          {/* Vertical Line */}
          <div className="absolute top-0 bottom-0 left-8 md:left-1/2 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-transparent opacity-20"></div>

          {[
            {
              step: "01",
              title: "Initialization",
              desc: "Register your secure account and initialize your learning persona. Gain immediate access to the public infrastructure.",
              icon: <MousePointer2 className="w-6 h-6" />
            },
            {
              step: "02",
              title: "Cognitive Sync",
              desc: "Complete our baseline assessment. Our neural agents map your current strengths and architect a 1:1 learning path.",
              icon: <Database className="w-6 h-6" />
            },
            {
              step: "03",
              title: "Hyper-Focus Mode",
              desc: "Engage with the Polyglot Playground. Real-time debugging and AI-pair programming for rapid feedback loops.",
              icon: <Terminal className="w-6 h-6" />
            },
            {
              step: "04",
              title: "Mastery Unlock",
              desc: "Build production-ready projects in our cloud environments. Earn cryptographically verified certifications.",
              icon: <CheckCircle2 className="w-6 h-6" />
            }
          ].map((item, i) => (
            <div key={i} className={`flex flex-col md:flex-row items-center gap-12 relative ${i % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
              <div className="flex-1">
                <div className="p-10 group glass-premium hover:border-indigo-500/50 transition-all duration-500 rounded-3xl">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-3xl font-black text-indigo-400 group-hover:text-indigo-500 transition-colors">{item.step}</span>
                    <h3 className="text-2xl font-black uppercase tracking-tight">{item.title}</h3>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center relative z-10 shadow-2xl">
                <div className="text-white dark:text-indigo-600">{item.icon}</div>
              </div>
              <div className="flex-1 hidden md:block"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Engineering Modules Section */}
      <section className="py-40 px-6 relative bg-white dark:bg-[#020617]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
            <div className="max-w-2xl space-y-6">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.85]">
                CORE<br />
                <span className="text-indigo-600 dark:text-indigo-500">CURRICULUM</span>
              </h2>
              <p className="text-lg text-slate-500 font-medium">Four pillars of mastery. Each node contains hundreds of neural-mapped lessons and simulated environments.</p>
            </div>
            <div className="pb-4">
              <div className="flex items-center gap-4 text-xs font-black tracking-[0.3em] uppercase text-slate-400">
                <span>SCROLL TO EXPLORE</span>
                <div className="w-12 h-px bg-slate-200 dark:bg-white/10"></div>
                <ChevronRight className="w-4 h-4 animate-bounce-x" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Neural Logic", tag: "AI / ML", desc: "Master the foundations of transformers, neural networks, and prompt engineering.", icon: <BrainCircuit className="w-8 h-8" />, color: "blue" },
              { title: "Synthesized Web", tag: "Frontend", desc: "Build impossible interfaces with React, Three.js, and advanced motion systems.", icon: <Layers className="w-8 h-8" />, color: "indigo" },
              { title: "Grid Architecture", tag: "Backend", desc: "Scale to millions with microservices, distributed databases, and high-concurrency Node.js.", icon: <Database className="w-8 h-8" />, color: "purple" },
              { title: "Machine Language", tag: "Low Level", desc: "Optimize at the edge with C++, Rust, and assembly-level cognitive patterns.", icon: <Cpu className="w-8 h-8" />, color: "cyan" }
            ].map((module, i) => (
              <div key={i} className="group glass-premium p-10 rounded-[2.5rem] border-white/10 hover:border-indigo-500/40 transition-all duration-700 hover:-translate-y-4 cursor-pointer min-h-[400px] flex flex-col justify-between">
                <div className="space-y-6">
                  <div className={`w-16 h-16 rounded-2xl bg-${module.color}-500/10 flex items-center justify-center text-${module.color}-500 transform group-hover:rotate-[360deg] transition-transform duration-1000`}>
                    {module.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400">{module.tag}</span>
                    <h3 className="text-2xl font-black uppercase mt-2 group-hover:text-indigo-500 transition-colors">{module.title}</h3>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{module.desc}</p>
                </div>
                <div className="pt-8 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all">
                  <span className="text-xs font-black tracking-widest uppercase">Explore Module</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Marquee (Static Alternative) */}
      <section className="py-24 bg-slate-900 overflow-hidden relative">
        <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-slate-900 to-transparent z-10"></div>
        <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-slate-900 to-transparent z-10"></div>
        <div className="flex items-center gap-24 whitespace-nowrap animate-scroll opacity-40">
          {['REACT', 'TYPESCRIPT', 'PYTHON', 'NODE.JS', 'PYTORCH', 'DOCKER', 'KUBERNETES', 'MONGODB', 'EXPRESS', 'NEURAL ENGINE', 'GPU CLOUD'].map((tech, i) => (
            <span key={i} className="text-4xl font-black text-white/50 tracking-[0.3em] font-mono">{tech}</span>
          ))}
          {/* Duplicate for seamless scroll */}
          {['REACT', 'TYPESCRIPT', 'PYTHON', 'NODE.JS', 'PYTORCH', 'DOCKER', 'KUBERNETES', 'MONGODB', 'EXPRESS', 'NEURAL ENGINE', 'GPU CLOUD'].map((tech, i) => (
            <span key={`dup-${i}`} className="text-4xl font-black text-white/50 tracking-[0.3em] font-mono">{tech}</span>
          ))}
        </div>
      </section>

      {/* Neural Pulse FAQ Section */}
      <section className="py-40 px-6 bg-slate-50 dark:bg-[#01040f]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-24 space-y-6">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic drop-shadow-sm">
              NEURAL<br />
              <span className="text-indigo-600 dark:text-indigo-500">PULSE</span>
            </h2>
            <p className="text-slate-500 font-bold tracking-[0.2em] uppercase text-xs">frequently initialized queries</p>
          </div>

          <div className="space-y-6">
            {[
              { q: "Is FlowState free to initialize?", a: "Yes, you can initialize your ID and access the basic curriculum without any cost. Advanced cloud GPU nodes require a pro-tier membership." },
              { q: "How do the AI mentors work?", a: "Our AI agents are mapped to your specific cognitive patterns, providing real-time code reviews and architectural alternative suggestions as you build." },
              { q: "Are the certifications industry-recognized?", a: "Every FlowState certification is cryptographically signed and verified on our node network, recognized by elite engineering teams globally." },
              { q: "Can I use external cloud providers?", a: "FlowState is built to be provider-agnostic. You can sync your AWS, GCP, or Azure credentials to initialize external node clusters." }
            ].map((faq, i) => (
              <div key={i} className="group glass-premium p-8 rounded-[2rem] border-white/5 hover:border-indigo-500/20 transition-all cursor-pointer">
                <div className="flex items-center justify-between gap-8">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold group-hover:text-indigo-500 transition-colors uppercase tracking-tight">{faq.q}</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">{faq.a}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all">
                    <ArrowRight className="w-5 h-5 rotate-45 group-hover:rotate-0 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-40 px-6">
        <div className="max-w-6xl mx-auto relative group overflow-hidden rounded-[4rem] bg-indigo-600 shadow-[0_50px_120px_rgba(79,70,229,0.4)]">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-indigo-700 to-purple-800"></div>
          <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

          <div className="relative z-10 p-16 md:p-32 text-center space-y-12">
            <h2 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tighter uppercase italic drop-shadow-2xl">
              ASCEND THE<br />PYRAMID.
            </h2>
            <p className="text-indigo-50 text-lg md:text-xl max-w-3xl mx-auto font-bold opacity-90 leading-relaxed">
              Join the world's most proactive engineering community.
              The future belongs to those who initialize first.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={() => navigate('/auth/signup')}
                className="bg-white text-indigo-700 px-16 py-7 rounded-3xl font-black text-2xl hover:scale-105 active:scale-95 transition-all shadow-3xl shadow-indigo-950/40 flex items-center gap-4"
              >
                GET STARTED
                <ArrowRight className="w-8 h-8" />
              </button>
              <button
                onClick={() => navigate('/auth/login')}
                className="px-16 py-7 rounded-3xl border-2 border-white/30 text-white font-black text-2xl hover:bg-white/10 transition-all font-mono tracking-widest"
              >
                LOG-IN
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 border-t border-slate-200 dark:border-white/5 px-6 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <div className="flex flex-col items-center gap-8">
            <div className="flex items-center gap-4">
              <Zap className="w-8 h-8 text-indigo-600 dark:text-indigo-400 fill-current" />
              <span className="text-3xl font-black tracking-tighter uppercase">FLOWSTATE</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-bold max-w-lg leading-relaxed uppercase tracking-widest text-[10px]">
              The Neural Dashboard for Next-Generation Engineers.<br />Built for the Elite Community.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-12 text-xs font-black text-slate-400 dark:text-slate-600 tracking-[0.3em] uppercase">
            <Link to="#" className="hover:text-indigo-600 transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-indigo-600 transition-colors">Terms</Link>
            <Link to="#" className="hover:text-indigo-600 transition-colors">Discord</Link>
            <Link to="#" className="hover:text-indigo-600 transition-colors">Security</Link>
          </div>

          <div className="pt-16 border-t border-slate-200 dark:border-white/5 flex flex-col items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded bg-slate-200 dark:bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              System Status: NOMINAL_FLOW_ACTIVE
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 tracking-[0.5em] uppercase">
              © 2026 NEURAL INTERACTIVE SYSTEMS. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>

      {/* Global Aesthetics */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        body { font-family: 'Inter', sans-serif; }

        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .animate-scroll {
          animation: scroll 40s linear infinite;
        }

        .shadow-3xl {
          box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
        }

        .perspective-1000 { perspective: 1000px; }
        .rotate-x-12 { transform: rotateX(8deg); }
      `}</style>
    </div>
  );
};

export default HomePage;
