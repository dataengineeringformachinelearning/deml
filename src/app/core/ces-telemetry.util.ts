export type CesTelemetryPayload = {
  level?: number | null;
  sla?: number | null;
  stability?: number | null;
};

export type ResolvedCesTelemetry = {
  level: number | null;
  sla: number | null;
  stability: number | null;
};

const observedNumber = (value: number | null | undefined): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

/**
 * Normalize probe-derived CES telemetry without turning missing measurements
 * into healthy-looking zeroes. A real numeric zero remains a measurement.
 */
export const resolveCesTelemetry = (
  ces: CesTelemetryPayload | null | undefined,
  unavailable = false,
): ResolvedCesTelemetry => {
  if (unavailable) {
    return { level: null, sla: null, stability: null };
  }
  return {
    level: observedNumber(ces?.level),
    sla: observedNumber(ces?.sla),
    stability: observedNumber(ces?.stability),
  };
};

export const formatCesScore = (value: number | null | undefined): string => {
  const observed = observedNumber(value);
  return observed === null ? '—' : observed.toFixed(0);
};

export const formatCesPercent = (value: number | null | undefined): string => {
  const score = formatCesScore(value);
  return score === '—' ? score : `${score}%`;
};
