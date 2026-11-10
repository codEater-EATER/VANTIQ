import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as XLSX from 'xlsx';
import { Lead, LeadIdentifier } from '@prisma/client';
import * as crypto from 'crypto';

export interface LeadImportRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  city: string;
  state: string;
  loanType: string;
  loanAmount?: number;
  source: string;
  externalId?: string;
}

export interface ImportResult {
  totalRecords: number;
  successfulImports: number;
  duplicatesFound: number;
  failedImports: number;
  errors: Array<{ row: number; error: string }>;
  duplicateDetails: Array<{ row: number; matchedLeadId: string }>;
}

@Injectable()
export class LeadImportService {
  constructor(private prisma: PrismaService) {}

  /**
   * Parse CSV file and return lead records
   */
  async parseCSV(fileBuffer: Buffer): Promise<LeadImportRequest[]> {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet) as any[];

      return data.map((row: any) => ({
        firstName: row['First Name'] || row['firstName'] || '',
        lastName: row['Last Name'] || row['lastName'] || '',
        phoneNumber: this.normalizePhone(row['Phone Number'] || row['phoneNumber'] || ''),
        email: (row['Email'] || row['email'] || '').toLowerCase().trim(),
        city: row['City'] || row['city'] || '',
        state: row['State'] || row['state'] || '',
        loanType: row['Loan Type'] || row['loanType'] || 'PERSONAL',
        loanAmount: parseInt(row['Loan Amount'] || row['loanAmount']) || undefined,
        source: row['Source'] || row['source'] || 'IMPORT',
        externalId: row['External ID'] || row['externalId'] || undefined,
      }));
    } catch (error) {
      throw new BadRequestException(`Failed to parse CSV file: ${error.message}`);
    }
  }

  /**
   * Parse XLSX file and return lead records
   */
  async parseXLSX(fileBuffer: Buffer): Promise<LeadImportRequest[]> {
    try {
      return this.parseCSV(fileBuffer); // XLSX is handled by xlsx library
    } catch (error) {
      throw new BadRequestException(`Failed to parse XLSX file: ${error.message}`);
    }
  }

  /**
   * Validate lead data
   */
  private validateLead(lead: LeadImportRequest, rowNumber: number): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!lead.firstName || lead.firstName.trim() === '') {
      errors.push('First name is required');
    }
    if (!lead.lastName || lead.lastName.trim() === '') {
      errors.push('Last name is required');
    }
    if (!lead.phoneNumber || lead.phoneNumber.trim() === '') {
      errors.push('Phone number is required');
    } else if (!this.isValidPhone(lead.phoneNumber)) {
      errors.push('Invalid phone number format');
    }
    if (lead.email && !this.isValidEmail(lead.email)) {
      errors.push('Invalid email format');
    }
    if (!lead.city || lead.city.trim() === '') {
      errors.push('City is required');
    }
    if (!lead.state || lead.state.trim() === '') {
      errors.push('State is required');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Normalize phone number to E.164 format
   */
  private normalizePhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `1${cleaned}`; // Assume US number
    }
    return cleaned;
  }

  /**
   * Validate phone number format
   */
  private isValidPhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Create hash for duplicate detection
   */
  private createIdentifierHash(type: string, value: string): string {
    return crypto.createHash('sha256').update(`${type}:${value}`).digest('hex');
  }

  /**
   * Import leads from file
   */
  async importLeads(
    userId: string,
    fileBuffer: Buffer,
    fileName: string,
    campaignId?: string,
  ): Promise<ImportResult> {
    let leads: LeadImportRequest[];
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    try {
      if (fileExtension === 'csv') {
        leads = await this.parseCSV(fileBuffer);
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        leads = await this.parseXLSX(fileBuffer);
      } else {
        throw new BadRequestException('Only CSV and XLSX files are supported');
      }
    } catch (error) {
      throw new BadRequestException(`File parsing error: ${error.message}`);
    }

    const result: ImportResult = {
      totalRecords: leads.length,
      successfulImports: 0,
      duplicatesFound: 0,
      failedImports: 0,
      errors: [],
      duplicateDetails: [],
    };

    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];
      const rowNumber = i + 2; // Row 1 is header

      // Validate lead
      const validation = this.validateLead(lead, rowNumber);
      if (!validation.valid) {
        result.failedImports++;
        result.errors.push({
          row: rowNumber,
          error: validation.errors.join('; '),
        });
        continue;
      }

      try {
        // Check for duplicates
        const duplicateCheck = await this.checkForDuplicates(lead, userId);

        if (duplicateCheck.isDuplicate) {
          result.duplicatesFound++;
          result.duplicateDetails.push({
            row: rowNumber,
            matchedLeadId: duplicateCheck.matchedLeadId!,
          });
          continue;
        }

        // Create lead
        const newLead = await this.createLeadWithIdentifiers(userId, lead, campaignId);
        result.successfulImports++;
      } catch (error) {
        result.failedImports++;
        result.errors.push({
          row: rowNumber,
          error: error.message || 'Unknown error',
        });
      }
    }

    return result;
  }

  /**
   * Check for duplicate leads
   */
  private async checkForDuplicates(
    lead: LeadImportRequest,
    userId: string,
  ): Promise<{ isDuplicate: boolean; matchedLeadId?: string }> {
    // Check by phone + email combination (most reliable)
    if (lead.phoneNumber && lead.email) {
      const existingLead = await this.prisma.lead.findFirst({
        where: {
          userId,
          phoneNumber: lead.phoneNumber,
          email: lead.email,
        },
      });

      if (existingLead) {
        return { isDuplicate: true, matchedLeadId: existingLead.id };
      }
    }

    // Check by phone only
    if (lead.phoneNumber) {
      const existingLead = await this.prisma.lead.findFirst({
        where: {
          userId,
          phoneNumber: lead.phoneNumber,
        },
      });

      if (existingLead) {
        return { isDuplicate: true, matchedLeadId: existingLead.id };
      }
    }

    // Check by email only
    if (lead.email) {
      const existingLead = await this.prisma.lead.findFirst({
        where: {
          userId,
          email: lead.email,
        },
      });

      if (existingLead) {
        return { isDuplicate: true, matchedLeadId: existingLead.id };
      }
    }

    return { isDuplicate: false };
  }

  /**
   * Create lead with identifiers for deduplication
   */
  private async createLeadWithIdentifiers(
    userId: string,
    leadData: LeadImportRequest,
    campaignId?: string,
  ): Promise<Lead> {
    return this.prisma.lead.create({
      data: {
        userId,
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        phoneNumber: leadData.phoneNumber,
        email: leadData.email,
        city: leadData.city,
        state: leadData.state,
        loanType: leadData.loanType,
        loanAmount: leadData.loanAmount,
        source: leadData.source,
        externalId: leadData.externalId,
        campaignId,
        status: 'NEW',
        identifiers: {
          create: [
            ...(leadData.phoneNumber
              ? [
                  {
                    type: 'PHONE',
                    value: leadData.phoneNumber,
                    hash: this.createIdentifierHash('PHONE', leadData.phoneNumber),
                    verified: false,
                  },
                ]
              : []),
            ...(leadData.email
              ? [
                  {
                    type: 'EMAIL',
                    value: leadData.email,
                    hash: this.createIdentifierHash('EMAIL', leadData.email),
                    verified: false,
                  },
                ]
              : []),
          ],
        },
      },
    });
  }

  /**
   * Get import statistics for a user
   */
  async getImportStats(userId: string): Promise<{
    totalLeads: number;
    thisMonth: number;
    thisWeek: number;
    today: number;
  }> {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalLeads, thisMonth, thisWeek, today] = await Promise.all([
      this.prisma.lead.count({ where: { userId } }),
      this.prisma.lead.count({ where: { userId, createdAt: { gte: thisMonthStart } } }),
      this.prisma.lead.count({ where: { userId, createdAt: { gte: thisWeekStart } } }),
      this.prisma.lead.count({ where: { userId, createdAt: { gte: todayStart } } }),
    ]);

    return { totalLeads, thisMonth, thisWeek, today };
  }
}
