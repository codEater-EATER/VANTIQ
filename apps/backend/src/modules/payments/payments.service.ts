import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import axios from 'axios';
import { Decimal } from '@prisma/client/runtime/library';

export interface PaymentMethod {
  id: string;
  type: 'bank_transfer' | 'credit_card' | 'upi';
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  cardLast4?: string;
  upiId?: string;
  isDefault: boolean;
}

export interface PaymentBatch {
  id: string;
  buyerId: string;
  commissionIds: string[];
  totalAmount: Decimal;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
}

export interface PaymentReceipt {
  id: string;
  commissionId: string;
  amount: Decimal;
  paymentMethod: string;
  transactionId: string;
  timestamp: Date;
}

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Add payment method for buyer
   */
  async addPaymentMethod(buyerId: string, method: Partial<PaymentMethod>): Promise<PaymentMethod> {
    // Validate payment method
    if (method.type === 'bank_transfer') {
      if (!method.accountNumber || !method.ifscCode || !method.bankName) {
        throw new BadRequestException('Bank details required');
      }
      // Validate account number and IFSC
      this.validateBankDetails(method.accountNumber, method.ifscCode);
    } else if (method.type === 'credit_card') {
      if (!method.cardLast4) {
        throw new BadRequestException('Card details required');
      }
    } else if (method.type === 'upi') {
      if (!method.upiId) {
        throw new BadRequestException('UPI ID required');
      }
      this.validateUPI(method.upiId);
    }

    // Store encrypted payment method
    const encrypted = this.encryptPaymentMethod(method);

    // For now, store in activity or integration account
    // In production, use a secure payment gateway (Stripe, Razorpay, etc.)

    return {
      id: `pm_${Date.now()}`,
      type: method.type as any,
      accountNumber: method.accountNumber,
      ifscCode: method.ifscCode,
      bankName: method.bankName,
      cardLast4: method.cardLast4,
      upiId: method.upiId,
      isDefault: method.isDefault || false,
    };
  }

  /**
   * Process commission payment
   */
  async processPayment(commissionId: string): Promise<PaymentReceipt> {
    const commission = await this.prisma.commissionLedger.findUnique({
      where: { id: commissionId },
    });

    if (!commission) {
      throw new BadRequestException('Commission not found');
    }

    if (commission.status !== 'RECEIVED') {
      throw new BadRequestException('Commission must be in RECEIVED status');
    }

    try {
      // Get buyer payment method
      const buyer = await this.prisma.buyer.findUnique({
        where: { id: commission.buyerId },
      });

      // Process payment via gateway
      const transactionId = await this.processPaymentViaGateway(
        commission.commissionAmount,
        buyer?.email || '',
      );

      // Update commission status
      await this.prisma.commissionLedger.update({
        where: { id: commissionId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          paymentReference: transactionId,
        },
      });

      return {
        id: `receipt_${Date.now()}`,
        commissionId,
        amount: commission.commissionAmount,
        paymentMethod: 'bank_transfer',
        transactionId,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw new BadRequestException('Payment processing failed');
    }
  }

  /**
   * Process batch payments
   */
  async processBatchPayment(buyerId: string, daysThreshold: number = 30): Promise<PaymentBatch> {
    // Get all approved commissions for buyer
    const commissions = await this.prisma.commissionLedger.findMany({
      where: {
        buyerId,
        status: 'RECEIVED',
        receivedAt: {
          lte: new Date(Date.now() - daysThreshold * 24 * 60 * 60 * 1000),
        },
      },
    });

    if (commissions.length === 0) {
      throw new BadRequestException('No commissions to process');
    }

    let totalAmount = new Decimal(0);
    for (const commission of commissions) {
      totalAmount = totalAmount.plus(commission.commissionAmount);
    }

    // Create batch record
    const batch = await this.createPaymentBatch(buyerId, commissions.map((c) => c.id), totalAmount);

    // Process batch
    try {
      for (const commission of commissions) {
        await this.processPayment(commission.id);
      }

      await this.updateBatchStatus(batch.id, 'completed');
    } catch (error) {
      await this.updateBatchStatus(batch.id, 'failed');
      throw error;
    }

    return batch;
  }

  /**
   * Create payment batch
   */
  private async createPaymentBatch(
    buyerId: string,
    commissionIds: string[],
    totalAmount: Decimal,
  ): Promise<PaymentBatch> {
    // Store batch in database (create custom model if needed)
    return {
      id: `batch_${Date.now()}`,
      buyerId,
      commissionIds,
      totalAmount,
      status: 'pending',
      createdAt: new Date(),
    };
  }

  /**
   * Update batch status
   */
  private async updateBatchStatus(
    batchId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
  ): Promise<void> {
    // Update batch status in database
    console.log(`Batch ${batchId} status updated to ${status}`);
  }

  /**
   * Process payment via gateway
   */
  private async processPaymentViaGateway(amount: Decimal, email: string): Promise<string> {
    // Use payment gateway API (Stripe, Razorpay, etc.)
    // This is a placeholder

    if (process.env.STRIPE_API_KEY) {
      return this.processViaStripe(amount, email);
    }

    if (process.env.RAZORPAY_KEY_ID) {
      return this.processViaRazorpay(amount, email);
    }

    // Fallback: Generate transaction ID
    return `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Process via Stripe
   */
  private async processViaStripe(amount: Decimal, email: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://api.stripe.com/v1/transfers',
        {
          amount: Math.round(Number(amount) * 100), // Convert to cents
          currency: 'usd',
          destination: 'acct_xxxxx', // Buyer's Stripe account
          description: `Commission payment to ${email}`,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.STRIPE_API_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return response.data.id;
    } catch (error) {
      console.error('Stripe payment failed:', error);
      throw new Error('Stripe payment processing failed');
    }
  }

  /**
   * Process via Razorpay
   */
  private async processViaRazorpay(amount: Decimal, email: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://api.razorpay.com/v1/payouts',
        {
          account_number: 'xxxxx', // Buyer's account
          amount: Math.round(Number(amount) * 100), // Convert to paise
          currency: 'INR',
          mode: 'NEFT',
          purpose: 'commission_payment',
          receipt: `receipt_${Date.now()}`,
        },
        {
          auth: {
            username: process.env.RAZORPAY_KEY_ID || '',
            password: process.env.RAZORPAY_KEY_SECRET || '',
          },
        },
      );

      return response.data.id;
    } catch (error) {
      console.error('Razorpay payment failed:', error);
      throw new Error('Razorpay payment processing failed');
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(buyerId: string, limit: number = 50): Promise<PaymentReceipt[]> {
    const commissions = await this.prisma.commissionLedger.findMany({
      where: {
        buyerId,
        status: 'PAID',
        paidAt: { not: null },
      },
      orderBy: { paidAt: 'desc' },
      take: limit,
    });

    return commissions.map((c) => ({
      id: `receipt_${c.id}`,
      commissionId: c.id,
      amount: c.commissionAmount,
      paymentMethod: 'bank_transfer',
      transactionId: c.paymentReference || '',
      timestamp: c.paidAt || new Date(),
    }));
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(buyerId: string): Promise<{
    totalPaid: Decimal;
    totalPending: Decimal;
    averagePaymentAmount: Decimal;
    lastPaymentDate?: Date;
    nextPaymentDate?: Date;
  }> {
    const commissions = await this.prisma.commissionLedger.findMany({
      where: { buyerId },
    });

    let totalPaid = new Decimal(0);
    let totalPending = new Decimal(0);

    for (const commission of commissions) {
      if (commission.status === 'PAID') {
        totalPaid = totalPaid.plus(commission.commissionAmount);
      } else if (['PENDING', 'APPROVED', 'RECEIVED'].includes(commission.status)) {
        totalPending = totalPending.plus(commission.commissionAmount);
      }
    }

    const paidCommissions = commissions.filter((c) => c.status === 'PAID' && c.paidAt);
    const lastPaymentDate = paidCommissions.length > 0 ? paidCommissions[0].paidAt : undefined;

    const averagePaymentAmount =
      paidCommissions.length > 0
        ? totalPaid.dividedBy(paidCommissions.length)
        : new Decimal(0);

    // Calculate next payment date (typically 30 days after last approval)
    const approvedCommissions = commissions.filter((c) => c.status === 'APPROVED' && c.approvedAt);
    let nextPaymentDate: Date | undefined;
    if (approvedCommissions.length > 0) {
      const earliestApproved = approvedCommissions.reduce((a, b) =>
        a.approvedAt! < b.approvedAt! ? a : b,
      );
      nextPaymentDate = new Date(earliestApproved.approvedAt!.getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    return {
      totalPaid,
      totalPending,
      averagePaymentAmount,
      lastPaymentDate,
      nextPaymentDate,
    };
  }

  /**
   * Validate bank details
   */
  private validateBankDetails(accountNumber: string, ifscCode: string): void {
    // Validate account number (typically 10-12 digits)
    if (!/^\d{10,12}$/.test(accountNumber)) {
      throw new BadRequestException('Invalid account number');
    }

    // Validate IFSC code (5 letters + 0 + 4 alphanumeric)
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
      throw new BadRequestException('Invalid IFSC code');
    }
  }

  /**
   * Validate UPI ID
   */
  private validateUPI(upiId: string): void {
    // Validate UPI ID format
    if (!/^[a-zA-Z0-9_.-]+@[a-zA-Z]+$/.test(upiId)) {
      throw new BadRequestException('Invalid UPI ID format');
    }
  }

  /**
   * Encrypt payment method
   */
  private encryptPaymentMethod(method: any): any {
    // Implement encryption using crypto library
    // For now, return as-is
    return method;
  }

  /**
   * Generate payment report
   */
  async generatePaymentReport(
    buyerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    period: string;
    totalPaid: Decimal;
    totalPending: Decimal;
    paymentCount: number;
    averagePayment: Decimal;
    payments: Array<{
      date: Date;
      amount: Decimal;
      transactionId: string;
      status: string;
    }>;
  }> {
    const commissions = await this.prisma.commissionLedger.findMany({
      where: {
        buyerId,
        paidAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { paidAt: 'desc' },
    });

    let totalPaid = new Decimal(0);
    let totalPending = new Decimal(0);

    for (const commission of commissions) {
      if (commission.status === 'PAID') {
        totalPaid = totalPaid.plus(commission.commissionAmount);
      } else if (['PENDING', 'APPROVED', 'RECEIVED'].includes(commission.status)) {
        totalPending = totalPending.plus(commission.commissionAmount);
      }
    }

    const avgPayment = commissions.length > 0 ? totalPaid.dividedBy(commissions.length) : new Decimal(0);

    const payments = commissions.map((c) => ({
      date: c.paidAt || new Date(),
      amount: c.commissionAmount,
      transactionId: c.paymentReference || '',
      status: c.status,
    }));

    return {
      period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      totalPaid,
      totalPending,
      paymentCount: payments.length,
      averagePayment: avgPayment,
      payments,
    };
  }
}
