import { IsIn, IsOptional } from 'class-validator'
import { Prisma } from '@prisma/client'
import { BaseQueryDto } from 'src/common/dtos/common.dto'

export class GaragesQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsIn(Object.values(Prisma.GaragesScalarFieldEnum))
  sortBy?: string

  @IsOptional()
  @IsIn(Object.values(Prisma.GaragesScalarFieldEnum))
  searchBy?: string
}

