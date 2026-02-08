import React, { useState, useEffect, useCallback } from 'react';
import CodeEditor from './CodeEditor';
import { toast } from 'react-toastify';
import api from '../../services/api';

interface ProjectEditorProps {
  project: {
    id: string;
    title: string;
    description: string;
    language: string;
    code?: string;
  };
  onBack: () => void;
}

// Default code templates for different languages
const getDefaultCode = (language: string): string => {
  const templates: Record<string, string> = {
    javascript: '// JavaScript Code\nconsole.log("Hello, World!");',
    python: '# Python Code\nprint("Hello, World!")',
    java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
    c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
    html: '<!DOCTYPE html>\n<html>\n<head>\n    <title>My Project</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>',
  };
  return templates[language.toLowerCase()] || `// ${language} code\n`;
};

const ProjectEditor: React.FC<ProjectEditorProps> = ({ project, onBack }) => {
  const [code, setCode] = useState(project.code || getDefaultCode(project.language));
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      console.log('Saving project:', project.id, 'with code length:', code.length);
      const response = await api.put(`/projects/${project.id}`, { code });
      console.log('Save response:', response.data);
      setHasUnsavedChanges(false);
      toast.success('Project saved successfully!');
    } catch (error: any) {
      console.error('Save error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to save project');
    } finally {
      setIsSaving(false);
    }
  }, [project.id, code]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Auto-save every 30 seconds if there are unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(() => {
      console.log('Auto-saving project...');
      handleSave();
    }, 30000); // 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [hasUnsavedChanges, handleSave]);

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      setHasUnsavedChanges(true);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-white">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 bg-[#2d2d30] border-b border-[#3e3e42]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (hasUnsavedChanges) {
                if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                  onBack();
                }
              } else {
                onBack();
              }
            }}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← Back to Projec
ts
          </button>
          <div>
            <h2 className="text-lg font-semibold">{project.title}</h2>
            <p className="text-xs text-slate-400">{project.language}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                {hasUnsavedChanges ? 'Save' : 'Saved'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <CodeEditor
          value={code}
          onChange={handleCodeChange}
          language={project.language}
          height="100%"
        />
      </div>
    </div>
  );
};

export default ProjectEditor;
