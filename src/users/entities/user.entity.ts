import { BaseEntity } from 'src/common/entities/base.entity';
import { status, UserRole } from 'src/common/types/fieldsEnum.types';
import { Column, Entity, Index } from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
  @Column({ name: 'first_name', type: 'varchar' })
  firstName!: string;

  @Column({ name: 'middle_name', type: 'varchar', nullable: true })
  middleName!: string;

  @Column({ name: 'last_name', type: 'varchar' })
  lastName!: string;

  @Index()
  @Column({ name: 'email', type: 'varchar', unique: true })
  email!: string;

  @Column({ name: 'phone_number', type: 'varchar', unique: true })
  phoneNumber!: string;

  @Column({ name: 'address', type: 'varchar' })
  address!: string;

  @Column({ name: 'password', select: false })
  password!: string;

  @Index()
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @Column({
    name: 'status',
    type: 'enum',
    enum: status,
    default: status.INACTIVE,
  })
  status!: status;
}
