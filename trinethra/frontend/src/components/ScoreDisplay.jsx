import React from 'react';

const BAND_COLORS = {
  'Need Attention': '#f05c5c',
  'Productivity': '#e8b84b',
  'Performance': '#34c98a'
};

const BIAS_LABELS = {
  helpfulness_bias: 'Helpfulness Bias',
  presence_bias: 'Presence Bias',
  halo_effect: 'Halo Effect',
  dependency_trap: 'Dependency Trap',
  recency_bias: 'Recency Bias',
  horn_effect: 'Horn Effect'
};

export default function ScoreDisplay({ score }) {
  if (!score) return null;
  const color = BAND_COLORS[score.band] || '#e8b84b';
  const pct = ((score.value - 1) / 9) * 100;

  // SVG ring
  const r = 44, cx = 56, cy = 56;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;

  return (
    <div className="card" style={{ padding: '28px', background: 'linear-gradient(135deg, #161b24 0%, #111318 100%)' }}>
      <div className="section-label">Performance Score</div>

      <div className="flex items-center gap-6" style={{ flexWrap: 'wrap' }}>
        {/* SVG Score Ring */}
        <div className="score-ring" style={{ flexShrink: 0 }}>
          <svg width="112" height="112" viewBox="0 0 112 112">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            {/* BG track */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e2535" strokeWidth="8" />
            {/* Filled arc */}
            <circle
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${filled} ${circ - filled}`}
              strokeDashoffset={circ * 0.25}
              filter="url(#glow)"
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
            {/* Score number */}
            <text x={cx} y={cy - 4} textAnchor="middle" fill={color}
              style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 800 }}>
              {score.value}
            </text>
            <text x={cx} y={cy + 14} textAnchor="middle" fill="#5a6a82"
              style={{ fontFamily: 'Syne, sans-serif', fontSize: '10px', letterSpacing: '0.08em' }}>
              / 10
            </text>
          </svg>
        </div>

        {/* Label & Details */}
        <div className="grow">
          <div style={{ marginBottom: '4px' }}>
            <span style={{
              fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800,
              color: 'var(--ink-1)', display: 'block'
            }}>{score.label}</span>
            <span style={{
              fontFamily: 'Syne, sans-serif', fontSize: '11px', fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase', color: color
            }}>{score.band}</span>
          </div>

          {/* Confidence */}
          <div className="flex items-center gap-2" style={{ marginTop: '12px' }}>
            <span style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Confidence</span>
            {['low', 'medium', 'high'].map(c => (
              <span key={c} style={{
                width: 24, height: 6, borderRadius: 3,
                background: score.confidence === 'high' ? color :
                  (score.confidence === 'medium' && c !== 'high') ? color :
                  (score.confidence === 'low' && c === 'low') ? color : 'var(--border-glow)',
                transition: 'background 0.3s'
              }} />
            ))}
            <span style={{ fontSize: '11px', color: 'var(--ink-2)', fontFamily: 'Syne, sans-serif', textTransform: 'capitalize' }}>{score.confidence}</span>
          </div>
        </div>
      </div>

      {/* Justification */}
      <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', borderLeft: `3px solid ${color}` }}>
        <p style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--ink-2)', fontFamily: 'DM Mono, monospace' }}>{score.justification}</p>
      </div>

      {/* Biases detected */}
      {score.biasesDetected && score.biasesDetected.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            ⚠ Supervisor biases detected
          </div>
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            {score.biasesDetected.map(b => (
              <span key={b} style={{
                padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontFamily: 'Syne, sans-serif', fontWeight: 600,
                background: 'rgba(240, 92, 92, 0.08)', color: '#f05c5c', border: '1px solid rgba(240,92,92,0.2)'
              }}>
                {BIAS_LABELS[b] || b}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
