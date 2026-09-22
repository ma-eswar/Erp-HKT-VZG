import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OfferingsService } from './offerings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FacultySectionGuard } from './guards/faculty-section.guard';

@ApiTags('Offerings')
@ApiBearerAuth('JWT-auth') // <-- Tells Swagger to send the token!
@Controller('offerings')
@UseGuards(JwtAuthGuard)
export class OfferingsController {
    constructor(private readonly offeringsService: OfferingsService) { }

    @Get()
    @ApiOperation({ summary: 'List all course offerings' })
    async getAllOfferings() {
        return this.offeringsService.getAllOfferings();
    }

    @Get(':id/gradebook')
    @UseGuards(FacultySectionGuard) // ABAC Guard
    @ApiOperation({ summary: 'Fetch section gradebook (ABAC protected)' })
    async getGradebook(@Param('id') id: string) {
        return this.offeringsService.getGradebook(id);
    }
}