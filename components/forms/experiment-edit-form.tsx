"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { updateExperimentAction } from "@/app/experiments/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  experimentOwnerOptions,
  experimentScoreOptions,
  experimentStatusOptions,
  type ExperimentOwnerValue,
  type ExperimentStatusValue,
} from "@/lib/experiments/constants";
import { initialExperimentFormState } from "@/lib/experiments/validation";
import { cn } from "@/lib/utils";

export type ExperimentEditValues = {
  id: string;
  funnelStage: string;
  problemObserved: string;
  evidence: string;
  hypothesis: string;
  proposedChange: string;
  primaryMetric: string;
  secondaryMetric: string;
  impact: number;
  confidenceScore: number;
  ease: number;
  effort: number;
  owner: ExperimentOwnerValue;
  status: ExperimentStatusValue;
  result: string;
  learning: string;
  nextAction: string;
  deadline: string;
};

export function ExperimentEditForm({ experiment }: { experiment: ExperimentEditValues }) {
  const router = useRouter();
  const [values, setValues] = useState<ExperimentEditValues>(experiment);
  const updateAction = updateExperimentAction.bind(null, experiment.id);
  const [state, formAction] = useActionState(updateAction, initialExperimentFormState);
  const computedPriority =
    values.impact + values.confidenceScore + values.ease - values.effort;

  useEffect(() => {
    if (!state.ok) {
      return;
    }

    router.refresh();
  }, [router, state]);

  function resetFormValues() {
    setValues(experiment);
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Edit experiment</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Funnel stage"
              htmlFor="funnelStage"
              error={state.fieldErrors?.funnelStage}
            >
              <Input
                id="funnelStage"
                name="funnelStage"
                value={values.funnelStage}
                onChange={(event) =>
                  setValues({ ...values, funnelStage: event.target.value })
                }
              />
            </FormField>

            <FormField
              label="Primary metric"
              htmlFor="primaryMetric"
              error={state.fieldErrors?.primaryMetric}
            >
              <Input
                id="primaryMetric"
                name="primaryMetric"
                value={values.primaryMetric}
                onChange={(event) =>
                  setValues({ ...values, primaryMetric: event.target.value })
                }
              />
            </FormField>
          </div>

          <FormField label="Hypothesis" htmlFor="hypothesis" error={state.fieldErrors?.hypothesis}>
            <Textarea
              id="hypothesis"
              name="hypothesis"
              value={values.hypothesis}
              onChange={(event) => setValues({ ...values, hypothesis: event.target.value })}
              rows={4}
            />
          </FormField>

          <FormField
            label="Problem observed"
            htmlFor="problemObserved"
            error={state.fieldErrors?.problemObserved}
          >
            <Textarea
              id="problemObserved"
              name="problemObserved"
              value={values.problemObserved}
              onChange={(event) =>
                setValues({ ...values, problemObserved: event.target.value })
              }
              rows={4}
            />
          </FormField>

          <FormField label="Evidence" htmlFor="evidence" error={state.fieldErrors?.evidence}>
            <Textarea
              id="evidence"
              name="evidence"
              value={values.evidence}
              onChange={(event) => setValues({ ...values, evidence: event.target.value })}
              rows={4}
            />
          </FormField>

          <FormField
            label="Proposed change"
            htmlFor="proposedChange"
            error={state.fieldErrors?.proposedChange}
          >
            <Textarea
              id="proposedChange"
              name="proposedChange"
              value={values.proposedChange}
              onChange={(event) =>
                setValues({ ...values, proposedChange: event.target.value })
              }
              rows={4}
            />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <FormField
              label="Secondary metric"
              htmlFor="secondaryMetric"
              error={state.fieldErrors?.secondaryMetric}
            >
              <Input
                id="secondaryMetric"
                name="secondaryMetric"
                value={values.secondaryMetric}
                onChange={(event) =>
                  setValues({ ...values, secondaryMetric: event.target.value })
                }
              />
            </FormField>

            <ScoreSelect
              label="Impact"
              name="impact"
              value={values.impact}
              error={state.fieldErrors?.impact}
              onChange={(value) => setValues({ ...values, impact: value })}
            />

            <ScoreSelect
              label="Confidence"
              name="confidenceScore"
              value={values.confidenceScore}
              error={state.fieldErrors?.confidenceScore}
              onChange={(value) => setValues({ ...values, confidenceScore: value })}
            />

            <ScoreSelect
              label="Ease"
              name="ease"
              value={values.ease}
              error={state.fieldErrors?.ease}
              onChange={(value) => setValues({ ...values, ease: value })}
            />

            <ScoreSelect
              label="Effort"
              name="effort"
              value={values.effort}
              error={state.fieldErrors?.effort}
              onChange={(value) => setValues({ ...values, effort: value })}
            />

            <FormField label="Owner" htmlFor="owner" error={state.fieldErrors?.owner}>
              <select
                id="owner"
                name="owner"
                value={values.owner}
                onChange={(event) =>
                  setValues({ ...values, owner: event.target.value as ExperimentOwnerValue })
                }
                className={selectClassName}
              >
                {experimentOwnerOptions.map((option) => (
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
                  setValues({ ...values, status: event.target.value as ExperimentStatusValue })
                }
                className={selectClassName}
              >
                {experimentStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Deadline" htmlFor="deadline" error={state.fieldErrors?.deadline}>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                value={values.deadline}
                onChange={(event) => setValues({ ...values, deadline: event.target.value })}
              />
            </FormField>
          </div>

          <div className="rounded-md border border-border/80 bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              Priority score
            </p>
            <p className="mt-1 text-lg font-semibold">{computedPriority}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Calculated as impact + confidence + ease - effort.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <FormField label="Result" htmlFor="result" error={state.fieldErrors?.result}>
              <Textarea
                id="result"
                name="result"
                value={values.result}
                onChange={(event) => setValues({ ...values, result: event.target.value })}
                rows={4}
              />
            </FormField>

            <FormField label="Learning" htmlFor="learning" error={state.fieldErrors?.learning}>
              <Textarea
                id="learning"
                name="learning"
                value={values.learning}
                onChange={(event) => setValues({ ...values, learning: event.target.value })}
                rows={4}
              />
            </FormField>

            <FormField
              label="Next action"
              htmlFor="nextAction"
              error={state.fieldErrors?.nextAction}
            >
              <Textarea
                id="nextAction"
                name="nextAction"
                value={values.nextAction}
                onChange={(event) => setValues({ ...values, nextAction: event.target.value })}
                rows={4}
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
                Changes update the experiment record only. Findings and recommendations are unchanged.
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

function ScoreSelect({
  label,
  name,
  value,
  error,
  onChange,
}: {
  label: string;
  name: "impact" | "confidenceScore" | "ease" | "effort";
  value: number;
  error?: string;
  onChange: (value: number) => void;
}) {
  return (
    <FormField label={label} htmlFor={name} error={error}>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={selectClassName}
      >
        {experimentScoreOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
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
  children: ReactNode;
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
