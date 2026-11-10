import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';

@ApiTags('Integrations')
@Controller('api/v1/integrations')
@UseGuards(JwtAuthGuard)
@ApiSecurity('bearer')
export class IntegrationsController {
  constructor(private integrationsService: IntegrationsService) {}

  @Get()
  async getIntegrations(@Request() req) {
    return this.integrationsService.getIntegrations(req.user.sub);
  }

  @Post()
  async createIntegration(@Request() req, @Body() body: any) {
    return this.integrationsService.createIntegration(req.user.sub, body);
  }
}
