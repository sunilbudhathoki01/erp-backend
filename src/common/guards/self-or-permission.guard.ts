import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { ROLE_PERMISSIONS } from '../constants/role-permissions.map';

@Injectable()
export class SelfOrPermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const { user, params } = request;

    if (!user) throw new ForbiddenException('Access denied');

    // Ownership check: the :id route param matches the logged-in user
    const isSelf = params?.id === user.userId;
    if (isSelf) return true;

    // Not the owner — fall back to normal permission check (e.g. admin override)
    if (!required || required.length === 0) {
      throw new ForbiddenException('You can only access your own record');
    }

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
