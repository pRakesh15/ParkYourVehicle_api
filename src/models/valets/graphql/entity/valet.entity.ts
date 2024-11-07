import { Field, ObjectType } from '@nestjs/graphql'
import { Valet as ValetType } from '@prisma/client'
import { RestrictProperties } from 'src/common/dtos/common.input'

@ObjectType()
export class Valet implements RestrictProperties<Valet,ValetType> {
    createdAt: Date
    updatedAt: Date
    displayName: string
    @Field({ nullable: true })
    image: string
    @Field({ nullable: true })
    companyId: number
    uid: string
    licenceID: string
    // Todo Add below to make optional fields optional.
    // @Field({ nullable: true })
}
