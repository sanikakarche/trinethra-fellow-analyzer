# Trinethra — Supervisor Feedback Analyzer

> DeepThought PDGMS · Software Developer Internship Assignment

A web application that processes supervisor interview transcripts through a local LLM (Ollama) to produce structured Fellow performance assessments — cutting the psychology intern's manual workload from 45-60 minutes to under 10 minutes.

---

## Demo

The tool takes a raw supervisor transcript and produces:
- **Rubric score (1-10)** with justification and confidence level
- **Extracted evidence** — direct quotes tagged by signal (positive/negative/neutral), dimension, and Layer (1/2)
- **KPI mapping** — connects supervisor language to business outcomes
- **Gap analysis** — flags which assessment dimensions the transcript didn't cover
- **Follow-up questions** — 4-5 targeted questions with rationale for the intern's next call
- **Bias detection** — automatically flags helpfulness bias, presence bias, dependency trap, halo effect

---

## Quick Start (5 minutes)

### 1. Prerequisites
- Node.js 18+ installed
- Ollama installed from [ollama.com](https://ollama.com)

### 2. Pull the LLM model
```bash
ollama pull llama3.2
# If your machine is slow, use a smaller model:
# ollama pull phi3
```

### 3. Start Ollama
```bash
ollama serve
# Ollama runs on http://localhost:11434
```

### 4. Install & start the backend
```bash
cd backend
npm install
npm start
# Backend runs on http://localhost:3001
```

### 5. Install & start the frontend
```bash
# In a new terminal
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

### 6. Open the app
Navigate to **http://localhost:3000**

Use the "Load sample transcript" dropdown to test with one of the 3 provided transcripts.

---

## Which Model & Why

**Default: `llama3.2` (3.2B parameters)**

Chosen because:
- Runs on most laptops with 8GB RAM
- Follows complex structured JSON prompts reliably
- Good enough instruction following for the rubric mapping task
- Fast enough for a 90-second response time target

**Alternatives if llama3.2 is slow on your machine:**
- `phi3` (3.8B, faster, slightly less accurate)
- `gemma:2b` (lightest option)

**To change models:**
```bash
# Pull the model first
ollama pull mistral

# Then set environment variable before starting backend
OLLAMA_MODEL=mistral npm start
```

---

## Architecture

```
Browser (React + Vite)          Backend (Node/Express)        Ollama (Local LLM)
        │                                │                           │
        │  POST /api/analyze             │                           │
        │ {transcript, fellowName}       │                           │
        ├──────────────────────────────► │                           │
        │                                │  POST /api/generate       │
        │                                │  {model, prompt, ...}     │
        │                                ├──────────────────────────►│
        │                                │                           │
        │                                │  {response: "...JSON..."}  │
        │                                │◄──────────────────────────┤
        │                                │                           │
        │                                │  parse → validate →       │
        │                                │  anti-hallucination check │
        │                                │                           │
        │  {analysis, meta}              │                           │
        │◄────────────────────────────── │                           │
        │                                │                           │
   Renders:                              │
   - Score ring (SVG)                    │
   - Evidence cards (tabs)               │
   - KPI mapping                         │
   - Gap analysis grid                   │
   - Follow-up questions                 │
```

**Frontend:** React 18 + Vite. No UI library. Custom CSS design system with CSS variables. All components are hand-written.

**Backend:** Node.js + Express. Single responsibility: builds the prompt, calls Ollama, parses/validates the response, returns structured JSON.

**LLM:** Ollama running locally. No cloud API calls. No API key required. No data leaves your machine.

---

## Design Challenges Tackled

### Challenge 1: One Prompt vs Many Prompts
**Decision: One comprehensive prompt with strict JSON output.**

Rationale: For a 10-minute transcript, a single prompt is fast enough (< 90s) and avoids coordination complexity between multi-step calls. The quality tradeoff is acceptable because the intern reviews and edits the output — we need draft quality, not perfect quality.

The single prompt is carefully structured with: rubric definitions, KPI definitions, bias detection instructions, layer distinction rules, and the JSON schema. Temperature is set to 0.1 (very low) for consistency.

### Challenge 2: Structured Output Reliability
**Decision: 4-layer fallback parsing with anti-hallucination validation.**

The parser tries in order:
1. Direct `JSON.parse()`
2. Extract content between first `{` and last `}`
3. Strip markdown code fences, then extract
4. Fix common JSON issues (trailing commas) then parse

After parsing, an anti-hallucination check verifies that evidence quotes actually appear in the original transcript (word-level fuzzy matching). Quotes that don't match are dropped and flagged in the meta warnings.

### Challenge 3: Showing Uncertainty & Preventing Automation Bias
**Design decisions to prevent the intern from blindly trusting the AI:**

- Confidence indicator (low/medium/high) shown prominently next to the score
- Every evidence card requires the intern to click "expand" to see the interpretation — the raw quote is shown first, interpretation is gated
- Detected biases are surfaced as red warning badges directly on the score card
- System warnings (e.g. "evidence quote may be hallucinated") are shown in amber
- The UI labels output as "draft analysis" language throughout
- The meta panel shows parse method and processing time — reminds the intern this is a machine output

### Challenge 4: Gap Detection (Reasoning About Absence)
**Decision: Negative-space prompt engineering.**

Rather than asking "what's missing", the prompt asks the model to evaluate each of the 4 dimensions against explicit criteria, then flag dimensions as gaps only when evidence is absent or weak. Each dimension has a "what would count as evidence" description in the prompt, making the absence detection more reliable.

### Challenge 5: Supervisor Bias Detection
**Dedicated bias detection section in the prompt** with 5 named biases: helpfulness bias, presence bias, halo effect, dependency trap, recency bias. The model is instructed to name each one it detects and surface them in `score.biasesDetected`. This is critical for the 3 sample transcripts where all supervisors describe a different bias pattern.

---

## What I'd Improve With More Time

1. **Side-by-side transcript + analysis view** — let the intern highlight a sentence in the transcript and see which evidence card it maps to. Currently, the intern has to mentally cross-reference.

2. **Multi-call pipeline for harder transcripts** — for transcripts where JSON parsing fails, a fallback pipeline: first call extracts evidence as a list, second call scores, third call generates questions. Slower but more reliable.

3. **Score comparison across Fellows** — if the intern runs 5 transcripts, show a dashboard comparing scores, bias patterns, and gap coverage across the cohort.

4. **Editable output** — let the intern edit the score or add/remove evidence items. Save the edited version as the "finalized assessment" separate from the AI draft.

5. **Streaming responses** — show text streaming in real-time instead of the progress animation. Better UX for long transcripts.

6. **Local storage / session history** — remember the last 5 analyses so the intern doesn't lose work on page refresh.

7. **Prompt testing harness** — a CI script that runs all 3 sample transcripts and asserts the scores are within ±1 of the expected range. Makes prompt iteration safe.

---

## Project Structure

```
trinethra/
├── backend/
│   ├── server.js          # Express server, Ollama client, prompt builder, response parser
│   ├── data/
│   │   └── sample-transcripts.json
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx                  # Main layout, input panel, results panel, tab routing
    │   ├── index.css               # Design system (CSS variables, animations, utilities)
    │   ├── components/
    │   │   ├── ScoreDisplay.jsx     # SVG score ring + confidence + bias badges
    │   │   ├── EvidencePanel.jsx    # Evidence cards with filter + expandable interpretation
    │   │   ├── KPIMapping.jsx       # KPI cards with impact bars
    │   │   ├── GapAnalysis.jsx      # Dimension coverage grid + gap cards
    │   │   ├── FollowUpQuestions.jsx # Question cards with copy-to-clipboard
    │   │   ├── LoadingState.jsx      # Animated progress with step indicators
    │   │   └── HealthBanner.jsx      # Ollama connectivity warning
    │   └── utils/
    │       └── api.js               # Fetch wrappers for backend API
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## API Reference

### `GET /api/health`
Returns Ollama connectivity status and available models.

### `GET /api/samples`
Returns the 3 sample transcripts with metadata.

### `GET /api/config`
Returns rubric, KPI definitions, and assessment dimensions.

### `POST /api/analyze`
**Body:**
```json
{
  "transcript": "Full transcript text (100-15000 chars)",
  "fellowName": "Optional fellow name",
  "supervisorName": "Optional supervisor name"
}
```

**Response:**
```json
{
  "requestId": "uuid",
  "analysis": {
    "score": { "value": 6, "label": "Reliable and Productive", "band": "Productivity", "justification": "...", "confidence": "medium", "biasesDetected": ["presence_bias"] },
    "evidence": [...],
    "kpiMapping": [...],
    "gaps": [...],
    "followUpQuestions": [...],
    "executiveSummary": "..."
  },
  "meta": {
    "processingTimeMs": 42000,
    "parseMethod": "direct",
    "model": "llama3.2",
    "warnings": [],
    "timestamp": "..."
  }
}
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Backend server port |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama API endpoint |
| `OLLAMA_MODEL` | `llama3.2` | Model name to use |

---

## Testing

Load the 3 provided sample transcripts and check the scores:

| Fellow | Expected Score | Trap to Avoid |
|--------|---------------|---------------|
| Karthik Narayanan | 6-7 | Supervisor is warm → lazy tool gives 8 |
| Meena Krishnamurthy | 7-8 | Supervisor is critical → lazy tool gives 4 |
| Anil Menon | 5-6 | Supervisor is glowing → lazy tool gives 9 |

If your tool correctly identifies these scores, the prompt engineering is working.

---

## Stack

- **Frontend:** React 18, Vite, custom CSS (no UI library)
- **Backend:** Node.js, Express 4
- **LLM:** Ollama (llama3.2 by default)
- **No database**, no authentication, no deployment required
