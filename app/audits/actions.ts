"use server";

import { Prisma } from "@prisma/client";
import { refresh, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { CreateAuditFormState } from "@/lib/audits/action-state";
import { createAuditForBrand } from "@/lib/audits/create";
import {
  parseCreateExperimentFormData,
  parseCreateFindingFormData,
  parseCreateRecommendationFormData,
  type CreateExperimentFormState,
  type CreateFindingFormState,
  type CreateRecommendationFormState,
} from "@/lib/audits/manual-workflow-validation";
import { parseAuditResponseFormData, type AuditResponseFormState } from "@/lib/audits/validation";
import { prisma } from "@/lib/db/prisma";
import { getRiskLevelFromScore, normalizeCriterionScore } from "@/lib/scoring";

function getAuditResponseActionErrorMessage(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return "Audit response could not be found.";
  }

  console.error(error);

  return "Unable to save this response right now. Please review the fields and try again.";
}

function getCreateAuditMessage(reason: "brand_not_found" | "active_template_missing") {
  switch (reason) {
    case "brand_not_found":
      return "Brand not found. It may have been removed.";
    case "active_template_missing":
      return "An active audit template is required before creating a new audit.";
  }
}

function getManualWorkflowActionErrorMessage(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return "The selected audit record could not be found.";
  }

  console.error(error);

  return "Unable to create this workflow item right now. Please review the fields and try again.";
}

function revalidateAuditWorkflowPaths({
  auditId,
  brandId,
}: {
  auditId: string;
  brandId: string;
}) {
  revalidatePath(`/audits/${auditId}`);
  revalidatePath(`/audits/${auditId}/summary`);
  revalidatePath(`/audits/${auditId}/report`);
  revalidatePath(`/brands/${brandId}`);
  revalidatePath("/audits");
  revalidatePath("/audit-reviews");
  revalidatePath("/reports");
  revalidatePath("/exports");
  revalidatePath("/dashboard");
  refresh();
}

export async function createAuditForBrandAction(
  brandId: string,
  previousState: CreateAuditFormState,
  formData: FormData,
): Promise<CreateAuditFormState> {
  void previousState;
  void formData;

  let auditId: string;

  try {
    const result = await createAuditForBrand(brandId);

    if (!result.success) {
      return {
        ok: false,
        message: getCreateAuditMessage(result.reason),
      };
    }

    auditId = result.audit.id;
  } catch (error) {
    console.error(error);

    return {
      ok: false,
      message: "Unable to create a new audit right now. Please try again.",
    };
  }

  revalidatePath("/brands");
  revalidatePath(`/brands/${brandId}`);
  redirect(`/audits/${auditId}`);
}

