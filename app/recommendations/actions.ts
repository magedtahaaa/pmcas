"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import {
  parseRecommendationFormData,
  type RecommendationFormState,
} from "@/lib/recommendations/validation";

function getRecommendationActionErrorMessage(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return "Recommendation not found. It may have been removed.";
  }

  console.error(error);

  return "Unable to save this recommendation right now. Please review the fields and try again.";
}

export async function updateRecommendationAction(
  recommendationId: string,
  _previousState: RecommendationFormState,
  formData: FormData,
): Promise<RecommendationFormState> {
  const parsed = parseRecommendationFormData(formData);

  if (!parsed.success) {
    return parsed.state;
  }

  try {
    const recommendation = await prisma.recommendation.update({
      where: {
        id: recommendationId,
      },
      data: parsed.data,
      select: {
        id: true,
        auditId: true,
        findingId: true,
        audit: {
          select: {
            brandId: true,
          },
        },
      },
    });

    revalidatePath("/recommendations");
    revalidatePath(`/recommendations/${recommendation.id}`);
    revalidatePath("/findings");
    revalidatePath(`/findings/${recommendation.findingId}`);
    revalidatePath(`/audits/${recommendation.auditId}`);
    revalidatePath(`/brands/${recommendation.audit.brandId}`);
    revalidatePath("/dashboard");
  } catch (error) {
    return {
      ok: false,
      message: getRecommendationActionErrorMessage(error),
    };
  }

  return {
    ok: true,
    message: "Recommendation updated successfully.",
    values: parsed.data,
  };
}
