import { Module } from '@nestjs/common';
import { ResultsService } from './results.service';
import { ResultsController } from './results.controller';
import { ResultOwnerGuard } from './guards/result-owner.guard';

@Module({
    controllers: [ResultsController],
    providers: [ResultsService, ResultOwnerGuard],
    exports: [ResultsService],
})
export class ResultsModule { }