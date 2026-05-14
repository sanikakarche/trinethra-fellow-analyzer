// ─── API Client ──────────────────────────────────────────────────────────────
const BASE = '/api';

export async function checkHealth() {
  const res = await fetch(`${BASE}/health`);
  return res.json();
}

export async function getSamples() {
  const res = await fetch(`${BASE}/samples`);
  if (!res.ok) throw new Error('Failed to load samples');
  return res.json();
}

export async function runAnalysis({ transcript, fellowName, supervisorName }) {
  const res = await fetch(`${BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, fellowName, supervisorName })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Analysis failed');
  return data;
}
