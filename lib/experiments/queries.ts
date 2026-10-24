import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import {
  getAuditSectionName,
  isAuditSectionKey,
  type AuditSectionKeyValue,
} from "@/lib/findings/constants";
import {
  isExperimentScore,
  isExperimentStatus,
  type ExperimentOwnerValue,
  type ExperimentStatusValue,
} from "@/lib/experiments/constants";

export type ExperimentFilters = {
  status?: ExperimentStatusValue;
  impact?: number;
  confidenceScore?: number;
  effort?: number;
  brandId?: string;
  primaryMetric?: string;
};

export type ExperimentListItem = {
  id: string;
  funnelStage: string;
  problemObserved: string;
  evidence: string;
  hypothesis: string;
  proposedChange: string;
  primaryMetric: string;
  secondaryMetric: string | null;
  impact: number;
  confidenceScore: number;
  ease: number;
  effort: number;
  priorityScore: number;
  owner: ExperimentOwnerValue;
  status: ExperimentStatusValue;
  result: string | null;
  learning: string | null;
  nextAction: string | null;
  deadline: Date | null;
  createdAt: Date;
  updatedAt: Date;
  sectionKey: AuditSectionKeyValue | null;
  sectionName: string;
  evidenceItemCount: number;
  recommendation: {
    id: string;
    title: string;
    expectedImpact: string;
  } | null;
  finding: {
    id: string;
    title: string;
    sectionKey: AuditSectionKeyValue;
  } | null;
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

export type ExperimentCounts = {
  total: number;
  backlog: number;
  planned: number;
  running: number;
  completed: number;
  paused: number;
  rejected: number;
};

export type ExperimentFilterBrand = {
  id: string;
  name: string;
};

export type ExperimentDetail = ExperimentListItem & {
  recommendation: ExperimentListItem["recommendation"] & {
    effort?: number;
    priority?: string;
    suggestedOwner?: string;
    confidence?: string;
    status?: string;
  } | null;
  finding: ExperimentListItem["finding"] & {
    description?: string;
    businessImpact?: string;
    severity?: string;
    confidence?: string;
    status?: string;
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
};

export type ExperimentsWorkflowData = {
  experiments: ExperimentListItem[];
  counts: ExperimentCounts;
  filterBrands: ExperimentFilterBrand[];
  primaryMetrics: string[];
};

export function parseExperimentFilters(
  params: Record<string, string | string[] | undefined>,
): ExperimentFilters {
  const status = getSingleParam(params.status);
  const impact = parseScoreParam(getSingleParam(params.impact));
  const confidenceScore = parseScoreParam(getSingleParam(params.confidenceScore));
  const effort = parseScoreParam(getSingleParam(params.effort));
  const brandId = getSingleParam(params.brandId);
  const primaryMetric = getSingleParam(params.primaryMetric);

  return {
    status: status && isExperimentStatus(status) ? status : undefined,
    impact,
    confidenceScore,
    effort,
    brandId: brandId || undefined,
    primaryMetric: primaryMetric || undefined,
  };
}

export async function getExperimentsWorkflowData(
  filters: ExperimentFilters = {},
): Promise<ExperimentsWorkflowData> {
  const where = buildExperimentWhere(filters);
  const [experiments, counts, filterBrands, primaryMetrics] = await Promise.all([
    prisma.experiment.findMany({
      where,
      orderBy: [
        {
          impact: "desc",
        },
        {
          confidenceScore: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      include: getExperimentInclude(),
    }),
    getExperimentCounts(),
    getExperimentFilterBrands(),
    getExperimentPrimaryMetrics(),
  ]);

  return {
    experiments: experiments.map(toExperimentListItem),
    counts,
    filterBrands,
    primaryMetrics,
  };
}

export async function getExperimentDetail(id: string): Promise<ExperimentDetail | null> {
  const experiment = await prisma.experiment.findUnique({
    where: {
      id,
    },
    include: {
      ...getExperimentInclude(),
      evidenceItems: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!experiment) {
    return null;
  }

  const listItem = toExperimentListItem(experiment);

  return {
    ...listItem,
    recommendation: experiment.recommendation
      ? {
          id: experiment.recommendation.id,
          title: experiment.recommendation.title,
          expectedImpact: experiment.recommendation.expectedImpact,
          effort: experiment.recommendation.effort,
          priority: experiment.recommendation.priority,
          suggestedOwner: experiment.recommendation.suggestedOwner,
          confidence: experiment.recommendation.confidence,
          status: experiment.recommendation.status,
        }
      : null,
    finding: experiment.recommendation?.finding && listItem.finding
      ? {
          id: experiment.recommendation.finding.id,
          title: experiment.recommendation.finding.title,
          sectionKey: listItem.finding.sectionKey,
          description: experiment.recommendation.finding.description,
          businessImpact: experiment.recommendation.finding.businessImpact,
          severity: experiment.recommendation.finding.severity,
          confidence: experiment.recommendation.finding.confidence,
          status: experiment.recommendation.finding.status,
        }
      : null,
    evidenceItems: experiment.evidenceItems.map((evidence) => ({
      id: evidence.id,
      title: evidence.title,
      description: evidence.description,
      source: evidence.source,
      url: evidence.url,
      metricName: evidence.metricName,
      metricValue: evidence.metricValue ? evidence.metricValue.toString() : null,
      createdAt: evidence.createdAt,
    })),
  };
}

async function getExperimentCounts(): Promise<ExperimentCounts> {
  const [total, backlog, planned, running, completed, paused, rejected] = await Promise.all([
    prisma.experiment.count(),
    prisma.experiment.count({
      where: {
        status: "BACKLOG",
      },
    }),
    prisma.experiment.count({
      where: {
        status: "PLANNED",
      },
    }),
    prisma.experiment.count({
      where: {
        status: "RUNNING",
      },
    }),
    prisma.experiment.count({
      where: {
        status: "COMPLETED",
      },
    }),
    prisma.experiment.count({
      where: {
        status: "PAUSED",
      },
    }),
    prisma.experiment.count({
      where: {
        status: "REJECTED",
      },
    }),
  ]);

  return {
    total,
    backlog,
    planned,
    running,
    completed,
    paused,
    rejected,
  };
}

async function getExperimentFilterBrands(): Promise<ExperimentFilterBrand[]> {
  return prisma.brand.findMany({
    where: {
      audits: {
        some: {
          experiments: {
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

async function getExperimentPrimaryMetrics(): Promise<string[]> {
  const rows = await prisma.experiment.findMany({
    orderBy: {
      primaryMetric: "asc",
    },
    select: {
      primaryMetric: true,
    },
  });

  return Array.from(new Set(rows.map((row) => row.primaryMetric).filter(Boolean)));
}

function buildExperimentWhere(filters: ExperimentFilters): Prisma.ExperimentWhereInput {
  return {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.impact ? { impact: filters.impact } : {}),
    ...(filters.confidenceScore ? { confidenceScore: filters.confidenceScore } : {}),
    ...(filters.effort ? { effort: filters.effort } : {}),
    ...(filters.primaryMetric ? { primaryMetric: filters.primaryMetric } : {}),
    ...(filters.brandId
      ? {
          audit: {
            brandId: filters.brandId,
          },
        }
      : {}),
  };
}

function getExperimentInclude() {
  return {
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
    recommendation: {
      select: {
        id: true,
        title: true,
        expectedImpact: true,
        effort: true,
        priority: true,
        suggestedOwner: true,
        confidence: true,
        status: true,
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
      },
    },
    _count: {
      select: {
        evidenceItems: true,
      },
    },
  } satisfies Prisma.ExperimentInclude;
}

function toExperimentListItem(experiment: {
  id: string;
  funnelStage: string;
  problemObserved: string;
  evidence: string;
  hypothesis: string;
  proposedChange: string;
  primaryMetric: string;
  secondaryMetric: string | null;
  impact: number;
  confidenceScore: number;
  ease: number;
  effort: number;
  priorityScore: number;
  owner: ExperimentOwnerValue;
  status: ExperimentStatusValue;
  result: string | null;
  learning: string | null;
  nextAction: string | null;
  deadline: Date | null;
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
  recommendation: {
    id: string;
    title: string;
    expectedImpact: string;
    finding: {
      id: string;
      title: string;
      sectionKey: string;
    };
  } | null;
  _count: {
    evidenceItems: number;
  };
}): ExperimentListItem {
  const sectionKey = getValidSectionKey(experiment.recommendation?.finding.sectionKey);

  return {
    id: experiment.id,
    funnelStage: experiment.funnelStage,
    problemObserved: experiment.problemObserved,
    evidence: experiment.evidence,
    hypothesis: experiment.hypothesis,
    proposedChange: experiment.proposedChange,
    primaryMetric: experiment.primaryMetric,
    secondaryMetric: experiment.secondaryMetric,
    impact: experiment.impact,
    confidenceScore: experiment.confidenceScore,
    ease: experiment.ease,
    effort: experiment.effort,
    priorityScore: experiment.priorityScore,
    owner: experiment.owner,
    status: experiment.status,
    result: experiment.result,
    learning: experiment.learning,
    nextAction: experiment.nextAction,
    deadline: experiment.deadline,
    createdAt: experiment.createdAt,
    updatedAt: experiment.updatedAt,
    sectionKey,
    sectionName: sectionKey
      ? getSectionNameFromAudit(sectionKey, experiment.audit.template.sections)
      : "Not linked",
    evidenceItemCount: experiment._count.evidenceItems,
    recommendation: experiment.recommendation
      ? {
          id: experiment.recommendation.id,
          title: experiment.recommendation.title,
          expectedImpact: experiment.recommendation.expectedImpact,
        }
      : null,
    finding: sectionKey
      ? {
          id: experiment.recommendation?.finding.id ?? "",
          title: experiment.recommendation?.finding.title ?? "Not linked",
          sectionKey,
        }
      : null,
    audit: {
      id: experiment.audit.id,
      title: experiment.audit.title,
      auditDate: experiment.audit.auditDate,
    },
    brand: experiment.audit.brand,
  };
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseScoreParam(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const score = Number(value);

  return isExperimentScore(score) ? score : undefined;
}

function getValidSectionKey(value: string | null | undefined): AuditSectionKeyValue | null {
  return value && isAuditSectionKey(value) ? value : null;
}

function getSectionNameFromAudit(
  sectionKey: AuditSectionKeyValue,
  sections: Array<{ sectionKey: string; name: string }>,
) {
  return sections.find((section) => section.sectionKey === sectionKey)?.name ?? getAuditSectionName(sectionKey);
}
