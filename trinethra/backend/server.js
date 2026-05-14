// Trinethra — Supervisor Feedback Analyzer
// DeepThought PDGMS | Software Developer Internship Assignment
// Author: Sanika Karche
// Model: Mistral (via Ollama) | Stack: Node/Express + React/Vite
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173'], credentials: true }));
app.use(express.json({ limit: '50kb' }));
app.use(morgan('dev'));

const limiter = rateLimit({ windowMs: 60_000, max: 20, message: { error: 'Too many requests. Please wait.' } });
app.use('/api/', limiter);

// ─── Rubric Data (embedded for prompt injection) ──────────────────────────────
const RUBRIC = {
  bands: [
    { band: 'Need Attention', range: [1, 3], levels: [
      { score: 1, label: 'Not Interested', signals: ['Disengaged', 'Does not attempt work', 'No visible effort'] },
      { score: 2, label: 'Lacks Discipline', signals: ['Waits for instructions', 'No self-direction', 'Does minimum when told'] },
      { score: 3, label: 'Motivated but Directionless', signals: ['Enthusiastic but unfocused', 'Wants to help but doesn\'t know how', 'Energy without direction'] }
    ]},
    { band: 'Productivity', range: [4, 6], levels: [
      { score: 4, label: 'Careless and Inconsistent', signals: ['Inconsistent quality', 'Sometimes good, sometimes sloppy'] },
      { score: 5, label: 'Consistent Performer', signals: ['Reliable', 'Does what\'s asked', 'Meets standards', 'Doesn\'t exceed scope'] },
      { score: 6, label: 'Reliable and Productive', signals: ['High trust from supervisor', 'Give task and forget', 'Efficient execution'] }
    ]},
    { band: 'Performance', range: [7, 10], levels: [
      { score: 7, label: 'Problem Identifier', signals: ['Spots patterns', 'Flags issues proactively', 'Notices what others miss', 'Expands scope beyond assignments'] },
      { score: 8, label: 'Problem Solver', signals: ['Builds solutions, not just reports', 'Proposes and implements fixes', 'Creates tools or processes'] },
      { score: 9, label: 'Innovative and Experimental', signals: ['Tests multiple approaches', 'Iterates on solutions', 'Builds new tools'] },
      { score: 10, label: 'Exceptional Performer', signals: ['Flawless execution', 'Others learn from their work', 'Creates replicable systems'] }
    ]}
  ],
  criticalBoundary: {
    boundary: '6 vs 7',
    score6Example: 'He does everything I give him. I don\'t have to follow up. Very reliable.',
    score7Example: 'She noticed that our rejection rate goes up on Mondays and started tracking why.'
  }
};

const KPIS = [
  { id: 'lead_generation', label: 'Lead Generation', description: 'New potential customers identified and contacted' },
  { id: 'lead_conversion', label: 'Lead Conversion', description: 'Percentage of leads that become paying customers' },
  { id: 'upselling', label: 'Upselling', description: 'Selling more to existing customers' },
  { id: 'cross_selling', label: 'Cross-selling', description: 'Selling additional products to existing customers' },
  { id: 'nps', label: 'NPS', description: 'Customer satisfaction and likelihood to recommend' },
  { id: 'pat', label: 'PAT', description: 'Profit After Tax — bottom-line profitability' },
  { id: 'tat', label: 'TAT', description: 'Turnaround Time — process completion speed' },
  { id: 'quality', label: 'Quality', description: 'Defect rates, rejection rates, customer complaints' }
];

const DIMENSIONS = [
  { id: 'execution', label: 'Driving Execution', description: 'Getting things done on time, following up without reminders, initiating work' },
  { id: 'systems_building', label: 'Building Systems', description: 'Creating tools, processes, trackers, SOPs that persist after the Fellow leaves' },
  { id: 'kpi_impact', label: 'KPI Impact', description: 'Connecting work to measurable business outcomes' },
  { id: 'change_management', label: 'Change Management', description: 'Getting people to adopt new processes, handling resistance, building rapport' }
];

