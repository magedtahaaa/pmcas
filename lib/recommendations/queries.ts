import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import {
  getAuditSectionName,
  isAuditSectionKey,
  type AuditSectionKeyValue,
} from "@/lib/findings/constants";
import {
  getRecommendationPriorityRank,
  isRecommendationOwner,
  isRecommendationPriority,
  isRecommendationStatus,
  type RecommendationConfidenceValue,
  type RecommendationOwnerValue,
  type RecommendationPriorityValue,
  type RecommendationStatusValue,
} from "@/lib/recommendations/constants";

export type RecommendationFilters = {
  status?: RecommendationStatusValue;
  priority?: RecommendationPriorityValue;
  owner?: RecommendationOwnerValue;
  brandId?: string;
  sectionKey?: AuditSectionKeyValue;
};

export type RecommendationListItem = {
  id: string;
  title: string;
  rationale: string;
  expectedImpact: string;
  effort: number;
  priority: RecommendationPriorityValue;
  suggestedOwner: RecommendationOwnerValue;
  confidence: RecommendationConfidenceValue;
  status: RecommendationStatusValue;
  createdAt: Date;
  updatedAt: Date;
  sectionKey: AuditSectionKeyValue;
  sectionName: string;
  experimentCount: number;
  evidenceItemCount: number;
  finding: {
    id: string;
    title: string;
  };
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

export type RecommendationCounts = {
  total: number;
  draft: number;
  accepted: number;
  inProgress: number;
  completed: number;
  dismissed: number;
};

export type RecommendationFilterBrand = {
  id: string;
  name: string;
};

export type RecommendationDetail = RecommendationListItem & {
  finding: RecommendationListItem["finding"] & {
    description: string;
    businessImpact: string;
    severity: string;
    confidence: string;
    status: string;
  };
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
  experiments: Array<{
    id: string;
    funnelStage: string;
    hypothesis: string;
    primaryMetric: string;
    priorityScore: number;
    status: string;
    owner: string;
    createdAt: Date;
  }>;
};

export type RecommendationsWorkflowData = {
  recommendations: RecommendationListItem[];
  counts: RecommendationCounts;
  filterBrands: RecommendationFilterBrand[];
};

export function parseRecommendationFilters(
  params: Record<string, string | string[] | undefined>,
): RecommendationFilters {
  const status = getSingleParam(params.status);
  const priority = getSingleParam(params.priority);
  const owner = getSingleParam(params.owner);
  const brandId = getSingleParam(params.brandId);
  const sectionKey = getSingleParam(params.sectionKey);

  return {
    status: status && isRecommendationStatus(status) ? status : undefined,
    priority: priority && isRecommendationPriority(priority) ? priority : undefined,
    owner: owner && isRecommendationOwner(owner) ? owner : undefined,
    brandId: brandId || undefined,
    sectionKey: sectionKey && isAuditSectionKey(sectionKey) ? sectionKey : undefined,
  };
}

export async function getRecommendationsWorkflowData(
  filters: RecommendationFilters = {},
): Promise<RecommendationsWorkflowData> {
  const where = buildRecommendationWhere(filters);
  const [recommendations, counts, filterBrands] = await Promise.all([
    prisma.recommendation.findMany({
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
        finding: {
          select: {
            id: true,
            title: true,
            sectionKey: true,
          },
        },
        _count: {
          select: {
            experiments: true,
            evidenceItems: true,
          },
        },
      },
    }),
    getRecommendationCounts(),
    getRecommendationFilterBrands(),
  ]);

  return {
    recommendations: recommendations.map(toRecommendationListItem).sort(sortRecommendations),
    counts,
    filterBrands,
  };
}

export async function getRecommendationDetail(id: string): Promise<RecommendationDetail | null> {
  const recommendation = await prisma.recommendation.findUnique({
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
      finding: {
        select: {
          id: true,
          title: true,
          description: true,
          businessImpact: true,
          sectionKey: true,
          severity: true,
          confidence: true,
          status: true,
        },
      },
      evidenceItems: {
        orderBy: {
          createdAt: "desc",
        },
      },
      experiments: {
        orderBy: {
          priorityScore: "desc",
        },
        select: {
          id: true,
          funnelStage: true,
          hypothesis: true,
          primaryMetric: true,
          priorityScore: true,
          status: true,
          owner: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          experiments: true,
          evidenceItems: true,
        },
      },
    },
  });

  if (!recommendation) {
    return null;
  }

  const listItem = toRecommendationListItem(recommendation);

  return {
    ...listItem,
    finding: {
      ...listItem.finding,
      description: recommendation.finding.description,
      businessImpact: recommendation.finding.businessImpact,
      severity: recommendation.finding.severity,
      confidence: recommendation.finding.confidence,
      status: recommendation.finding.status,
    },
    evidenceItems: recommendation.evidenceItems.map((evidence) => ({
      id: evidence.id,
      title: evidence.title,
      description: evidence.description,
      source: evidence.source,
      url: evidence.url,
      metricName: evidence.metricName,
      metricValue: evidence.metricValue ? evidence.metricValue.toString() : null,
      createdAt: evidence.createdAt,
    })),
    experiments: recommendation.experiments.map((experiment) => ({
      id: experiment.id,
      funnelStage: experiment.funnelStage,
      hypothesis: experiment.hypothesis,
      primaryMetric: experiment.primaryMetric,
      priorityScore: experiment.priorityScore,
      status: experiment.status,
      owner: experiment.owner,
      createdAt: experiment.createdAt,
    })),
  };
}

