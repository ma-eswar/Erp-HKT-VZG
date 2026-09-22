import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Audit Ledger')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    @Get(':resultId')
    @ApiOperation({ summary: 'Retrieve full immutable audit diff history for an ExamResult' })
    async getResultAuditTrail(@Param('resultId') resultId: string) {
        return this.auditService.getResultAuditTrail(resultId);
    }
}
