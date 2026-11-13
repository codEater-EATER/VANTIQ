import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import axios from 'axios';

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  secret?: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  payload: any;
  timestamp: Date;
  delivered: boolean;
  deliveredAt?: Date;
  attempts: number;
  nextRetry?: Date;
}

@Injectable()
export class WebhookService {
  constructor(private prisma: PrismaService) {}

  /**
   * Register webhook for buyer
   */
  async registerWebhook(buyerId: string, config: Partial<WebhookConfig>): Promise<WebhookConfig> {
    // Validate webhook URL
    try {
      await axios.head(config.url!);
    } catch (error) {
      throw new Error('Invalid webhook URL');
    }

    // Generate webhook secret
    const secret = this.generateWebhookSecret();

    // Store webhook configuration
    const webhook = await this.prisma.integrationAccount.create({
      data: {
        provider: 'WEBHOOK',
        accountName: config.name || 'Webhook',
        config: JSON.stringify({
          url: config.url,
          events: config.events || ['distribution.created', 'distribution.accepted'],
          secret,
          active: true,
        }),
        status: 'CONNECTED',
      },
    });

    return {
      id: webhook.id,
      name: config.name || 'Webhook',
      url: config.url!,
      events: config.events || [],
      active: true,
      secret,
    };
  }

  /**
   * Trigger webhook event
   */
  async triggerWebhook(buyerId: string, eventType: string, payload: any): Promise<void> {
    try {
      const webhooks = await this.prisma.integrationAccount.findMany({
        where: { provider: 'WEBHOOK' },
      });

      for (const webhook of webhooks) {
        const config = JSON.parse(webhook.config);

        if (!config.active || !config.events.includes(eventType)) {
          continue;
        }

        // Send webhook event
        await this.sendWebhookEvent(config.url, eventType, payload, config.secret);
      }
    } catch (error) {
      console.error('Webhook trigger failed:', error);
    }
  }

  /**
   * Send webhook event to buyer
   */
  private async sendWebhookEvent(
    url: string,
    eventType: string,
    payload: any,
    secret?: string,
  ): Promise<void> {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
        'X-Webhook-Event': eventType,
        'X-Webhook-Timestamp': new Date().toISOString(),
      };

      // Add signature if secret is provided
      if (secret) {
        const signature = this.generateSignature(JSON.stringify(payload), secret);
        headers['X-Webhook-Signature'] = signature;
      }

      const response = await axios.post(url, payload, {
        headers,
        timeout: 30000, // 30 seconds
      });

