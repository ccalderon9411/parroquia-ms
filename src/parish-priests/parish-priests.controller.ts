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
import { ParishPriest } from '../prisma/generated/client';
import { CreateParishPriestDto } from './dto/create-parish-priest.dto';
import { ParishPriestResponseDto } from './dto/parish-priest-response.dto';
import { SetParishPriestStatusDto } from './dto/set-parish-priest-status.dto';
import { UpdateParishPriestDto } from './dto/update-parish-priest.dto';
import { ParishPriestsService } from './parish-priests.service';

@ApiTags('ParishPriests')
@ApiBearerAuth('access-token')
@UseGuards(JwtAccessGuard)
@Controller('parish-priests')
export class ParishPriestsController {
  constructor(private readonly parishPriestsService: ParishPriestsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todas las asignaciones de parroquia y sacerdote.',
  })
  @ApiOkResponse({
    description: 'Listado de asignaciones.',
    type: ParishPriestResponseDto,
    isArray: true,
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    description: 'Si es true, solo retorna asignaciones activas.',
    example: true,
    type: Boolean,
  })
  @ApiBadRequestResponse({
    description: 'El parametro activeOnly debe ser true o false.',
  })
  async findAll(
    @Query('activeOnly') activeOnly?: string,
  ): Promise<ParishPriestResponseDto[]> {
    const parishPriests = await this.parishPriestsService.findAll(
      this.parseOptionalBoolean(activeOnly),
    );

    return parishPriests.map((parishPriest) =>
      this.toResponseDto(parishPriest),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una asignación por id.' })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la asignación.',
    example: '1',
  })
  @ApiOkResponse({
    description: 'Asignación encontrada.',
    type: ParishPriestResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Asignación de parroquia y sacerdote no encontrada.',
  })
  async findById(@Param('id') id: string): Promise<ParishPriestResponseDto> {
    const parishPriest = await this.parishPriestsService.findByIdOrFail(
      this.parseBigInt(id),
    );
    return this.toResponseDto(parishPriest);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una asignación de parroquia y sacerdote.' })
  @ApiBody({ type: CreateParishPriestDto })
  @ApiCreatedResponse({
    description: 'Asignación creada correctamente.',
    type: ParishPriestResponseDto,
  })
  @ApiConflictResponse({
    description:
      'Ya existe una asignación activa para esa parroquia y sacerdote.',
  })
  @ApiNotFoundResponse({ description: 'Parroquia o sacerdote no encontrado.' })
  async create(
    @Body() createParishPriestDto: CreateParishPriestDto,
  ): Promise<ParishPriestResponseDto> {
    const parishPriest = await this.parishPriestsService.create({
      parishId: this.parseBigInt(createParishPriestDto.parishId),
      priestId: this.parseBigInt(createParishPriestDto.priestId),
      active: createParishPriestDto.active,
      createdBy: createParishPriestDto.createdBy,
    });
    return this.toResponseDto(parishPriest);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar una asignación de parroquia y sacerdote.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la asignación.',
    example: '1',
  })
  @ApiBody({ type: UpdateParishPriestDto })
  @ApiOkResponse({
    description: 'Asignación actualizada correctamente.',
    type: ParishPriestResponseDto,
  })
  @ApiConflictResponse({
    description:
      'Ya existe una asignación activa para esa parroquia y sacerdote.',
  })
  @ApiNotFoundResponse({
    description: 'Asignación, parroquia o sacerdote no encontrado.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateParishPriestDto: UpdateParishPriestDto,
  ): Promise<ParishPriestResponseDto> {
    const parishPriest = await this.parishPriestsService.update(
      this.parseBigInt(id),
      {
        parishId:
          updateParishPriestDto.parishId === undefined
            ? undefined
            : this.parseBigInt(updateParishPriestDto.parishId),
        priestId:
          updateParishPriestDto.priestId === undefined
            ? undefined
            : this.parseBigInt(updateParishPriestDto.priestId),
        active: updateParishPriestDto.active,
        updatedBy: updateParishPriestDto.updatedBy,
      },
    );
    return this.toResponseDto(parishPriest);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Activar o desactivar una asignación.' })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la asignación.',
    example: '1',
  })
  @ApiBody({ type: SetParishPriestStatusDto })
  @ApiOkResponse({
    description: 'Estado de la asignación actualizado correctamente.',
    type: ParishPriestResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Asignación de parroquia y sacerdote no encontrada.',
  })
  @ApiConflictResponse({
    description:
      'Ya existe una asignación activa para esa parroquia y sacerdote.',
  })
  async setActive(
    @Param('id') id: string,
    @Body() setParishPriestStatusDto: SetParishPriestStatusDto,
  ): Promise<ParishPriestResponseDto> {
    const parishPriest = await this.parishPriestsService.setActive(
      this.parseBigInt(id),
      setParishPriestStatusDto.active,
      setParishPriestStatusDto.updatedBy,
    );
    return this.toResponseDto(parishPriest);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar una asignación de parroquia y sacerdote.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la asignación.',
    example: '1',
  })
  @ApiOkResponse({
    description: 'Asignación eliminada correctamente.',
    type: ParishPriestResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Asignación de parroquia y sacerdote no encontrada.',
  })
  async delete(@Param('id') id: string): Promise<ParishPriestResponseDto> {
    const parishPriest = await this.parishPriestsService.delete(
      this.parseBigInt(id),
    );
    return this.toResponseDto(parishPriest);
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

  private toResponseDto(parishPriest: ParishPriest): ParishPriestResponseDto {
    return {
      id: parishPriest.id.toString(),
      parishId: parishPriest.parishId.toString(),
      priestId: parishPriest.priestId.toString(),
      active: parishPriest.active,
      createdAt: parishPriest.createdAt,
      createdBy: parishPriest.createdBy,
      updatedAt: parishPriest.updatedAt,
      updatedBy: parishPriest.updatedBy,
    };
  }
}
