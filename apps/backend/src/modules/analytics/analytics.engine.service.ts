import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

export interface PredictiveAnalytics {
  leadId: string;
  predictionType: string;
  prediction: string;
  confidence: number;
  factors: string[];
  action: string;
}

export interface InsightRecommendation {
  category: string;
  insight: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  priority: number;
}

export interface SegmentationData {
  segmentId: string;
  name: string;
  leadCount: number;
  characteristics: Record<string, any>;
  avgScore: number;
  conversionRate: number;
}

@Injectable()
export class AnalyticsEngineService {
  constructor(private prisma: PrismaService) {}

  /**
   * Predict lead conversion probability
   */
  async predictLeadConversion(leadId: string): Promise<PredictiveAnalytics> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        distributions: true,
        applications: true,
      },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    // Calculate conversion probability based on features
    let probability = 0;
    const factors: string[] = [];

    // Score completeness
    let completeness = 0;
    if (lead.firstName) completeness++;
    if (lead.lastName) completeness++;
    if (lead.phoneNumber) completeness++;
    if (lead.email) completeness++;
    if (lead.city) completeness++;
    if (lead.state) completeness++;
    if (lead.loanType) completeness++;
    if (lead.loanAmount) completeness++;

    const completenessScore = (completeness / 8) * 20;
    probability += completenessScore;
    if (completenessScore > 15) factors.push('Good data completeness');

    // Qualification score
    probability += (lead.qualificationScore / 100) * 30;
    if (lead.qualificationScore > 70) factors.push('High qualification score');

    // Recent leads
    const daysSinceCreated = Math.floor((Date.now() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceCreated < 7) {
      probability += 20;
      factors.push('Recent lead');
    } else if (daysSinceCreated < 30) {
      probability += 10;
    }

    // Distribution history
    if (lead.distributions.length > 0) {
      const accepted = lead.distributions.filter((d) => d.acceptanceStatus === 'ACCEPTED').length;
      const acceptanceRate = (accepted / lead.distributions.length) * 30;
      probability += acceptanceRate;
      if (accepted > 0) factors.push('Has been accepted by buyers');
    }

    // Predictions
    let prediction = 'Low';
    let action = 'Review and improve lead quality';

    if (probability >= 70) {
      prediction = 'High';
      action = 'Prioritize for distribution';
    } else if (probability >= 50) {
      prediction = 'Medium';
      action = 'Distribute with proper strategy';
    }

    return {
      leadId,
      predictionType: 'conversion_probability',
      prediction,
      confidence: Math.min(probability, 100),
      factors,
      action,
    };
  }

  /**
   * Segment leads for targeting
   */
  async segmentLeads(userId: string): Promise<SegmentationData[]> {
    const leads = await this.prisma.lead.findMany({
      where: { userId },
      select: {
        id: true,
        qualificationScore: true,
        loanType: true,
        loanAmount: true,
        city: true,
        state: true,
        status: true,
        distributions: {
          select: { acceptanceStatus: true },
        },
      },
    });

    const segments: Map<string, any> = new Map();

    for (const lead of leads) {
      // Segment by qualification + loan type
      const segmentKey = `${lead.loanType}_${lead.qualificationScore >= 70 ? 'high' : 'low'}`;

      if (!segments.has(segmentKey)) {
        segments.set(segmentKey, {
          leads: [],
          loanType: lead.loanType,
          qualityTier: lead.qualificationScore >= 70 ? 'high' : 'low',
        });
      }

      const segment = segments.get(segmentKey);
      segment.leads.push(lead);
    }

    // Generate segment data
    return Array.from(segments)
      .map(([key, data]) => {
        const accepted = data.leads.filter((l: any) =>
          l.distributions.some((d: any) => d.acceptanceStatus === 'ACCEPTED'),
        ).length;

        const avgScore =
          data.leads.reduce((sum: number, l: any) => sum + l.qualificationScore, 0) / data.leads.length;

        return {
          segmentId: key,
          name: `${data.loanType} (${data.qualityTier} quality)`,
          leadCount: data.leads.length,
          characteristics: {
            loanType: data.loanType,
            qualityTier: data.qualityTier,
          },
          avgScore: Math.round(avgScore),
          conversionRate: Math.round((accepted / data.leads.length) * 100),
        };
      })
      .sort((a, b) => b.conversionRate - a.conversionRate);
  }

  /**
   * Generate AI insights and recommendations
   */
  async generateInsights(userId: string): Promise<InsightRecommendation[]> {
    const [leads, distributions, commissions, campaigns] = await Promise.all([
      this.prisma.lead.findMany({ where: { userId } }),
      this.prisma.distribution.findMany({
        where: { lead: { userId } },
      }),
      this.prisma.commissionLedger.findMany({
        where: { lead: { userId } },
      }),
      this.prisma.campaign.findMany(),
    ]);

    const insights: InsightRecommendation[] = [];

    // Insight 1: Lead quality
    const avgScore = leads.length > 0 ? leads.reduce((sum, l) => sum + l.qualificationScore, 0) / leads.length : 0;
    if (avgScore < 60) {
      insights.push({
        category: 'Lead Quality',
        insight: 'Average lead score is below optimal threshold',
        impact: 'high',
        recommendation: 'Implement stricter lead qualification criteria or improve import data quality',
        priority: 1,
      });
    }

    // Insight 2: Distribution performance
    const accepted = distributions.filter((d) => d.acceptanceStatus === 'ACCEPTED').length;
    const acceptanceRate = distributions.length > 0 ? (accepted / distributions.length) * 100 : 0;
    if (acceptanceRate < 30) {
      insights.push({
        category: 'Distribution',
        insight: 'Low acceptance rate from buyers',
        impact: 'high',
        recommendation: 'Analyze buyer preferences and improve lead-buyer matching',
        priority: 2,
      });
    }

    // Insight 3: Revenue opportunity
    let totalCommission = new Decimal(0);
    for (const commission of commissions) {
      totalCommission = totalCommission.plus(commission.commissionAmount);
    }

    if (Number(totalCommission) < 1000) {
      insights.push({
        category: 'Revenue',
        insight: 'Low commission revenue opportunity',
        impact: 'medium',
        recommendation: 'Scale lead volume or target higher-value loan types',
        priority: 3,
      });
    }

    // Insight 4: Campaign efficiency
    if (campaigns.length > 0) {
      const avgLeadsPerCampaign = leads.length / campaigns.length;
      if (avgLeadsPerCampaign < 20) {
        insights.push({
          category: 'Campaigns',
          insight: 'Low leads per campaign',
          impact: 'medium',
          recommendation: 'Consolidate campaigns or increase marketing spend',
          priority: 4,
        });
      }
    }

    // Insight 5: Verification status
    const unverified = leads.filter((l) => l.status === 'NEW').length;
    if (unverified > leads.length * 0.3) {
      insights.push({
        category: 'Verification',
        insight: 'Large portion of leads pending verification',
        impact: 'low',
        recommendation: 'Run bulk verification to improve lead quality score',
        priority: 5,
      });
    }

    return insights.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Anomaly detection
   */
  async detectAnomalies(userId: string): Promise<
    Array<{
      type: string;
      severity: 'critical' | 'warning' | 'info';
      message: string;
      data: any;
    }>
  > {
    const anomalies: Array<{
      type: string;
      severity: 'critical' | 'warning' | 'info';
      message: string;
      data: any;
    }> = [];

    // Get recent leads
    const leads = await this.prisma.lead.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Check for sudden drop in lead volume
    const lastWeek = leads.filter(
      (l) => new Date().getTime() - l.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000,
    ).length;

    if (lastWeek === 0 && leads.length > 0) {
      anomalies.push({
        type: 'volume_drop',
        severity: 'warning',
        message: 'No leads generated in the last 7 days',
        data: { lastWeekCount: lastWeek },
      });
    }

    // Check for unusually high qualification scores
    const veryHighScores = leads.filter((l) => l.qualificationScore > 95).length;
    if (veryHighScores > leads.length * 0.5) {
      anomalies.push({
        type: 'score_inflation',
        severity: 'warning',
        message: 'Unusually high qualification scores detected',
        data: { veryHighScorePercentage: (veryHighScores / leads.length) * 100 },
      });
    }

    // Check for distribution bottleneck
    const distributions = await this.prisma.distribution.findMany({
      where: { lead: { userId } },
    });

    const pending = distributions.filter((d) => d.acceptanceStatus === 'PENDING').length;
    if (pending > distributions.length * 0.7) {
      anomalies.push({
        type: 'distribution_backlog',
        severity: 'info',
        message: 'Large pending distribution queue',
        data: { pendingCount: pending, totalCount: distributions.length },
      });
    }

    return anomalies;
  }

  /**
   * Cohort analysis
   */
  async cohortAnalysis(userId: string, cohortPeriodDays: number = 30): Promise<{
    cohortId: string;
    leadCount: number;
    daysSinceCreation: number;
    qualifiedCount: number;
    distributedCount: number;
    acceptedCount: number;
    retention: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - cohortPeriodDays);

    const leads = await this.prisma.lead.findMany({
      where: {
        userId,
        createdAt: { gte: cutoffDate },
      },
      include: {
        distributions: true,
      },
    });

    const qualified = leads.filter((l) => l.qualificationScore >= 60).length;
    const distributed = leads.filter((l) => l.distributions.length > 0).length;
    const accepted = leads.filter((l) =>
      l.distributions.some((d) => d.acceptanceStatus === 'ACCEPTED'),
    ).length;

    const retention = leads.length > 0 ? (distributed / leads.length) * 100 : 0;

    return {
      cohortId: `cohort_${cutoffDate.toISOString().split('T')[0]}`,
      leadCount: leads.length,
      daysSinceCreation: cohortPeriodDays,
      qualifiedCount: qualified,
      distributedCount: distributed,
      acceptedCount: accepted,
      retention: Math.round(retention),
    };
  }

  /**
   * Predictive churn analysis
   */
  async predictChurn(userId: string): Promise<{
    riskLevel: 'high' | 'medium' | 'low';
    probability: number;
    riskFactors: string[];
    recommendations: string[];
  }> {
    const [leads, distributions, commissions] = await Promise.all([
      this.prisma.lead.findMany({ where: { userId } }),
      this.prisma.distribution.findMany({ where: { lead: { userId } } }),
      this.prisma.commissionLedger.findMany({ where: { lead: { userId } } }),
    ]);

    let riskScore = 0;
    const riskFactors: string[] = [];

    // Factor 1: Inactivity
    const lastLeadDays = leads.length > 0
      ? Math.floor((Date.now() - Math.max(...leads.map((l) => l.createdAt.getTime()))) / (1000 * 60 * 60 * 24))
      : 30;

    if (lastLeadDays > 30) {
      riskScore += 30;
      riskFactors.push('No activity in 30+ days');
    } else if (lastLeadDays > 14) {
      riskScore += 15;
    }

    // Factor 2: Low conversion
    const acceptanceRate = distributions.length > 0
      ? distributions.filter((d) => d.acceptanceStatus === 'ACCEPTED').length / distributions.length
      : 0;

    if (acceptanceRate < 0.2) {
      riskScore += 25;
      riskFactors.push('Low acceptance rate (<20%)');
    }

    // Factor 3: Declining revenue
    const lastMonthCommissions = commissions.filter(
      (c) => new Date().getTime() - c.createdAt.getTime() < 30 * 24 * 60 * 60 * 1000,
    );

    if (lastMonthCommissions.length === 0 && commissions.length > 0) {
      riskScore += 25;
      riskFactors.push('No commissions in last month');
    }

    // Factor 4: Low quality leads
    const avgScore = leads.length > 0 ? leads.reduce((sum, l) => sum + l.qualificationScore, 0) / leads.length : 0;
    if (avgScore < 50) {
      riskScore += 20;
      riskFactors.push('Low average lead quality score');
    }

    let riskLevel: 'high' | 'medium' | 'low' = 'low';
    if (riskScore > 70) {
      riskLevel = 'high';
    } else if (riskScore > 40) {
      riskLevel = 'medium';
    }

    const recommendations: string[] = [];
    if (riskFactors.includes('No activity in 30+ days')) {
      recommendations.push('Resume lead generation or campaigns');
    }
    if (riskFactors.includes('Low acceptance rate (<20%)')) {
      recommendations.push('Improve lead quality and buyer matching');
    }
    if (riskFactors.includes('No commissions in last month')) {
      recommendations.push('Review commission settings and payment status');
    }
    if (riskFactors.includes('Low average lead quality score')) {
      recommendations.push('Implement stricter lead qualification');
    }

    return {
      riskLevel,
      probability: Math.min(riskScore, 100),
      riskFactors,
      recommendations,
    };
  }

  /**
   * LTV (Lifetime Value) calculation
   */
  async calculateLTV(leadId: string): Promise<{
    leadId: string;
    totalCommissions: Decimal;
    avgCommissionPerSale: Decimal;
    projectedLTV: Decimal;
    confidence: number;
  }> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        distributions: true,
        applications: true,
      },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    const commissions = await this.prisma.commissionLedger.findMany({
      where: { leadId },
    });

    let totalCommissions = new Decimal(0);
    for (const commission of commissions) {
      totalCommissions = totalCommissions.plus(commission.commissionAmount);
    }

    const acceptedDistributions = lead.distributions.filter(
      (d) => d.acceptanceStatus === 'ACCEPTED',
    ).length;

    const avgCommission =
      acceptedDistributions > 0 ? totalCommissions.dividedBy(acceptedDistributions) : new Decimal(0);

    // Project LTV based on acceptance rate
    const projectedAcceptances = acceptedDistributions + 1; // Assume at least one more
    const projectedLTV = avgCommission.times(projectedAcceptances);

    return {
      leadId,
      totalCommissions,
      avgCommissionPerSale: avgCommission,
      projectedLTV,
      confidence: acceptedDistributions > 0 ? Math.min(acceptedDistributions * 20, 100) : 0,
    };
  }
}
