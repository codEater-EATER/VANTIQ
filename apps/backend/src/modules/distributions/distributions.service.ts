import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface DistributionRequest {
  leadId: string;
  buyerIds: string[];
  agreementId?: string;
}

export interface SmartDistributionConfig {
  qualificationScoreThreshold: number; // Only distribute if score >= this
  prioritizeByScore: boolean; // Distribute to highest-score buyers first
  maxBuyersPerLead: number; // Max buyers to distribute to
  respectAgreementTerms: boolean; // Check buyer agreements
}

@Injectable()
export class DistributionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Distribute a lead to one or more buyers
   */
  async distributeLead(request: DistributionRequest): Promise<any[]> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: request.leadId },
    });

    if (!lead) {
      throw new BadRequestException('Lead not found');
    }

    // Get buyer agreements
    const agreements = await this.prisma.agreement.findMany({
      where: {
        buyerId: { in: request.buyerIds },
        status: 'ACTIVE',
      },
    });

    if (agreements.length === 0) {
      throw new BadRequestException('No active agreements found for selected buyers');
    }

    // Create distributions
    const distributions: any[] = [];

    for (const agreement of agreements) {
      try {
        const distribution = await this.prisma.distribution.create({
          data: {
            leadId: request.leadId,
            buyerId: agreement.buyerId,
            agreementId: agreement.id,
            distributionMethod: 'API',
            acceptanceStatus: 'PENDING',
          },
        });
        distributions.push(distribution);

        // Update lead status
        await this.prisma.lead.update({
          where: { id: request.leadId },
          data: { status: 'AWAITING_BUYER' },
        });
      } catch (error) {
        console.error(`Failed to distribute to buyer ${agreement.buyerId}:`, error);
      }
    }

    return distributions;
  }

  /**
   * Smart distribution - intelligently route leads to buyers
   */
  async smartDistribute(
    leadIds: string[],
    config: SmartDistributionConfig,
  ): Promise<{ distributed: number; failed: number; skipped: number }> {
    let distributed = 0;
    let failed = 0;
    let skipped = 0;

    for (const leadId of leadIds) {
      try {
        const lead = await this.prisma.lead.findUnique({
          where: { id: leadId },
        });

        if (!lead) {
          failed++;
          continue;
        }

        // Check qualification threshold
        if (lead.qualificationScore < config.qualificationScoreThreshold) {
          skipped++;
          continue;
        }

        // Get best buyers
        const buyers = await this.findBestBuyers(
          lead,
          config.maxBuyersPerLead,
          config.prioritizeByScore,
        );

        if (buyers.length === 0) {
          skipped++;
          continue;
        }

        // Distribute to buyers
        const distributions = await this.distributeLead({
          leadId,
          buyerIds: buyers.map((b) => b.id),
        });

        if (distributions.length > 0) {
          distributed++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Smart distribution failed for lead ${leadId}:`, error);
        failed++;
      }
    }

    return { distributed, failed, skipped };
  }

  /**
   * Find best buyers for a lead
   */
  private async findBestBuyers(
    lead: any,
    maxBuyers: number,
    prioritizeByScore: boolean,
  ): Promise<any[]> {
    const buyers = await this.prisma.buyer.findMany({
      where: {
        status: 'ACTIVE',
        agreements: {
          some: {
            status: 'ACTIVE',
          },
        },
      },
      include: {
        agreements: true,
        products: true,
      },
      take: maxBuyers,
    });

    // Filter buyers that match lead's loan type and amount
    let filteredBuyers = buyers.filter((buyer: any) => {
      const matchingProduct = buyer.products.find((p: any) => p.loanType === lead.loanType);

      if (!matchingProduct) return false;

      // Check loan amount range
      if (lead.loanAmount) {
        const min = matchingProduct.minAmount || 0;
        const max = matchingProduct.maxAmount || Number.MAX_SAFE_INTEGER;
        if (lead.loanAmount < min || lead.loanAmount > max) {
          return false;
        }
      }

      return true;
    });

    // Sort by score if enabled
    if (prioritizeByScore) {
      filteredBuyers.sort((a: any, b: any) => {
        const scoreA = a.agreements?.[0]?.commissionValue || 0;
        const scoreB = b.agreements?.[0]?.commissionValue || 0;
        return Number(scoreB) - Number(scoreA);
      });
    }

    return filteredBuyers.slice(0, maxBuyers);
  }

  /**
   * Accept distribution (buyer accepts lead)
   */
  async acceptDistribution(
    distributionId: string,
    buyerId: string,
  ): Promise<any> {
    const distribution = await this.prisma.distribution.findUnique({
      where: { id: distributionId },
    });

    if (!distribution) {
      throw new BadRequestException('Distribution not found');
    }

    if (distribution.buyerId !== buyerId) {
      throw new BadRequestException('Unauthorized to accept this distribution');
    }

    const updated = await this.prisma.distribution.update({
      where: { id: distributionId },
      data: {
        acceptanceStatus: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    });

    // Update lead status
    await this.prisma.lead.update({
      where: { id: distribution.leadId },
      data: { status: 'ACCEPTED' },
    });

    return updated;
  }

  /**
   * Reject distribution (buyer rejects lead)
   */
  async rejectDistribution(
    distributionId: string,
    buyerId: string,
    reason?: string,
  ): Promise<any> {
    const distribution = await this.prisma.distribution.findUnique({
      where: { id: distributionId },
    });

    if (!distribution) {
      throw new BadRequestException('Distribution not found');
    }

    if (distribution.buyerId !== buyerId) {
      throw new BadRequestException('Unauthorized to reject this distribution');
    }

    const updated = await this.prisma.distribution.update({
      where: { id: distributionId },
      data: {
        acceptanceStatus: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: reason,
      },
    });

    return updated;
  }

  /**
   * Get distribution statistics
   */
  async getDistributionStats(userId: string): Promise<{
    totalDistributions: number;
    accepted: number;
    rejected: number;
    pending: number;
    acceptanceRate: number;
  }> {
    const distributions = await this.prisma.distribution.findMany({
      where: {
        lead: { userId },
      },
    });

    const accepted = distributions.filter((d: any) => d.acceptanceStatus === 'ACCEPTED').length;
    const rejected = distributions.filter((d: any) => d.acceptanceStatus === 'REJECTED').length;
    const pending = distributions.filter((d: any) => d.acceptanceStatus === 'PENDING').length;

    const acceptanceRate =
      distributions.length > 0 ? Math.round((accepted / distributions.length) * 100) : 0;

    return {
      totalDistributions: distributions.length,
      accepted,
      rejected,
      pending,
      acceptanceRate,
    };
  }

  /**
   * Get pending distributions for buyer
   */
  async getPendingDistributions(buyerId: string): Promise<any[]> {
    return this.prisma.distribution.findMany({
      where: {
        buyerId,
        acceptanceStatus: 'PENDING',
      },
      include: {
        lead: true,
        agreement: true,
      },
      orderBy: { distributedAt: 'desc' },
    });
  }

  /**
   * Get distribution history
   */
  async getDistributionHistory(
    userId: string,
    limit: number = 50,
  ): Promise<any[]> {
    return this.prisma.distribution.findMany({
      where: {
        lead: { userId },
      },
      include: {
        lead: true,
        buyer: true,
        agreement: true,
      },
      orderBy: { distributedAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Bulk distribute leads
   */
  async bulkDistribute(leadIds: string[], buyerId: string): Promise<{
    distributed: number;
    failed: number;
  }> {
    let distributed = 0;
    let failed = 0;

    const agreement = await this.prisma.agreement.findFirst({
      where: {
        buyerId,
        status: 'ACTIVE',
      },
    });

    if (!agreement) {
      throw new BadRequestException('No active agreement found for buyer');
    }

    for (const leadId of leadIds) {
      try {
        await this.distributeLead({
          leadId,
          buyerIds: [buyerId],
        });
        distributed++;
      } catch (error) {
        console.error(`Failed to distribute lead ${leadId}:`, error);
        failed++;
      }
    }

    return { distributed, failed };
  }

  /**
   * Get buyer distribution analytics
   */
  async getBuyerAnalytics(buyerId: string): Promise<{
    totalReceived: number;
    accepted: number;
    rejected: number;
    pending: number;
    topLeadSources: Array<{ source: string; count: number }>;
    topLoanTypes: Array<{ type: string; count: number }>;
  }> {
    const distributions = await this.prisma.distribution.findMany({
      where: { buyerId },
      include: { lead: true },
    });

    const accepted = distributions.filter((d: any) => d.acceptanceStatus === 'ACCEPTED').length;
    const rejected = distributions.filter((d: any) => d.acceptanceStatus === 'REJECTED').length;
    const pending = distributions.filter((d: any) => d.acceptanceStatus === 'PENDING').length;

    // Top sources
    const sources = new Map<string, number>();
    distributions.forEach((d: any) => {
      const source = d.lead.source;
      sources.set(source, (sources.get(source) || 0) + 1);
    });

    const topLeadSources = Array.from(sources)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([source, count]) => ({ source, count }));

    // Top loan types
    const types = new Map<string, number>();
    distributions.forEach((d: any) => {
      const type = d.lead.loanType;
      types.set(type, (types.get(type) || 0) + 1);
    });

    const topLoanTypes = Array.from(types)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));

    return {
      totalReceived: distributions.length,
      accepted,
      rejected,
      pending,
      topLeadSources,
      topLoanTypes,
    };
  }

  /**
   * Check if lead can be distributed to buyer
   */
  async canDistribute(leadId: string, buyerId: string): Promise<boolean> {
    const [lead, agreement, existing] = await Promise.all([
      this.prisma.lead.findUnique({ where: { id: leadId } }),
      this.prisma.agreement.findFirst({
        where: { buyerId, status: 'ACTIVE' },
      }),
      this.prisma.distribution.findFirst({
        where: { leadId, buyerId },
      }),
    ]);

    if (!lead || !agreement) return false;
    if (existing?.acceptanceStatus === 'ACCEPTED') return false;

    return true;
  }

  /**
   * Retry failed distribution
   */
  async retryDistribution(distributionId: string): Promise<any> {
    const distribution = await this.prisma.distribution.findUnique({
      where: { id: distributionId },
    });

    if (!distribution) {
      throw new BadRequestException('Distribution not found');
    }

    return this.prisma.distribution.update({
      where: { id: distributionId },
      data: {
        acceptanceStatus: 'PENDING',
      },
    });
  }
}
