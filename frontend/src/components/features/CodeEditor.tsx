import React from 'react';
import Editor from '@monaco-editor/react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height?: string;
  readOnly?: boolean;
  className?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  height = '400px',
  readOnly = false,
  className = '',
}) => {
  const { theme } = useSelector((state: RootState) => state.ui);

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on' as const,
    roundedSelection: true,
    scrollBeyondLastLine: false,
    readOnly,
    automaticLayout: true,
    tabSize: 2,
    insertSpaces: true,
    wordWrap: 'on' as const,
    lineHeight: 1.5,
    fontFamily: 'JetBrains Mono, Fira Code, Monaco, Consolas, monospace',
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: 'on' as const,
    quickSuggestions: true,
    parameterHints: { enabled: true },
    formatOnPaste: true,
    formatOnType: true,
    padding: { top: 16, bottom: 16 }
  };

  return (
    <div
      className={`relative border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950 ${className}`}
      style={{ height }}
    >
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={handleEditorChange}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        options={editorOptions}
        loading={
          <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-900">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 border-2 border-indigo-200 dark:border-indigo-900 rounded-full"></div>
              <div className="absolute inset-0 border-2 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default CodeEditor;
