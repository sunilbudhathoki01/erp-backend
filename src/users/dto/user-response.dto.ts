import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { status, userRole } from 'src/common/types/fieldsEnum.types';

@Exclude()
export class UserResponseDto {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() firstName!: string;
  @Expose() @ApiProperty({ required: false }) middleName?: string;
  @Expose() @ApiProperty() lastName!: string;
  @Expose() @ApiProperty() email!: string;
  @Expose() @ApiProperty() phoneNumber!: string;
  @Expose() @ApiProperty({ enum: userRole }) role!: userRole;
  @Expose() @ApiProperty({ enum: status }) status!: status;
  @Expose() @ApiProperty() createdAt!: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
