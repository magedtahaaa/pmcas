import type { Prisma } from "@prisma/client";

import { formatMetricValue } from "@/lib/brands/format";
import { prisma } from "@/lib/db/prisma";
import {
  getAuditSectionName,
  getFindingSeverityRank,
  isAuditSectionKey,
  isFindingConfidence,
  isFindingSeverity,
  isFindingStatus,
  type AuditSectionKeyValue,
  type FindingConfidenceValue,
  type FindingSeverityValue,
  type FindingStatusValue,
} from "@/lib/findings/constants";

export type FindingFilters = {
  status?: FindingStatusValue;
  severity?: FindingSeverityValue;
  confidence?: FindingConfidenceValue;
  brandId?: string;
  sectionKey?: AuditSectionKeyValue;
};

export type FindingListItem = {
  id: string;
  title: string;
  description: string;
  severity: FindingSeverityValue;
  confidence: FindingConfidenceValue;
  status: FindingStatusValue;
  businessImpact: string;
  sectionKey: AuditSectionKeyValue;
  sectionName: string;
  createdAt: Date;
  updatedAt: Date;
  evidenceSummary: string;
  recommendationCount: number;
  evidenceItemCount: number;
  audit: {
    id: string;
    title: string;
    auditDate: Date;
  };
  brand: {
    id: string;
    name: string;
  };
};

export type FindingCounts = {
  total: number;
  draft: number;
  accepted: number;
  edited: number;
  dismissed: number;
};

export type FindingFilterBrand = {
  id: string;
  name: string;
};

export type FindingDetail = FindingListItem & {
  relatedMetricName: string | null;
  relatedMetricValue: string | null;
  auditResponse: {
    id: string;
    score0To5: number;
    normalizedScore: number;
    notes: string | null;
    criteriaTitle: string;
  } | null;
  evidenceItems: Array<{
    id: string;
    title: string;
    description: string | null;
    source: string | null;
    url: string | null;
    metricName: string | null;
    metricValue: string | null;
    createdAt: Date;
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    priority: string;
    suggestedOwner: string;
    status: string;
    expectedImpact: string;
    experimentCount: number;
    createdAt: Date;
  }>;
};

export type FindingsWorkflowData = {
  findings: FindingListItem[];
  counts: FindingCounts;
  filterBrands: FindingFilterBrand[];
};

export function parseFindingFilters(params: Record<string, string | string[] | undefined>) {
  const status = getSingleParam(params.status);
  const severity = getSingleParam(params.severity);
  const confidence = getSingleParam(params.confidence);
  const brandId = getSingleParam(params.brandId);
  const sectionKey = getSingleParam(params.sectionKey);

  return {
    status: status && isFindingStatus(status) ? status : undefined,
    severity: severity && isFindingSeverity(severity) ? severity : undefined,
    confidence: confidence && isFindingConfidence(confidence) ? confidence : undefined,
    brandId: brandId || undefined,
    sectionKey: sectionKey && isAuditSectionKey(sectionKey) ? sectionKey : undefined,
  };
}