// ─── Prompt Builder ───────────────────────────────────────────────────────────
function buildPrompt(transcript) {
  const rubricText = RUBRIC.bands.map(b =>
    b.levels.map(l => `  Score ${l.score} - "${l.label}": ${l.signals.join(', ')}`).join('\n')
  ).join('\n');

  const kpiText = KPIS.map(k => `  - ${k.label} (${k.id}): ${k.description}`).join('\n');
  const dimText = DIMENSIONS.map(d => `  - ${d.id} (${d.label}): ${d.description}`).join('\n');

  return `You are an expert HR analyst at DeepThought, a B2B company that places operating Fellows inside Indian manufacturing MSMEs. Your job is to analyze supervisor feedback transcripts and produce structured assessments.

## CRITICAL SCORING RULES
${rubricText}

MOST IMPORTANT BOUNDARY — Score 6 vs Score 7:
- Score 6 example: "${RUBRIC.criticalBoundary.score6Example}" → reliable executor of tasks DEFINED BY OTHERS
- Score 7 example: "${RUBRIC.criticalBoundary.score7Example}" → identifies problems the supervisor HADN'T ARTICULATED

The difference is INITIATIVE DIRECTION. A 6 takes initiative WITHIN assigned scope. A 7 EXPANDS the scope.

## SUPERVISOR BIAS DETECTION (CRITICAL — DO NOT SKIP)
Watch for these traps that cause incorrect high scores:
1. HELPFULNESS BIAS: "She handles all my calls now" sounds like 8 but is actually 5-6 (task absorption ≠ systems building)
2. PRESENCE BIAS: "He's always on the floor" is not evidence of high performance — it's evidence of presence
3. HALO EFFECT: One big positive story coloring the entire assessment
4. DEPENDENCY TRAP: If the Fellow left tomorrow and everything they do stops → that is DEPENDENCY, not high performance (max score: 5-6)
5. SYSTEMS vs PERSONAL: A tracker the Fellow updates manually is NOT a system. A process that runs WITHOUT the Fellow IS a system.

## FELLOW MANDATE LAYERS
- Layer 1 (Execution): Attending meetings, tracking output, following up, coordination tasks — NECESSARY but NOT the mandate
- Layer 2 (Systems): Creating SOPs, trackers, dashboards, workflows that CONTINUE WORKING after Fellow leaves — THIS IS THE ACTUAL JOB
- A Fellow who only does Layer 1 should NOT score above 6, regardless of how glowing the supervisor is.

## KPI DEFINITIONS
${kpiText}

## ASSESSMENT DIMENSIONS (check ALL 4 — missing ones become gaps)
${dimText}

## YOUR TASK
Analyze the following supervisor transcript and return ONLY a valid JSON object (no markdown, no explanation, no preamble, no backticks).

## TRANSCRIPT TO ANALYZE
${transcript}

## OUTPUT FORMAT
Return this exact JSON structure (fill all fields based on evidence from the transcript):

{
  "score": {
    "value": <integer 1-10>,
    "label": "<rubric label>",
    "band": "<Need Attention|Productivity|Performance>",
    "justification": "<2-3 sentence justification citing specific transcript evidence. MUST explain why it is NOT the adjacent higher score>",
    "confidence": "<low|medium|high>",
    "biasesDetected": ["<list any supervisor biases you detected, e.g. 'helpfulness_bias', 'presence_bias', 'halo_effect', 'dependency_trap'>"]
  },
  "evidence": [
    {
      "id": "<unique string like ev1, ev2>",
      "quote": "<direct quote from transcript, 10-40 words>",
      "signal": "<positive|negative|neutral>",
      "dimension": "<execution|systems_building|kpi_impact|change_management>",
      "layer": "<layer1|layer2>",
      "interpretation": "<1-2 sentences: what this evidence reveals about the Fellow's actual performance level>"
    }
  ],
  "kpiMapping": [
    {
      "kpi": "<kpi label>",
      "kpiId": "<kpi id from list>",
      "evidence": "<what the supervisor said that maps to this KPI>",
      "systemOrPersonal": "<system|personal>",
      "impact": "<low|medium|high>"
    }
  ],
  "gaps": [
    {
      "dimension": "<dimension id>",
      "dimensionLabel": "<dimension label>",
      "severity": "<critical|moderate|minor>",
      "detail": "<what is missing and why it matters for accurate scoring>"
    }
  ],
  "followUpQuestions": [
    {
      "id": "<q1, q2, etc>",
      "question": "<specific, actionable question the intern should ask>",
      "targetGap": "<dimension id this addresses>",
      "lookingFor": "<what answer would indicate higher vs lower score>"
    }
  ],
  "executiveSummary": "<3-4 sentences: overall assessment, strongest evidence, key concern, recommended action>"
}

STRICT RULES:
- Return ONLY the JSON object. No text before or after.
- Every evidence item MUST have a direct quote from the transcript.
- Extract AT LEAST 4 evidence items, max 8.
- Generate EXACTLY 4-5 follow-up questions.
- Cover ALL 4 dimensions in gaps (list only the ones that are ABSENT or WEAK in the transcript).
- Map to KPIs only if there is actual evidence in the transcript — do not invent KPI connections.
- The justification MUST explain why the score is NOT higher (e.g., why it's 6 not 7).`;
}

