"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import {
  parseExperimentFormData,
  type ExperimentFormState,
} from "@/lib/experiments/validation";

function getExperimentActionErrorMessage(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return "Experiment not found. It may have been removed.";
  }

  console.error(error);

  return "Unable to save this experiment right now. Please review the fields and try again.";
}

export async function updateExperimentAction(
  experimentId: string,
  _previousState: ExperimentFormState,
  formData: FormData,
): Promise<ExperimentFormState> {
  const parsed = parseExperimentFormData(formData);

  if (!parsed.success) {
    return parsed.state;
  }

  try {
    const experiment = await prisma.experiment.update({
      where: {
        id: experimentId,
      },
      data: parsed.data,
      select: {
        id: true,
        auditId: true,
        recommendationId: true,
        audit: {
          select: {
            brandId: true,
          },
        },
        recommendation: {
          select: {
            findingId: true,
          },
        },
      },
    });

    revalidatePath("/experiments");
    revalidatePath(`/experiments/${experiment.id}`);
    revalidatePath(`/audits/${experiment.auditId}`);
    revalidatePath(`/brands/${experiment.audit.brandId}`);
    revalidatePath("/dashboard");

    if (experiment.recommendationId) {
      revalidatePath("/recommendations");
      revalidatePath(`/recommendations/${experiment.recommendationId}`);
    }

    if (experiment.recommendation?.findingId) {
      revalidatePath("/findings");
      revalidatePath(`/findings/${experiment.recommendation.findingId}`);
    }
  } catch (error) {
    return {
      ok: false,
      message: getExperimentActionErrorMessage(error),
    };
  }

  return {
    ok: true,
    message: "Experiment updated successfully.",
  };
}
