import { Field, ObjectType } from '@nestjs/graphql'
import { Garages as GaragesType } from '@prisma/client'
import { RestrictProperties } from 'src/common/dtos/common.input'

@ObjectType()
export class Garages implements RestrictProperties<Garages,GaragesType> {
    @Field({ nullable: true })
    description: string
    id: number
    createdAt: Date
    updatedAt: Date
    @Field({ nullable: true })
    displayName: string
    companyId: number
    image: string[]

}
