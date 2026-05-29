import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import faqService from '../services/faqService';

// Canonical 14 categories in display order with descriptions for tooltips
export const CANONICAL_CATEGORIES = [
  { id: 'about',      label: 'About the Internship',  description: 'Program overview, eligibility, selection, and opt-in process'     },
  { id: 'noc',        label: 'NOC',                    description: 'No Objection Certificate — signing, format, submission, verification' },
  { id: 'certificate',label: 'Certificate',             description: 'E-certificate, academic credit, university grades, resume usage'      },
  { id: 'rosetta',    label: 'Rosetta',                 description: 'Daily journal, thinking routines, AI usage policy, submission'       },
  { id: 'teams',      label: 'Teams',                   description: 'Team formation, size, member conflicts, WhatsApp groups'             },
  { id: 'projects',   label: 'Projects',                description: 'Phase 2–4 projects, mentor assignment, Bronze/Silver/Gold tiers'     },
  { id: 'vibe',       label: 'ViBe platform',           description: 'ViBe learning platform, video issues, bypass exam, coursework'       },
  { id: 'offer',      label: 'Offer letter',            description: 'Offer acceptance phrasing, appeals, deferring dates, deadlines'      },
  { id: 'yaksha',     label: 'Yaksha',                  description: 'Yaksha AI chatbot, asking questions, tags, escalation'             },
  { id: 'support',    label: 'Support channels',        description: 'WhatsApp groups, email support, escalation, response time'         },
  { id: 'completion', label: 'Completion',              description: 'Finishing the internship, dropping out mid-way, final submissions' },
  { id: 'policies',   label: 'Policies',                description: 'Attendance, leave, mandatory sessions, working hours, termination'  },
  { id: 'mentor',     label: 'Mentor',                  description: 'Mentor assignment, contact, responsibilities in each phase'        },
  { id: 'timeline',   label: 'Timeline',                description: 'Start/end dates, kickoff orientation, Zoom link, absolute deadlines' },
];

const CANONICAL_ORDER = CANONICAL_CATEGORIES.map(c => c.id);

