import { OmitType, PickType } from '@nestjs/swagger'
import { CustomerEntity } from '../entity/customer.entity'

export class CreateCustomer extends PickType(CustomerEntity, [
  'uid',
]) {}
