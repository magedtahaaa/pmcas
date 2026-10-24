export const experimentStatusOptions = [
  { value: "BACKLOG", label: "Backlog" },
  { value: "PLANNED", label: "Planned" },
  { value: "RUNNING", label: "Running" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PAUSED", label: "Paused" },
  { value: "REJECTED", label: "Rejected" },
] as const;

export const experimentOwnerOptions = [
  { value: "MARKETING_MANAGER", label: "Marketing Manager" },
  { value: "MEDIA_BUYER", label: "Media Buyer" },
  { value: "TRACKING_SPECIALIST", label: "Tracking Specialist" },
  { value: "WEB_DEVELOPER", label: "Web Developer" },
  { value: "CRO_SPECIALIST", label: "CRO Specialist" },
  { value: "COPYWRITER", label: "Copywriter" },
  { value: "DESIGNER", label: "Designer" },
  { value: "SALES_TEAM", label: "Sales Team" },
  { value: "CUSTOMER_SUPPORT", label: "Customer Support" },
  { value: "CRM_SPECIALIST", label: "CRM Specialist" },
  { value: "ECOMMERCE_MANAGER", label: "Ecommerce Manager" },
  { value: "OPERATIONS_TEAM", label: "Operations Team" },
] as const;

export const experimentScoreOptions = [
  { value: 1, label: "1 - Very low" },
  { value: 2, label: "2 - Low" },
  { value: 3, label: "3 - Medium" },
  { value: 4, label: "4 - High" },
  { value: 5, label: "5 - Very high" },
] as const;

export type ExperimentStatusValue = (typeof experimentStatusOptions)[number]["value"];
export type ExperimentOwnerValue = (typeof experimentOwnerOptions)[number]["value"];

export function isExperimentStatus(value: string): value is ExperimentStatusValue {
  return experimentStatusOptions.some((option) => option.value === value);
}

export function isExperimentOwner(value: string): value is ExperimentOwnerValue {
  return experimentOwnerOptions.some((option) => option.value === value);
}

export function isExperimentScore(value: number): value is 1 | 2 | 3 | 4 | 5 {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}
