# 📦 Universal Compliance Packet API  
**AI‑native safety, copyright, privacy, and compliance scoring — in one unified packet.**  
A production-grade API for trust layers, moderation pipelines, and AI agents.

---

## 🚀 What This Is  
Compliance Packet converts *any text* into a structured, deterministic “compliance packet” containing:

- **Safety risk scoring**  
- **Copyright & IP risk analysis**  
- **Privacy & PII detection**  
- **Overall compliance recommendation**  
- **Meta fields for auditing and routing**

Built for developers who want a **single, stable interface** for trust/safety logic across any AI system.

---

## ✨ Why Developers Use This  
- 🔒 *Consistent*: Always returns the same schema  
- ⚡ *Fast*: Lightweight, stateless API  
- 🧠 *LLM‑powered*: Scoring powered by OpenAI + fallback heuristics  
- 🧩 *Easily pluggable*: SDKs for JavaScript & Python  
- 📊 *Analytics-ready*: Automatic logging in Supabase  
- 🛠 *Production-friendly*: Typed errors, rate limits, stable endpoints

---

# 1. 🔑 Get Your API Key

### Endpoint  
```
POST /register
```

### Body
```json
{
  "email": "your@email.com",
  "label": "optional label"
}
```

### Response
```json
{ "apiKey": "cpk_1234abcd..." }
```

This key is used for all authenticated requests.

---

# 2. 🔐 Authentication

Every protected endpoint requires:

```
Authorization: Bearer <API_KEY>
```

Invalid or missing keys return a typed error:

```json
{
  "error": "AUTH_INVALID_API_KEY",
  "message": "Invalid or inactive API key."
}
```

---

# 3. 📝 Check Content

### Endpoint  
```
POST /check
```

### Body
```json
{ "content": "Text to evaluate." }
```

### Sample Response
```json
{
  "safety": {
    "score": 0.1,
    "category": "low_risk",
    "flags": []
  },
  "copyright": {
    "risk": 0.1,
    "assessment": "low risk of copyright infringement",
    "reason": "The text is generic and not proprietary."
  },
  "privacy": {
    "piiDetected": false,
    "piiTypes": [],
    "notes": []
  },
  "overall": {
    "complianceScore": 0.9,
    "recommendation": "allow",
    "notes": []
  },
  "meta": {
    "inputId": "uuid",
    "checkedAt": "timestamp",
    "modelVersion": "v1-llm"
  }
}
```

---

# 4. 📊 Compliance Packet Specification

### **Safety**
| Field | Type | Meaning |
|-------|-------|---------|
| score | number (0–1) | Higher = more dangerous |
| category | low_risk / medium_risk / high_risk | Severity |
| flags | string[] | Trigger categories |

### **Copyright**
| Field | Type | Meaning |
|-------|-------|---------|
| risk | number | Probability of infringement |
| assessment | string | Human-readable summary |
| reason | string | Explanation |

### **Privacy**
| Field | Type |
|-------|-------|
| piiDetected | boolean |
| piiTypes | string[] |
| notes | string[] |

### **Overall**
| Field | Type |
|-------|-------|
| complianceScore | number |
| recommendation | allow / review / block |
| notes | string[] |

### **Meta**
| Field | Type |
|-------|-------|
| inputId | uuid |
| checkedAt | ISO timestamp |
| modelVersion | string |

---

# 5. 📚 Logging & Audit Trail

Every `/check` is automatically saved to Supabase:

- user_id  
- api_key_id  
- content hash  
- safety score + category  
- copyright risk  
- PII detection  
- final recommendation  
- compliance score  
- timestamp  

Perfect for billing, analytics, dashboards, or internal audits.

---

# 6. 🧠 Architecture Overview

- LLM scoring handled via `services/llmevaluator.ts`  
- Deterministic fallback ensures robustness if LLM fails  
- Entropy-minimised scoring for stable, repeatable results  
- Stateless microservice = horizontally scalable  
- Typed error schema across all SDKs  

---

# 7. 🛠 Dev Setup

Clone & install:

```sh
git clone https://github.com/your-org/compliance-packet-api
cd compliance-packet-api
npm install
```

Environment:

```
PORT=4000
DATABASE_URL=your-postgres-url
OPENAI_API_KEY=your-key
```

Run locally:

```sh
npm run dev
```

---

# 8. 🧩 SDKs

## JavaScript / TypeScript

Install:

```sh
npm install compliance-packet
```

Usage:

```ts
import { createComplianceClient } from "compliance-packet";

const client = createComplianceClient({ apiKey: "cpk_xxx" });

const packet = await client.check("Text to evaluate");
const usage = await client.usage();
```

---

## Python

Install:

```sh
pip install compliance-packet
```

Usage:

```python
from compliance_packet import ComplianceClient

client = ComplianceClient(api_key="cpk_xxx")

packet = client.check("Text to evaluate")
usage = client.usage()
```

---

# 9. 🚦 Status Endpoint

```
GET /status
```

Returns:

```json
{ "status": "ok" }
```

Used for health checks and monitoring.

---

# 10. 🛤 Roadmap

### ✅ v1 (Current)
- API keys  
- Auth middleware  
- LLM evaluation  
- Fallback heuristics  
- Logs + analytics  
- JS/TS + Python SDKs  
- Status endpoint  
- Unified error schema  

### 🔜 v2
- Dashboard with charts  
- Webhooks + async mode  
- Tiered billing  
- Multi-model evaluation  
- Real-time moderation streams  

---

# 11. ⚠️ Limitations & Disclaimer

Compliance Packet provides **probabilistic scoring**, not legal advice.  
It should not be the *sole* decision-maker in high-stakes environments.  
Always add human review for safety‑critical applications.

---

# ❤️ License  
MIT
