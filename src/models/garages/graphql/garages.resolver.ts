import {
  Resolver,
  Query,
  Mutation,
  Args,

} from '@nestjs/graphql'
import { GaragesService } from './garages.service'

import { CreateGarageInput } from './dtos/create-garage.input'
import { checkRowLevelPermission } from 'src/common/auth/util'
import { GetUserType } from 'src/common/types'
import { AllowAuthenticated, GetUser } from 'src/common/auth/auth.decorator'
import { PrismaService } from 'src/common/prisma/prisma.service'

import { BadRequestException } from '@nestjs/common'
import { Garages } from './entity/garages.entity'
import { FindManyGarageArgs, FindUniqueGarageArgs } from './dtos/find.args'
import { UpdateGarageInput } from './dtos/update-garage.input'

@Resolver(() => Garages)
export class GaragesResolver {
  constructor(private readonly garagesService: GaragesService,
    private readonly prisma: PrismaService) {}

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

  @Query(() => Garages, { name: 'garages' })
  findOne(@Args() args: FindUniqueGarageArgs) {
    return this.garagesService.findOne(args)
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
}

