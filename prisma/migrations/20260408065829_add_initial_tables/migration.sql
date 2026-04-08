-- CreateTable
CREATE TABLE "IdentityDocumentType" (
    "id" BIGSERIAL NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "description" TEXT,

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

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IdentityDocumentType_abbreviation_key" ON "IdentityDocumentType"("abbreviation");

-- CreateIndex
CREATE UNIQUE INDEX "Person_identityDocumentTypeId_identityDocumentNumber_key" ON "Person"("identityDocumentTypeId", "identityDocumentNumber");

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_identityDocumentTypeId_fkey" FOREIGN KEY ("identityDocumentTypeId") REFERENCES "IdentityDocumentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
