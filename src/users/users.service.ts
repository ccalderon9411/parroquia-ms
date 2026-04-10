import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'bcryptjs';
import { Prisma, User } from '../prisma/generated/client';
import type { UserRepository } from './user.repository';
import { USER_REPOSITORY } from './user.repository';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly usersRepository: UserRepository,
  ) {}

  findAll(activeOnly?: boolean): Promise<User[]> {
    return this.usersRepository.findAll(activeOnly);
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async findByIdOrFail(id: string): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return user;
  }

  findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findByUsername(username);
  }

  findByPersonId(personId: string): Promise<User | null> {
    return this.usersRepository.findByPersonId(personId);
  }

  async create(data: {
    personId: string;
    username: string;
    password: string;
    active?: boolean;
    createdBy?: string;
  }): Promise<User> {
    await this.ensureUsernameAvailable(data.username);
    await this.ensurePersonAvailable(data.personId);

    const passwordHash = await hash(data.password, 10);

    return this.usersRepository.create({
      username: data.username,
      password: passwordHash,
      active: data.active,
      createdBy: data.createdBy,
      updatedBy: data.createdBy,
      person: {
        connect: { id: data.personId },
      },
    });
  }

  async update(
    id: string,
    data: {
      personId?: string;
      username?: string;
      password?: string;
      active?: boolean;
      createdBy?: string;
      updatedBy?: string;
    },
  ): Promise<User> {
    const current = await this.findByIdOrFail(id);

    if (data.username && data.username !== current.username) {
      await this.ensureUsernameAvailable(data.username);
    }

    if (data.personId && data.personId !== current.personId) {
      await this.ensurePersonAvailable(data.personId);
    }

    const updateData: Prisma.UserUpdateInput = {
      username: data.username,
      active: data.active,
      updatedBy: data.updatedBy,
    };

    if (data.password) {
      updateData.password = await hash(data.password, 10);
    }

    if (data.personId) {
      updateData.person = {
        connect: { id: data.personId },
      };
    }

    return this.usersRepository.update(id, updateData);
  }

  async setActive(
    id: string,
    active: boolean,
    updatedBy?: string,
  ): Promise<User> {
    await this.findByIdOrFail(id);
    return this.usersRepository.setActive(id, active, updatedBy);
  }

  async delete(id: string): Promise<User> {
    await this.findByIdOrFail(id);
    return this.usersRepository.delete(id);
  }

  private async ensureUsernameAvailable(username: string): Promise<void> {
    const existing = await this.findByUsername(username);

    if (existing) {
      throw new ConflictException('El nombre de usuario ya existe.');
    }
  }

  private async ensurePersonAvailable(personId: string): Promise<void> {
    const existing = await this.findByPersonId(personId);

    if (existing) {
      throw new ConflictException('La persona ya tiene un usuario asociado.');
    }
  }
}