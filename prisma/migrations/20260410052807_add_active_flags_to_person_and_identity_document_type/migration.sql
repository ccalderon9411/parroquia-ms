-- AlterTable
ALTER TABLE "IdentityDocumentType" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;
