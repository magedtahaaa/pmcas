import {
  isAuditSectionKey,
  isFindingConfidence,
  isFindingSeverity,
  isFindingStatus,
  type AuditSectionKeyValue,
  type FindingConfidenceValue,
  type FindingSeverityValue,
  type FindingStatusValue,
} from "@/lib/findings/constants";
import {
  isExperimentOwner,
  isExperimentScore,
  isExperimentStatus,
  type ExperimentOwnerValue,
  type ExperimentStatusValue,
} from "@/lib/experiments/constants";
import {
  isRecommendationConfidence,
  isRecommendationOwner,
  isRecommendationPriority,
  isRecommendationStatus,
  type RecommendationConfidenceValue,
  type RecommendationOwnerValue,
  type RecommendationPriorityValue,
  type RecommendationStatusValue,
} from "@/lib/recommendations/constants";

type CreateWorkflowFormState<Field extends string, Values> = {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<Field, string>>;
  values?: Values;
};

export type CreateFindingField =
  | "sectionKey"
  | "title"
  | "description"
  | "evidence"
  | "businessImpact"
  | "severity"
  | "confidence"
  | "relatedMetricName"
  | "relatedMetricValue"
  | "status";

export type CreateFindingData = {
  sectionKey: AuditSectionKeyValue;
  title: string;
  description: string;
  evidence: string;
  businessImpact: string;
  severity: FindingSeverityValue;
  confidence: FindingConfidenceValue;
  relatedMetricName: string | null;
  relatedMetricValue: string | null;
  status: FindingStatusValue;
};

export type CreateFindingFormState = CreateWorkflowFormState<
  CreateFindingField,
  CreateFindingData
>;

export const initialCreateFindingFormState: CreateFindingFormState = {
  ok: false,
};

export type CreateRecommendationField =
  | "findingId"
  | "title"
  | "rationale"
  | "expectedImpact"
  | "effort"
  | "priority"
  | "suggestedOwner"
  | "confidence"
  | "status";

export type CreateRecommendationData = {
  findingId: string;
  title: string;
  rationale: string;
  expectedImpact: string;
  effort: number;
  priority: RecommendationPriorityValue;
  suggestedOwner: RecommendationOwnerValue;
  confidence: RecommendationConfidenceValue;
  status: RecommendationStatusValue;
};

export type CreateRecommendationFormState = CreateWorkflowFormState<
  CreateRecommendationField,
  CreateRecommendationData
>;

export const initialCreateRecommendationFormState: CreateRecommendationFormState = {
  ok: false,
};

export type CreateExperimentField =
  | "recommendationId"
  | "funnelStage"
  | "problemObserved"
  | "evidence"
  | "hypothesis"
  | "proposedChange"
  | "primaryMetric"
  | "secondaryMetric"
  | "impact"
  | "confidenceScore"
  | "ease"
  | "effort"
  | "owner"
  | "status"
  | "deadline";

export type CreateExperimentData = {
  recommendationId: string;
  funnelStage: string;
  problemObserved: string;
  evidence: string;
  hypothesis: string;
  proposedChange: string;
  primaryMetric: string;
  secondaryMetric: string | null;
  impact: number;
  confidenceScore: number;
  ease: number;
  effort: number;
  priorityScore: number;
  owner: ExperimentOwnerValue;
  status: ExperimentStatusValue;
  deadline: Date | null;
};

export type CreateExperimentFormState = CreateWorkflowFormState<
  CreateExperimentField,
  CreateExperimentData
>;

export const initialCreateExperimentFormState: CreateExperimentFormState = {
  ok: false,
};

function getString(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(formData: FormData, field: string) {
  const value = getString(formData, field);

  return value || null;
}

function getWholeNumber(formData: FormData, field: string) {
  return Number(getString(formData, field));
}

export function parseCreateFindingFormData(formData: FormData):
  | { success: true; data: CreateFindingData }
  | { success: false; state: CreateFindingFormState } {
  const fieldErrors: Partial<Record<CreateFindingField, string>> = {};
  const sectionKey = getString(formData, "sectionKey");
  const title = getString(formData, "title");
  const description = getString(formData, "description");
  const evidence = getString(formData, "evidence");
  const businessImpact = getString(formData, "businessImpact");
  const severity = getString(formData, "severity");
  const confidence = getString(formData, "confidence");
  const relatedMetricName = getOptionalString(formData, "relatedMetricName");
  const relatedMetricValue = getOptionalString(formData, "relatedMetricValue");
  const status = getString(formData, "status");

  if (!isAuditSectionKey(sectionKey)) {
    fieldErrors.sectionKey = "Select a supported audit section.";
  }

  if (!title) fieldErrors.title = "Finding title is required.";
  if (!description) fieldErrors.description = "Description is required.";
  if (!evidence) fieldErrors.evidence = "Evidence summary is required.";
  if (!businessImpact) fieldErrors.businessImpact = "Business impact is required.";

  if (!isFindingSeverity(severity)) {
    fieldErrors.severity = "Select a supported severity.";
  }

  if (!isFindingConfidence(confidence)) {
    fieldErrors.confidence = "Select a supported confidence level.";
  }

  if (!isFindingStatus(status)) {
    fieldErrors.status = "Select a supported finding status.";
  }

  if (relatedMetricValue !== null && !Number.isFinite(Number(relatedMetricValue))) {
    fieldErrors.relatedMetricValue = "Metric value must be a valid number.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      state: {
        ok: false,
        message: "Please fix the highlighted fields.",
        fieldErrors,
      },
    };
  }

  return {
    success: true,
    data: {
      sectionKey: sectionKey as AuditSectionKeyValue,
      title,
      description,
      evidence,
      businessImpact,
      severity: severity as FindingSeverityValue,
      confidence: confidence as FindingConfidenceValue,
      relatedMetricName,
      relatedMetricValue,
      status: status as FindingStatusValue,
    },
  };
}

export function parseCreateRecommendationFormData(formData: FormData):
  | { success: true; data: CreateRecommendationData }
  | { success: false; state: CreateRecommendationFormState } {
  const fieldErrors: Partial<Record<CreateRecommendationField, string>> = {};
  const findingId = getString(formData, "findingId");
  const title = getString(formData, "title");
  const rationale = getString(formData, "rationale");
  const expectedImpact = getString(formData, "expectedImpact");
  const effort = getWholeNumber(formData, "effort");
  const priority = getString(formData, "priority");
  const suggestedOwner = getString(formData, "suggestedOwner");
  const confidence = getString(formData, "confidence");
  const status = getString(formData, "status");

  if (!findingId) fieldErrors.findingId = "Select the related finding.";
  if (!title) fieldErrors.title = "Recommendation title is required.";
  if (!rationale) fieldErrors.rationale = "Rationale is required.";
  if (!expectedImpact) fieldErrors.expectedImpact = "Expected impact is required.";

  if (!Number.isInteger(effort) || effort < 1 || effort > 5) {
    fieldErrors.effort = "Effort must be a whole number from 1 to 5.";
  }

  if (!isRecommendationPriority(priority)) {
    fieldErrors.priority = "Select a supported priority.";
  }

  if (!isRecommendationOwner(suggestedOwner)) {
    fieldErrors.suggestedOwner = "Select a supported owner.";
  }

  if (!isRecommendationConfidence(confidence)) {
    fieldErrors.confidence = "Select a supported confidence level.";
  }

  if (!isRecommendationStatus(status)) {
    fieldErrors.status = "Select a supported recommendation status.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      state: {
        ok: false,
        message: "Please fix the highlighted fields.",
        fieldErrors,
      },
    };
  }

  return {
    success: true,
    data: {
      findingId,
      title,
      rationale,
      expectedImpact,
      effort,
      priority: priority as RecommendationPriorityValue,
      suggestedOwner: suggestedOwner as RecommendationOwnerValue,
      confidence: confidence as RecommendationConfidenceValue,
      status: status as RecommendationStatusValue,
    },
  };
}

export function parseCreateExperimentFormData(formData: FormData):
  | { success: true; data: CreateExperimentData }
  | { success: false; state: CreateExperimentFormState } {
  const fieldErrors: Partial<Record<CreateExperimentField, string>> = {};
  const recommendationId = getString(formData, "recommendationId");
  const funnelStage = getString(formData, "funnelStage");
  const problemObserved = getString(formData, "problemObserved");
  const evidence = getString(formData, "evidence");
  const hypothesis = getString(formData, "hypothesis");
  const proposedChange = getString(formData, "proposedChange");
  const primaryMetric = getString(formData, "primaryMetric");
  const secondaryMetric = getOptionalString(formData, "secondaryMetric");
  const impact = getWholeNumber(formData, "impact");
  const confidenceScore = getWholeNumber(formData, "confidenceScore");
  const ease = getWholeNumber(formData, "ease");
  const effort = getWholeNumber(formData, "effort");
  const owner = getString(formData, "owner");
  const status = getString(formData, "status");
  const rawDeadline = getString(formData, "deadline");
  let deadline: Date | null = null;

  if (!recommendationId) fieldErrors.recommendationId = "Select the related recommendation.";
  if (!funnelStage) fieldErrors.funnelStage = "Funnel stage is required.";
  if (!problemObserved) fieldErrors.problemObserved = "Problem observed is required.";
  if (!evidence) fieldErrors.evidence = "Evidence is required.";
  if (!hypothesis) fieldErrors.hypothesis = "Hypothesis is required.";
  if (!proposedChange) fieldErrors.proposedChange = "Proposed change is required.";
  if (!primaryMetric) fieldErrors.primaryMetric = "Primary metric is required.";

  if (!isExperimentScore(impact)) {
    fieldErrors.impact = "Impact must be a whole number from 1 to 5.";
  }

  if (!isExperimentScore(confidenceScore)) {
    fieldErrors.confidenceScore = "Confidence must be a whole number from 1 to 5.";
  }

  if (!isExperimentScore(ease)) {
    fieldErrors.ease = "Ease must be a whole number from 1 to 5.";
  }

  if (!isExperimentScore(effort)) {
    fieldErrors.effort = "Effort must be a whole number from 1 to 5.";
  }

  if (!isExperimentOwner(owner)) {
    fieldErrors.owner = "Select a supported owner.";
  }

  if (!isExperimentStatus(status)) {
    fieldErrors.status = "Select a supported experiment status.";
  }

  if (rawDeadline) {
    deadline = new Date(`${rawDeadline}T00:00:00.000Z`);

    if (Number.isNaN(deadline.getTime())) {
      fieldErrors.deadline = "Enter a valid deadline date.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      state: {
        ok: false,
        message: "Please fix the highlighted fields.",
        fieldErrors,
      },
    };
  }

  return {
    success: true,
    data: {
      recommendationId,
      funnelStage,
      problemObserved,
      evidence,
      hypothesis,
      proposedChange,
      primaryMetric,
      secondaryMetric,
      impact,
      confidenceScore,
      ease,
      effort,
      priorityScore: impact + confidenceScore + ease - effort,
      owner: owner as ExperimentOwnerValue,
      status: status as ExperimentStatusValue,
      deadline,
    },
  };
}
