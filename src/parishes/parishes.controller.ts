import {
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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
import { Parish } from '../prisma/generated/client';
import { CreateParishDto } from './dto/create-parish.dto';
import { ParishResponseDto } from './dto/parish-response.dto';
import { SetParishStatusDto } from './dto/set-parish-status.dto';
import { UpdateParishDto } from './dto/update-parish.dto';
import { ParishesService } from './parishes.service';

@ApiTags('Parishes')
@ApiBearerAuth('access-token')
@UseGuards(JwtAccessGuard)
@Controller('parishes')
export class ParishesController {
  constructor(private readonly parishesService: ParishesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las parroquias.' })
  @ApiOkResponse({
    description: 'Listado de parroquias.',
    type: ParishResponseDto,
    isArray: true,
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    description: 'Si es true, solo retorna parroquias activas.',
    example: true,
    type: Boolean,
  })
  @ApiBadRequestResponse({
    description: 'El parametro activeOnly debe ser true o false.',
  })
  async findAll(
    @Query('activeOnly') activeOnly?: string,
  ): Promise<ParishResponseDto[]> {
    const parishes = await this.parishesService.findAll(
      this.parseOptionalBoolean(activeOnly),
    );

    return parishes.map((parish) => this.toResponseDto(parish));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una parroquia por id.' })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la parroquia.',
    example: '1',
  })
  @ApiOkResponse({
    description: 'Parroquia encontrada.',
    type: ParishResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Parroquia no encontrada.' })
  async findById(@Param('id') id: string): Promise<ParishResponseDto> {
    const parish = await this.parishesService.findByIdOrFail(
      this.parseBigInt(id),
    );
    return this.toResponseDto(parish);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una parroquia.' })
  @ApiBody({ type: CreateParishDto })
  @ApiCreatedResponse({
    description: 'Parroquia creada correctamente.',
    type: ParishResponseDto,
  })
  @ApiConflictResponse({
    description: 'Ya existe una parroquia con ese nombre.',
  })
  async create(
    @Body() createParishDto: CreateParishDto,
  ): Promise<ParishResponseDto> {
    const parish = await this.parishesService.create({
      name: createParishDto.name,
      address: createParishDto.address,
      phone: createParishDto.phone,
      active: createParishDto.active,
      createdBy: createParishDto.createdBy,
    });
    return this.toResponseDto(parish);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una parroquia.' })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la parroquia.',
    example: '1',
  })
  @ApiBody({ type: UpdateParishDto })
  @ApiOkResponse({
    description: 'Parroquia actualizada correctamente.',
    type: ParishResponseDto,
  })
  @ApiConflictResponse({
    description: 'Ya existe una parroquia con ese nombre.',
  })
  @ApiNotFoundResponse({ description: 'Parroquia no encontrada.' })
  async update(
    @Param('id') id: string,
    @Body() updateParishDto: UpdateParishDto,
  ): Promise<ParishResponseDto> {
    const parish = await this.parishesService.update(this.parseBigInt(id), {
      name: updateParishDto.name,
      address: updateParishDto.address,
      phone: updateParishDto.phone,
      active: updateParishDto.active,
      updatedBy: updateParishDto.updatedBy,
    });
    return this.toResponseDto(parish);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Activar o desactivar una parroquia.' })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la parroquia.',
    example: '1',
  })
  @ApiBody({ type: SetParishStatusDto })
  @ApiOkResponse({
    description: 'Estado de la parroquia actualizado correctamente.',
    type: ParishResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Parroquia no encontrada.' })
  async setActive(
    @Param('id') id: string,
    @Body() setParishStatusDto: SetParishStatusDto,
  ): Promise<ParishResponseDto> {
    const parish = await this.parishesService.setActive(
      this.parseBigInt(id),
      setParishStatusDto.active,
      setParishStatusDto.updatedBy,
    );
    return this.toResponseDto(parish);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una parroquia.' })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la parroquia.',
    example: '1',
  })
  @ApiOkResponse({
    description: 'Parroquia eliminada correctamente.',
    type: ParishResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Parroquia no encontrada.' })
  async delete(@Param('id') id: string): Promise<ParishResponseDto> {
    const parish = await this.parishesService.delete(this.parseBigInt(id));
    return this.toResponseDto(parish);
  }

  private parseBigInt(value: string): bigint {
    try {
      return BigInt(value);
    } catch {
      throw new BadRequestException('El id debe ser un entero valido.');
    }
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

  private toResponseDto(parish: Parish): ParishResponseDto {
    return {
      id: parish.id.toString(),
      name: parish.name,
      address: parish.address,
      phone: parish.phone,
      active: parish.active,
      createdAt: parish.createdAt,
      createdBy: parish.createdBy,
      updatedAt: parish.updatedAt,
      updatedBy: parish.updatedBy,
    };
  }
}
