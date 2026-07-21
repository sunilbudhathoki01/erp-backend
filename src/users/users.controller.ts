import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApiController } from 'src/common/decorators/api-controller.decorator';
import { UserService } from './users.service';
import { Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import type { RequestUser } from 'src/common/types/global.types';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserQueryDto } from './dto/user-query.dto';
import { updateUserDto } from './dto/update-user.dto';

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
    await this.userService.create(dto, currentUser);
  }

  @Get()
  @ApiOperation({ summary: 'List users with filters and pagination' })
  findAll(@Query() query: UserQueryDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'update a user' })
  update(
    @Param('id') id: string,
    @Body() dto: updateUserDto,
    @CurrentUser() currentUser: RequestUser,
  ) {
    return this.userService.update(id, dto, currentUser);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a user' })
  remove(@Param('id') id: string, @CurrentUser() currentUser: RequestUser) {
    return this.userService.remove(id, currentUser);
  }
}
