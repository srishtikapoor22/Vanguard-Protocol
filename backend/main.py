from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uuid
import json
import os

from context_engine import get_trust_baseline
from auditor import calculate_semantic_delta
from notary import record_audit_trail

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
    decision: str  # "ALLOW", "FLAG_FOR_REVIEW", or "BLOCK"
    alert_priority: Optional[str] = None  # "CRITICAL" when delta_score > 0.7
    voice_alert_text: Optional[str] = None  # Text for Azure AI Speech alert


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


def determine_decision(delta_score: float) -> str:
    """
    Determine the decision based on delta_score thresholds.
    
    - delta_score > 0.7: BLOCK (high hijacking risk)
    - 0.4 <= delta_score <= 0.7: FLAG_FOR_REVIEW (moderate risk)
    - delta_score < 0.4: ALLOW (low risk, aligned with mission)
    """
    if delta_score > 0.7:
        return "BLOCK"
    elif delta_score >= 0.4:
        return "FLAG_FOR_REVIEW"
    else:
        return "ALLOW"




@app.post("/audit", response_model=AuditResponse)
async def audit_action(request: AuditRequest):
    """
    Audit endpoint that implements the Tiered Auditor logic.

    - Fetches trust baseline / company rules from the context engine
    - If proposed_action involves 'transfer' or 'delete', marks it as Synchronous (blocking)
    - Otherwise, marks it as Asynchronous (background)
    - Returns a transaction_id, semantic delta_score, and the trust_baseline used
    - If delta_score > 0.7, includes alert_priority: "CRITICAL" and voice_alert_text for frontend alerts
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

    # Determine decision based on delta_score
    decision = determine_decision(delta_score)

    # Determine if critical alert is needed (delta_score > 0.7)
    alert_priority = None
    voice_alert_text = None
    if delta_score > 0.7:
        alert_priority = "CRITICAL"
        voice_alert_text = "Warning: High risk intent drift detected. Delta score exceeds threshold."

    # Prepare audit response
    response = AuditResponse(
        transaction_id=transaction_id,
        delta_score=delta_score,
        audit_mode=audit_mode,
        trust_baseline=trust_baseline,
        decision=decision,
        alert_priority=alert_priority,
        voice_alert_text=voice_alert_text,
    )

    # Record immutable audit trail for compliance
    audit_data = {
        "transaction_id": transaction_id,
        "agent_id": request.agent_id,
        "mission_statement": request.mission_statement,
        "proposed_action": request.proposed_action,
        "reasoning_chain": request.reasoning_chain,
        "delta_score": delta_score,
        "audit_mode": audit_mode,
        "decision": decision,
        "trust_baseline": trust_baseline,
    }
    record_audit_trail(audit_data)

    return response


@app.get("/logs")
async def get_audit_logs():
    """
    Retrieve audit history from audits.json.
    Returns all audit records for frontend display of hijacking attempt history.
    """
    audits_file = "audits.json"
    
    if not os.path.exists(audits_file):
        return {"audits": [], "count": 0}
    
    try:
        with open(audits_file, 'r', encoding='utf-8') as f:
            audits = json.load(f)
        
        # Return audits in reverse chronological order (newest first)
        audits.reverse()
        
        return {
            "audits": audits,
            "count": len(audits)
        }
    except (json.JSONDecodeError, IOError) as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to read audit logs: {str(e)}"
        )


@app.get("/")
async def root():
    return {"message": "Vanguard Protocol API", "status": "operational"}

