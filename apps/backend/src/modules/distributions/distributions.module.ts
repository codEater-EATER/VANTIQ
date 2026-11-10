import { Module } from '@nestjs/common';
import { DistributionsService } from './distributions.service';
import { DistributionsController } from './distributions.controller';
import { DatabaseModule } from '@/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [DistributionsService],
  controllers: [DistributionsController],
})
export class DistributionsModule {}
