import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { RequestUser } from 'src/common/types/global.types';
import * as bcrypt from 'bcrypt';
import { UserQueryDto } from './dto/user-query.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { paginate } from 'src/utils/paginate.utils';
import { updateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly dataSource: DataSource, // reserved: multi-table ops later use queryRunner, see class-stream-group pattern
  ) {}

  async create(
    dto: CreateUserDto,
    currentUser?: RequestUser,
  ): Promise<{ data: string; message: string }> {
    try {
      const existing = await this.usersRepository.findOne({
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictException('user already exist');
      }
      const hashPassword = await bcrypt.hash(dto.password, 10);
      const user = this.usersRepository.create({
        ...dto,
        password: hashPassword,
        createdBy: currentUser?.userId,
      });
      const saved = await this.usersRepository.save(user);
      return { data: saved.id, message: 'user created successfully' };
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      this.logger.error(
        `Failed to create user: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findOne(id: string): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException(`user with the id:${id} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `failed to find user ${id}:${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException('failed to find user');
    }
  }

  async findAll(query: UserQueryDto): Promise<PaginatedResponseDto<User>> {
    try {
      const qb = this.usersRepository.createQueryBuilder('user');
      if (query.search) {
        qb.andWhere(
          '(user.firstName ILIKE :serach OR user.lastName ILIKE :search OR user.email ILIKE :search)',
          { search: `%${query.search}%` },
        );
      }
      if (query.role) {
        qb.andWhere('user.role :role', { role: query.role });
      }
      if (query.status) {
        qb.andWhere('user.status :status', { status: query.status });
      }
      qb.orderBy('user.createdAt', query.order);
      return await paginate(qb, query);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `failed to list user ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException('failed to list users');
    }
  }

  async update(
    id: string,
    dto: updateUserDto,
    currentUser?: RequestUser,
  ): Promise<{ data: string; message: string }> {
    try {
      const user = await this.findOne(id);
      Object.assign(user, dto);
      user.updatedBy = currentUser?.userId;
      const saved = await this.usersRepository.save(user);
      return { data: saved.id, message: 'user updated successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `Failed to update user ${id}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async remove(
    id: string,
    currentUser?: RequestUser,
  ): Promise<{ message: string }> {
    try {
      const user = await this.findOne(id); // reuses NotFoundException handling above
      user.deletedBy = currentUser?.userId;
      await this.usersRepository.save(user); // persist deletedBy before the soft-delete timestamp
      await this.usersRepository.softDelete(id); // sets deleted_at via @DeleteDateColumn — row stays, excluded from default queries
      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `Failed to delete user ${id}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
