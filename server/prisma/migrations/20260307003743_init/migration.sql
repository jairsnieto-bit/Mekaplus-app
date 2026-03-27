-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OPERATOR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OPERATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guide" (
    "id" TEXT NOT NULL,
    "guideNumber" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "localidad" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "identificacionUsuario" TEXT NOT NULL,
    "referenciaEntrega" TEXT NOT NULL,
    "fechaEntrega" TIMESTAMP(3),
    "horaEntrega" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Guide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "type" TEXT NOT NULL DEFAULT 'string',
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideConfig" (
    "id" TEXT NOT NULL,
    "logo" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#0066CC',
    "guidePrefix" TEXT NOT NULL DEFAULT 'GUIA',
    "guideStart" INTEGER NOT NULL DEFAULT 1,
    "guideEnd" INTEGER NOT NULL DEFAULT 999999,
    "currentNumber" INTEGER NOT NULL DEFAULT 1,
    "fieldsEnabled" JSONB NOT NULL DEFAULT '{"razonSocial":true,"direccion":true,"ciudad":true}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuideConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Guide_guideNumber_key" ON "Guide"("guideNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");

-- AddForeignKey
ALTER TABLE "Guide" ADD CONSTRAINT "Guide_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
