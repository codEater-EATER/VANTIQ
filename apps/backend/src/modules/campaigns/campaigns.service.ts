import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  async getCampaigns() {
    return this.prisma.campaign.findMany({
      include: { events: true },
    });
  }

  async createCampaign(data: any) {
    return this.prisma.campaign.create({ data });
  }
}
