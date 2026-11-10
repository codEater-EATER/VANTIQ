import { Module } from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { CommissionsController } from './commissions.controller';
import { DatabaseModule } from '@/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [CommissionsService],
  controllers: [CommissionsController],
})
export class CommissionsModule {}
