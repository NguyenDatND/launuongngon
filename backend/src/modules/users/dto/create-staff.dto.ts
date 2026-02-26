import { IsEmail, IsEnum, IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateStaffDto {
  @ApiProperty({ example: 'staff@example.com' })
  @IsEmail()
  @Transform(({ value }: { value: string }) => value?.toLowerCase?.() ?? value)
  email: string;

  @ApiProperty({ example: 'secret123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: UserRole, example: UserRole.staff })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: 'uuid-of-branch' })
  @IsUUID()
  branchId: string;
}