// ─── Ollama Client ────────────────────────────────────────────────────────────
async function callOllama(prompt, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 180_000); // 3 min timeout

      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt,
          stream: false,
          options: {
            temperature: 0.1,      // Low temperature for consistent structured output
            top_p: 0.9,
            repeat_penalty: 1.1,
            num_predict: 3000
          }
        })
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Ollama HTTP ${response.status}: ${err}`);
      }

      const data = await response.json();
      return data.response;
    } catch (err) {
      if (attempt === maxRetries) throw err;
      console.warn(`Ollama attempt ${attempt + 1} failed: ${err.message}. Retrying...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

// ─── JSON Parser with Fallback ────────────────────────────────────────────────
function parseAnalysis(rawText) {
  // Strategy 1: Direct parse
  try {
    const parsed = JSON.parse(rawText.trim());
    return { success: true, data: parsed, parseMethod: 'direct' };
  } catch {}

  // Strategy 2: Extract JSON block between first { and last }
  try {
    const start = rawText.indexOf('{');
    const end = rawText.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      const jsonStr = rawText.slice(start, end + 1);
      const parsed = JSON.parse(jsonStr);
      return { success: true, data: parsed, parseMethod: 'extracted' };
    }
  } catch {}

  // Strategy 3: Remove markdown code fences and retry
  try {
    const cleaned = rawText
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/g, '')
      .trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      const parsed = JSON.parse(cleaned.slice(start, end + 1));
      return { success: true, data: parsed, parseMethod: 'stripped_markdown' };
    }
  } catch {}

  // Strategy 4: Fix common JSON issues (trailing commas, unescaped quotes in strings)
  try {
    const start = rawText.indexOf('{');
    const end = rawText.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      let jsonStr = rawText.slice(start, end + 1);
      // Remove trailing commas before } or ]
      jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
      const parsed = JSON.parse(jsonStr);
      return { success: true, data: parsed, parseMethod: 'fixed_json' };
    }
  } catch {}

  return { success: false, data: null, rawText, parseMethod: 'failed' };
}

// ─── Validation & Sanitization ────────────────────────────────────────────────
function validateAndSanitize(data, transcript) {
  const warnings = [];

  // Ensure score is valid
  if (!data.score || typeof data.score.value !== 'number') {
    data.score = { value: 5, label: 'Consistent Performer', band: 'Productivity', justification: 'Score could not be determined from transcript.', confidence: 'low', biasesDetected: [] };
    warnings.push('Score data was missing or invalid — defaulted to 5');
  }
  data.score.value = Math.max(1, Math.min(10, Math.round(data.score.value)));

  // Ensure rubric label matches
  const allLevels = RUBRIC.bands.flatMap(b => b.levels);
  const matchedLevel = allLevels.find(l => l.score === data.score.value);
  if (matchedLevel) {
    data.score.label = matchedLevel.label;
    const band = RUBRIC.bands.find(b => b.range[0] <= data.score.value && data.score.value <= b.range[1]);
    data.score.band = band?.band || data.score.band;
  }

  // Ensure arrays exist
  if (!Array.isArray(data.evidence)) { data.evidence = []; warnings.push('Evidence array missing'); }
  if (!Array.isArray(data.kpiMapping)) { data.kpiMapping = []; warnings.push('KPI mapping missing'); }
  if (!Array.isArray(data.gaps)) { data.gaps = []; warnings.push('Gaps array missing'); }
  if (!Array.isArray(data.followUpQuestions)) { data.followUpQuestions = []; warnings.push('Follow-up questions missing'); }

  // Ensure evidence quotes are actually in transcript (anti-hallucination check)
  data.evidence = data.evidence.filter(ev => {
    if (!ev.quote) return false;
    // Check if key phrases from the quote exist in transcript (case-insensitive, allow partial match)
    const quoteWords = ev.quote.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    const transcriptLower = transcript.toLowerCase();
    const matchCount = quoteWords.filter(w => transcriptLower.includes(w)).length;
    const matchRatio = quoteWords.length > 0 ? matchCount / quoteWords.length : 0;
    if (matchRatio < 0.5) {
      warnings.push(`Evidence quote may be hallucinated (low match: ${Math.round(matchRatio * 100)}%): "${ev.quote.substring(0, 50)}..."`);
      return false; // Remove likely hallucinated quotes
    }
    return true;
  });

  // Ensure biasesDetected is array
  if (!data.score.biasesDetected) data.score.biasesDetected = [];

  return { data, warnings };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(5000) });
    const ollamaData = await response.json();
    const models = ollamaData.models?.map(m => m.name) || [];
    res.json({
      status: 'ok',
      ollama: { connected: true, models, activeModel: OLLAMA_MODEL },
      server: { version: '1.0.0', timestamp: new Date().toISOString() }
    });
  } catch {
    res.status(503).json({
      status: 'degraded',
      ollama: { connected: false, error: 'Ollama not reachable at ' + OLLAMA_URL },
      server: { version: '1.0.0', timestamp: new Date().toISOString() }
    });
  }
});

