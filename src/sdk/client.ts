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
  baseUrl?: string; // default: production API base, or localhost in dev
}

/**
 * Error type thrown by the Compliance Packet client when the API
 * returns a non-2xx response using the universal error schema:
 *
 * {
 *   "error": {
 *     "code": string;
 *     "message": string;
 *     "status": number;
 *     "details"?: unknown;
 *   }
 * }
 */
export class CompliancePacketAPIError extends Error {
  code: string;
  status: number;
  details?: any;

  constructor(code: string, message: string, status: number, details?: any) {
    super(message);
    this.name = 'CompliancePacketAPIError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
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
  if (!options.apiKey || typeof options.apiKey !== 'string') {
    throw new Error('apiKey is required to create the Compliance client.');
  }

  const apiKey = options.apiKey.trim();

  // Default base URL: production API base, can be overridden via options.baseUrl.
  const defaultBase = 'https://compliance-packet-api-production.up.railway.app';

  const baseUrl = (options.baseUrl ?? defaultBase).replace(/\/+$/, '');

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

    const contentType = res.headers.get('content-type') || '';
    const body =
      contentType.includes('application/json')
        ? await res.json().catch(() => null)
        : await res.text().catch(() => null);

    if (!res.ok) {
      // Expect the universal error format: { error: { code, message, status, details? } }
      let errPayload: any = null;
      if (body && typeof body === 'object' && 'error' in body) {
        errPayload = (body as any).error;
      }

      if (errPayload && typeof errPayload === 'object') {
        throw new CompliancePacketAPIError(
          errPayload.code ?? 'UNKNOWN_ERROR',
          errPayload.message ?? 'Request failed',
          errPayload.status ?? res.status,
          errPayload.details
        );
      }

      // Fallback if the shape is unexpected
      throw new CompliancePacketAPIError(
        'HTTP_ERROR',
        `Request failed with status ${res.status}`,
        res.status
      );
    }

    return body as T;
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