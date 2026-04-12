import {
  UseGuards,
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { User } from '../prisma/generated/client';
import { CreateUserDto } from './dto/create-user.dto';
import { SetUserStatusDto } from './dto/set-user-status.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAccessGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los usuarios.' })
  @ApiOkResponse({
    description: 'Listado de usuarios.',
    type: UserResponseDto,
    isArray: true,
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    description: 'Si es true, solo retorna usuarios activos.',
    example: true,
    type: Boolean,
  })
  @ApiBadRequestResponse({
    description: 'El parametro activeOnly debe ser true o false.',
  })
  async findAll(
    @Query('activeOnly') activeOnly?: string,
  ): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAll(
      this.parseOptionalBoolean(activeOnly),
    );

    return users.map((user) => this.toResponseDto(user));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por id.' })
  @ApiParam({
    name: 'id',
    description: 'Identificador del usuario.',
    example: '01HRM9YQ6Q4P5X3A4N5Z6B7C8D',
  })
  @ApiOkResponse({
    description: 'Usuario encontrado.',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado.' })
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findByIdOrFail(id);
    return this.toResponseDto(user);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un usuario.' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: 'Usuario creado correctamente.',
    type: UserResponseDto,
  })
  @ApiConflictResponse({
    description:
      'El nombre de usuario ya existe o la persona ya tiene usuario.',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.create(createUserDto);
    return this.toResponseDto(user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un usuario.' })
  @ApiParam({
    name: 'id',
    description: 'Identificador del usuario.',
    example: '01HRM9YQ6Q4P5X3A4N5Z6B7C8D',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    description: 'Usuario actualizado correctamente.',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado.' })
  @ApiConflictResponse({
    description:
      'El nombre de usuario ya existe o la persona ya tiene usuario.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.update(id, updateUserDto);
    return this.toResponseDto(user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Activar o desactivar un usuario.' })
  @ApiParam({
    name: 'id',
    description: 'Identificador del usuario.',
    example: '01HRM9YQ6Q4P5X3A4N5Z6B7C8D',
  })
  @ApiBody({ type: SetUserStatusDto })
  @ApiOkResponse({
    description: 'Estado del usuario actualizado correctamente.',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado.' })
  async setActive(
    @Param('id') id: string,
    @Body() setUserStatusDto: SetUserStatusDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.setActive(
      id,
      setUserStatusDto.active,
      setUserStatusDto.updatedBy,
    );
    return this.toResponseDto(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un usuario.' })
  @ApiParam({
    name: 'id',
    description: 'Identificador del usuario.',
    example: '01HRM9YQ6Q4P5X3A4N5Z6B7C8D',
  })
  @ApiOkResponse({
    description: 'Usuario eliminado correctamente.',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado.' })
  async delete(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.delete(id);
    return this.toResponseDto(user);
  }

  private parseOptionalBoolean(value?: string): boolean | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }

    throw new BadRequestException(
      'El parametro activeOnly debe ser true o false.',
    );
  }

  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      personId: user.personId,
      username: user.username,
      active: user.active,
      createdAt: user.createdAt,
      createdBy: user.createdBy,
      updatedAt: user.updatedAt,
      updatedBy: user.updatedBy,
    };
  }
}