export default function FAQBrowse() {
  const [faqData, setFaqData] = useState({});
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [hoveredTab, setHoveredTab] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [faqDataResult, secDataResult] = await Promise.all([
          faqService.listFaqs(),
          faqService.listSections(),
        ]);
        setFaqData(faqDataResult.sections || {});
        setTotal(faqDataResult.total || 0);
        setSections(secDataResult.sections || []);
      } catch (err) {
        console.error('Failed to fetch FAQs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set();
    Object.values(filteredFaqs).forEach((sec) => {
      sec.faqs.forEach((_, i) => allIds.add(`${sec.sectionId}-${i}`));
    });
    setExpandedIds(allIds);
  };

  const collapseAll = () => setExpandedIds(new Set());

  // Build filtered FAQ list
  const filteredFaqs = useMemo(() => {
    const result = {};
    const query = searchQuery.toLowerCase().trim();

    Object.entries(faqData).forEach(([sectionId, section]) => {
      if (activeSection && sectionId !== activeSection) return;

      const filtered = section.faqs.filter((faq) => {
        if (!query) return true;
        return (
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
        );
      });

      if (filtered.length > 0) {
        result[sectionId] = { ...section, faqs: filtered, sectionId };
      }
    });

    return result;
  }, [faqData, activeSection, searchQuery]);

  const filteredTotal = Object.values(filteredFaqs).reduce(
    (sum, sec) => sum + sec.faqs.length,
    0
  );

  // Build a lookup map of sectionId → canonical category info (for all 14 tabs)
  const canonicalLookup = useMemo(() => {
    const map = {};
    for (const cat of CANONICAL_CATEGORIES) {
      map[cat.id] = cat;
    }
    return map;
  }, []);

  // Merge API section counts with canonical tabs (ensures all 14 show even if 0 FAQs)
  const displayTabs = useMemo(() => {
    const countMap = {};
    for (const sec of sections) countMap[sec.id] = sec.count;

    return CANONICAL_CATEGORIES.map(cat => ({
      ...cat,
      count: countMap[cat.id] || 0,
    }));
  }, [sections]);

  if (loading) {
    return (
      <div className="page">
        <div className="container loading-center">
          <div className="spinner spinner-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <style>{`
        .faq-browse-header {
          margin-bottom: 2rem;
        }
        .faq-search-wrapper {
          position: relative;
          margin-bottom: 1.5rem;
        }
        .faq-search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.1rem;
          pointer-events: none;
          opacity: 0.5;
        }
        .faq-search-input {
          width: 100%;
          padding: 0.85rem 1rem 0.85rem 2.75rem;
          font-family: inherit;
          font-size: 1rem;
          color: var(--text-primary);
          background: var(--bg-glass);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          transition: all var(--transition-fast);
          outline: none;
          backdrop-filter: blur(8px);
        }
        .faq-search-input:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
        .faq-search-input::placeholder {
          color: var(--text-muted);
        }
        .faq-section-tabs {
          display: flex;
          gap: 0.4rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
          margin-bottom: 1.5rem;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }
        .faq-section-tabs::-webkit-scrollbar {
          height: 4px;
        }
        .faq-section-tabs::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        .faq-tab {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          font-family: inherit;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-secondary);
          background: var(--bg-glass);
          border: 1px solid var(--border-color);
          border-radius: 100px;
          cursor: pointer;
          transition: all var(--transition-fast);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .faq-tab:hover {
          color: var(--text-primary);
          border-color: var(--border-active);
          background: var(--bg-glass-hover);
        }
        .faq-tab.active {
          background: var(--gradient-primary);
          color: white;
          border-color: transparent;
        }
        .faq-tab-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 1.4rem;
          height: 1.4rem;
          font-size: 0.7rem;
          font-weight: 700;
          background: rgba(255,255,255,0.15);
          border-radius: 100px;
          padding: 0 0.35rem;
        }
        .faq-tab.active .faq-tab-count {
          background: rgba(255,255,255,0.25);
        }
        .faq-tab-empty {
          opacity: 0.55;
        }
        .faq-tab-tooltip {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background: var(--bg-card);
          border: 1px solid var(--border-active);
          border-radius: var(--radius-sm);
          padding: 0.5rem 0.75rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
          white-space: nowrap;
          max-width: 280px;
          white-space: normal;
          z-index: 100;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          pointer-events: none;
        }
        .faq-section-tabs {
          position: relative;
        .faq-section-group {
          margin-bottom: 2rem;
          animation: slideUp var(--transition-slow) ease forwards;
        }
        .faq-section-group[data-empty] {
          display: none;
        }
        .faq-section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-color);
        }
        .faq-section-title h2 {
          font-size: 1.15rem;
          font-weight: 700;
          background: var(--gradient-accent);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .faq-item {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          margin-bottom: 0.5rem;
          overflow: hidden;
          transition: all var(--transition-base);
          backdrop-filter: blur(8px);
        }
        .faq-item:hover {
          border-color: var(--border-active);
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.08);
        }
        .faq-item-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          cursor: pointer;
          user-select: none;
          transition: background var(--transition-fast);
        }
        .faq-item-header:hover {
          background: var(--bg-glass-hover);
        }
        .faq-chevron {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          font-size: 0.7rem;
          color: var(--accent-primary-light);
          transition: transform var(--transition-base);
          flex-shrink: 0;
        }
        .faq-chevron.expanded {
          transform: rotate(90deg);
        }
        .faq-item-question {
          flex: 1;
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-primary);
          line-height: 1.5;
        }
        .faq-item-body {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                      padding 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .faq-item-body.expanded {
          max-height: 600px;
        }
        .faq-item-answer {
          padding: 0 1.25rem 1.25rem 3.25rem;
          font-size: 0.92rem;
          line-height: 1.8;
          color: var(--text-secondary);
          white-space: pre-line;
        }
        .faq-stats-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .faq-result-count {
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .faq-actions {
          display: flex;
          gap: 0.5rem;
        }
        @media (max-width: 768px) {
          .faq-item-answer {
            padding-left: 1.25rem;
          }
          .faq-stats-bar {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="container">
        {/* Header */}
        <div className="faq-browse-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 800,
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '0.25rem',
              }}>
                📚 Browse FAQs
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                {total} frequently asked questions across {sections.length} categories
              </p>
            </div>
            <Link to="/faq" className="btn btn-primary btn-sm">⚡ Ask Yaksha</Link>
          </div>

          {/* Search */}
          <div className="faq-search-wrapper">
            <span className="faq-search-icon">🔍</span>
            <input
              type="text"
              className="faq-search-input"
              placeholder="Search FAQs by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Section Tabs */}
          <div className="faq-section-tabs">
            <button
              className={`faq-tab ${!activeSection ? 'active' : ''}`}
              onClick={() => setActiveSection(null)}
            >
              All
              <span className="faq-tab-count">{total}</span>
            </button>
            {displayTabs.map((tab) => (
              <button
                key={tab.id}
                className={`faq-tab ${activeSection === tab.id ? 'active' : ''} ${tab.count === 0 ? 'faq-tab-empty' : ''}`}
                onClick={() => setActiveSection(activeSection === tab.id ? null : tab.id)}
                onMouseEnter={() => setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
                title={tab.description}
              >
                {tab.label}
                <span className="faq-tab-count">{tab.count}</span>
              </button>
            ))}
            {hoveredTab && (
              <div className="faq-tab-tooltip">
                {canonicalLookup[hoveredTab]?.description}
              </div>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="faq-stats-bar">
          <span className="faq-result-count">
            {searchQuery || activeSection
              ? `Showing ${filteredTotal} of ${total} FAQs`
              : `${total} FAQs`}
          </span>
          <div className="faq-actions">
            <button className="btn btn-sm btn-secondary" onClick={expandAll}>
              Expand All
            </button>
            <button className="btn btn-sm btn-secondary" onClick={collapseAll}>
              Collapse All
            </button>
          </div>
        </div>

        {/* FAQ Sections — rendered in canonical category order */}
        {(() => {
          const visible = CANONICAL_ORDER
            .map(id => filteredFaqs[id])
            .filter(Boolean);

          if (visible.length === 0) {
            return (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <div className="empty-state-text">No FAQs match your search</div>
                <p style={{ color: 'var(--text-muted)' }}>
                  Try different keywords or{' '}
                  <Link to="/faq" style={{ color: 'var(--accent-primary-light)' }}>
                    ask Yaksha directly
                  </Link>
                </p>
              </div>
            );
          }

          return visible.map((section) => (
            <div key={section.id} className="faq-section-group">
              <div className="faq-section-title">
                <h2>{section.label}</h2>
                <span className="badge badge-info">{section.faqs.length}</span>
              </div>

              {section.faqs.map((faq, i) => {
                const itemId = `${section.id}-${i}`;
                const isExpanded = expandedIds.has(itemId);

                return (
                  <div key={itemId} className="faq-item">
                    <div
                      className="faq-item-header"
                      onClick={() => toggleExpand(itemId)}
                    >
                      <span className={`faq-chevron ${isExpanded ? 'expanded' : ''}`}>
                        ▸
                      </span>
                      <span className="faq-item-question">{faq.question}</span>
                    </div>
                    <div className={`faq-item-body ${isExpanded ? 'expanded' : ''}`}>
                      <div className="faq-item-answer">{faq.answer}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ));
        })()}

        {/* Bottom CTA */}
        <div style={{
          textAlign: 'center',
          padding: '2.5rem 1rem',
          marginTop: '1rem',
        }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.95rem' }}>
            Can't find what you're looking for?
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/faq" className="btn btn-primary">⚡ Ask Yaksha</Link>
            <Link to="/faq/community" className="btn btn-secondary">💬 Community Board</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
