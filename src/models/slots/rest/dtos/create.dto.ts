import { OmitType } from '@nestjs/swagger'
import { SlotsEntity } from '../entity/slots.entity'

export class CreateSlots extends OmitType(SlotsEntity, [
  'createdAt',
  'updatedAt',
  'id',
]) {}
