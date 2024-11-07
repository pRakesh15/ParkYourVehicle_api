import { ArgsType, Field, registerEnumType, PartialType } from '@nestjs/graphql'
import { Prisma } from '@prisma/client'
import { BookingOrderByWithRelationInput } from './order-by.args'
import { BookingWhereInput, BookingWhereUniqueInput } from './where.args'
import { RestrictProperties } from 'src/common/dtos/common.input'

registerEnumType(Prisma.BookingsScalarFieldEnum, {
  name: 'BookingScalarFieldEnum',
})

@ArgsType()
class FindManyBookingArgsStrict
  implements
    RestrictProperties<
      FindManyBookingArgsStrict,
      Omit<Prisma.BookingsFindManyArgs, 'include' | 'select'>
    >
{
  where: BookingWhereInput
  orderBy: BookingOrderByWithRelationInput[]
  cursor: BookingWhereUniqueInput
  take: number
  skip: number
  @Field(() => [Prisma.BookingsScalarFieldEnum])
  distinct: Prisma.BookingsScalarFieldEnum[]
}

@ArgsType()
export class FindManyBookingArgs extends PartialType(
  FindManyBookingArgsStrict,
) {}

@ArgsType()
export class FindUniqueBookingArgs {
  where: BookingWhereUniqueInput
}
