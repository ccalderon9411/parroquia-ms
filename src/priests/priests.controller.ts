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
import { CreatePriestDto } from './dto/create-priest.dto';
import { PriestResponseDto } from './dto/priest-response.dto';
import { SetPriestStatusDto } from './dto/set-priest-status.dto';
import { UpdatePriestDto } from './dto/update-priest.dto';
import { PriestWithPerson } from './priest.repository';
import { PriestsService } from './priests.service';

@ApiTags('Priests')
@ApiBearerAuth('access-token')
@UseGuards(JwtAccessGuard)
@Controller('priests')
export class PriestsController {
  constructor(private readonly priestsService: PriestsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los sacerdotes.' })
  @ApiOkResponse({
    description: 'Listado de sacerdotes.',
    type: PriestResponseDto,
    isArray: true,
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    description: 'Si es true, solo retorna sacerdotes activos.',
    example: true,
    type: Boolean,
  })
  @ApiBadRequestResponse({
    description: 'El parametro activeOnly debe ser true o false.',
  })
  async findAll(
    @Query('activeOnly') activeOnly?: string,
  ): Promise<PriestResponseDto[]> {
    const priests = await this.priestsService.findAll(
      this.parseOptionalBoolean(activeOnly),
    );

    return priests.map((priest) => this.toResponseDto(priest));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un sacerdote por id.' })
  @ApiParam({
    name: 'id',
    description: 'Identificador del sacerdote.',
    example: '1',
  })
  @ApiOkResponse({
    description: 'Sacerdote encontrado.',
    type: PriestResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Sacerdote no encontrado.' })
  async findById(@Param('id') id: string): Promise<PriestResponseDto> {
    const priest = await this.priestsService.findByIdOrFail(
      this.parseBigInt(id),
    );
    return this.toResponseDto(priest);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un sacerdote.' })
  @ApiBody({ type: CreatePriestDto })
  @ApiCreatedResponse({
    description: 'Sacerdote creado correctamente.',
    type: PriestResponseDto,
  })
  @ApiConflictResponse({
    description: 'Ya existe un sacerdote para esa persona.',
  })
  @ApiNotFoundResponse({ description: 'Persona no encontrada.' })
  async create(
    @Body() createPriestDto: CreatePriestDto,
  ): Promise<PriestResponseDto> {
    const priest = await this.priestsService.create({
      personId: createPriestDto.personId,
      active: createPriestDto.active,
      createdBy: createPriestDto.createdBy,
    });
    return this.toResponseDto(priest);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un sacerdote.' })
  @ApiParam({
    name: 'id',
    description: 'Identificador del sacerdote.',
    example: '1',
  })
  @ApiBody({ type: UpdatePriestDto })
  @ApiOkResponse({
    description: 'Sacerdote actualizado correctamente.',
    type: PriestResponseDto,
  })
  @ApiConflictResponse({
    description: 'Ya existe un sacerdote para esa persona.',
  })
  @ApiNotFoundResponse({ description: 'Sacerdote o persona no encontrada.' })
  async update(
    @Param('id') id: string,
    @Body() updatePriestDto: UpdatePriestDto,
  ): Promise<PriestResponseDto> {
    const priest = await this.priestsService.update(this.parseBigInt(id), {
      personId: updatePriestDto.personId,
      active: updatePriestDto.active,
      updatedBy: updatePriestDto.updatedBy,
    });
    return this.toResponseDto(priest);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Activar o desactivar un sacerdote.' })
  @ApiParam({
    name: 'id',
    description: 'Identificador del sacerdote.',
    example: '1',
  })
  @ApiBody({ type: SetPriestStatusDto })
  @ApiOkResponse({
    description: 'Estado del sacerdote actualizado correctamente.',
    type: PriestResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Sacerdote no encontrado.' })
  async setActive(
    @Param('id') id: string,
    @Body() setPriestStatusDto: SetPriestStatusDto,
  ): Promise<PriestResponseDto> {
    const priest = await this.priestsService.setActive(
      this.parseBigInt(id),
      setPriestStatusDto.active,
      setPriestStatusDto.updatedBy,
    );
    return this.toResponseDto(priest);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un sacerdote.' })
  @ApiParam({
    name: 'id',
    description: 'Identificador del sacerdote.',
    example: '1',
  })
  @ApiOkResponse({
    description: 'Sacerdote eliminado correctamente.',
    type: PriestResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Sacerdote no encontrado.' })
  async delete(@Param('id') id: string): Promise<PriestResponseDto> {
    const priest = await this.priestsService.delete(this.parseBigInt(id));
    return this.toResponseDto(priest);
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

  private toResponseDto(priest: PriestWithPerson): PriestResponseDto {
    return {
      id: priest.id.toString(),
      personId: priest.personId,
      active: priest.active,
      createdAt: priest.createdAt,
      person: {
        id: priest.person.id,
        identityDocumentTypeId: priest.person.identityDocumentTypeId.toString(),
        identityDocumentNumber: priest.person.identityDocumentNumber,
        givenNames: priest.person.givenNames,
        paternalSurname: priest.person.paternalSurname,
        maternalSurname: priest.person.maternalSurname,
        birthDate: priest.person.birthDate,
        birthPlace: priest.person.birthPlace,
        father: priest.person.father,
        mother: priest.person.mother,
        active: priest.person.active,
        createdAt: priest.person.createdAt,
        createdBy: priest.person.createdBy,
        updatedAt: priest.person.updatedAt,
        updatedBy: priest.person.updatedBy,
      },
      createdBy: priest.createdBy,
      updatedAt: priest.updatedAt,
      updatedBy: priest.updatedBy,
    };
  }
}
