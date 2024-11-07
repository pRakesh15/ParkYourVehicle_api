import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql'
import { BookingsService } from './bookings.service'
import { Bookings } from './entity/bookings.entity'
import { checkRowLevelPermission } from 'src/common/auth/util'
import { GetUserType } from 'src/common/types'
import { AllowAuthenticated, GetUser } from 'src/common/auth/auth.decorator'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { CreateBookingInput } from './dtos/create-booking.input'
import { FindManyBookingArgs, FindUniqueBookingArgs } from './dtos/find.args'
import { UpdateBookingInput } from './dtos/update-booking.input'
import { Slots } from 'src/models/slots/graphql/entity/slots.entity'
import { Customer } from 'src/models/customers/graphql/entity/customer.entity'
import { BookingTimeline } from 'src/models/booking-timelines/graphql/entity/booking-timeline.entity'
import { ValetAssignment } from 'src/models/valet-assignments/graphql/entity/valet-assignment.entity'

@Resolver(() => Bookings)
export class BookingsResolver {
  constructor(private readonly bookingsService: BookingsService,
    private readonly prisma: PrismaService) {}

  @AllowAuthenticated()
  @Mutation(() => Bookings)
  createBookings(@Args('createBookingsInput') args: CreateBookingInput, @GetUser() user: GetUserType) {
    checkRowLevelPermission(user, args.customerId)
    return this.bookingsService.create(args)
  }

  @Query(() => [Bookings], { name: 'bookings' })
  findAll(@Args() args: FindManyBookingArgs) {
    return this.bookingsService.findAll(args)
  }

  @Query(() => Bookings, { name: 'bookings' })
  findOne(@Args() args: FindUniqueBookingArgs) {
    return this.bookingsService.findOne(args)
  }

  @AllowAuthenticated()
  @Mutation(() => Bookings)
  async updateBookings(@Args('updateBookingsInput') args: UpdateBookingInput, @GetUser() user: GetUserType) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id: args.id },
    })
    checkRowLevelPermission(user, booking.customerId)
    return this.bookingsService.update(args)
  }

  @AllowAuthenticated()
  @Mutation(() => Bookings)
  async removeBookings(@Args() args: FindUniqueBookingArgs, @GetUser() user: GetUserType) {
    const bookings = await this.prisma.bookings.findUnique(args)
    checkRowLevelPermission(user, bookings.customerId)
    return this.bookingsService.remove(args)
  }

  @ResolveField(() => Slots)
  slot(@Parent() booking: Bookings) {
    return this.prisma.slots.findFirst({ where: { id: booking.slotId } })
  }

  @ResolveField(() => Customer)
  customer(@Parent() booking: Bookings) {
    return this.prisma.customer.findFirst({
      where: { uid: booking.customerId },
    })
  }

  @ResolveField(() => [BookingTimeline])
  bookingTimeline(@Parent() booking: Bookings) {
    return this.prisma.bookingTimeline.findMany({
      where: { bookingId: booking.id },
    })
  }

  @ResolveField(() => ValetAssignment, { nullable: true })
  valetAssignment(@Parent() booking: Bookings) {
    return this.prisma.valetAssignment.findFirst({
      where: { bookingId: booking.id },
    })
  }
}
