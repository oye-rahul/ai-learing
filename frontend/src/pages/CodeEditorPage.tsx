import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import Modal from '../components/shared/Modal';
import axios from 'axios';

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

  const activeFile = files.find(f => f.id === activeFileId);

  // Reset code updated animation after 2 seconds
  useEffect(() => {
    if (codeUpdated) {
      const timer = setTimeout(() => setCodeUpdated(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [codeUpdated]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (!value) return;
    setFiles(prev => prev.map(f => 
      f.id === activeFileId ? { ...f, content: value } : f
    ));
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

      const response = await axios.post('http://localhost:5000/api/playground/execute', {
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

  const handleFixCode = useCallback(async () => {
    if (!activeFile) return;

    setIsFixing(true);
    setOutput([
      '# Terminal',
      `$ Analyzing ${activeFile.name} for bugs...`,
      '🤖 AI is reviewing your code...',
      '',
    ]);

    try {
      const response = await axios.post('http://localhost:5000/api/ai/debug', {
        code: activeFile.content,
        language: activeFile.language,
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.debug_suggestions) {
        const aiResponse = response.data.debug_suggestions;
        
        // Try multiple patterns to extract fixed code
        let fixedCode: string | null = null;
        
        // Pattern 1: Standard code block with language
        let codeBlockMatch = aiResponse.match(/```[\w]*\n([\s\S]*?)\n```/);
        
        // Pattern 2: Look for "Corrected Code" or "Fixed Code" section
        if (!codeBlockMatch) {
          const correctedSection = aiResponse.match(/(?:Corrected|Fixed|Updated)\s+(?:Code|Version)[:\s]*\n*```[\w]*\n([\s\S]*?)\n```/i);
          if (correctedSection) codeBlockMatch = correctedSection;
        }
        
        // Pattern 3: First code block in response
        if (!codeBlockMatch) {
          codeBlockMatch = aiResponse.match(/```([\s\S]*?)```/);
        }
        
        if (codeBlockMatch) {
          // Extract code (handle both with and without language specifier)
          const extractedCode = codeBlockMatch[1] || codeBlockMatch[0];
          if (extractedCode) {
            // Remove language identifier if present at start
            fixedCode = extractedCode.replace(/^[\w]+\n/, '').trim();
          }
        }
        
        if (fixedCode && fixedCode.length > 10) {
          // Apply the fixed code automatically
          const codeToApply = fixedCode; // Create const to satisfy TypeScript
          setFiles(prev => prev.map(f => 
            f.id === activeFileId ? { ...f, content: codeToApply } : f
          ));
          
          // Trigger highlight animation
          setCodeUpdated(true);
          
          setOutput([
            '# Terminal',
            `$ ✅ Code Fixed Successfully!`,
            '',
            '--- Fixed Code ---',
            codeToApply, // Show only the fixed code
          ]);
        } else {
          // No code block found, just show suggestions
          setOutput([
            '# Terminal',
            `$ 📋 AI Code Analysis Complete`,
            '',
            '--- AI Suggestions ---',
            aiResponse,
            '',
            '💡 The AI provided analysis but no automatic fix.',
            '   Review the suggestions above and apply changes manually.',
          ]);
        }
      }
    } catch (error: any) {
      setOutput([
        '# Terminal',
        `$ Failed to analyze code`,
        '',
        '--- Error ---',
        error.response?.data?.message || error.message || 'AI service unavailable',
        '',
        '💡 Tip: Make sure backend server is running and Gemini API key is configured',
      ]);
    } finally {
      setIsFixing(false);
    }
  }, [activeFile, activeFileId]);

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-white">
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
            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm disabled:opacity-50"
          >
            {isRunning ? '⏳ Running...' : '▶ Run'}
          </button>

          <button
            onClick={handleFixCode}
            disabled={isFixing || isRunning}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm disabled:opacity-50 flex items-center gap-1"
          >
            {isFixing ? '🔍 Analyzing...' : '🔧 Fix Code'}
          </button>
          
          {activeFile?.language === 'html' && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              {showPreview ? '📝 Code' : '👁 Preview'}
            </button>
          )}
          
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm"
          >
            + New File
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <aside className="w-60 bg-[#252526] border-r border-[#3e3e42] overflow-auto">
          <div className="p-2">
            <div className="text-xs text-slate-400 uppercase mb-2 px-2">Files</div>
            {files.map(file => (
              <div
                key={file.id}
                className={`group flex items-center justify-between px-3 py-2 rounded cursor-pointer ${
                  activeFileId === file.id ? 'bg-[#37373d]' : 'hover:bg-[#2a2d2e]'
                }`}
                onClick={() => setActiveFileId(file.id)}
              >
                <span className="text-sm truncate">{file.name}</span>
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
        <main className="flex-1 flex flex-col min-w-0">
          {/* Editor/Preview */}
          <div className="flex-1 min-h-0">
            {showPreview && activeFile?.language === 'html' ? (
              <iframe
                srcDoc={activeFile.content}
                className="w-full h-full bg-white"
                title="Preview"
                sandbox="allow-scripts"
              />
            ) : (
              <div className={`h-full ${codeUpdated ? 'animate-pulse bg-green-900/20' : ''} transition-all duration-500`}>
                <Editor
                  height="100%"
                  language={activeFile?.language || 'plaintext'}
                  value={activeFile?.content || ''}
                  onChange={handleEditorChange}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                    wordWrap: 'on',
                    automaticLayout: true,
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
    </div>
  );
}
