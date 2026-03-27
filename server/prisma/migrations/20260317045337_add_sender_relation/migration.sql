-- AlterTable
ALTER TABLE "Guide" ADD COLUMN     "senderId" TEXT,
ALTER COLUMN "identificacionUsuario" DROP NOT NULL,
ALTER COLUMN "referenciaEntrega" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Sender" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nit" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "department" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sender_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sender_isActive_idx" ON "Sender"("isActive");

-- CreateIndex
CREATE INDEX "Guide_senderId_idx" ON "Guide"("senderId");

-- CreateIndex
CREATE INDEX "Guide_guideNumber_idx" ON "Guide"("guideNumber");

-- CreateIndex
CREATE INDEX "Guide_estado_idx" ON "Guide"("estado");

-- CreateIndex
CREATE INDEX "Guide_createdAt_idx" ON "Guide"("createdAt");

-- AddForeignKey
ALTER TABLE "Guide" ADD CONSTRAINT "Guide_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Sender"("id") ON DELETE SET NULL ON UPDATE CASCADE;
