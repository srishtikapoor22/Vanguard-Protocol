from typing import Dict, Any
import re
from collections import Counter


def _normalize_text(text: str) -> str:
    """Normalize text for comparison: lowercase, remove punctuation."""
    text = text.lower()
    # Remove punctuation except spaces
    text = re.sub(r'[^\w\s]', ' ', text)
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def _extract_keywords(text: str, min_length: int = 3) -> set:
    """Extract meaningful keywords from text."""
    normalized = _normalize_text(text)
    words = normalized.split()
    # Filter out common stop words and short words
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
        'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
        'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this',
        'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their'
    }
    keywords = {w for w in words if len(w) >= min_length and w not in stop_words}
    return keywords


def _calculate_keyword_overlap(set1: set, set2: set) -> float:
    """Calculate Jaccard similarity between two sets of keywords."""
    if not set1 and not set2:
        return 1.0  # Both empty = perfect alignment
    if not set1 or not set2:
        return 0.0  # One empty, one not = no alignment
    
    intersection = len(set1 & set2)
    union = len(set1 | set2)
    
    if union == 0:
        return 1.0
    
    # Jaccard similarity (0.0 to 1.0)
    similarity = intersection / union
    return similarity


def _check_risk_keywords(text: str) -> float:
    """
    Check for high-risk keywords that might indicate hijacking.
    Returns a risk score from 0.0 (no risk keywords) to 1.0 (many risk keywords).
    """
    risk_patterns = [
        r'\b(urgent|immediate|asap|emergency|critical|secret|confidential|private)\b',
        r'\b(ignore|bypass|skip|override|disable|remove|delete|erase)\b',
        r'\b(transfer|send|wire|payment|invoice|refund)\b',
        r'\b(unauthorized|unverified|unknown|suspicious|unusual)\b',
        r'\b(do not|don\'t|never|always|must|required)\b',
    ]
    
    text_lower = text.lower()
    risk_count = sum(1 for pattern in risk_patterns if re.search(pattern, text_lower))
    
    # Normalize to 0.0-1.0 scale (max risk if 3+ patterns found)
    risk_score = min(risk_count / 3.0, 1.0)
    return risk_score


def calculate_semantic_delta(
    mission_statement: str,
    proposed_action: str,
    trust_baseline: Dict[str, Any]
) -> float:
    """
    Calculate Semantic Delta Score between mission statement and proposed action.
    
    Returns:
        - 0.0: Perfect alignment (action matches mission)
        - 1.0: High hijacking risk (action deviates significantly from mission)
    
    Logic:
    1. Extract keywords from mission and action
    2. Calculate keyword overlap (Jaccard similarity)
    3. Check for risk keywords in the action
    4. Consider trust baseline context
    5. Combine factors to produce final delta score
    """
    # Extract keywords from mission and action
    mission_keywords = _extract_keywords(mission_statement)
    action_keywords = _extract_keywords(proposed_action)
    
    # Calculate alignment (higher = more aligned)
    alignment_score = _calculate_keyword_overlap(mission_keywords, action_keywords)
    
    # Check for risk indicators in the action
    risk_score = _check_risk_keywords(proposed_action)
    
    # Consider trust baseline context
    # If it's an approved vendor policy, reduce risk slightly (more trusted context)
    baseline_risk_modifier = 0.0
    if trust_baseline.get("policy_type") == "Approved Vendor Policy":
        baseline_risk_modifier = -0.1  # Slight reduction in risk score
    
    # Calculate semantic delta:
    # - Start with misalignment (1 - alignment_score)
    # - Add risk indicators
    # - Apply baseline modifier
    delta_score = (1.0 - alignment_score) * 0.6 + risk_score * 0.4 + baseline_risk_modifier
    
    # Ensure score is between 0.0 and 1.0
    delta_score = max(0.0, min(1.0, delta_score))
    
    return round(delta_score, 2)

