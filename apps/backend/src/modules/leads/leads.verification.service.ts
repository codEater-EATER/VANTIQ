import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import axios from 'axios';
import * as nodemailer from 'nodemailer';

export interface VerificationResult {
  phoneValid: boolean;
  emailValid: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  verificationScore: number; // 0-100
  details: {
    phoneCarrier?: string;
    phoneType?: string; // mobile, landline
    emailDomain?: string;
    emailDomainValid?: boolean;
  };
}

@Injectable()
export class LeadVerificationService {
  private emailTransporter: any;

  constructor(private prisma: PrismaService) {
    // Initialize email transporter (configure with your SMTP)
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  /**
   * Verify phone number format and carrier
   */
  async verifyPhoneNumber(phoneNumber: string): Promise<{
    valid: boolean;
    carrier?: string;
    type?: string;
  }> {
    // Basic validation
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length < 10 || cleaned.length > 15) {
      return { valid: false };
    }

    try {
      // Use Twilio Lookup API if configured
      if (process.env.TWILIO_ACCOUNT_SID) {
        const response = await axios.get(
          `https://lookups.twilio.com/v1/PhoneNumbers/${phoneNumber}`,
          {
            auth: {
              username: process.env.TWILIO_ACCOUNT_SID,
              password: process.env.TWILIO_AUTH_TOKEN,
            },
          },
        );

        return {
          valid: response.data.valid,
          carrier: response.data.carrier?.name,
          type: response.data.type,
        };
      }

      // Fallback: Basic format validation
      return { valid: true };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Verify email address and send confirmation
   */
  async verifyEmailAddress(leadId: string, email: string): Promise<{
    sent: boolean;
    verificationToken: string;
  }> {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Extract domain
    const domain = email.split('@')[1];

    try {
      // Check if domain has MX records (basic validation)
      if (process.env.VERIFY_MX_RECORDS === 'true') {
        await this.verifyMXRecords(domain);
      }

      // Generate verification token
      const verificationToken = this.generateVerificationToken();

      // Save verification token to database
      await this.prisma.lead.update({
        where: { id: leadId },
        data: {
          // Store token in activity or custom field
          // For now, we'll log it
        },
      });

      // Send verification email
      const verificationLink = `${process.env.WEB_URL}/verify-email?token=${verificationToken}&leadId=${leadId}`;

      await this.emailTransporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Verify Your Email - VANTIQ',
        html: this.getEmailVerificationTemplate(verificationLink),
      });

      return {
        sent: true,
        verificationToken,
      };
    } catch (error) {
      console.error('Email verification failed:', error);
      throw new BadRequestException('Failed to send verification email');
    }
  }

  /**
   * Verify MX records for domain
   */
  private async verifyMXRecords(domain: string): Promise<boolean> {
    try {
      const dns = require('dns');
      const mxRecords = await new Promise((resolve, reject) => {
        dns.resolveMx(domain, (err, addresses) => {
          if (err) reject(err);
          resolve(addresses);
        });
      });

      return Array.isArray(mxRecords) && mxRecords.length > 0;
    } catch (error) {
      throw new BadRequestException(`Invalid email domain: ${domain}`);
    }
  }

