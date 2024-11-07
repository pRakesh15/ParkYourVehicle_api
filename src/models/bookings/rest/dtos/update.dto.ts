import { PartialType } from '@nestjs/swagger'
import { CreateBookings } from './create.dto'
import { Bookings } from '@prisma/client'

export class UpdateBookings extends PartialType(CreateBookings) {
  id: Bookings['id']
}

