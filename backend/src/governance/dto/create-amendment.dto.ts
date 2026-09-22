import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, Min, Max, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class CreateAmendmentDto {
    @ApiProperty({
        example: 'd3b07384-d113-4a4b-9c80-4966ef4b14d6',
        description: 'UUID of the ExamResult record to amend',
    })
    @IsUUID()
    @IsNotEmpty()
    resultId: string;

    @ApiProperty({
        example: 88.5,
        description: 'Proposed marks (0.00 to 100.00)',
    })
    @IsNumber()
    @Min(0)
    @Max(100)
    proposedMarks: number;

    @ApiProperty({
        example: 'Re-evaluation of Question 4 after reviewing exam paper with the student.',
        description: 'Detailed justification for the grade amendment (min 10 characters)',
    })
    @IsString()
    @MinLength(10)
    justification: string;
}
