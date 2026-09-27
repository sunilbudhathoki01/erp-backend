import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { status, UserRole } from 'src/common/types/fieldsEnum.types';

export class UserQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiPropertyOptional({ enum: status })
  @IsOptional()
  @IsEnum(status)
  status?: status;
}
