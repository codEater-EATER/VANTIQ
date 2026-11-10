import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CommissionLedger, CommissionStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface CommissionCalculation {
  disbursementAmount: Decimal;
  commissionType: string;
  commissionValue: Decimal;
  commissionPercentage?: Decimal;
  finalAmount: Decimal;
}

@Injectable()
export class CommissionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate commission based on agreement
   */
  calculateCommission(
    disbursementAmount: Decimal | number,
    commissionType: string,
    commissionValue: Decimal | number,
    commissionPercentage?: Decimal | number,
  ): CommissionCalculation {
    const amount = new Decimal(disbursementAmount);
    const value = new Decimal(commissionValue);
    const percentage = commissionPercentage ? new Decimal(commissionPercentage) : new Decimal(0);

    let finalAmount: Decimal;

    switch (commissionType) {
      case 'FIXED':
        finalAmount = value;
        break;
      case 'PERCENTAGE':
        finalAmount = amount.times(percentage).dividedBy(100);
        break;
      case 'TIERED':
        // Implement tiered logic
        if (amount.greaterThan(50000)) {
          finalAmount = amount.times(5).dividedBy(100);
        } else if (amount.greaterThan(25000)) {
          finalAmount = amount.times(3).dividedBy(100);
        } else {
          finalAmount = amount.times(1).dividedBy(100);
        }
        break;
      default:
        finalAmount = value;
    }

    return {
      disbursementAmount: amount,
      commissionType,
      commissionValue: value,
      commissionPercentage: percentage,
      finalAmount,
    };
  }

  /**
   * Create commission ledger entry
   */
  async createCommissionEntry(
    leadId: string,
    buyerId: string,
    disbursementAmount: Decimal | number,
    agreement: any,
  ): Promise<CommissionLedger> {
    const calculation = this.calculateCommission(
      disbursementAmount,
      agreement.commissionType,
      agreement.commissionValue,
      agreement.commissionPercentage,
    );

    return this.prisma.commissionLedger.create({
      data: {
        leadId,
        buyerId,
        disburseAmount: new Decimal(disbursementAmount),
        commissionAmount: calculation.finalAmount,
        status: 'PENDING',
      },
    });
  }

  /**
   * Approve commission (move to APPROVED status)
   */
  async approveCommission(commissionId: string): Promise<CommissionLedger> {
    return this.prisma.commissionLedger.update({
      where: { id: commissionId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      },
    });
  }

  /**
   * Mark commission as received
   */
  async markAsReceived(commissionId: string): Promise<CommissionLedger> {
    return this.prisma.commissionLedger.update({
      where: { id: commissionId },
      data: {
        status: 'RECEIVED',
        receivedAt: new Date(),
      },
    });
  }

  /**
   * Mark commission as paid
   */
  async markAsPaid(
    commissionId: string,
    paymentReference?: string,
  ): Promise<CommissionLedger> {
    return this.prisma.commissionLedger.update({
      where: { id: commissionId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        paymentReference,
      },
    });
  }

  /**
   * Get commission ledger
   */
  async getCommissionLedger(buyerId: string): Promise<CommissionLedger[]> {
    return this.prisma.commissionLedger.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get commission statistics
   */
  async getCommissionStats(buyerId: string): Promise<{
    total: Decimal;
    pending: Decimal;
    approved: Decimal;
    received: Decimal;
    paid: Decimal;
    outstanding: Decimal;
    count: { total: number; pending: number; approved: number; paid: number };
  }> {
    const ledgers = await this.prisma.commissionLedger.findMany({
      where: { buyerId },
    });

    const stats = {
      total: new Decimal(0),
      pending: new Decimal(0),
      approved: new Decimal(0),
      received: new Decimal(0),
      paid: new Decimal(0),
      outstanding: new Decimal(0),
      count: { total: 0, pending: 0, approved: 0, paid: 0 },
    };

    for (const ledger of ledgers) {
      stats.total = stats.total.plus(ledger.commissionAmount);
      stats.count.total++;

      switch (ledger.status) {
        case 'PENDING':
          stats.pending = stats.pending.plus(ledger.commissionAmount);
          stats.count.pending++;
          break;
        case 'APPROVED':
          stats.approved = stats.approved.plus(ledger.commissionAmount);
          break;
        case 'RECEIVED':
          stats.received = stats.received.plus(ledger.commissionAmount);
          break;
        case 'PAID':
          stats.paid = stats.paid.plus(ledger.commissionAmount);
          stats.count.paid++;
          break;
        case 'OUTSTANDING':
          stats.outstanding = stats.outstanding.plus(ledger.commissionAmount);
          break;
      }
    }

    return stats;
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(buyerId: string): Promise<CommissionLedger[]> {
    return this.prisma.commissionLedger.findMany({
      where: {
        buyerId,
        status: 'PAID',
      },
      orderBy: { paidAt: 'desc' },
    });
  }

  /**
   * Generate payment schedule
   */
  async generatePaymentSchedule(buyerId: string): Promise<{
    dueNow: CommissionLedger[];
    due7Days: CommissionLedger[];
    due30Days: CommissionLedger[];
    overdue: CommissionLedger[];
  }> {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const ledgers = await this.prisma.commissionLedger.findMany({
      where: {
        buyerId,
        status: { in: ['APPROVED', 'RECEIVED'] },
      },
      include: {
        lead: {
          include: { application: true },
        },
      },
    });

    const dueNow: CommissionLedger[] = [];
    const due7Days: CommissionLedger[] = [];
    const due30Days: CommissionLedger[] = [];
    const overdue: CommissionLedger[] = [];

    for (const ledger of ledgers) {
      const dueDate = new Date(ledger.approvedAt || ledger.createdAt);
      dueDate.setDate(dueDate.getDate() + 30); // 30-day payment term

      if (dueDate <= now) {
        overdue.push(ledger);
      } else if (dueDate <= in7Days) {
        dueNow.push(ledger);
      } else if (dueDate <= in30Days) {
        due7Days.push(ledger);
      } else {
        due30Days.push(ledger);
      }
    }

    return { dueNow, due7Days, due30Days, overdue };
  }

  /**
   * Dispute commission
   */
  async disputeCommission(commissionId: string, reason: string): Promise<CommissionLedger> {
    return this.prisma.commissionLedger.update({
      where: { id: commissionId },
      data: {
        status: 'DISPUTED',
        notes: reason,
      },
    });
  }

  /**
   * Get disputed commissions
   */
  async getDisputedCommissions(buyerId: string): Promise<CommissionLedger[]> {
    return this.prisma.commissionLedger.findMany({
      where: {
        buyerId,
        status: 'DISPUTED',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Resolve dispute
   */
  async resolveDispute(
    commissionId: string,
    approved: boolean,
    notes?: string,
  ): Promise<CommissionLedger> {
    return this.prisma.commissionLedger.update({
      where: { id: commissionId },
      data: {
        status: approved ? 'APPROVED' : 'REJECTED',
        notes,
      },
    });
  }

  /**
   * Calculate total commission for user
   */
  async getTotalUserCommission(userId: string): Promise<{
    total: Decimal;
    paid: Decimal;
    pending: Decimal;
    disputed: Decimal;
  }> {
    const commissions = await this.prisma.commissionLedger.findMany({
      where: {
        lead: { userId },
      },
    });

    let total = new Decimal(0);
    let paid = new Decimal(0);
    let pending = new Decimal(0);
    let disputed = new Decimal(0);

    for (const commission of commissions) {
      total = total.plus(commission.commissionAmount);

      if (commission.status === 'PAID') {
        paid = paid.plus(commission.commissionAmount);
      } else if (commission.status === 'DISPUTED') {
        disputed = disputed.plus(commission.commissionAmount);
      } else if (['PENDING', 'APPROVED', 'RECEIVED'].includes(commission.status)) {
        pending = pending.plus(commission.commissionAmount);
      }
    }

    return { total, paid, pending, disputed };
  }

  /**
   * Get commission by disbursement
   */
  async getCommissionByDisbursement(disbursementId: string): Promise<CommissionLedger | null> {
    return this.prisma.commissionLedger.findFirst({
      where: {
        disbursement: {
          id: disbursementId,
        },
      },
    });
  }

  /**
   * Generate commission report
   */
  async generateCommissionReport(userId: string, startDate: Date, endDate: Date): Promise<{
    period: string;
    totalLeads: number;
    totalDisbursed: Decimal;
    totalCommission: Decimal;
    averageCommission: Decimal;
    byStatus: Record<string, Decimal>;
    topBuyers: Array<{ buyerId: string; amount: Decimal; count: number }>;
  }> {
    const commissions = await this.prisma.commissionLedger.findMany({
      where: {
        lead: { userId },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { lead: true },
    });

    let totalDisbursed = new Decimal(0);
    let totalCommission = new Decimal(0);
    const byStatus: Record<string, Decimal> = {};
    const buyerMap = new Map<string, { amount: Decimal; count: number }>();

    for (const commission of commissions) {
      totalDisbursed = totalDisbursed.plus(commission.disburseAmount);
      totalCommission = totalCommission.plus(commission.commissionAmount);

      // By status
      if (!byStatus[commission.status]) {
        byStatus[commission.status] = new Decimal(0);
      }
      byStatus[commission.status] = byStatus[commission.status].plus(commission.commissionAmount);

      // By buyer
      if (!buyerMap.has(commission.buyerId)) {
        buyerMap.set(commission.buyerId, { amount: new Decimal(0), count: 0 });
      }
      const buyerData = buyerMap.get(commission.buyerId)!;
      buyerData.amount = buyerData.amount.plus(commission.commissionAmount);
      buyerData.count++;
    }

    const topBuyers = Array.from(buyerMap)
      .map(([buyerId, data]) => ({ buyerId, ...data }))
      .sort((a, b) => b.amount.toNumber() - a.amount.toNumber())
      .slice(0, 10);

    const avgCommission =
      commissions.length > 0 ? totalCommission.dividedBy(commissions.length) : new Decimal(0);

    return {
      period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      totalLeads: commissions.length,
      totalDisbursed,
      totalCommission,
      averageCommission: avgCommission,
      byStatus,
      topBuyers,
    };
  }
}
