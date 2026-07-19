import { ApiProperty } from '@nestjs/swagger';
import { PageMetaDto } from './page-meta.dto';

export class PaginatedResponseDto<T> {
  @ApiProperty({ isArray: true })
  data!: T[];

  @ApiProperty({ type: PageMetaDto })
  meta!: PageMetaDto;

  constructor(data: T[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
