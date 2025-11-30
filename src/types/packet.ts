// src/types/packet.ts
export type SafetyCategory = 'low_risk' | 'medium_risk' | 'high_risk';
export type Recommendation = 'allow' | 'review' | 'block';

export interface SafetyBlock {
  score: number; // 0–1
  category: SafetyCategory;
  flags: string[]; // e.g. ["violence", "self_harm"]
}

export interface CopyrightBlock {
  risk: number; // 0–1
  assessment: string; // e.g. "unlikely_infringing"
  reason?: string;
}

export interface PrivacyBlock {
  piiDetected: boolean;
  piiTypes: string[]; // e.g. ["email", "phone_number"]
  notes: string[];
}

export interface OverallBlock {
  complianceScore: number; // 0–1
  recommendation: Recommendation;
  notes: string[];
}

export interface MetaBlock {
  inputId: string;      // uuid
  checkedAt: string;    // ISO timestamp
  modelVersion: string; // e.g. "v0"
}

export interface CompliancePacket {
  safety: SafetyBlock;
  copyright: CopyrightBlock;
  privacy: PrivacyBlock;
  overall: OverallBlock;
  meta: MetaBlock;
}

export interface CheckRequestBody {
  content: string;
}