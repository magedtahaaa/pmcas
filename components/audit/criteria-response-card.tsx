"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { ChevronDown, ExternalLink } from "lucide-react";

import { upsertAuditResponseAction } from "@/app/audits/actions";
import { notifyAuditResponseUnsavedChange } from "@/components/audit/audit-workspace-group";
import {
  formatAuditEnum,
  stringifyJson,
  toBadgeConfidenceLevel,
  toBadgeRiskLevel,
} from "@/lib/audits/format";
import {
  initialAuditResponseFormState,
  type AuditResponseFormField,
  type AuditResponseFormState,
} from "@/lib/audits/validation";
import { cn } from "@/lib/utils";
import { ConfidenceBadge } from "@/components/layout/confidence-badge";
import { RiskBadge } from "@/components/layout/risk-badge";
import { ScoreBadge } from "@/components/layout/score-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type CriteriaResponseCardCriterion = {
  id: string;
  title: string;
  description: string | null;
  weight: number;
  scoringGuidance: string | null;
  evidenceRequired: boolean;
  ruleKey: string | null;
};

export type CriteriaResponseCardResponse = {
  id: string;
  score0To5: number;
  normalizedScore: number;
  riskLevel: string | null;
  confidence: string;
  notes: string | null;
  responseData: unknown;
};

export type CriteriaResponseCardEvidence = {
  id: string;
  title: string;
  description: string | null;
  source: string | null;
  url: string | null;
  fileReference: string | null;
  metricName: string | null;
  metricValue: string | null;
};

