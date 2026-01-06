/**
 * Returns a color and accessible label for the given risk score.
 * @param semanticDelta A number between 0 and 1
 * @returns { color: string, label: string }
 */
export function getRiskColor(semanticDelta: number): { color: string; label: string } {
  if (semanticDelta >= 0.85) {
    return { color: '#f59e0b', label: 'Critical Risk' }; // Amber, warning
  }
  if (semanticDelta >= 0.7) {
    return { color: '#ef4444', label: 'High Risk' }; // Red
  }
  if (semanticDelta >= 0.4) {
    return { color: '#3b82f6', label: 'Moderate Risk' }; // Electric Blue
  }
  return { color: '#22c55e', label: 'Low Risk' }; // Green
}

