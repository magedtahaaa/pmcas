export const recommendationStatusOptions = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "DISMISSED", label: "Dismissed" },
] as const;

export const recommendationPriorityOptions = [
  { value: "CRITICAL", label: "Critical" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
] as const;

export const recommendationOwnerOptions = [
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

export const recommendationConfidenceOptions = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
] as const;

export type RecommendationStatusValue = (typeof recommendationStatusOptions)[number]["value"];
export type RecommendationPriorityValue = (typeof recommendationPriorityOptions)[number]["value"];
export type RecommendationOwnerValue = (typeof recommendationOwnerOptions)[number]["value"];
export type RecommendationConfidenceValue =
  (typeof recommendationConfidenceOptions)[number]["value"];

export function isRecommendationStatus(value: string): value is RecommendationStatusValue {
  return recommendationStatusOptions.some((option) => option.value === value);
}

export function isRecommendationPriority(value: string): value is RecommendationPriorityValue {
  return recommendationPriorityOptions.some((option) => option.value === value);
}

export function isRecommendationOwner(value: string): value is RecommendationOwnerValue {
  return recommendationOwnerOptions.some((option) => option.value === value);
}

export function isRecommendationConfidence(
  value: string,
): value is RecommendationConfidenceValue {
  return recommendationConfidenceOptions.some((option) => option.value === value);
}

export function getRecommendationPriorityRank(priority: string | null | undefined) {
  switch (priority) {
    case "CRITICAL":
      return 4;
    case "HIGH":
      return 3;
    case "MEDIUM":
      return 2;
    case "LOW":
      return 1;
    default:
      return 0;
  }
}
