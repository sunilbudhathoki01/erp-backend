import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { string } from 'joi';

export class LoginDto {
  @ApiProperty({
    type: string,
    description: 'The registered email of user ',
    example: 'user@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    type: string,
    description: 'The actual password set during registration of a user',
    example: 'password@12#098',
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
