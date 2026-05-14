import React, { useState } from 'react';

const DIM_COLORS = {
  execution: '#6b8ccc',
  systems_building: '#34c98a',
  kpi_impact: '#e8b84b',
  change_management: '#cc6b8c',
};

export default function FollowUpQuestions({ questions }) {
  const [copied, setCopied] = useState(null);

  if (!questions || questions.length === 0) {
    return <div style={{ color: 'var(--ink-3)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No follow-up questions generated.</div>;
  }

  const copyQuestion = (q, idx) => {
    navigator.clipboard.writeText(q.question).then(() => {
      setCopied(idx);
      setTimeout(() => setCopied(null), 1800);
    });
  };

  const copyAll = () => {
    const text = questions.map((q, i) => `${i + 1}. ${q.question}`).join('\n\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied('all');
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div>
      {/* Copy all button */}
      <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
        <span style={{ fontSize: '12px', color: 'var(--ink-3)' }}>{questions.length} questions to ask in the next call</span>
        <button className="btn-ghost" onClick={copyAll} style={{ fontSize: '11px' }}>
          {copied === 'all' ? '✓ Copied all' : '⎘ Copy all'}
        </button>
      </div>

      <div className="flex flex-col gap-3 stagger">
        {questions.map((q, i) => {
          const color = DIM_COLORS[q.targetGap] || '#5a6a82';
          return (
            <div
              key={q.id || i}
              className="fade-in"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 18px',
                borderLeft: `3px solid ${color}`
              }}
            >
              {/* Number + target tag */}
              <div className="flex items-center gap-3" style={{ marginBottom: '10px' }}>
                <span style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: `${color}18`, color: color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 800,
                  flexShrink: 0
                }}>{i + 1}</span>
                <span style={{
                  fontSize: '10px', fontFamily: 'Syne, sans-serif', fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase', color
                }}>{(q.targetGap || '').replace('_', ' ')}</span>
                <button
                  className="btn-ghost"
                  onClick={() => copyQuestion(q, i)}
                  style={{ marginLeft: 'auto', fontSize: '10px', padding: '4px 10px' }}
                >
                  {copied === i ? '✓' : '⎘'}
                </button>
              </div>

              {/* The question */}
              <p style={{
                fontFamily: 'Instrument Serif, serif',
                fontStyle: 'italic',
                fontSize: '15px',
                color: 'var(--ink-1)',
                lineHeight: 1.6,
                marginBottom: '10px'
              }}>"{q.question}"</p>

              {/* What to look for */}
              {q.lookingFor && (
                <div style={{
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)'
                }}>
                  <span style={{ fontSize: '10px', fontFamily: 'Syne, sans-serif', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    🔍 Looking for:
                  </span>
                  <p style={{ fontSize: '12px', color: 'var(--ink-2)', marginTop: '4px', lineHeight: 1.6 }}>{q.lookingFor}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
