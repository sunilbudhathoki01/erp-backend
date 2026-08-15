import { ApiController } from 'src/common/decorators/api-controller.decorator';
import { AuthService } from './auth.service';
import { Body, Get, Post, UseGuards } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { RequestUser } from 'src/common/types/global.types';
import { JwtGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiController('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @ApiOperation({ summary: 'login with email and password' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get authenticated user' })
  async getMe(@CurrentUser() currentUser: RequestUser) {
    return this.authService.getProfile(currentUser.userId);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Rfresh access token' })
  refresh(@Body() token: RefreshTokenDto) {
    return this.authService.refresh(token);
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiOperation({
    summary: 'Logout (stub — real invalidation requires Redis, M6)',
  })
  logout(@CurrentUser() currentUser: RequestUser) {
    return this.authService.logout(currentUser.userId);
  }

  @Post('forget-password')
  @ApiOperation({
    summary: 'Forget password (stub — requires Redis + Email, M6/M7)',
  })
  forgetPassword(@Body() dto: ForgetPasswordDto) {
    return this.authService.forgetPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password (stub — requires Redis + Email, M6/M7)',
  })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
