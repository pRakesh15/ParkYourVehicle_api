import { Field, Float, InputType, OmitType, PickType } from '@nestjs/graphql'
import { Bookings } from '../entity/bookings.entity'
import { Garages, SlotType } from '@prisma/client'
import { CreateValetAssignmentInputWithoutBookingId } from 'src/models/valet-assignments/graphql/dtos/create-valet-assignment.input'

@InputType()
export class CreateBookingInput extends PickType(
  Bookings,
  ['customerId', 'endTime', 'startTime', 'vehicleNumber', 'phoneNumber'],
  InputType,
) {
  garageId: Garages['id']
  @Field(() => SlotType)
  type: SlotType

  @Field(() => Float)
  pricePerHour?: number
  @Field(() => Float)
  totalPrice?: number

  valetAssignment?: CreateValetAssignmentInputWithoutBookingId
}
