import { Controller, Post, Body } from '@nestjs/common';
import { QwenService } from './qwen.service';

@Controller('api/v1/ai')
export class AIController {
  constructor(private qwenService: QwenService) {}

  @Post('score-lead')
  async scoreLead(@Body() body: { leadData: string }) {
    return await this.qwenService.scoreLead(body.leadData);
  }

  @Post('explain-qualification')
  async explainQualification(@Body() body: { leadData: string }) {
    const explanation = await this.qwenService.explainQualification(
      body.leadData,
    );
    return { explanation };
  }

  @Post('optimize-campaign')
  async optimizeCampaign(@Body() body: { campaignData: string }) {
    const recommendations = await this.qwenService.optimizeCampaign(
      body.campaignData,
    );
    return { recommendations };
  }
}
