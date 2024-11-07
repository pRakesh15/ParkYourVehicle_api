import { Field, ObjectType } from '@nestjs/graphql'
import { $Enums, Bookings as BookingsType } from '@prisma/client'
import { RestrictProperties } from 'src/common/dtos/common.input'

@ObjectType()
export class Bookings implements RestrictProperties<Bookings,BookingsType> {
    @Field(() => $Enums.BookingStatus)
    status: $Enums.BookingStatus
    createdAt: Date
    updatedAt: Date
    id: number
    @Field({ nullable: true })
    pricePerHour: number
    @Field({ nullable: true })
    totalPrice: number
    startTime: Date
    endTime: Date
    vehicleNumber: string
    @Field({ nullable: true })
    phoneNumber: string
    @Field({ nullable: true })
    passcode: string
    slotId: number
    customerId: string

}
