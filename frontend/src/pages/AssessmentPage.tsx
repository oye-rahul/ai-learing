import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { learningAPI } from '../services/api';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import { toast } from 'react-toastify';

interface Question {
  id: string;
  question: string;
  options: string[];
}

const AssessmentPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    level: string;
    recommended_modules: { id: string; title: string; description: string }[];
  } | null>(null);

  useEffect(() => {
    learningAPI.getAssessmentQuestions()
      .then((res) => setQuestions(res.data.questions || []))
      .catch(() => toast.error('Failed to load assessment'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    const answerList = questions.map((q) => ({
      questionId: q.id,
      optionIndex: answers[q.id] ?? 0,
    }));
    if (answerList.some((a) => a.optionIndex === undefined)) {
      toast.error('Please answer all questions');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await learningAPI.submitAssessment(answerList);
      setResult({
        level: data.level,
        recommended_modules: data.recommended_modules || [],
      });
      toast.success('Assessment complete!');
    } catch (_) {
      toast.error('Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card><p className="text-center text-slate-500">Loading assessment...</p></Card>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your level</h2>
          <p className="text-lg capitalize text-primary-600 dark:text-primary-400 font-medium">{result.level}</p>
          <p className="text-slate-600 dark:text-slate-400 mt-4">Recommended modules to start with:</p>
          <ul className="mt-2 space-y-2">
            {result.recommended_modules.map((m) => (
              <li key={m.id}>
                <Link
                  to="/learn"
                  className="block p-3 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-900 dark:text-white"
                >
                  <span className="font-medium">{m.title}</span>
                  {m.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{m.description}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/learn" className="inline-block mt-6">
            <Button>Go to Learning</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Skill assessment</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Answer a few questions so we can recommend the right modules for you.
        </p>
        <div className="space-y-6">
          {questions.map((q) => (
            <div key={q.id}>
              <p className="font-medium text-slate-900 dark:text-white mb-2">{q.question}</p>
              <div className="space-y-2">
                {q.options.map((opt, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      answers[q.id] === idx
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === idx}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: idx }))}
                      className="mr-3"
                    />
                    <span className="text-slate-700 dark:text-slate-300">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Button className="mt-6 w-full" onClick={handleSubmit} loading={submitting}>
          Get my recommendations
        </Button>
      </Card>
    </div>
  );
};

export default AssessmentPage;
