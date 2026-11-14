import { PartialType } from '@nestjs/mapped-types';
import { CreatePayloadDto } from './create-payload.dto';

export class UpdatePayloadDto extends PartialType(CreatePayloadDto) {}
