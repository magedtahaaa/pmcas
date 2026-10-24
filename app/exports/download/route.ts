import { NextResponse } from "next/server";

import {
  buildAuditCsvExport,
  buildFullAuditWorkbookExport,
  buildIndividualAuditWorkbookExport,
  FULL_AUDIT_WORKBOOK_DOWNLOAD_TYPE,
  parseAuditCsvExportType,
  parseAuditXlsxReportDownloadType,
  recordAuditCsvExport,
  withUtf8Bom,
} from "@/lib/export";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const auditId = url.searchParams.get("auditId");
  const requestedType = url.searchParams.get("type");

  if (!auditId) {
    return NextResponse.json(
      {
        error: "A valid auditId is required.",
      },
      {
        status: 400,
      },
    );
  }

  if (requestedType === FULL_AUDIT_WORKBOOK_DOWNLOAD_TYPE) {
    const workbookResult = await buildFullAuditWorkbookExport({
      auditId,
    });

    if (!workbookResult) {
      return NextResponse.json(
        {
          error: "Audit not found.",
        },
        {
          status: 404,
        },
      );
    }

    return new Response(bufferToArrayBuffer(workbookResult.buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": buildContentDisposition(workbookResult.fileName),
        "Cache-Control": "no-store",
      },
    });
  }

  const xlsxReportDefinition = parseAuditXlsxReportDownloadType(requestedType);

  if (xlsxReportDefinition) {
    const workbookResult = await buildIndividualAuditWorkbookExport({
      auditId,
      exportType: xlsxReportDefinition.exportType,
    });

    if (!workbookResult) {
      return NextResponse.json(
        {
          error: "Audit not found.",
        },
        {
          status: 404,
        },
      );
    }

    return new Response(bufferToArrayBuffer(workbookResult.buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": buildContentDisposition(workbookResult.fileName),
        "Cache-Control": "no-store",
      },
    });
  }

  const exportType = parseAuditCsvExportType(requestedType);

  if (!exportType) {
    return NextResponse.json(
      {
        error: "A valid auditId and export type are required.",
      },
      {
        status: 400,
      },
    );
  }

  const exportResult = await buildAuditCsvExport({
    auditId,
    exportType,
  });

  if (!exportResult) {
    return NextResponse.json(
      {
        error: "Audit not found.",
      },
      {
        status: 404,
      },
    );
  }

  await recordAuditCsvExport({
    auditId,
    exportType: exportResult.exportType,
    fileName: exportResult.fileName,
    rowCount: exportResult.rowCount,
  });

  return new Response(withUtf8Bom(exportResult.csv), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": buildContentDisposition(exportResult.fileName),
      "Cache-Control": "no-store",
    },
  });
}

function buildContentDisposition(fileName: string) {
  const asciiFileName = fileName.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "");
  const encodedFileName = encodeURIComponent(fileName);

  return `attachment; filename="${asciiFileName}"; filename*=UTF-8''${encodedFileName}`;
}

function bufferToArrayBuffer(buffer: Buffer) {
  const arrayBuffer = new ArrayBuffer(buffer.byteLength);
  new Uint8Array(arrayBuffer).set(buffer);

  return arrayBuffer;
}
