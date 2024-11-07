import { InputType, ObjectType, PickType } from '@nestjs/graphql'
import { FindManyGarageArgs } from './find.args'
import { Slots } from 'src/models/slots/graphql/entity/slots.entity'

@InputType()
export class DateFilterInput {
  start: string
  end: string
}

@InputType()
export class GarageFilter extends PickType(
  FindManyGarageArgs,
  ['where', 'orderBy', 'skip', 'take'],
  InputType,
) {}

@ObjectType()
export class MinimalSlotGroupBy extends PickType(Slots, [
  'type',
  'pricePerHour',
]) {
  count: number
}
