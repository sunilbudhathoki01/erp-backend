import { ApiController } from 'src/common/decorators/api-controller.decorator';
import { AuthService } from './auth.service';
import { Body, Post } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { ApiOperation } from '@nestjs/swagger';

@ApiController('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post()
  @ApiOperation({ summary: 'login with email and password' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
