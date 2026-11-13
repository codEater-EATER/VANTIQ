import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';

@ApiTags('Conversations')
@Controller('api/v1/conversations')
@UseGuards(JwtAuthGuard)
@ApiSecurity('bearer')
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Get()
  async getConversations(@Request() req: any) {
    return this.conversationsService.getConversations(req.user.sub);
  }

  @Post()
  async createConversation(@Request() req: any, @Body() body: any) {
    return this.conversationsService.createConversation(req.user.sub, body);
  }
}
