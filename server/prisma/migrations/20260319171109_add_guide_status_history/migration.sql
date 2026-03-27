-- CreateTable
CREATE TABLE "GuideStatusHistory" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "previousStatus" TEXT NOT NULL,
    "newStatus" TEXT NOT NULL,
    "observation" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuideStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GuideStatusHistory_guideId_idx" ON "GuideStatusHistory"("guideId");

-- CreateIndex
CREATE INDEX "GuideStatusHistory_createdAt_idx" ON "GuideStatusHistory"("createdAt");

-- AddForeignKey
ALTER TABLE "GuideStatusHistory" ADD CONSTRAINT "GuideStatusHistory_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE CASCADE ON UPDATE CASCADE;
