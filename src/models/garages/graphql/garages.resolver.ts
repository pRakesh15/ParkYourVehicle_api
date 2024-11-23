import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,

} from '@nestjs/graphql'
import { GaragesService } from './garages.service'

import { CreateGarageInput } from './dtos/create-garage.input'
import { checkRowLevelPermission } from 'src/common/auth/util'
import { GetUserType } from 'src/common/types'
import { AllowAuthenticated, GetUser } from 'src/common/auth/auth.decorator'
import { PrismaService } from 'src/common/prisma/prisma.service'

import { BadRequestException } from '@nestjs/common'
import { Garages, SlotTypeCount } from './entity/garages.entity'
import { FindManyGarageArgs, FindUniqueGarageArgs } from './dtos/find.args'
import { UpdateGarageInput } from './dtos/update-garage.input'
import { Verification } from 'src/models/verifications/graphql/entity/verification.entity'
import { Company } from 'src/models/companies/graphql/entity/company.entity'
import { Address } from 'src/models/addresses/graphql/entity/address.entity'
import { Slots } from 'src/models/slots/graphql/entity/slots.entity'
import { DateFilterInput, GarageFilter, MinimalSlotGroupBy } from './dtos/search-filter.input'
import { AggregateCountOutput, LocationFilterInput } from 'src/common/dtos/common.input'
import { SlotWhereInput } from 'src/models/slots/graphql/dtos/where.args'
import { GarageWhereInput } from './dtos/where.args'

@Resolver(() => Garages)
export class GaragesResolver {
  constructor(
    private readonly garagesService: GaragesService,
    private readonly prisma: PrismaService,
  ) {}

  @AllowAuthenticated('manager')
  @Mutation(() => Garages)
  async createGarage(
    @Args('createGarageInput') args: CreateGarageInput,
    @GetUser() user: GetUserType,
  ) {
    const company = await this.prisma.company.findFirst({
      where: { Managers: { some: { uid: user.uid } } },
    })
    if (!company?.id) {
      throw new BadRequestException(
        'No company associated with the manager id.',
      )
    }

    return this.garagesService.create({ ...args, companyId: company.id })
  }

  @Query(() => [Garages], { name: 'garages' })
  findAll(@Args() args: FindManyGarageArgs) {
    return this.garagesService.findAll(args)
  }

  @Query(() => Garages, { name: 'garage' })
  findOne(@Args() args: FindUniqueGarageArgs) {
    return this.garagesService.findOne(args)
  }

  @Query(() => [Garages], { name: 'searchGarages' })
  async searchGarages(
    @Args('dateFilter') dateFilter: DateFilterInput,
    @Args('locationFilter') locationFilter: LocationFilterInput,
    @Args('slotsFilter', { nullable: true }) slotsFilter: SlotWhereInput,
    @Args('garageFilter', { nullable: true }) args: GarageFilter,
  ) {
    const { start, end } = dateFilter
    const { ne_lat, ne_lng, sw_lat, sw_lng } = locationFilter

    let startDate = new Date(start)
    let endDate = new Date(end)
    const currentDate = new Date()

    const diffInSeconds = Math.floor(
      (endDate.getTime() - startDate.getTime()) / 1000,
    )

    if (startDate.getTime() < currentDate.getTime()) {
      // Set startDate as current time
      startDate = new Date()
      const updatedEndDate = new Date(startDate)
      updatedEndDate.setSeconds(updatedEndDate.getSeconds() + diffInSeconds)
      endDate = updatedEndDate
    }

    if (startDate.getTime() > endDate.getTime()) {
      throw new BadRequestException(
        'Start time should be earlier than the end time.',
      )
    }

    const { where = {}, ...garageFilters } = args || {}

    return this.prisma.garages.findMany({
      ...garageFilters,
      where: {
        ...where,
        Address: {
          lat: { lte: ne_lat, gte: sw_lat },
          lng: { lte: ne_lng, gte: sw_lng },
        },
        Slots: {
          some: {
            ...slotsFilter,
            Bookings: {
              none: {
                OR: [
                  {
                    startTime: { lt: endDate },
                    endTime: { gt: startDate },
                  },
                  {
                    startTime: { gt: startDate },
                    endTime: { lt: endDate },
                  },
                ],
              },
            },
          },
        },
      },
    })
  }

