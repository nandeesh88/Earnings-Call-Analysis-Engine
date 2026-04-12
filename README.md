# Earnings Call Analysis Engine

A production-grade research engine built for institutional equity analysts.  
Upload an earnings call transcript (PDF or TXT) and receive structured, schema-validated analytical output — not a chatbot summary, but a disciplined research dashboard.

---

## Overview

This system extracts and classifies:

- Management tone  
- Confidence signals  
- Forward guidance characterization  
- Capacity commentary  
- Governance flags  
- Supporting verbatim quotes  
- Explicitly stated operational metrics  

All outputs are validated against a strict JSON schema to prevent hallucination and enforce analytical discipline.

---

## Tech Stack

### Frontend

| Layer | Technology |
|-------|------------|
| Framework | React 18 (TypeScript) |
| Build Tool | Vite |
| Styling | CSS (index.css) |

### Backend

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 18+ / Bun |
| Server | Express.js |
| File Parsing | PDF + TXT extraction via `extract.js` |
| LLM Integration | OpenAI API (`gpt-4o-mini` default) |
| Validation | Custom JSON schema layer (`schema.js`) |

### Infrastructure

| Layer | Technology |
|-------|------------|
| API Proxy | Vite dev proxy → `localhost:3001` |
| Environment | `.env` via `dotenv` |
| Package Management | npm or Bun |

---

## Why This Is Not a Chatbot

| Typical Chatbot | Earnings Call Analysis Engine |
|----------------|--------------------------------|
| Free-form prose | Strict structured JSON schema |
| Optimistic summaries | Conservative labeling logic |
| May hallucinate metrics | Missing values marked `"Not Mentioned"` |
| No validation | Enum + schema validation layer |
| Conversational output | Institutional research dashboard |

---

## Anti-Hallucination Safeguards

The system is intentionally conservative.

1. **System prompt constraints**  
   Model is instructed to use only explicitly stated information.

2. **Low temperature (0.1)**  
   Near-deterministic output.

3. **Conservative defaults**  
   Missing data defaults to `"Not Mentioned"` or neutral classification.

4. **Schema validation layer**  
   - Required field validation  
   - Enum enforcement  
   - Structured fallback normalization  
   - Strict quote formatting  

5. **No inferred numbers**  
   If a metric is not stated verbatim, it is classified as `"Vague"` or `"Not Mentioned"`.

6. **Transcript truncation control**  
   Input capped at ~14,000 characters to stay within reliable context windows.  
   Priority given to management commentary over Q&A.

---

## Schema Validation Layer

After the LLM response:

- Ensures all required fields exist  
- Enforces allowed enum values (case-insensitive matching)  
- Normalizes invalid fields to safe defaults  
- Guarantees arrays are never null  
- Validates quote objects and section labels  
- Rejects malformed JSON with structured error  

This ensures analytical reliability over generative creativity.

---

## Handling Missing Data

The system explicitly encodes absence:

| Category | Behavior |
|----------|----------|
| Forward guidance | `"Not Mentioned"` if absent |
| Capacity utilization | `"Not Mentioned"` if not discussed |
| Working capital | `"Not Mentioned"` if no balance sheet commentary |
| Governance flags | Empty array (no false positives) |

No fabricated inferences.

---

## Limitations

- **PDF parsing**  
  Complex PDFs (tables/images) may lose formatting. Text-based PDFs perform best.

- **Transcript truncation**  
  Content beyond ~14,000 characters is truncated.

- **LLM dependency**  
  Requires OpenAI API key. Output quality depends on model capability.

- **Single transcript analysis**  
  No cross-quarter comparison engine (yet).

---

## Running Locally

### Prerequisites

- Node.js 18+ or Bun  
- OpenAI API key  

---

### Backend Setup

```bash
cd backend
cp .env.example .env
# Add your OPENAI_API_KEY inside .env

bun install    # or npm install
bun run dev    # or npm run dev
```

Backend runs at:

```
http://localhost:3001
```

---

### Frontend Setup (New Terminal)

```bash
cd frontend
bun install    # or npm install
bun dev        # or npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

API requests are proxied to the backend.

---

## Test Using Example Transcript

Via Web UI:
Upload:

```
backend/example-transcript.txt
```

Or via curl:

```bash
curl -X POST http://localhost:3001/analyze \
  -F "file=@backend/example-transcript.txt"
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| OPENAI_API_KEY | Yes | — | OpenAI API key |
| OPENAI_MODEL | No | gpt-4o-mini | Model selection |
| PORT | No | 3001 | Backend server port |

---

## Project Structure

```
├── backend/
│   ├── server.js          # Express server + /analyze endpoint
│   ├── extract.js         # PDF/TXT text extraction
│   ├── analyze.js         # LLM integration + system prompt
│   ├── schema.js          # Schema validation + normalization
│   ├── example-transcript.txt
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── Upload.tsx
│   │   ├── Dashboard.tsx
│   │   ├── types.ts
│   │   ├── main.tsx
│   │   └── index.css
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

---

## Architectural Design Principles

- Deterministic > Creative  
- Conservative classification > Speculative inference  
- Schema validation > Blind trust in LLM  
- Institutional clarity > Conversational tone  

---

## Future Enhancements

- Multi-quarter comparison engine  
- Financial metric extraction layer  
- Historical tone tracking  
- Analyst sentiment delta scoring  
- Persistent transcript storage  
- Deployment-ready containerization  

---

## License

Internal research tool.  
Not financial advice.
