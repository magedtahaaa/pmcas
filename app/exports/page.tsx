import Link from "next/link";
import { ArrowDownToLine, Clock, FileSpreadsheet } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/layout/status-badge";
import { formatAuditEnum } from "@/lib/audits/format";
import {
  AUDIT_CSV_EXPORT_DEFINITIONS,
  AUDIT_XLSX_REPORT_DEFINITIONS,
  DEFAULT_WORKBOOK_FORMATTING_RULES,
  FULL_AUDIT_WORKBOOK_DEFINITION,
  FULL_AUDIT_WORKBOOK_DOWNLOAD_TYPE,
  getExportCenterData,
} from "@/lib/export";

export const dynamic = "force-dynamic";

export default async function ExportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const selectedAuditId = getSingleParam(params.auditId);
  const { audits, selectedAudit, exportHistory } = await getExportCenterData(selectedAuditId);
  const latestExportByType = new Map(
    exportHistory.map((exportRecord) => [exportRecord.exportType, exportRecord]),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Exports"
        description="Download the default professional audit workbook, or use raw CSV datasets for analysis and external processing."
        tone="exports"
      />

      {audits.length > 0 ? (
        <>
          <Card className="border-sky-300/85 bg-sky-50/80">
            <CardHeader>
              <CardTitle>Selected audit</CardTitle>
              <CardDescription>
                Choose which audit should be used for workbook and CSV downloads.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action="/exports" className="flex flex-col gap-3 lg:flex-row lg:items-end">
                <label className="min-w-0 flex-1 space-y-2">
                  <span className="text-sm font-medium text-foreground">Audit</span>
                  <select
                    name="auditId"
                    defaultValue={selectedAudit?.id ?? ""}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pe-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {audits.map((audit) => (
                      <option key={audit.id} value={audit.id}>
                        {audit.title} - {audit.brand.name} - {formatDate(audit.auditDate)} - Draft
                      </option>
                    ))}
                  </select>
                </label>
                <Button type="submit" className="w-full lg:w-auto">
                  Use audit
                </Button>
              </form>

              {selectedAudit ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="neutral">{selectedAudit.brand.name}</Badge>
                  <Badge variant="outline">{formatDate(selectedAudit.auditDate)}</Badge>
                  <StatusBadge status="draft" />
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-s-8 border-s-cyan-700 border-cyan-300/90 bg-cyan-50/85 shadow-sm shadow-cyan-900/10">
            <CardHeader className="gap-2">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-xl">{FULL_AUDIT_WORKBOOK_DEFINITION.name}</CardTitle>
                    <Badge variant="success">Recommended</Badge>
                    <Badge variant="default">Default export</Badge>
                    <Badge variant="outline">Formatted XLSX</Badge>
                    <Badge variant="neutral">Multiple sheets</Badge>
                  </div>
                  <CardDescription className="max-w-4xl">
                    {FULL_AUDIT_WORKBOOK_DEFINITION.description}
                  </CardDescription>
                </div>
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-cyan-300 bg-cyan-100 text-cyan-900"
                  aria-hidden="true"
                >
                  ⬇️
                </span>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="space-y-3 rounded-md border border-cyan-300/85 bg-background/90 p-4">
                <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                  Best for audit review and sharing
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Summary", "Sections", "Findings", "Recommendations", "Experiments"].map(
                    (sheetName) => (
                      <Badge key={sheetName} variant="neutral">
                        {sheetName} sheet
                      </Badge>
                    ),
                  )}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  The workbook is the primary PMCAS export deliverable: one formatted file with
                  multiple sheets, report metadata blocks, readable sections, filters, frozen table
                  headers, and wrapped long text for internal or client-facing review.
                </p>
                <div className="space-y-2 border-t border-cyan-100 pt-3">
                  <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                    Default workbook formatting
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_WORKBOOK_FORMATTING_RULES.slice(0, 8).map((rule) => (
                      <Badge key={rule} variant="outline">
                        {rule}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  Workbook and individual XLSX downloads are not added to CSV export history
                  because the current database enum does not include dedicated workbook export
                  types.
                </p>
              </div>

              {selectedAudit ? (
                <Button asChild size="lg" className="w-full justify-start lg:w-auto">
                  <Link
                    href={`/exports/download?auditId=${encodeURIComponent(
                      selectedAudit.id,
                    )}&type=${FULL_AUDIT_WORKBOOK_DOWNLOAD_TYPE}`}
                  >
                    <ArrowDownToLine className="me-2 h-4 w-4" aria-hidden="true" />
                    Download Full Audit Workbook
                  </Link>
                </Button>
              ) : (
                <Button type="button" disabled size="lg" className="w-full justify-start lg:w-auto">
                  Download Full Audit Workbook
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Individual Formatted Reports</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Download a single formatted Excel report for a specific audit area. Best when you
                only need one part of the audit in a professional readable format.
              </p>
            </div>
            <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              {AUDIT_XLSX_REPORT_DEFINITIONS.map((definition) => (
                <Card
                  key={definition.downloadType}
                  className="border-s-4 border-s-cyan-700 border-cyan-300/85 bg-cyan-50/80"
                >
                  <CardHeader className="gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle>{definition.name}</CardTitle>
                        <CardDescription>{definition.description}</CardDescription>
                      </div>
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-cyan-300 bg-cyan-100 text-cyan-900"
                        aria-hidden="true"
                      >
                        ⬇️
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 rounded-md border border-cyan-300/85 bg-background/90 p-3">
                      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                        Includes
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {definition.includes.map((item) => (
                          <Badge key={item} variant="neutral">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-md border border-cyan-300/85 bg-background/90 p-3">
                      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                        Format
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Metadata block, frozen table headers, centered content, borders, readable
                        dates, wrapped long text, and semantic status styling.
                      </p>
                    </div>

                    {selectedAudit ? (
                      <Button asChild className="w-full justify-start">
                        <Link
                          href={`/exports/download?auditId=${encodeURIComponent(
                            selectedAudit.id,
                          )}&type=${definition.downloadType}`}
                        >
                          <ArrowDownToLine className="me-2 h-4 w-4" aria-hidden="true" />
                          Download XLSX
                        </Link>
                      </Button>
                    ) : (
                      <Button type="button" disabled className="w-full justify-start">
                        Download XLSX
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </section>
          </div>

          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Raw CSV Exports</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Use CSV exports when you need raw datasets for analysis, import, or external
                processing. Each CSV downloads one dataset without workbook formatting.
              </p>
            </div>
            <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              {AUDIT_CSV_EXPORT_DEFINITIONS.map((definition) => {
                const latestExport = latestExportByType.get(definition.type);

                return (
                  <Card
                    key={definition.type}
                    className="border-border/80 bg-background"
                  >
                    <CardHeader className="gap-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <CardTitle>{definition.name}</CardTitle>
                          <CardDescription>{definition.description}</CardDescription>
                        </div>
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-slate-100 text-slate-900"
                          aria-hidden="true"
                        >
                          ⬇️
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 rounded-md border border-border/80 bg-muted/10 p-3">
                        <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                          Includes
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {definition.includes.map((item) => (
                            <Badge key={item} variant="neutral">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-md border border-border/80 bg-background/80 p-3">
                        <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                          Last export
                        </p>
                        {latestExport ? (
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {formatDateTime(latestExport.exportedAt)} · {latestExport.rowCount} rows
                          </p>
                        ) : (
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            Not exported yet for this audit.
                          </p>
                        )}
                      </div>

                      {selectedAudit ? (
                        <Button asChild variant="outline" className="w-full justify-start">
                          <Link
                            href={`/exports/download?auditId=${encodeURIComponent(
                              selectedAudit.id,
                            )}&type=${definition.type}`}
                          >
                            <ArrowDownToLine className="me-2 h-4 w-4" aria-hidden="true" />
                            Download CSV
                          </Link>
                        </Button>
                      ) : (
                        <Button type="button" disabled variant="outline" className="w-full justify-start">
                          Download CSV
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </section>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Export history</CardTitle>
              <CardDescription>
                Recent CSV files generated for the selected audit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {exportHistory.length > 0 ? (
                <div className="space-y-3">
                  {exportHistory.map((exportRecord) => (
                    <div
                      key={exportRecord.id}
                      className="flex flex-col gap-3 rounded-md border border-border/80 bg-muted/10 p-3 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="break-words text-sm font-medium">
                          {exportRecord.fileName}
                        </p>
                        <p className="text-xs leading-5 text-muted-foreground">
                          {formatAuditEnum(exportRecord.exportType)} · {exportRecord.rowCount} rows
                        </p>
                      </div>
                      <Badge variant="neutral" className="shrink-0">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        {formatDateTime(exportRecord.exportedAt)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed bg-muted/10 p-6 text-center">
                  <FileSpreadsheet className="mb-3 h-6 w-6 text-muted-foreground" aria-hidden="true" />
                  <p className="text-sm font-medium">No CSV exports for this audit yet</p>
                  <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                    Download any export above to create a basic export history record.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <EmptyState
          title="No audits available for export"
          description="Create a brand audit before downloading PMCAS CSV outputs."
          actionLabel="Go to brands"
          actionHref="/brands"
          tone="exports"
        />
      )}
    </div>
  );
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function formatDateTime(value: Date) {
  return value.toISOString().replace("T", " ").slice(0, 16);
}
