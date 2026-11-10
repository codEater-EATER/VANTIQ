import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardAnalyticsService } from './dashboard.analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';

@ApiTags('Dashboard')
@Controller('api/v1/dashboard')
@UseGuards(JwtAuthGuard)
@ApiSecurity('bearer')
export class DashboardController {
  constructor(
    private dashboardService: DashboardService,
    private analyticsService: DashboardAnalyticsService,
  ) {}

  @Get('metrics')
  async getMetrics(@Request() req) {
    return this.analyticsService.getDashboardMetrics(req.user.sub);
  }

  @Get('funnel')
  async getConversionFunnel(@Request() req) {
    return this.analyticsService.getConversionFunnel(req.user.sub);
  }

  @Get('realtime')
  async getRealtimeCount(@Request() req) {
    return this.analyticsService.getRealtimeLeadCount(req.user.sub);
  }

  @Get('buyers/comparison')
  async getBuyerComparison(@Request() req) {
    return this.analyticsService.getBuyerComparison(req.user.sub);
  }

  @Get('activity')
  async getActivityTimeline(@Request() req, @Query('limit') limit: number = 20) {
    return this.analyticsService.getActivityTimeline(req.user.sub, limit);
  }

  @Get('export')
  async exportData(@Request() req, @Query('format') format: 'json' | 'csv' = 'json') {
    return this.analyticsService.exportDashboardData(req.user.sub, format);
  }
}
