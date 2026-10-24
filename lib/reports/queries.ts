import { prisma } from "@/lib/db/prisma";

export async function getAuditReport(id: string) {
  return prisma.audit.findUnique({
    where: {
      id,
    },
    include: {
      brand: {
        select: {
          id: true,
          name: true,
          industry: true,
          market: true,
          website: true,
        },
      },
      template: {
        include: {
          sections: {
            orderBy: {
              sortOrder: "asc",
            },
            include: {
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
      findings: {
        orderBy: {
          createdAt: "desc",
        },
      },
      recommendations: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          finding: {
            select: {
              id: true,
              title: true,
              sectionKey: true,
            },
          },
        },
      },
      experiments: {
        orderBy: [
          {
            priorityScore: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
        include: {
          recommendation: {
            select: {
              id: true,
              title: true,
              finding: {
                select: {
                  id: true,
                  title: true,
                  sectionKey: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export type AuditReportRecord = NonNullable<Awaited<ReturnType<typeof getAuditReport>>>;
