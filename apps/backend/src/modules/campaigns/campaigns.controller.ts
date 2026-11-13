import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignsAdvancedService } from './campaigns.advanced.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';

@ApiTags('Campaigns')
@Controller('api/v1/campaigns')
@UseGuards(JwtAuthGuard)
@ApiSecurity('bearer')
export class CampaignsController {
  constructor(
    private campaignsService: CampaignsService,
    private advancedService: CampaignsAdvancedService,
  ) {}

  @Get()
  async getCampaigns() {
    return this.campaignsService.getCampaigns();
  }

  @Post()
  async createCampaign(@Body() body: any) {
    return this.campaignsService.createCampaign(body);
  }

  @Get('templates')
  async getTemplates() {
    return this.advancedService.getTemplates();
  }

  @Post('from-template')
  async createFromTemplate(@Request() req: any, @Body() body: any) {
    return this.advancedService.createCampaignFromTemplate(
      req.user.sub,
      body.template,
      body.strategy,
    );
  }

  @Put(':id/launch')
  async launchCampaign(@Param('id') id: string) {
    return this.advancedService.launchCampaign(id);
  }

  @Put(':id/pause')
  async pauseCampaign(@Param('id') id: string) {
    return this.advancedService.pauseCampaign(id);
  }

  @Put(':id/stop')
  async stopCampaign(@Param('id') id: string) {
    return this.advancedService.stopCampaign(id);
  }

  @Get(':id/analytics')
  async getAnalytics(@Param('id') id: string) {
    return this.advancedService.getCampaignAnalytics(id);
  }

  @Get(':id/trends')
  async getTrends(@Param('id') id: string) {
    return this.advancedService.getCampaignTrends(id);
  }

  @Get(':id/budget')
  async getBudgetAllocation(@Param('id') id: string) {
    return this.advancedService.getBudgetAllocation(id);
  }

  @Post(':id/assign-buyers')
  async assignBuyers(@Param('id') id: string, @Body() body: any) {
    return this.advancedService.assignBuyersToCampaign(id, body.buyerIds, body.strategy);
  }

  @Get(':id/optimize')
  async optimizeCampaign(@Param('id') id: string) {
    return this.advancedService.optimizeCampaign(id);
  }

  @Get(':id/export')
  async exportReport(@Param('id') id: string) {
    return this.advancedService.exportCampaignReport(id);
  }
}
