import json
import os
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, TypedDict

import requests


# ---- Types matching your Compliance Packet schema ----


@dataclass
class SafetyBlock:
    score: float
    category: str  # "low_risk" | "medium_risk" | "high_risk"
    flags: List[str]


@dataclass
class CopyrightBlock:
    risk: float
    assessment: str
    reason: str


@dataclass
class PrivacyBlock:
    piiDetected: bool
    piiTypes: List[str]
    notes: List[str]


@dataclass
class OverallBlock:
    complianceScore: float
    recommendation: str  # "allow" | "review" | "block"
    notes: List[str]


@dataclass
class MetaBlock:
    inputId: str
    checkedAt: str
    modelVersion: str


@dataclass
class CompliancePacket:
    safety: SafetyBlock
    copyright: CopyrightBlock
    privacy: PrivacyBlock
    overall: OverallBlock
    meta: MetaBlock


class UsageSummary(TypedDict):
    totalChecks: int
    allow: int
    review: int
    block: int


class UsageRecentItem(TypedDict, total=False):
    id: str
    created_at: str
    safety_score: Optional[float]
    safety_category: Optional[str]
    recommendation: Optional[str]
    compliance_score: Optional[float]


class UsageResponse(TypedDict):
    summary: UsageSummary
    recent: List[UsageRecentItem]


class ComplianceClientError(Exception):
    """Custom error for Compliance Client request failures."""

    def __init__(self, message: str, status: Optional[int] = None, body: Any = None):
        super().__init__(message)
        self.status = status
        self.body = body


class ComplianceClient:
    """
    Minimal Python client for the Compliance Packet API.

    Usage:

        from python_sdk.client import ComplianceClient

        client = ComplianceClient(
            api_key="cpk_...",
            base_url="https://compliance-packet-api-production.up.railway.app",
        )

        packet = client.check("Some content to evaluate")
        print(packet.overall.recommendation)
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout: float = 10.0,
    ) -> None:
        self.api_key = api_key or os.getenv("COMPLIANCE_API_KEY")
        if not self.api_key:
            raise ValueError(
                "api_key is required (pass it explicitly or set COMPLIANCE_API_KEY)."
            )

        # Default to localhost for local dev; override in production.
        default_base = "http://localhost:4000"
        self.base_url = (base_url or os.getenv("COMPLIANCE_API_URL") or default_base).rstrip(
            "/"
        )
        self.timeout = timeout

    def _request(self, method: str, path: str, json_body: Any = None) -> Any:
        url = f"{self.base_url}{path}"

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        try:
            resp = requests.request(
                method=method,
                url=url,
                headers=headers,
                json=json_body,
                timeout=self.timeout,
            )
        except requests.RequestException as e:
            raise ComplianceClientError(f"Request to {url} failed: {e}") from e

        text = resp.text
        data: Any = None
        if text:
            try:
                data = resp.json()
            except json.JSONDecodeError:
                data = text

        if not resp.ok:
            message = (
                (isinstance(data, dict) and (data.get("error") or data.get("message")))
                or f"Request failed with status {resp.status_code}"
            )
            raise ComplianceClientError(message, status=resp.status_code, body=data)

        return data

    # ---- Public methods ----

    def check(self, content: str) -> CompliancePacket:
        """
        Check a piece of content and return a CompliancePacket.
        """
        if not isinstance(content, str) or not content.strip():
            raise ValueError("content must be a non-empty string")

        data = self._request("POST", "/check", json_body={"content": content})

        # Map dict -> dataclasses for convenience
        safety = SafetyBlock(**data["safety"])
        copyright_block = CopyrightBlock(**data["copyright"])
        privacy = PrivacyBlock(**data["privacy"])
        overall = OverallBlock(**data["overall"])
        meta = MetaBlock(**data["meta"])

        return CompliancePacket(
            safety=safety,
            copyright=copyright_block,
            privacy=privacy,
            overall=overall,
            meta=meta,
        )

    def usage(self) -> UsageResponse:
        """
        Get usage summary for the current API key.
        """
        data = self._request("GET", "/usage")
        # typing-only; data is already shaped as UsageResponse
        return data  # type: ignore[return-value]