  /**
   * Run comprehensive verification on lead
   */
  async verifyLead(leadId: string): Promise<VerificationResult> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new BadRequestException('Lead not found');
    }

    let verificationScore = 0;
    const details: any = {};

    // Verify phone
    let phoneValid = false;
    let phoneVerified = false;
    if (lead.phoneNumber) {
      const phoneResult = await this.verifyPhoneNumber(lead.phoneNumber);
      phoneValid = phoneResult.valid;
      phoneVerified = phoneResult.valid;
      details.phoneCarrier = phoneResult.carrier;
      details.phoneType = phoneResult.type;

      if (phoneValid) verificationScore += 40;
    }

    // Verify email
    let emailValid = false;
    let emailVerified = false;
    if (lead.email) {
      const domain = lead.email.split('@')[1];
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      emailValid = emailRegex.test(lead.email);
      details.emailDomain = domain;
      details.emailDomainValid = emailValid;

      if (emailValid) verificationScore += 40;
    }

    // Verify data completeness
    if (lead.firstName && lead.firstName.length >= 2) verificationScore += 5;
    if (lead.lastName && lead.lastName.length >= 2) verificationScore += 5;
    if (lead.city && lead.city.length >= 2) verificationScore += 5;

    // Update lead with verification status
    await this.prisma.lead.update({
      where: { id: leadId },
      data: {
        status: verificationScore >= 70 ? 'VERIFIED' : 'VERIFICATION_PENDING',
      },
    });

    return {
      phoneValid,
      emailValid,
      phoneVerified,
      emailVerified,
      verificationScore: Math.min(verificationScore, 100),
      details,
    };
  }

  /**
   * Bulk verify leads
   */
  async bulkVerifyLeads(userId: string): Promise<{
    processed: number;
    verified: number;
    failed: number;
    avgScore: number;
  }> {
    const leads = await this.prisma.lead.findMany({
      where: { userId, status: 'NEW' },
      take: 100,
    });

    let verified = 0;
    let failed = 0;
    let totalScore = 0;

    for (const lead of leads) {
      try {
        const result = await this.verifyLead(lead.id);
        totalScore += result.verificationScore;

        if (result.verificationScore >= 70) {
          verified++;
        }
      } catch (error) {
        console.error(`Verification failed for lead ${lead.id}:`, error);
        failed++;
      }
    }

    const avgScore = leads.length > 0 ? Math.round(totalScore / leads.length) : 0;

    return {
      processed: leads.length,
      verified,
      failed,
      avgScore,
    };
  }

  /**
   * Verify phone with OTP
   */
  async sendPhoneOTP(leadId: string): Promise<{ sent: boolean; expiresIn: number }> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || !lead.phoneNumber) {
      throw new BadRequestException('Lead or phone not found');
    }

    try {
      // Generate OTP
      const otp = this.generateOTP();
      const expiresIn = 600; // 10 minutes

      // Send via Twilio or SMS provider
      if (process.env.TWILIO_ACCOUNT_SID) {
        await axios.post(
          `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
          {
            To: lead.phoneNumber,
            From: process.env.TWILIO_PHONE_NUMBER,
            Body: `Your VANTIQ verification code is: ${otp}. Valid for 10 minutes.`,
          },
          {
            auth: {
              username: process.env.TWILIO_ACCOUNT_SID,
              password: process.env.TWILIO_AUTH_TOKEN,
            },
          },
        );
      }

      // Store OTP in cache (or database with expiration)
      // For now, we'll just return success
      return { sent: true, expiresIn };
    } catch (error) {
      console.error('OTP send failed:', error);
      throw new BadRequestException('Failed to send OTP');
    }
  }

  /**
   * Verify phone with OTP
   */
  async verifyPhoneOTP(leadId: string, otp: string): Promise<boolean> {
    // Verify OTP against stored value
    // This is a placeholder - implement actual OTP validation
    const isValid = true; // Placeholder

    if (isValid) {
      await this.prisma.lead.update({
        where: { id: leadId },
        data: { status: 'VERIFICATION_PENDING' },
      });
    }

    return isValid;
  }

  /**
   * Get verification statistics
   */
  async getVerificationStats(userId: string): Promise<{
    totalLeads: number;
    verified: number;
    unverified: number;
    avgVerificationScore: number;
    verificationRate: number;
  }> {
    const leads = await this.prisma.lead.findMany({
      where: { userId },
      select: { status: true },
    });

    const verified = leads.filter((l) => l.status === 'VERIFIED').length;
    const total = leads.length;

    // Calculate average score (from qualification score as proxy)
    const scoresLeads = await this.prisma.lead.findMany({
      where: { userId },
      select: { qualificationScore: true },
    });

    const avgScore =
      scoresLeads.length > 0
        ? Math.round(
            scoresLeads.reduce((sum, l) => sum + l.qualificationScore, 0) /
              scoresLeads.length,
          )
        : 0;

    return {
      totalLeads: total,
      verified,
      unverified: total - verified,
      avgVerificationScore: avgScore,
      verificationRate: total > 0 ? Math.round((verified / total) * 100) : 0,
    };
  }

  /**
   * Generate verification token
   */
  private generateVerificationToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Generate OTP
   */
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Email verification template
   */
  private getEmailVerificationTemplate(verificationLink: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8C7BB8;">Verify Your Email</h2>
        <p>Thank you for signing up with VANTIQ. Please verify your email address by clicking the link below:</p>
        <p style="text-align: center;">
          <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #8C7BB8; color: white; text-decoration: none; border-radius: 4px;">
            Verify Email
          </a>
        </p>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationLink}</p>
        <p style="color: #999; font-size: 12px;">This link expires in 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">VANTIQ - Intelligence That Converts</p>
      </div>
    `;
  }

  /**
   * Check if lead is verified
   */
  async isLeadVerified(leadId: string): Promise<boolean> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    return lead?.status === 'VERIFIED';
  }

  /**
   * Get unverified leads
   */
  async getUnverifiedLeads(userId: string, limit: number = 100): Promise<any[]> {
    return this.prisma.lead.findMany({
      where: {
        userId,
        status: 'NEW',
      },
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        email: true,
      },
    });
  }
}
