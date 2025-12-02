import os
from compliance_packet import ComplianceClient, CompliancePacketError


def main():
    # Prefer environment variable so you don't hard-code secrets
    # In your shell: export CP_API_KEY="cpk_your_real_key_here"
    api_key = os.getenv("CP_API_KEY", "cpk_your_key_here")

    # Use your deployed backend
    client = ComplianceClient(
        api_key=api_key,
        base_url="https://compliance-packet-api-production.up.railway.app",
    )

    print("---- Testing check() ----")
    try:
        packet = client.check("hello from python test tool")
        print("Compliance Packet:")
        print("  Recommendation:", packet.overall.recommendation)
        print("  Compliance Score:", packet.overall.complianceScore)
        print("  Input ID:", packet.meta.inputId)

    except CompliancePacketError as e:
        print("\nAPI Error:")
        print("  Code:", e.code)
        print("  Status:", e.status)
        print("  Details:", e.details)
        return

    print("\n---- Testing usage() ----")
    try:
        usage = client.usage()
        print("Usage Summary:", usage["summary"])
    except CompliancePacketError as e:
        print("\nAPI Error:")
        print("  Code:", e.code)
        print("  Status:", e.status)
        print("  Details:", e.details)


if __name__ == "__main__":
    main()