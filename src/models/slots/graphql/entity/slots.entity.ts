import { Field, ObjectType } from '@nestjs/graphql'
import { $Enums, Slots as SlotsType } from '@prisma/client'
import { RestrictProperties } from 'src/common/dtos/common.input'

@ObjectType()
export class Slots implements RestrictProperties<Slots,SlotsType> {
    @Field({ nullable: true })
    displayName: string
    id: number
    createdAt: Date
    updatedAt: Date
    garageId: number
    @Field({ nullable: true })
    length: number
    @Field(() => $Enums.SlotType)
    type: $Enums.SlotType
    pricePerHour: number
    @Field({ nullable: true })
    width: number
    @Field({ nullable: true })
    height: number
    // Todo Add below to make optional fields optional.
    // @Field({ nullable: true })
}
