import { prisma } from "@/lib/db/prisma";

export async function getBrands() {
  return prisma.brand.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          audits: true,
          metrics: true,
        },
      },
    },
  });
}

export async function getBrandProfile(id: string) {
  return prisma.brand.findUnique({
    where: {
      id,
    },
    include: {
      metrics: {
        orderBy: {
          date: "desc",
        },
        take: 6,
      },
      audits: {
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
          createdAt: true,
          overallScore: true,
          overallRisk: true,
          overallConfidence: true,
          summary: true,
        },
      },
    },
  });
}
