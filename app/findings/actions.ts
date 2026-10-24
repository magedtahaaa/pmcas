"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import { parseFindingFormData, type FindingFormState } from "@/lib/findings/validation";

function getFindingActionErrorMessage(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return "Finding not found. It may have been removed.";
  }

  console.error(error);

  return "Unable to save this finding right now. Please review the fields and try again.";
}

export async function updateFindingAction(
  findingId: string,
  _previousState: FindingFormState,
  formData: FormData,
): Promise<FindingFormState> {
  const parsed = parseFindingFormData(formData);

  if (!parsed.success) {
    return parsed.state;
  }

  try {
    const finding = await prisma.finding.update({
      where: {
        id: findingId,
      },
      data: parsed.data,
      select: {
        id: true,
        auditId: true,
        audit: {
          select: {
            brandId: true,
          },
        },
      },
    });

    revalidatePath("/findings");
    revalidatePath(`/findings/${finding.id}`);
    revalidatePath(`/audits/${finding.auditId}`);
    revalidatePath(`/brands/${finding.audit.brandId}`);
    revalidatePath("/dashboard");
  } catch (error) {
    return {
      ok: false,
      message: getFindingActionErrorMessage(error),
    };
  }

  return {
    ok: true,
    message: "Finding updated successfully.",
    values: parsed.data,
  };
}
