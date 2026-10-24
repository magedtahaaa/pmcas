import type { ScoringConfidenceLevel } from "@/lib/scoring";

export type AuditResponseFormField = "score0To5" | "confidence" | "notes" | "responseData";

export type AuditResponseFormState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<AuditResponseFormField, string>>;
};

export type ParsedAuditResponseFormData = {
  score0To5: number;
  confidence: ScoringConfidenceLevel;
  notes: string | null;
  responseData: unknown | null;
};

export const initialAuditResponseFormState: AuditResponseFormState = {
  ok: false,
};

const confidenceLevels = ["LOW", "MEDIUM", "HIGH"] as const;

function getString(formData: FormData, field: AuditResponseFormField) {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}

export function parseAuditResponseFormData(formData: FormData):
  | { success: true; data: ParsedAuditResponseFormData }
  | { success: false; state: AuditResponseFormState } {
  const fieldErrors: AuditResponseFormState["fieldErrors"] = {};

  const rawScore = getString(formData, "score0To5");
  const confidence = getString(formData, "confidence");
  const notes = getString(formData, "notes");
  const rawResponseData = getString(formData, "responseData");
  const score0To5 = Number(rawScore);

  if (rawScore === "" || !Number.isInteger(score0To5) || score0To5 < 0 || score0To5 > 5) {
    fieldErrors.score0To5 = "Score must be a whole number from 0 to 5.";
  }

  if (!confidenceLevels.includes(confidence as ScoringConfidenceLevel)) {
    fieldErrors.confidence = "Confidence must be Low, Medium, or High.";
  }

  let responseData: unknown | null = null;

  if (rawResponseData) {
    try {
      responseData = JSON.parse(rawResponseData);
    } catch {
      fieldErrors.responseData = "Response data must be valid JSON.";
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
      score0To5,
      confidence: confidence as ScoringConfidenceLevel,
      notes: notes || null,
      responseData,
    },
  };
}
