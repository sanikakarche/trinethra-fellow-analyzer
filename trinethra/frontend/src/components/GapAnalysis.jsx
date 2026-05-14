import React from 'react';

const SEVERITY_MAP = {
  critical: { color: '#f05c5c', bg: 'rgba(240,92,92,0.07)', label: 'CRITICAL', icon: '🔴' },
  moderate: { color: '#e8b84b', bg: 'rgba(232,184,75,0.07)', label: 'MODERATE', icon: '🟡' },
  minor: { color: '#5a6a82', bg: 'rgba(90,106,130,0.07)', label: 'MINOR', icon: '⚪' }
};

const DIM_DESCRIPTIONS = {
  execution: 'Did the supervisor describe whether the Fellow gets tasks done on time, without reminders?',
  systems_building: 'Did the supervisor mention any tool, tracker, or process that would survive the Fellow\'s departure?',
  kpi_impact: 'Did the supervisor connect the Fellow\'s work to any measurable business outcome?',
  change_management: 'Did the supervisor describe how the Fellow handles resistance from the floor team?'
};

export default function GapAnalysis({ gaps }) {
  if (!gaps || gaps.length === 0) {
    return (
      <div style={{
        padding: '24px', textAlign: 'center', background: 'rgba(52,201,138,0.05)',
        border: '1px solid rgba(52,201,138,0.2)', borderRadius: 'var(--radius-md)'
      }}>
        <div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#34c98a', marginBottom: '4px' }}>
          All Dimensions Covered
        </div>
        <div style={{ fontSize: '12px', color: 'var(--ink-3)' }}>
          The transcript provided evidence across all 4 assessment dimensions.
        </div>
      </div>
    );
  }

  // Sort by severity: critical first
  const sorted = [...gaps].sort((a, b) => {
    const order = { critical: 0, moderate: 1, minor: 2 };
    return (order[a.severity] ?? 1) - (order[b.severity] ?? 1);
  });

  return (
    <div className="flex flex-col gap-3 stagger">
      {/* Summary bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        marginBottom: '8px'
      }}>
        {['execution', 'systems_building', 'kpi_impact', 'change_management'].map(dim => {
          const gap = gaps.find(g => g.dimension === dim);
          const covered = !gap;
          return (
            <div key={dim} style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: covered ? 'rgba(52,201,138,0.06)' : 'rgba(240,92,92,0.06)',
              border: `1px solid ${covered ? 'rgba(52,201,138,0.2)' : 'rgba(240,92,92,0.2)'}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '16px', marginBottom: '4px' }}>{covered ? '✓' : '✗'}</div>
              <div style={{ fontSize: '9px', fontFamily: 'Syne, sans-serif', fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: covered ? '#34c98a' : '#f05c5c'
              }}>
                {dim.replace('_', ' ')}
              </div>
            </div>
          );
        })}
      </div>

      {sorted.map((gap, i) => {
        const sev = SEVERITY_MAP[gap.severity] || SEVERITY_MAP.moderate;
        const desc = DIM_DESCRIPTIONS[gap.dimension] || '';

        return (
          <div
            key={i}
            className="fade-in"
            style={{
              background: sev.bg,
              border: `1px solid ${sev.color}22`,
              borderRadius: 'var(--radius-md)',
              padding: '16px 18px',
              borderLeft: `3px solid ${sev.color}`
            }}
          >
            <div className="flex items-center gap-3" style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '16px' }}>{sev.icon}</span>
              <div>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', color: 'var(--ink-1)' }}>
                  {gap.dimensionLabel || gap.dimension}
                </span>
                <span style={{
                  marginLeft: '10px', fontSize: '10px', fontFamily: 'Syne, sans-serif',
                  fontWeight: 700, color: sev.color, letterSpacing: '0.08em'
                }}>{sev.label}</span>
              </div>
            </div>
            {desc && (
              <div style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'DM Mono, monospace', marginBottom: '8px', fontStyle: 'italic' }}>
                Expected: {desc}
              </div>
            )}
            <p style={{ fontSize: '12px', color: 'var(--ink-2)', lineHeight: 1.7 }}>{gap.detail}</p>
          </div>
        );
      })}
    </div>
  );
}
