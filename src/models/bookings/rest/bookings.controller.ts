import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query
} from '@nestjs/common'

import { PrismaService } from 'src/common/prisma/prisma.service'
import { ApiTags } from '@nestjs/swagger'
import { CreateBookings } from './dtos/create.dto'
import { BookingsQueryDto } from './dtos/query.dto'
import { UpdateBookings } from './dtos/update.dto'
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger'
import { BookingsEntity } from './entity/bookings.entity'
import { AllowAuthenticated, GetUser } from 'src/common/auth/auth.decorator'
import { GetUserType } from 'src/common/types'
import { checkRowLevelPermission } from 'src/common/auth/util'


@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly prisma: PrismaService) {}

  @AllowAuthenticated()
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: BookingsEntity })
  @Post()
  create(@Body() createBookingsDto: CreateBookings, @GetUser() user: GetUserType) {
    checkRowLevelPermission(user, createBookingsDto.customerId)
    return this.prisma.bookings.create({ data: createBookingsDto })
  }

  @ApiOkResponse({ type: [BookingsEntity] })
  @Get()
  findAll(@Query() { skip, take, order, sortBy }: BookingsQueryDto) {
    return this.prisma.bookings.findMany({
      ...(skip ? { skip: +skip } : null),
      ...(take ? { take: +take } : null),
      ...(sortBy ? { orderBy: { [sortBy]: order || 'asc' } } : null),
    })
  }

  @ApiOkResponse({ type: BookingsEntity })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.prisma.bookings.findUnique({ where: { id } })
  }

  @ApiOkResponse({ type: BookingsEntity })
  @ApiBearerAuth()
  @AllowAuthenticated()
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateBookingsDto: UpdateBookings,
    @GetUser() user: GetUserType,
  ) {
    const bookings = await this.prisma.bookings.findUnique({ where: { id } })
    const booking = await this.prisma.bookings.findUnique({ where: { id } })
    checkRowLevelPermission(user, booking.customerId)
    return this.prisma.bookings.update({
      where: { id },
      data: updateBookingsDto,
    })
  }

  @ApiBearerAuth()
  @AllowAuthenticated()
  @Delete(':id')
  async remove(@Param('id') id: number, @GetUser() user: GetUserType) {
    const booking = await this.prisma.bookings.findUnique({ where: { id } })
    checkRowLevelPermission(user, booking.customerId)
    return this.prisma.bookings.delete({ where: { id } })
  }
}