  @ResolveField(() => [SlotTypeCount])
  async slotCounts(@Parent() garage: Garages) {
    const slotCounts = await this.prisma.slots.groupBy({
      by: ['type'],
      where: {
        garageId: garage.id,
      },
      _count: {
        type: true,
      },
    })

    return slotCounts.map(({ type, _count }) => ({
      type,
      count: _count.type,
    }))
  }

  @ResolveField(() => [MinimalSlotGroupBy], {
    name: 'availableSlots',
  })
  async availableSlots(
    @Parent() garage: Garages,
    @Args('slotsFilter', { nullable: true }) slotsFilter: SlotWhereInput,
    @Args('dateFilter') dateFilter: DateFilterInput,
  ) {
    const { start, end } = dateFilter
    const startDate = new Date(start)
    const endDate = new Date(end)

    const groupBySlots = await this.prisma.slots.groupBy({
      by: ['type'],
      _count: { type: true },
      _min: { pricePerHour: true },
      where: {
        ...slotsFilter,
        garageId: { equals: garage.id },
        Bookings: {
          none: {
            OR: [
              {
                startTime: { lt: endDate },
                endTime: { gt: startDate },
              },
              {
                startTime: { gt: startDate },
                endTime: { lt: endDate },
              },
            ],
          },
        },
      },
    })

    return groupBySlots.map(({ _count, type, _min }) => ({
      type,
      count: _count.type,
      pricePerHour: _min.pricePerHour,
    }))
  }

  @AllowAuthenticated()
  @Mutation(() => Garages)
  async updateGarage(
    @Args('updateGarageInput') args: UpdateGarageInput,
    @GetUser() user: GetUserType,
  ) {
    const garage = await this.prisma.garages.findUnique({
      where: { id: args.id },
      include: { Company: { include: { Managers: true } } },
    })
    checkRowLevelPermission(
      user,
      garage.Company.Managers.map((man) => man.uid),
    )
    return this.garagesService.update(args)
  }

  @AllowAuthenticated()
  @Mutation(() => Garages)
  async removeGarage(
    @Args() args: FindUniqueGarageArgs,
    @GetUser() user: GetUserType,
  ) {
    const garage = await this.prisma.garages.findUnique({
      where: { id: args.where.id },
      include: { Company: { include: { Managers: true } } },
    })
    checkRowLevelPermission(
      user,
      garage.Company.Managers.map((man) => man.uid),
    )
    return this.garagesService.remove(args)
  }

  @ResolveField(() => Verification, { nullable: true })
  async verification(@Parent() parent: Garages) {
    return this.prisma.verification.findUnique({
      where: { garageId: parent.id },
    })
  }

  @ResolveField(() => Company)
  company(@Parent() garage: Garages) {
    return this.prisma.company.findFirst({ where: { id: garage.companyId } })
  }

  @ResolveField(() => Address, { nullable: true })
  address(@Parent() garage: Garages) {
    return this.prisma.address.findFirst({ where: { garageId: garage.id } })
  }

  @ResolveField(() => [Slots])
  slots(@Parent() garage: Garages) {
    return this.prisma.slots.findMany({ where: { garageId: garage.id } })
  }

  @Query(() => AggregateCountOutput, {
    name: 'garagesCount',
  })
  async garagesCount(
    @Args('where', { nullable: true })
    where: GarageWhereInput,
  ) {
    const garages = await this.prisma.garages.aggregate({
      _count: { _all: true },
      where,
    })
    return { count: garages._count._all }
  }
  
}
