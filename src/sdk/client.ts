// src/sdk/client.ts

export interface SafetyBlock {
  score: number;
  category: 'low_risk' | 'medium_risk' | 'high_risk';
  flags: string[];
}

export interface CopyrightBlock {
  risk: number;
  assessment: string;
  reason: string;
}

export interface PrivacyBlock {
  piiDetected: boolean;
  piiTypes: string[];
  notes: string[];
}

export interface OverallBlock {
  complianceScore: number;
  recommendation: 'allow' | 'review' | 'block';
  notes: string[];
}

export interface MetaBlock {
  inputId: string;
  checkedAt: string;
  modelVersion: string;
}

export interface CompliancePacket {
  safety: SafetyBlock;
  copyright: CopyrightBlock;
  privacy: PrivacyBlock;
  overall: OverallBlock;
  meta: MetaBlock;
}

export interface UsageSummary {
  totalChecks: number;
  allow: number;
  review: number;
  block: number;
}

export interface UsageResponse {
  summary: UsageSummary;
  recent: Array<{
    id: string;
    created_at: string;
    safety_score: number | null;
    safety_category: string | null;
    recommendation: string | null;
    compliance_score: number | null;
  }>;
}

export interface ComplianceClientOptions {
  apiKey: string;
  baseUrl?: string; // default: http://localhost:4000
}

/**
 * Minimal client for the Compliance Packet API.
 *
 * Usage:
 *   const client = createComplianceClient({ apiKey: 'cpk_...' });
 *   const packet = await client.check('some text');
 *   const usage = await client.usage();
 */
export function createComplianceClient(options: ComplianceClientOptions) {
  const baseUrl = (options.baseUrl ?? 'http://localhost:4000').replace(/\/+$/, '');
  const apiKey = options.apiKey;

  if (!apiKey || typeof apiKey !== 'string') {
    throw new Error('apiKey is required to create the Compliance client.');
  }

  async function request<T>(path: string, init: RequestInit): Promise<T> {
    const url = `${baseUrl}${path}`;

    const res = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...(init.headers || {}),
      },
    });

    const text = await res.text();
    let json: any = null;

    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        // leave json as null if it wasn't valid JSON
      }
    }

    if (!res.ok) {
      const message =
        (json && (json.error || json.message)) ||
        `Request failed with status ${res.status}`;
      const err = new Error(message);
      (err as any).status = res.status;
      (err as any).body = json ?? text;
      throw err;
    }

    return json as T;
  }

  return {
    /**
     * Check a piece of content and get back a Compliance Packet.
     */
    async check(content: string): Promise<CompliancePacket> {
      if (!content || typeof content !== 'string') {
        throw new Error('content must be a non-empty string');
      }

      return request<CompliancePacket>('/check', {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
    },

    /**
     * Get simple usage stats for the current API key.
     */
    async usage(): Promise<UsageResponse> {
      return request<UsageResponse>('/usage', {
        method: 'GET',
      });
    },
  };
}