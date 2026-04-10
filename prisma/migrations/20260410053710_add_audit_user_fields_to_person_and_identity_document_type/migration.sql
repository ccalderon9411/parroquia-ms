-- AlterTable
ALTER TABLE "IdentityDocumentType" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;
