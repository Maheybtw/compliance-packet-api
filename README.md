
⸻

📦 Universal Compliance Packet API

A lightweight, developer-friendly API for generating structured safety, copyright, privacy, and compliance packets from arbitrary text.

This service provides a simple HTTP interface that turns raw text into a consistent Compliance Packet — designed for content filtering, moderation, routing, and trust-layer applications.

Built with:
	•	TypeScript
	•	Node.js + Express
	•	Supabase (Postgres)
	•	OpenAI / LLM-based scoring
	•	Entropy-minimisation principles (AI-native architecture)

⸻

🚀 Quick Start

1. Register & Get Your API Key

Send a POST request to:

POST /register

Body:

{
  "email": "your@email.com",
  "label": "optional key label"
}

Response:

{
  "apiKey": "cpk_1234abcd..."
}

This key authenticates all future requests.

⸻

🔐 Authentication

All protected endpoints require this header:

Authorization: Bearer <API_KEY>

Example:

-H "Authorization: Bearer cpk_1234abcd..."

Invalid or inactive API keys return:

{ "error": "Invalid API key" }


⸻

📝 Check Content

Main endpoint:

POST /check

Headers:

Authorization: Bearer <api-key>
Content-Type: application/json

Body:

{
  "content": "Your text to evaluate"
}

Sample Response (Compliance Packet)

{
  "safety": {
    "score": 0.1,
    "category": "low_risk",
    "flags": []
  },
  "copyright": {
    "risk": 0,
    "assessment": "low risk",
    "reason": "No copyrighted material detected."
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


⸻

📊 Compliance Packet Specification

Every /check returns a complete CompliancePacket:

Safety Block

Field	Type	Meaning
score	number (0–1)	Higher = more dangerous
category	‘low_risk’ | ‘medium_risk’ | ‘high_risk’	Categorised severity
flags	string[]	Specific safety triggers

Copyright Block

Field	Type	Meaning
risk	number (0–1)	Likelihood of infringement
assessment	string	Human-readable assessment
reason	string	Explanation of the scoring

Privacy Block

Field	Type
piiDetected	boolean
piiTypes	string[]
notes	string[]

Overall Block

Field	Type
complianceScore	number
recommendation	‘allow’ | ‘review’ | ‘block’
notes	string[]

Meta Block

Field	Type
inputId	uuid
checkedAt	ISO timestamp
modelVersion	string


⸻

📚 Logging & Auditing

Every /check request automatically logs into Supabase:
	•	user_id
	•	api_key_id
	•	content_hash
	•	safety_score
	•	safety_category
	•	copyright_risk
	•	pii_detected
	•	recommendation
	•	compliance_score
	•	timestamp

This creates instant dashboards for usage, analytics, and billing.

⸻

🧠 Model Architecture (High-Level)
	•	LLM scoring is handled by /services/llmevaluator.ts
	•	If the LLM fails, a robust heuristic fallback runs
	•	Every packet is deterministic, structured, and entropy-minimised
	•	Microservice is intentionally stateless, idempotent, and observable

More advanced model pipelines will be introduced in v2.

⸻

🏗 Roadmap

✅ v1 (current)
	•	API key generation
	•	Database-backed authentication
	•	LLM-based scoring
	•	Logging + analytics
	•	Production-ready REST endpoints

🔜 v2
	•	Rate limiting
	•	Web dashboard
	•	Multi-model evaluation
	•	Prompt-tuned scoring models
	•	Tiered billing
	•	Realtime monitoring

⸻

🛠 Dev Setup
	1.	Clone repo
	2.	Create .env:

PORT=4000
DATABASE_URL=your-postgres-url
OPENAI_API_KEY=your-openai-key

	3.	Install & run:

npm install
npm run dev


⸻

🧩 SDK Usage (Node / TypeScript)

A minimal SDK is included to make it easy to call the API without manually constructing HTTP requests.

Install dependencies (if needed):

npm install

Import and create a client:

import { createComplianceClient } from ‘./src/sdk/client’;

const client = createComplianceClient({
apiKey: ‘cpk_your_key_here’,
baseUrl: ‘http://localhost:4000’ // optional, defaults to localhost
});

Check content:

const packet = await client.check(“Some text to evaluate”);
console.log(packet);

Get usage stats:

const usage = await client.usage();
console.log(usage);

A full usage example is available in src/sdk/test-sdk.ts.

⸻

❤️ License

MIT 

⸻

