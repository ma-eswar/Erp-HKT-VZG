import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator';

export class AdjudicateAmendmentDto {
    @ApiProperty({
        example: 'APPROVED',
        enum: ['APPROVED', 'REJECTED'],
        description: 'Adjudication decision for the requested grade amendment',
    })
    @IsIn(['APPROVED', 'REJECTED'])
    @IsNotEmpty()
    decision: 'APPROVED' | 'REJECTED';
}
