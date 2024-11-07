import { OmitType } from '@nestjs/swagger'
import { BookingsEntity } from '../entity/bookings.entity'

export class CreateBookings extends OmitType(BookingsEntity, [
  'createdAt',
  'updatedAt',
  'id',
]) {}
