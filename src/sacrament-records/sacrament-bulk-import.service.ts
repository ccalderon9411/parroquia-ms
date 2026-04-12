import { BadRequestException, Injectable } from '@nestjs/common';
import { read, utils } from 'xlsx';
import { PersonsService } from '../persons/persons.service';
import { PriestsService } from '../priests/priests.service';
import { SacramentRecordSupportService } from './sacrament-record-support.service';
import { SacramentRecordsService } from './sacrament-records.service';
import {
  BulkImportResultDto,
  BulkImportRowErrorDto,
} from './dto/bulk/bulk-import-result.dto';
import type { PersonInBulkDto } from './dto/bulk/person-in-bulk.dto';
import type { PriestInBulkDto } from './dto/bulk/priest-in-bulk.dto';

@Injectable()
export class SacramentBulkImportService {
  constructor(
    private readonly personsService: PersonsService,
    private readonly priestsService: PriestsService,
    private readonly sacramentRecordsService: SacramentRecordsService,
    private readonly support: SacramentRecordSupportService,
  ) {}

  // ──────────────────────────────────────────────────────────────
  // Public entry points
  // ──────────────────────────────────────────────────────────────

  async importBaptisms(
    fileBuffer: Buffer,
    createdBy?: string,
  ): Promise<BulkImportResultDto> {
    const rows = this.parseExcel(fileBuffer);
    const errors: BulkImportRowErrorDto[] = [];
    let succeeded = 0;

    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 2; // Excel row = data row + header row
      try {
        const row = rows[i];
        this.requireBaptismColumns(row, rowNumber);

        const priestId = await this.findOrCreatePriest(
          this.extractPriestData(row),
          createdBy,
        );
        const personId = await this.findOrCreatePerson(
          this.extractPersonData(row),
          createdBy,
        );

        await this.sacramentRecordsService.create({
          type: 'BAPTISM',
          parishId: this.requireCellString(row, 'parishId'),
          priestId: String(priestId),
          date: this.requireCellString(row, 'date'),
          place: this.requireCellString(row, 'place'),
          bookNumber: this.requireCellString(row, 'bookNumber'),
          folioNumber: this.requireCellString(row, 'folioNumber'),
          entryNumber: this.requireCellString(row, 'entryNumber'),
          active: true,
          createdBy,
          baptismDetail: {
            personId,
            godfather: this.optionalCellString(row, 'godfather'),
            godmother: this.optionalCellString(row, 'godmother'),
          },
        });

        succeeded++;
      } catch (err) {
        errors.push({ row: rowNumber, message: this.extractMessage(err) });
      }
    }

