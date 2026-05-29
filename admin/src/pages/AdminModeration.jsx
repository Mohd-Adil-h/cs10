import { useState, useEffect } from 'react';
import {
  adminGetModeration, adminApproveSubmission, adminRejectSubmission, adminPromoteSubmission
} from '../services/api';
import {
  LuShieldCheck, LuCircleCheck, LuCircleX, LuRefreshCw,
  LuTriangleAlert, LuFlag, LuUser, LuCalendar
} from 'react-icons/lu';

function TabBtn({ active, onClick, children, count }) {
  return (
    <button onClick={onClick}
      style={{
        padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
        fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.15s',
        background: active ? 'var(--primary)' : 'transparent',
        color: active ? '#fff' : 'var(--text-2)',
        display: 'flex', alignItems: 'center', gap: 7,
      }}>
      {children}
      {count > 0 && (
        <span style={{
          background: active ? 'rgba(255,255,255,0.25)' : 'var(--danger-light)',
          color: active ? '#fff' : 'var(--danger)',
          borderRadius: 99, padding: '1px 7px', fontSize: '0.6875rem', fontWeight: 700
        }}>{count}</span>
      )}
    </button>
  );
}

export default function AdminModeration() {
  const [flagged, setFlagged] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [xpSettings, setXpSettings] = useState({});
  const [actionLoading, setActionLoading] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const f = await adminGetModeration();
      setFlagged(f.data || []);
    } catch (err) {
      showToast('Failed to load moderation queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const xp = xpSettings[id] || { answererXp: 25, askerXp: 15 };
      await adminApproveSubmission(id, xp);
      showToast('Answer approved and set to live!');
      load();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to approve', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await adminRejectSubmission(id);
      showToast('Answer rejected and hidden.');
      load();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to reject', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePromote = async (id) => {
    setActionLoading(id);
    try {
      const xp = xpSettings[id] || { answererXp: 25, askerXp: 15 };
      await adminPromoteSubmission(id, xp);
      showToast('Answer promoted to FAQ corpus!');
      load();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to promote', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      {toast && (
        <div className={`alert ${toast.type === 'error' ? 'alert-error' : 'alert-success'} fade-in`}
          style={{ position: 'fixed', top: 76, right: 24, zIndex: 200, width: 320, boxShadow: 'var(--shadow-lg)' }}>
          {toast.type === 'error' ? <LuTriangleAlert size={16} /> : <LuCircleCheck size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1>Moderation</h1>
          <p>Review flagged community answers requiring admin review</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <LuRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Tabs - only Flagged Answers */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 6, width: 'fit-content', boxShadow: 'var(--shadow-sm)' }}>
        <TabBtn active={true} onClick={() => {}} count={flagged.length}>
          <LuFlag size={15} /> Flagged Answers
        </TabBtn>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 180 }} />)}
        </div>
      ) : flagged.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><LuShieldCheck size={24} style={{ color: 'var(--success)' }} /></div>
            <h3>All clear!</h3>
            <p>No pending flagged answers to review.</p>
          </div>
        </div>
      ) : (
        flagged.map(a => {
          const xp = xpSettings[a._id] || { answererXp: 25, askerXp: 15 };
          const setXp = (key, val) => setXpSettings(p => ({ ...p, [a._id]: { ...xp, [key]: Number(val) } }));
          const busy = actionLoading === a._id;
          return (
            <div key={a._id} className="card fade-in" style={{ padding: '24px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="badge badge-primary">{a.question_id?.category || 'general'}</span>
                  {a.flag_reason && <span className="badge badge-danger">⚠️ {a.flag_reason}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <LuUser size={12} /> {a.answered_by?.name || 'Anonymous'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <LuCalendar size={12} /> {new Date(a.created_at).toLocaleDateString()}
                  </span>
                  <span className="badge badge-gray" style={{ marginLeft: 8 }}>
                    Score: {a.net_score || 0} ({a.upvotes || 0}▲ {a.downvotes || 0}▼)
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', marginBottom: 4 }}>QUESTION</p>
                <p style={{ fontSize: '1rem', fontWeight: 600 }}>{a.question_id?.rephrased_query || 'N/A'}</p>
                {a.question_id?.posted_by?.name && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginTop: 4 }}>
                    Asked by {a.question_id.posted_by.name}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', marginBottom: 4 }}>ANSWER</p>
                <div style={{ background: 'var(--surface-2)', padding: 16, borderRadius: 8, borderLeft: '3px solid var(--primary)' }}>
                  {a.content}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20, background: 'var(--surface-2)', padding: 16, borderRadius: 8 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600 }}>Answerer Reward</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{xp.answererXp} SP</span>
                  </div>
                  <input type="range" min="0" max="100" step="5" value={xp.answererXp} onChange={e => setXp('answererXp', e.target.value)} style={{ width: '100%' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600 }}>Asker Reward</span>
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>{xp.askerXp} SP</span>
                  </div>
                  <input type="range" min="0" max="100" step="5" value={xp.askerXp} onChange={e => setXp('askerXp', e.target.value)} style={{ width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="btn btn-danger" disabled={busy} onClick={() => handleReject(a._id)}>
                  <LuCircleX size={15} style={{ marginRight: 4 }} /> Reject & Hide
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary" disabled={busy} onClick={() => handleApprove(a._id)}>
                    <LuCircleCheck size={15} style={{ marginRight: 4 }} /> Approve & Live
                  </button>
                  <button className="btn btn-primary" disabled={busy} onClick={() => handlePromote(a._id)}>
                    <LuShieldCheck size={15} style={{ marginRight: 4 }} /> Promote to FAQ
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}