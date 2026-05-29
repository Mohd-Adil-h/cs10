import { useState, useEffect } from 'react';
import {
  adminGetFaqProposals, adminApproveFaqProposal, adminRejectFaqProposal,
  adminCreateMasterFaq, adminGetCommunityQuestions, adminDeleteCommunityQuestion,
  adminRunGlobalAiCluster
} from '../services/api';
import {
  LuCircleCheck, LuMessageSquare, LuUser, LuCalendar, LuRefreshCw,
  LuTriangleAlert, LuNetwork, LuSparkles, LuTrash2
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
          background: active ? 'rgba(255,255,255,0.25)' : 'var(--primary-light)',
          color: active ? '#fff' : 'var(--primary)',
          borderRadius: 99, padding: '1px 7px', fontSize: '0.6875rem', fontWeight: 700
        }}>{count}</span>
      )}
    </button>
  );
}

function AiProposalCard({ proposal, onMerge, onDiscard }) {
  const [busy, setBusy] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(proposal.masterQuestion);
  const [editedAnswer, setEditedAnswer] = useState(proposal.masterAnswer);

  const handleMerge = async () => {
    setBusy(true);
    try {
      await onMerge({
        questionIds: proposal.questionIds,
        masterQuestion: editedQuestion,
        masterAnswer: editedAnswer,
        category: proposal.category,
        tags: proposal.tags
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card fade-in" style={{ marginBottom: 16 }}>
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <LuSparkles size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-1)', fontWeight: 700, margin: 0 }}>
                {proposal.clusterTitle || 'AI Master Cluster'}
              </h3>
              <span className={`badge ${proposal.moderationStatus === 'auto_approve' ? 'badge-success' : 'badge-warning'}`}>
                {proposal.moderationStatus === 'auto_approve' ? 'Safe to Approve' : 'Needs Review'}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: 4 }}>
              <strong>Intent:</strong> {proposal.normalizedIntent || 'General Inquiry'}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>
              {proposal.shortSummary}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <span className="badge badge-primary"><LuNetwork size={11} style={{ marginRight: 4 }}/> AI Generated</span>
            {proposal.confidenceScore && (
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: proposal.confidenceScore >= 90 ? 'var(--success)' : 'var(--warning)' }}>
                {proposal.confidenceScore}% Confidence
              </span>
            )}
          </div>
        </div>

        {proposal.flaggedOrRepeated && proposal.flaggedOrRepeated.length > 0 && (
          <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--danger)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <LuTriangleAlert size={14} /> FLAGGED OR SPAM QUESTIONS IN CLUSTER
            </p>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.8rem', color: 'var(--danger)' }}>
              {proposal.flaggedOrRepeated.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 6 }}>
            {proposal.originalQuestions?.length || proposal.questionIds?.length || 0} SOURCE QUESTIONS
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {proposal.originalQuestions?.slice(0, 5).map(oq => (
              <span key={oq.id} style={{ fontSize: '0.75rem', background: 'var(--surface-2)', padding: '4px 8px', borderRadius: 4, color: 'var(--text-2)', border: '1px solid var(--border)' }}>
                "{oq.question.substring(0, 60)}{oq.question.length > 60 ? '...' : ''}"
              </span>
            ))}
            {proposal.originalQuestions?.length > 5 && <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', padding: '4px' }}>+{proposal.originalQuestions.length - 5} more</span>}
          </div>
        </div>

        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px', marginBottom: 16 }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 8 }}>PROPOSED MASTER FAQ</p>
          <input className="input" value={editedQuestion} onChange={e => setEditedQuestion(e.target.value)} style={{ marginBottom: 10, fontWeight: 600, fontSize: '0.95rem' }} />
          <textarea className="textarea" rows={4} value={editedAnswer} onChange={e => setEditedAnswer(e.target.value)} style={{ marginBottom: 10, fontSize: '0.9rem', lineHeight: 1.5 }} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className="badge badge-violet">{proposal.category}</span>
            {proposal.tags?.map(t => <span key={t} className="badge" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>{t}</span>)}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button disabled={busy} onClick={handleMerge} className="btn btn-success" style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' }}>
            <LuCircleCheck size={16} /> Approve & Add to Knowledge Base
          </button>
          <button disabled={busy} onClick={() => onDiscard(proposal)} className="btn btn-danger" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 20px' }}>
            <LuTrash2 size={16} /> Discard
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestionDeleteCard({ item, onDelete }) {
  const [busy, setBusy] = useState(false);
  const act = async () => {
    setBusy(true);
    try { await onDelete(item._id); }
    finally { setBusy(false); }
  };

  return (
    <div className="card fade-in" style={{ marginBottom: 10 }}>
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--danger-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <LuMessageSquare size={17} style={{ color: 'var(--danger)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-1)', lineHeight: 1.4 }}>
              {item.rephrased_query || item.original_query}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <LuUser size={12} /> {item.posted_by?.name || 'Anonymous'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <LuCalendar size={12} />
                {new Date(item.created_at || item.createdAt).toLocaleString('en-IN', { month: 'short', day: 'numeric' })}
              </span>
              {item.net_score != null && (
                <span className="badge badge-gray">Score: {item.net_score}</span>
              )}
            </div>
          </div>
          <button disabled={busy} onClick={act} className="btn btn-danger btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <LuTrash2 size={15} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminKnowledgeReview() {
  const [tab, setTab] = useState('ai_master');
  const [aiProposals, setAiProposals] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [customGroqKey, setCustomGroqKey] = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const q = await adminGetCommunityQuestions({ limit: 100 });
      setAllQuestions(q.items || q.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleMergeProposal = async (payload) => {
    await adminCreateMasterFaq(payload);
    setAiProposals(prev => prev.filter(p => p.masterQuestion !== payload.masterQuestion));
    showToast('Master FAQ added to Knowledge Base!');
    load();
  };

  const handleDiscardProposal = (proposal) => {
    setAiProposals(prev => prev.filter(p => p !== proposal));
    showToast('Proposal discarded.');
  };

  const handleDeleteQuestion = async (id) => {
    await adminDeleteCommunityQuestion(id);
    showToast('Question deleted successfully!');
    load();
  };

  const handleGlobalAnalysis = async () => {
    setAnalyzing(true);
    setAiProposals([]);
    try {
      const data = await adminRunGlobalAiCluster(customGroqKey);
      if (data.success === false) {
        showToast(data.message || 'AI clustering failed.', 'error');
      } else {
        setAiProposals(data.proposals || []);
        showToast('Global community analysis complete!');
      }
    } catch (err) {
      showToast('Analysis failed or took too long.', 'error');
    } finally {
      setAnalyzing(false);
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
          <h1>Knowledge Review</h1>
          <p>AI clustering for Master FAQ generation and community question management</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <LuRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Tabs - AI Master Generator + All Questions (FAQ Proposals removed) */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 6, width: 'fit-content', boxShadow: 'var(--shadow-sm)' }}>
        <TabBtn active={tab === 'ai_master'} onClick={() => setTab('ai_master')} count={aiProposals.length}>
          <LuSparkles size={15} /> AI Master Generator
        </TabBtn>
        <TabBtn active={tab === 'all_questions'} onClick={() => setTab('all_questions')} count={allQuestions.length}>
          <LuMessageSquare size={15} /> All Questions
        </TabBtn>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 180 }} />)}
        </div>
      ) : tab === 'ai_master' ? (
        <div className="fade-in">
          <div style={{ marginBottom: 20, background: 'var(--surface-2)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <LuNetwork style={{ color: 'var(--primary)' }} /> Global AI Analysis
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginBottom: 16 }}>
              Scan all answered community questions, cluster by semantic meaning, and generate Master FAQ proposals.
            </p>
            <div style={{ marginBottom: 16 }}>
              <input
                type="password"
                placeholder="Optional: Custom Groq API Key"
                value={customGroqKey}
                onChange={(e) => setCustomGroqKey(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
              />
            </div>
            <button disabled={analyzing} onClick={handleGlobalAnalysis} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {analyzing ? <LuRefreshCw size={16} className="spin" /> : <LuSparkles size={16} />}
              {analyzing ? 'Analyzing Community...' : 'Cluster Using AI & Generate Master FAQs'}
            </button>
          </div>

          {aiProposals.length === 0 && !analyzing ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon"><LuSparkles size={24} style={{ color: 'var(--primary)' }} /></div>
                <h3>Ready to Analyze</h3>
                <p>Click the button above to run global AI clustering on community questions.</p>
              </div>
            </div>
          ) : (
            aiProposals.map((item, idx) => (
              <AiProposalCard key={idx} proposal={item}
                onMerge={handleMergeProposal} onDiscard={handleDiscardProposal} />
            ))
          )}
        </div>
      ) : (
        allQuestions.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon"><LuMessageSquare size={24} /></div>
              <h3>No questions</h3>
              <p>No community questions found.</p>
            </div>
          </div>
        ) : (
          allQuestions.map(item => (
            <QuestionDeleteCard key={item._id} item={item} onDelete={handleDeleteQuestion} />
          ))
        )
      )}
    </div>
  );
}