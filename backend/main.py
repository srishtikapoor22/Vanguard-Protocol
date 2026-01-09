from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import uuid
import json
import os
from fastapi.middleware.cors import CORSMiddleware
from context_engine import get_trust_baseline
from auditor import calculate_semantic_delta
from notary import record_audit_trail
import time

app = FastAPI(title="Vanguard Protocol API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


class PolicyRequest(BaseModel):
    corporate_mission: str
    approved_vendors: List[str]


class PolicyResponse(BaseModel):
    message: str
    corporate_mission: str
    approved_vendors: List[str]
    updated_at: str


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
    # 1. Setup IDs and Timing
    transaction_id = str(uuid.uuid4())
    current_time = time.strftime("%H:%M:%S")

    # 2. Run Logic
    trust_baseline = get_trust_baseline(request.proposed_action)
    audit_mode = determine_audit_mode(request.proposed_action)
    delta_score = calculate_semantic_delta(
        request.mission_statement,
        request.proposed_action,
        trust_baseline,
    )
    decision = determine_decision(delta_score)

    # 3. Create the data object for the JSON file
    # We use 'request' to match your function argument
    audit_data = {
        "id": transaction_id[:8], 
        "timestamp": current_time,
        "agent_id": request.agent_id,
        "mission_statement": request.mission_statement,
        "proposed_action": request.proposed_action,
        "reasoning_chain": request.reasoning_chain,
        "delta_score": delta_score,
        "decision": decision,
        "audit_mode": audit_mode,
        "trust_baseline": trust_baseline,
    }
    
    # Save to audits.json
    record_audit_trail(audit_data)

    # 4. Prepare and return response
    return AuditResponse(
        transaction_id=transaction_id,
        delta_score=delta_score,
        audit_mode=audit_mode,
        trust_baseline=trust_baseline,
        decision=decision,
        alert_priority="CRITICAL" if delta_score > 0.7 else None,
        voice_alert_text="High risk intent drift detected" if delta_score > 0.7 else None,
    )

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


@app.post("/policy", response_model=PolicyResponse)
async def update_policy(request: PolicyRequest):
    """
    Update corporate mission and approved vendors policy.
    This data will be used to update the Azure AI Search index for trust baseline evaluation.
    """
    policy_file = "policy.json"
    
    policy_data = {
        "corporate_mission": request.corporate_mission,
        "approved_vendors": request.approved_vendors,
        "updated_at": datetime.utcnow().isoformat() + "Z",
    }
    
    try:
        with open(policy_file, 'w', encoding='utf-8') as f:
            json.dump(policy_data, f, indent=2, ensure_ascii=False)
        
        return PolicyResponse(
            message="Policy configuration saved successfully. Ready for Azure AI Search index update.",
            corporate_mission=request.corporate_mission,
            approved_vendors=request.approved_vendors,
            updated_at=policy_data["updated_at"],
        )
    except IOError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save policy: {str(e)}"
        )


@app.get("/analytics")
async def get_analytics():
    """
    Get analytics data for the dashboard.
    Returns total audits, hijacks prevented, average delta, and risk trend over last 24 hours.
    """
    audits_file = "audits.json"
    
    if not os.path.exists(audits_file):
        return {
            "total_audits": 0,
            "hijacks_prevented": 0,
            "average_delta": 0.0,
            "risk_trend": [],
        }
    
    try:
        with open(audits_file, 'r', encoding='utf-8') as f:
            audits = json.load(f)
        
        # Calculate metrics
        total_audits = len(audits)
        hijacks_prevented = sum(1 for audit in audits if audit.get("decision") == "BLOCK")
        
        # Calculate average delta (last 24 hours)
        now = datetime.utcnow()
        twenty_four_hours_ago = now - timedelta(hours=24)
        
        recent_audits = [
            audit for audit in audits
            if "timestamp" in audit
            and datetime.fromisoformat(audit["timestamp"].replace("Z", "+00:00")) >= twenty_four_hours_ago
        ]
        
        if recent_audits:
            average_delta = sum(audit.get("delta_score", 0) for audit in recent_audits) / len(recent_audits)
        else:
            average_delta = 0.0
        
        # Generate risk trend data (last 24 hours, hourly buckets)
        risk_trend = []
        for i in range(23, -1, -1):
            hour_start = now - timedelta(hours=i + 1)
            hour_end = now - timedelta(hours=i)
            
            hour_audits = [
                audit for audit in audits
                if "timestamp" in audit
                and hour_start <= datetime.fromisoformat(audit["timestamp"].replace("Z", "+00:00")) < hour_end
            ]
            
            if hour_audits:
                avg_delta = sum(audit.get("delta_score", 0) for audit in hour_audits) / len(hour_audits)
            else:
                # Use overall average if no data for this hour
                avg_delta = average_delta if recent_audits else 0.4
            
            risk_trend.append({
                "hour": hour_end.strftime("%H:%M"),
                "delta": round(avg_delta, 2),
            })
        
        return {
            "total_audits": total_audits,
            "hijacks_prevented": hijacks_prevented,
            "average_delta": round(average_delta, 2),
            "risk_trend": risk_trend,
        }
    except (json.JSONDecodeError, IOError) as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to read analytics: {str(e)}"
        )


@app.get("/")
async def root():
    return {"message": "Vanguard Protocol API", "status": "operational"}

