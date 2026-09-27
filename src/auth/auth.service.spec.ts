jest.mock('src/users/users.service', () => ({}), { virtual: true });

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from 'src/users/users.service';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: { findByEmail: jest.Mock };
  let jwtService: { sign: jest.Mock };
  let configService: { get: jest.Mock; getOrThrow: jest.Mock };

  beforeEach(() => {
    userService = {
      findByEmail: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
    };

    configService = {
      get: jest.fn(),
      getOrThrow: jest.fn(),
    };

    authService = new AuthService(
      userService as unknown as UserService,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
    );
  });

  it('should preserve UnauthorizedException for invalid credentials', async () => {
    const hash = await bcrypt.hash('correct-password', 10);
    userService.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      password: hash,
      firstName: 'Test',
      lastName: 'User',
      role: 'admin',
    });

    await expect(
      authService.login({
        email: 'test@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
