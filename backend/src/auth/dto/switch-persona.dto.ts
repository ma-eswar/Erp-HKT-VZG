import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SwitchPersonaDto {
    @ApiProperty({
        example: 'alan@erp.edu',
        description: 'Email of the test persona to impersonate',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;
}