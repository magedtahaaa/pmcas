import { formatBusinessModel } from "@/lib/brands/constants";

type DecimalLike = {
  toString: () => string;
};

export function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatMoney(value: DecimalLike | number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "Not set";
  }

  const numericValue = typeof value === "number" ? value : Number(value.toString());

  if (!Number.isFinite(numericValue)) {
    return "Not set";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "SAR",
    currencyDisplay: "code",
    maximumFractionDigits: 0,
  }).format(numericValue);
}

export function formatMetricValue(value: DecimalLike | number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "Not set";
  }

  const numericValue = typeof value === "number" ? value : Number(value.toString());

  if (!Number.isFinite(numericValue)) {
    return value.toString();
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(numericValue);
}

export function formatNullable(value: string | null | undefined) {
  return value?.trim() ? value : "Not set";
}

export function formatChannels(channels: string[] | null | undefined) {
  return channels && channels.length > 0 ? channels.join(", ") : "Not set";
}

export function formatEnumLabel(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function toDecimalInputValue(value: DecimalLike | number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  return value.toString();
}

export { formatBusinessModel };