// Get rubric, KPIs, and sample transcripts
app.get('/api/config', (req, res) => {
  res.json({ rubric: RUBRIC, kpis: KPIS, dimensions: DIMENSIONS });
});

// Get sample transcripts
app.get('/api/samples', (req, res) => {
  const samples = require('./data/sample-transcripts.json');
  res.json(samples);
});

// Main analysis endpoint
app.post('/api/analyze', async (req, res) => {
  const requestId = uuidv4();
  const startTime = Date.now();

  try {
    const { transcript, fellowName, supervisorName } = req.body;

    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: 'transcript is required and must be a string', requestId });
    }
    if (transcript.trim().length < 100) {
      return res.status(400).json({ error: 'Transcript is too short (minimum 100 characters)', requestId });
    }
    if (transcript.length > 15000) {
      return res.status(400).json({ error: 'Transcript too long (maximum 15,000 characters)', requestId });
    }

    console.log(`[${requestId}] Starting analysis for ${fellowName || 'unnamed fellow'}`);

    const prompt = buildPrompt(transcript);
    const rawResponse = await callOllama(prompt);

    const parseResult = parseAnalysis(rawResponse);

    if (!parseResult.success) {
      console.error(`[${requestId}] JSON parse failed. Raw response:`, rawResponse.substring(0, 500));
      return res.status(422).json({
        error: 'The AI model returned an unparseable response. Please try again.',
        requestId,
        hint: 'This sometimes happens with complex transcripts. Retry usually resolves it.'
      });
    }

    const { data, warnings } = validateAndSanitize(parseResult.data, transcript);

    const processingTime = Date.now() - startTime;
    console.log(`[${requestId}] Analysis complete in ${processingTime}ms. Score: ${data.score?.value}. Parse: ${parseResult.parseMethod}. Warnings: ${warnings.length}`);

    res.json({
      requestId,
      analysis: data,
      meta: {
        processingTimeMs: processingTime,
        parseMethod: parseResult.parseMethod,
        model: OLLAMA_MODEL,
        warnings: warnings.length > 0 ? warnings : undefined,
        timestamp: new Date().toISOString()
      }
    });

  } catch (err) {
    const processingTime = Date.now() - startTime;
    console.error(`[${requestId}] Error after ${processingTime}ms:`, err.message);

    if (err.name === 'AbortError' || err.message.includes('abort')) {
      return res.status(504).json({ error: 'Analysis timed out. The model is taking too long. Try a smaller model like phi3 or llama3.2.', requestId });
    }
    if (err.message.includes('fetch') || err.message.includes('ECONNREFUSED')) {
      return res.status(503).json({ error: 'Cannot connect to Ollama. Make sure Ollama is running: ollama serve', requestId });
    }
    res.status(500).json({ error: 'Internal server error. Please try again.', requestId, details: err.message });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🔍 Trinethra Backend running on http://localhost:${PORT}`);
  console.log(`📡 Ollama endpoint: ${OLLAMA_URL} (model: ${OLLAMA_MODEL})`);
  console.log(`🚀 API ready. POST /api/analyze to begin.\n`);
});
