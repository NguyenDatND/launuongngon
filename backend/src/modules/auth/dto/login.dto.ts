import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'manager@example.com' })
  @IsEmail({}, { message: 'Invalid email or password.' })
  @Transform(({ value }: { value: string }) => value?.toLowerCase?.() ?? value)
  email: string;

  @ApiProperty({ example: 'secret123' })
  @IsString()
  @IsNotEmpty({ message: 'Invalid email or password.' })
  password: string;
}