function SubmitButton({ isDirty }: { isDirty: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size="sm"
      disabled={pending}
      aria-label={isDirty ? "Save changed response" : "Save response"}
      className="w-full sm:w-auto"
    >
      {pending ? "Saving..." : "Save response"}
    </Button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
}

function getFieldError(state: AuditResponseFormState, field: AuditResponseFormField) {
  return state.fieldErrors?.[field];
}

export function CriteriaResponseCard({
  auditId,
  criterion,
  response,
  evidenceItems,
}: {
  auditId: string;
  criterion: CriteriaResponseCardCriterion;
  response: CriteriaResponseCardResponse | null;
  evidenceItems: CriteriaResponseCardEvidence[];
}) {
  const action = upsertAuditResponseAction.bind(null, auditId, criterion.id);
  const [state, formAction] = useActionState(action, initialAuditResponseFormState);
  const [isOpen, setIsOpen] = useState(false);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [hasAdvancedBeenOpened, setHasAdvancedBeenOpened] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [clientJsonError, setClientJsonError] = useState<string | null>(null);
  const responseDataRef = useRef<HTMLTextAreaElement>(null);
  const confidence = toBadgeConfidenceLevel(response?.confidence);
  const risk = toBadgeRiskLevel(response?.riskLevel);
  const hasAdvancedData = response?.responseData !== null && response?.responseData !== undefined;
  const hasEvidence = evidenceItems.length > 0;
  const jsonError = clientJsonError ?? getFieldError(state, "responseData");
  const hasSaveError = Boolean(state.message && !state.ok);
  const hasUnsavedChanges = isDirty || hasSaveError;
  const summaryText = useMemo(() => {
    if (!response) {
      return "No response captured yet.";
    }

    return `Raw score ${response.score0To5} / 5 · Normalized ${Math.round(
      response.normalizedScore,
    )} / 100 · ${formatAuditEnum(response.confidence)} confidence`;
  }, [response]);

  useEffect(() => {
    notifyAuditResponseUnsavedChange(criterion.id, hasUnsavedChanges);

    return () => {
      notifyAuditResponseUnsavedChange(criterion.id, false);
    };
  }, [criterion.id, hasUnsavedChanges]);

  function toggleCard() {
    setIsOpen((currentValue) => {
      const nextValue = !currentValue;

      if (nextValue) {
        setHasBeenOpened(true);
      }

      return nextValue;
    });
  }

  function handleHeaderKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleCard();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const rawResponseData = responseDataRef.current?.value.trim() ?? "";

    if (!rawResponseData) {
      setClientJsonError(null);
      setIsDirty(false);
      return;
    }

    try {
      JSON.parse(rawResponseData);
      setClientJsonError(null);
      setIsDirty(false);
    } catch {
      event.preventDefault();
      setClientJsonError("Response data must be valid JSON before saving.");
      setIsAdvancedOpen(true);
      setHasAdvancedBeenOpened(true);
    }
  }

  function toggleAdvancedResponseData() {
    setIsAdvancedOpen((currentValue) => {
      const nextValue = !currentValue;

      if (nextValue) {
        setHasAdvancedBeenOpened(true);
      }

      return nextValue;
    });
  }

  const shouldRenderPanel = isOpen || hasBeenOpened;

  return (
    <Card
      className={cn(
        "overflow-hidden border-border/80 bg-background shadow-sm shadow-slate-950/5 transition-all hover:border-primary/25",
        isOpen && "border-primary/40 shadow-md",
        !response && "border-dashed bg-muted/5",
      )}
    >
      <CardHeader
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls={`${criterion.id}-response-panel`}
        onClick={toggleCard}
        onKeyDown={handleHeaderKeyDown}
        className={cn(
          "cursor-pointer gap-3 transition-colors hover:bg-muted/45",
          isOpen && "border-b bg-muted/30",
        response && !isOpen && "bg-emerald-50/80",
        )}
      >
        <div className="flex gap-3">
          <ChevronDown
            className={cn(
              "mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-transform",
              isOpen && "rotate-180",
            )}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <CardTitle className="leading-6">{criterion.title}</CardTitle>
                <p className="text-sm leading-6 text-muted-foreground">{summaryText}</p>
              </div>
              <div className="flex min-w-0 flex-wrap gap-2 sm:justify-end">
                {response ? (
                  <>
                    <Badge variant="success">Answered</Badge>
                    {hasUnsavedChanges ? <Badge variant="warning">Unsaved changes</Badge> : null}
                    <ScoreBadge score={response.normalizedScore} />
                    {risk ? <RiskBadge risk={risk} /> : null}
                    {confidence ? <ConfidenceBadge confidence={confidence} /> : null}
                  </>
                ) : (
                  <>
                    <Badge variant="neutral">Not answered</Badge>
                    {hasUnsavedChanges ? <Badge variant="warning">Unsaved changes</Badge> : null}
                  </>
                )}
              </div>
            </div>
            {criterion.description ? (
              <p className="text-sm leading-6 text-muted-foreground">{criterion.description}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:ms-8">
          {criterion.evidenceRequired ? (
            <Badge variant="warning">Evidence required</Badge>
          ) : (
            <Badge variant="secondary">Evidence optional</Badge>
          )}
          {hasEvidence ? <Badge variant="success">Evidence linked</Badge> : <Badge variant="neutral">No evidence</Badge>}
          {hasAdvancedData ? <Badge variant="outline">Advanced data added</Badge> : null}
          {criterion.ruleKey ? <Badge variant="outline">{criterion.ruleKey}</Badge> : null}
        </div>
      </CardHeader>

      {shouldRenderPanel ? (
        <CardContent
          id={`${criterion.id}-response-panel`}
          hidden={!isOpen}
          className="bg-card p-5"
        >
          <form
            key={JSON.stringify(response)}
            action={formAction}
            onChange={() => setIsDirty(true)}
            onSubmit={handleSubmit}
            className="grid gap-4"
            noValidate
          >
            {state.message ? (
              <div
                className={cn(
                  "rounded-md border px-4 py-3 text-sm",
                  state.ok
                    ? "border-emerald-500/60 bg-emerald-100 text-emerald-950"
                    : "border-red-500/60 bg-red-100 text-red-950",
                )}
              >
                {state.message}
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-[160px_180px_minmax(0,1fr)]">
              <div className="space-y-2">
                <Label htmlFor={`${criterion.id}-score`}>Score</Label>
                <select
                  id={`${criterion.id}-score`}
                  name="score0To5"
                  defaultValue={response?.score0To5 ?? ""}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pe-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-invalid={Boolean(getFieldError(state, "score0To5"))}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {[0, 1, 2, 3, 4, 5].map((score) => (
                    <option key={score} value={score}>
                      {score} - {getScoreLabel(score)}
                    </option>
                  ))}
                </select>
                <FieldError message={getFieldError(state, "score0To5")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${criterion.id}-confidence`}>Confidence</Label>
                <select
                  id={`${criterion.id}-confidence`}
                  name="confidence"
                  defaultValue={response?.confidence ?? "MEDIUM"}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pe-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-invalid={Boolean(getFieldError(state, "confidence"))}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
                <FieldError message={getFieldError(state, "confidence")} />
              </div>

              <div className="space-y-2">
                <Label>Current state</Label>
                <div className="rounded-md border border-border/80 bg-muted/30 p-3">
                  {response ? (
                    <dl className="grid gap-3 text-sm sm:grid-cols-3">
                      <ReadOnlyState label="Raw score" value={`${response.score0To5} / 5`} />
                      <ReadOnlyState
                        label="Normalized"
                        value={`${Math.round(response.normalizedScore)} / 100`}
                      />
                      <ReadOnlyState
                        label="Confidence"
                        value={formatAuditEnum(response.confidence)}
                      />
                    </dl>
                  ) : (
                    <p className="text-sm text-muted-foreground">No response captured yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${criterion.id}-notes`}>Notes</Label>
              <Textarea
                id={`${criterion.id}-notes`}
                name="notes"
                defaultValue={response?.notes ?? ""}
                placeholder="Capture consultant observations, assumptions, metric context, and caveats."
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={toggleAdvancedResponseData}
                  className="flex w-full items-center justify-between rounded-md border border-border/80 bg-background px-3 py-2 text-start text-sm font-medium transition-colors hover:bg-muted/50"
                  aria-expanded={isAdvancedOpen}
                  aria-controls={`${criterion.id}-advanced-response-data`}
                >
                  <span>Advanced response data</span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {hasAdvancedData ? "Advanced data added" : "Optional JSON"}
                    <ChevronDown
                      className={cn("h-4 w-4 transition-transform", isAdvancedOpen && "rotate-180")}
                      aria-hidden="true"
                    />
                  </span>
                </button>
                {hasAdvancedBeenOpened ? (
                  <div
                    id={`${criterion.id}-advanced-response-data`}
                    className="space-y-2"
                    hidden={!isAdvancedOpen}
                  >
                    <Textarea
                      ref={responseDataRef}
                      name="responseData"
                      defaultValue={stringifyJson(response?.responseData)}
                      placeholder='{"metric":"value"}'
                      className="font-mono text-xs"
                    />
                    <FieldError message={jsonError} />
                  </div>
                ) : (
                  <>
                    <input
                      type="hidden"
                      name="responseData"
                      value={stringifyJson(response?.responseData)}
                    />
                    {jsonError ? <FieldError message={jsonError} /> : null}
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label>Evidence</Label>
                {evidenceItems.length > 0 ? (
                  <div className="rounded-md border border-border/80 bg-background">
                    {evidenceItems.map((evidence) => (
                      <div key={evidence.id} className="border-b p-3 last:border-b-0">
                        <div className="space-y-1">
                          <p className="break-words text-sm font-medium">{evidence.title}</p>
                          {evidence.description ? (
                            <p className="line-clamp-2 break-words text-xs leading-5 text-muted-foreground">
                              {evidence.description}
                            </p>
                          ) : null}
                          <p className="break-words text-xs text-muted-foreground">
                            {[
                              evidence.source,
                              evidence.metricName,
                              evidence.metricValue,
                              evidence.fileReference,
                            ]
                              .filter(Boolean)
                              .join(" · ") || "Evidence item"}
                          </p>
                          {evidence.url ? (
                            <Link
                              href={evidence.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 break-all text-xs font-medium text-primary hover:underline"
                            >
                              Open source
                              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-24 items-center rounded-md border border-dashed bg-background p-3 text-sm text-muted-foreground">
                    {criterion.evidenceRequired
                      ? "No linked evidence yet. Evidence is required for this criterion."
                      : "No linked evidence yet."}
                  </div>
                )}
              </div>
            </div>

            {criterion.scoringGuidance ? (
              <p className="rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-xs leading-5 text-muted-foreground">
                {criterion.scoringGuidance}
              </p>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-muted-foreground">
                {hasUnsavedChanges
                  ? "Unsaved changes are kept while this card is collapsed."
                  : "Scores refresh after saving."}
              </p>
              <SubmitButton isDirty={hasUnsavedChanges} />
            </div>
          </form>
        </CardContent>
      ) : null}
    </Card>
  );
}

function ReadOnlyState({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 font-medium text-foreground">{value}</dd>
    </div>
  );
}

function getScoreLabel(score: number) {
  switch (score) {
    case 0:
      return "major issue";
    case 1:
      return "very weak";
    case 2:
      return "weak";
    case 3:
      return "acceptable";
    case 4:
      return "strong";
    case 5:
      return "excellent";
    default:
      return "score";
  }
}
