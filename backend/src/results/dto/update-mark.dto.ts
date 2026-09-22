import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max, IsInt } from 'class-validator';

export class UpdateMarkDto {
    @ApiProperty({
        example: 85.5,
        description: 'Marks to assign (0.00 to 100.00)',
    })
    @IsNumber()
    @Min(0)
    @Max(100)
    marks: number;

    @ApiProperty({
        example: 1,
        description: 'The baseline OCC version integer currently loaded by the client',
    })
    @IsInt()
    @Min(1)
    version: number;
}