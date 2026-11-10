import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

export interface DashboardMetrics {
  overview: {
    totalLeads: number;
    qualifiedLeads: number;
    distributedLeads: number;
    acceptedLeads: number;
    qualificationRate: number;
    distributionRate: number;
  };
  revenue: {
    totalCommission: Decimal;
    pendingCommission: Decimal;
    paidCommission: Decimal;
    averageCommissionPerLead: Decimal;
  };
  performance: {
    topPerformingBuyers: Array<{ buyerId: string; leads: number; accepted: number }>;
    topLeadSources: Array<{ source: string; count: number }>;
    leadsByLoanType: Array<{ type: string; count: number }>;
    qualificationTrend: Array<{ date: string; score: number }>;
  };
  distribution: {
    acceptanceRate: number;
    rejectionRate: number;
    pendingCount: number;
    averageTimeToAcceptance: number; // in hours
  };
}

@Injectable()
export class DashboardAnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get comprehensive dashboard metrics
   */
  async getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
    const [overview, revenue, performance, distribution] = await Promise.all([
      this.getOverviewMetrics(userId),
      this.getRevenueMetrics(userId),
      this.getPerformanceMetrics(userId),
      this.getDistributionMetrics(userId),
    ]);

    return {
      overview,
      revenue,
      performance,
      distribution,
    };
  }

  /**
   * Get overview metrics
   */
  private async getOverviewMetrics(userId: string): Promise<DashboardMetrics['overview']> {
    const [totalLeads, qualifiedLeads, distributedLeads, acceptedLeads] = await Promise.all([
      this.prisma.lead.count({ where: { userId } }),
      this.prisma.lead.count({
        where: { userId, status: 'QUALIFIED' },
      }),
      this.prisma.lead.count({
        where: { userId, status: 'AWAITING_BUYER' },
      }),
      this.prisma.lead.count({
        where: { userId, status: 'ACCEPTED' },
      }),
    ]);

    const qualificationRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;
    const distributionRate = totalLeads > 0 ? Math.round((distributedLeads / totalLeads) * 100) : 0;

    return {
      totalLeads,
      qualifiedLeads,
      distributedLeads,
      acceptedLeads,
      qualificationRate,
      distributionRate,
    };
  }

  /**
   * Get revenue metrics
   */
  private async getRevenueMetrics(userId: string): Promise<DashboardMetrics['revenue']> {
    const commissions = await this.prisma.commissionLedger.findMany({
      where: {
        lead: { userId },
      },
    });

    let totalCommission = new Decimal(0);
    let pendingCommission = new Decimal(0);
    let paidCommission = new Decimal(0);

    for (const commission of commissions) {
      totalCommission = totalCommission.plus(commission.commissionAmount);

      if (commission.status === 'PAID') {
        paidCommission = paidCommission.plus(commission.commissionAmount);
      } else if (['PENDING', 'APPROVED', 'RECEIVED'].includes(commission.status)) {
        pendingCommission = pendingCommission.plus(commission.commissionAmount);
      }
    }

    const leads = await this.prisma.lead.count({ where: { userId } });
    const averageCommissionPerLead =
      leads > 0 ? totalCommission.dividedBy(leads) : new Decimal(0);

    return {
      totalCommission,
      pendingCommission,
      paidCommission,
      averageCommissionPerLead,
    };
  }

  /**
   * Get performance metrics
   */
  private async getPerformanceMetrics(userId: string): Promise<DashboardMetrics['performance']> {
    // Top performing buyers
    const buyerStats = await this.prisma.distribution.groupBy({
      by: ['buyerId'],
      where: {
        lead: { userId },
      },
      _count: {
        id: true,
      },
    });

    const topPerformingBuyers = await Promise.all(
      buyerStats
        .sort((a, b) => b._count.id - a._count.id)
        .slice(0, 5)
        .map(async (stat) => {
          const accepted = await this.prisma.distribution.count({
            where: {
              buyerId: stat.buyerId,
              lead: { userId },
              acceptanceStatus: 'ACCEPTED',
            },
          });
          return {
            buyerId: stat.buyerId,
            leads: stat._count.id,
            accepted,
          };
        }),
    );

    // Top lead sources
    const sources = await this.prisma.lead.groupBy({
      by: ['source'],
      where: { userId },
      _count: { id: true },
    });

    const topLeadSources = sources
      .sort((a, b) => b._count.id - a._count.id)
      .slice(0, 5)
      .map((s) => ({ source: s.source, count: s._count.id }));

    // Leads by loan type
    const loanTypes = await this.prisma.lead.groupBy({
      by: ['loanType'],
      where: { userId },
      _count: { id: true },
    });

    const leadsByLoanType = loanTypes
      .sort((a, b) => b._count.id - a._count.id)
      .map((lt) => ({ type: lt.loanType, count: lt._count.id }));

    // Qualification trend (last 30 days)
    const qualificationTrend = await this.getQualificationTrend(userId);

    return {
      topPerformingBuyers,
      topLeadSources,
      leadsByLoanType,
      qualificationTrend,
    };
  }

  /**
   * Get distribution metrics
   */
  private async getDistributionMetrics(userId: string): Promise<DashboardMetrics['distribution']> {
    const distributions = await this.prisma.distribution.findMany({
      where: { lead: { userId } },
    });

    const accepted = distributions.filter((d) => d.acceptanceStatus === 'ACCEPTED').length;
    const rejected = distributions.filter((d) => d.acceptanceStatus === 'REJECTED').length;
    const pending = distributions.filter((d) => d.acceptanceStatus === 'PENDING').length;

    const acceptanceRate =
      distributions.length > 0 ? Math.round((accepted / distributions.length) * 100) : 0;
    const rejectionRate =
      distributions.length > 0 ? Math.round((rejected / distributions.length) * 100) : 0;

    // Average time to acceptance
    const acceptedDistributions = distributions.filter(
      (d) => d.acceptanceStatus === 'ACCEPTED' && d.acceptedAt,
    );

    let averageTimeToAcceptance = 0;
    if (acceptedDistributions.length > 0) {
      const times = acceptedDistributions.map((d) => {
        const hours =
          (d.acceptedAt!.getTime() - d.distributedAt.getTime()) / (1000 * 60 * 60);
        return hours;
      });
      averageTimeToAcceptance = Math.round(
        times.reduce((a, b) => a + b, 0) / times.length,
      );
    }

    return {
      acceptanceRate,
      rejectionRate,
      pendingCount: pending,
      averageTimeToAcceptance,
    };
  }

  /**
   * Get qualification trend for last 30 days
   */
  private async getQualificationTrend(userId: string): Promise<Array<{
    date: string;
    score: number;
  }>> {
    const leads = await this.prisma.lead.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        createdAt: true,
        qualificationScore: true,
      },
    });

    const dailyScores = new Map<string, number[]>();

    for (const lead of leads) {
      const date = lead.createdAt.toISOString().split('T')[0];
      if (!dailyScores.has(date)) {
        dailyScores.set(date, []);
      }
      dailyScores.get(date)!.push(lead.qualificationScore);
    }

    const trend = Array.from(dailyScores)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, scores]) => ({
        date,
        score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      }));

    return trend;
  }

  /**
   * Get real-time lead count
   */
  async getRealtimeLeadCount(userId: string): Promise<{
    thisHour: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  }> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [thisHour, today, thisWeek, thisMonth] = await Promise.all([
      this.prisma.lead.count({
        where: { userId, createdAt: { gte: oneHourAgo } },
      }),
      this.prisma.lead.count({
        where: { userId, createdAt: { gte: todayStart } },
      }),
      this.prisma.lead.count({
        where: { userId, createdAt: { gte: weekStart } },
      }),
      this.prisma.lead.count({
        where: { userId, createdAt: { gte: monthStart } },
      }),
    ]);

    return { thisHour, today, thisWeek, thisMonth };
  }

  /**
   * Get conversion funnel
   */
  async getConversionFunnel(userId: string): Promise<{
    imported: number;
    qualified: number;
    distributed: number;
    accepted: number;
    qualificationConversionRate: number;
    distributionConversionRate: number;
    acceptanceConversionRate: number;
  }> {
    const [imported, qualified, distributed, accepted] = await Promise.all([
      this.prisma.lead.count({ where: { userId } }),
      this.prisma.lead.count({
        where: { userId, qualificationScore: { gte: 60 } },
      }),
      this.prisma.lead.count({
        where: { userId, status: 'AWAITING_BUYER' },
      }),
      this.prisma.lead.count({
        where: { userId, status: 'ACCEPTED' },
      }),
    ]);

    return {
      imported,
      qualified,
      distributed,
      accepted,
      qualificationConversionRate: imported > 0 ? Math.round((qualified / imported) * 100) : 0,
      distributionConversionRate: qualified > 0 ? Math.round((distributed / qualified) * 100) : 0,
      acceptanceConversionRate: distributed > 0 ? Math.round((accepted / distributed) * 100) : 0,
    };
  }

  /**
   * Get buyer performance comparison
   */
  async getBuyerComparison(userId: string): Promise<
    Array<{
      buyerId: string;
      buyerName: string;
      leadsReceived: number;
      accepted: number;
      rejected: number;
      acceptanceRate: number;
      totalCommission: Decimal;
    }>
  > {
    const buyers = await this.prisma.buyer.findMany({
      include: {
        distributions: {
          where: { lead: { userId } },
        },
      },
    });

    return Promise.all(
      buyers.map(async (buyer) => {
        const leadsReceived = buyer.distributions.length;
        const accepted = buyer.distributions.filter(
          (d) => d.acceptanceStatus === 'ACCEPTED',
        ).length;
        const rejected = buyer.distributions.filter(
          (d) => d.acceptanceStatus === 'REJECTED',
        ).length;
        const acceptanceRate = leadsReceived > 0 ? Math.round((accepted / leadsReceived) * 100) : 0;

        const commissions = await this.prisma.commissionLedger.findMany({
          where: { buyerId: buyer.id, lead: { userId } },
        });

        let totalCommission = new Decimal(0);
        for (const commission of commissions) {
          totalCommission = totalCommission.plus(commission.commissionAmount);
        }

        return {
          buyerId: buyer.id,
          buyerName: buyer.company,
          leadsReceived,
          accepted,
          rejected,
          acceptanceRate,
          totalCommission,
        };
      }),
    );
  }

  /**
   * Get activity timeline
   */
  async getActivityTimeline(userId: string, limit: number = 20): Promise<
    Array<{
      id: string;
      action: string;
      details: string;
      timestamp: Date;
    }>
  > {
    const activities = await this.prisma.activity.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return activities.map((a) => ({
      id: a.id,
      action: a.action,
      details: a.details || '',
      timestamp: a.timestamp,
    }));
  }

  /**
   * Export dashboard data
   */
  async exportDashboardData(userId: string, format: 'json' | 'csv' = 'json'): Promise<any> {
    const metrics = await this.getDashboardMetrics(userId);
    const funnel = await this.getConversionFunnel(userId);
    const realtimeCount = await this.getRealtimeLeadCount(userId);

    const data = {
      exportDate: new Date().toISOString(),
      metrics,
      funnel,
      realtimeCount,
    };

    if (format === 'json') {
      return data;
    }

    // CSV format (simplified)
    return this.toCsv(data);
  }

  /**
   * Convert to CSV format
   */
  private toCsv(data: any): string {
    const lines: string[] = [];

    lines.push('VANTIQ Dashboard Export');
    lines.push(`Export Date: ${data.exportDate}`);
    lines.push('');

    lines.push('OVERVIEW METRICS');
    lines.push(`Total Leads,${data.metrics.overview.totalLeads}`);
    lines.push(`Qualified Leads,${data.metrics.overview.qualifiedLeads}`);
    lines.push(`Distributed Leads,${data.metrics.overview.distributedLeads}`);
    lines.push(`Accepted Leads,${data.metrics.overview.acceptedLeads}`);
    lines.push('');

    lines.push('CONVERSION FUNNEL');
    lines.push(`Imported,${data.funnel.imported}`);
    lines.push(`Qualified,${data.funnel.qualified}`);
    lines.push(`Distributed,${data.funnel.distributed}`);
    lines.push(`Accepted,${data.funnel.accepted}`);
    lines.push('');

    return lines.join('\n');
  }
}
