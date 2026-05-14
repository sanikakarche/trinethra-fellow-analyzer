import React, { useState, useEffect, useRef, useCallback } from 'react';
import ScoreDisplay from './components/ScoreDisplay.jsx';
import EvidencePanel from './components/EvidencePanel.jsx';
import KPIMapping from './components/KPIMapping.jsx';
import GapAnalysis from './components/GapAnalysis.jsx';
import FollowUpQuestions from './components/FollowUpQuestions.jsx';
import LoadingState from './components/LoadingState.jsx';
import HealthBanner from './components/HealthBanner.jsx';
import { runAnalysis, getSamples } from './utils/api.js';

const TABS = [
  { id: 'evidence', label: 'Evidence', icon: '📋' },
  { id: 'kpi', label: 'KPI Map', icon: '📈' },
  { id: 'gaps', label: 'Gaps', icon: '🔍' },
  { id: 'questions', label: 'Follow-Up', icon: '💬' },
];

export default function App() {
  const [transcript, setTranscript] = useState('');
  const [fellowName, setFellowName] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('evidence');
  const [samples, setSamples] = useState([]);
  const [showSamples, setShowSamples] = useState(false);
  const [requestMeta, setRequestMeta] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const resultsRef = useRef(null);

  // Load samples
  useEffect(() => {
    getSamples().then(d => setSamples(d.transcripts || [])).catch(() => {});
  }, []);

  const handleTranscriptChange = (e) => {
    setTranscript(e.target.value);
    setCharCount(e.target.value.length);
  };

  const loadSample = (sample) => {
    setTranscript(sample.transcript);
    setFellowName(sample.fellow?.name || '');
    setSupervisorName(sample.supervisor?.name || '');
    setCharCount(sample.transcript.length);
    setShowSamples(false);
    setAnalysis(null);
    setError(null);
  };

  const handleAnalyze = useCallback(async () => {
    if (!transcript.trim() || loading) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await runAnalysis({ transcript, fellowName, supervisorName });
      setAnalysis(result.analysis);
      setRequestMeta(result.meta);
      setActiveTab('evidence');
      // Scroll to results
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [transcript, fellowName, supervisorName, loading]);

  // Keyboard shortcut: Ctrl+Enter to analyze
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleAnalyze();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleAnalyze]);

  const countForTab = {
    evidence: analysis?.evidence?.length || 0,
    kpi: analysis?.kpiMapping?.length || 0,
    gaps: analysis?.gaps?.length || 0,
    questions: analysis?.followUpQuestions?.length || 0,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <HealthBanner />

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header style={{
        padding: '20px 32px',
        borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(180deg, #111318 0%, rgba(17,19,24,0) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        backgroundColor: 'rgba(10,11,14,0.92)'
      }}>
        <div className="flex items-center gap-4">
          {/* Logo mark */}
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, var(--accent-gold) 0%, #c9940a 100%)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', flexShrink: 0
          }}>👁</div>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px', letterSpacing: '0.04em', color: 'var(--ink-1)' }}>
              TRINETHRA
            </div>
            <div style={{ fontSize: '10px', color: 'var(--ink-3)', fontFamily: 'Syne, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Fellow Performance Analyzer
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: '11px', color: 'var(--ink-4)', fontFamily: 'DM Mono, monospace' }}>DeepThought · PDGMS Trinethra</span>
        </div>
      </header>

      {/* ── Main Layout ──────────────────────────────────────────────── */}
      <main style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: analysis || loading ? '1fr 1fr' : '1fr',
        gap: '0',
        maxWidth: '1440px',
        margin: '0 auto',
        width: '100%',
        alignItems: 'start'
      }}>

        {/* ── LEFT PANEL: Input ────────────────────────────────────────── */}
        <div style={{
          padding: '32px',
          borderRight: analysis || loading ? '1px solid var(--border)' : 'none',
          position: 'sticky',
          top: '77px',
          maxHeight: 'calc(100vh - 77px)',
          overflowY: 'auto'
        }}>
          {/* Panel title */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>
              Supervisor Transcript
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--ink-3)', lineHeight: 1.6 }}>
              Paste a raw supervisor interview transcript. The tool extracts evidence, scores the Fellow, and suggests follow-up questions.
            </p>
          </div>

          {/* Quick fill metadata */}
          <div className="flex gap-3" style={{ marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '10px', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>
                Fellow Name (optional)
              </label>
              <input
                value={fellowName}
                onChange={e => setFellowName(e.target.value)}
                placeholder="e.g. Karthik Narayanan"
                style={{ padding: '9px 12px', fontSize: '12px' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '10px', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>
                Supervisor Name (optional)
              </label>
              <input
                value={supervisorName}
                onChange={e => setSupervisorName(e.target.value)}
                placeholder="e.g. Mr. Suresh Patil"
                style={{ padding: '9px 12px', fontSize: '12px' }}
              />
            </div>
          </div>

          {/* Samples dropdown */}
          <div style={{ marginBottom: '12px', position: 'relative' }}>
            <button
              className="btn-ghost"
              onClick={() => setShowSamples(s => !s)}
              style={{ width: '100%', justifyContent: 'space-between', padding: '10px 14px' }}
            >
              <span>📄 Load sample transcript</span>
              <span style={{ transform: showSamples ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>▾</span>
            </button>

            {showSamples && samples.length > 0 && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                background: 'var(--bg-card)', border: '1px solid var(--border-glow)',
                borderRadius: 'var(--radius-md)', overflow: 'hidden', zIndex: 20,
                boxShadow: 'var(--shadow-card)'
              }}>
                {samples.map(s => (
                  <button
                    key={s.id}
                    onClick={() => loadSample(s)}
                    style={{
                      width: '100%', padding: '14px 16px', textAlign: 'left',
                      background: 'none', border: 'none', cursor: 'pointer',
                      borderBottom: '1px solid var(--border)',
                      transition: 'background 0.15s', fontFamily: 'inherit'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', color: 'var(--ink-1)', marginBottom: '3px' }}>
                      {s.fellow?.name} — {s.company?.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--ink-3)' }}>
                      {s.fellow?.tenure} · {s.company?.industry}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--accent-gold)', marginTop: '3px', fontFamily: 'Syne, sans-serif' }}>
                      Expected score: {s.expectedScoreRange?.join('-')}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Transcript textarea */}
          <div style={{ marginBottom: '8px' }}>
            <textarea
              value={transcript}
              onChange={handleTranscriptChange}
              placeholder="Paste the full supervisor interview transcript here...

Example: 'Karthik? Haan, he is good. Very sincere boy. Comes on time, leaves on time — actually he stays late most days...'"
              style={{
                padding: '16px',
                minHeight: '360px',
                lineHeight: '1.7',
                fontSize: '13px'
              }}
            />
            <div className="flex justify-between" style={{ marginTop: '6px' }}>
              <span style={{ fontSize: '10px', color: charCount < 100 ? 'var(--signal-neg)' : 'var(--ink-4)', fontFamily: 'DM Mono, monospace' }}>
                {charCount} chars {charCount < 100 ? '(min 100)' : ''}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--ink-4)', fontFamily: 'DM Mono, monospace' }}>
                Ctrl+Enter to analyze
              </span>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              padding: '14px 16px', marginBottom: '16px',
              background: 'rgba(240, 92, 92, 0.08)', border: '1px solid rgba(240,92,92,0.25)',
              borderRadius: 'var(--radius-md)', fontSize: '12px', color: '#f05c5c', lineHeight: 1.6
            }}>
              <strong style={{ fontFamily: 'Syne, sans-serif' }}>Error: </strong>{error}
            </div>
          )}

          {/* Analyze button */}
          <button
            className="btn-primary"
            onClick={handleAnalyze}
            disabled={loading || !transcript.trim() || charCount < 100}
            style={{ width: '100%', justifyContent: 'center', fontSize: '13px', padding: '14px' }}
          >
            {loading ? (
              <>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', animation: 'spin 0.8s linear infinite' }} />
                Analyzing...
              </>
            ) : (
              <>👁 Run Analysis</>
            )}
          </button>

          {/* Rubric quick reference */}
          <div style={{ marginTop: '24px' }}>
            <div className="section-label">Rubric Reference</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {[
                { score: '1-3', label: 'Need Attention', color: '#f05c5c' },
                { score: '4-6', label: 'Productivity', color: '#e8b84b' },
                { score: '6', label: 'Reliable (executor)', color: '#e8b84b' },
                { score: '7+', label: 'Performance', color: '#34c98a' },
                { score: '7', label: 'Problem Identifier', color: '#34c98a' },
                { score: '8+', label: 'Systems Builder', color: '#34c98a' },
              ].map(r => (
                <div key={r.score + r.label} style={{
                  padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                  background: `${r.color}08`, border: `1px solid ${r.color}18`,
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '13px', color: r.color }}>{r.score}</span>
                  <span style={{ fontSize: '11px', color: 'var(--ink-2)' }}>{r.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: Results ──────────────────────────────────────── */}
        {(analysis || loading) && (
          <div ref={resultsRef} style={{ padding: '32px', overflowY: 'auto' }}>
            {loading && <LoadingState />}

            {analysis && !loading && (
              <div className="flex flex-col gap-6 fade-in">
                {/* Fellow + meta header */}
                <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    {fellowName && (
                      <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 800 }}>{fellowName}</h2>
                    )}
                    {supervisorName && (
                      <div style={{ fontSize: '12px', color: 'var(--ink-3)' }}>Assessed by: {supervisorName}</div>
                    )}
                  </div>
                  {requestMeta && (
                    <div style={{ fontSize: '10px', color: 'var(--ink-4)', fontFamily: 'DM Mono, monospace', textAlign: 'right', lineHeight: 1.8 }}>
                      <div>Model: {requestMeta.model}</div>
                      <div>Parse: {requestMeta.parseMethod}</div>
                      <div>Time: {(requestMeta.processingTimeMs / 1000).toFixed(1)}s</div>
                      {requestMeta.warnings?.length > 0 && (
                        <div style={{ color: '#e8b84b' }}>⚠ {requestMeta.warnings.length} warning(s)</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Executive summary */}
                {analysis.executiveSummary && (
                  <div style={{
                    padding: '18px 20px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '3px solid var(--accent-gold)'
                  }}>
                    <div style={{ fontSize: '10px', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                      Executive Summary
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--ink-2)', lineHeight: 1.7, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>
                      {analysis.executiveSummary}
                    </p>
                  </div>
                )}

                {/* Score */}
                <ScoreDisplay score={analysis.score} />

                {/* Warnings */}
                {requestMeta?.warnings?.length > 0 && (
                  <div style={{
                    padding: '12px 16px', background: 'rgba(232,184,75,0.06)',
                    border: '1px solid rgba(232,184,75,0.2)', borderRadius: 'var(--radius-md)'
                  }}>
                    <div style={{ fontSize: '11px', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '6px' }}>
                      ⚠ System Warnings
                    </div>
                    {requestMeta.warnings.map((w, i) => (
                      <div key={i} style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'DM Mono, monospace', marginBottom: '2px' }}>• {w}</div>
                    ))}
                  </div>
                )}

                {/* Tabs */}
                <div>
                  <div className="tab-bar" style={{ marginBottom: '20px' }}>
                    {TABS.map(tab => (
                      <button
                        key={tab.id}
                        className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        {tab.icon} {tab.label}
                        {countForTab[tab.id] > 0 && (
                          <span className="tab-count">{countForTab[tab.id]}</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Tab content */}
                  <div key={activeTab} className="fade-in">
                    {activeTab === 'evidence' && <EvidencePanel evidence={analysis.evidence} />}
                    {activeTab === 'kpi' && <KPIMapping kpiMapping={analysis.kpiMapping} />}
                    {activeTab === 'gaps' && <GapAnalysis gaps={analysis.gaps} />}
                    {activeTab === 'questions' && <FollowUpQuestions questions={analysis.followUpQuestions} />}
                  </div>
                </div>

                {/* Reset button */}
                <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                  <button
                    className="btn-ghost"
                    onClick={() => { setAnalysis(null); setError(null); setRequestMeta(null); }}
                  >
                    ← New Analysis
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      {!analysis && !loading && (
        <footer style={{
          padding: '24px 32px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontSize: '11px', color: 'var(--ink-4)', fontFamily: 'DM Mono, monospace' }}>
            Trinethra · DeepThought PDGMS · Built by Sanika Karche · Runs on Ollama (local LLM, no cloud, no API key)
          </div>
          <div className="flex gap-3">
            {[
              { label: 'Bias Detection', desc: 'Flags helpfulness bias, presence bias, dependency trap' },
              { label: 'Anti-hallucination', desc: 'Validates evidence quotes against original transcript' },
              { label: 'Layer Analysis', desc: 'Distinguishes Layer 1 (execution) from Layer 2 (systems)' },
            ].map(f => (
              <span
                key={f.label}
                className="badge badge-gold"
                data-tooltip={f.desc}
                style={{ cursor: 'default' }}
              >
                {f.label}
              </span>
            ))}
          </div>
        </footer>
      )}
    </div>
  );
}
