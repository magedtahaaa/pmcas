"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { businessModelOptions, type BusinessModelValue } from "@/lib/brands/constants";
import {
  initialBrandFormState,
  type BrandFormField,
  type BrandFormState,
} from "@/lib/brands/validation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type BrandFormValues = {
  id?: string;
  name?: string | null;
  industry?: string | null;
  website?: string | null;
  market?: string | null;
  businessModel?: BusinessModelValue | null;
  monthlyAdSpend?: string | null;
  monthlyRevenue?: string | null;
  averageOrderValue?: string | null;
  mainChannels?: string[] | null;
  mainGoal?: string | null;
  notes?: string | null;
};

type BrandFormAction = (
  state: BrandFormState,
  formData: FormData,
) => Promise<BrandFormState>;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
}

function getFieldError(state: BrandFormState, field: BrandFormField) {
  return state.fieldErrors?.[field];
}

export function BrandForm({
  action,
  defaultValues,
  title = "Brand context",
  submitLabel = "Save brand",
  onCancel,
}: {
  action: BrandFormAction;
  defaultValues?: BrandFormValues;
  title?: string;
  submitLabel?: string;
  onCancel?: () => void;
}) {
  const [state, formAction] = useActionState(action, initialBrandFormState);
  const mainChannelsValue = defaultValues?.mainChannels?.join(", ") ?? "";

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-5" noValidate>
          {state.message ? (
            <div
              className={cn(
                "rounded-md border px-4 py-3 text-sm",
                state.ok
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-700",
              )}
            >
              {state.message}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Brand name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={defaultValues?.name ?? ""}
                placeholder="Example: Najd Home Essentials"
                aria-invalid={Boolean(getFieldError(state, "name"))}
              />
              <FieldError message={getFieldError(state, "name")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                name="industry"
                defaultValue={defaultValues?.industry ?? ""}
                placeholder="Example: Home and lifestyle e-commerce"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                defaultValue={defaultValues?.website ?? ""}
                placeholder="https://example.com"
                aria-invalid={Boolean(getFieldError(state, "website"))}
              />
              <FieldError message={getFieldError(state, "website")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="market">Market</Label>
              <Input
                id="market"
                name="market"
                defaultValue={defaultValues?.market ?? ""}
                placeholder="Example: Saudi Arabia"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="businessModel">Business model</Label>
              <select
                id="businessModel"
                name="businessModel"
                defaultValue={defaultValues?.businessModel ?? ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pe-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-invalid={Boolean(getFieldError(state, "businessModel"))}
              >
                <option value="" disabled>
                  Select business model
                </option>
                {businessModelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FieldError message={getFieldError(state, "businessModel")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mainChannels">Main channels</Label>
              <Input
                id="mainChannels"
                name="mainChannels"
                defaultValue={mainChannelsValue}
                placeholder="Meta Ads, Google Search, TikTok Ads"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="monthlyAdSpend">Monthly ad spend</Label>
              <Input
                id="monthlyAdSpend"
                name="monthlyAdSpend"
                type="number"
                min="0"
                step="0.01"
                defaultValue={defaultValues?.monthlyAdSpend ?? ""}
                placeholder="85000"
                aria-invalid={Boolean(getFieldError(state, "monthlyAdSpend"))}
              />
              <FieldError message={getFieldError(state, "monthlyAdSpend")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyRevenue">Monthly revenue</Label>
              <Input
                id="monthlyRevenue"
                name="monthlyRevenue"
                type="number"
                min="0"
                step="0.01"
                defaultValue={defaultValues?.monthlyRevenue ?? ""}
                placeholder="310000"
                aria-invalid={Boolean(getFieldError(state, "monthlyRevenue"))}
              />
              <FieldError message={getFieldError(state, "monthlyRevenue")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="averageOrderValue">Average order value</Label>
              <Input
                id="averageOrderValue"
                name="averageOrderValue"
                type="number"
                min="0"
                step="0.01"
                defaultValue={defaultValues?.averageOrderValue ?? ""}
                placeholder="245"
                aria-invalid={Boolean(getFieldError(state, "averageOrderValue"))}
              />
              <FieldError message={getFieldError(state, "averageOrderValue")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mainGoal">Main goal</Label>
            <Textarea
              id="mainGoal"
              name="mainGoal"
              defaultValue={defaultValues?.mainGoal ?? ""}
              placeholder="Example: Improve conversion efficiency before scaling paid media."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={defaultValues?.notes ?? ""}
              placeholder="Capture constraints, known funnel issues, team context, and available data sources."
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:flex-wrap sm:justify-end">
            {onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            ) : null}
            <SubmitButton label={submitLabel} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
