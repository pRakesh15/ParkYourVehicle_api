import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { FindManyUserArgs, FindUniqueUserArgs } from './dtos/find.args'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { UpdateUserInput } from './dtos/update-user.input'
import { LoginInputs, LoginOutPut, RegisterWithCredentialsInput, RegisterWithProviderInput } from './dtos/create-user.input'
import * as bcrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'
import { JwtService } from '@nestjs/jwt'

//In service  we write all the business logic for the  model
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService,private readonly jwtService:JwtService,) { }
  //this is for create user
  registerWithProvider({ image, name, uid, type }: RegisterWithProviderInput) {
    return this.prisma.user.create({
      data: {
        uid,
        name,
        image,
        AuthProvider: {
          create: {
            type,
          }
        }

      }
    })
  }

  async registerWithCredentials({
    email, name, password, image
  }: RegisterWithCredentialsInput) {
    const existingUser = await this.prisma.credentials.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new BadRequestException('User Already exists with this email ')
    }

    const salt = bcrypt.genSaltSync()
    const passwordHas = bcrypt.hashSync(password, salt);

    const uid = uuid()

    return this.prisma.user.create({
      data: {
        uid,
        name,
        image,
        Cradntials: {
          create: {
            email,
            passwordHas,
          },
        },
        AuthProvider: {
          create: {
            type: "CREDENTIALS"
          },
        },
      },
    include:{
      Cradntials:true,
    }
    })

  }

  async login({email,password}:LoginInputs):Promise<LoginOutPut>{

    const user=await this.prisma.user.findFirst({
      where:{
        Cradntials:{email},
      },
      include:{
        Cradntials:true
      }
    })

    if(!user){
      throw new UnauthorizedException('Invalid Email or Password')
    }

    const isPasswordValid=bcrypt.compareSync(
      password,
      user.Cradntials.passwordHas,
    )
    if(!isPasswordValid){
      throw new UnauthorizedException('Invalid Email or Password')
    }

    const jwtToken=this.jwtService.sign(
      {uid:user.uid},
      {
        algorithm:'HS256',
      },
    )

    return{token:jwtToken}

  }

  //this is for find all the user
  findAll(args: FindManyUserArgs) {
    return this.prisma.user.findMany(args)
  }
  //this is for find single user by parameter like name or uid
  findOne(args: FindUniqueUserArgs) {
    return this.prisma.user.findUnique(args)
  }
  //this is for update the user
  update(updateUserInput: UpdateUserInput) {
    const { uid, ...data } = updateUserInput
    return this.prisma.user.update({
      where: { uid },
      data: data,
    })
  }

  //this is for delete the user from the database .
  remove(args: FindUniqueUserArgs) {
    return this.prisma.user.delete(args)
  }
}
