import { $Enums, Slots } from '@prisma/client'
import { IsDate, IsString, IsInt, IsOptional } from 'class-validator'
import { RestrictProperties } from 'src/common/dtos/common.input'

export class SlotsEntity implements RestrictProperties<SlotsEntity, Slots> {
    id: number
    createdAt: Date
    updatedAt: Date
    @IsOptional()
    displayName: string
    pricePerHour: number
    @IsOptional()
    length: number
    @IsOptional()
    width: number
    @IsOptional()
    height: number
  
    type: $Enums.SlotType
    garageId: number

}

