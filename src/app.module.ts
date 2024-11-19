import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { UsersModule } from './models/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AddressesModule } from './models/addresses/addresses.module';
import { AdminsModule } from './models/admins/admins.module';
import { CompaniesModule } from './models/companies/companies.module';
import { CustomersModule } from './models/customers/customers.module';
import { GaragesModule } from './models/garages/garages.module';
import { ManagersModule } from './models/managers/managers.module';
import { SlotsModule } from './models/slots/slots.module';
import { ValetsModule } from './models/valets/valets.module';
import { VerificationsModule } from './models/verifications/verifications.module';
import { BookingsModule } from './models/bookings/bookings.module';
import { BookingTimeline } from './models/booking-timelines/graphql/entity/booking-timeline.entity';
import { BookingTimelinesModule } from './models/booking-timelines/booking-timelines.module';
import { ValetAssignmentsModule } from './models/valet-assignments/valet-assignments.module';
import { ReviewsModule } from './models/reviews/reviews.module';

const MAX_AGE = 24 * 60 * 60;

import { registerEnumType } from '@nestjs/graphql';
import { BookingStatus, SlotType } from '@prisma/client';
import { StripeModule } from './models/stripe/stripe.module';

// Register SlotType with GraphQL
registerEnumType(SlotType, {
  name: 'SlotType',
  description: 'Type of slot available for vehicles',
});
registerEnumType(BookingStatus, {
  name: 'BookingStatus',
  description: 'Type of status available for vehicles',
});

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: MAX_AGE }
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      introspection: true,
      fieldResolverEnhancers: ['guards'],
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      // buildSchemaOptions: {
      //   numberScalarMode: 'integer',
      // },
    }),
    PrismaModule,
    UsersModule,
    AddressesModule,
    AdminsModule,
    CompaniesModule,
    CustomersModule,
    GaragesModule,
    ManagersModule,
    SlotsModule,
    ValetsModule,
    VerificationsModule,
    BookingsModule,
    BookingTimelinesModule,
    ValetAssignmentsModule,
    ReviewsModule,
    StripeModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
