import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query
} from '@nestjs/common'

import { PrismaService } from 'src/common/prisma/prisma.service'
import { ApiTags } from '@nestjs/swagger'
import { CreateGarages } from './dtos/create.dto'
import { GaragesQueryDto } from './dtos/query.dto'
import { UpdateGarages } from './dtos/update.dto'
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger'
import { GaragesEntity } from './entity/garages.entity'
import { AllowAuthenticated, GetUser } from 'src/common/auth/auth.decorator'
import { GetUserType } from 'src/common/types'
import { checkRowLevelPermission } from 'src/common/auth/util'


@ApiTags('garages')
@Controller('garages')
export class GaragesController {
  constructor(private readonly prisma: PrismaService) {}

  @AllowAuthenticated()
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: GaragesEntity })
  @Post()
  async create(
    @Body() createGarageDto: CreateGarages,
    @GetUser() user: GetUserType,
  ) {
    const company = await this.prisma.company.findUnique({
      where: { id: createGarageDto.companyId },
      include: { Managers: true },
    })
    checkRowLevelPermission(
      user,
      company.Managers.map((manager) => manager.uid),
    )
    return this.prisma.garages.create({ data: createGarageDto })
  }
  @ApiOkResponse({ type: [GaragesEntity] })
  @Get()
  findAll(@Query() { skip, take, order, sortBy }: GaragesQueryDto) {
    return this.prisma.garages.findMany({
      ...(skip ? { skip: +skip } : null),
      ...(take ? { take: +take } : null),
      ...(sortBy ? { orderBy: { [sortBy]: order || 'asc' } } : null),
    })
  }

  @ApiOkResponse({ type: GaragesEntity })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.prisma.garages.findUnique({ where: { id } })
  }

  @ApiOkResponse({ type: GaragesEntity })
  @ApiBearerAuth()
  @AllowAuthenticated()
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateGarageDto: UpdateGarages,
    @GetUser() user: GetUserType,
  ) {
    const garage = await this.prisma.garages.findUnique({
      where: { id },
      include: { Company: { include: { Managers: true } } },
    })
    checkRowLevelPermission(
      user,
      garage.Company.Managers.map((manager) => manager.uid),
    )
    return this.prisma.garages.update({
      where: { id },
      data: updateGarageDto,
    })
  }

  @ApiBearerAuth()
  @AllowAuthenticated()
  @Delete(':id')
  async remove(@Param('id') id: number, @GetUser() user: GetUserType) {
    const garage = await this.prisma.garages.findUnique({
      where: { id },
      include: { Company: { include: { Managers: true } } },
    })
    checkRowLevelPermission(
      user,
      garage.Company.Managers.map((manager) => manager.uid),
    )
    return this.prisma.garages.delete({ where: { id } })
  }
}
