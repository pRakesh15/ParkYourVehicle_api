import { InputType, OmitType, PickType } from '@nestjs/graphql'
import { Slots } from '../entity/slots.entity'

@InputType()
export class CreateSlotInput extends OmitType(
  Slots,
  ['createdAt', 'updatedAt', 'id'],
  InputType,
) {}

@InputType()
export class CreateSlotInputWithoutGarageId extends OmitType(
  CreateSlotInput,
  ['garageId'],
  InputType,
) {
  count: number
}
