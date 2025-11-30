export type SafetyCategory = 'low_risk' | 'medium_risk' | 'high_risk';
export type Recommendation = 'allow' | 'review' | 'block';
export interface SafetyBlock {
    score: number;
    category: SafetyCategory;
    flags: string[];
}
export interface CopyrightBlock {
    risk: number;
    assessment: string;
    reason?: string;
}
export interface PrivacyBlock {
    piiDetected: boolean;
    piiTypes: string[];
    notes: string[];
}
export interface OverallBlock {
    complianceScore: number;
    recommendation: Recommendation;
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
export interface CheckRequestBody {
    content: string;
}
//# sourceMappingURL=packet.d.ts.map