async function getRecommendationCounts(): Promise<RecommendationCounts> {
  const [total, draft, accepted, inProgress, completed, dismissed] = await Promise.all([
    prisma.recommendation.count(),
    prisma.recommendation.count({
      where: {
        status: "DRAFT",
      },
    }),
    prisma.recommendation.count({
      where: {
        status: "ACCEPTED",
      },
    }),
    prisma.recommendation.count({
      where: {
        status: "IN_PROGRESS",
      },
    }),
    prisma.recommendation.count({
      where: {
        status: "COMPLETED",
      },
    }),
    prisma.recommendation.count({
      where: {
        status: "DISMISSED",
      },
    }),
  ]);

  return {
    total,
    draft,
    accepted,
    inProgress,
    completed,
    dismissed,
  };
}

async function getRecommendationFilterBrands(): Promise<RecommendationFilterBrand[]> {
  return prisma.brand.findMany({
    where: {
      audits: {
        some: {
          recommendations: {
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

function buildRecommendationWhere(
  filters: RecommendationFilters,
): Prisma.RecommendationWhereInput {
  return {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.priority ? { priority: filters.priority } : {}),
    ...(filters.owner ? { suggestedOwner: filters.owner } : {}),
    ...(filters.sectionKey
      ? {
          finding: {
            sectionKey: filters.sectionKey,
          },
        }
      : {}),
    ...(filters.brandId
      ? {
          audit: {
            brandId: filters.brandId,
          },
        }
      : {}),
  };
}

function toRecommendationListItem(recommendation: {
  id: string;
  title: string;
  rationale: string;
  expectedImpact: string;
  effort: number;
  priority: RecommendationPriorityValue;
  suggestedOwner: RecommendationOwnerValue;
  confidence: RecommendationConfidenceValue;
  status: RecommendationStatusValue;
  createdAt: Date;
  updatedAt: Date;
  audit: {
    id: string;
    title: string;
    auditDate: Date;
    brand: {
      id: string;
      name: string;
    };
    template: {
      sections: Array<{
        sectionKey: string;
        name: string;
      }>;
    };
  };
  finding: {
    id: string;
    title: string;
    sectionKey: AuditSectionKeyValue;
  };
  _count: {
    experiments: number;
    evidenceItems: number;
  };
}): RecommendationListItem {
  return {
    id: recommendation.id,
    title: recommendation.title,
    rationale: recommendation.rationale,
    expectedImpact: recommendation.expectedImpact,
    effort: recommendation.effort,
    priority: recommendation.priority,
    suggestedOwner: recommendation.suggestedOwner,
    confidence: recommendation.confidence,
    status: recommendation.status,
    createdAt: recommendation.createdAt,
    updatedAt: recommendation.updatedAt,
    sectionKey: recommendation.finding.sectionKey,
    sectionName: getSectionNameFromAudit(
      recommendation.finding.sectionKey,
      recommendation.audit.template.sections,
    ),
    experimentCount: recommendation._count.experiments,
    evidenceItemCount: recommendation._count.evidenceItems,
    finding: {
      id: recommendation.finding.id,
      title: recommendation.finding.title,
    },
    audit: {
      id: recommendation.audit.id,
      title: recommendation.audit.title,
      auditDate: recommendation.audit.auditDate,
    },
    brand: recommendation.audit.brand,
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

function sortRecommendations(a: RecommendationListItem, b: RecommendationListItem) {
  const priorityDifference =
    getRecommendationPriorityRank(b.priority) - getRecommendationPriorityRank(a.priority);

  if (priorityDifference !== 0) {
    return priorityDifference;
  }

  return b.createdAt.getTime() - a.createdAt.getTime();
}
