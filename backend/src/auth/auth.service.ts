import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async switchPersona(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new NotFoundException(`User with email "${email}" not found in database.`);
        }

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
        };

        const token = this.jwtService.sign(payload);

        return {
            accessToken: token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
        };
    }
}