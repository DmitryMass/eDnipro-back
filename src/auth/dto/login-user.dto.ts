import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'jonh@gmail.com', description: 'User email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'anyPass', description: 'User password' })
  @IsString()
  @MinLength(6, { message: 'Password must be more than 6 symbols!' })
  password: string;
}
