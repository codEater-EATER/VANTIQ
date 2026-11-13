import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';

@ApiTags('Webhooks')
@Controller('api/v1/webhooks')
@UseGuards(JwtAuthGuard)
@ApiSecurity('bearer')
export class WebhookController {
  constructor(private webhookService: WebhookService) {}

  @Post('register')
  async registerWebhook(@Request() req: any, @Body() body: any) {
    return this.webhookService.registerWebhook(req.user.sub, body);
  }

  @Get()
  async listWebhooks(@Request() req: any) {
    return this.webhookService.listWebhooks(req.user.sub);
  }

  @Put(':id')
  async updateWebhook(@Param('id') id: string, @Body() body: any) {
    return this.webhookService.updateWebhook(id, body);
  }

  @Delete(':id')
  async deleteWebhook(@Param('id') id: string) {
    await this.webhookService.deleteWebhook(id);
    return { success: true };
  }

  @Post(':id/test')
  async testWebhook(@Param('id') id: string) {
    return this.webhookService.testWebhook(id);
  }

  @Get(':id/history')
  async getHistory(@Param('id') id: string) {
    return this.webhookService.getWebhookHistory(id);
  }

  @Get('stats')
  async getStats(@Request() req: any) {
    return this.webhookService.getWebhookStats(req.user.sub);
  }
}
