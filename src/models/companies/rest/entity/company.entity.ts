import { Company } from '@prisma/client'
import { IsDate, IsString, IsInt, IsOptional } from 'class-validator'
import { RestrictProperties } from 'src/common/dtos/common.input'

export class CompanyEntity implements RestrictProperties<CompanyEntity, Company> {
    @IsOptional()
    displayName: string
    @IsOptional()
    description: string
    createdAt: Date
    updatedAt: Date
    id: number

}

