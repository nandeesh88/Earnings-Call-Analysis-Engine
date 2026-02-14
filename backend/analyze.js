import OpenAI from 'openai';
import { validateAndNormalize } from './schema.js';

const SYSTEM_PROMPT = `You are an institutional equity research analyst. Your job is to analyze earnings call transcripts and produce structured JSON output.

STRICT RULES:
1. Use ONLY information explicitly stated in the transcript. 
2. Do NOT infer, estimate, or fabricate any numbers, percentages, or metrics not directly stated.
3. If guidance is unclear or qualitative only → mark as "Vague".
4. If a topic is not discussed at all → mark as "Not Mentioned".
5. Tone must reflect the actual language strength and emphasis used by management.
6. Confidence level must reflect specificity of statements vs ambiguity.
7. Provide at least 2 supporting quotes when available, taken verbatim from the transcript.
8. Prioritize conservatism over optimism in all classifications.
9. Return ONLY valid JSON. No markdown. No commentary. No wrapping.

CLASSIFICATION RULES:
- If transcript contains significant accounting clarification or audit discussion → populate governance_or_accounting_flags array.
- If high receivables or working capital pressure is discussed → working_capital_commentary = "Elevated".
- If capacity ramp-up or expansion is discussed → capacity_utilization = "Improving".
- If margin expansion language exists without specific numeric targets → forward_guidance.margins = "Vague".
- If an explicit numeric target is stated for revenue/margins/capex → classify that field as "Explicit".
- Arrays must have 3-5 items when content is available. Never fewer than 1 if topic is discussed.

OUTPUT SCHEMA (return exactly this structure):
{
  "company_name": "string or Not Mentioned",
  "call_date": "string or Not Mentioned",
  "management_tone": "Optimistic | Neutral | Cautious | Pessimistic",
  "confidence_level": "High | Medium | Low",
  "key_positives": ["string array, 3-5 items"],
  "key_concerns": ["string array, 3-5 items"],
  "forward_guidance": {
    "revenue": "Explicit | Vague | Not Mentioned",
    "margins": "Explicit | Vague | Not Mentioned",
    "capex": "Explicit | Vague | Not Mentioned"
  },
  "capacity_utilization": "Improving | Stable | Declining | Not Mentioned",
  "growth_initiatives": ["string array"],
  "working_capital_commentary": "Improving | Elevated | Stable | Not Mentioned",
  "governance_or_accounting_flags": ["string array, empty if none"],
  "supporting_quotes": [
    {
      "quote": "exact quote from transcript",
      "section": "Management Commentary | Q&A"
    }
  ]
}`;

const MODEL = 'llama-3.3-70b-versatile';
const MAX_TRANSCRIPT_CHARS = 14000;

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

export async function analyzeTranscript(rawText) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const truncated = rawText.slice(0, MAX_TRANSCRIPT_CHARS);
  const wasTruncated = rawText.length > MAX_TRANSCRIPT_CHARS;

  let completion;
  try {
    completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.1,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Analyze the following earnings call transcript and return structured JSON only.\n\nTRANSCRIPT:\n${truncated}`,
        },
      ],
    });
  } catch (err) {
    if (err.status === 401) {
      throw new Error('Invalid GROQ_API_KEY. Check your API key configuration.');
    }
    if (err.status === 429) {
      throw new Error('Groq rate limit exceeded. Please try again later.');
    }
    throw new Error(`Groq API error: ${err.message}`);
  }

  const llmText = completion.choices[0]?.message?.content;

  if (!llmText) {
    throw new Error('LLM returned empty response');
  }

  // Strip potential markdown fences
  const cleaned = llmText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`LLM returned invalid JSON: ${cleaned.slice(0, 200)}`);
  }

  const validated = validateAndNormalize(parsed);
  validated._meta = {
    analyzed_at: new Date().toISOString(),
    transcript_chars: rawText.length,
    truncated: wasTruncated,
    model: MODEL,
  };

  return validated;
}
