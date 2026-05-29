import { useAuth } from '../context/AuthContext';
import { FaStar, FaCommentDots, FaQuestionCircle } from 'react-icons/fa';

export default function UserProfile() {
  const { user } = useAuth();
  if (!user) return null;

  const stats = [
    { label: 'SP', value: user.xp || 0, icon: <FaStar />, color: 'var(--accent-warning)' },
    { label: 'Answers', value: user.answers_count || 0, icon: <FaCommentDots />, color: 'var(--accent-success)' },
    { label: 'Questions', value: user.questions_count || 0, icon: <FaQuestionCircle />, color: 'var(--accent-secondary)' },
  ];

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="card fade-in" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem' }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>{user.name}</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{user.email}</p>
          <span className="badge badge-primary" style={{ fontSize: '0.8rem' }}>{user.role}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
          {stats.map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{s.icon}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
