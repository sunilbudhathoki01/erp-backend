import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  //   create a User
  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    phoneNumber: string;
    password: string;
  }): Promise<{ data: User; message: string }> {
    const existing = await this.userRepo.findOne({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictException('Email already exists');
    }
    const hashPassword = await bcrypt.hash(data.password, 10);
    const user = this.userRepo.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      address: data.address,
      phoneNumber: data.phoneNumber,
      password: hashPassword,
    });
    const saved = await this.userRepo.save(user);
    return { data: saved, message: 'dskj' };
  }

  //   findByEmail
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo
      .createQueryBuilder('user')
      .where('user.email=:email', { email })
      .addSelect('user.password')
      .getOne();
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }
}
