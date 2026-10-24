"use client";

import { useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { PlusCircle, X } from "lucide-react";

import {
  createExperimentForAuditAction,
  createFindingForAuditAction,
  createRecommendationForAuditAction,
} from "@/app/audits/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  experimentOwnerOptions,
  experimentScoreOptions,
  experimentStatusOptions,
} from "@/lib/experiments/constants";
import {
  findingConfidenceOptions,
  findingSeverityOptions,
  findingStatusOptions,
} from "@/lib/findings/constants";
import {
  recommendationConfidenceOptions,
  recommendationOwnerOptions,
  recommendationPriorityOptions,
  recommendationStatusOptions,
} from "@/lib/recommendations/constants";
import {
  initialCreateExperimentFormState,
  initialCreateFindingFormState,
  initialCreateRecommendationFormState,
} from "@/lib/audits/manual-workflow-validation";
import { cn } from "@/lib/utils";

export type ManualAuditSectionOption = {
  sectionKey: string;
  name: string;
};

export type ManualFindingOption = {
  id: string;
  title: string;
  sectionKey: string;
};

export type ManualRecommendationOption = {
  id: string;
  title: string;
};

export function CreateFindingPanel({
  auditId,
  sections,
  buttonLabel = "Add finding",
}: {
  auditId: string;
  sections: ManualAuditSectionOption[];
  buttonLabel?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, setState] = useState(initialCreateFindingFormState);

  async function formAction(formData: FormData) {
    const nextState = await createFindingForAuditAction(auditId, initialCreateFindingFormState, formData);

    setState(nextState);

    if (nextState.ok) {
      formRef.current?.reset();
      setFormKey((currentKey) => currentKey + 1);
      setIsOpen(false);
    }
  }

  return (
    <CreatePanel
      title="Add finding"
      description="Manually capture a finding for this audit. Nothing is generated automatically."
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      buttonLabel={buttonLabel}
      message={state.message}
      ok={state.ok}
    >
      <form key={formKey} ref={formRef} action={formAction} className="space-y-4">
        <FormField label="Section" htmlFor="finding-sectionKey" error={state.fieldErrors?.sectionKey}>
          <select
            id="finding-sectionKey"
            name="sectionKey"
            defaultValue={sections[0]?.sectionKey ?? ""}
            className={selectClassName}
          >
            {sections.map((section) => (
              <option key={section.sectionKey} value={section.sectionKey}>
                {section.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Finding title" htmlFor="finding-title" error={state.fieldErrors?.title}>
          <Input id="finding-title" name="title" />
        </FormField>

        <FormField
          label="Finding description"
          htmlFor="finding-description"
          error={state.fieldErrors?.description}
        >
          <Textarea id="finding-description" name="description" rows={4} />
        </FormField>

        <FormField label="Evidence" htmlFor="finding-evidence" error={state.fieldErrors?.evidence}>
          <Textarea id="finding-evidence" name="evidence" rows={4} />
        </FormField>

        <FormField
          label="Business impact"
          htmlFor="finding-businessImpact"
          error={state.fieldErrors?.businessImpact}
        >
          <Textarea id="finding-businessImpact" name="businessImpact" rows={4} />
        </FormField>

        <div className="grid gap-4 md:grid-cols-3">
          <SelectField
            label="Severity"
            id="finding-severity"
            name="severity"
            defaultValue="MEDIUM"
            error={state.fieldErrors?.severity}
            options={findingSeverityOptions}
          />
          <SelectField
            label="Confidence"
            id="finding-confidence"
            name="confidence"
            defaultValue="MEDIUM"
            error={state.fieldErrors?.confidence}
            options={findingConfidenceOptions}
          />
          <SelectField
            label="Status"
            id="finding-status"
            name="status"
            defaultValue="DRAFT"
            error={state.fieldErrors?.status}
            options={findingStatusOptions}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Related metric name"
            htmlFor="finding-relatedMetricName"
            error={state.fieldErrors?.relatedMetricName}
          >
            <Input id="finding-relatedMetricName" name="relatedMetricName" />
          </FormField>
          <FormField
            label="Related metric value"
            htmlFor="finding-relatedMetricValue"
            error={state.fieldErrors?.relatedMetricValue}
          >
            <Input id="finding-relatedMetricValue" name="relatedMetricValue" inputMode="decimal" />
          </FormField>
        </div>

        <FormActions onCancel={() => setIsOpen(false)} submitLabel="Save finding" />
      </form>
    </CreatePanel>
  );
}

export function CreateRecommendationPanel({
  auditId,
  findings,
  buttonLabel = "Add recommendation",
}: {
  auditId: string;
  findings: ManualFindingOption[];
  buttonLabel?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, setState] = useState(initialCreateRecommendationFormState);
  const hasFindings = findings.length > 0;

  async function formAction(formData: FormData) {
    const nextState = await createRecommendationForAuditAction(
      auditId,
      initialCreateRecommendationFormState,
      formData,
    );

    setState(nextState);

    if (nextState.ok) {
      formRef.current?.reset();
      setFormKey((currentKey) => currentKey + 1);
      setIsOpen(false);
    }
  }

  return (
    <CreatePanel
      title="Add recommendation"
      description="Manually define an action item tied to an existing finding from this audit."
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      buttonLabel={buttonLabel}
      message={state.message}
      ok={state.ok}
      disabled={!hasFindings}
      disabledMessage="Create at least one finding before adding recommendations."
    >
      <form key={formKey} ref={formRef} action={formAction} className="space-y-4">
        <FormField
          label="Related finding"
          htmlFor="recommendation-findingId"
          error={state.fieldErrors?.findingId}
        >
          <select
            id="recommendation-findingId"
            name="findingId"
            defaultValue={findings[0]?.id ?? ""}
            className={selectClassName}
          >
            {findings.map((finding) => (
              <option key={finding.id} value={finding.id}>
                {finding.title}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Recommendation title"
          htmlFor="recommendation-title"
          error={state.fieldErrors?.title}
        >
          <Input id="recommendation-title" name="title" />
        </FormField>

        <FormField
          label="Rationale"
          htmlFor="recommendation-rationale"
          error={state.fieldErrors?.rationale}
        >
          <Textarea id="recommendation-rationale" name="rationale" rows={4} />
        </FormField>

        <FormField
          label="Expected impact"
          htmlFor="recommendation-expectedImpact"
          error={state.fieldErrors?.expectedImpact}
        >
          <Textarea id="recommendation-expectedImpact" name="expectedImpact" rows={4} />
        </FormField>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SelectField
            label="Priority"
            id="recommendation-priority"
            name="priority"
            defaultValue="MEDIUM"
            error={state.fieldErrors?.priority}
            options={recommendationPriorityOptions}
          />
          <SelectField
            label="Suggested owner"
            id="recommendation-suggestedOwner"
            name="suggestedOwner"
            defaultValue="MARKETING_MANAGER"
            error={state.fieldErrors?.suggestedOwner}
            options={recommendationOwnerOptions}
          />
          <SelectField
            label="Confidence"
            id="recommendation-confidence"
            name="confidence"
            defaultValue="MEDIUM"
            error={state.fieldErrors?.confidence}
            options={recommendationConfidenceOptions}
          />
          <SelectField
            label="Status"
            id="recommendation-status"
            name="status"
            defaultValue="DRAFT"
            error={state.fieldErrors?.status}
            options={recommendationStatusOptions}
          />
          <FormField
            label="Effort"
            htmlFor="recommendation-effort"
            error={state.fieldErrors?.effort}
          >
            <Input
              id="recommendation-effort"
              name="effort"
              type="number"
              min={1}
              max={5}
              step={1}
              defaultValue={3}
            />
          </FormField>
        </div>

        <FormActions onCancel={() => setIsOpen(false)} submitLabel="Save recommendation" />
      </form>
    </CreatePanel>
  );
}

export function CreateExperimentPanel({
  auditId,
  recommendations,
  buttonLabel = "Add experiment",
}: {
  auditId: string;
  recommendations: ManualRecommendationOption[];
  buttonLabel?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, setState] = useState(initialCreateExperimentFormState);
  const hasRecommendations = recommendations.length > 0;

  async function formAction(formData: FormData) {
    const nextState = await createExperimentForAuditAction(
      auditId,
      initialCreateExperimentFormState,
      formData,
    );

    setState(nextState);

    if (nextState.ok) {
      formRef.current?.reset();
      setFormKey((currentKey) => currentKey + 1);
      setIsOpen(false);
    }
  }

  return (
    <CreatePanel
      title="Add experiment"
      description="Manually add a test or operational action tied to an existing recommendation."
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      buttonLabel={buttonLabel}
      message={state.message}
      ok={state.ok}
      disabled={!hasRecommendations}
      disabledMessage="Create at least one recommendation before adding experiments."
    >
      <form key={formKey} ref={formRef} action={formAction} className="space-y-4">
        <FormField
          label="Related recommendation"
          htmlFor="experiment-recommendationId"
          error={state.fieldErrors?.recommendationId}
        >
          <select
            id="experiment-recommendationId"
            name="recommendationId"
            defaultValue={recommendations[0]?.id ?? ""}
            className={selectClassName}
          >
            {recommendations.map((recommendation) => (
              <option key={recommendation.id} value={recommendation.id}>
                {recommendation.title}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Funnel stage"
            htmlFor="experiment-funnelStage"
            error={state.fieldErrors?.funnelStage}
          >
            <Input id="experiment-funnelStage" name="funnelStage" />
          </FormField>
          <FormField
            label="Primary metric"
            htmlFor="experiment-primaryMetric"
            error={state.fieldErrors?.primaryMetric}
          >
            <Input id="experiment-primaryMetric" name="primaryMetric" />
          </FormField>
        </div>

        <FormField
          label="Problem observed"
          htmlFor="experiment-problemObserved"
          error={state.fieldErrors?.problemObserved}
        >
          <Textarea id="experiment-problemObserved" name="problemObserved" rows={4} />
        </FormField>

        <FormField label="Evidence" htmlFor="experiment-evidence" error={state.fieldErrors?.evidence}>
          <Textarea id="experiment-evidence" name="evidence" rows={4} />
        </FormField>

        <FormField
          label="Hypothesis"
          htmlFor="experiment-hypothesis"
          error={state.fieldErrors?.hypothesis}
        >
          <Textarea id="experiment-hypothesis" name="hypothesis" rows={4} />
        </FormField>

        <FormField
          label="Proposed change"
          htmlFor="experiment-proposedChange"
          error={state.fieldErrors?.proposedChange}
        >
          <Textarea id="experiment-proposedChange" name="proposedChange" rows={4} />
        </FormField>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <FormField
            label="Secondary metric"
            htmlFor="experiment-secondaryMetric"
            error={state.fieldErrors?.secondaryMetric}
          >
            <Input id="experiment-secondaryMetric" name="secondaryMetric" />
          </FormField>
          <SelectField
            label="Impact"
            id="experiment-impact"
            name="impact"
            defaultValue="3"
            error={state.fieldErrors?.impact}
            options={experimentScoreOptions}
          />
          <SelectField
            label="Confidence"
            id="experiment-confidenceScore"
            name="confidenceScore"
            defaultValue="3"
            error={state.fieldErrors?.confidenceScore}
            options={experimentScoreOptions}
          />
          <SelectField
            label="Ease"
            id="experiment-ease"
            name="ease"
            defaultValue="3"
            error={state.fieldErrors?.ease}
            options={experimentScoreOptions}
          />
          <SelectField
            label="Effort"
            id="experiment-effort"
            name="effort"
            defaultValue="3"
            error={state.fieldErrors?.effort}
            options={experimentScoreOptions}
          />
          <SelectField
            label="Owner"
            id="experiment-owner"
            name="owner"
            defaultValue="MARKETING_MANAGER"
            error={state.fieldErrors?.owner}
            options={experimentOwnerOptions}
          />
          <SelectField
            label="Status"
            id="experiment-status"
            name="status"
            defaultValue="BACKLOG"
            error={state.fieldErrors?.status}
            options={experimentStatusOptions}
          />
          <FormField label="Deadline" htmlFor="experiment-deadline" error={state.fieldErrors?.deadline}>
            <Input id="experiment-deadline" name="deadline" type="date" />
          </FormField>
        </div>

        <FormActions onCancel={() => setIsOpen(false)} submitLabel="Save experiment" />
      </form>
    </CreatePanel>
  );
}

function CreatePanel({
  title,
  description,
  isOpen,
  setIsOpen,
  buttonLabel,
  message,
  ok,
  disabled = false,
  disabledMessage,
  children,
}: {
  title: string;
  description: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  buttonLabel: string;
  message?: string;
  ok: boolean;
  disabled?: boolean;
  disabledMessage?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant={isOpen ? "secondary" : "outline"}
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full justify-start sm:w-auto"
      >
        {isOpen ? (
          <X className="me-2 h-4 w-4" aria-hidden="true" />
        ) : (
          <PlusCircle className="me-2 h-4 w-4" aria-hidden="true" />
        )}
        {isOpen ? "Close form" : buttonLabel}
      </Button>

      {disabled && disabledMessage ? (
        <p className="max-w-md text-sm leading-6 text-muted-foreground">{disabledMessage}</p>
      ) : null}

      {isOpen && !disabled ? (
        <div className="rounded-md border border-border/80 bg-background p-4 shadow-sm shadow-slate-950/5">
          <div className="mb-4 space-y-1">
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          {message ? (
            <p
              className={cn(
                "mb-4 rounded-md border p-3 text-sm leading-6",
                ok
                  ? "border-emerald-500/60 bg-emerald-100 text-emerald-950"
                  : "border-red-500/60 bg-red-100 text-red-950",
              )}
            >
              {message}
            </p>
          ) : null}
          {children}
        </div>
      ) : null}
    </div>
  );
}

function FormActions({
  onCancel,
  submitLabel,
}: {
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm leading-6 text-muted-foreground">
        Saves a manually entered record only. No workflow items are generated automatically.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <SubmitButton label={submitLabel} />
      </div>
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : label}
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

function SelectField({
  label,
  id,
  name,
  defaultValue,
  error,
  options,
}: {
  label: string;
  id: string;
  name: string;
  defaultValue: string | number;
  error?: string;
  options: ReadonlyArray<{
    value: string | number;
    label: string;
  }>;
}) {
  return (
    <FormField label={label} htmlFor={id} error={error}>
      <select id={id} name={name} defaultValue={defaultValue} className={selectClassName}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pe-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