    return { total: rows.length, succeeded, failed: errors.length, errors };
  }

  async importConfirmations(
    fileBuffer: Buffer,
    createdBy?: string,
  ): Promise<BulkImportResultDto> {
    const rows = this.parseExcel(fileBuffer);
    const errors: BulkImportRowErrorDto[] = [];
    let succeeded = 0;

    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 2;
      try {
        const row = rows[i];
        this.requireConfirmationColumns(row, rowNumber);

        const priestId = await this.findOrCreatePriest(
          this.extractPriestData(row),
          createdBy,
        );
        const personId = await this.findOrCreatePerson(
          this.extractPersonData(row),
          createdBy,
        );

        await this.sacramentRecordsService.create({
          type: 'CONFIRMATION',
          parishId: this.requireCellString(row, 'parishId'),
          priestId: String(priestId),
          date: this.requireCellString(row, 'date'),
          place: this.requireCellString(row, 'place'),
          bookNumber: this.requireCellString(row, 'bookNumber'),
          folioNumber: this.requireCellString(row, 'folioNumber'),
          entryNumber: this.requireCellString(row, 'entryNumber'),
          active: true,
          createdBy,
          confirmationDetail: {
            personId,
            godfather: this.optionalCellString(row, 'godfather'),
            godmother: this.optionalCellString(row, 'godmother'),
          },
        });

        succeeded++;
      } catch (err) {
        errors.push({ row: rowNumber, message: this.extractMessage(err) });
      }
    }

    return { total: rows.length, succeeded, failed: errors.length, errors };
  }

  async importMarriages(
    fileBuffer: Buffer,
    createdBy?: string,
  ): Promise<BulkImportResultDto> {
    const rows = this.parseExcel(fileBuffer);
    const errors: BulkImportRowErrorDto[] = [];
    let succeeded = 0;

    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 2;
      try {
        const row = rows[i];
        this.requireMarriageColumns(row, rowNumber);

        const priestId = await this.findOrCreatePriest(
          this.extractPriestData(row),
          createdBy,
        );
        const groomId = await this.findOrCreatePerson(
          this.extractGroomData(row),
          createdBy,
        );
        const brideId = await this.findOrCreatePerson(
          this.extractBrideData(row),
          createdBy,
        );

        await this.sacramentRecordsService.create({
          type: 'MARRIAGE',
          parishId: this.requireCellString(row, 'parishId'),
          priestId: String(priestId),
          date: this.requireCellString(row, 'date'),
          place: this.requireCellString(row, 'place'),
          bookNumber: this.requireCellString(row, 'bookNumber'),
          folioNumber: this.requireCellString(row, 'folioNumber'),
          entryNumber: this.requireCellString(row, 'entryNumber'),
          active: true,
          createdBy,
          marriageDetail: {
            groomId,
            groomBaptismDate: this.requireCellString(row, 'groomBaptismDate'),
            groomBaptismPlace: this.requireCellString(row, 'groomBaptismPlace'),
            brideId,
            brideBaptismDate: this.requireCellString(row, 'brideBaptismDate'),
            brideBaptismPlace: this.requireCellString(row, 'brideBaptismPlace'),
            witness1: this.requireCellString(row, 'witness1'),
            witness2: this.requireCellString(row, 'witness2'),
          },
        });

        succeeded++;
      } catch (err) {
        errors.push({ row: rowNumber, message: this.extractMessage(err) });
      }
    }

    return { total: rows.length, succeeded, failed: errors.length, errors };
  }

  // ──────────────────────────────────────────────────────────────
  // Find-or-create helpers
  // ──────────────────────────────────────────────────────────────

  /**
   * Busca el sacerdote por tipo + número de documento.
   * - Si la persona existe y ya es sacerdote → retorna el priestId existente.
   * - Si la persona existe pero no es sacerdote → crea el registro de sacerdote.
   * - Si la persona no existe → crea persona + sacerdote.
   */
  private async findOrCreatePriest(
    data: PriestInBulkDto,
    createdBy?: string,
  ): Promise<string> {
    const docTypeId = BigInt(data.docTypeId);

    const existingPerson = await this.personsService.findByDocument(
      docTypeId,
      data.docNumber,
    );

    if (existingPerson) {
      const existingPriest = await this.priestsService.findByPersonId(
        existingPerson.id,
      );
      if (existingPriest) {
        return String(existingPriest.id);
      }
      // Persona existe pero no es sacerdote → crear solo el sacerdote
      const newPriest = await this.priestsService.create({
        personId: existingPerson.id,
        createdBy,
      });
      return String(newPriest.id);
    }

    // Persona nueva → crear persona y luego sacerdote
    const newPerson = await this.personsService.create({
      identityDocumentTypeId: docTypeId,
      identityDocumentNumber: data.docNumber,
      givenNames: data.givenNames,
      paternalSurname: data.paternalSurname,
      maternalSurname: data.maternalSurname,
      createdBy,
    });
    const newPriest = await this.priestsService.create({
      personId: newPerson.id,
      createdBy,
    });
    return String(newPriest.id);
  }

  /**
   * Busca la persona por tipo + número de documento.
   * - Si existe → retorna su id (puede que ya haya sido registrada antes).
   * - Si no existe → crea la persona y retorna su id.
   */
  private async findOrCreatePerson(
    data: PersonInBulkDto,
    createdBy?: string,
  ): Promise<string> {
    const docTypeId = BigInt(data.docTypeId);

    const existing = await this.personsService.findByDocument(
      docTypeId,
      data.docNumber,
    );
    if (existing) {
      return existing.id;
    }

    const newPerson = await this.personsService.create({
      identityDocumentTypeId: docTypeId,
      identityDocumentNumber: data.docNumber,
      givenNames: data.givenNames,
      paternalSurname: data.paternalSurname,
      maternalSurname: data.maternalSurname,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      birthPlace: data.birthPlace,
      father: data.father,
      mother: data.mother,
      createdBy,
    });
    return newPerson.id;
  }

  // ──────────────────────────────────────────────────────────────
  // Excel parsing
  // ──────────────────────────────────────────────────────────────

  private parseExcel(buffer: Buffer): Record<string, unknown>[] {
    const workbook = read(buffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new BadRequestException('El archivo Excel no contiene hojas.');
    }
    const sheet = workbook.Sheets[sheetName];
    const rows = utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: null,
    });
    if (rows.length === 0) {
      throw new BadRequestException('El archivo Excel no contiene datos.');
    }
    return rows;
  }

  // ──────────────────────────────────────────────────────────────
  // Column extractors
  // ──────────────────────────────────────────────────────────────

  private extractPriestData(row: Record<string, unknown>): PriestInBulkDto {
    return {
      docTypeId: this.requireCellString(row, 'priestDocTypeId'),
      docNumber: this.requireCellString(row, 'priestDocNumber'),
      givenNames: this.requireCellString(row, 'priestGivenNames'),
      paternalSurname: this.requireCellString(row, 'priestPaternalSurname'),
      maternalSurname: this.requireCellString(row, 'priestMaternalSurname'),
    };
  }

  private extractPersonData(row: Record<string, unknown>): PersonInBulkDto {
    return {
      docTypeId: this.requireCellString(row, 'personDocTypeId'),
      docNumber: this.requireCellString(row, 'personDocNumber'),
      givenNames: this.requireCellString(row, 'personGivenNames'),
      paternalSurname: this.requireCellString(row, 'personPaternalSurname'),
      maternalSurname: this.requireCellString(row, 'personMaternalSurname'),
      birthDate: this.optionalCellDate(row, 'personBirthDate'),
      birthPlace: this.optionalCellString(row, 'personBirthPlace'),
      father: this.optionalCellString(row, 'personFather'),
      mother: this.optionalCellString(row, 'personMother'),
    };
  }

  private extractGroomData(row: Record<string, unknown>): PersonInBulkDto {
    return {
      docTypeId: this.requireCellString(row, 'groomDocTypeId'),
      docNumber: this.requireCellString(row, 'groomDocNumber'),
      givenNames: this.requireCellString(row, 'groomGivenNames'),
      paternalSurname: this.requireCellString(row, 'groomPaternalSurname'),
      maternalSurname: this.requireCellString(row, 'groomMaternalSurname'),
      birthDate: this.optionalCellDate(row, 'groomBirthDate'),
      birthPlace: this.optionalCellString(row, 'groomBirthPlace'),
      father: this.optionalCellString(row, 'groomFather'),
      mother: this.optionalCellString(row, 'groomMother'),
    };
  }

  private extractBrideData(row: Record<string, unknown>): PersonInBulkDto {
    return {
      docTypeId: this.requireCellString(row, 'brideDocTypeId'),
      docNumber: this.requireCellString(row, 'brideDocNumber'),
      givenNames: this.requireCellString(row, 'brideGivenNames'),
      paternalSurname: this.requireCellString(row, 'bridePaternalSurname'),
      maternalSurname: this.requireCellString(row, 'brideMaternalSurname'),
      birthDate: this.optionalCellDate(row, 'brideBirthDate'),
      birthPlace: this.optionalCellString(row, 'brideBirthPlace'),
      father: this.optionalCellString(row, 'brideFather'),
      mother: this.optionalCellString(row, 'brideMother'),
    };
  }

  // ──────────────────────────────────────────────────────────────
  // Validators (required column checks)
  // ──────────────────────────────────────────────────────────────

  private readonly COMMON_REQUIRED = [
    'parishId',
    'date',
    'place',
    'bookNumber',
    'folioNumber',
    'entryNumber',
    'priestDocTypeId',
    'priestDocNumber',
    'priestGivenNames',
    'priestPaternalSurname',
    'priestMaternalSurname',
  ] as const;

  private readonly PERSON_REQUIRED = [
    'personDocTypeId',
    'personDocNumber',
    'personGivenNames',
    'personPaternalSurname',
    'personMaternalSurname',
  ] as const;

  private requireBaptismColumns(
    row: Record<string, unknown>,
    rowNumber: number,
  ): void {
    this.requireColumns(row, rowNumber, [
      ...this.COMMON_REQUIRED,
      ...this.PERSON_REQUIRED,
    ]);
  }

  private requireConfirmationColumns(
    row: Record<string, unknown>,
    rowNumber: number,
  ): void {
    this.requireBaptismColumns(row, rowNumber);
  }

  private requireMarriageColumns(
    row: Record<string, unknown>,
    rowNumber: number,
  ): void {
    this.requireColumns(row, rowNumber, [
      ...this.COMMON_REQUIRED,
      'groomDocTypeId',
      'groomDocNumber',
      'groomGivenNames',
      'groomPaternalSurname',
      'groomMaternalSurname',
      'groomBaptismDate',
      'groomBaptismPlace',
      'brideDocTypeId',
      'brideDocNumber',
      'brideGivenNames',
      'bridePaternalSurname',
      'brideMaternalSurname',
      'brideBaptismDate',
      'brideBaptismPlace',
      'witness1',
      'witness2',
    ]);
  }

  private requireColumns(
    row: Record<string, unknown>,
    rowNumber: number,
    columns: readonly string[],
  ): void {
    const missing = columns.filter((col) => {
      const value = row[col];
      return value == null || this.normalizeCellValue(value).trim() === '';
    });
    if (missing.length > 0) {
      throw new BadRequestException(
        `Fila ${rowNumber}: columnas requeridas faltantes: ${missing.join(', ')}.`,
      );
    }
  }

  // ──────────────────────────────────────────────────────────────
  // Utilities
  // ──────────────────────────────────────────────────────────────

  private excelDateToIso(value: unknown): string | undefined {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'number') {
      // xlsx serial date number → JS Date
      const date = new Date(Math.round((value - 25569) * 86400 * 1000));
      return date.toISOString();
    }
    if (typeof value === 'string' && value.trim()) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) return date.toISOString();
    }
    return undefined;
  }

  private requireCellString(
    row: Record<string, unknown>,
    column: string,
  ): string {
    const value = row[column];
    if (value == null) {
      throw new BadRequestException(`La columna ${column} es obligatoria.`);
    }

    return this.normalizeCellValue(value);
  }

  private optionalCellString(
    row: Record<string, unknown>,
    column: string,
  ): string | undefined {
    const value = row[column];
    if (value == null) {
      return undefined;
    }

    const normalized = this.normalizeCellValue(value).trim();
    return normalized === '' ? undefined : normalized;
  }

  private optionalCellDate(
    row: Record<string, unknown>,
    column: string,
  ): string | undefined {
    const value = row[column];
    if (value == null) {
      return undefined;
    }

    return this.excelDateToIso(value);
  }

  private normalizeCellValue(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return `${value}`;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    throw new BadRequestException(
      'El archivo contiene un valor de celda no válido.',
    );
  }

  private extractMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return String(err);
  }
}
