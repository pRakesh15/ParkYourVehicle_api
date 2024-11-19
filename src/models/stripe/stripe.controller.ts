import { Controller, Get } from "@nestjs/common";
import { BookingsService } from "../bookings/graphql/bookings.service";
import StripeService from "./stripe.service";

@Controller('stripe')

export class StripeController{
    constructor(
        private readonly stripeService:StripeService,
        private readonly bookingsService:BookingsService,
    ){}

    @Get()
    helloStripe(){
        return 'hello Stripe'
    }
}