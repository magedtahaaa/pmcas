import { prisma } from "@/lib/db/prisma";
import {
  calculateAuditScoreSummary,
  type ScoringConfidenceLevel,
  type ScoringRiskLevel,
  type SectionScoreInput,
} from "@/lib/scoring";

const DASHBOARD_LIST_LIMIT = 5;

export type DashboardRecentAudit = {
  id: string;
  title: string;
  auditDate: Date;
  createdAt: Date;
  overallScore: number | null;
  overallRisk: ScoringRiskLevel | null;
  overallConfidence: ScoringConfidenceLevel;
  status: "draft";
  brand: {
    id: string;
    name: string;
  };
  counts: {
    responses: number;
    findings: number;
    recommendations: number;
    experiments: number;
  };
};

export type DashboardBrandActivity = {
  id: string;
  name: string;
  industry: string | null;
  market: string | null;
  updatedAt: Date;
  createdAt: Date;
  counts: {
    audits: number;
    metrics: number;
  };
};

export type DashboardSectionScore = {
  sectionId: string;
  sectionKey: string;
  sectionName: string;
  shortName: string;
  score: number | null;
  chartScore: number;
  riskLevel: ScoringRiskLevel | null;
  confidence: ScoringConfidenceLevel | null;
  answeredCriteria: number;
  totalCriteria: number;
  completionPercentage: number;
};

export type DashboardSectionScorePreview = {
  auditId: string;
  auditTitle: string;
  brandName: string;
  auditDate: Date;
  sections: DashboardSectionScore[];
};

export type DashboardSummary = {
  counts: {
    totalBrands: number;
    activeBrands: number;
    totalAudits: number;
    openAudits: number;
    completedAudits: number | null;
    totalFindings: number;
    draftFindings: number;
    acceptedFindings: number;
    recommendations: number;
    experiments: number;
  };
  recentAudits: DashboardRecentAudit[];
  latestBrandActivity: DashboardBrandActivity[];
  sectionScorePreview: DashboardSectionScorePreview | null;
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [
    totalBrands,
    totalAudits,
    totalFindings,
    draftFindings,
    acceptedFindings,
    recommendations,
    experiments,
    recentAudits,
    latestBrandActivity,
    latestAuditForScores,
  ] = await Promise.all([
    prisma.brand.count(),
    prisma.audit.count(),
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
    prisma.recommendation.count(),
    prisma.experiment.count(),
    getRecentAudits(),
    getLatestBrandActivity(),
    getLatestAuditForScores(),
  ]);

  return {
    counts: {
      totalBrands,
      activeBrands: totalBrands,
      totalAudits,
      openAudits: totalAudits,
      completedAudits: null,
      totalFindings,
      draftFindings,
      acceptedFindings,
      recommendations,
      experiments,
    },
    recentAudits: recentAudits.map((audit) => ({
      id: audit.id,
      title: audit.title,
      auditDate: audit.auditDate,
      createdAt: audit.createdAt,
      overallScore: audit.overallScore,
      overallRisk: audit.overallRisk,
      overallConfidence: audit.overallConfidence,
      status: "draft",
      brand: audit.brand,
      counts: {
        responses: audit._count.responses,
        findings: audit._count.findings,
        recommendations: audit._count.recommendations,
        experiments: audit._count.experiments,
      },
    })),
    latestBrandActivity: latestBrandActivity.map((brand) => ({
      id: brand.id,
      name: brand.name,
      industry: brand.industry,
      market: brand.market,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
      counts: {
        audits: brand._count.audits,
        metrics: brand._count.metrics,
      },
    })),
    sectionScorePreview: buildSectionScorePreview(latestAuditForScores),
  };
}

async function getRecentAudits() {
  return prisma.audit.findMany({
    orderBy: [
      {
        auditDate: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    take: DASHBOARD_LIST_LIMIT,
    select: {
      id: true,
      title: true,
      auditDate: true,
      createdAt: true,
      overallScore: true,
      overallRisk: true,
      overallConfidence: true,
      brand: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          responses: true,
          findings: true,
          recommendations: true,
          experiments: true,
        },
      },
    },
  });
}

async function getLatestBrandActivity() {
  return prisma.brand.findMany({
    orderBy: [
      {
        updatedAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    take: DASHBOARD_LIST_LIMIT,
    select: {
      id: true,
      name: true,
      industry: true,
      market: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          audits: true,
          metrics: true,
        },
      },
    },
  });
}

async function getLatestAuditForScores() {
  return prisma.audit.findFirst({
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
      brand: {
        select: {
          name: true,
        },
      },
      template: {
        select: {
          sections: {
            orderBy: {
              sortOrder: "asc",
            },
            select: {
              id: true,
              sectionKey: true,
              name: true,
              weight: true,
              criteria: {
                orderBy: {
                  sortOrder: "asc",
                },
                select: {
                  id: true,
                  weight: true,
                },
              },
            },
          },
        },
      },
      responses: {
        select: {
          criteriaId: true,
          score0To5: true,
          confidence: true,
        },
      },
    },
  });
}

function buildSectionScorePreview(
  audit: Awaited<ReturnType<typeof getLatestAuditForScores>>,
): DashboardSectionScorePreview | null {
  if (!audit) {
    return null;
  }

  const responsesByCriteriaId = new Map(
    audit.responses.map((response) => [response.criteriaId, response]),
  );
  const sectionScoreInputs: SectionScoreInput[] = audit.template.sections.map((section) => ({
    id: section.id,
    name: section.name,
    weight: section.weight,
    criteria: section.criteria.map((criterion) => {
      const response = responsesByCriteriaId.get(criterion.id);

      return {
        id: criterion.id,
        weight: criterion.weight,
        response: response
          ? {
              score0To5: response.score0To5,
              confidence: response.confidence,
            }
          : null,
      };
    }),
  }));
  const scoreSummary = calculateAuditScoreSummary(sectionScoreInputs);
  const scoresBySectionId = new Map(
    scoreSummary.sectionScores.map((sectionScore) => [sectionScore.sectionId, sectionScore]),
  );

  return {
    auditId: audit.id,
    auditTitle: audit.title,
    brandName: audit.brand.name,
    auditDate: audit.auditDate,
    sections: audit.template.sections.map((section) => {
      const score = scoresBySectionId.get(section.id);
      const rawScore = score?.score ?? null;

      return {
        sectionId: section.id,
        sectionKey: section.sectionKey,
        sectionName: section.name,
        shortName: getShortSectionName(section.sectionKey, section.name),
        score: rawScore,
        chartScore: rawScore === null ? 0 : Math.round(rawScore),
        riskLevel: score?.riskLevel ?? null,
        confidence: score?.confidence ?? null,
        answeredCriteria: score?.answeredCriteria ?? 0,
        totalCriteria: score?.totalCriteria ?? section.criteria.length,
        completionPercentage: score?.completionPercentage ?? 0,
      };
    }),
  };
}

function getShortSectionName(sectionKey: string, fallback: string) {
  switch (sectionKey) {
    case "MEASUREMENT_DATA_AUDIT":
      return "Measurement";
    case "FUNNEL_LEAKAGE_AUDIT":
      return "Funnel";
    case "CUSTOMER_MARKET_RESEARCH":
      return "Research";
    case "OFFER_PRICING_MESSAGING":
      return "Offer";
    case "BRAND_POSITIONING":
      return "Positioning";
    case "CHANNEL_EXPANSION":
      return "Growth";
    case "TEAM_WORKFLOW_ALIGNMENT":
      return "Workflow";
    case "EXPERIMENTATION_ROADMAP":
      return "Roadmap";
    default:
      return fallback;
  }
}
