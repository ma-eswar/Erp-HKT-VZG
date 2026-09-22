import {
    Injectable,
    ConflictException,
    BadRequestException,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ResultStatus } from '@prisma/client';

@Injectable()
export class ResultsService {
    constructor(private readonly prisma: PrismaService) { }

    // 1. Update Mark with Optimistic Concurrency Control (OCC)
    async updateMarkWithOCC(
        resultId: string,
        marks: number,
        clientVersion: number,
        actorId: string,
    ) {
        const current = await this.prisma.examResult.findUnique({
            where: { id: resultId },
            include: { enrollment: true },
        });

        if (!current) {
            throw new NotFoundException(`Result "${resultId}" not found.`);
        }

        // Policy Check: Attendance Barring
        if (current.enrollment.isBarred) {
            throw new BadRequestException(
                'Policy Engine Violation: Cannot enter marks for this student. Student is BARRED (<75% attendance).',
            );
        }

        // State Machine Check: Must be DRAFT
        if (current.status !== ResultStatus.DRAFT) {
            throw new BadRequestException(
                `Lifecycle Violation: Cannot edit result. Current state is "${current.status}". Only DRAFT results are editable.`,
            );
        }

        // OCC Atomic Update: Checks version == clientVersion
        const updated = await this.prisma.examResult.updateMany({
            where: {
                id: resultId,
                version: clientVersion, // If another evaluator updated it, this match FAILS!
                status: ResultStatus.DRAFT,
            },
            data: {
                marks: marks,
                version: { increment: 1 },
            },
        });

        // Lost-Update Detection
        if (updated.count === 0) {
            const refreshed = await this.prisma.examResult.findUnique({
                where: { id: resultId },
            });
            throw new ConflictException(
                `Optimistic Lock Exception (409 Conflict): The record was modified by another evaluator. Expected version ${clientVersion}, but database is already at version ${refreshed?.version}. Please refresh to merge changes.`,
            );
        }

        // Append-Only Audit Diff Ledger
        await this.prisma.auditLedger.create({
            data: {
                entityName: 'ExamResult',
                entityId: resultId,
                actorId: actorId,
                actionType: 'OCC_GRADE_UPDATE',
                beforeState: { marks: current.marks, version: current.version },
                afterState: { marks: marks, version: clientVersion + 1 },
            },
        });

        return {
            message: 'Grade saved successfully',
            resultId,
            newVersion: clientVersion + 1,
            marks,
        };
    }

    // 2. State Machine: Submit Section for Dean Review (DRAFT -> UNDER_REVIEW)
    async submitForReview(offeringId: string, user: any) {
        const offering = await this.prisma.courseOffering.findUnique({
            where: { id: offeringId },
        });
        if (!offering) throw new NotFoundException('Offering not found');

        if (user.role !== 'ADMIN' && offering.facultyId !== user.userId) {
            throw new ForbiddenException('Only the assigned instructor or Admin can submit this section.');
        }

        // Move all DRAFT results to UNDER_REVIEW
        const batch = await this.prisma.examResult.updateMany({
            where: {
                enrollment: { offeringId },
                status: ResultStatus.DRAFT,
            },
            data: {
                status: ResultStatus.UNDER_REVIEW,
            },
        });

        await this.prisma.auditLedger.create({
            data: {
                entityName: 'CourseOffering',
                entityId: offeringId,
                actorId: user.userId,
                actionType: 'STATE_TRANSITION_REVIEW',
                beforeState: { status: 'DRAFT' },
                afterState: { status: 'UNDER_REVIEW', affectedCount: batch.count },
            },
        });

        return {
            message: `Section successfully submitted for review. ${batch.count} records transitioned to UNDER_REVIEW.`,
            status: 'UNDER_REVIEW',
        };
    }

    // 3. State Machine: Dean Publishes Results (UNDER_REVIEW -> PUBLISHED)
    async publishResults(offeringId: string, user: any) {
        if (user.role !== 'ADMIN') {
            throw new ForbiddenException('Institutional Governance Violation: Only the Dean (ADMIN) can publish academic results.');
        }

        const batch = await this.prisma.examResult.updateMany({
            where: {
                enrollment: { offeringId },
                status: ResultStatus.UNDER_REVIEW,
            },
            data: {
                status: ResultStatus.PUBLISHED,
            },
        });

        await this.prisma.auditLedger.create({
            data: {
                entityName: 'CourseOffering',
                entityId: offeringId,
                actorId: user.userId,
                actionType: 'STATE_TRANSITION_PUBLISHED',
                beforeState: { status: 'UNDER_REVIEW' },
                afterState: { status: 'PUBLISHED', affectedCount: batch.count },
            },
        });

        return {
            message: `Results officially PUBLISHED. ${batch.count} records are now immutable.`,
            status: 'PUBLISHED',
        };
    }

    // 4. Student Portal: Fetch Published Grades
    async getStudentGrades(studentId: string) {
        const enrollments = await this.prisma.enrollment.findMany({
            where: { studentId },
            include: {
                offering: {
                    include: {
                        catalog: true,
                        faculty: {
                            select: { id: true, fullName: true, email: true },
                        },
                    },
                },
                result: true,
            },
        });

        // Strict Policy: Draft or under review marks must NEVER be leaked to students!
        const publishedEnrollments = enrollments.filter(
            (enr) => enr.result && enr.result.status === ResultStatus.PUBLISHED,
        );

        return publishedEnrollments.map((enr) => ({
            resultId: enr.result!.id,
            courseCode: enr.offering.catalog.code,
            courseTitle: enr.offering.frozenTitle || enr.offering.catalog.title,
            term: enr.offering.term,
            credits: enr.offering.frozenCredits || enr.offering.catalog.defaultCredits,
            marks: enr.result!.marks,
            revisionNumber: enr.result!.revisionNumber,
            publishedAt: enr.result!.updatedAt,
            facultyName: enr.offering.faculty?.fullName,
        }));
    }
}