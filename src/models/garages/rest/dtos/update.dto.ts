import { PartialType } from '@nestjs/swagger'
import { CreateGarages } from './create.dto'
import { Garages } from '@prisma/client'

export class UpdateGarages extends PartialType(CreateGarages) {
  id: Garages['id']
}

