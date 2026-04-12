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
  ApiProperty,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { IdentityDocumentType } from '../prisma/generated/client';
import { CreateIdentityDocumentTypeDto } from './dto/create-identity-document-type.dto';
import { IdentityDocumentTypeResponseDto } from './dto/identity-document-type-response.dto';
import { UpdateIdentityDocumentTypeDto } from './dto/update-identity-document-type.dto';
import { IdentityDocumentTypesService } from './identity-document-types.service';

class SetIdentityDocumentTypeStatusDto {
  @ApiProperty({
    description: 'Indica si el tipo de documento debe quedar activo.',
    example: false,
  })
  @IsBoolean()
  active!: boolean;
}

@ApiTags('Identity Document Types')
@ApiBearerAuth('access-token')
@UseGuards(JwtAccessGuard)
@Controller('identity-document-types')
export class IdentityDocumentTypesController {
  constructor(
    private readonly identityDocumentTypesService: IdentityDocumentTypesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los tipos de documento.' })
  @ApiOkResponse({
    description: 'Listado de tipos de documento.',
    type: IdentityDocumentTypeResponseDto,
    isArray: true,
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    description: 'Si es true, solo retorna los registros activos.',
    example: true,
    type: Boolean,
  })
  @ApiBadRequestResponse({
    description: 'El parametro activeOnly debe ser true o false.',
  })
  async findAll(
    @Query('activeOnly') activeOnly?: string,
  ): Promise<IdentityDocumentTypeResponseDto[]> {
    const identityDocumentTypes =
      await this.identityDocumentTypesService.findAll(
        this.parseOptionalBoolean(activeOnly),
      );
    return identityDocumentTypes.map((identityDocumentType) =>
      this.toResponseDto(identityDocumentType),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de documento por id.' })
  @ApiParam({
    name: 'id',
    description: 'Identificador del tipo de documento.',
    example: '1',
  })
  @ApiOkResponse({
    description: 'Tipo de documento encontrado.',
    type: IdentityDocumentTypeResponseDto,
  })
  @ApiBadRequestResponse({ description: 'El id no tiene un formato valido.' })
  @ApiNotFoundResponse({ description: 'Tipo de documento no encontrado.' })
  async findById(
    @Param('id') id: string,
  ): Promise<IdentityDocumentTypeResponseDto> {
    const identityDocumentType =
      await this.identityDocumentTypesService.findByIdOrFail(this.parseId(id));
    return this.toResponseDto(identityDocumentType);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un tipo de documento.' })
  @ApiBody({ type: CreateIdentityDocumentTypeDto })
  @ApiCreatedResponse({
    description: 'Tipo de documento creado correctamente.',
    type: IdentityDocumentTypeResponseDto,
  })
  @ApiConflictResponse({ description: 'La abreviatura ya existe.' })
  async create(
    @Body() createIdentityDocumentTypeDto: CreateIdentityDocumentTypeDto,
  ): Promise<IdentityDocumentTypeResponseDto> {
    const identityDocumentType = await this.identityDocumentTypesService.create(
      {
        abbreviation: createIdentityDocumentTypeDto.abbreviation,
        description: createIdentityDocumentTypeDto.description,
        active: createIdentityDocumentTypeDto.active,
      },
    );
    return this.toResponseDto(identityDocumentType);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tipo de documento.' })
  @ApiParam({
    name: 'id',
    description: 'Identificador del tipo de documento.',
    example: '1',
  })
  @ApiBody({ type: UpdateIdentityDocumentTypeDto })
  @ApiOkResponse({
    description: 'Tipo de documento actualizado correctamente.',
    type: IdentityDocumentTypeResponseDto,
  })
  @ApiBadRequestResponse({ description: 'El id no tiene un formato valido.' })
  @ApiConflictResponse({ description: 'La abreviatura ya existe.' })
  @ApiNotFoundResponse({ description: 'Tipo de documento no encontrado.' })
  async update(
    @Param('id') id: string,
    @Body() updateIdentityDocumentTypeDto: UpdateIdentityDocumentTypeDto,
  ): Promise<IdentityDocumentTypeResponseDto> {
    const identityDocumentType = await this.identityDocumentTypesService.update(
      this.parseId(id),
      updateIdentityDocumentTypeDto,
    );
    return this.toResponseDto(identityDocumentType);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Activar o desactivar un tipo de documento.' })
  @ApiParam({
    name: 'id',
    description: 'Identificador del tipo de documento.',
    example: '1',
  })
  @ApiBody({ type: SetIdentityDocumentTypeStatusDto })
  @ApiOkResponse({
    description: 'Estado del tipo de documento actualizado correctamente.',
    type: IdentityDocumentTypeResponseDto,
  })
  @ApiBadRequestResponse({ description: 'El id no tiene un formato valido.' })
  @ApiNotFoundResponse({ description: 'Tipo de documento no encontrado.' })
  async setActive(
    @Param('id') id: string,
    @Body() setIdentityDocumentTypeStatusDto: SetIdentityDocumentTypeStatusDto,
  ): Promise<IdentityDocumentTypeResponseDto> {
    const identityDocumentType =
      await this.identityDocumentTypesService.setActive(
        this.parseId(id),
        setIdentityDocumentTypeStatusDto.active,
      );
    return this.toResponseDto(identityDocumentType);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un tipo de documento.' })
  @ApiParam({
    name: 'id',
    description: 'Identificador del tipo de documento.',
    example: '1',
  })
  @ApiOkResponse({
    description: 'Tipo de documento eliminado correctamente.',
    type: IdentityDocumentTypeResponseDto,
  })
  @ApiBadRequestResponse({ description: 'El id no tiene un formato valido.' })
  @ApiNotFoundResponse({ description: 'Tipo de documento no encontrado.' })
  async delete(
    @Param('id') id: string,
  ): Promise<IdentityDocumentTypeResponseDto> {
    const identityDocumentType = await this.identityDocumentTypesService.delete(
      this.parseId(id),
    );
    return this.toResponseDto(identityDocumentType);
  }

  private parseId(id: string): bigint {
    try {
      return BigInt(id);
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

  private toResponseDto(
    identityDocumentType: IdentityDocumentType,
  ): IdentityDocumentTypeResponseDto {
    return {
      id: identityDocumentType.id.toString(),
      abbreviation: identityDocumentType.abbreviation,
      description: identityDocumentType.description,
      active: identityDocumentType.active,
      createdAt: identityDocumentType.createdAt,
      createdBy: identityDocumentType.createdBy,
      updatedAt: identityDocumentType.updatedAt,
      updatedBy: identityDocumentType.updatedBy,
    };
  }
}
