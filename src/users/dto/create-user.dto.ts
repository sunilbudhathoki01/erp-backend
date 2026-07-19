import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';
export class CreateUserDto {
  @ApiProperty()
  @IsString()
  firstName!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty()
  @IsString()
  lastName!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  phoneNumber!: string;

  @ApiProperty()
  @IsString()
  address!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  password!: string;
}
