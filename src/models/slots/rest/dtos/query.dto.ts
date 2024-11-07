import { IsIn, IsOptional } from 'class-validator'
import { Prisma } from '@prisma/client'
import { BaseQueryDto } from 'src/common/dtos/common.dto'

export class SlotsQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsIn(Object.values(Prisma.SlotsScalarFieldEnum))
  sortBy?: string

  @IsOptional()
  @IsIn(Object.values(Prisma.SlotsScalarFieldEnum))
  searchBy?: string
}

