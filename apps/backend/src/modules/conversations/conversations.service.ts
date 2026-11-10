import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: { userId },
      include: { messages: true },
    });
  }

  async createConversation(userId: string, data: any) {
    return this.prisma.conversation.create({
      data: {
        userId,
        ...data,
      },
    });
  }
}
