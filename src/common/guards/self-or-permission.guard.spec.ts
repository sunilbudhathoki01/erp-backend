import { SelfOrPermissionGuard } from './self-or-permission.guard';

describe('SelfOrPermissionGuard', () => {
  it('should be defined', () => {
    expect(new SelfOrPermissionGuard()).toBeDefined();
  });
});
