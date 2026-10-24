import { prisma } from "@/lib/db/prisma";

export type CreateAuditResult =
  | {
      success: true;
      audit: {
        id: string;
      };
    }
  | {
      success: false;
      reason: "brand_not_found" | "active_template_missing";
    };

export function getAuditTitleForDate(date: Date) {
  const monthYear = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);

  return `${monthYear} PMCAS Conversion Audit`;
}

export async function createAuditForBrand(brandId: string): Promise<CreateAuditResult> {
  const brand = await prisma.brand.findUnique({
    where: {
      id: brandId,
    },
    select: {
      id: true,
    },
  });

  if (!brand) {
    return {
      success: false,
      reason: "brand_not_found",
    };
  }

  const activeTemplate = await prisma.auditTemplate.findFirst({
    where: {
      isActive: true,
    },
    orderBy: [
      {
        updatedAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    select: {
      id: true,
    },
  });

  if (!activeTemplate) {
    return {
      success: false,
      reason: "active_template_missing",
    };
  }

  const auditDate = new Date();
  const audit = await prisma.audit.create({
    data: {
      brandId: brand.id,
      templateId: activeTemplate.id,
      title: getAuditTitleForDate(auditDate),
      auditDate,
      overallConfidence: "LOW",
    },
    select: {
      id: true,
    },
  });

  return {
    success: true,
    audit,
  };
}