export async function upsertAuditResponseAction(
  auditId: string,
  criteriaId: string,
  _previousState: AuditResponseFormState,
  formData: FormData,
): Promise<AuditResponseFormState> {
  const parsed = parseAuditResponseFormData(formData);

  if (!parsed.success) {
    return parsed.state;
  }

  try {
    const audit = await prisma.audit.findUnique({
      where: {
        id: auditId,
      },
      select: {
        templateId: true,
      },
    });

    if (!audit) {
      return {
        ok: false,
        message: "Audit not found. It may have been removed.",
      };
    }

    const criteria = await prisma.auditCriteria.findFirst({
      where: {
        id: criteriaId,
        section: {
          templateId: audit.templateId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!criteria) {
      return {
        ok: false,
        message: "This criterion does not belong to the selected audit template.",
      };
    }

    const normalizedScore = normalizeCriterionScore(parsed.data.score0To5);
    const riskLevel = getRiskLevelFromScore(normalizedScore);
    const responseData =
      parsed.data.responseData === null
        ? Prisma.JsonNull
        : (parsed.data.responseData as Prisma.InputJsonValue);

    await prisma.auditResponse.upsert({
      where: {
        auditId_criteriaId: {
          auditId,
          criteriaId,
        },
      },
      create: {
        auditId,
        criteriaId,
        score0To5: parsed.data.score0To5,
        normalizedScore,
        riskLevel,
        confidence: parsed.data.confidence,
        notes: parsed.data.notes,
        responseData,
      },
      update: {
        score0To5: parsed.data.score0To5,
        normalizedScore,
        riskLevel,
        confidence: parsed.data.confidence,
        notes: parsed.data.notes,
        responseData,
      },
      select: {
        id: true,
      },
    });
  } catch (error) {
    return {
      ok: false,
      message: getAuditResponseActionErrorMessage(error),
    };
  }

  revalidatePath(`/audits/${auditId}`);
  refresh();

  return {
    ok: true,
    message: "Response saved.",
  };
}

export async function createFindingForAuditAction(
  auditId: string,
  _previousState: CreateFindingFormState,
  formData: FormData,
): Promise<CreateFindingFormState> {
  const parsed = parseCreateFindingFormData(formData);

  if (!parsed.success) {
    return parsed.state;
  }

  try {
    const audit = await prisma.audit.findUnique({
      where: {
        id: auditId,
      },
      select: {
        brandId: true,
        template: {
          select: {
            sections: {
              select: {
                sectionKey: true,
              },
            },
          },
        },
      },
    });

    if (!audit) {
      return {
        ok: false,
        message: "Audit not found. It may have been removed.",
      };
    }

    const sectionBelongsToAudit = audit.template.sections.some(
      (section) => section.sectionKey === parsed.data.sectionKey,
    );

    if (!sectionBelongsToAudit) {
      return {
        ok: false,
        message: "Select a section from this audit template.",
        fieldErrors: {
          sectionKey: "This section does not belong to the selected audit.",
        },
      };
    }

    await prisma.finding.create({
      data: {
        auditId,
        sectionKey: parsed.data.sectionKey,
        title: parsed.data.title,
        description: parsed.data.description,
        evidence: parsed.data.evidence,
        severity: parsed.data.severity,
        confidence: parsed.data.confidence,
        businessImpact: parsed.data.businessImpact,
        relatedMetricName: parsed.data.relatedMetricName,
        relatedMetricValue: parsed.data.relatedMetricValue
          ? new Prisma.Decimal(parsed.data.relatedMetricValue)
          : null,
        status: parsed.data.status,
      },
      select: {
        id: true,
      },
    });

    revalidateAuditWorkflowPaths({
      auditId,
      brandId: audit.brandId,
    });
    revalidatePath("/findings");
  } catch (error) {
    return {
      ok: false,
      message: getManualWorkflowActionErrorMessage(error),
    };
  }

  return {
    ok: true,
    message: "Finding created successfully.",
  };
}

export async function createRecommendationForAuditAction(
  auditId: string,
  _previousState: CreateRecommendationFormState,
  formData: FormData,
): Promise<CreateRecommendationFormState> {
  const parsed = parseCreateRecommendationFormData(formData);

  if (!parsed.success) {
    return parsed.state;
  }

  try {
    const audit = await prisma.audit.findUnique({
      where: {
        id: auditId,
      },
      select: {
        brandId: true,
      },
    });

    if (!audit) {
      return {
        ok: false,
        message: "Audit not found. It may have been removed.",
      };
    }

    const finding = await prisma.finding.findFirst({
      where: {
        id: parsed.data.findingId,
        auditId,
      },
      select: {
        id: true,
      },
    });

    if (!finding) {
      return {
        ok: false,
        message: "Select a finding from this audit.",
        fieldErrors: {
          findingId: "This finding does not belong to the selected audit.",
        },
      };
    }

    await prisma.recommendation.create({
      data: {
        auditId,
        findingId: parsed.data.findingId,
        title: parsed.data.title,
        rationale: parsed.data.rationale,
        expectedImpact: parsed.data.expectedImpact,
        effort: parsed.data.effort,
        priority: parsed.data.priority,
        suggestedOwner: parsed.data.suggestedOwner,
        confidence: parsed.data.confidence,
        status: parsed.data.status,
      },
      select: {
        id: true,
      },
    });

    revalidateAuditWorkflowPaths({
      auditId,
      brandId: audit.brandId,
    });
    revalidatePath("/findings");
    revalidatePath(`/findings/${parsed.data.findingId}`);
    revalidatePath("/recommendations");
  } catch (error) {
    return {
      ok: false,
      message: getManualWorkflowActionErrorMessage(error),
    };
  }

  return {
    ok: true,
    message: "Recommendation created successfully.",
  };
}

export async function createExperimentForAuditAction(
  auditId: string,
  _previousState: CreateExperimentFormState,
  formData: FormData,
): Promise<CreateExperimentFormState> {
  const parsed = parseCreateExperimentFormData(formData);

  if (!parsed.success) {
    return parsed.state;
  }

  try {
    const audit = await prisma.audit.findUnique({
      where: {
        id: auditId,
      },
      select: {
        brandId: true,
      },
    });

    if (!audit) {
      return {
        ok: false,
        message: "Audit not found. It may have been removed.",
      };
    }

    const recommendation = await prisma.recommendation.findFirst({
      where: {
        id: parsed.data.recommendationId,
        auditId,
      },
      select: {
        id: true,
        findingId: true,
      },
    });

    if (!recommendation) {
      return {
        ok: false,
        message: "Select a recommendation from this audit.",
        fieldErrors: {
          recommendationId: "This recommendation does not belong to the selected audit.",
        },
      };
    }

    await prisma.experiment.create({
      data: {
        auditId,
        recommendationId: parsed.data.recommendationId,
        funnelStage: parsed.data.funnelStage,
        problemObserved: parsed.data.problemObserved,
        evidence: parsed.data.evidence,
        hypothesis: parsed.data.hypothesis,
        proposedChange: parsed.data.proposedChange,
        primaryMetric: parsed.data.primaryMetric,
        secondaryMetric: parsed.data.secondaryMetric,
        impact: parsed.data.impact,
        confidenceScore: parsed.data.confidenceScore,
        ease: parsed.data.ease,
        effort: parsed.data.effort,
        priorityScore: parsed.data.priorityScore,
        owner: parsed.data.owner,
        status: parsed.data.status,
        deadline: parsed.data.deadline,
      },
      select: {
        id: true,
      },
    });

    revalidateAuditWorkflowPaths({
      auditId,
      brandId: audit.brandId,
    });
    revalidatePath("/experiments");
    revalidatePath("/recommendations");
    revalidatePath(`/recommendations/${parsed.data.recommendationId}`);
    revalidatePath("/findings");
    revalidatePath(`/findings/${recommendation.findingId}`);
  } catch (error) {
    return {
      ok: false,
      message: getManualWorkflowActionErrorMessage(error),
    };
  }

  return {
    ok: true,
    message: "Experiment created successfully.",
  };
}
