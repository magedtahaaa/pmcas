import { prisma } from "@/lib/db/prisma";

export async function getAuditCategoryItems() {
  return prisma.audit.findMany({
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
      updatedAt: true,
      overallScore: true,
      overallRisk: true,
      overallConfidence: true,
      scalingReadiness: true,
      summary: true,
      brand: {
        select: {
          id: true,
          name: true,
          industry: true,
          market: true,
        },
      },
      _count: {
        select: {
          responses: true,
          findings: true,
          recommendations: true,
          experiments: true,
          exports: true,
        },
      },
    },
  });
}

export async function getActiveAuditTemplateSummary() {
  return prisma.auditTemplate.findFirst({
    where: {
      isActive: true,
    },
    orderBy: [
      {
        updatedAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    select: {
      id: true,
      name: true,
      version: true,
    },
  });
}

export async function getAuditWorkspace(id: string) {
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
              },
            },
          },
        },
      },
      responses: {
        include: {
          criteria: {
            select: {
              id: true,
              sectionId: true,
              title: true,
            },
          },
          evidenceItems: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
      evidenceItems: {
        orderBy: {
          createdAt: "desc",
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
        orderBy: {
          priorityScore: "desc",
        },
        include: {
          recommendation: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });
}
