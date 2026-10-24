import {
  isFindingConfidence,
  isFindingSeverity,
  isFindingStatus,
  type FindingConfidenceValue,
  type FindingSeverityValue,
  type FindingStatusValue,
} from "@/lib/findings/constants";

export type FindingFormField =
  | "title"
  | "description"
  | "evidence"
  | "businessImpact"
  | "severity"
  | "confidence"
  | "status";

export type FindingFormFieldErrors = Partial<Record<FindingFormField, string>>;

export type FindingFormState = {
  ok: boolean;
  message?: string;
  fieldErrors?: FindingFormFieldErrors;
  values?: ParsedFindingFormData;
};

export type ParsedFindingFormData = {
  title: string;
  description: string;
  evidence: string;
  businessImpact: string;
  severity: FindingSeverityValue;
  confidence: FindingConfidenceValue;
  status: FindingStatusValue;
};

export const initialFindingFormState: FindingFormState = {
  ok: false,
};

function getString(formData: FormData, field: FindingFormField) {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}

export function parseFindingFormData(formData: FormData):
  | { success: true; data: ParsedFindingFormData }
  | { success: false; state: FindingFormState } {
  const fieldErrors: FindingFormFieldErrors = {};
  const title = getString(formData, "title");
  const description = getString(formData, "description");
  const evidence = getString(formData, "evidence");
  const businessImpact = getString(formData, "businessImpact");
  const severity = getString(formData, "severity");
  const confidence = getString(formData, "confidence");
  const status = getString(formData, "status");

  if (!title) {
    fieldErrors.title = "Finding title is required.";
  }

  if (!description) {
    fieldErrors.description = "Description is required.";
  }

  if (!evidence) {
    fieldErrors.evidence = "Evidence summary is required.";
  }

  if (!businessImpact) {
    fieldErrors.businessImpact = "Business impact is required.";
  }

  if (!isFindingSeverity(severity)) {
    fieldErrors.severity = "Select a supported severity.";
  }

  if (!isFindingConfidence(confidence)) {
    fieldErrors.confidence = "Select a supported confidence level.";
  }

  if (!isFindingStatus(status)) {
    fieldErrors.status = "Select a supported finding status.";
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
      description,
      evidence,
      businessImpact,
      severity: severity as FindingSeverityValue,
      confidence: confidence as FindingConfidenceValue,
      status: status as FindingStatusValue,
    },
  };
}
