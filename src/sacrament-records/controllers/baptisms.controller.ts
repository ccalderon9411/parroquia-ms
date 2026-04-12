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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAccessGuard } from '../../auth/guards/jwt-access.guard';
import { SacramentType } from '../../prisma/generated/client';
import { CreateBaptismRecordDto } from '../dto/baptisms/create-baptism-record.dto';
import { BulkImportResultDto } from '../dto/bulk/bulk-import-result.dto';
import { SacramentRecordResponseDto } from '../dto/response/sacrament-record-response.dto';
import { SetSacramentRecordStatusDto } from '../dto/shared/set-sacrament-record-status.dto';
import { UpdateBaptismRecordDto } from '../dto/baptisms/update-baptism-record.dto';
import { SacramentBulkImportService } from '../sacrament-bulk-import.service';
import { SacramentRecordsService } from '../sacrament-records.service';
import { SacramentRecordsControllerBase } from './sacrament-records-controller.base';

type UploadedExcelFile = {
  buffer: Buffer;
};

@ApiTags('Baptisms')
@ApiBearerAuth('access-token')
@UseGuards(JwtAccessGuard)
@Controller('baptisms')
export class BaptismsController extends SacramentRecordsControllerBase {
  constructor(
    sacramentRecordsService: SacramentRecordsService,
    private readonly bulkImportService: SacramentBulkImportService,
  ) {
    super(sacramentRecordsService);
  }

  @Get()
  @ApiOperation({ summary: 'Listar bautismos.' })
  @ApiOkResponse({ type: SacramentRecordResponseDto, isArray: true })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  async findAll(
    @Query('activeOnly') activeOnly?: string,
  ): Promise<SacramentRecordResponseDto[]> {
    const records = await this.sacramentRecordsService.findAll({
      type: SacramentType.BAPTISM,
      activeOnly: this.parseOptionalBoolean(activeOnly),
    });

    return records.map((record) => this.toResponseDto(record));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un bautismo por id.' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiOkResponse({ type: SacramentRecordResponseDto })
  @ApiNotFoundResponse({ description: 'Bautismo no encontrado.' })
  async findById(@Param('id') id: string): Promise<SacramentRecordResponseDto> {
    const record = await this.findByIdAndType(
      this.parseId(id),
      SacramentType.BAPTISM,
    );
    return this.toResponseDto(record);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un bautismo.' })
  @ApiBody({ type: CreateBaptismRecordDto })
  @ApiCreatedResponse({ type: SacramentRecordResponseDto })
  @ApiConflictResponse({
    description: 'Ya existe un bautismo con esa clave funcional.',
  })
  async create(
    @Body() dto: CreateBaptismRecordDto,
  ): Promise<SacramentRecordResponseDto> {
    const record = await this.sacramentRecordsService.create({
      type: SacramentType.BAPTISM,
      parishId: dto.parishId,
      priestId: dto.priestId,
      date: dto.date,
      place: dto.place,
      bookNumber: dto.bookNumber,
      folioNumber: dto.folioNumber,
      entryNumber: dto.entryNumber,
      active: dto.active,
      createdBy: dto.createdBy,
      baptismDetail: {
        personId: dto.personId,
        godfather: dto.godfather,
        godmother: dto.godmother,
      },
    });
    return this.toResponseDto(record);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un bautismo.' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiBody({ type: UpdateBaptismRecordDto })
  @ApiOkResponse({ type: SacramentRecordResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBaptismRecordDto,
  ): Promise<SacramentRecordResponseDto> {
    const parsedId = this.parseId(id);
    await this.findByIdAndType(parsedId, SacramentType.BAPTISM);
    const record = await this.sacramentRecordsService.update(parsedId, {
      parishId: dto.parishId,
      priestId: dto.priestId,
      date: dto.date,
      place: dto.place,
      bookNumber: dto.bookNumber,
      folioNumber: dto.folioNumber,
      entryNumber: dto.entryNumber,
      active: dto.active,
      updatedBy: dto.updatedBy,
      baptismDetail:
        dto.personId ||
        dto.godfather !== undefined ||
        dto.godmother !== undefined
          ? {
              personId: dto.personId,
              godfather: dto.godfather,
              godmother: dto.godmother,
            }
          : undefined,
    });
    return this.toResponseDto(record);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cambiar el estado activo de un bautismo.' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiBody({ type: SetSacramentRecordStatusDto })
  @ApiOkResponse({ type: SacramentRecordResponseDto })
  async setActive(
    @Param('id') id: string,
    @Body() dto: SetSacramentRecordStatusDto,
  ): Promise<SacramentRecordResponseDto> {
    const parsedId = this.parseId(id);
    await this.findByIdAndType(parsedId, SacramentType.BAPTISM);
    const record = await this.sacramentRecordsService.setActive(
      parsedId,
      dto.active,
      dto.updatedBy,
    );
    return this.toResponseDto(record);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un bautismo.' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiOkResponse({ type: SacramentRecordResponseDto })
  async delete(@Param('id') id: string): Promise<SacramentRecordResponseDto> {
    const parsedId = this.parseId(id);
    await this.findByIdAndType(parsedId, SacramentType.BAPTISM);
    const record = await this.sacramentRecordsService.delete(parsedId);
    return this.toResponseDto(record);
  }

  @Post('bulk-import')
  @ApiOperation({
    summary: 'Importar bautismos masivamente desde un archivo Excel.',
    description:
      'Carga un archivo .xlsx con una fila por bautismo. Las personas y sacerdotes ' +
      'se crean automáticamente si no existen; si el sacerdote ya existe se reutiliza.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        createdBy: { type: 'string', nullable: true },
      },
      required: ['file'],
    },
  })
  @ApiOkResponse({ type: BulkImportResultDto })
  @UseInterceptors(FileInterceptor('file'))
  async bulkImport(
    @UploadedFile() file?: UploadedExcelFile,
    @Body('createdBy') createdBy?: string,
  ): Promise<BulkImportResultDto> {
    if (!file?.buffer) {
      throw new BadRequestException('Debe adjuntarse un archivo Excel.');
    }

    return this.bulkImportService.importBaptisms(file.buffer, createdBy);
  }
}
