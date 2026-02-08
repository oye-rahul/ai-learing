import React, { useState, useEffect } from 'react';
import { snippetsAPI } from '../services/api';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import Modal from '../components/shared/Modal';
import { toast } from 'react-toastify';

interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  tags: string[];
  ai_explanation?: string;
  created_at: string;
}

const SnippetsPage: React.FC = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Snippet | null>(null);
  const [form, setForm] = useState({ title: '', code: '', language: 'javascript', tags: '' });

  const fetchSnippets = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { search?: string; language?: string } = {};
      if (search.trim()) params.search = search.trim();
      if (language) params.language = language;
      const res = await snippetsAPI.list(params);
      const data = res?.data ?? {};
      const list = Array.isArray(data.snippets) ? data.snippets : [];
      setSnippets(list.map((s: any) => ({
        ...s,
        tags: typeof s.tags === 'string' ? (() => { try { return JSON.parse(s.tags || '[]'); } catch { return []; } })() : (s.tags || []),
      })));
    } catch (err: any) {
      const status = err.response?.status;
      const data = err.response?.data || {};
      let message = data.message || data.error || err.message || 'Failed to load snippets';
      if (status === 404) {
        message = 'Snippets API not found (404). Start the backend: open a terminal, cd into the backend folder, run npm start, then refresh this page.';
        if (data.hint) message += ` ${data.hint}`;
      }
      setError(message);
      toast.error(message);
      setSnippets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnippets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, language]);

  const handleSave = async () => {
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    try {
      if (editing) {
        await snippetsAPI.update(editing.id, { title: form.title, code: form.code, language: form.language, tags });
        toast.success('Snippet updated');
      } else {
        await snippetsAPI.create({ title: form.title, code: form.code, language: form.language, tags });
        toast.success('Snippet saved');
      }
      setModalOpen(false);
      setEditing(null);
      setForm({ title: '', code: '', language: 'javascript', tags: '' });
      fetchSnippets();
    } catch (_) {
      toast.error('Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this snippet?')) return;
    try {
      await snippetsAPI.delete(id);
      toast.success('Snippet deleted');
      fetchSnippets();
    } catch (_) {
      toast.error('Failed to delete');
    }
  };

  const openEdit = (s: Snippet) => {
    setEditing(s);
    setForm({
      title: s.title,
      code: s.code,
      language: s.language,
      tags: Array.isArray(s.tags) ? s.tags.join(', ') : '',
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Code Snippets</h1>
        <Button onClick={() => { setEditing(null); setForm({ title: '', code: '', language: 'javascript', tags: '' }); setModalOpen(true); }}>
          + New snippet
        </Button>
      </div>
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Search snippets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2"
        >
          <option value="">All languages</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="typescript">TypeScript</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
        </select>
      </div>
      {error && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Make sure the backend is running: open a terminal, go to the <strong>backend</strong> folder, run <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">npm start</code>, then refresh. You must be logged in.</p>
        </Card>
      )}
      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : !error && snippets.length === 0 ? (
        <Card>
          <p className="text-slate-600 dark:text-slate-400 text-center py-8">
            No snippets yet. Save code from the Playground or add one above.
          </p>
        </Card>
      ) : !error ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {snippets.map((s) => (
            <Card key={s.id} className="flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-slate-900 dark:text-white truncate">{s.title}</h3>
                <span className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-600 rounded">{s.language}</span>
              </div>
              <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded overflow-x-auto flex-1 max-h-32 overflow-y-auto">
                {(s.code || '').slice(0, 200)}{(s.code || '').length > 200 ? '...' : ''}
              </pre>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="secondary" onClick={() => openEdit(s)}>Edit</Button>
                <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(s.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit snippet' : 'New snippet'}>
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Snippet name" />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Code</label>
            <textarea
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              rows={8}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-sm p-3"
              placeholder="Paste your code"
            />
          </div>
          <div className="flex gap-4">
            <Input label="Language" value={form.language} onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))} placeholder="e.g. javascript" />
            <Input label="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="react, hooks" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SnippetsPage;
