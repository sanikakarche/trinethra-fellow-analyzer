import React from 'react';

const KPI_ICONS = {
  lead_generation: '🎯',
  lead_conversion: '🔄',
  upselling: '📦',
  cross_selling: '🔀',
  nps: '⭐',
  pat: '💰',
  tat: '⏱',
  quality: '✅'
};

const IMPACT_COLORS = {
  high: { bg: 'rgba(52,201,138,0.08)', text: '#34c98a', bar: '#34c98a', width: '85%' },
  medium: { bg: 'rgba(232,184,75,0.08)', text: '#e8b84b', bar: '#e8b84b', width: '55%' },
  low: { bg: 'rgba(90,106,130,0.08)', text: '#5a6a82', bar: '#5a6a82', width: '25%' }
};

export default function KPIMapping({ kpiMapping }) {
  if (!kpiMapping || kpiMapping.length === 0) {
    return (
      <div style={{ color: 'var(--ink-3)', fontSize: '13px', padding: '20px 0', textAlign: 'center' }}>
        No KPI connections identified in this transcript.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 stagger">
      {kpiMapping.map((item, i) => {
        const impact = IMPACT_COLORS[item.impact || 'medium'];
        const icon = KPI_ICONS[item.kpiId] || '•';
        const isSystem = item.systemOrPersonal === 'system';

        return (
          <div
            key={i}
            className="fade-in"
            style={{
              background: impact.bg,
              border: `1px solid ${impact.bar}22`,
              borderRadius: 'var(--radius-md)',
              padding: '16px 18px'
            }}
          >
            <div className="flex items-center gap-3" style={{ marginBottom: '10px' }}>
              <span style={{ fontSize: '20px' }}>{icon}</span>
              <div className="grow">
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--ink-1)' }}>
                  {item.kpi}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'Syne, sans-serif', marginTop: '2px' }}>
                  {item.impact?.toUpperCase() || 'MEDIUM'} IMPACT
                </div>
              </div>

              {/* System vs Personal badge */}
              <span style={{
                padding: '4px 10px', borderRadius: '20px', fontSize: '10px',
                fontFamily: 'Syne, sans-serif', fontWeight: 700, letterSpacing: '0.05em',
                background: isSystem ? 'rgba(52,201,138,0.1)' : 'rgba(232,184,75,0.1)',
                color: isSystem ? '#34c98a' : '#e8b84b',
                border: `1px solid ${isSystem ? 'rgba(52,201,138,0.25)' : 'rgba(232,184,75,0.25)'}`
              }}>
                {isSystem ? '🔧 SYSTEM' : '👤 PERSONAL'}
              </span>
            </div>

            {/* Impact bar */}
            <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px', marginBottom: '12px' }}>
              <div style={{
                height: '100%', background: impact.bar, borderRadius: '2px',
                width: impact.width, transition: 'width 1s ease'
              }} />
            </div>

            {/* Evidence text */}
            <p style={{ fontSize: '12px', color: 'var(--ink-2)', lineHeight: 1.6 }}>{item.evidence}</p>
          </div>
        );
      })}
    </div>
  );
}
