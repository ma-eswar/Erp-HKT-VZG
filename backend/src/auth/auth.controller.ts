import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('switch-persona')
    async switchPersona(@Body('email') email: string) {
        return this.authService.switchPersona(email);
    }
}