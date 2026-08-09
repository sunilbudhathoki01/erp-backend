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

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

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
