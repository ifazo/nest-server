import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  imports: [DatabaseModule],
})
export class PaymentsModule {}
