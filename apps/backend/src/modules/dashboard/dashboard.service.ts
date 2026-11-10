import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardMetrics(userId: string) {
    const leads = await this.prisma.lead.findMany({
      where: { userId },
    });

    const campaigns = await this.prisma.campaign.findMany();
    const distributions = await this.prisma.distribution.findMany();
    const commissions = await this.prisma.commissionLedger.findMany();

    return {
      totalLeads: leads.length,
      leadsGeneratedToday: leads.filter(
        (l) =>
          new Date(l.createdAt).toDateString() === new Date().toDateString(),
      ).length,
      qualifiedLeads: leads.filter((l) => l.qualificationScore >= 60).length,
      duplicateLeads: leads.filter((l) => l.isDuplicate).length,
      distributedLeads: distributions.length,
      totalCampaigns: campaigns.length,
      totalCommission: commissions.reduce(
        (sum, c) => sum + Number(c.commissionAmount),
        0,
      ),
    };
  }
}
