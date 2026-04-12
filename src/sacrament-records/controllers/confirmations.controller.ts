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
import { CreateConfirmationRecordDto } from '../dto/confirmations/create-confirmation-record.dto';
import { BulkImportResultDto } from '../dto/bulk/bulk-import-result.dto';
import { SacramentRecordResponseDto } from '../dto/response/sacrament-record-response.dto';
import { SetSacramentRecordStatusDto } from '../dto/shared/set-sacrament-record-status.dto';
import { UpdateConfirmationRecordDto } from '../dto/confirmations/update-confirmation-record.dto';
import { SacramentBulkImportService } from '../sacrament-bulk-import.service';
import { SacramentRecordsService } from '../sacrament-records.service';
import { SacramentRecordsControllerBase } from './sacrament-records-controller.base';

type UploadedExcelFile = {
  buffer: Buffer;
};

@ApiTags('Confirmations')
@ApiBearerAuth('access-token')
@UseGuards(JwtAccessGuard)
@Controller('confirmations')
export class ConfirmationsController extends SacramentRecordsControllerBase {
  constructor(
    sacramentRecordsService: SacramentRecordsService,
    private readonly bulkImportService: SacramentBulkImportService,
  ) {
    super(sacramentRecordsService);
  }

  @Get()
  @ApiOperation({ summary: 'Listar confirmaciones.' })
  @ApiOkResponse({ type: SacramentRecordResponseDto, isArray: true })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  async findAll(
    @Query('activeOnly') activeOnly?: string,
  ): Promise<SacramentRecordResponseDto[]> {
    const records = await this.sacramentRecordsService.findAll({
      type: SacramentType.CONFIRMATION,
      activeOnly: this.parseOptionalBoolean(activeOnly),
    });

    return records.map((record) => this.toResponseDto(record));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una confirmación por id.' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiOkResponse({ type: SacramentRecordResponseDto })
  @ApiNotFoundResponse({ description: 'Confirmación no encontrada.' })
  async findById(@Param('id') id: string): Promise<SacramentRecordResponseDto> {
    const record = await this.findByIdAndType(
      this.parseId(id),
      SacramentType.CONFIRMATION,
    );
    return this.toResponseDto(record);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una confirmación.' })
  @ApiBody({ type: CreateConfirmationRecordDto })
  @ApiCreatedResponse({ type: SacramentRecordResponseDto })
  @ApiConflictResponse({
    description: 'Ya existe una confirmación con esa clave funcional.',
  })
  async create(
    @Body() dto: CreateConfirmationRecordDto,
  ): Promise<SacramentRecordResponseDto> {
    const record = await this.sacramentRecordsService.create({
      type: SacramentType.CONFIRMATION,
      parishId: dto.parishId,
      priestId: dto.priestId,
      date: dto.date,
      place: dto.place,
      bookNumber: dto.bookNumber,
      folioNumber: dto.folioNumber,
      entryNumber: dto.entryNumber,
      active: dto.active,
      createdBy: dto.createdBy,
      confirmationDetail: {
        personId: dto.personId,
        godfather: dto.godfather,
        godmother: dto.godmother,
      },
    });
    return this.toResponseDto(record);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una confirmación.' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiBody({ type: UpdateConfirmationRecordDto })
  @ApiOkResponse({ type: SacramentRecordResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateConfirmationRecordDto,
  ): Promise<SacramentRecordResponseDto> {
    const parsedId = this.parseId(id);
    await this.findByIdAndType(parsedId, SacramentType.CONFIRMATION);
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
      confirmationDetail:
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
  @ApiOperation({ summary: 'Cambiar el estado activo de una confirmación.' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiBody({ type: SetSacramentRecordStatusDto })
  @ApiOkResponse({ type: SacramentRecordResponseDto })
  async setActive(
    @Param('id') id: string,
    @Body() dto: SetSacramentRecordStatusDto,
  ): Promise<SacramentRecordResponseDto> {
    const parsedId = this.parseId(id);
    await this.findByIdAndType(parsedId, SacramentType.CONFIRMATION);
    const record = await this.sacramentRecordsService.setActive(
      parsedId,
      dto.active,
      dto.updatedBy,
    );
    return this.toResponseDto(record);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una confirmación.' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiOkResponse({ type: SacramentRecordResponseDto })
  async delete(@Param('id') id: string): Promise<SacramentRecordResponseDto> {
    const parsedId = this.parseId(id);
    await this.findByIdAndType(parsedId, SacramentType.CONFIRMATION);
    const record = await this.sacramentRecordsService.delete(parsedId);
    return this.toResponseDto(record);
  }

  @Post('bulk-import')
  @ApiOperation({
    summary: 'Importar confirmaciones masivamente desde un archivo Excel.',
    description:
      'Carga un archivo .xlsx con una fila por confirmación. Las personas y sacerdotes ' +
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

    return this.bulkImportService.importConfirmations(file.buffer, createdBy);
  }
}
