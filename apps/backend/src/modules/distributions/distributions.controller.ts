import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { DistributionsService } from './distributions.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';

@ApiTags('Distributions')
@Controller('api/v1/distributions')
@UseGuards(JwtAuthGuard)
@ApiSecurity('bearer')
export class DistributionsController {
  constructor(private distributionsService: DistributionsService) {}

  @Post('distribute')
  async distributeLead(@Body() body: any) {
    return this.distributionsService.distributeLead(body);
  }

  @Post('smart-distribute')
  async smartDistribute(@Body() body: any) {
    return this.distributionsService.smartDistribute(body.leadIds, body.config);
  }

  @Put(':id/accept')
  async acceptDistribution(@Param('id') id: string, @Request() req) {
    return this.distributionsService.acceptDistribution(id, req.user.sub);
  }

  @Put(':id/reject')
  async rejectDistribution(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.distributionsService.rejectDistribution(id, req.user.sub, body.reason);
  }

  @Get('stats')
  async getStats(@Request() req) {
    return this.distributionsService.getDistributionStats(req.user.sub);
  }

  @Get('pending')
  async getPendingDistributions(@Request() req) {
    return this.distributionsService.getPendingDistributions(req.user.sub);
  }

  @Get('history')
  async getHistory(@Request() req, @Query('limit') limit: number = 50) {
    return this.distributionsService.getDistributionHistory(req.user.sub, limit);
  }

  @Get('buyer/:buyerId/analytics')
  async getBuyerAnalytics(@Param('buyerId') buyerId: string) {
    return this.distributionsService.getBuyerAnalytics(buyerId);
  }
}
