import { useState, useEffect } from 'react';
import { adminGetAnalytics, adminGetQueryLogs } from '../services/api';
import {
  LuChartBar, LuTrendingUp, LuMessageSquare, LuCircleHelp,
  LuSearch, LuClock, LuRefreshCw, LuCalendar, LuActivity,
  LuCircleCheck, LuCircleX, LuTriangleAlert
} from 'react-icons/lu';

function MiniBar({ value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div className="progress" style={{ flex: 1 }}>
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-2)', width: 28, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function StatusIcon({ status }) {
  if (status === 'answer')  return <LuCircleCheck  size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />;
  if (status === 'clarify') return <LuTriangleAlert size={14} style={{ color: 'var(--warning)', flexShrink: 0 }} />;
  return <LuCircleX size={14} style={{ color: 'var(--danger)', flexShrink: 0 }} />;
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [logs, setLogs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [search, setSearch]       = useState('');
  const [period, setPeriod]       = useState('7d');

  const load = async () => {
    setLoading(true);
    setLogsLoading(true);
    try {
      const [a, l] = await Promise.all([
        adminGetAnalytics({ period }),
        adminGetQueryLogs({ limit: 100, period })
      ]);
      setAnalytics(a);
      setLogs(l.items || l.logs || []);
    } catch { /* silent */ }
    finally { setLoading(false); setLogsLoading(false); }
  };

  useEffect(() => { load(); }, [period]);

  const filteredLogs = logs.filter(l =>
    !search || (l.originalQuery || '').toLowerCase().includes(search.toLowerCase())
  );

  // Action breakdown from backend
  const actionMap = analytics?.actionDistribution || {};

  // Category breakdown from backend
  const topCategories = (analytics?.categoryDistribution || []).slice(0, 8).map(c => [c._id || 'Unknown', c.count]);
  const maxCat = topCategories[0]?.[1] || 1;

  const metricCards = [
    {
      label: 'Total Queries', icon: LuMessageSquare,
      value: analytics?.totalQueries ?? logs.length,
      color: '#4f46e5', bg: '#ede9fe'
    },
    {
      label: 'Avg. Confidence', icon: LuTrendingUp,
      value: analytics?.avgConfidence != null
        ? `${(analytics.avgConfidence * 100).toFixed(1)}%`
        : logs.length ? `${(logs.reduce((s,l)=>s+(l.confidence||0),0)/logs.length*100).toFixed(1)}%` : '—',
      color: '#059669', bg: '#d1fae5'
    },
    {
      label: 'Answered', icon: LuCircleCheck,
      value: actionMap['answer'] ?? '—', color: '#059669', bg: '#d1fae5'
    },
    {
      label: 'Clarifications', icon: LuCircleX,
      value: actionMap['clarify'] ?? '—', color: '#d97706', bg: '#fef3c7'
    },
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1>Analytics</h1>
          <p>Query trends, category breakdown, and performance metrics</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Period picker */}
          <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            {['7d','30d','90d'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                style={{
                  padding: '7px 14px', border: 'none', cursor: 'pointer',
                  fontSize: '0.8125rem', fontWeight: 600,
                  background: period === p ? 'var(--primary)' : 'transparent',
                  color: period === p ? '#fff' : 'var(--text-2)',
                  transition: 'all 0.15s'
                }}>{p}</button>
            ))}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <LuRefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Metric cards */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 120 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
          {metricCards.map((c, i) => (
            <div key={i} className="stat-card fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="stat-card-icon" style={{ background: c.bg }}>
                <c.icon size={20} style={{ color: c.color }} />
              </div>
              <div className="stat-card-label">{c.label}</div>
              <div className="stat-card-value" style={{ color: c.color, fontSize: '1.75rem' }}>{c.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Two-col: Category breakdown + Action breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Category breakdown */}
        <div className="card fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="card-header">
            <div className="card-title"><LuChartBar size={16} style={{ color: 'var(--primary)' }} /> Top Categories</div>
          </div>
          <div className="card-body">
            {topCategories.length === 0 ? (
              <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>No data yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {topCategories.map(([cat, count]) => (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-1)' }}>{cat}</span>
                    </div>
                    <MiniBar value={count} max={maxCat} color="var(--primary)" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action breakdown */}
        <div className="card fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="card-header">
            <div className="card-title"><LuActivity size={16} style={{ color: 'var(--primary)' }} /> Response Actions</div>
          </div>
          <div className="card-body">
            {Object.keys(actionMap).length === 0 ? (
              <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>No data yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {Object.entries(actionMap).map(([action, count]) => {
                  const colors = {
                    answer:  { color: 'var(--success)', bg: 'var(--success-light)', label: 'Answered' },
                    clarify: { color: 'var(--warning)', bg: 'var(--warning-light)', label: 'Clarification' },
                    reject:  { color: 'var(--danger)',  bg: 'var(--danger-light)',  label: 'Out of Scope' },
                  };
                  const c = colors[action] || { color: 'var(--text-2)', bg: '#f1f5f9', label: action };
                  const totalQ = analytics?.totalQueries || 1;
                  const pct = Math.round((count / totalQ) * 100);
                  return (
                    <div key={action}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, display: 'inline-block' }} />
                          {c.label}
                        </span>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: c.color }}>{pct}%</span>
                      </div>
                      <div className="progress">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: c.color }} />
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 4 }}>{count} queries</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full query log */}
      <div className="card fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="card-header">
          <div className="card-title">
            <LuClock size={16} style={{ color: 'var(--primary)' }} />
            Full Query Log
          </div>
          <span className="badge badge-primary">{filteredLogs.length} entries</span>
        </div>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <div className="search-wrap">
            <LuSearch size={15} />
            <input className="input" placeholder="Filter by query text…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {logsLoading ? (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 44 }} />)}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><LuSearch size={22} /></div>
            <h3>No results</h3>
            <p>Try a different search term or wait for queries.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Query</th>
                  <th>Category</th>
                  <th>Action</th>
                  <th>Confidence</th>
                  <th style={{ textAlign: 'right' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log._id}>
                    <td style={{ maxWidth: 300 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <StatusIcon status={log.actionTaken} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500, color: 'var(--text-1)' }}>
                          {log.originalQuery}
                        </span>
                      </div>
                    </td>
                    <td>
                      {log.category
                        ? <span className="badge badge-violet">{log.category}</span>
                        : <span className="text-muted">—</span>}
                    </td>
                    <td>
                      <span className={`badge ${
                        log.actionTaken === 'answer' ? 'badge-success' :
                        log.actionTaken === 'clarify' ? 'badge-warning' : 'badge-danger'
                      }`}>{log.actionTaken || '—'}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress" style={{ width: 56 }}>
                          <div className="progress-fill" style={{
                            width: `${(log.confidence||0)*100}%`,
                            background: log.confidence>0.7?'var(--success)':log.confidence>0.4?'var(--warning)':'var(--danger)'
                          }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-2)' }}>
                          {((log.confidence||0)*100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
