import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApiController } from 'src/common/decorators/api-controller.decorator';
import { UserService } from './users.service';
import {
  Body,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import type { RequestUser } from 'src/common/types/global.types';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserQueryDto } from './dto/user-query.dto';
import { updateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermissions } from 'src/common/decorators/permissions.decorator';
import { SelfOrPermissionGuard } from 'src/common/guards/self-or-permission.guard';

@ApiBearerAuth()
@ApiController('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new User' })
  async create(
    @Body() dto: CreateUserDto,
    @CurrentUser() currentUser: RequestUser,
  ) {
    return this.userService.create(dto, currentUser);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('users:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List users with filters and pagination' })
  findAll(@Query() query: UserQueryDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, SelfOrPermissionGuard)
  @RequirePermissions('users:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user by ID' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, SelfOrPermissionGuard)
  @RequirePermissions('users:write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'update a user' })
  update(
    @Param('id') id: string,
    @Body() dto: updateUserDto,
    @CurrentUser() currentUser: RequestUser,
  ) {
    return this.userService.update(id, dto, currentUser);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiOperation({ summary: 'Soft-delete a user' })
  remove(@Param('id') id: string, @CurrentUser() currentUser: RequestUser) {
    return this.userService.remove(id, currentUser);
  }
}
