import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface CampaignTemplate {
  name: string;
  description: string;
  targetLoanTypes: string[];
  targetStates: string[];
  estimatedLeadsPerDay: number;
  budgetPerLead: number;
}

export interface CampaignStrategy {
  acquisitionChannels: string[];
  targetDemographics: string[];
  qualificationThreshold: number;
  distributionModel: 'immediate' | 'staged' | 'smart';
  buyerAssignmentStrategy: 'rotation' | 'performance' | 'capacity';
}

export interface CampaignAnalytics {
  campaignId: string;
  totalLeads: number;
  qualifiedLeads: number;
  distributedLeads: number;
  acceptedLeads: number;
  conversionRate: number;
  costPerLead: number;
  costPerQualifiedLead: number;
  costPerAcceptedLead: number;
  totalCost: number;
  totalRevenue: number;
  roi: number;
}

@Injectable()
export class CampaignsAdvancedService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create campaign from template
   */
  async createCampaignFromTemplate(
    userId: string,
    template: CampaignTemplate,
    strategy: CampaignStrategy,
  ): Promise<any> {
    // Calculate budget based on lead target and per-lead cost
    const daysToRun = 30;
    const estimatedLeads = template.estimatedLeadsPerDay * daysToRun;
    const totalBudget = estimatedLeads * template.budgetPerLead;

    const campaign = await this.prisma.campaign.create({
      data: {
        name: template.name,
        loanType: template.targetLoanTypes[0],
        targetCity: 'All',
        targetState: template.targetStates[0],
        audience: JSON.stringify(strategy.targetDemographics),
        acquisitionSource: strategy.acquisitionChannels[0],
        dailyLeadTarget: template.estimatedLeadsPerDay,
        budget: totalBudget,
        status: 'DRAFT',
        startDate: new Date(),
        endDate: new Date(Date.now() + daysToRun * 24 * 60 * 60 * 1000),
      },
    });

    // Store strategy metadata
    await this.prisma.activity.create({
      data: {
        userId,
        action: 'campaign.created',
        details: JSON.stringify({
          campaignId: campaign.id,
          template: template.name,
          strategy,
        }),
      },
    });

    return campaign;
  }

  /**
   * Get campaign templates
   */
  getTemplates(): CampaignTemplate[] {
    return [
      {
        name: 'Personal Loan Campaign',
        description: 'Target personal loan seekers',
        targetLoanTypes: ['PERSONAL'],
        targetStates: ['CA', 'TX', 'NY', 'FL'],
        estimatedLeadsPerDay: 50,
        budgetPerLead: 5,
      },
      {
        name: 'Auto Loan Campaign',
        description: 'Target auto loan seekers',
        targetLoanTypes: ['AUTO'],
        targetStates: ['CA', 'TX', 'NY'],
        estimatedLeadsPerDay: 75,
        budgetPerLead: 8,
      },
      {
        name: 'Home Loan Campaign',
        description: 'Target home loan seekers',
        targetLoanTypes: ['MORTGAGE'],
        targetStates: ['CA', 'TX', 'NY', 'FL', 'IL'],
        estimatedLeadsPerDay: 40,
        budgetPerLead: 12,
      },
      {
        name: 'Business Loan Campaign',
        description: 'Target business loan seekers',
        targetLoanTypes: ['BUSINESS'],
        targetStates: ['CA', 'TX', 'NY', 'IL'],
        estimatedLeadsPerDay: 30,
        budgetPerLead: 15,
      },
      {
        name: 'Student Loan Campaign',
        description: 'Target student loan seekers',
        targetLoanTypes: ['STUDENT'],
        targetStates: ['CA', 'TX', 'NY', 'MA', 'IL'],
        estimatedLeadsPerDay: 60,
        budgetPerLead: 4,
      },
    ];
  }

  /**
   * Launch campaign
   */
  async launchCampaign(campaignId: string): Promise<any> {
    const campaign = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'ACTIVE',
        startDate: new Date(),
      },
    });

    return campaign;
  }

  /**
   * Pause campaign
   */
  async pauseCampaign(campaignId: string): Promise<any> {
    return this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'PAUSED',
      },
    });
  }

  /**
   * Stop campaign
   */
  async stopCampaign(campaignId: string): Promise<any> {
    return this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'COMPLETED',
        endDate: new Date(),
      },
    });
  }

  /**
   * Get campaign analytics
   */
  async getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new BadRequestException('Campaign not found');
    }

    const [totalLeads, qualifiedLeads, distributedLeads, acceptedLeads, commissions] =
      await Promise.all([
        this.prisma.lead.count({ where: { campaignId } }),
        this.prisma.lead.count({
          where: { campaignId, qualificationScore: { gte: 60 } },
        }),
        this.prisma.lead.count({
          where: { campaignId, status: 'AWAITING_BUYER' },
        }),
        this.prisma.lead.count({
          where: { campaignId, status: 'ACCEPTED' },
        }),
        this.prisma.commissionLedger.findMany({
          where: {
            lead: { campaignId },
          },
        }),
      ]);

    let totalRevenue = 0;
    for (const commission of commissions) {
      totalRevenue += Number(commission.commissionAmount);
    }

    const conversionRate = totalLeads > 0 ? Math.round((acceptedLeads / totalLeads) * 100) : 0;
    const costPerLead = totalLeads > 0 ? Math.round(Number(campaign.budget) / totalLeads) : 0;
    const costPerQualifiedLead = qualifiedLeads > 0 ? Math.round(Number(campaign.budget) / qualifiedLeads) : 0;
    const costPerAcceptedLead = acceptedLeads > 0 ? Math.round(Number(campaign.budget) / acceptedLeads) : 0;
    const roi = totalRevenue > 0 ? Math.round(((totalRevenue - Number(campaign.budget)) / Number(campaign.budget)) * 100) : 0;

    return {
      campaignId,
      totalLeads,
      qualifiedLeads,
      distributedLeads,
      acceptedLeads,
      conversionRate,
      costPerLead,
      costPerQualifiedLead,
      costPerAcceptedLead,
      totalCost: Number(campaign.budget),
      totalRevenue,
      roi,
    };
  }

  /**
   * Get campaign performance trends
   */
  async getCampaignTrends(campaignId: string): Promise<
    Array<{
      date: string;
      leadsGenerated: number;
      qualifiedLeads: number;
      acceptedLeads: number;
      costPerLead: number;
    }>
  > {
    const leads = await this.prisma.lead.findMany({
      where: { campaignId },
      select: {
        createdAt: true,
        qualificationScore: true,
        status: true,
      },
    });

    // Group by date
    const trends = new Map<
      string,
      {
        leadsGenerated: number;
        qualifiedLeads: number;
        acceptedLeads: number;
      }
    >();

    for (const lead of leads) {
      const date = lead.createdAt.toISOString().split('T')[0];
      if (!trends.has(date)) {
        trends.set(date, { leadsGenerated: 0, qualifiedLeads: 0, acceptedLeads: 0 });
      }

      const dayData = trends.get(date)!;
      dayData.leadsGenerated++;

      if (lead.qualificationScore >= 60) {
        dayData.qualifiedLeads++;
      }

      if (lead.status === 'ACCEPTED') {
        dayData.acceptedLeads++;
      }
    }

    // Get campaign budget
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    const budgetPerDay = campaign ? Number(campaign.budget) / 30 : 0;

    return Array.from(trends)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({
        date,
        leadsGenerated: data.leadsGenerated,
        qualifiedLeads: data.qualifiedLeads,
        acceptedLeads: data.acceptedLeads,
        costPerLead: data.leadsGenerated > 0 ? Math.round(budgetPerDay / data.leadsGenerated) : 0,
      }));
  }

  /**
   * Assign buyers to campaign
   */
  async assignBuyersToCampaign(
    campaignId: string,
    buyerIds: string[],
    strategy: 'rotation' | 'performance' | 'capacity',
  ): Promise<{ assigned: number; failed: number }> {
    let assigned = 0;
    let failed = 0;

    // Get campaign
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new BadRequestException('Campaign not found');
    }

    for (let i = 0; i < buyerIds.length; i++) {
      try {
        // Check if agreement exists
        const agreement = await this.prisma.agreement.findFirst({
          where: { buyerId: buyerIds[i], status: 'ACTIVE' },
        });

        if (!agreement) {
          failed++;
          continue;
        }

        // Assign buyer to campaign
        const priority = strategy === 'rotation' ? i : 0;

        await this.prisma.buyerAssignment.upsert({
          where: {
            buyerId_campaignId: {
              buyerId: buyerIds[i],
              campaignId,
            },
          },
          update: { priority },
          create: {
            buyerId: buyerIds[i],
            campaignId,
            priority,
            capacity: 1000, // Default capacity
          },
        });

        assigned++;
      } catch (error) {
        console.error(`Failed to assign buyer ${buyerIds[i]}:`, error);
        failed++;
      }
    }

    return { assigned, failed };
  }

  /**
   * Get campaign budget allocation
   */
  async getBudgetAllocation(campaignId: string): Promise<{
    totalBudget: number;
    spent: number;
    remaining: number;
    dailySpend: number;
    daysRemaining: number;
    projectedEndDate: Date;
  }> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new BadRequestException('Campaign not found');
    }

    const leads = await this.prisma.lead.count({ where: { campaignId } });
    const costPerLead = Number(campaign.budget) / (leads || 1);
    const spent = leads * costPerLead;

    const startDate = campaign.startDate;
    const endDate = campaign.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const daysRemaining = Math.max(
      0,
      Math.floor((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    );
    const daysPassed = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const dailySpend = daysPassed > 0 ? spent / daysPassed : 0;
    const projectedEndDate = new Date(Date.now() + daysRemaining * dailySpend * 24 * 60 * 60 * 1000);

    return {
      totalBudget: Number(campaign.budget),
      spent: Math.round(spent),
      remaining: Math.round(Number(campaign.budget) - spent),
      dailySpend: Math.round(dailySpend),
      daysRemaining,
      projectedEndDate,
    };
  }

  /**
   * Export campaign report
   */
  async exportCampaignReport(campaignId: string): Promise<any> {
    const analytics = await this.getCampaignAnalytics(campaignId);
    const trends = await this.getCampaignTrends(campaignId);
    const budget = await this.getBudgetAllocation(campaignId);

    return {
      exportDate: new Date().toISOString(),
      campaignId,
      analytics,
      trends,
      budget,
    };
  }

  /**
   * Optimize campaign
   */
  async optimizeCampaign(campaignId: string): Promise<{
    recommendation: string;
    actions: string[];
  }> {
    const analytics = await this.getCampaignAnalytics(campaignId);
    const budget = await this.getBudgetAllocation(campaignId);

    const actions: string[] = [];
    let recommendation = 'Campaign is performing normally';

    // Check ROI
    if (analytics.roi < 0) {
      recommendation = 'Campaign needs optimization';
      actions.push('Lower cost per lead');
      actions.push('Increase qualification threshold');
    }

    // Check conversion rate
    if (analytics.conversionRate < 20) {
      actions.push('Review buyer agreements');
      actions.push('Improve lead quality');
    }

    // Check budget usage
    if (budget.spent > budget.totalBudget * 0.8) {
      if (analytics.roi > 50) {
        actions.push('Increase budget allocation');
      } else {
        actions.push('Pause campaign to review');
      }
    }

    if (actions.length === 0) {
      recommendation = 'Campaign is performing well';
      actions.push('Continue current strategy');
    }

    return { recommendation, actions };
  }
}
