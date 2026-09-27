import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_PERMISSIONS } from '../constants/role-permissions.map';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) return true; // no restriction declared

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Access denied');

    const userPermissions = ROLE_PERMISSIONS[user.role] ?? [];
    const hasAccess = required.every(
      (perm) => userPermissions.includes('*') || userPermissions.includes(perm),
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        `Missing required permission(s): ${required.join(', ')}`,
      );
    }

    return true;
  }
}
