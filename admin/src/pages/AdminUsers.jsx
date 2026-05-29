import { useState, useEffect } from 'react';
import { adminGetUsers, adminAdjustUserSp, adminGetSpLedger } from '../services/api';
import { LuUsers, LuSearch, LuStar, LuTrophy, LuRefreshCw, LuBook, LuCalendar } from 'react-icons/lu';

function TabBtn({ active, onClick, children }) {
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
    </button>
  );
}

export default function AdminUsers() {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [adjustingId, setAdjustingId] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'users') {
        const res = await adminGetUsers();
        setUsers(res.data || []);
      } else {
        const res = await adminGetSpLedger();
        setLedger(res.items || res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tab]);

  const handleAdjustSp = async (e, id, name) => {
    e.preventDefault();
    const amount = Number(adjustAmount);
    if (!amount || isNaN(amount)) return alert('Please enter a valid amount');
    if (!window.confirm(`Adjust ${name}'s SP by ${amount}?`)) return;

    try {
      await adminAdjustUserSp(id, amount);
      setAdjustingId(null);
      setAdjustAmount('');
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to adjust SP');
    }
  };

  const filtered = users.filter(u => 
    !search || 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1>Users & SP Management</h1>
          <p>View community members and adjust their Skill Points</p>
        </div>
        <button className="btn btn-secondary" onClick={loadData}>
          <LuRefreshCw size={16} /> Refresh
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 6, width: 'fit-content', boxShadow: 'var(--shadow-sm)' }}>
        <TabBtn active={tab === 'users'} onClick={() => setTab('users')}>
          <LuUsers size={15} /> Users
        </TabBtn>
        <TabBtn active={tab === 'ledger'} onClick={() => setTab('ledger')}>
          <LuBook size={15} /> SP Ledger
        </TabBtn>
      </div>

      <div className="card fade-in">
        <div className="card-header">
          <div className="card-title">
            {tab === 'users' ? <><LuUsers size={16} style={{ color: 'var(--primary)' }} /> Community Users</> : <><LuBook size={16} style={{ color: 'var(--primary)' }} /> SP Transactions</>}
          </div>
          <span className="badge badge-primary">{tab === 'users' ? filtered.length : ledger.length} total</span>
        </div>
        
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <div className="search-wrap" style={{ maxWidth: 300 }}>
            <LuSearch size={15} className="search-icon" />
            <input 
              className="input" 
              placeholder="Search by name or email…"
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div className="spinner spinner-lg"></div>
          </div>
        ) : tab === 'users' ? (
          filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><LuUsers size={24} /></div>
              <h3>No users found</h3>
              <p>Try adjusting your search query.</p>
            </div>
          ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Activity</th>
                  <th>Balance</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{u.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'answerer' ? 'badge-success' : 'badge-primary'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 12, fontSize: '0.8125rem', color: 'var(--text-2)' }}>
                        <span title="Answers given">A: {u.answers_count || 0}</span>
                        <span title="Questions asked">Q: {u.questions_count || 0}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#ca8a04' }}>
                        <LuStar size={14} />
                        {u.xp || 0} SP
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {adjustingId === u._id ? (
                        <form onSubmit={(e) => handleAdjustSp(e, u._id, u.name)} style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                          <input 
                            type="number" 
                            className="input" 
                            style={{ width: 80, padding: '4px 8px', fontSize: '0.8125rem' }} 
                            placeholder="+/- 0"
                            value={adjustAmount}
                            onChange={e => setAdjustAmount(e.target.value)}
                            autoFocus
                          />
                          <button type="submit" className="btn btn-sm btn-primary">Save</button>
                          <button type="button" className="btn btn-sm btn-secondary" onClick={() => setAdjustingId(null)}>Cancel</button>
                        </form>
                      ) : (
                        <button className="btn btn-sm btn-secondary" onClick={() => { setAdjustingId(u._id); setAdjustAmount(''); }}>
                          <LuTrophy size={14} /> Adjust SP
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
          ledger.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><LuBook size={24} /></div>
              <h3>No transactions</h3>
              <p>No SP adjustments found.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>User</th>
                    <th>Admin</th>
                    <th>Change</th>
                    <th>Reason</th>
                    <th>New Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map(l => (
                    <tr key={l._id}>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-2)' }}>
                        {l.created_at ? new Date(l.created_at).toLocaleString() : 'N/A'}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{l.user?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{l.user?.email}</div>
                      </td>
                      <td style={{ fontSize: '0.8125rem' }}>{l.admin?.email || 'System'}</td>
                      <td>
                        <span className={`badge ${l.amount > 0 ? 'badge-success' : 'badge-danger'}`}>
                          {l.amount > 0 ? '+' : ''}{l.amount} SP
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{l.reason || 'No reason'}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{l.new_balance ?? 'N/A'} SP</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
