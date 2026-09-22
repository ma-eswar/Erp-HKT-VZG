import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FacultySectionGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user; // Populated by JwtAuthGuard

        if (!user) {
            throw new ForbiddenException('Unauthenticated request: user not found.');
        }

        // Admins (Dean) have global oversight
        if (user.role === 'ADMIN') {
            return true;
        }

        // Students are not permitted to access faculty gradebook views
        if (user.role === 'STUDENT') {
            throw new ForbiddenException('Students are not permitted to access faculty gradebook.');
        }

        // Extract offeringId from route params or body
        const offeringId = request.params.id || request.params.offeringId || request.body.offeringId;

        if (!offeringId) {
            return true;
        }

        const offering = await this.prisma.courseOffering.findUnique({
            where: { id: offeringId },
        });

        if (!offering) {
            throw new NotFoundException(`Course offering with ID "${offeringId}" not found.`);
        }

        // ABAC Context Check: Does the user own this section?
        if (offering.facultyId !== user.userId) {
            throw new ForbiddenException(
                `ABAC Violation: User "${user.fullName}" is not assigned to course section "${offering.frozenTitle}". Access Denied.`
            );
        }

        return true;
    }
}