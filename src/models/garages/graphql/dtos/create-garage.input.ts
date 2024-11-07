import { InputType, PickType } from '@nestjs/graphql'
import { Garages } from '../entity/garages.entity'
import { CreateAddressInputWithoutGarageId } from 'src/models/addresses/graphql/dtos/create-address.input'
import { CreateSlotInputWithoutGarageId } from 'src/models/slots/graphql/dtos/create-slot.input'

@InputType()
export class CreateGarageInput extends PickType(
  Garages,
  ['description', 'displayName', 'image'],
  InputType,
) {
  Address: CreateAddressInputWithoutGarageId
  Slots: CreateSlotInputWithoutGarageId[]
}
