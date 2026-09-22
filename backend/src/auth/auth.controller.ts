import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SwitchPersonaDto } from './dto/switch-persona.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('switch-persona')
    @ApiOperation({ summary: 'Switch active user persona and receive a signed JWT token' })
    async switchPersona(@Body() dto: SwitchPersonaDto) {
        return this.authService.switchPersona(dto.email);
    }
}