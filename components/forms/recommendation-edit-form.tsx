"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { updateRecommendationAction } from "@/app/recommendations/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  recommendationConfidenceOptions,
  recommendationOwnerOptions,
  recommendationPriorityOptions,
  recommendationStatusOptions,
  type RecommendationConfidenceValue,
  type RecommendationOwnerValue,
  type RecommendationPriorityValue,
  type RecommendationStatusValue,
} from "@/lib/recommendations/constants";
import { initialRecommendationFormState } from "@/lib/recommendations/validation";
import { cn } from "@/lib/utils";

export type RecommendationEditValues = {
  id: string;
  title: string;
  rationale: string;
  expectedImpact: string;
  effort: number;
  priority: RecommendationPriorityValue;
  suggestedOwner: RecommendationOwnerValue;
  confidence: RecommendationConfidenceValue;
  status: RecommendationStatusValue;
};

export function RecommendationEditForm({
  recommendation,
}: {
  recommendation: RecommendationEditValues;
}) {
  const router = useRouter();
  const [values, setValues] = useState<RecommendationEditValues>(recommendation);
  const updateAction = updateRecommendationAction.bind(null, recommendation.id);
  const [state, formAction] = useActionState(updateAction, initialRecommendationFormState);

  useEffect(() => {
    if (!state.ok) {
      return;
    }

    router.refresh();
  }, [router, state]);

  function resetFormValues() {
    setValues(recommendation);
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Edit recommendation</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          <FormField label="Title" htmlFor="title" error={state.fieldErrors?.title}>
            <Input
              id="title"
              name="title"
              value={values.title}
              onChange={(event) => setValues({ ...values, title: event.target.value })}
            />
          </FormField>

          <FormField
            label="Rationale"
            htmlFor="rationale"
            error={state.fieldErrors?.rationale}
          >
            <Textarea
              id="rationale"
              name="rationale"
              value={values.rationale}
              onChange={(event) => setValues({ ...values, rationale: event.target.value })}
              rows={4}
            />
          </FormField>

          <FormField
            label="Expected impact"
            htmlFor="expectedImpact"
            error={state.fieldErrors?.expectedImpact}
          >
            <Textarea
              id="expectedImpact"
              name="expectedImpact"
              value={values.expectedImpact}
              onChange={(event) => setValues({ ...values, expectedImpact: event.target.value })}
              rows={4}
            />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <FormField label="Priority" htmlFor="priority" error={state.fieldErrors?.priority}>
              <select
                id="priority"
                name="priority"
                value={values.priority}
                onChange={(event) =>
                  setValues({
                    ...values,
                    priority: event.target.value as RecommendationPriorityValue,
                  })
                }
                className={selectClassName}
              >
                {recommendationPriorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Suggested owner"
              htmlFor="suggestedOwner"
              error={state.fieldErrors?.suggestedOwner}
            >
              <select
                id="suggestedOwner"
                name="suggestedOwner"
                value={values.suggestedOwner}
                onChange={(event) =>
                  setValues({
                    ...values,
                    suggestedOwner: event.target.value as RecommendationOwnerValue,
                  })
                }
                className={selectClassName}
              >
                {recommendationOwnerOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Status" htmlFor="status" error={state.fieldErrors?.status}>
              <select
                id="status"
                name="status"
                value={values.status}
                onChange={(event) =>
                  setValues({
                    ...values,
                    status: event.target.value as RecommendationStatusValue,
                  })
                }
                className={selectClassName}
              >
                {recommendationStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Confidence"
              htmlFor="confidence"
              error={state.fieldErrors?.confidence}
            >
              <select
                id="confidence"
                name="confidence"
                value={values.confidence}
                onChange={(event) =>
                  setValues({
                    ...values,
                    confidence: event.target.value as RecommendationConfidenceValue,
                  })
                }
                className={selectClassName}
              >
                {recommendationConfidenceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Effort" htmlFor="effort" error={state.fieldErrors?.effort}>
              <Input
                id="effort"
                name="effort"
                type="number"
                min={1}
                max={5}
                step={1}
                value={values.effort}
                onChange={(event) =>
                  setValues({
                    ...values,
                    effort: Number(event.target.value),
                  })
                }
              />
            </FormField>
          </div>

          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            {state.message ? (
              <p
                className={cn(
                  "text-sm leading-6",
                  state.ok ? "text-emerald-700" : "text-destructive",
                )}
              >
                {state.message}
              </p>
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                Changes update the recommendation record only. Experiments are unchanged.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={resetFormValues}>
                Reset
              </Button>
              <SubmitButton />
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save changes"}
    </Button>
  );
}

function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pe-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
