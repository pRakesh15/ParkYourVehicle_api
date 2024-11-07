import { PartialType } from '@nestjs/swagger'
import { CreateSlots } from './create.dto'
import { Slots } from '@prisma/client'

export class UpdateSlots extends PartialType(CreateSlots) {
  id: Slots['id']
}

