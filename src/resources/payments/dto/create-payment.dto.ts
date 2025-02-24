import { Product } from '@prisma/client';

export class PaymentProducts {
  products: Product[];
  quantity: number;
}

export class CreatePaymentDto {
  products: PaymentProducts[];
}
