import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardAnalyticsService } from './dashboard.analytics.service';
import { DashboardController } from './dashboard.controller';
import { DatabaseModule } from '@/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [DashboardService, DashboardAnalyticsService],
  controllers: [DashboardController],
})
export class DashboardModule {}
