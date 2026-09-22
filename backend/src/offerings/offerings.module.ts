import { Module } from '@nestjs/common';
import { OfferingsService } from './offerings.service';
import { OfferingsController } from './offerings.controller';
import { FacultySectionGuard } from './guards/faculty-section.guard';

@Module({
    controllers: [OfferingsController],
    providers: [OfferingsService, FacultySectionGuard],
    exports: [OfferingsService, FacultySectionGuard],
})
export class OfferingsModule { }