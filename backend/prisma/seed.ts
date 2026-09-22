import { PrismaClient, Role, ResultStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // 1. Clean existing records in correct foreign key order
    await prisma.auditLedger.deleteMany();
    await prisma.resultAmendment.deleteMany();
    await prisma.examResult.deleteMany();
    await prisma.attendanceRecord.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.courseOffering.deleteMany();
    await prisma.courseCatalog.deleteMany();
    await prisma.user.deleteMany();

    // 2. Create the 4 Demo Personas
    const dean = await prisma.user.create({
        data: {
            email: 'dean@erp.edu',
            fullName: 'Dean Evans',
            role: Role.ADMIN,
        },
    });

    const profAlan = await prisma.user.create({
        data: {
            email: 'alan@erp.edu',
            fullName: 'Prof. Alan Turing',
            role: Role.FACULTY,
        },
    });

    const profSarah = await prisma.user.create({
        data: {
            email: 'sarah@erp.edu',
            fullName: 'Prof. Sarah Connor',
            role: Role.FACULTY,
        },
    });

    const bob = await prisma.user.create({
        data: {
            email: 'bob@erp.edu',
            fullName: 'Bob Smith',
            role: Role.STUDENT,
        },
    });

    const alice = await prisma.user.create({
        data: {
            email: 'alice@erp.edu',
            fullName: 'Alice Wood',
            role: Role.STUDENT,
        },
    });

    // 3. Create Master Catalog (Temporal Catalog)
    const cs101 = await prisma.courseCatalog.create({
        data: {
            code: 'CS101',
            title: 'Intro to Computer Science',
            defaultCredits: 3,
            department: 'Computer Science',
        },
    });

    // 4. Create Course Offering (Frozen Snapshot assigned to Prof. Alan)
    const offeringAlan = await prisma.courseOffering.create({
        data: {
            catalogId: cs101.id,
            term: 'Fall 2026',
            frozenTitle: cs101.title,
            frozenCredits: cs101.defaultCredits,
            facultyId: profAlan.id,
        },
    });

    // 5. Enroll Bob (Eligible: 9/10 sessions = 90% attendance)
    const bobEnrollment = await prisma.enrollment.create({
        data: {
            studentId: bob.id,
            offeringId: offeringAlan.id,
            isBarred: false,
        },
    });

    for (let i = 1; i <= 10; i++) {
        await prisma.attendanceRecord.create({
            data: {
                enrollmentId: bobEnrollment.id,
                sessionDate: new Date(2026, 8, i),
                isPresent: i !== 5, // 9 attended, 1 absent
            },
        });
    }

    await prisma.examResult.create({
        data: {
            enrollmentId: bobEnrollment.id,
            marks: 75.0,
            status: ResultStatus.DRAFT,
            version: 1,
        },
    });

    // 6. Enroll Alice (Auto-Barred: 5/10 sessions = 50% attendance < 75%)
    const aliceEnrollment = await prisma.enrollment.create({
        data: {
            studentId: alice.id,
            offeringId: offeringAlan.id,
            isBarred: true, // Cross-module policy rule enforced
        },
    });

    for (let i = 1; i <= 10; i++) {
        await prisma.attendanceRecord.create({
            data: {
                enrollmentId: aliceEnrollment.id,
                sessionDate: new Date(2026, 8, i),
                isPresent: i <= 5, // 5 attended, 5 absent
            },
        });
    }

    await prisma.examResult.create({
        data: {
            enrollmentId: aliceEnrollment.id,
            marks: 0.0,
            status: ResultStatus.DRAFT,
            version: 1,
        },
    });

    console.log('✅ Seed completed: Dean, Alan, Sarah, Bob (Eligible), and Alice (Barred) created!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });