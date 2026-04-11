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
import { Person } from '../prisma/generated/client';
import { CreatePersonDto } from './dto/create-person.dto';
import { PersonResponseDto } from './dto/person-response.dto';
import { SetPersonStatusDto } from './dto/set-person-status.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { PersonsService } from './persons.service';

@ApiTags('Persons')
@ApiBearerAuth('access-token')
@UseGuards(JwtAccessGuard)
@Controller('persons')
export class PersonsController {
  constructor(private readonly personsService: PersonsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las personas.' })
  @ApiOkResponse({
    description: 'Listado de personas.',
    type: PersonResponseDto,
    isArray: true,
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    description: 'Si es true, solo retorna personas activas.',
    example: true,
    type: Boolean,
  })
  @ApiBadRequestResponse({
    description: 'El parametro activeOnly debe ser true o false.',
  })
  async findAll(@Query('activeOnly') activeOnly?: string): Promise<PersonResponseDto[]> {
    const persons = await this.personsService.findAll(
      this.parseOptionalBoolean(activeOnly),
    );

    return persons.map((person) => this.toResponseDto(person));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una persona por id.' })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la persona.',
    example: '4d6c7d9e-4d7f-4ef5-a311-5f6f5b1f5d11',
  })
  @ApiOkResponse({
    description: 'Persona encontrada.',
    type: PersonResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Persona no encontrada.' })
  async findById(@Param('id') id: string): Promise<PersonResponseDto> {
    const person = await this.personsService.findByIdOrFail(id);
    return this.toResponseDto(person);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una persona.' })
  @ApiBody({ type: CreatePersonDto })
  @ApiCreatedResponse({
    description: 'Persona creada correctamente.',
    type: PersonResponseDto,
  })
  @ApiConflictResponse({
    description: 'Ya existe una persona con ese tipo y numero de documento.',
  })
  @ApiNotFoundResponse({ description: 'Tipo de documento no encontrado.' })
  async create(@Body() createPersonDto: CreatePersonDto): Promise<PersonResponseDto> {
    const person = await this.personsService.create({
      identityDocumentTypeId: this.parseBigInt(
        createPersonDto.identityDocumentTypeId,
      ),
      identityDocumentNumber: createPersonDto.identityDocumentNumber,
      givenNames: createPersonDto.givenNames,
      paternalSurname: createPersonDto.paternalSurname,
      maternalSurname: createPersonDto.maternalSurname,
      birthDate: this.parseOptionalDate(createPersonDto.birthDate),
      birthPlace: createPersonDto.birthPlace,
      father: createPersonDto.father,
      mother: createPersonDto.mother,
      active: createPersonDto.active,
      createdBy: createPersonDto.createdBy,
    });
    return this.toResponseDto(person);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una persona.' })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la persona.',
    example: '4d6c7d9e-4d7f-4ef5-a311-5f6f5b1f5d11',
  })
  @ApiBody({ type: UpdatePersonDto })
  @ApiOkResponse({
    description: 'Persona actualizada correctamente.',
    type: PersonResponseDto,
  })
  @ApiConflictResponse({
    description: 'Ya existe una persona con ese tipo y numero de documento.',
  })
  @ApiNotFoundResponse({
    description: 'Persona o tipo de documento no encontrado.',
  })
  async update(
    @Param('id') id: string,
    @Body() updatePersonDto: UpdatePersonDto,
  ): Promise<PersonResponseDto> {
    const person = await this.personsService.update(id, {
      identityDocumentTypeId:
        updatePersonDto.identityDocumentTypeId === undefined
          ? undefined
          : this.parseBigInt(updatePersonDto.identityDocumentTypeId),
      identityDocumentNumber: updatePersonDto.identityDocumentNumber,
      givenNames: updatePersonDto.givenNames,
      paternalSurname: updatePersonDto.paternalSurname,
      maternalSurname: updatePersonDto.maternalSurname,
      birthDate: this.parseOptionalDate(updatePersonDto.birthDate),
      birthPlace: updatePersonDto.birthPlace,
      father: updatePersonDto.father,
      mother: updatePersonDto.mother,
      active: updatePersonDto.active,
      updatedBy: updatePersonDto.updatedBy,
    });
    return this.toResponseDto(person);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Activar o desactivar una persona.' })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la persona.',
    example: '4d6c7d9e-4d7f-4ef5-a311-5f6f5b1f5d11',
  })
  @ApiBody({ type: SetPersonStatusDto })
  @ApiOkResponse({
    description: 'Estado de la persona actualizado correctamente.',
    type: PersonResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Persona no encontrada.' })
  async setActive(
    @Param('id') id: string,
    @Body() setPersonStatusDto: SetPersonStatusDto,
  ): Promise<PersonResponseDto> {
    const person = await this.personsService.setActive(
      id,
      setPersonStatusDto.active,
      setPersonStatusDto.updatedBy,
    );
    return this.toResponseDto(person);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una persona.' })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la persona.',
    example: '4d6c7d9e-4d7f-4ef5-a311-5f6f5b1f5d11',
  })
  @ApiOkResponse({
    description: 'Persona eliminada correctamente.',
    type: PersonResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Persona no encontrada.' })
  async delete(@Param('id') id: string): Promise<PersonResponseDto> {
    const person = await this.personsService.delete(id);
    return this.toResponseDto(person);
  }

  private parseBigInt(value: string): bigint {
    try {
      return BigInt(value);
    } catch {
      throw new BadRequestException('El identityDocumentTypeId debe ser un entero valido.');
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

  private parseOptionalDate(value?: string): Date | undefined {
    if (value === undefined) {
      return undefined;
    }

    return new Date(value);
  }

  private toResponseDto(person: Person): PersonResponseDto {
    return {
      id: person.id,
      identityDocumentTypeId: person.identityDocumentTypeId.toString(),
      identityDocumentNumber: person.identityDocumentNumber,
      givenNames: person.givenNames,
      paternalSurname: person.paternalSurname,
      maternalSurname: person.maternalSurname,
      birthDate: person.birthDate,
      birthPlace: person.birthPlace,
      father: person.father,
      mother: person.mother,
      active: person.active,
      createdAt: person.createdAt,
      createdBy: person.createdBy,
      updatedAt: person.updatedAt,
      updatedBy: person.updatedBy,
    };
  }
}