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

export type RecommendationFormField =
  | "title"
  | "rationale"
  | "expectedImpact"
  | "effort"
  | "priority"
  | "suggestedOwner"
  | "confidence"
  | "status";

export type RecommendationFormFieldErrors = Partial<Record<RecommendationFormField, string>>;

export type ParsedRecommendationFormData = {
  title: string;
  rationale: string;
  expectedImpact: string;
  effort: number;
  priority: RecommendationPriorityValue;
  suggestedOwner: RecommendationOwnerValue;
  confidence: RecommendationConfidenceValue;
  status: RecommendationStatusValue;
};

export type RecommendationFormState = {
  ok: boolean;
  message?: string;
  fieldErrors?: RecommendationFormFieldErrors;
  values?: ParsedRecommendationFormData;
};

export const initialRecommendationFormState: RecommendationFormState = {
  ok: false,
};

function getString(formData: FormData, field: RecommendationFormField) {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}

export function parseRecommendationFormData(formData: FormData):
  | { success: true; data: ParsedRecommendationFormData }
  | { success: false; state: RecommendationFormState } {
  const fieldErrors: RecommendationFormFieldErrors = {};
  const title = getString(formData, "title");
  const rationale = getString(formData, "rationale");
  const expectedImpact = getString(formData, "expectedImpact");
  const rawEffort = getString(formData, "effort");
  const priority = getString(formData, "priority");
  const suggestedOwner = getString(formData, "suggestedOwner");
  const confidence = getString(formData, "confidence");
  const status = getString(formData, "status");
  const effort = Number(rawEffort);

  if (!title) {
    fieldErrors.title = "Recommendation title is required.";
  }

  if (!rationale) {
    fieldErrors.rationale = "Rationale is required.";
  }

  if (!expectedImpact) {
    fieldErrors.expectedImpact = "Expected impact is required.";
  }

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
