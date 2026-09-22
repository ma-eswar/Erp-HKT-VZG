import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OfferingsModule } from './offerings/offerings.module';
import { ResultsModule } from './results/results.module';

@Module({
    imports: [PrismaModule, AuthModule, OfferingsModule, ResultsModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }