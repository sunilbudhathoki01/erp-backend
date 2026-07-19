import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { status, userRole } from 'src/common/types/fieldsEnum.types';

export class UserQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: userRole })
  @IsOptional()
  @IsEnum(userRole)
  role!: userRole;

  @ApiPropertyOptional({ enum: status })
  @IsOptional()
  @IsEnum(status)
  status?: status;
}
