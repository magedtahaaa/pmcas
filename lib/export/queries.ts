import { prisma } from "@/lib/db/prisma";
import { AUDIT_CSV_EXPORT_DEFINITIONS } from "@/lib/export/definitions";

export async function getExportCenterData(selectedAuditId?: string) {
  const audits = await prisma.audit.findMany({
    orderBy: [
      {
        auditDate: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    select: {
      id: true,
      title: true,
      auditDate: true,
      createdAt: true,
      overallScore: true,
      overallConfidence: true,
      brand: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  const selectedAudit =
    audits.find((audit) => audit.id === selectedAuditId) ?? audits[0] ?? null;
  const exportHistory = selectedAudit
    ? await prisma.export.findMany({
        where: {
          auditId: selectedAudit.id,
          exportType: {
            in: AUDIT_CSV_EXPORT_DEFINITIONS.map((definition) => definition.type),
          },
        },
        orderBy: {
          exportedAt: "desc",
        },
        take: 20,
      })
    : [];

  return {
    audits,
    selectedAudit,
    exportHistory,
  };
}
