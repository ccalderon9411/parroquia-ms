-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SacramentType" AS ENUM ('BAPTISM', 'CONFIRMATION', 'MARRIAGE');

-- CreateTable
CREATE TABLE "IdentityDocumentType" (
    "id" BIGSERIAL NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,

    CONSTRAINT "IdentityDocumentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" UUID NOT NULL,
    "identityDocumentTypeId" BIGINT NOT NULL,
    "identityDocumentNumber" TEXT NOT NULL,
    "givenNames" TEXT NOT NULL,
    "paternalSurname" TEXT NOT NULL,
    "maternalSurname" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "birthPlace" TEXT,
    "father" TEXT,
    "mother" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "refreshTokenHash" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parish" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,

    CONSTRAINT "Parish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Priest" (
    "id" BIGSERIAL NOT NULL,
    "personId" UUID NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,

    CONSTRAINT "Priest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParishPriest" (
    "id" BIGSERIAL NOT NULL,
    "parishId" BIGINT NOT NULL,
    "priestId" BIGINT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,

    CONSTRAINT "ParishPriest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SacramentRecord" (
    "id" BIGSERIAL NOT NULL,
    "type" "SacramentType" NOT NULL,
    "parishId" BIGINT NOT NULL,
    "priestId" BIGINT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "place" TEXT NOT NULL,
    "bookNumber" TEXT NOT NULL,
    "folioNumber" TEXT NOT NULL,
    "entryNumber" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,

    CONSTRAINT "SacramentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaptismDetail" (
    "id" BIGINT NOT NULL,
    "personId" UUID NOT NULL,
    "godfather" TEXT,
    "godmother" TEXT,

    CONSTRAINT "BaptismDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfirmationDetail" (
    "id" BIGINT NOT NULL,
    "personId" UUID NOT NULL,
    "godfather" TEXT,
    "godmother" TEXT,

    CONSTRAINT "ConfirmationDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarriageDetail" (
    "id" BIGINT NOT NULL,
    "groomId" UUID NOT NULL,
    "groomBaptismDate" TIMESTAMP(3) NOT NULL,
    "groomBaptismPlace" TEXT NOT NULL,
    "brideId" UUID NOT NULL,
    "brideBaptismDate" TIMESTAMP(3) NOT NULL,
    "brideBaptismPlace" TEXT NOT NULL,
    "witness1" TEXT NOT NULL,
    "witness2" TEXT NOT NULL,

    CONSTRAINT "MarriageDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IdentityDocumentType_abbreviation_key" ON "IdentityDocumentType"("abbreviation");

-- CreateIndex
CREATE UNIQUE INDEX "Person_identityDocumentTypeId_identityDocumentNumber_key" ON "Person"("identityDocumentTypeId", "identityDocumentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_personId_key" ON "User"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Parish_name_key" ON "Parish"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Priest_personId_key" ON "Priest"("personId");

-- CreateIndex
CREATE INDEX "ParishPriest_parishId_idx" ON "ParishPriest"("parishId");

-- CreateIndex
CREATE INDEX "ParishPriest_priestId_idx" ON "ParishPriest"("priestId");

-- CreateIndex
CREATE INDEX "ParishPriest_active_idx" ON "ParishPriest"("active");

-- CreateIndex
CREATE INDEX "ParishPriest_parishId_priestId_idx" ON "ParishPriest"("parishId", "priestId");

-- CreateIndex
CREATE INDEX "SacramentRecord_parishId_idx" ON "SacramentRecord"("parishId");

-- CreateIndex
CREATE INDEX "SacramentRecord_priestId_idx" ON "SacramentRecord"("priestId");

-- CreateIndex
CREATE INDEX "SacramentRecord_date_idx" ON "SacramentRecord"("date");

-- CreateIndex
CREATE INDEX "SacramentRecord_active_idx" ON "SacramentRecord"("active");

-- CreateIndex
CREATE UNIQUE INDEX "SacramentRecord_type_parishId_bookNumber_folioNumber_entryN_key" ON "SacramentRecord"("type", "parishId", "bookNumber", "folioNumber", "entryNumber");

-- CreateIndex
CREATE INDEX "BaptismDetail_personId_idx" ON "BaptismDetail"("personId");

-- CreateIndex
CREATE INDEX "ConfirmationDetail_personId_idx" ON "ConfirmationDetail"("personId");

-- CreateIndex
CREATE INDEX "MarriageDetail_groomId_idx" ON "MarriageDetail"("groomId");

-- CreateIndex
CREATE INDEX "MarriageDetail_brideId_idx" ON "MarriageDetail"("brideId");

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_identityDocumentTypeId_fkey" FOREIGN KEY ("identityDocumentTypeId") REFERENCES "IdentityDocumentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Priest" ADD CONSTRAINT "Priest_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParishPriest" ADD CONSTRAINT "ParishPriest_parishId_fkey" FOREIGN KEY ("parishId") REFERENCES "Parish"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParishPriest" ADD CONSTRAINT "ParishPriest_priestId_fkey" FOREIGN KEY ("priestId") REFERENCES "Priest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SacramentRecord" ADD CONSTRAINT "SacramentRecord_parishId_fkey" FOREIGN KEY ("parishId") REFERENCES "Parish"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SacramentRecord" ADD CONSTRAINT "SacramentRecord_priestId_fkey" FOREIGN KEY ("priestId") REFERENCES "Priest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaptismDetail" ADD CONSTRAINT "BaptismDetail_id_fkey" FOREIGN KEY ("id") REFERENCES "SacramentRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaptismDetail" ADD CONSTRAINT "BaptismDetail_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfirmationDetail" ADD CONSTRAINT "ConfirmationDetail_id_fkey" FOREIGN KEY ("id") REFERENCES "SacramentRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfirmationDetail" ADD CONSTRAINT "ConfirmationDetail_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarriageDetail" ADD CONSTRAINT "MarriageDetail_id_fkey" FOREIGN KEY ("id") REFERENCES "SacramentRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarriageDetail" ADD CONSTRAINT "MarriageDetail_groomId_fkey" FOREIGN KEY ("groomId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarriageDetail" ADD CONSTRAINT "MarriageDetail_brideId_fkey" FOREIGN KEY ("brideId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ManualConstraint
ALTER TABLE "MarriageDetail"
    ADD CONSTRAINT "MarriageDetail_groomId_brideId_check" CHECK ("groomId" <> "brideId");

-- ManualIndex
CREATE UNIQUE INDEX "ParishPriest_parishId_priestId_active_true_key"
    ON "ParishPriest"("parishId", "priestId")
    WHERE "active" = true;
