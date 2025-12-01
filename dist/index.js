"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./db");
const llmevaluator_1 = require("./services/llmevaluator");
const crypto_1 = require("crypto");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const app = (0, express_1.default)();
// --- CORS: allow frontend + local dev ---
app.use((0, cors_1.default)({
    origin: true, // reflect the request's Origin header
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// --- Rate limiters ---
const registerLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 registrations per hour per IP
    standardHeaders: true,
    legacyHeaders: false,
});
const checkLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 checks per minute
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const key = req.auth?.apiKeyId;
        // Use per-API-key; if somehow missing, fall back to a shared bucket
        return typeof key === 'string' ? key : 'anonymous';
    },
});
app.use(express_1.default.json());
// --- DB-backed API key auth middleware ---
async function authMiddleware(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
    const token = authHeader.substring('Bearer '.length).trim();
    try {
        const result = await db_1.pool.query(`
      select id, user_id
      from api_keys
      where key = $1
        and active = true
      limit 1;
      `, [token]);
        if (result.rows.length === 0) {
            return res.status(403).json({ error: 'Invalid API key' });
        }
        const row = result.rows[0];
        req.auth = {
            apiKeyId: row.id,
            userId: row.user_id,
        };
        return next();
    }
    catch (err) {
        console.error('Error checking API key', err);
        return res.status(500).json({ error: 'Internal auth error' });
    }
}
// --- Health check ---
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
// --- Simple registration endpoint to create a user + API key ---
app.post('/register', registerLimiter, async (req, res) => {
    const { email, label } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ error: 'A valid "email" field is required.' });
    }
    try {
        // Find or create user
        const existingUser = await db_1.pool.query(`
      select id
      from users
      where email = $1
      limit 1;
      `, [email]);
        let userId;
        if (existingUser.rows.length === 0) {
            const insertedUser = await db_1.pool.query(`
        insert into users (email)
        values ($1)
        returning id;
        `, [email]);
            userId = insertedUser.rows[0].id;
        }
        else {
            userId = existingUser.rows[0].id;
        }
        // Generate a new API key
        const apiKey = `cpk_${(0, crypto_1.randomUUID)().replace(/-/g, '')}`;
        const keyLabel = typeof label === 'string' && label.trim().length > 0 ? label.trim() : 'default';
        await db_1.pool.query(`
      insert into api_keys (user_id, key, label, active)
      values ($1, $2, $3, true);
      `, [userId, apiKey, keyLabel]);
        return res.status(201).json({ apiKey });
    }
    catch (err) {
        console.error('Error during /register', err);
        return res.status(500).json({ error: 'Failed to register user and create API key.' });
    }
});
// --- Usage endpoint: simple per-API-key stats ---
app.get('/usage', authMiddleware, async (req, res) => {
    if (!req.auth) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const summaryResult = await db_1.pool.query(`
      select
        count(*)::int as total_checks,
        coalesce(sum(case when recommendation = 'allow' then 1 else 0 end), 0)::int as allow_count,
        coalesce(sum(case when recommendation = 'review' then 1 else 0 end), 0)::int as review_count,
        coalesce(sum(case when recommendation = 'block' then 1 else 0 end), 0)::int as block_count
      from checks
      where api_key_id = $1;
      `, [req.auth.apiKeyId]);
        const recentResult = await db_1.pool.query(`
      select
        id,
        created_at,
        safety_score,
        safety_category,
        recommendation,
        compliance_score
      from checks
      where api_key_id = $1
      order by created_at desc
      limit 10;
      `, [req.auth.apiKeyId]);
        const summaryRow = summaryResult.rows[0] ?? {
            total_checks: 0,
            allow_count: 0,
            review_count: 0,
            block_count: 0,
        };
        return res.json({
            summary: {
                totalChecks: summaryRow.total_checks,
                allow: summaryRow.allow_count,
                review: summaryRow.review_count,
                block: summaryRow.block_count,
            },
            recent: recentResult.rows,
        });
    }
    catch (err) {
        console.error('Error fetching usage stats', err);
        return res.status(500).json({ error: 'Failed to fetch usage stats.' });
    }
});
// --- Dummy heuristic for Day 1 (no LLM yet) ---
function buildDummyPacket(content) {
    const lower = content.toLowerCase();
    // Safety
    let safetyScore = 0.05;
    let safetyCategory = 'low_risk';
    const safetyFlags = [];
    if (['kill', 'suicide', 'bomb', 'murder'].some((w) => lower.includes(w))) {
        safetyScore = 0.85;
        safetyCategory = 'high_risk';
        safetyFlags.push('self_harm_or_violence');
    }
    // Copyright
    let copyrightRisk = 0.1;
    let copyrightAssessment = 'unlikely_infringing';
    let copyrightReason = 'Heuristic v0 – will be replaced by model-based scoring.';
    if (content.includes('©') || content.includes('"')) {
        copyrightRisk = 0.6;
        copyrightAssessment = 'possible_quote_or_protected_text';
        copyrightReason = 'Detected quote marks or copyright symbol.';
    }
    // Privacy
    let piiDetected = false;
    const piiTypes = [];
    const hasAt = content.includes('@');
    const hasDigits = /\d{6,}/.test(content); // any long number sequence
    if (hasAt) {
        piiDetected = true;
        piiTypes.push('email_like');
    }
    if (hasDigits) {
        piiDetected = true;
        piiTypes.push('numeric_sequence');
    }
    // Overall
    const worstRisk = Math.max(safetyScore, copyrightRisk);
    let recommendation = 'allow';
    if (safetyScore > 0.7) {
        recommendation = 'block';
    }
    else if (safetyScore > 0.4 || copyrightRisk > 0.5) {
        recommendation = 'review';
    }
    const complianceScore = Math.max(0, 1 - worstRisk);
    const safety = {
        score: safetyScore,
        category: safetyCategory,
        flags: safetyFlags,
    };
    const copyright = {
        risk: copyrightRisk,
        assessment: copyrightAssessment,
        reason: copyrightReason,
    };
    const privacy = {
        piiDetected,
        piiTypes,
        notes: [],
    };
    const overall = {
        complianceScore,
        recommendation,
        notes: [],
    };
    const meta = {
        inputId: (0, crypto_1.randomUUID)(),
        checkedAt: new Date().toISOString(),
        modelVersion: 'v0-heuristic',
    };
    return {
        safety,
        copyright,
        privacy,
        overall,
        meta,
    };
}
// --- /check endpoint ---
app.post('/check', authMiddleware, checkLimiter, async (req, res) => {
    const body = req.body;
    if (!body || typeof body.content !== 'string' || body.content.trim().length === 0) {
        return res.status(400).json({ error: 'Missing or invalid "content" field in body.' });
    }
    const content = body.content;
    try {
        const llmPacket = await (0, llmevaluator_1.buildPacketWithLLM)(content);
        const packet = llmPacket ?? buildDummyPacket(content);
        // fire-and-forget logging to DB
        if (req.auth) {
            const contentHash = (0, crypto_1.createHash)('sha256').update(content).digest('hex');
            db_1.pool
                .query(`
          insert into checks (
            user_id,
            api_key_id,
            content_hash,
            safety_score,
            safety_category,
            copyright_risk,
            pii_detected,
            recommendation,
            compliance_score
          ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9);
          `, [
                req.auth.userId,
                req.auth.apiKeyId,
                contentHash,
                packet.safety.score,
                packet.safety.category,
                packet.copyright.risk,
                packet.privacy.piiDetected,
                packet.overall.recommendation,
                packet.overall.complianceScore,
            ])
                .catch((err) => {
                console.error('Error logging check:', err);
            });
        }
        return res.json(packet);
    }
    catch (err) {
        console.error('Error during /check evaluation', err);
        const fallbackPacket = buildDummyPacket(content);
        return res.json(fallbackPacket);
    }
});
// --- Global error handler (last middleware) ---
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    return res.status(500).json({ error: 'Internal server error' });
});
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
    console.log(`Compliance Packet API running on port ${PORT}`);
    console.log('API keys are now managed via the database (api_keys table).');
});
//# sourceMappingURL=index.js.map