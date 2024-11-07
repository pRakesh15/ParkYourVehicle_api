import { CreateBookingInput } from './create-booking.input'
import { InputType, PartialType } from '@nestjs/graphql'
import { Bookings } from '@prisma/client'

@InputType()
export class UpdateBookingInput extends PartialType(CreateBookingInput) {
  id: Bookings['id']
}
