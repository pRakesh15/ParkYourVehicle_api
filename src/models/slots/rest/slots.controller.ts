import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query
} from '@nestjs/common'

import { PrismaService } from 'src/common/prisma/prisma.service'
import { ApiTags } from '@nestjs/swagger'
import { CreateSlots } from './dtos/create.dto'
import { SlotsQueryDto } from './dtos/query.dto'
import { UpdateSlots } from './dtos/update.dto'
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger'
import { SlotsEntity } from './entity/slots.entity'
import { AllowAuthenticated, GetUser } from 'src/common/auth/auth.decorator'
import { GetUserType } from 'src/common/types'
import { checkRowLevelPermission } from 'src/common/auth/util'


@ApiTags('slots')
@Controller('slots')
export class SlotsController {
  constructor(private readonly prisma: PrismaService) {}

  @AllowAuthenticated()
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: SlotsEntity })
  @Post()
 async create(@Body() createSlotsDto: CreateSlots, @GetUser() user: GetUserType){
    const garage = await this.prisma.garages.findUnique({
      where: { id: createSlotsDto.garageId },
      include: { Company: { include: { Managers: true } } },
    })
    checkRowLevelPermission(
      user,
      garage.Company.Managers.map((manager) => manager.uid),
    )
    return this.prisma.slots.create({ data: createSlotsDto })
  }
  @ApiOkResponse({ type: [SlotsEntity] })
  @Get()
  findAll(@Query() { skip, take, order, sortBy }: SlotsQueryDto) {
    return this.prisma.slots.findMany({
      ...(skip ? { skip: +skip } : null),
      ...(take ? { take: +take } : null),
      ...(sortBy ? { orderBy: { [sortBy]: order || 'asc' } } : null),
    })
  }

  @ApiOkResponse({ type: SlotsEntity })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.prisma.slots.findUnique({ where: { id } })
  }

  @ApiOkResponse({ type: SlotsEntity })
  @ApiBearerAuth()
  @AllowAuthenticated()
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateSlotDto: UpdateSlots,
    @GetUser() user: GetUserType,
  ) {
    const slot = await this.prisma.slots.findUnique({
      where: { id },
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
    return this.prisma.slots.update({
      where: { id },
      data: updateSlotDto,
    })
  }


  @ApiBearerAuth()
  @AllowAuthenticated()
  @Delete(':id')
  async remove(@Param('id') id: number, @GetUser() user: GetUserType) {
    const slot = await this.prisma.slots.findUnique({
      where: { id },
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
    return this.prisma.slots.delete({ where: { id } })
  }
}
