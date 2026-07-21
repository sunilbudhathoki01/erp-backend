import { applyDecorators, Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

export type Platform = 'web' | 'mobile';
export function ApiController(resource: string, platform: Platform = 'web') {
  return applyDecorators(
    Controller(`api/v1/${platform}/${resource}`),
    ApiTags(resource),
  );
}
