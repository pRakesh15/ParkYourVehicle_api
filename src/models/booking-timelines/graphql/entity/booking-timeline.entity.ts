import { Field, ObjectType } from '@nestjs/graphql'
import { $Enums, BookingTimeline as BookingTimelineType } from '@prisma/client'
import { RestrictProperties } from 'src/common/dtos/common.input'

@ObjectType()
export class BookingTimeline implements RestrictProperties<BookingTimeline,BookingTimelineType> {
    @Field(() => $Enums.BookingStatus)
    status: $Enums.BookingStatus
    id: number
    bookingId: number
    timestamp: Date
    @Field({ nullable: true })
    valetId: string
    @Field({ nullable: true })
    managerId: string

}
