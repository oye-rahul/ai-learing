import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import Modal from '../components/shared/Modal';
import AIChatWindow from '../components/features/AIChatWindow';
import api from '../services/api';
import { aiAPI } from '../services/api';

type FileType = {
  id: string;
  name: string;
  language: string;
  content: string;
};

const initialFiles: FileType[] = [
  {
    id: 'index.html',
    name: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
    <style>
        body { font-family: Arial; padding: 20px; }
        h1 { color: #667eea; }
        button { background: #667eea; color: white; border: none; 
                 padding: 10px 20px; border-radius: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>Hello World!</h1>
    <button onclick="alert('Hello!')">Click Me</button>
</body>
</html>`,
  },
  {
    id: 'app.js',
    name: 'app.js',
    language: 'javascript',
    content: `// JavaScript Example
console.log("Hello from JavaScript!");

function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("World"));`,
  },
  {
    id: 'app.py',
    name: 'app.py',
    language: 'python',
    content: `# Python Example
print("Hello from Python!")

for i in range(5):
    print(f"Number: {i}")`,
  },
];

const LANG_MAP: Record<string, string> = {
  html: 'html', css: 'css', js: 'javascript', py: 'python',
  cpp: 'cpp', c: 'c', java: 'java', go: 'go', rs: 'rust',
  php: 'php', cs: 'csharp',
};

export default function CodeEditorPageNew() {
  const [files, setFiles] = useState<FileType[]>(initialFiles);
  const [activeFileId, setActiveFileId] = useState('index.html');
  const [output, setOutput] = useState<string[]>(['# Terminal', '$ Ready to execute code...']);
  const [isRunning, setIsRunning] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [codeUpdated, setCodeUpdated] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('python');

  // AI Agent State
  const [showAIAgent, setShowAIAgent] = useState(false);

  const activeFile = files.find(f => f.id === activeFileId);

  // Editor Refs
  const editorRef = React.useRef<any>(null);
  const monacoRef = React.useRef<any>(null);

  // Reset code updated animation after 2 seconds
  useEffect(() => {
    if (codeUpdated) {
      const timer = setTimeout(() => setCodeUpdated(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [codeUpdated]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (!value) return;
    setFiles(prev => prev.map(f =>
      f.id === activeFileId ? { ...f, content: value } : f
    ));
  }, [activeFileId]);

  const handleUpdateCode = useCallback((newCode: string) => {
    if (editorRef.current && monacoRef.current) {
      const editor = editorRef.current;
      const selection = editor.getSelection();

      const op = {
        range: selection,
        text: newCode,
        forceMoveMarkers: true
      };

      editor.executeEdits('ai-assistant', [op]);
      editor.pushUndoStop();
    } else {
      // Fallback
      setFiles(prev => prev.map(f =>
        f.id === activeFileId ? { ...f, content: newCode } : f
      ));
    }
    setCodeUpdated(true);
  }, [activeFileId]);

  const handleRunCode = useCallback(async () => {
    if (!activeFile) return;

    // For HTML, show preview
    if (activeFile.language === 'html') {
      setShowPreview(true);
      setOutput([
        '# Terminal',
        '$ Opening HTML preview...',
        '✓ Preview window opened successfully',
      ]);
      return;
    }

    setIsRunning(true);
    setOutput([
      '# Terminal',
      `$ Running ${activeFile.name}...`,
      '',
    ]);

    try {
      const langMap: Record<string, string> = {
        javascript: 'javascript',
        python: 'python',
        cpp: 'cpp',
        c: 'c',
        java: 'java',
        go: 'go',
        rust: 'rust',
        php: 'php',
        csharp: 'csharp',
      };

      const backendLang = langMap[activeFile.language] || 'javascript';

      const response = await api.post('/playground/execute', {
        code: activeFile.content,
        language: backendLang,
      });

      if (response.data.success) {
        setOutput([
          '# Terminal',
          `$ ${activeFile.name} executed successfully`,
          `⏱ Execution time: ${response.data.executionTime}`,
          '',
          '--- Output ---',
          response.data.output || '(no output)',
        ]);
      } else {
        setOutput([
          '# Terminal',
          `$ Error executing ${activeFile.name}`,
          '',
          '--- Error ---',
          response.data.error || 'Unknown error',
        ]);
      }
    } catch (error: any) {
      setOutput([
        '# Terminal',
        `$ Failed to execute ${activeFile.name}`,
        '',
        '--- Error ---',
        error.response?.data?.error || error.message,
      ]);
    } finally {
      setIsRunning(false);
    }
  }, [activeFile]);

  const handleCreateFile = useCallback((fileName: string) => {
    const ext = fileName.split('.').pop() || 'txt';
    const language = LANG_MAP[ext] || 'plaintext';

    const newFile: FileType = {
      id: fileName,
      name: fileName,
      language,
      content: `// New ${language} file\n`,
    };

    setFiles(prev => [...prev, newFile]);
    setActiveFileId(fileName);
    setModalOpen(false);
  }, []);

  const handleDeleteFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (activeFileId === fileId) {
      setActiveFileId(files[0]?.id || '');
    }
  }, [activeFileId, files]);

  // Specific AI Actions (Legacy / Button based)
  const handleFixCode = useCallback(async () => {
    if (!activeFile) return;
    setIsFixing(true);
    // Open AI Agent for a better experience
    setShowAIAgent(true);
    // You could pre-populate the chat here if desired, but letting the user type might be better
    setIsFixing(false);
  }, [activeFile]);

  const handleConvertCode = useCallback(async () => {
    if (!activeFile) return;

    setIsConverting(true);
    setShowConvertModal(false);
    setOutput([
      '# Terminal',
      `$ 🔄 Converting ${activeFile.name} to ${targetLanguage}...`,
      '🤖 AI is translating your code...',
      '',
    ]);

    try {
      const response = await aiAPI.convertCode({
        code: activeFile.content,
        fromLanguage: activeFile.language,
        toLanguage: targetLanguage,
      });

      if (response.data.converted_code) {
        const convertedCode = response.data.converted_code;

        // Create new file with converted code
        const newFileName = `${activeFile.name.split('.')[0]}_converted.${targetLanguage === 'javascript' ? 'js' : targetLanguage === 'python' ? 'py' : targetLanguage}`;
        const newFile: FileType = {
          id: newFileName,
          name: newFileName,
          language: targetLanguage,
          content: convertedCode,
        };

        setFiles(prev => [...prev, newFile]);
        setActiveFileId(newFileName);

        setOutput([
          '# Terminal',
          `$ ✅ Code Converted Successfully!`,
          '',
          `--- Converted from ${activeFile.language} to ${targetLanguage} ---`,
          response.data.explanation || 'Code has been converted to the target language.',
          '',
          `💡 New file created: ${newFileName}`,
        ]);
      }
    } catch (error: any) {
      setOutput([
        '# Terminal',
        `$ ❌ Failed to convert code`,
        '',
        '--- Error ---',
        error.response?.data?.message || error.message || 'AI service unavailable',
      ]);
    } finally {
      setIsConverting(false);
    }
  }, [activeFile, activeFileId, targetLanguage]);

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-white relative">
      {/* Header */}
      <header className="h-12 flex items-center justify-between px-4 bg-[#2d2d30] border-b border-[#3e3e42]">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm">
            ← Back
          </Link>
          <span className="text-white font-medium">Code Editor</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isRunning ? '⏳ Running...' : '▶ Run'}
          </button>

          <div className="h-6 w-px bg-gray-600 mx-2"></div>

          <button
            onClick={() => setShowAIAgent(!showAIAgent)}
            className={`px-3 py-1.5 rounded text-sm flex items-center gap-2 transition-all ${showAIAgent
              ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]'
              : 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/40'
              }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Assistant
          </button>

          <div className="h-6 w-px bg-gray-600 mx-2"></div>

          <button
            onClick={() => setShowConvertModal(true)}
            className="px-3 py-1.5 bg-orange-600/20 hover:bg-orange-600/40 text-orange-300 rounded text-sm"
          >
            🔄 Convert
          </button>

          <button
            onClick={() => editorRef.current?.getAction('editor.action.formatDocument').run()}
            className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded text-sm"
            title="Format Code"
          >
            ✨ Format
          </button>

          {activeFile?.language === 'html' && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded text-sm"
            >
              {showPreview ? '📝 Code' : '👁 Preview'}
            </button>
          )}

          <button
            onClick={() => setModalOpen(true)}
            className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 rounded text-sm"
          >
            + File
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 relative">
        {/* Sidebar */}
        <aside className="w-60 bg-[#252526] border-r border-[#3e3e42] overflow-auto">
          <div className="p-2">
            <div className="text-xs text-slate-400 uppercase mb-2 px-2">Files</div>
            {files.map(file => (
              <div
                key={file.id}
                className={`group flex items-center justify-between px-3 py-2 rounded cursor-pointer ${activeFileId === file.id ? 'bg-[#37373d]' : 'hover:bg-[#2a2d2e]'
                  }`}
                onClick={() => setActiveFileId(file.id)}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-[#1e1e1e] text-slate-400 font-mono">
                    {file.language === 'javascript' ? 'JS' : file.language === 'python' ? 'PY' : file.language.toUpperCase().slice(0, 3)}
                  </span>
                  <span className="text-sm truncate">{file.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete ${file.name}?`)) {
                      handleDeleteFile(file.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Area */}
        {/* Main Content Wrapper */}
        <div className="flex-1 flex min-w-0">
          {/* Main Editor Area */}
          <main className="flex-1 flex flex-col min-w-0 min-h-0 relative">
            {/* Editor/Preview */}
            <div className="flex-1 min-h-0 relative">
              {showPreview && activeFile?.language === 'html' ? (
                <iframe
                  srcDoc={activeFile.content}
                  className="w-full h-full bg-white"
                  title="Preview"
                  sandbox="allow-scripts"
                />
              ) : (
                <div className={`h-full ${codeUpdated ? 'animate-pulse bg-green-900/10' : ''} transition-all duration-500`}>
                  <Editor
                    height="100%"
                    language={activeFile?.language || 'plaintext'}
                    value={activeFile?.content || ''}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: true },
                      fontSize: 14,
                      wordWrap: 'on',
                      automaticLayout: true,
                      padding: { top: 16 }
                    }}
                  />
                </div>
              )}
            </div>

            {/* Terminal Output */}
            <div className="h-48 bg-[#1a1a1a] border-t border-[#3e3e42] overflow-auto">
              <div className="flex items-center px-4 py-2 bg-[#252526] border-b border-[#3e3e42]">
                <span className="text-xs text-slate-400 font-semibold">TERMINAL</span>
              </div>
              <div className="p-4 font-mono text-sm text-green-400">
                {output.map((line, i) => (
                  <div key={i} className={line.startsWith('#') ? 'text-slate-500 mb-2' : line.startsWith('$') ? 'text-blue-400' : line.startsWith('---') ? 'text-yellow-400 mt-2' : line.includes('Error') || line.includes('Failed') ? 'text-red-400' : 'text-green-400'}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </main>

          {/* AI Agent Sidebar */}
          {showAIAgent && (
            <aside className="w-[450px] bg-[#1e1e1e] border-l border-[#3e3e42] flex flex-col z-20">
              <AIChatWindow
                onClose={() => setShowAIAgent(false)}
                currentCode={activeFile?.content || ''}
                language={activeFile?.language || 'plaintext'}
                onCodeUpdate={handleUpdateCode}
              />
            </aside>
          )}
        </div>
      </div>

      {/* Create File Modal */}
      {modalOpen && (
        <Modal isOpen={true} onClose={() => setModalOpen(false)}>
          <div className="p-6 bg-white dark:bg-[#252526]">
            <h2 className="text-xl font-semibold mb-4">New File</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const fileName = formData.get('fileName') as string;
                if (fileName) handleCreateFile(fileName);
              }}
            >
              <input
                type="text"
                name="fileName"
                placeholder="filename.js"
                className="w-full px-3 py-2 bg-[#3c3c3c] border border-[#3c3c3c] rounded text-white mb-4"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-[#3c3c3c] rounded hover:bg-[#505050]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Convert Language Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#2d2d30] rounded-lg shadow-2xl max-w-md w-full mx-4 border border-[#3e3e42]">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">🔄 Convert Code</h2>
              <p className="text-slate-400 text-sm mb-4">
                Convert your {activeFile?.language} code to another programming language
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Target Language
                </label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3e3e42] rounded text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="csharp">C#</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                  <option value="php">PHP</option>
                  <option value="typescript">TypeScript</option>
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowConvertModal(false)}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded text-sm text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConvertCode}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded text-sm text-white"
                >
                  Convert Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
