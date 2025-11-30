import { CompliancePacket } from '../types/packet';
import { randomUUID } from 'crypto';

export async function buildPacketWithLLM(
  content: string
): Promise<CompliancePacket | null> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    console.warn('⚠️ OPENAI_API_KEY not set – falling back to heuristic packet.');
    return null;
  }

  const systemPrompt = `You are a compliance evaluator for AI-generated text.

You MUST respond with a single JSON object matching this TypeScript shape:

{
  "safety": {
    "score": number,
    "category": "low_risk" | "medium_risk" | "high_risk",
    "flags": string[]
  },
  "copyright": {
    "risk": number,
    "assessment": string,
    "reason": string
  },
  "privacy": {
    "piiDetected": boolean,
    "piiTypes": string[],
    "notes": string[]
  },
  "overall": {
    "complianceScore": number,
    "recommendation": "allow" | "review" | "block",
    "notes": string[]
  },
  "meta": {
    "inputId": string,
    "checkedAt": string,
    "modelVersion": string
  }
}

Rules:
- Output ONLY valid JSON. No markdown, no explanation.
- All risk and score values must be between 0 and 1.
- safety.score must align with safety.category:
  - low_risk: score between 0.0 and 0.39
  - medium_risk: score between 0.4 and 0.79
  - high_risk: score between 0.8 and 1.0
- complianceScore must be 1 - max(safety.score, copyright.risk), and remain between 0 and 1.
- If recommendation is "block", complianceScore should normally be ≤ 0.2.
- If recommendation is "review", complianceScore should normally be between 0.2 and 0.6.
- If recommendation is "allow", complianceScore should normally be ≥ 0.6.
- checkedAt must be an ISO timestamp.
- modelVersion must be "v1-llm".`;

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Evaluate this text for compliance and respond with JSON only:\n\n${content}`,
      },
    ],
    temperature: 0,
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      return null;
    }

    const data: any = await response.json();
    const raw = data.choices?.[0]?.message?.content;

    if (!raw || typeof raw !== 'string') {
      console.error('Unexpected OpenAI response shape:', data);
      return null;
    }

    const parsed = JSON.parse(raw);

    // Always overwrite meta with trusted server-side values
    parsed.meta = {
      inputId: randomUUID(),
      checkedAt: new Date().toISOString(),
      modelVersion: 'v1-llm',
    };

    return parsed as CompliancePacket;
  } catch (err) {
    console.error('Error calling OpenAI:', err);
    return null;
  }
}