      if (response.status >= 200 && response.status < 300) {
        console.log(`Webhook delivered successfully to ${url}`);
      } else {
        console.error(`Webhook delivery failed with status ${response.status}`);
      }
    } catch (error) {
      console.error(`Failed to deliver webhook to ${url}:`, error);
      // Implement retry logic if needed
    }
  }

  /**
   * Generate webhook signature
   */
  private generateSignature(payload: string, secret: string): string {
    const crypto = require('crypto');
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Generate webhook secret
   */
  private generateWebhookSecret(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * List webhooks for buyer
   */
  async listWebhooks(buyerId: string): Promise<WebhookConfig[]> {
    const webhooks = await this.prisma.integrationAccount.findMany({
      where: {
        provider: 'WEBHOOK',
      },
    });

    return webhooks.map((w: any) => {
      const config = JSON.parse(w.config);
      return {
        id: w.id,
        name: w.accountName,
        url: config.url,
        events: config.events,
        active: config.active,
      };
    });
  }

  /**
   * Update webhook
   */
  async updateWebhook(webhookId: string, config: Partial<WebhookConfig>): Promise<WebhookConfig> {
    const webhook = await this.prisma.integrationAccount.findUnique({
      where: { id: webhookId },
    });

    if (!webhook) {
      throw new Error('Webhook not found');
    }

    const currentConfig = JSON.parse(webhook.config);
    const updated = await this.prisma.integrationAccount.update({
      where: { id: webhookId },
      data: {
        accountName: config.name || currentConfig.accountName,
        config: JSON.stringify({
          ...currentConfig,
          url: config.url || currentConfig.url,
          events: config.events || currentConfig.events,
          active: config.active !== undefined ? config.active : currentConfig.active,
        }),
      },
    });

    const updatedConfig = JSON.parse(updated.config);
    return {
      id: updated.id,
      name: updated.accountName,
      url: updatedConfig.url,
      events: updatedConfig.events,
      active: updatedConfig.active,
    };
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    await this.prisma.integrationAccount.delete({
      where: { id: webhookId },
    });
  }

  /**
   * Test webhook
   */
  async testWebhook(webhookId: string): Promise<{ success: boolean; message: string }> {
    const webhook = await this.prisma.integrationAccount.findUnique({
      where: { id: webhookId },
    });

    if (!webhook) {
      return { success: false, message: 'Webhook not found' };
    }

    const config = JSON.parse(webhook.config);
    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook event',
      },
    };

    try {
      await this.sendWebhookEvent(config.url, 'webhook.test', testPayload, config.secret);
      return { success: true, message: 'Test webhook sent successfully' };
    } catch (error) {
      return { success: false, message: `Test failed: ${error}` };
    }
  }

  /**
   * Get webhook delivery history
   */
  async getWebhookHistory(webhookId: string, limit: number = 50): Promise<WebhookEvent[]> {
    const jobs = await this.prisma.integrationJob.findMany({
      where: {
        accountId: webhookId,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return jobs.map((j: any) => {
      const result = JSON.parse(j.result || '{}');
      return {
        id: j.id,
        type: j.jobType,
        payload: JSON.parse(j.config),
        timestamp: j.createdAt,
        delivered: j.status === 'COMPLETED',
        deliveredAt: j.completedAt || undefined,
        attempts: 1,
      };
    });
  }

  /**
   * Emit distribution created event
   */
  async onDistributionCreated(distributionId: string): Promise<void> {
    const distribution = await this.prisma.distribution.findUnique({
      where: { id: distributionId },
      include: {
        lead: true,
        agreement: true,
      },
    });

    if (!distribution) return;

    const payload = {
      event: 'distribution.created',
      timestamp: new Date().toISOString(),
      data: {
        distributionId: distribution.id,
        leadId: distribution.leadId,
        buyerId: distribution.buyerId,
        leadData: {
          name: `${distribution.lead.firstName} ${distribution.lead.lastName}`,
          email: distribution.lead.email,
          phone: distribution.lead.phoneNumber,
          loanType: distribution.lead.loanType,
          loanAmount: distribution.lead.loanAmount,
          qualificationScore: distribution.lead.qualificationScore,
        },
      },
    };

    await this.triggerWebhook(distribution.buyerId, 'distribution.created', payload);
  }

  /**
   * Emit distribution accepted event
   */
  async onDistributionAccepted(distributionId: string): Promise<void> {
    const distribution = await this.prisma.distribution.findUnique({
      where: { id: distributionId },
    });

    if (!distribution) return;

    const payload = {
      event: 'distribution.accepted',
      timestamp: new Date().toISOString(),
      data: {
        distributionId: distribution.id,
        leadId: distribution.leadId,
        buyerId: distribution.buyerId,
        acceptedAt: distribution.acceptedAt,
      },
    };

    await this.triggerWebhook(distribution.buyerId, 'distribution.accepted', payload);
  }

  /**
   * Emit distribution rejected event
   */
  async onDistributionRejected(distributionId: string, reason?: string): Promise<void> {
    const distribution = await this.prisma.distribution.findUnique({
      where: { id: distributionId },
    });

    if (!distribution) return;

    const payload = {
      event: 'distribution.rejected',
      timestamp: new Date().toISOString(),
      data: {
        distributionId: distribution.id,
        leadId: distribution.leadId,
        buyerId: distribution.buyerId,
        reason,
        rejectedAt: distribution.rejectedAt,
      },
    };

    await this.triggerWebhook(distribution.buyerId, 'distribution.rejected', payload);
  }

  /**
   * Emit commission created event
   */
  async onCommissionCreated(commissionId: string): Promise<void> {
    const commission = await this.prisma.commissionLedger.findUnique({
      where: { id: commissionId },
    });

    if (!commission) return;

    const payload = {
      event: 'commission.created',
      timestamp: new Date().toISOString(),
      data: {
        commissionId: commission.id,
        leadId: commission.leadId,
        buyerId: commission.buyerId,
        disburseAmount: commission.disburseAmount.toString(),
        commissionAmount: commission.commissionAmount.toString(),
        status: commission.status,
      },
    };

    await this.triggerWebhook(commission.buyerId, 'commission.created', payload);
  }

  /**
   * Emit commission paid event
   */
  async onCommissionPaid(commissionId: string): Promise<void> {
    const commission = await this.prisma.commissionLedger.findUnique({
      where: { id: commissionId },
    });

    if (!commission) return;

    const payload = {
      event: 'commission.paid',
      timestamp: new Date().toISOString(),
      data: {
        commissionId: commission.id,
        leadId: commission.leadId,
        buyerId: commission.buyerId,
        commissionAmount: commission.commissionAmount.toString(),
        paidAt: commission.paidAt,
        paymentReference: commission.paymentReference,
      },
    };

    await this.triggerWebhook(commission.buyerId, 'commission.paid', payload);
  }

  /**
   * Get webhook statistics
   */
  async getWebhookStats(buyerId: string): Promise<{
    totalWebhooks: number;
    activeWebhooks: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    totalEvents: number;
  }> {
    const webhooks = await this.prisma.integrationAccount.findMany({
      where: { provider: 'WEBHOOK' },
    });

    let activeCount = 0;
    for (const webhook of webhooks) {
      const config = JSON.parse(webhook.config);
      if (config.active) activeCount++;
    }

    return {
      totalWebhooks: webhooks.length,
      activeWebhooks: activeCount,
      successfulDeliveries: 0, // Implement tracking
      failedDeliveries: 0, // Implement tracking
      totalEvents: 0, // Implement tracking
    };
  }
}
