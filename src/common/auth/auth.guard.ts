import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { JwtService } from '@nestjs/jwt'
import { Reflector } from '@nestjs/core'
import { Role } from 'src/common/types'
import { PrismaService } from 'src/common/prisma/prisma.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) { }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context)
    const req = ctx.getContext().req

    //here we 1st check the user is exit or not by  the token
    await this.authenticateUser(req)
    //if  available then check the the user is authorize or not.
    return this.authorizeUser(req, context)
  }

  private async authenticateUser(req: any): Promise<void> {
    const bearerHeader = req.headers.authorization
    // Bearer eylskfdjlsdf309
    const token = bearerHeader?.split(' ')[1]

    if (!token) {
      //if there  is no token available then this error .
      throw new UnauthorizedException('No token provided.')
    }

    try {
      const payload = await this.jwtService.verify(token)
      const uid = payload.uid
      if (!uid) {
        throw new UnauthorizedException('Invalid token No uid present in this token.')
      }
      const user = this.prisma.user.findUnique({ where: { uid } })
      if (!user) {
        throw new UnauthorizedException('Invalid token, No User present in this uid.')

      }
      // console.log('jwt Payload',user)
      req.user = payload
    } catch (err) {
      //if there are some error in validating the token from backend the error occur
      console.error('Token validation error:', err)
    }

    if (!req.user) {
      //if there is a invalid  or wrong token provided.
      throw new UnauthorizedException('Invalid token.')
    }
  }

  //in this we can check if the present user is authorize or not..
  private async authorizeUser(
    req: any,
    context: ExecutionContext,
  ): Promise<boolean> {
    const userRoles = await this.getUserRoles(req.user.uid)
    req.user.roles = userRoles

    const requiredRoles = this.getMetadata<Role[]>('roles', context)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }
    return requiredRoles.some((role) => userRoles.includes(role))
  }

  private getMetadata<T>(key: string, context: ExecutionContext): T {
    return this.reflector.getAllAndOverride<T>(key, [
      context.getHandler(),
      context.getClass(),
    ])
  }

  private async getUserRoles(uid: string): Promise<Role[]> {
    const rolePromises = [
      this.prisma.admin.findUnique({ where: { uid } }),
      // Add promises for other role models here
    ]

    const roles: Role[] = []

    const [admin] = await Promise.all(rolePromises)
    admin && roles.push('admin')

    return roles
  }
}
