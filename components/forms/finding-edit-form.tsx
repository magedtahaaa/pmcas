"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { updateFindingAction } from "@/app/findings/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  findingConfidenceOptions,
  findingSeverityOptions,
  findingStatusOptions,
  type FindingConfidenceValue,
  type FindingSeverityValue,
  type FindingStatusValue,
} from "@/lib/findings/constants";
import { initialFindingFormState } from "@/lib/findings/validation";
import { cn } from "@/lib/utils";

export type FindingEditValues = {
  id: string;
  title: string;
  description: string;
  evidence: string;
  businessImpact: string;
  severity: FindingSeverityValue;
  confidence: FindingConfidenceValue;
  status: FindingStatusValue;
};

export function FindingEditForm({ finding }: { finding: FindingEditValues }) {
  const router = useRouter();
  const [values, setValues] = useState<FindingEditValues>(finding);
  const updateAction = updateFindingAction.bind(null, finding.id);
  const [state, formAction] = useActionState(updateAction, initialFindingFormState);

  useEffect(() => {
    if (!state.ok) {
      return;
    }

    router.refresh();
  }, [router, state]);

  function resetFormValues() {
    setValues(finding);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit finding</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          <FormField
            label="Title"
            htmlFor="title"
            error={state.fieldErrors?.title}
          >
            <Input
              id="title"
              name="title"
              value={values.title}
              onChange={(event) => setValues({ ...values, title: event.target.value })}
            />
          </FormField>

          <FormField
            label="Description"
            htmlFor="description"
            error={state.fieldErrors?.description}
          >
            <Textarea
              id="description"
              name="description"
              value={values.description}
              onChange={(event) => setValues({ ...values, description: event.target.value })}
              rows={4}
            />
          </FormField>

          <FormField
            label="Evidence summary"
            htmlFor="evidence"
            error={state.fieldErrors?.evidence}
          >
            <Textarea
              id="evidence"
              name="evidence"
              value={values.evidence}
              onChange={(event) => setValues({ ...values, evidence: event.target.value })}
              rows={4}
            />
          </FormField>

          <FormField
            label="Business impact"
            htmlFor="businessImpact"
            error={state.fieldErrors?.businessImpact}
          >
            <Textarea
              id="businessImpact"
              name="businessImpact"
              value={values.businessImpact}
              onChange={(event) => setValues({ ...values, businessImpact: event.target.value })}
              rows={4}
            />
          </FormField>

          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              label="Severity"
              htmlFor="severity"
              error={state.fieldErrors?.severity}
            >
              <select
                id="severity"
                name="severity"
                value={values.severity}
                onChange={(event) =>
                  setValues({
                    ...values,
                    severity: event.target.value as FindingSeverityValue,
                  })
                }
                className={selectClassName}
              >
                {findingSeverityOptions.map((option) => (
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
                    confidence: event.target.value as FindingConfidenceValue,
                  })
                }
                className={selectClassName}
              >
                {findingConfidenceOptions.map((option) => (
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
                    status: event.target.value as FindingStatusValue,
                  })
                }
                className={selectClassName}
              >
                {findingStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                Changes update the finding record only. Recommendations and experiments are unchanged.
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
