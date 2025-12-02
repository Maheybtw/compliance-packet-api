

# 🐍 Compliance Packet — Python SDK

Official **Python client** for the **Compliance Packet API** — a universal safety, copyright, privacy, and compliance scoring system for AI applications.

This SDK provides a clean, typed interface for:

- Running compliance checks  
- Retrieving usage statistics  
- Handling structured errors  
- Integrating moderation into Python agents, backends, and workflows  

---

## 📦 Installation

Install from PyPI:

```bash
pip install compliance-packet
```

---

## 🚀 Quickstart

```python
from compliance_packet import ComplianceClient, CompliancePacketError

client = ComplianceClient(api_key="cpk_your_key_here")

try:
    packet = client.check("Hello, world!")
    print("Safety:", packet.safety.score)
    print("Recommendation:", packet.overall.recommendation)

    usage = client.usage()
    print("Checks used:", usage.summary["totalChecks"])

except CompliancePacketError as e:
    print("API error:", e.code, "-", e.message)
```

---

## 🧠 API Overview

### Initialize client
```python
client = ComplianceClient(api_key="cpk_1234")
```

### Run a compliance check
```python
packet = client.check("some text")
```

### Response structure
Each check returns a structured **CompliancePacket**:

```python
packet.safety.score
packet.safety.category
packet.privacy.piiDetected
packet.copyright.assessment
packet.overall.complianceScore
packet.meta.inputId
```

Full packet fields mirror the backend specification.

---

## 🔥 Error Handling

All API errors raise `CompliancePacketError`.

Each error has:

- `code` — machine-readable code  
- `message` — human-readable explanation  
- `status` — HTTP status code  

Example:

```python
try:
    client.check("hello")
except CompliancePacketError as err:
    print(err.code)       # "AUTH_INVALID_API_KEY"
    print(err.message)    # "Invalid or inactive API key."
    print(err.status)     # 401
```

---

## 📊 Usage Endpoint

```python
usage = client.usage()
print(usage.summary)
```

Example summary:

```python
{
  "totalChecks": 42,
  "allow": 40,
  "review": 1,
  "block": 1
}
```

---

## 🔒 Authentication

All requests require:

```python
client = ComplianceClient(api_key="cpk_xxx")
```

If the key is invalid, a `CompliancePacketError` is raised with:

```
code: AUTH_INVALID_API_KEY
status: 401
```

---

## 🛠 Development

Install editable version:

```bash
pip install -e .
```

Run tests:

```bash
python test-client.py
```

---

## 🌐 Links

- API Documentation: https://your-frontend-domain.com/docs  
- JavaScript SDK: https://www.npmjs.com/package/compliance-packet  
- Python SDK (PyPI): https://pypi.org/project/compliance-packet/

---

## ⚠️ Disclaimer

Compliance Packet provides **probabilistic analysis**, not legal advice.  
Use human review for high-stakes or regulated applications.

---

## 📄 License

MIT