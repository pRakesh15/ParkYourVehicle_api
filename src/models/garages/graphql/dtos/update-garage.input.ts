import { CreateGarageInput } from './create-garage.input'
import { InputType, PartialType } from '@nestjs/graphql'
import { Garages } from '@prisma/client'

@InputType()
export class UpdateGarageInput extends PartialType(CreateGarageInput) {
  id: Garages['id']
}
