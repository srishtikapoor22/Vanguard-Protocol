from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any
import uuid

from context_engine import get_trust_baseline
from auditor import calculate_semantic_delta

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




@app.post("/audit", response_model=AuditResponse)
async def audit_action(request: AuditRequest):
    """
    Audit endpoint that implements the Tiered Auditor logic.

    - Fetches trust baseline / company rules from the context engine
    - If proposed_action involves 'transfer' or 'delete', marks it as Synchronous (blocking)
    - Otherwise, marks it as Asynchronous (background)
    - Returns a transaction_id, semantic delta_score, and the trust_baseline used
    """
    # Generate unique transaction ID
    transaction_id = str(uuid.uuid4())

    # Fetch company rules / trust baseline *before* scoring
    trust_baseline = get_trust_baseline(request.proposed_action)

    # Determine audit mode based on proposed action
    audit_mode = determine_audit_mode(request.proposed_action)

    # Calculate semantic delta score using mission, action, and trust baseline
    delta_score = calculate_semantic_delta(
        request.mission_statement,
        request.proposed_action,
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

