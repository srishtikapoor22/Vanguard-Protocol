from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any
import uuid
import random

from .context_engine import get_trust_baseline

app = FastAPI(title="Vanguard Protocol API", version="1.0.0")


class AuditRequest(BaseModel):
    agent_id: str
    mission_statement: str
    proposed_action: str
    reasoning_chain: List[str]


class AuditResponse(BaseModel):
    transaction_id: str
    delta_score: float
    audit_mode: str  # "Synchronous" or "Asynchronous"
    trust_baseline: Dict[str, Any]


def determine_audit_mode(proposed_action: str) -> str:
    """
    Determine if the audit should be Synchronous (blocking) or Asynchronous (background)
    based on the Tiered Auditor logic from the proposal.

    High-stakes actions like 'transfer' or 'delete' require Synchronous (Gatekeeper) mode.
    Low-risk tasks use Asynchronous (Background) mode.
    """
    action_lower = proposed_action.lower()
    if "transfer" in action_lower or "delete" in action_lower:
        return "Synchronous"
    return "Asynchronous"


def calculate_mock_delta_score(
    mission_statement: str,
    proposed_action: str,
    reasoning_chain: List[str],
    trust_baseline: Dict[str, Any],
) -> float:
    """
    Mock implementation of Semantic Delta Score calculation.
    Returns a random score between 0.0 and 1.0 for MVP purposes.

    The trust_baseline argument models the requirement that the auditor must first
    look up company rules / historical baselines before judging whether an action
    could be Shadow Logic Hijacking.
    """
    # In the real implementation, this would use GPT-4o-mini to calculate
    # the semantic delta between mission and action given context + trust baselines.
    _ = (mission_statement, proposed_action, reasoning_chain, trust_baseline)
    return round(random.uniform(0.0, 1.0), 2)


@app.post("/audit", response_model=AuditResponse)
async def audit_action(request: AuditRequest):
    """
    Audit endpoint that implements the Tiered Auditor logic.

    - Fetches trust baseline / company rules from the context engine
    - If proposed_action involves 'transfer' or 'delete', marks it as Synchronous (blocking)
    - Otherwise, marks it as Asynchronous (background)
    - Returns a transaction_id, mock delta_score, and the trust_baseline used
    """
    # Generate unique transaction ID
    transaction_id = str(uuid.uuid4())

    # Fetch company rules / trust baseline *before* scoring
    trust_baseline = get_trust_baseline(request.proposed_action)

    # Determine audit mode based on proposed action
    audit_mode = determine_audit_mode(request.proposed_action)

    # Calculate mock delta score using mission, action, reasoning, and trust baseline
    delta_score = calculate_mock_delta_score(
        request.mission_statement,
        request.proposed_action,
        request.reasoning_chain,
        trust_baseline,
    )

    return AuditResponse(
        transaction_id=transaction_id,
        delta_score=delta_score,
        audit_mode=audit_mode,
        trust_baseline=trust_baseline,
    )


@app.get("/")
async def root():
    return {"message": "Vanguard Protocol API", "status": "operational"}

