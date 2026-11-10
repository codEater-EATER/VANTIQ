import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Lead } from '@prisma/client';

export interface QualificationRule {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'in';
  value: any;
  points: number;
}

export interface QualificationCriteria {
  userId: string;
  rules: QualificationRule[];
  minScore?: number;
}

@Injectable()
export class LeadQualificationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate qualification score for a lead
   */
  async calculateScore(leadId: string): Promise<number> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    return this.scoreLeadData(lead);
  }

  /**
   * Score lead based on data completeness and quality
   */
  private scoreLeadData(lead: Lead): number {
    let score = 0;

    // First Name (10 points)
    if (lead.firstName && lead.firstName.length >= 2) {
      score += 10;
    }

    // Last Name (10 points)
    if (lead.lastName && lead.lastName.length >= 2) {
      score += 10;
    }

    // Phone Number (15 points)
    if (lead.phoneNumber && this.isValidPhone(lead.phoneNumber)) {
      score += 15;
    }

    // Email (15 points)
    if (lead.email && this.isValidEmail(lead.email)) {
      score += 15;
    }

    // City (10 points)
    if (lead.city && lead.city.length >= 2) {
      score += 10;
    }

    // State (10 points)
    if (lead.state && lead.state.length >= 2) {
      score += 10;
    }

    // Loan Amount (15 points)
    if (lead.loanAmount && lead.loanAmount > 0) {
      score += 15;
    }

    // Recency bonus (5 points - created within last 7 days)
    const daysSinceCreated = Math.floor(
      (Date.now() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysSinceCreated <= 7) {
      score += 5;
    }

    // Cap at 100
    return Math.min(score, 100);
  }

  /**
   * Apply custom rules to lead and update score
   */
  async qualifyWithRules(
    leadId: string,
    rules: QualificationRule[],
  ): Promise<number> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    let score = this.scoreLeadData(lead);

    // Apply rules
    for (const rule of rules) {
      if (this.evaluateRule(lead, rule)) {
        score += rule.points;
      }
    }

    // Cap at 100
    score = Math.min(score, 100);

    // Update lead
    await this.prisma.lead.update({
      where: { id: leadId },
      data: { qualificationScore: score },
    });

    return score;
  }

  /**
   * Evaluate a single rule against lead data
   */
  private evaluateRule(lead: Lead, rule: QualificationRule): boolean {
    const value = this.getLeadFieldValue(lead, rule.field);

    switch (rule.operator) {
      case 'equals':
        return value === rule.value;
      case 'contains':
        return value && String(value).toLowerCase().includes(String(rule.value).toLowerCase());
      case 'greaterThan':
        return Number(value) > Number(rule.value);
      case 'lessThan':
        return Number(value) < Number(rule.value);
      case 'in':
        return Array.isArray(rule.value) && rule.value.includes(value);
      default:
        return false;
    }
  }

  /**
   * Get field value from lead
   */
  private getLeadFieldValue(lead: Lead, field: string): any {
    const fieldMap: Record<string, any> = {
      firstName: lead.firstName,
      lastName: lead.lastName,
      phoneNumber: lead.phoneNumber,
      email: lead.email,
      city: lead.city,
      state: lead.state,
      loanType: lead.loanType,
      loanAmount: lead.loanAmount,
      source: lead.source,
      status: lead.status,
    };
    return fieldMap[field];
  }

  /**
   * Bulk qualify leads
   */
  async bulkQualify(userId: string, rules?: QualificationRule[]): Promise<{
    processed: number;
    updated: number;
    avgScore: number;
  }> {
    const leads = await this.prisma.lead.findMany({
      where: { userId },
    });

    let updatedCount = 0;
    let totalScore = 0;

    for (const lead of leads) {
      let score = this.scoreLeadData(lead);

      if (rules && rules.length > 0) {
        for (const rule of rules) {
          if (this.evaluateRule(lead, rule)) {
            score += rule.points;
          }
        }
      }

      score = Math.min(score, 100);

      if (score !== lead.qualificationScore) {
        await this.prisma.lead.update({
          where: { id: lead.id },
          data: { qualificationScore: score },
        });
        updatedCount++;
      }

      totalScore += score;
    }

    const avgScore = leads.length > 0 ? Math.round(totalScore / leads.length) : 0;

    return {
      processed: leads.length,
      updated: updatedCount,
      avgScore,
    };
  }

  /**
   * Get qualified leads above threshold
   */
  async getQualifiedLeads(userId: string, minScore: number = 60): Promise<Lead[]> {
    return this.prisma.lead.findMany({
      where: {
        userId,
        qualificationScore: { gte: minScore },
      },
      orderBy: { qualificationScore: 'desc' },
    });
  }

  /**
   * Get qualification statistics
   */
  async getQualificationStats(userId: string): Promise<{
    totalLeads: number;
    averageScore: number;
    highQuality: number; // >= 80
    mediumQuality: number; // 60-79
    lowQuality: number; // < 60
    distribution: Array<{ score: number; count: number }>;
  }> {
    const leads = await this.prisma.lead.findMany({
      where: { userId },
      select: { qualificationScore: true },
    });

    const scores = leads.map((l) => l.qualificationScore);
    const total = scores.length;

    if (total === 0) {
      return {
        totalLeads: 0,
        averageScore: 0,
        highQuality: 0,
        mediumQuality: 0,
        lowQuality: 0,
        distribution: [],
      };
    }

    const highQuality = scores.filter((s) => s >= 80).length;
    const mediumQuality = scores.filter((s) => s >= 60 && s < 80).length;
    const lowQuality = scores.filter((s) => s < 60).length;
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / total);

    // Distribution by 10-point buckets
    const distribution = Array.from({ length: 10 }, (_, i) => {
      const min = i * 10;
      const max = (i + 1) * 10;
      const count = scores.filter((s) => s >= min && s < max).length;
      return { score: min, count };
    });

    return {
      totalLeads: total,
      averageScore: avgScore,
      highQuality,
      mediumQuality,
      lowQuality,
      distribution,
    };
  }

  /**
   * Create default rules for a user
   */
  async createDefaultRules(userId: string): Promise<QualificationRule[]> {
    const defaultRules: QualificationRule[] = [
      {
        id: 'rule-1',
        field: 'loanAmount',
        operator: 'greaterThan',
        value: 10000,
        points: 10,
      },
      {
        id: 'rule-2',
        field: 'loanAmount',
        operator: 'greaterThan',
        value: 50000,
        points: 10,
      },
      {
        id: 'rule-3',
        field: 'email',
        operator: 'contains',
        value: '@',
        points: 5,
      },
      {
        id: 'rule-4',
        field: 'source',
        operator: 'in',
        value: ['ORGANIC', 'IMPORT'],
        points: 5,
      },
    ];

    return defaultRules;
  }

  /**
   * Validate phone number
   */
  private isValidPhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  }

  /**
   * Validate email
   */
  private isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Get leads by quality tier
   */
  async getLeadsByTier(userId: string): Promise<{
    premium: Lead[]; // >= 80
    standard: Lead[]; // 60-79
    bronze: Lead[]; // < 60
  }> {
    const [premium, standard, bronze] = await Promise.all([
      this.prisma.lead.findMany({
        where: { userId, qualificationScore: { gte: 80 } },
        orderBy: { qualificationScore: 'desc' },
        take: 100,
      }),
      this.prisma.lead.findMany({
        where: { userId, qualificationScore: { gte: 60, lt: 80 } },
        orderBy: { qualificationScore: 'desc' },
        take: 100,
      }),
      this.prisma.lead.findMany({
        where: { userId, qualificationScore: { lt: 60 } },
        orderBy: { qualificationScore: 'desc' },
        take: 100,
      }),
    ]);

    return { premium, standard, bronze };
  }

  /**
   * Auto-update lead status based on score
   */
  async updateLeadStatusByScore(leadId: string, score: number): Promise<void> {
    let newStatus = 'NEW';

    if (score >= 80) {
      newStatus = 'QUALIFIED';
    } else if (score >= 60) {
      newStatus = 'VERIFICATION_PENDING';
    }

    await this.prisma.lead.update({
      where: { id: leadId },
      data: { status: newStatus },
    });
  }
}
