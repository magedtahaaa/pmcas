import { isBusinessModel, type BusinessModelValue } from "@/lib/brands/constants";

export type BrandFormField =
  | "name"
  | "industry"
  | "website"
  | "market"
  | "businessModel"
  | "monthlyAdSpend"
  | "monthlyRevenue"
  | "averageOrderValue"
  | "mainChannels"
  | "mainGoal"
  | "notes";

export type BrandFormFieldErrors = Partial<Record<BrandFormField, string>>;

export type BrandFormState = {
  ok: boolean;
  message?: string;
  fieldErrors?: BrandFormFieldErrors;
};

export type ParsedBrandFormData = {
  name: string;
  industry: string | null;
  website: string | null;
  market: string | null;
  businessModel: BusinessModelValue;
  monthlyAdSpend: string | null;
  monthlyRevenue: string | null;
  averageOrderValue: string | null;
  mainChannels: string[];
  mainGoal: string | null;
  notes: string | null;
};

export const initialBrandFormState: BrandFormState = {
  ok: false,
};

function getString(formData: FormData, field: BrandFormField) {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}

function optionalString(value: string) {
  return value.length > 0 ? value : null;
}

function parseOptionalDecimal(
  value: string,
  field: BrandFormField,
  label: string,
  fieldErrors: BrandFormFieldErrors,
) {
  if (!value) {
    return null;
  }

  const normalized = value.replaceAll(",", "");
  const numericValue = Number(normalized);

  if (!Number.isFinite(numericValue)) {
    fieldErrors[field] = `${label} must be a valid number.`;
    return null;
  }

  if (numericValue < 0) {
    fieldErrors[field] = `${label} cannot be negative.`;
    return null;
  }

  return normalized;
}

function parseWebsite(value: string, fieldErrors: BrandFormFieldErrors) {
  if (!value) {
    return null;
  }

  const withProtocol = /^[a-z][a-z\d+\-.]*:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const url = new URL(withProtocol);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      fieldErrors.website = "Website must use http or https.";
      return null;
    }

    return url.toString();
  } catch {
    fieldErrors.website = "Enter a valid website URL.";
    return null;
  }
}

function parseMainChannels(value: string) {
  return value
    .split(",")
    .map((channel) => channel.trim())
    .filter(Boolean);
}

export function parseBrandFormData(formData: FormData):
  | { success: true; data: ParsedBrandFormData }
  | { success: false; state: BrandFormState } {
  const fieldErrors: BrandFormFieldErrors = {};

  const name = getString(formData, "name");
  const industry = getString(formData, "industry");
  const website = getString(formData, "website");
  const market = getString(formData, "market");
  const businessModel = getString(formData, "businessModel");
  const monthlyAdSpend = getString(formData, "monthlyAdSpend");
  const monthlyRevenue = getString(formData, "monthlyRevenue");
  const averageOrderValue = getString(formData, "averageOrderValue");
  const mainChannels = getString(formData, "mainChannels");
  const mainGoal = getString(formData, "mainGoal");
  const notes = getString(formData, "notes");

  if (!name) {
    fieldErrors.name = "Brand name is required.";
  }

  if (!businessModel || !isBusinessModel(businessModel)) {
    fieldErrors.businessModel = "Business model is required.";
  }

  const parsedWebsite = parseWebsite(website, fieldErrors);
  const parsedMonthlyAdSpend = parseOptionalDecimal(
    monthlyAdSpend,
    "monthlyAdSpend",
    "Monthly ad spend",
    fieldErrors,
  );
  const parsedMonthlyRevenue = parseOptionalDecimal(
    monthlyRevenue,
    "monthlyRevenue",
    "Monthly revenue",
    fieldErrors,
  );
  const parsedAverageOrderValue = parseOptionalDecimal(
    averageOrderValue,
    "averageOrderValue",
    "Average order value",
    fieldErrors,
  );

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
      name,
      industry: optionalString(industry),
      website: parsedWebsite,
      market: optionalString(market),
      businessModel: businessModel as BusinessModelValue,
      monthlyAdSpend: parsedMonthlyAdSpend,
      monthlyRevenue: parsedMonthlyRevenue,
      averageOrderValue: parsedAverageOrderValue,
      mainChannels: parseMainChannels(mainChannels),
      mainGoal: optionalString(mainGoal),
      notes: optionalString(notes),
    },
  };
}
