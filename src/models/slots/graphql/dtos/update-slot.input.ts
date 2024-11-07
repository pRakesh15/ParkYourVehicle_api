import { CreateSlotInput } from './create-slot.input'
import { InputType, PartialType } from '@nestjs/graphql'
import { Slots } from '@prisma/client'

@InputType()
export class UpdateSlotInput extends PartialType(CreateSlotInput) {
  id: Slots['id']
}
