-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'FACULTY', 'STUDENT');

-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "AmendmentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseCatalog" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "defaultCredits" INTEGER NOT NULL,
    "department" TEXT NOT NULL,

    CONSTRAINT "CourseCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseOffering" (
    "id" TEXT NOT NULL,
    "catalogId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "frozenTitle" TEXT NOT NULL,
    "frozenCredits" INTEGER NOT NULL,
    "facultyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseOffering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "isBarred" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "isPresent" BOOLEAN NOT NULL,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamResult" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "marks" DOUBLE PRECISION,
    "status" "ResultStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "revisionNumber" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultAmendment" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "makerId" TEXT NOT NULL,
    "checkerId" TEXT,
    "originalMarks" DOUBLE PRECISION NOT NULL,
    "proposedMarks" DOUBLE PRECISION NOT NULL,
    "justification" TEXT NOT NULL,
    "status" "AmendmentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "ResultAmendment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLedger" (
    "id" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "beforeState" JSONB NOT NULL,
    "afterState" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLedger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CourseCatalog_code_key" ON "CourseCatalog"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ExamResult_enrollmentId_key" ON "ExamResult"("enrollmentId");

-- AddForeignKey
ALTER TABLE "CourseOffering" ADD CONSTRAINT "CourseOffering_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES "CourseCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseOffering" ADD CONSTRAINT "CourseOffering_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "CourseOffering"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamResult" ADD CONSTRAINT "ExamResult_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultAmendment" ADD CONSTRAINT "ResultAmendment_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "ExamResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultAmendment" ADD CONSTRAINT "ResultAmendment_makerId_fkey" FOREIGN KEY ("makerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultAmendment" ADD CONSTRAINT "ResultAmendment_checkerId_fkey" FOREIGN KEY ("checkerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLedger" ADD CONSTRAINT "AuditLedger_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
