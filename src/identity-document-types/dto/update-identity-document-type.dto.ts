import { PartialType } from '@nestjs/swagger';
import { CreateIdentityDocumentTypeDto } from './create-identity-document-type.dto';

export class UpdateIdentityDocumentTypeDto extends PartialType(
  CreateIdentityDocumentTypeDto,
) {}
