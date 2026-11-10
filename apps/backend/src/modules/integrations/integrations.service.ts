import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class IntegrationsService {
  constructor(private prisma: PrismaService) {}

  async getIntegrations(userId: string) {
    return this.prisma.integrationAccount.findMany({
      where: { userId },
    });
  }

  async createIntegration(userId: string, data: any) {
    return this.prisma.integrationAccount.create({
      data: {
        userId,
        ...data,
      },
    });
  }
}
