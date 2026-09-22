import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ResultOwnerGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) throw new ForbiddenException('Unauthenticated');
        if (user.role === 'ADMIN') return true;

        const resultId = request.params.id;
        if (!resultId) return true;

        const examResult = await this.prisma.examResult.findUnique({
            where: { id: resultId },
            include: {
                enrollment: {
                    include: { offering: true },
                },
            },
        });

        if (!examResult) {
            throw new NotFoundException(`Result "${resultId}" not found`);
        }

        if (examResult.enrollment.offering.facultyId !== user.userId) {
            throw new ForbiddenException(
                `ABAC Violation: You are not assigned to evaluate this student result.`,
            );
        }

        return true;
    }
}