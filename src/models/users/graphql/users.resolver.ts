import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { UsersService } from './users.service'
import { User } from './entity/user.entity'
import { FindManyUserArgs, FindUniqueUserArgs } from './dtos/find.args'
import { UpdateUserInput } from './dtos/update-user.input'
import { checkRowLevelPermission } from 'src/common/auth/util'
import { GetUserType } from 'src/common/types'
import { AllowAuthenticated, GetUser } from 'src/common/auth/auth.decorator'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { LoginInputs, LoginOutPut, RegisterWithCredentialsInput, RegisterWithProviderInput } from './dtos/create-user.input'

//it work as a controller in graphql.
//and implementing all the logic from service.
@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService,
    private readonly prisma: PrismaService) { }


  //in graphql Mutation is use for write operation  like POST,DELETE and PUT in  rest api

  @Mutation(() => User)
  async createUserWithCredential(
    @Args('createUserWithCredentialsInput')
    args: RegisterWithCredentialsInput,
  ) {
    return this.usersService.registerWithCredentials(args)
  }


  @Mutation(() => User)
  async createUserWithProviders(
    @Args('createUserWithProviderInput')
    args: RegisterWithProviderInput,
  ) {
    return this.usersService.registerWithProvider(args)
  }

  @Mutation(() => LoginOutPut)
  async login(@Args('loginInput') args: LoginInputs) {
    return this.usersService.login(args)
  }

  @AllowAuthenticated()
  @Query(() => User)
  whoami(@GetUser() user: GetUserType) {
    return this.usersService.findOne({ where: { uid: user.uid } })
  }

  //in graphql Query is use for read operation  like Get in  rest api
  @Query(() => [User], { name: 'users' })
  findAll(@Args() args: FindManyUserArgs) {
    return this.usersService.findAll(args)
  }

  @AllowAuthenticated()
  @Query(() => User, { name: 'user' })
  findOne(@Args() args: FindUniqueUserArgs, @GetUser() user: GetUserType) {
    checkRowLevelPermission(user, args.where.uid)
    return this.usersService.findOne(args)
  }

  @AllowAuthenticated()
  @Mutation(() => User)
  async updateUser(@Args('updateUserInput') args: UpdateUserInput, @GetUser() user: GetUserType) {
    const userinfo = await this.prisma.user.findUnique({ where: { uid: args.uid } })
    checkRowLevelPermission(user, userinfo.uid)
    return this.usersService.update(args)
  }

  @AllowAuthenticated()
  @Mutation(() => User)
  async removeUser(@Args() args: FindUniqueUserArgs, @GetUser() user: GetUserType) {
    const userinfo = await this.prisma.user.findUnique(args)
    checkRowLevelPermission(user, userinfo.uid)
    return this.usersService.remove(args)
  }
}
