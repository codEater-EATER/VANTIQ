import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';

@ApiTags('AI')
@Controller('api/v1/ai')
@UseGuards(JwtAuthGuard)
@ApiSecurity('bearer')
export class AIController {
  constructor(private aiService: AIService) {}

  @Post('chat')
  async chat(@Request() req, @Body() body: any) {
    return this.aiService.chat(body.conversationId, body.message, body.model);
  }
}
