export interface TrustBaseline {
  policy_type: string;
  description: string;
}

export interface AuditRecord {
  audit_id: string; // uuid-v4
  timestamp: string; // ISO-8601
  agent_mission: string;
  proposed_action: string;
  reasoning_chain: string | string[];
  semantic_delta: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  context_flags: string[];
  trust_baseline?: TrustBaseline;
}

