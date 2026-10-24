"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db/prisma";
import { parseBrandFormData, type BrandFormState } from "@/lib/brands/validation";

function getBrandActionErrorMessage(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return "Brand not found. It may have been removed.";
  }

  console.error(error);

  return "Unable to save the brand right now. Please review the fields and try again.";
}

export async function createBrandAction(
  _previousState: BrandFormState,
  formData: FormData,
): Promise<BrandFormState> {
  const parsed = parseBrandFormData(formData);

  if (!parsed.success) {
    return parsed.state;
  }

  let brandId: string;

  try {
    const brand = await prisma.brand.create({
      data: parsed.data,
      select: {
        id: true,
      },
    });

    brandId = brand.id;
  } catch (error) {
    return {
      ok: false,
      message: getBrandActionErrorMessage(error),
    };
  }

  revalidatePath("/brands");
  redirect(`/brands/${brandId}`);
}

export async function updateBrandAction(
  brandId: string,
  _previousState: BrandFormState,
  formData: FormData,
): Promise<BrandFormState> {
  const parsed = parseBrandFormData(formData);

  if (!parsed.success) {
    return parsed.state;
  }

  try {
    await prisma.brand.update({
      where: {
        id: brandId,
      },
      data: parsed.data,
      select: {
        id: true,
      },
    });
  } catch (error) {
    return {
      ok: false,
      message: getBrandActionErrorMessage(error),
    };
  }

  revalidatePath("/brands");
  revalidatePath(`/brands/${brandId}`);
  redirect(`/brands/${brandId}`);
}
