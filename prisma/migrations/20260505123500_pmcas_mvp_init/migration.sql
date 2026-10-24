-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "BusinessModel" AS ENUM ('ECOMMERCE', 'LEAD_GENERATION', 'MARKETPLACE', 'SAAS', 'SERVICE', 'OTHER');

-- CreateEnum
CREATE TYPE "AuditSectionKey" AS ENUM ('MEASUREMENT_DATA_AUDIT', 'FUNNEL_LEAKAGE_AUDIT', 'CUSTOMER_MARKET_RESEARCH', 'OFFER_PRICING_MESSAGING', 'BRAND_POSITIONING', 'CHANNEL_EXPANSION', 'TEAM_WORKFLOW_ALIGNMENT', 'EXPERIMENTATION_ROADMAP');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('STRONG', 'NEEDS_IMPROVEMENT', 'RISK_AREA', 'CRITICAL_GAP');

-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "FindingStatus" AS ENUM ('DRAFT', 'ACCEPTED', 'EDITED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('DRAFT', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ExperimentStatus" AS ENUM ('BACKLOG', 'PLANNED', 'RUNNING', 'COMPLETED', 'PAUSED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SuggestedOwner" AS ENUM ('MARKETING_MANAGER', 'MEDIA_BUYER', 'TRACKING_SPECIALIST', 'WEB_DEVELOPER', 'CRO_SPECIALIST', 'COPYWRITER', 'DESIGNER', 'SALES_TEAM', 'CUSTOMER_SUPPORT', 'CRM_SPECIALIST', 'ECOMMERCE_MANAGER', 'OPERATIONS_TEAM');

-- CreateEnum
CREATE TYPE "ExportType" AS ENUM ('AUDIT_SUMMARY', 'SECTION_SCORES', 'FINDINGS', 'RECOMMENDATIONS', 'EXPERIMENTS', 'ACTION_PLAN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "website" TEXT,
    "market" TEXT,
    "businessModel" "BusinessModel" NOT NULL DEFAULT 'OTHER',
    "monthlyAdSpend" DECIMAL(12,2),
    "monthlyRevenue" DECIMAL(12,2),
    "averageOrderValue" DECIMAL(12,2),
    "mainChannels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mainGoal" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandMetric" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DECIMAL(18,4) NOT NULL,
    "unit" TEXT,
    "source" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrandMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataImport" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "source" TEXT,
    "rowCount" INTEGER NOT NULL DEFAULT 0,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "DataImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportedRow" (
    "id" TEXT NOT NULL,
    "dataImportId" TEXT NOT NULL,
    "rowIndex" INTEGER NOT NULL,
    "rawData" JSONB NOT NULL,
    "normalizedData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportedRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditSection" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "sectionKey" "AuditSectionKey" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditCriteria" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "scoringGuidance" TEXT,
    "evidenceRequired" BOOLEAN NOT NULL DEFAULT false,
    "ruleKey" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditCriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "auditDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overallScore" DOUBLE PRECISION,
    "overallRisk" "RiskLevel",
    "overallConfidence" "ConfidenceLevel" NOT NULL DEFAULT 'LOW',
    "scalingReadiness" TEXT,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditResponse" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "criteriaId" TEXT NOT NULL,
    "score0To5" INTEGER NOT NULL,
    "normalizedScore" DOUBLE PRECISION NOT NULL,
    "riskLevel" "RiskLevel",
    "confidence" "ConfidenceLevel" NOT NULL DEFAULT 'LOW',
    "notes" TEXT,
    "responseData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceItem" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "auditResponseId" TEXT,
    "findingId" TEXT,
    "recommendationId" TEXT,
    "experimentId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "source" TEXT,
    "url" TEXT,
    "fileReference" TEXT,
    "metricName" TEXT,
    "metricValue" DECIMAL(18,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvidenceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Finding" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "auditResponseId" TEXT,
    "sectionKey" "AuditSectionKey" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "confidence" "ConfidenceLevel" NOT NULL DEFAULT 'LOW',
    "businessImpact" TEXT NOT NULL,
    "relatedMetricName" TEXT,
    "relatedMetricValue" DECIMAL(18,4),
    "status" "FindingStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Finding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "findingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "expectedImpact" TEXT NOT NULL,
    "effort" INTEGER NOT NULL,
    "priority" "Priority" NOT NULL,
    "suggestedOwner" "SuggestedOwner" NOT NULL,
    "confidence" "ConfidenceLevel" NOT NULL DEFAULT 'MEDIUM',
    "status" "RecommendationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experiment" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "recommendationId" TEXT,
    "funnelStage" TEXT NOT NULL,
    "problemObserved" TEXT NOT NULL,
    "evidence" TEXT NOT NULL,
    "hypothesis" TEXT NOT NULL,
    "proposedChange" TEXT NOT NULL,
    "primaryMetric" TEXT NOT NULL,
    "secondaryMetric" TEXT,
    "impact" INTEGER NOT NULL,
    "confidenceScore" INTEGER NOT NULL,
    "ease" INTEGER NOT NULL,
    "effort" INTEGER NOT NULL,
    "priorityScore" INTEGER NOT NULL,
    "owner" "SuggestedOwner" NOT NULL,
    "status" "ExperimentStatus" NOT NULL DEFAULT 'BACKLOG',
    "result" TEXT,
    "learning" TEXT,
    "nextAction" TEXT,
    "deadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Experiment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Export" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "exportType" "ExportType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL DEFAULT 0,
    "exportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "Export_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Brand_businessModel_idx" ON "Brand"("businessModel");

-- CreateIndex
CREATE INDEX "Brand_market_idx" ON "Brand"("market");

-- CreateIndex
CREATE INDEX "BrandMetric_brandId_idx" ON "BrandMetric"("brandId");

-- CreateIndex
CREATE INDEX "BrandMetric_name_idx" ON "BrandMetric"("name");

-- CreateIndex
CREATE INDEX "BrandMetric_date_idx" ON "BrandMetric"("date");

-- CreateIndex
CREATE INDEX "DataImport_brandId_idx" ON "DataImport"("brandId");

-- CreateIndex
CREATE INDEX "DataImport_uploadedAt_idx" ON "DataImport"("uploadedAt");

-- CreateIndex
CREATE INDEX "ImportedRow_dataImportId_idx" ON "ImportedRow"("dataImportId");

-- CreateIndex
CREATE UNIQUE INDEX "ImportedRow_dataImportId_rowIndex_key" ON "ImportedRow"("dataImportId", "rowIndex");

-- CreateIndex
CREATE INDEX "AuditTemplate_isActive_idx" ON "AuditTemplate"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AuditTemplate_name_version_key" ON "AuditTemplate"("name", "version");

-- CreateIndex
CREATE INDEX "AuditSection_sectionKey_idx" ON "AuditSection"("sectionKey");

-- CreateIndex
CREATE UNIQUE INDEX "AuditSection_templateId_sectionKey_key" ON "AuditSection"("templateId", "sectionKey");

-- CreateIndex
CREATE UNIQUE INDEX "AuditSection_templateId_sortOrder_key" ON "AuditSection"("templateId", "sortOrder");

-- CreateIndex
CREATE INDEX "AuditCriteria_sectionId_idx" ON "AuditCriteria"("sectionId");

-- CreateIndex
CREATE INDEX "AuditCriteria_ruleKey_idx" ON "AuditCriteria"("ruleKey");

-- CreateIndex
CREATE UNIQUE INDEX "AuditCriteria_sectionId_sortOrder_key" ON "AuditCriteria"("sectionId", "sortOrder");

-- CreateIndex
CREATE INDEX "Audit_brandId_idx" ON "Audit"("brandId");

-- CreateIndex
CREATE INDEX "Audit_templateId_idx" ON "Audit"("templateId");

-- CreateIndex
CREATE INDEX "Audit_auditDate_idx" ON "Audit"("auditDate");

-- CreateIndex
CREATE INDEX "Audit_overallRisk_idx" ON "Audit"("overallRisk");

-- CreateIndex
CREATE INDEX "AuditResponse_auditId_idx" ON "AuditResponse"("auditId");

-- CreateIndex
CREATE INDEX "AuditResponse_criteriaId_idx" ON "AuditResponse"("criteriaId");

-- CreateIndex
CREATE INDEX "AuditResponse_confidence_idx" ON "AuditResponse"("confidence");

-- CreateIndex
CREATE INDEX "AuditResponse_riskLevel_idx" ON "AuditResponse"("riskLevel");

-- CreateIndex
CREATE UNIQUE INDEX "AuditResponse_auditId_criteriaId_key" ON "AuditResponse"("auditId", "criteriaId");

-- CreateIndex
CREATE INDEX "EvidenceItem_auditId_idx" ON "EvidenceItem"("auditId");

-- CreateIndex
CREATE INDEX "EvidenceItem_auditResponseId_idx" ON "EvidenceItem"("auditResponseId");

-- CreateIndex
CREATE INDEX "EvidenceItem_findingId_idx" ON "EvidenceItem"("findingId");

-- CreateIndex
CREATE INDEX "EvidenceItem_recommendationId_idx" ON "EvidenceItem"("recommendationId");

-- CreateIndex
CREATE INDEX "EvidenceItem_experimentId_idx" ON "EvidenceItem"("experimentId");

-- CreateIndex
CREATE INDEX "Finding_auditId_idx" ON "Finding"("auditId");

-- CreateIndex
CREATE INDEX "Finding_auditResponseId_idx" ON "Finding"("auditResponseId");

-- CreateIndex
CREATE INDEX "Finding_sectionKey_idx" ON "Finding"("sectionKey");

-- CreateIndex
CREATE INDEX "Finding_severity_idx" ON "Finding"("severity");

-- CreateIndex
CREATE INDEX "Finding_confidence_idx" ON "Finding"("confidence");

-- CreateIndex
CREATE INDEX "Finding_status_idx" ON "Finding"("status");

-- CreateIndex
CREATE INDEX "Recommendation_auditId_idx" ON "Recommendation"("auditId");

-- CreateIndex
CREATE INDEX "Recommendation_findingId_idx" ON "Recommendation"("findingId");

-- CreateIndex
CREATE INDEX "Recommendation_priority_idx" ON "Recommendation"("priority");

-- CreateIndex
CREATE INDEX "Recommendation_suggestedOwner_idx" ON "Recommendation"("suggestedOwner");

-- CreateIndex
CREATE INDEX "Recommendation_confidence_idx" ON "Recommendation"("confidence");

-- CreateIndex
CREATE INDEX "Recommendation_status_idx" ON "Recommendation"("status");

-- CreateIndex
CREATE INDEX "Experiment_auditId_idx" ON "Experiment"("auditId");

-- CreateIndex
CREATE INDEX "Experiment_recommendationId_idx" ON "Experiment"("recommendationId");

-- CreateIndex
CREATE INDEX "Experiment_owner_idx" ON "Experiment"("owner");

-- CreateIndex
CREATE INDEX "Experiment_status_idx" ON "Experiment"("status");

-- CreateIndex
CREATE INDEX "Experiment_priorityScore_idx" ON "Experiment"("priorityScore");

-- CreateIndex
CREATE INDEX "Export_auditId_idx" ON "Export"("auditId");

-- CreateIndex
CREATE INDEX "Export_exportType_idx" ON "Export"("exportType");

-- CreateIndex
CREATE INDEX "Export_exportedAt_idx" ON "Export"("exportedAt");

-- AddForeignKey
ALTER TABLE "BrandMetric" ADD CONSTRAINT "BrandMetric_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataImport" ADD CONSTRAINT "DataImport_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportedRow" ADD CONSTRAINT "ImportedRow_dataImportId_fkey" FOREIGN KEY ("dataImportId") REFERENCES "DataImport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditSection" ADD CONSTRAINT "AuditSection_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "AuditTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditCriteria" ADD CONSTRAINT "AuditCriteria_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "AuditSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "AuditTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditResponse" ADD CONSTRAINT "AuditResponse_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditResponse" ADD CONSTRAINT "AuditResponse_criteriaId_fkey" FOREIGN KEY ("criteriaId") REFERENCES "AuditCriteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceItem" ADD CONSTRAINT "EvidenceItem_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceItem" ADD CONSTRAINT "EvidenceItem_auditResponseId_fkey" FOREIGN KEY ("auditResponseId") REFERENCES "AuditResponse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceItem" ADD CONSTRAINT "EvidenceItem_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceItem" ADD CONSTRAINT "EvidenceItem_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "Recommendation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceItem" ADD CONSTRAINT "EvidenceItem_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_auditResponseId_fkey" FOREIGN KEY ("auditResponseId") REFERENCES "AuditResponse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "Recommendation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Export" ADD CONSTRAINT "Export_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
