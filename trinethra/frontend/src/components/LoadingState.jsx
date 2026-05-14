import React, { useState, useEffect } from 'react';

const STEPS = [
  { label: 'Sending to Ollama...', detail: 'Connecting to local LLM' },
  { label: 'Extracting evidence...', detail: 'Finding behavioral signals in transcript' },
  { label: 'Applying rubric...', detail: 'Scoring against DT 1-10 scale' },
  { label: 'Detecting biases...', detail: 'Checking for helpfulness bias, presence bias, dependency trap' },
  { label: 'Mapping KPIs...', detail: 'Connecting work to business outcomes' },
  { label: 'Identifying gaps...', detail: 'Finding uncovered assessment dimensions' },
  { label: 'Generating questions...', detail: 'Building follow-up question set' },
  { label: 'Validating output...', detail: 'Parsing and sanitizing AI response' },
];

export default function LoadingState() {
  const [step, setStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep(s => Math.min(s + 1, STEPS.length - 1));
    }, 3500);
    const timeInterval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => { clearInterval(stepInterval); clearInterval(timeInterval); };
  }, []);

  return (
    <div style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
      {/* Spinner */}
      <div style={{ position: 'relative', width: '80px', height: '80px' }}>
        <div style={{
          position: 'absolute', inset: 0,
          border: '2px solid var(--border)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          border: '2px solid transparent',
          borderTopColor: 'var(--accent-gold)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{
          position: 'absolute', inset: '10px',
          border: '1px solid transparent',
          borderTopColor: 'rgba(232,184,75,0.4)',
          borderRadius: '50%',
          animation: 'spin 1.6s linear infinite reverse'
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Syne, sans-serif', fontSize: '11px', color: 'var(--ink-3)'
        }}>{elapsed}s</div>
      </div>

      {/* Current step */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px',
          color: 'var(--ink-1)', marginBottom: '4px'
        }}>{STEPS[step]?.label}</div>
        <div style={{ fontSize: '12px', color: 'var(--ink-3)' }}>{STEPS[step]?.detail}</div>
      </div>

      {/* Step progress dots */}
      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <div key={i} style={{
            width: i === step ? '20px' : '6px',
            height: '6px',
            borderRadius: '3px',
            background: i < step ? 'var(--accent-gold)' : i === step ? 'var(--accent-gold)' : 'var(--border-glow)',
            transition: 'all 0.3s ease',
            opacity: i > step + 2 ? 0.3 : 1
          }} />
        ))}
      </div>

      {/* Hint */}
      <div style={{
        fontSize: '11px', color: 'var(--ink-4)', fontFamily: 'DM Mono, monospace',
        textAlign: 'center', maxWidth: '340px', lineHeight: 1.6
      }}>
        LLM analysis can take 30-90 seconds depending on your model and hardware. Please wait.
      </div>
    </div>
  );
}
