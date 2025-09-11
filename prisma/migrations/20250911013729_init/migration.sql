-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "claimNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "propertyAddress" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "policyNumber" TEXT,
    "damageType" TEXT NOT NULL,
    "damageDescription" TEXT,
    "severity" TEXT,
    "estimatedAmount" REAL,
    "approvedAmount" REAL,
    "deductible" REAL,
    "insuredName" TEXT NOT NULL,
    "insuredEmail" TEXT NOT NULL,
    "insuredPhone" TEXT NOT NULL,
    "aiConfidence" REAL,
    "fraudScore" REAL,
    "settlementScore" REAL
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ocrText" TEXT,
    "metadata" TEXT,
    "processedAt" DATETIME,
    "claimId" TEXT NOT NULL,
    CONSTRAINT "Document_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "triggeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "currentStep" TEXT,
    "totalSteps" INTEGER,
    "data" TEXT,
    "claimId" TEXT NOT NULL,
    CONSTRAINT "Workflow_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadNumber" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'Web Form',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "companyName" TEXT,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "qualification" TEXT,
    "claimId" TEXT,
    CONSTRAINT "Lead_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sentAt" DATETIME,
    "failedAt" DATETIME,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimId" TEXT,
    CONSTRAINT "Notification_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Enrichment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "confidence" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "embedding" TEXT,
    "claimId" TEXT NOT NULL,
    CONSTRAINT "Enrichment_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userId" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimId" TEXT NOT NULL,
    CONSTRAINT "Activity_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Claim_claimNumber_key" ON "Claim"("claimNumber");

-- CreateIndex
CREATE INDEX "Claim_status_idx" ON "Claim"("status");

-- CreateIndex
CREATE INDEX "Claim_priority_idx" ON "Claim"("priority");

-- CreateIndex
CREATE INDEX "Claim_submittedAt_idx" ON "Claim"("submittedAt");

-- CreateIndex
CREATE INDEX "Document_claimId_idx" ON "Document"("claimId");

-- CreateIndex
CREATE INDEX "Workflow_claimId_idx" ON "Workflow"("claimId");

-- CreateIndex
CREATE INDEX "Workflow_status_idx" ON "Workflow"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_leadNumber_key" ON "Lead"("leadNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_claimId_key" ON "Lead"("claimId");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_status_idx" ON "Notification"("status");

-- CreateIndex
CREATE INDEX "Notification_claimId_idx" ON "Notification"("claimId");

-- CreateIndex
CREATE INDEX "Enrichment_claimId_idx" ON "Enrichment"("claimId");

-- CreateIndex
CREATE INDEX "Enrichment_type_idx" ON "Enrichment"("type");

-- CreateIndex
CREATE INDEX "Activity_claimId_idx" ON "Activity"("claimId");

-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "Activity"("createdAt");
