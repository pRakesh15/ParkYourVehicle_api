import { OmitType } from '@nestjs/swagger'
import { GaragesEntity } from '../entity/garages.entity'

export class CreateGarages extends OmitType(GaragesEntity, [
  'createdAt',
  'updatedAt',
  'id',
]) {}
