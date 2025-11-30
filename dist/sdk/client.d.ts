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
    baseUrl?: string;
}
/**
 * Minimal client for the Compliance Packet API.
 *
 * Usage:
 *   const client = createComplianceClient({ apiKey: 'cpk_...' });
 *   const packet = await client.check('some text');
 *   const usage = await client.usage();
 */
export declare function createComplianceClient(options: ComplianceClientOptions): {
    /**
     * Check a piece of content and get back a Compliance Packet.
     */
    check(content: string): Promise<CompliancePacket>;
    /**
     * Get simple usage stats for the current API key.
     */
    usage(): Promise<UsageResponse>;
};
//# sourceMappingURL=client.d.ts.map