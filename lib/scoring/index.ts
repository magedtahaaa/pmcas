export const CRITERION_SCORE_RANGE = {
  min: 0,
  max: 5,
} as const;

export const NORMALIZED_SCORE_RANGE = {
  min: 0,
  max: 100,
} as const;

export type ScoringConfidenceLevel = "LOW" | "MEDIUM" | "HIGH";

export type ScoringRiskLevel =
  | "STRONG"
  | "NEEDS_IMPROVEMENT"
  | "RISK_AREA"
  | "CRITICAL_GAP";

export type CriterionScoreInput = {
  id: string;
  weight: number;
  response?: {
    score0To5: number;
    confidence: ScoringConfidenceLevel;
  } | null;
};

export type SectionScoreInput = {
  id: string;
  name: string;
  weight: number;
  criteria: CriterionScoreInput[];
};

export type SectionScoreResult = {
  sectionId: string;
  sectionName: string;
  score: number | null;
  riskLevel: ScoringRiskLevel | null;
  confidence: ScoringConfidenceLevel | null;
  answeredCriteria: number;
  totalCriteria: number;
  completionPercentage: number;
  weight: number;
};

export type AuditScoreSummary = {
  sectionScores: SectionScoreResult[];
  overallScore: number | null;
  overallRiskLevel: ScoringRiskLevel | null;
  overallConfidence: ScoringConfidenceLevel | null;
  answeredCriteria: number;
  totalCriteria: number;
  completionPercentage: number;
  highestRiskSections: SectionScoreResult[];
};

export function normalizeCriterionScore(score0To5: number) {
  return (score0To5 / CRITERION_SCORE_RANGE.max) * NORMALIZED_SCORE_RANGE.max;
}

export function getRiskLevelFromScore(score: number): ScoringRiskLevel {
  if (score >= 80) {
    return "STRONG";
  }

  if (score >= 60) {
    return "NEEDS_IMPROVEMENT";
  }

  if (score >= 40) {
    return "RISK_AREA";
  }

  return "CRITICAL_GAP";
}

function calculateConfidence(confidences: ScoringConfidenceLevel[]) {
  if (confidences.length === 0) {
    return null;
  }

  const highCount = confidences.filter((confidence) => confidence === "HIGH").length;
  const lowCount = confidences.filter((confidence) => confidence === "LOW").length;
  const majorityThreshold = confidences.length / 2;

  if (highCount > majorityThreshold) {
    return "HIGH";
  }

  if (lowCount > majorityThreshold) {
    return "LOW";
  }

  return "MEDIUM";
}

export function calculateSectionScore(section: SectionScoreInput): SectionScoreResult {
  const answeredCriteria = section.criteria.filter((criterion) => criterion.response);
  const totalCriteria = section.criteria.length;
  const completionPercentage =
    totalCriteria === 0 ? 0 : Math.round((answeredCriteria.length / totalCriteria) * 100);

  if (answeredCriteria.length === 0) {
    return {
      sectionId: section.id,
      sectionName: section.name,
      score: null,
      riskLevel: null,
      confidence: null,
      answeredCriteria: 0,
      totalCriteria,
      completionPercentage,
      weight: section.weight,
    };
  }

  const weightedScoreSum = answeredCriteria.reduce((sum, criterion) => {
    const weight = criterion.weight || 1;
    const responseScore = criterion.response
      ? normalizeCriterionScore(criterion.response.score0To5)
      : 0;

    return sum + responseScore * weight;
  }, 0);
  const weightSum = answeredCriteria.reduce((sum, criterion) => sum + (criterion.weight || 1), 0);
  const score = weightSum === 0 ? null : weightedScoreSum / weightSum;
  const confidence = calculateConfidence(
    answeredCriteria
      .map((criterion) => criterion.response?.confidence)
      .filter((confidence): confidence is ScoringConfidenceLevel => Boolean(confidence)),
  );

  return {
    sectionId: section.id,
    sectionName: section.name,
    score,
    riskLevel: score === null ? null : getRiskLevelFromScore(score),
    confidence,
    answeredCriteria: answeredCriteria.length,
    totalCriteria,
    completionPercentage,
    weight: section.weight,
  };
}

export function calculateAuditScoreSummary(sections: SectionScoreInput[]): AuditScoreSummary {
  const sectionScores = sections.map(calculateSectionScore);
  const scoredSections = sectionScores.filter(
    (section): section is SectionScoreResult & { score: number } => section.score !== null,
  );
  const answeredCriteria = sectionScores.reduce(
    (sum, section) => sum + section.answeredCriteria,
    0,
  );
  const totalCriteria = sectionScores.reduce((sum, section) => sum + section.totalCriteria, 0);
  const completionPercentage =
    totalCriteria === 0 ? 0 : Math.round((answeredCriteria / totalCriteria) * 100);

  const weightedScoreSum = scoredSections.reduce(
    (sum, section) => sum + section.score * (section.weight || 1),
    0,
  );
  const weightSum = scoredSections.reduce((sum, section) => sum + (section.weight || 1), 0);
  const overallScore = weightSum === 0 ? null : weightedScoreSum / weightSum;
  const highestRiskSections = [...sectionScores]
    .filter((section) => section.riskLevel)
    .sort((a, b) => getRiskSortValue(a.riskLevel) - getRiskSortValue(b.riskLevel));

  return {
    sectionScores,
    overallScore,
    overallRiskLevel: overallScore === null ? null : getRiskLevelFromScore(overallScore),
    overallConfidence: calculateConfidence(
      scoredSections
        .map((section) => section.confidence)
        .filter((confidence): confidence is ScoringConfidenceLevel => Boolean(confidence)),
    ),
    answeredCriteria,
    totalCriteria,
    completionPercentage,
    highestRiskSections,
  };
}

function getRiskSortValue(riskLevel: ScoringRiskLevel | null) {
  switch (riskLevel) {
    case "CRITICAL_GAP":
      return 1;
    case "RISK_AREA":
      return 2;
    case "NEEDS_IMPROVEMENT":
      return 3;
    case "STRONG":
      return 4;
    default:
      return 5;
  }
}
