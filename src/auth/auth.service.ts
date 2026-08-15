import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';
import { UserService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import * as bcrypt from 'bcrypt';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  // login method
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    try {
      const user = await this.userService.findByEmail(dto.email);
      // Deliberately vague error — never reveal whether it was
      // "email not found" vs "wrong password". Telling an attacker
      // which one it was lets them enumerate valid emails.
      if (!user) {
        this.logger.warn(`Login attempt for non-existent email:${dto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }
      // check password
      const passwordMatches = await bcrypt.compare(dto.password, user.password);
      if (!passwordMatches) {
        this.logger.warn(`failed login attempt for ${dto.password}`);
        throw new UnauthorizedException('Invalid credentials');
      }
      const tokens = this.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
      this.logger.log(`user logged in ${user.email} (${user.id})`);
      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        `Failed to sign in: ${(error as Error)?.message}`,
        (error as Error)?.stack,
      );
      throw new InternalServerErrorException(
        'An error occurred during sign in',
      );
    }
  }

  // get/me
  async getProfile(userId: string) {
    try {
      const user = await this.userService.findOne(userId);
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
      };
    } catch (error) {
      this.logger.error(error as Error);
    }
  }
  // refresh
  async refresh(
    dto: RefreshTokenDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: { userId: string; email: string; role: string };
    try {
      payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('invalid or expired refresh token');
    }
    // Confirm the user still exists and hasn't been deactivated/deleted
    // since the refresh token was issued
    const user = await this.userService.findOne(payload.userId);
    return this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  }

  // logout
  logout(userId: string): { message: string } {
    this.logger.log(`user logged out ${userId}`);
    // TODO(M6): blacklist current token in redis until its natural expiry
    return { message: 'Logged out. Please discard your tokens client-side.' };
  }

  // forgetPassword
  async forgetPassword(dto: ForgetPasswordDto): Promise<{ message: string }> {
    // TODO (M7): generate a short-lived reset token, store it (Redis, M6),
    // email it via the mail queue. Never reveal whether the email exists —
    // same enumeration concern as login.
    this.logger.log(`Password reset requested for: ${dto.email}`);
    return {
      message: 'If that email is registered, a reset link has been sent.',
    };
  }

  // reset Password
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    // TODO (M7): verify token against Redis store, find the user it belongs to,
    // hash dto.newPassword, save, invalidate the reset token.
    throw new Error('Not implemented — pending M6 (Redis) and M7 (Email)');
  }

  private generateTokens(payload: {
    userId: string;
    email: string;
    role: string;
  }) {
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
      expiresIn: this.configService.getOrThrow<string>(
        'jwt.refreshExpiry',
      ) as SignOptions['expiresIn'],
    });
    return { accessToken, refreshToken };
  }
}
