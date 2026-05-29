import { useState } from 'react';
import api from '../api/client';

export default function AnswerForm({ questionId, onAnswered }) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.trim().length < 20) return;

    setSubmitting(true);
    setMessage(null);
    try {
      const res = await api.post('/answers/submit', {
        question_id: questionId,
        content: content.trim(),
      });

      setMessage({
        type: res.data.status === 'live' ? 'success' : 'info',
        text: res.data.message,
      });
      setContent('');
      if (onAnswered) onAnswered(res.data);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to submit answer.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginTop: '1.5rem' }}>
      <h3 className="card-title" style={{ marginBottom: '1rem' }}>✍️ Write Your Answer</h3>

      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="form-group">
        <textarea
          className="form-textarea"
          placeholder="Share your knowledge... (min 20 characters)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          maxLength={1000}
        />
        <div className="form-hint" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{content.trim().length < 20 ? `${20 - content.trim().length} more chars needed` : '✓ Ready'}</span>
          <span>{content.length} / 1000</span>
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={submitting || content.trim().length < 20}
        style={{ width: '100%' }}
      >
        {submitting ? <><div className="spinner" /> Checking & posting...</> : '📤 Submit Answer'}
      </button>
    </form>
  );
}
