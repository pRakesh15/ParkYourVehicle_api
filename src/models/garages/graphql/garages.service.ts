import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { CreateGarageInput } from './dtos/create-garage.input'
import { UpdateGarageInput } from './dtos/update-garage.input'
import { Prisma } from '@prisma/client'
import { FindManyGarageArgs, FindUniqueGarageArgs } from './dtos/find.args'
import { CreateSlotInputWithoutGarageId } from 'src/models/slots/graphql/dtos/create-slot.input'

@Injectable()
export class GaragesService {
  constructor(private readonly prisma: PrismaService) {}
  async create({
    Address,
    companyId,
    description,
    displayName,
    image,
    Slots,
  }: CreateGarageInput & { companyId: number }) {
    // Check if any slot has a count greater than 20
    if (Slots.some((slot) => slot.count > 10)) {
      throw new Error('Slot count cannot be more than 20 for any slot type.')
    }
    return this.prisma.$transaction(async (tx) => {
      const createdGarage = await tx.garages.create({
        data: {
          Address: { create: Address },
          companyId,
          description,
          displayName,
          image,
        },
      })
      const slotsByType = this.groupSlotsByType(Slots, createdGarage.id)

      const createSlots = await tx.slots.createMany({
        data: slotsByType,
      })

      return createdGarage
    })
  }

  findAll(args: FindManyGarageArgs) {
    return this.prisma.garages.findMany(args)
  }

  findOne(args: FindUniqueGarageArgs) {
    return this.prisma.garages.findUnique(args)
  }

  update(updateGarageInput: UpdateGarageInput) {
    const { id, Address, Slots, ...data } = updateGarageInput
    return this.prisma.garages.update({
      where: { id },
      data: data,
    })
  }

  remove(args: FindUniqueGarageArgs) {
    return this.prisma.garages.delete(args)
  }
  groupSlotsByType(
    slots: CreateSlotInputWithoutGarageId[],
    garageId: number,
  ): Prisma.SlotsCreateManyInput[] {
    const slotsByType = []
    const slotCounts = {
      CAR: 0,
      HEAVY: 0,
      BIKE: 0,
      BICYCLE: 0,
    }

    slots.forEach(({ count, ...slot }) => {
      for (let i = 0; i < count; i++) {
        slotsByType.push({
          ...slot,
          displayName: `${slot.type} ${slotCounts[slot.type]}`,
          garageId,
        })
        slotCounts[slot.type]++
      }
    })

    return slotsByType
  }
}