import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export async function paginate<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  query: PaginationQueryDto,
): Promise<PaginatedResponseDto<T>> {
  const { page, limit } = query;

  const [data, totalItems] = await qb
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();

  return new PaginatedResponseDto(
    data,
    new PageMetaDto({ page, limit, totalItems }),
  );
}
