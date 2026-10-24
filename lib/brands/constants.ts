export const businessModelOptions = [
  { value: "ECOMMERCE", label: "E-commerce" },
  { value: "LEAD_GENERATION", label: "Lead generation" },
  { value: "MARKETPLACE", label: "Marketplace" },
  { value: "SAAS", label: "SaaS" },
  { value: "SERVICE", label: "Service" },
  { value: "OTHER", label: "Other" },
] as const;

export type BusinessModelValue = (typeof businessModelOptions)[number]["value"];

const businessModelLabels = new Map(
  businessModelOptions.map((option) => [option.value, option.label]),
);

export function isBusinessModel(value: string): value is BusinessModelValue {
  return businessModelOptions.some((option) => option.value === value);
}

export function formatBusinessModel(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return businessModelLabels.get(value as BusinessModelValue) ?? value;
}
