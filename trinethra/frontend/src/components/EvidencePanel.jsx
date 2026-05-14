import React, { useState } from 'react';

const SIGNAL_MAP = {
  positive: { label: 'Positive', cls: 'badge-pos', dot: '#34c98a' },
  negative: { label: 'Negative', cls: 'badge-neg', dot: '#f05c5c' },
  neutral: { label: 'Neutral', cls: 'badge-neu', dot: '#6b8ccc' }
};

const DIM_MAP = {
  execution: { label: 'Execution', icon: '⚡' },
  systems_building: { label: 'Systems', icon: '🔧' },
  kpi_impact: { label: 'KPI Impact', icon: '📈' },
  change_management: { label: 'Change Mgmt', icon: '🤝' }
};

const LAYER_MAP = {
  layer1: { label: 'Layer 1 — Task Execution', color: '#e8b84b' },
  layer2: { label: 'Layer 2 — Systems Building', color: '#34c98a' }
};

export default function EvidencePanel({ evidence }) {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState({});

  if (!evidence || evidence.length === 0) {
    return <div style={{ color: 'var(--ink-3)', fontSize: '13px', padding: '20px 0', textAlign: 'center' }}>No evidence extracted.</div>;
  }

  const filters = ['all', 'positive', 'negative', 'neutral'];
  const filtered = filter === 'all' ? evidence : evidence.filter(e => e.signal === filter);

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div>
      {/* Filter row */}
      <div className="flex gap-2" style={{ marginBottom: '16px', flexWrap: 'wrap' }}>
        {filters.map(f => {
          const count = f === 'all' ? evidence.length : evidence.filter(e => e.signal === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="btn-ghost"
              style={{
                fontSize: '11px',
                ...(filter === f ? {
                  background: 'var(--bg-hover)',
                  color: 'var(--ink-1)',
                  borderColor: 'var(--border-glow)'
                } : {})
              }}
            >
              {f === 'all' ? 'All' : SIGNAL_MAP[f]?.label}
              <span style={{
                marginLeft: '4px', padding: '1px 7px', borderRadius: '10px', fontSize: '10px',
                background: filter === f ? 'var(--accent-gold-dim)' : 'transparent',
                color: filter === f ? 'var(--accent-gold)' : 'var(--ink-3)'
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Evidence cards */}
      <div className="flex flex-col gap-3 stagger">
        {filtered.map((ev, i) => {
          const sig = SIGNAL_MAP[ev.signal] || SIGNAL_MAP.neutral;
          const dim = DIM_MAP[ev.dimension] || { label: ev.dimension, icon: '•' };
          const layer = LAYER_MAP[ev.layer];
          const isOpen = expanded[ev.id || i];

          return (
            <div
              key={ev.id || i}
              className="fade-in"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
                cursor: 'pointer',
                borderLeft: `3px solid ${sig.dot}`
              }}
              onClick={() => toggle(ev.id || i)}
            >
              {/* Header */}
              <div className="flex items-center gap-3" style={{ padding: '14px 16px' }}>
                <span className={`badge ${sig.cls}`} style={{ flexShrink: 0 }}>{sig.label}</span>
                <span style={{ fontSize: '11px', color: 'var(--ink-3)' }}>{dim.icon} {dim.label}</span>
                {layer && (
                  <span style={{
                    marginLeft: 'auto', fontSize: '10px', fontFamily: 'Syne, sans-serif',
                    color: layer.color, letterSpacing: '0.05em', flexShrink: 0
                  }}>{layer.label}</span>
                )}
                <span style={{ color: 'var(--ink-4)', fontSize: '12px', marginLeft: layer ? '0' : 'auto' }}>
                  {isOpen ? '▲' : '▼'}
                </span>
              </div>

              {/* Quote always visible */}
              <div style={{ padding: '0 16px 14px' }}>
                <div className="transcript-quote">"{ev.quote}"</div>
              </div>

              {/* Interpretation — expandable */}
              {isOpen && ev.interpretation && (
                <div style={{
                  padding: '12px 16px',
                  borderTop: '1px solid var(--border)',
                  background: 'rgba(255,255,255,0.015)',
                  animation: 'fadeIn 0.2s ease'
                }}>
                  <div style={{ fontSize: '10px', color: 'var(--ink-3)', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Analysis</div>
                  <p style={{ fontSize: '12px', color: 'var(--ink-2)', lineHeight: 1.7 }}>{ev.interpretation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
