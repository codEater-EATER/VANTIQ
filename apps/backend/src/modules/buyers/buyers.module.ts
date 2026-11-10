import { Module } from '@nestjs/common';
import { BuyersService } from './buyers.service';
import { BuyersController } from './buyers.controller';
import { DatabaseModule } from '@/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [BuyersService],
  controllers: [BuyersController],
})
export class BuyersModule {}
