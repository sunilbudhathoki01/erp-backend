import { UserRole } from '../types/fieldsEnum.types';

// TODO (M5 Phase 2): replace this static map with permissions read from a
// real `roles` table, flattened into the JWT payload at login time.
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [UserRole.ADMIN]: ['*'], // wildcard = every permission
  [UserRole.USER]: [], // adjust to your actual enum values/roles
};
