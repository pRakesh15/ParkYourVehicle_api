import { Injectable } from '@nestjs/common'
import { FindManySlotArgs, FindUniqueSlotArgs } from './dtos/find.args'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { CreateSlotInput } from './dtos/create-slot.input'
import { UpdateSlotInput } from './dtos/update-slot.input'

@Injectable()
export class SlotsService {
  constructor(private readonly prisma: PrismaService) {}
  create(createSlotsInput: CreateSlotInput) {
    return this.prisma.slots.create({
      data: createSlotsInput,
    })
  }

  findAll(args: FindManySlotArgs) {
    return this.prisma.slots.findMany(args)
  }

  findOne(args: FindUniqueSlotArgs) {
    return this.prisma.slots.findUnique(args)
  }

  update(updateSlotsInput: UpdateSlotInput) {
    const { id, ...data } = updateSlotsInput
    return this.prisma.slots.update({
      where: { id },
      data: data,
    })
  }

  remove(args: FindUniqueSlotArgs) {
    return this.prisma.slots.delete(args)
  }
}
