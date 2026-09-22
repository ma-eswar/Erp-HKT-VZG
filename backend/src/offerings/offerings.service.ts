import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OfferingsService {
    constructor(private readonly prisma: PrismaService) { }

    // List all offerings (useful helper for dashboard & demo)
    async getAllOfferings() {
        return this.prisma.courseOffering.findMany({
            include: {
                catalog: true,
                faculty: {
                    select: { id: true, fullName: true, email: true },
                },
            },
        });
    }

    // Fetch full section gradebook with attendance calculations
    async getGradebook(offeringId: string) {
        const offering = await this.prisma.courseOffering.findUnique({
            where: { id: offeringId },
            include: {
                catalog: true,
                faculty: {
                    select: { id: true, fullName: true, email: true },
                },
            },
        });

        if (!offering) {
            throw new NotFoundException(`Offering "${offeringId}" not found.`);
        }

        // Fetch enrollments with student, attendance, and exam result
        const enrollments = await this.prisma.enrollment.findMany({
            where: { offeringId },
            include: {
                student: {
                    select: { id: true, fullName: true, email: true },
                },
                attendance: true,
                result: true,
            },
        });

        // Transform into the exact frontend gradesheet contract
        const gradesheet = enrollments.map((enr) => {
            const totalSessions = enr.attendance.length;
            const attendedSessions = enr.attendance.filter((a) => a.isPresent).length;
            const attendancePercentage =
                totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0.0;

            return {
                resultId: enr.result?.id ?? null,
                studentId: enr.student.id,
                studentName: enr.student.fullName,
                attendancePercentage: parseFloat(attendancePercentage.toFixed(1)),
                isBarred: enr.isBarred,
                marks: enr.result?.marks ?? null,
                status: enr.result?.status ?? 'DRAFT',
                version: enr.result?.version ?? 1,
                revisionNumber: enr.result?.revisionNumber ?? 1,
            };
        });

        // Derive section status from results (if any result is under review or published)
        const sectionStatus = gradesheet[0]?.status ?? 'DRAFT';

        return {
            offering: {
                id: offering.id,
                courseTitle: offering.frozenTitle,
                courseCode: offering.catalog.code,
                term: offering.term,
                credits: offering.frozenCredits,
                status: sectionStatus,
                faculty: offering.faculty,
            },
            gradesheet,
        };
    }
}