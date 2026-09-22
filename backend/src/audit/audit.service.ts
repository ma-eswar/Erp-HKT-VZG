import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
    constructor(private readonly prisma: PrismaService) { }

    async getResultAuditTrail(resultId: string) {
        const logs = await this.prisma.auditLedger.findMany({
            where: {
                entityName: 'ExamResult',
                entityId: resultId,
            },
            include: {
                actor: {
                    select: {
                        fullName: true,
                        role: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                timestamp: 'desc',
            },
        });

        return logs.map((log) => ({
            id: log.id,
            actionType: log.actionType,
            actorName: log.actor.fullName,
            actorRole: log.actor.role,
            actorEmail: log.actor.email,
            timestamp: log.timestamp,
            beforeState: log.beforeState,
            afterState: log.afterState,
        }));
    }
}
