import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Download, FileText, LayoutDashboard } from "lucide-react";

import { DataIntakeChecklist } from "@/components/audit/data-intake-checklist";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dataIntakeChecklistGroups, getDataIntakeStats } from "@/lib/audits/data-intake";
import { getAuditWorkspace } from "@/lib/audits/queries";
import { formatDate } from "@/lib/brands/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AuditDataIntakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const audit = await getAuditWorkspace(id);

  if (!audit) {
    notFound();
  }

  const stats = getDataIntakeStats();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`${audit.brand.name} · ${formatDate(audit.auditDate)}`}
        title="Data Intake Checklist"
        description={`Internal consultant checklist for collecting and mapping client data before entering audit responses and creating manual workflow outputs for ${audit.title}. This v1.1 checklist is static and does not save item statuses.`}
        tone="audits"
        marker="📋"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <Link href={`/audits/${audit.id}`}>
                <ArrowLeft className="me-2 h-4 w-4" aria-hidden="true" />
                Audit Workspace
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/audits/${audit.id}/summary`}>
                <LayoutDashboard className="me-2 h-4 w-4" aria-hidden="true" />
                Audit Summary
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/audits/${audit.id}/report`}>
                <FileText className="me-2 h-4 w-4" aria-hidden="true" />
                Client Report
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/exports?auditId=${encodeURIComponent(audit.id)}`}>
                <Download className="me-2 h-4 w-4" aria-hidden="true" />
                Exports
              </Link>
            </Button>
          </div>
        }
      />

      <Card className="border-s-4 border-s-cyan-600 border-cyan-300/85 bg-cyan-50/80">
        <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
          <ContextItem label="Brand" value={audit.brand.name} />
          <ContextItem label="Audit" value={audit.title} />
          <ContextItem label="Audit date" value={formatDate(audit.auditDate)} />
          <ContextItem label="Template" value={`${audit.template.name} ${audit.template.version}`} />
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <IntakeMetricCard label="Total data items" value={stats.totalItems} helper="Starter checklist coverage." />
        <IntakeMetricCard label="Required items" value={stats.requiredItems} helper="Recommended baseline inputs." />
        <IntakeMetricCard label="Critical items" value={stats.criticalItems} helper="High-dependency audit inputs." />
        <IntakeMetricCard label="Mapped items" value={stats.mappedItems} helper="Clear PMCAS workflow destination." />
        <IntakeMetricCard label="Mapping gaps" value={stats.mappingGaps} helper="Items needing a future PMCAS destination." />
        <IntakeMetricCard
          label="Readiness state"
          value={stats.readinessState}
          helper="Informational only; no saved intake status in v1.1."
        />
      </section>

      <Card className="border-s-4 border-s-cyan-600 border-cyan-300/85 bg-cyan-50/80">
        <CardHeader>
          <CardTitle>Mapping QA summary</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Static validation of where intake inputs fit in the current PMCAS workflow. No item
            status is stored yet.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 pt-0 md:grid-cols-2 xl:grid-cols-6">
          <ContextItem label="Total items" value={String(stats.totalItems)} />
          <ContextItem label="Mapped items" value={String(stats.mappedItems)} />
          <ContextItem label="Mapping gaps" value={String(stats.mappingGaps)} />
          <ContextItem label="Audit criteria" value={String(stats.criteriaMappedItems)} />
          <ContextItem label="Workflow outputs" value={String(stats.workflowMappedItems)} />
          <ContextItem label="Delivery notes" value={String(stats.deliveryMappedItems)} />
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <IntakeMetricCard
          label="Mapped to criteria"
          value={stats.criteriaMappedItems}
          helper="Items that support scored criteria."
        />
        <IntakeMetricCard
          label="Mapped to workflow"
          value={stats.workflowMappedItems}
          helper="Items feeding findings, recommendations, or experiments."
        />
        <IntakeMetricCard
          label="Mapped to delivery"
          value={stats.deliveryMappedItems}
          helper="Items supporting report, export, or delivery notes."
        />
      </section>

      <Card className="border-slate-300 bg-slate-50/90">
        <CardHeader>
          <CardTitle>How this checklist fits PMCAS</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Use this as the collection map before scoring the audit. It explains what to ask for,
            where it comes from, and where it should be entered inside PMCAS.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            {[
              "Data Intake",
              "Audit Workspace",
              "Manual Findings",
              "Manual Recommendations",
              "Manual Experiments",
              "Audit Summary",
              "Client Report",
              "Exports",
            ].map((step, index, steps) => (
              <div key={step} className="flex items-center gap-3">
                <div
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm font-medium",
                    index === 0
                      ? "border-cyan-400 bg-cyan-100 text-cyan-950"
                      : "border-slate-300 bg-background text-slate-800",
                  )}
                >
                  {step}
                </div>
                {index < steps.length - 1 ? (
                  <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                ) : null}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <DataIntakeChecklist groups={dataIntakeChecklistGroups} />
    </div>
  );
}

function ContextItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-cyan-300/80 bg-background/90 p-4">
      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold leading-6 text-foreground">{value}</p>
    </div>
  );
}

function IntakeMetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: number | string;
  helper: string;
}) {
  return (
    <Card className="border-s-4 border-s-cyan-600 border-cyan-300/85 bg-cyan-50/80">
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">{label}</p>
        <p className="mt-2 break-words text-2xl font-semibold tracking-normal text-foreground">
          {value}
        </p>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
