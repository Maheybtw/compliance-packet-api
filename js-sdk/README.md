# 📦 Compliance Packet — JavaScript / TypeScript SDK

Official **JavaScript / TypeScript client** for the **Compliance Packet API** — a universal safety, copyright, privacy, and compliance scoring layer for AI applications.

This SDK gives you:

- A tiny, promise-based client  
- Strongly-typed `CompliancePacket` responses (when used with TypeScript)  
- Unified error handling (`CompliancePacketAPIError`)  
- Built-in support for `check` and `usage` endpoints  

---

## 📦 Installation

Install from npm:

```bash
npm install compliance-packet
# or
pnpm add compliance-packet
# or
yarn add compliance-packet
```

---

## 🚀 Quickstart

```ts
import {
  createComplianceClient,
  CompliancePacketAPIError,
} from "compliance-packet";

const client = createComplianceClient({
  apiKey: "cpk_your_api_key_here",
  // baseUrl: "http://localhost:4000", // optional override for local dev
});

async function main() {
  try {
    const packet = await client.check("Hello from Compliance Packet!");

    console.log("Decision:", packet.overall.recommendation);
    console.log("Safety score:", packet.safety.score);

    const usage = await client.usage();
    console.log("Usage summary:", usage.summary);
  } catch (err) {
    if (err instanceof CompliancePacketAPIError) {
      console.error("Compliance Packet API error:", {
        code: err.code,
        status: err.status,
        details: err.details,
        message: err.message,
      });
    } else {
      console.error("Unexpected error:", err);
    }
  }
}

main();
```

---

## 🧠 Client API

### `createComplianceClient(options)`

```ts
const client = createComplianceClient({
  apiKey: "cpk_...",
  baseUrl: "https://your-deployed-api-url", // optional, defaults to production
});
```

Options:

- `apiKey` (string, required) — your Compliance Packet API key  
- `baseUrl` (string, optional) — override the API base URL (for local dev, staging, self-hosting, etc.)

---

### `client.check(content: string): Promise<CompliancePacket>`

Run a compliance check on a piece of text:

```ts
const packet = await client.check("some user generated content");
```

Response shape:

```ts
packet.safety.score;
packet.safety.category;
packet.privacy.piiDetected;
packet.copyright.risk;
packet.overall.complianceScore;
packet.meta.inputId;
```

Matches the backend's documented **Compliance Packet** structure.

---

### `client.usage(): Promise<UsageResponse>`

Fetch simple usage stats for the current API key:

```ts
const usage = await client.usage();
console.log(usage.summary.totalChecks);
```

---

## 🔥 Error Handling

All non-2xx responses from the API throw a `CompliancePacketAPIError`.

```ts
import {
  createComplianceClient,
  CompliancePacketAPIError,
} from "compliance-packet";

const client = createComplianceClient({ apiKey: "cpk_..." });

try {
  const packet = await client.check("hello");
} catch (err) {
  if (err instanceof CompliancePacketAPIError) {
    console.error("API error:", err.code, err.status, err.details);
  } else {
    console.error("Unexpected error:", err);
  }
}
```

Error fields:

- `code` — machine-readable error code (e.g. `AUTH_INVALID_API_KEY`, `RATE_LIMIT_EXCEEDED`)  
- `status` — HTTP status code  
- `details` — optional structured error details (e.g. rate limit window/limit)  
- `message` — human-readable explanation  

---

## 🌐 Links

- API Documentation: https://your-frontend-domain.com/docs  
- Python SDK: https://pypi.org/project/compliance-packet/  
- Compliance Packet API: https://github.com/your-org/compliance-packet-api  

---

## ⚠️ Disclaimer

Compliance Packet provides **probabilistic scoring**, not legal advice.  
For high-risk or regulated domains, always add human review.

---

## 📄 License

MIT
