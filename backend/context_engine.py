from typing import Dict
import re


def get_trust_baseline(proposed_action: str) -> Dict[str, str]:
    """
    Simulate a lookup in Azure AI Search for business policies / trust baselines.

    - If the proposed_action appears to mention a specific vendor (e.g. "Acme Corp"),
      return a mock "Approved Vendor" policy.
    - Otherwise, return a more generic "General Safety Policy".

    This models the idea that the auditor must look up company rules and historical
    baselines before judging whether an action could be Shadow Logic Hijacking.
    """
    text = proposed_action.strip()

    # Very lightweight heuristic for detecting a "vendor-like" name:
    # look for patterns like "<Word> Corp", "<Word> Inc", etc.
    vendor_pattern = re.compile(
        r"\b([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)*)\s+"
        r"(Corp|Corporation|Inc|LLC|Ltd|Limited|GmbH|PLC)\b"
    )

    match = vendor_pattern.search(text)
    if match:
        vendor_name = f"{match.group(1)} {match.group(2)}"
        return {
            "policy_type": "Approved Vendor Policy",
            "vendor": vendor_name,
            "description": (
                "Vendor appears in the approved vendor baseline. "
                "Verify invoice details and anomaly scores before authorizing transfers."
            ),
        }

    # Fallback: generic safety / compliance baseline
    return {
        "policy_type": "General Safety Policy",
        "description": (
            "Apply standard company risk controls. "
            "Check for unusual recipients, large transfers, and deletion of critical data."
        ),
    }


