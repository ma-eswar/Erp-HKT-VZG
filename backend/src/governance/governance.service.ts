import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAmendmentDto } from './dto/create-amendment.dto';
import { AdjudicateAmendmentDto } from './dto/adjudicate-amendment.dto';
import { ResultStatus, AmendmentStatus } from '@prisma/client';

@Injectable()
export class GovernanceService {
    constructor(private readonly prisma: PrismaService) { }

    // 1. Faculty requests post-publication amendment (Maker)
    async requestAmendment(dto: CreateAmendmentDto, user: any) {
        const examResult = await this.prisma.examResult.findUnique({
            where: { id: dto.resultId },
            include: {
                enrollment: {
                    include: { offering: true },
                },
            },
        });

        if (!examResult) {
            throw new NotFoundException(`Result "${dto.resultId}" not found.`);
        }

        // Must be strictly PUBLISHED
        if (examResult.status !== ResultStatus.PUBLISHED) {
            throw new BadRequestException('Amendments can only be requested on PUBLISHED results');
        }

        // ABAC Check: Must be Admin OR the assigned Faculty for the offering
        if (
            user.role !== 'ADMIN' &&
            examResult.enrollment.offering.facultyId !== user.userId
        ) {
            throw new ForbiddenException(
                'ABAC Violation: You are not authorized to request an amendment for this course offering.',
            );
        }

        // Create pending amendment
        const amendment = await this.prisma.resultAmendment.create({
            data: {
                resultId: dto.resultId,
                makerId: user.userId,
                originalMarks: examResult.marks ?? 0,
                proposedMarks: dto.proposedMarks,
                justification: dto.justification,
                status: AmendmentStatus.PENDING,
            },
        });

        // Append to Audit Ledger
        await this.prisma.auditLedger.create({
            data: {
                entityName: 'ExamResult',
                entityId: dto.resultId,
                actorId: user.userId,
                actionType: 'AMENDMENT_REQUESTED',
                beforeState: { marks: examResult.marks },
                afterState: {
                    proposedMarks: dto.proposedMarks,
                    justification: dto.justification,
                },
            },
        });

        return {
            message: 'Grade amendment requested successfully and queued for Dean adjudication.',
            amendment,
        };
    }

    // 2. Dean fetches pending amendment queue
    async getPendingAmendments(user: any) {
        if (user.role !== 'ADMIN') {
            throw new ForbiddenException(
                'Institutional Governance Violation: Only the Dean (ADMIN) can access the amendment queue.',
            );
        }

        const pending = await this.prisma.resultAmendment.findMany({
            where: { status: AmendmentStatus.PENDING },
            include: {
                maker: {
                    select: { id: true, fullName: true, email: true },
                },
                result: {
                    include: {
                        enrollment: {
                            include: {
                                student: {
                                    select: { id: true, fullName: true, email: true },
                                },
                                offering: {
                                    select: {
                                        id: true,
                                        frozenTitle: true,
                                        term: true,
                                        catalog: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return pending.map((amendment) => ({
            id: amendment.id,
            resultId: amendment.resultId,
            studentId: amendment.result.enrollment.student.id,
            studentName: amendment.result.enrollment.student.fullName,
            studentEmail: amendment.result.enrollment.student.email,
            courseOfferingId: amendment.result.enrollment.offering.id,
            courseTitle: amendment.result.enrollment.offering.frozenTitle,
            courseCode: amendment.result.enrollment.offering.catalog?.code,
            term: amendment.result.enrollment.offering.term,
            makerId: amendment.maker.id,
            makerName: amendment.maker.fullName,
            makerEmail: amendment.maker.email,
            originalMarks: amendment.originalMarks,
            proposedMarks: amendment.proposedMarks,
            justification: amendment.justification,
            status: amendment.status,
            createdAt: amendment.createdAt,
        }));
    }

    // 3. Dean adjudicates (Approve/Reject) with Separation of Duties
    async adjudicateAmendment(
        amendmentId: string,
        dto: AdjudicateAmendmentDto,
        user: any,
    ) {
        if (user.role !== 'ADMIN') {
            throw new ForbiddenException(
                'Institutional Governance Violation: Only the Dean (ADMIN) can adjudicate grade amendments.',
            );
        }

        const amendment = await this.prisma.resultAmendment.findUnique({
            where: { id: amendmentId },
            include: { result: true },
        });

        if (!amendment) {
            throw new NotFoundException(`Amendment "${amendmentId}" not found.`);
        }

        // Separation of Duties check: Maker cannot approve their own amendment
        if (user.userId === amendment.makerId) {
            throw new ForbiddenException(
                'Separation of Duties Violation: Maker cannot adjudicate their own amendment request.',
            );
        }

        // Must be in PENDING status
        if (amendment.status !== AmendmentStatus.PENDING) {
            throw new BadRequestException('Amendment has already been resolved.');
        }

        if (dto.decision === 'APPROVED') {
            const currentRev = amendment.result.revisionNumber;
            const [updatedAmendment, updatedResult] = await this.prisma.$transaction([
                this.prisma.resultAmendment.update({
                    where: { id: amendmentId },
                    data: {
                        status: AmendmentStatus.APPROVED,
                        checkerId: user.userId,
                        resolvedAt: new Date(),
                    },
                }),
                this.prisma.examResult.update({
                    where: { id: amendment.resultId },
                    data: {
                        marks: amendment.proposedMarks,
                        revisionNumber: { increment: 1 },
                    },
                }),
                this.prisma.auditLedger.create({
                    data: {
                        actionType: 'AMENDMENT_APPROVED',
                        entityName: 'ExamResult',
                        entityId: amendment.resultId,
                        actorId: user.userId,
                        beforeState: {
                            marks: amendment.originalMarks,
                            revisionNumber: currentRev,
                        },
                        afterState: {
                            marks: amendment.proposedMarks,
                            revisionNumber: currentRev + 1,
                            justification: amendment.justification,
                        },
                    },
                }),
            ]);

            return {
                message: 'Grade amendment APPROVED and student record updated with incremented revision.',
                amendment: updatedAmendment,
                result: updatedResult,
            };
        } else {
            const [updatedAmendment] = await this.prisma.$transaction([
                this.prisma.resultAmendment.update({
                    where: { id: amendmentId },
                    data: {
                        status: AmendmentStatus.REJECTED,
                        checkerId: user.userId,
                        resolvedAt: new Date(),
                    },
                }),
                this.prisma.auditLedger.create({
                    data: {
                        actionType: 'AMENDMENT_REJECTED',
                        entityName: 'ExamResult',
                        entityId: amendment.resultId,
                        actorId: user.userId,
                        beforeState: {
                            status: 'PENDING',
                            originalMarks: amendment.originalMarks,
                            proposedMarks: amendment.proposedMarks,
                        },
                        afterState: {
                            status: 'REJECTED',
                            justification: amendment.justification,
                        },
                    },
                }),
            ]);

            return {
                message: 'Grade amendment REJECTED.',
                amendment: updatedAmendment,
            };
        }
    }
}
