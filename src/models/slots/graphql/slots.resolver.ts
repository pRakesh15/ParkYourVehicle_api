import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql'
import { SlotsService } from './slots.service'
import { Slots } from './entity/slots.entity'
import { FindManySlotArgs, FindUniqueSlotArgs } from './dtos/find.args'
import { CreateSlotInput } from './dtos/create-slot.input'
import { UpdateSlotInput } from './dtos/update-slot.input'
import { checkRowLevelPermission } from 'src/common/auth/util'
import { GetUserType } from 'src/common/types'
import { AllowAuthenticated, GetUser } from 'src/common/auth/auth.decorator'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { Garages } from 'src/models/garages/graphql/entity/garages.entity'
import { Bookings } from 'src/models/bookings/graphql/entity/bookings.entity'

@Resolver(() => Slots)
export class SlotsResolver {
  constructor(private readonly slotsService: SlotsService,
    private readonly prisma: PrismaService) {}

    @AllowAuthenticated()
    @Mutation(() => Slots)
    async createSlot(
      @Args('createSlotInput') args: CreateSlotInput,
      @GetUser() user: GetUserType,
    ) {
      const garage = await this.prisma.garages.findUnique({
        where: { id: args.garageId },
        include: { Company: { include: { Managers: true } } },
      })
      checkRowLevelPermission(
        user,
        garage.Company.Managers.map((manager) => manager.uid),
      )
      return this.slotsService.create(args)
    }
  @Query(() => [Slots], { name: 'slots' })
  findAll(@Args() args: FindManySlotArgs) {
    return this.slotsService.findAll(args)
  }

  @Query(() => Slots, { name: 'slots' })
  findOne(@Args() args: FindUniqueSlotArgs) {
    return this.slotsService.findOne(args)
  }

  @AllowAuthenticated()
  @Mutation(() => Slots)
  async updateSlot(
    @Args('updateSlotInput') args: UpdateSlotInput,
    @GetUser() user: GetUserType,
  ) {
    const slot = await this.prisma.slots.findUnique({
      where: { id: args.id },
      include: {
        Garage: {
          include: {
            Company: {
              include: { Managers: true },
            },
          },
        },
      },
    })
    checkRowLevelPermission(
      user,
      slot.Garage.Company.Managers.map((man) => man.uid),
    )
    return this.slotsService.update(args)
  }

  @AllowAuthenticated()
  @Mutation(() => Slots)
  async removeSlot(
    @Args() args: FindUniqueSlotArgs,
    @GetUser() user: GetUserType,
  ) {
    const slot = await this.prisma.slots.findUnique({
      where: { id: args.where.id },
      include: {
        Garage: {
          include: {
            Company: {
              include: { Managers: true },
            },
          },
        },
      },
    })
    checkRowLevelPermission(
      user,
      slot.Garage.Company.Managers.map((man) => man.uid),
    )
    return this.slotsService.remove(args)
  }

  @ResolveField(() => Garages)
  garage(@Parent() slot: Slots) {
    return this.prisma.garages.findUnique({ where: { id: slot.garageId } })
  }

  @ResolveField(() => [Bookings])
  bookings(@Parent() slot: Slots) {
    return this.prisma.bookings.findMany({ where: { slotId: slot.id } })
  }
}
