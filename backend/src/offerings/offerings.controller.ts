import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { OfferingsService } from './offerings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FacultySectionGuard } from './guards/faculty-section.guard';

@Controller('offerings')
@UseGuards(JwtAuthGuard) // Requires a valid JWT token on all routes
export class OfferingsController {
    constructor(private readonly offeringsService: OfferingsService) { }

    @Get()
    async getAllOfferings() {
        return this.offeringsService.getAllOfferings();
    }

    @Get(':id/gradebook')
    @UseGuards(FacultySectionGuard) // ABAC Guard applied here
    async getGradebook(@Param('id') id: string) {
        return this.offeringsService.getGradebook(id);
    }
}