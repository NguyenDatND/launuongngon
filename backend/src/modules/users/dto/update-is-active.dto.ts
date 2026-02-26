import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateIsActiveDto {
  @ApiProperty({ example: false, description: 'Set false to deactivate, true to reactivate' })
  @IsBoolean()
  isActive: boolean;
}
