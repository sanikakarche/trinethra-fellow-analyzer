import React, { useState, useEffect } from 'react';
import { checkHealth } from '../utils/api.js';

export default function HealthBanner() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    checkHealth().then(setHealth).catch(() => setHealth({ status: 'degraded', ollama: { connected: false } }));
  }, []);

  if (!health) return null;
  if (health.ollama?.connected) return null; // Don't show when healthy

  return (
    <div style={{
      padding: '10px 20px',
      background: 'rgba(240, 92, 92, 0.08)',
      borderBottom: '1px solid rgba(240,92,92,0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '12px',
      color: '#f05c5c'
    }}>
      <span style={{ fontSize: '16px' }}>⚠</span>
      <span>
        <strong style={{ fontFamily: 'Syne, sans-serif' }}>Ollama not connected.</strong>{' '}
        Run <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: '3px', fontSize: '11px' }}>ollama serve</code> and{' '}
        <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: '3px', fontSize: '11px' }}>ollama pull llama3.2</code> in your terminal, then refresh.
      </span>
    </div>
  );
}
