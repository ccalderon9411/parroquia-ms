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
import { CreateMarriageRecordDto } from '../dto/marriages/create-marriage-record.dto';
import { BulkImportResultDto } from '../dto/bulk/bulk-import-result.dto';
import { SacramentRecordResponseDto } from '../dto/response/sacrament-record-response.dto';
import { SetSacramentRecordStatusDto } from '../dto/shared/set-sacrament-record-status.dto';
import { UpdateMarriageRecordDto } from '../dto/marriages/update-marriage-record.dto';
import { SacramentBulkImportService } from '../sacrament-bulk-import.service';
import { SacramentRecordsService } from '../sacrament-records.service';
import { SacramentRecordsControllerBase } from './sacrament-records-controller.base';

type UploadedExcelFile = {
  buffer: Buffer;
};

@ApiTags('Marriages')
@ApiBearerAuth('access-token')
@UseGuards(JwtAccessGuard)
@Controller('marriages')
export class MarriagesController extends SacramentRecordsControllerBase {
  constructor(
    sacramentRecordsService: SacramentRecordsService,
    private readonly bulkImportService: SacramentBulkImportService,
  ) {
    super(sacramentRecordsService);
  }

  @Get()
  @ApiOperation({ summary: 'Listar matrimonios.' })
  @ApiOkResponse({ type: SacramentRecordResponseDto, isArray: true })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  async findAll(
    @Query('activeOnly') activeOnly?: string,
  ): Promise<SacramentRecordResponseDto[]> {
    const records = await this.sacramentRecordsService.findAll({
      type: SacramentType.MARRIAGE,
      activeOnly: this.parseOptionalBoolean(activeOnly),
    });

    return records.map((record) => this.toResponseDto(record));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un matrimonio por id.' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiOkResponse({ type: SacramentRecordResponseDto })
  @ApiNotFoundResponse({ description: 'Matrimonio no encontrado.' })
  async findById(@Param('id') id: string): Promise<SacramentRecordResponseDto> {
    const record = await this.findByIdAndType(
      this.parseId(id),
      SacramentType.MARRIAGE,
    );
    return this.toResponseDto(record);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un matrimonio.' })
  @ApiBody({ type: CreateMarriageRecordDto })
  @ApiCreatedResponse({ type: SacramentRecordResponseDto })
  @ApiConflictResponse({
    description: 'Ya existe un matrimonio con esa clave funcional.',
  })
  async create(
    @Body() dto: CreateMarriageRecordDto,
  ): Promise<SacramentRecordResponseDto> {
    const record = await this.sacramentRecordsService.create({
      type: SacramentType.MARRIAGE,
      parishId: dto.parishId,
      priestId: dto.priestId,
      date: dto.date,
      place: dto.place,
      bookNumber: dto.bookNumber,
      folioNumber: dto.folioNumber,
      entryNumber: dto.entryNumber,
      active: dto.active,
      createdBy: dto.createdBy,
      marriageDetail: {
        groomId: dto.groomId,
        groomBaptismDate: dto.groomBaptismDate,
        groomBaptismPlace: dto.groomBaptismPlace,
        brideId: dto.brideId,
        brideBaptismDate: dto.brideBaptismDate,
        brideBaptismPlace: dto.brideBaptismPlace,
        witness1: dto.witness1,
        witness2: dto.witness2,
      },
    });
    return this.toResponseDto(record);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un matrimonio.' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiBody({ type: UpdateMarriageRecordDto })
  @ApiOkResponse({ type: SacramentRecordResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMarriageRecordDto,
  ): Promise<SacramentRecordResponseDto> {
    const parsedId = this.parseId(id);
    await this.findByIdAndType(parsedId, SacramentType.MARRIAGE);
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
      marriageDetail:
        dto.groomId ||
        dto.groomBaptismDate !== undefined ||
        dto.groomBaptismPlace !== undefined ||
        dto.brideId ||
        dto.brideBaptismDate !== undefined ||
        dto.brideBaptismPlace !== undefined ||
        dto.witness1 !== undefined ||
        dto.witness2 !== undefined
          ? {
              groomId: dto.groomId,
              groomBaptismDate: dto.groomBaptismDate,
              groomBaptismPlace: dto.groomBaptismPlace,
              brideId: dto.brideId,
              brideBaptismDate: dto.brideBaptismDate,
              brideBaptismPlace: dto.brideBaptismPlace,
              witness1: dto.witness1,
              witness2: dto.witness2,
            }
          : undefined,
    });
    return this.toResponseDto(record);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cambiar el estado activo de un matrimonio.' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiBody({ type: SetSacramentRecordStatusDto })
  @ApiOkResponse({ type: SacramentRecordResponseDto })
  async setActive(
    @Param('id') id: string,
    @Body() dto: SetSacramentRecordStatusDto,
  ): Promise<SacramentRecordResponseDto> {
    const parsedId = this.parseId(id);
    await this.findByIdAndType(parsedId, SacramentType.MARRIAGE);
    const record = await this.sacramentRecordsService.setActive(
      parsedId,
      dto.active,
      dto.updatedBy,
    );
    return this.toResponseDto(record);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un matrimonio.' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiOkResponse({ type: SacramentRecordResponseDto })
  async delete(@Param('id') id: string): Promise<SacramentRecordResponseDto> {
    const parsedId = this.parseId(id);
    await this.findByIdAndType(parsedId, SacramentType.MARRIAGE);
    const record = await this.sacramentRecordsService.delete(parsedId);
    return this.toResponseDto(record);
  }

  @Post('bulk-import')
  @ApiOperation({
    summary: 'Importar matrimonios masivamente desde un archivo Excel.',
    description:
      'Carga un archivo .xlsx con una fila por matrimonio. Las personas y sacerdotes ' +
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

    return this.bulkImportService.importMarriages(file.buffer, createdBy);
  }
}
