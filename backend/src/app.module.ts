import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OfferingsModule } from './offerings/offerings.module';

@Module({
    imports: [PrismaModule, AuthModule, OfferingsModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }