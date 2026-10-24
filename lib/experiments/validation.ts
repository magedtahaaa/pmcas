import {
  isExperimentOwner,
  isExperimentScore,
  isExperimentStatus,
  type ExperimentOwnerValue,
  type ExperimentStatusValue,
} from "@/lib/experiments/constants";

export type ExperimentFormField =
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
  | "result"
  | "learning"
  | "nextAction"
  | "deadline";

export type ExperimentFormFieldErrors = Partial<Record<ExperimentFormField, string>>;

export type ParsedExperimentFormData = {
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
  result: string | null;
  learning: string | null;
  nextAction: string | null;
  deadline: Date | null;
};

export type ExperimentFormState = {
  ok: boolean;
  message?: string;
  fieldErrors?: ExperimentFormFieldErrors;
};

export const initialExperimentFormState: ExperimentFormState = {
  ok: false,
};

function getString(formData: FormData, field: ExperimentFormField) {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(formData: FormData, field: ExperimentFormField) {
  const value = getString(formData, field);

  return value || null;
}

function getScore(formData: FormData, field: ExperimentFormField) {
  return Number(getString(formData, field));
}

export function parseExperimentFormData(formData: FormData):
  | { success: true; data: ParsedExperimentFormData }
  | { success: false; state: ExperimentFormState } {
  const fieldErrors: ExperimentFormFieldErrors = {};
  const funnelStage = getString(formData, "funnelStage");
  const problemObserved = getString(formData, "problemObserved");
  const evidence = getString(formData, "evidence");
  const hypothesis = getString(formData, "hypothesis");
  const proposedChange = getString(formData, "proposedChange");
  const primaryMetric = getString(formData, "primaryMetric");
  const secondaryMetric = getOptionalString(formData, "secondaryMetric");
  const impact = getScore(formData, "impact");
  const confidenceScore = getScore(formData, "confidenceScore");
  const ease = getScore(formData, "ease");
  const effort = getScore(formData, "effort");
  const owner = getString(formData, "owner");
  const status = getString(formData, "status");
  const result = getOptionalString(formData, "result");
  const learning = getOptionalString(formData, "learning");
  const nextAction = getOptionalString(formData, "nextAction");
  const rawDeadline = getString(formData, "deadline");
  let deadline: Date | null = null;

  if (!funnelStage) {
    fieldErrors.funnelStage = "Funnel stage is required.";
  }

  if (!problemObserved) {
    fieldErrors.problemObserved = "Problem observed is required.";
  }

  if (!evidence) {
    fieldErrors.evidence = "Evidence is required.";
  }

  if (!hypothesis) {
    fieldErrors.hypothesis = "Hypothesis is required.";
  }

  if (!proposedChange) {
    fieldErrors.proposedChange = "Proposed change is required.";
  }

  if (!primaryMetric) {
    fieldErrors.primaryMetric = "Primary metric is required.";
  }

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
      result,
      learning,
      nextAction,
      deadline,
    },
  };
}