export async function getFindingsWorkflowData(
  filters: FindingFilters = {},
): Promise<FindingsWorkflowData> {
  const where = buildFindingWhere(filters);
  const [findings, counts, filterBrands] = await Promise.all([
    prisma.finding.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        audit: {
          select: {
            id: true,
            title: true,
            auditDate: true,
            brand: {
              select: {
                id: true,
                name: true,
              },
            },
            template: {
              select: {
                sections: {
                  select: {
                    sectionKey: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            recommendations: true,
            evidenceItems: true,
          },
        },
      },
    }),
    getFindingCounts(),
    getFindingFilterBrands(),
  ]);

  return {
    findings: findings
      .map((finding) => ({
        id: finding.id,
        title: finding.title,
        description: finding.description,
        severity: finding.severity,
        confidence: finding.confidence,
        status: finding.status,
        businessImpact: finding.businessImpact,
        sectionKey: finding.sectionKey,
        sectionName: getSectionNameFromAudit(finding.sectionKey, finding.audit.template.sections),
        createdAt: finding.createdAt,
        updatedAt: finding.updatedAt,
        evidenceSummary: finding.evidence,
        recommendationCount: finding._count.recommendations,
        evidenceItemCount: finding._count.evidenceItems,
        audit: {
          id: finding.audit.id,
          title: finding.audit.title,
          auditDate: finding.audit.auditDate,
        },
        brand: finding.audit.brand,
      }))
      .sort(sortFindingsBySeverityThenNewest),
    counts,
    filterBrands,
  };
}

export async function getFindingDetail(id: string): Promise<FindingDetail | null> {
  const finding = await prisma.finding.findUnique({
    where: {
      id,
    },
    include: {
      audit: {
        select: {
          id: true,
          title: true,
          auditDate: true,
          brand: {
            select: {
              id: true,
              name: true,
            },
          },
          template: {
            select: {
              sections: {
                select: {
                  sectionKey: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      auditResponse: {
        select: {
          id: true,
          score0To5: true,
          normalizedScore: true,
          notes: true,
          criteria: {
            select: {
              title: true,
            },
          },
        },
      },
      evidenceItems: {
        orderBy: {
          createdAt: "desc",
        },
      },
      recommendations: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          title: true,
          priority: true,
          suggestedOwner: true,
          status: true,
          expectedImpact: true,
          createdAt: true,
          _count: {
            select: {
              experiments: true,
            },
          },
        },
      },
      _count: {
        select: {
          recommendations: true,
          evidenceItems: true,
        },
      },
    },
  });

  if (!finding) {
    return null;
  }

  return {
    id: finding.id,
    title: finding.title,
    description: finding.description,
    severity: finding.severity,
    confidence: finding.confidence,
    status: finding.status,
    businessImpact: finding.businessImpact,
    sectionKey: finding.sectionKey,
    sectionName: getSectionNameFromAudit(finding.sectionKey, finding.audit.template.sections),
    createdAt: finding.createdAt,
    updatedAt: finding.updatedAt,
    evidenceSummary: finding.evidence,
    recommendationCount: finding._count.recommendations,
    evidenceItemCount: finding._count.evidenceItems,
    relatedMetricName: finding.relatedMetricName,
    relatedMetricValue: finding.relatedMetricValue
      ? formatMetricValue(finding.relatedMetricValue)
      : null,
    audit: {
      id: finding.audit.id,
      title: finding.audit.title,
      auditDate: finding.audit.auditDate,
    },
    brand: finding.audit.brand,
    auditResponse: finding.auditResponse
      ? {
          id: finding.auditResponse.id,
          score0To5: finding.auditResponse.score0To5,
          normalizedScore: finding.auditResponse.normalizedScore,
          notes: finding.auditResponse.notes,
          criteriaTitle: finding.auditResponse.criteria.title,
        }
      : null,
    evidenceItems: finding.evidenceItems.map((evidence) => ({
      id: evidence.id,
      title: evidence.title,
      description: evidence.description,
      source: evidence.source,
      url: evidence.url,
      metricName: evidence.metricName,
      metricValue: evidence.metricValue ? formatMetricValue(evidence.metricValue) : null,
      createdAt: evidence.createdAt,
    })),
    recommendations: finding.recommendations.map((recommendation) => ({
      id: recommendation.id,
      title: recommendation.title,
      priority: recommendation.priority,
      suggestedOwner: recommendation.suggestedOwner,
      status: recommendation.status,
      expectedImpact: recommendation.expectedImpact,
      experimentCount: recommendation._count.experiments,
      createdAt: recommendation.createdAt,
    })),
  };
}

async function getFindingCounts(): Promise<FindingCounts> {
  const [total, draft, accepted, edited, dismissed] = await Promise.all([
    prisma.finding.count(),
    prisma.finding.count({
      where: {
        status: "DRAFT",
      },
    }),
    prisma.finding.count({
      where: {
        status: "ACCEPTED",
      },
    }),
    prisma.finding.count({
      where: {
        status: "EDITED",
      },
    }),
    prisma.finding.count({
      where: {
        status: "DISMISSED",
      },
    }),
  ]);

  return {
    total,
    draft,
    accepted,
    edited,
    dismissed,
  };
}

async function getFindingFilterBrands(): Promise<FindingFilterBrand[]> {
  return prisma.brand.findMany({
    where: {
      audits: {
        some: {
          findings: {
            some: {},
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });
}

function buildFindingWhere(filters: FindingFilters): Prisma.FindingWhereInput {
  return {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.severity ? { severity: filters.severity } : {}),
    ...(filters.confidence ? { confidence: filters.confidence } : {}),
    ...(filters.sectionKey ? { sectionKey: filters.sectionKey } : {}),
    ...(filters.brandId
      ? {
          audit: {
            brandId: filters.brandId,
          },
        }
      : {}),
  };
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getSectionNameFromAudit(
  sectionKey: AuditSectionKeyValue,
  sections: Array<{ sectionKey: string; name: string }>,
) {
  return sections.find((section) => section.sectionKey === sectionKey)?.name ?? getAuditSectionName(sectionKey);
}

function sortFindingsBySeverityThenNewest(a: FindingListItem, b: FindingListItem) {
  const severityDifference = getFindingSeverityRank(b.severity) - getFindingSeverityRank(a.severity);

  if (severityDifference !== 0) {
    return severityDifference;
  }

  return b.createdAt.getTime() - a.createdAt.getTime();
}
