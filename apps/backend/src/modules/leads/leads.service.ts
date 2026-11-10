import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { LeadStatus } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async createLead(userId: string, data: any) {
    // Generate VANTIQ lead ID
    const lead = await this.prisma.lead.create({
      data: {
        userId,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        email: data.email,
        city: data.city,
        state: data.state || 'Gujarat',
        loanType: data.loanType,
        loanAmount: data.loanAmount,
        source: data.source,
        campaignId: data.campaignId,
        status: LeadStatus.NEW,
      },
      include: {
        identifiers: true,
        consent: true,
      },
    });

    return lead;
  }

  async getLeads(userId: string, filters?: any) {
    return this.prisma.lead.findMany({
      where: {
        userId,
        ...filters,
      },
      include: {
        campaign: true,
        distributions: true,
      },
    });
  }

  async getLead(id: string) {
    return this.prisma.lead.findUnique({
      where: { id },
      include: {
        identifiers: true,
        consent: true,
        activities: true,
        distributions: true,
        applications: true,
        statusHistory: true,
      },
    });
  }

  async updateLeadStatus(leadId: string, status: LeadStatus, reason?: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    // Record status change in history
    await this.prisma.leadStatusHistory.create({
      data: {
        leadId,
        previousStatus: lead.status,
        newStatus: status,
        reason,
      },
    });

    return this.prisma.lead.update({
      where: { id: leadId },
      data: { status },
    });
  }
}
