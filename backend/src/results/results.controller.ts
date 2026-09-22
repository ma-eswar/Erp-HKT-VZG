import {
    Controller,
    Patch,
    Post,
    Get,
    Param,
    Body,
    UseGuards,
    Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ResultsService } from './results.service';
import { UpdateMarkDto } from './dto/update-mark.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResultOwnerGuard } from './guards/result-owner.guard';

@ApiTags('Results & Lifecycle')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller()
export class ResultsController {
    constructor(private readonly resultsService: ResultsService) { }

    @Get('results/student/my-grades')
    @ApiOperation({ summary: 'Retrieve published grades for the authenticated student' })
    async getMyGrades(@Req() req: any) {
        return this.resultsService.getStudentGrades(req.user.userId);
    }

    @Patch('results/:id/mark')
    @UseGuards(ResultOwnerGuard)
    @ApiOperation({ summary: 'Update mark with Optimistic Concurrency Control (OCC)' })
    async updateMark(
        @Param('id') id: string,
        @Body() dto: UpdateMarkDto,
        @Req() req: any,
    ) {
        return this.resultsService.updateMarkWithOCC(
            id,
            dto.marks,
            dto.version,
            req.user.userId,
        );
    }

    @Post('offerings/:offeringId/submit-review')
    @ApiOperation({ summary: 'Transition section results from DRAFT to UNDER_REVIEW' })
    async submitForReview(@Param('offeringId') offeringId: string, @Req() req: any) {
        return this.resultsService.submitForReview(offeringId, req.user);
    }

    @Post('offerings/:offeringId/publish')
    @ApiOperation({ summary: 'Publish results institution-wide (Dean ADMIN only)' })
    async publishResults(@Param('offeringId') offeringId: string, @Req() req: any) {
        return this.resultsService.publishResults(offeringId, req.user);
    }
}