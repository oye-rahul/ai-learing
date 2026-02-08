import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/shared/Card';

const SharePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ type: string; resource: any } | null>(null);

  useEffect(() => {
    if (!slug) {
      setError('Invalid link');
      setLoading(false);
      return;
    }
    api.get(`/share/${slug}`)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Link not found or expired');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md text-center">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Unable to load</h1>
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
        </Card>
      </div>
    );
  }

  const r = data.resource;
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {data.type === 'project' ? 'Shared project' : 'Shared snippet'}: {r.title}
            </h1>
            {r.language && (
              <span className="px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded text-sm">{r.language}</span>
            )}
          </div>
          {r.description && (
            <p className="text-slate-600 dark:text-slate-400 mb-4">{r.description}</p>
          )}
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap">
            {r.code}
          </pre>
          {r.ai_explanation && (
            <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Explanation</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{r.ai_explanation}</p>
            </div>
          )}
          <p className="mt-4 text-xs text-slate-500">
            Shared from AI Learnixo · View-only
          </p>
        </Card>
      </div>
    </div>
  );
};

export default SharePage;
