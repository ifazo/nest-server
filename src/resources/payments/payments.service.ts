import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { User } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  constructor(private readonly databaseService: DatabaseService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  async create(createPaymentDto: CreatePaymentDto, user: User) {
    try {
      const { products } = createPaymentDto;
      const { id, name, email } = user;
      const userExists = await this.databaseService.user.findUnique({
        where: {
          id,
        },
      });
      if (!userExists) {
        throw new BadRequestException('User does not exist.');
      }
      const customer = await this.stripe.customers.create({
        name,
        email,
      });
      const items = products.map((product: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            images: [product.image],
            name: product.name,
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: product.quantity,
      }));

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items,
        mode: 'payment',
        customer: customer.id,
        success_url: `${process.env.URL}/success`,
        cancel_url: `${process.env.URL}/cancel`,
      });

      if (!session) {
        throw new BadRequestException('Failed to create payment session.');
      }

      const payment = await this.databaseService.order.create({
        data: {
          products: products.map((product) => ({
            ...product,
            quantity: product.quantity,
          })),
          userId: id,
          total: products.reduce(
            (acc: number, product: any) =>
              acc + product.price * product.quantity,
            0,
          ),
          sessionId: session.id,
          status: 'pending',
        },
      });
      return {
        statusCode: HttpStatus.CREATED,
        success: true,
        message: 'Payment created successfully',
        data: payment,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: 'Failed to create product',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
