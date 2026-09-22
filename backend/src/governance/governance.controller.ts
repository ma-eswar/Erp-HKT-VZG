import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    UseGuards,
    Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GovernanceService } from './governance.service';
import { CreateAmendmentDto } from './dto/create-amendment.dto';
import { AdjudicateAmendmentDto } from './dto/adjudicate-amendment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Maker-Checker Governance')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('amendments')
export class GovernanceController {
    constructor(private readonly governanceService: GovernanceService) { }

    @Post('request')
    @ApiOperation({ summary: 'Submit a grade amendment request for a published result (Maker)' })
    async requestAmendment(@Body() dto: CreateAmendmentDto, @Req() req: any) {
        return this.governanceService.requestAmendment(dto, req.user);
    }

    @Get('pending')
    @ApiOperation({ summary: 'Fetch all pending amendment requests for Dean review' })
    async getPendingAmendments(@Req() req: any) {
        return this.governanceService.getPendingAmendments(req.user);
    }

    @Post(':id/adjudicate')
    @ApiOperation({ summary: 'Approve or Reject an amendment request (Dean / Checker)' })
    async adjudicateAmendment(
        @Param('id') id: string,
        @Body() dto: AdjudicateAmendmentDto,
        @Req() req: any,
    ) {
        return this.governanceService.adjudicateAmendment(id, dto, req.user);
    }
}
