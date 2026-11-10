import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import axios from 'axios';
import { Lead } from '@prisma/client';

export interface AIScoreResult {
  leadId: string;
  aiScore: number; // 0-100
  predictedStatus: string;
  factors: {
    name: string;
    weight: number;
    contribution: number;
  }[];
  confidence: number;
  recommendation: string;
}

@Injectable()
export class LeadAIService {
  constructor(private prisma: PrismaService) {}

  /**
   * Score lead using AI model (Qwen/Grok)
   */
  async scoreLeadWithAI(leadId: string): Promise<AIScoreResult> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    // Prepare lead data for AI
    const leadData = this.prepareLead Data(lead);

    try {
      // Call AI model
      const aiScore = await this.callAIModel(leadData);

      // Analyze factors
      const factors = this.extractFactors(aiScore);
      const confidence = this.calculateConfidence(aiScore);
      const recommendation = this.generateRecommendation(aiScore);

      // Save AI score
      await this.prisma.lead.update({
        where: { id: leadId },
        data: {
          qualificationScore: aiScore.score,
          status: this.mapScoreToStatus(aiScore.score),
        },
      });

      return {
        leadId,
        aiScore: aiScore.score,
        predictedStatus: this.mapScoreToStatus(aiScore.score),
        factors,
        confidence,
        recommendation,
      };
    } catch (error) {
      console.error('AI scoring failed:', error);
      // Fallback to rule-based scoring
      return this.fallbackScoring(lead);
    }
  }

  /**
   * Prepare lead data for AI model
   */
  private prepareLeadData(lead: Lead): any {
    return {
      firstName: lead.firstName,
      lastName: lead.lastName,
      phoneNumber: lead.phoneNumber,
      email: lead.email,
      city: lead.city,
      state: lead.state,
      loanType: lead.loanType,
      loanAmount: lead.loanAmount,
      source: lead.source,
      createdAt: lead.createdAt,
      dataCompleteness: this.calculateDataCompleteness(lead),
    };
  }

  /**
   * Call AI model for scoring
   */
  private async callAIModel(leadData: any): Promise<any> {
    const prompt = this.buildAIPrompt(leadData);

    // Try Qwen (Azure AI)
    if (process.env.AZURE_AI_ENDPOINT && process.env.AZURE_AI_API_KEY) {
      try {
        return await this.callQwen(prompt);
      } catch (error) {
        console.error('Qwen call failed, trying Grok:', error);
      }
    }

    // Try Grok API
    if (process.env.GROK_API_KEY) {
      try {
        return await this.callGrok(prompt);
      } catch (error) {
        console.error('Grok call failed, trying Nvidia:', error);
      }
    }

    // Try Nvidia Nemotron
    if (process.env.NVIDIA_API_KEY) {
      try {
        return await this.callNvidia(prompt);
      } catch (error) {
        console.error('Nvidia call failed:', error);
      }
    }

    throw new Error('All AI models failed');
  }

  /**
   * Call Qwen via Azure AI
   */
  private async callQwen(prompt: string): Promise<any> {
    try {
      const response = await axios.post(
        `${process.env.AZURE_AI_ENDPOINT}/deployments/${process.env.AZURE_AI_DEPLOYMENT_NAME}/chat/completions?api-version=2024-02-15-preview`,
        {
          messages: [
            {
              role: 'system',
              content: 'You are a lead qualification AI expert. Score leads on a 0-100 scale.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        },
        {
          headers: {
            'api-key': process.env.AZURE_AI_API_KEY,
            'Content-Type': 'application/json',
          },
        },
      );

      const content = response.data.choices[0].message.content;
      return this.parseAIResponse(content);
    } catch (error) {
      throw new Error(`Qwen API error: ${error}`);
    }
  }

  /**
   * Call Grok API
   */
  private async callGrok(prompt: string): Promise<any> {
    try {
      const response = await axios.post(
        `${process.env.GROK_API_ENDPOINT}/chat/completions`,
        {
          messages: [
            {
              role: 'system',
              content: 'You are a lead qualification AI expert. Score leads on a 0-100 scale.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          model: 'grok-1',
          temperature: 0.7,
          max_tokens: 500,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROK_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const content = response.data.choices[0].message.content;
      return this.parseAIResponse(content);
    } catch (error) {
      throw new Error(`Grok API error: ${error}`);
    }
  }

  /**
   * Call Nvidia Nemotron
   */
  private async callNvidia(prompt: string): Promise<any> {
    try {
      const response = await axios.post(
        `${process.env.NVIDIA_API_ENDPOINT}/chat/completions`,
        {
          messages: [
            {
              role: 'system',
              content: 'You are a lead qualification AI expert. Score leads on a 0-100 scale.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          model: 'meta/llama-2-70b-chat',
          temperature: 0.7,
          max_tokens: 500,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const content = response.data.choices[0].message.content;
      return this.parseAIResponse(content);
    } catch (error) {
      throw new Error(`Nvidia API error: ${error}`);
    }
  }

  /**
   * Parse AI response
   */
  private parseAIResponse(content: string): any {
    try {
      // Extract score from response
      const scoreMatch = content.match(/score[:\s]+(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;

      // Extract factors
      const factorsMatch = content.match(/factors[:\s]*([\s\S]*?)(?=recommendation|$)/i);
      const factors = factorsMatch ? this.extractFactorsFromText(factorsMatch[1]) : [];

      // Extract recommendation
      const recMatch = content.match(/recommendation[:\s]*([\s\S]*?)$/i);
      const recommendation = recMatch ? recMatch[1].trim() : 'Review manually';

      return {
        score: Math.min(100, Math.max(0, score)),
        factors,
        recommendation,
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return { score: 50, factors: [], recommendation: 'Default scoring' };
    }
  }

  /**
   * Build AI prompt
   */
  private buildAIPrompt(leadData: any): string {
    return `
You are a lead qualification expert. Analyze this lead and provide a score from 0-100.

Lead Information:
- Name: ${leadData.firstName} ${leadData.lastName}
- Phone: ${leadData.phoneNumber}
- Email: ${leadData.email}
- Location: ${leadData.city}, ${leadData.state}
- Loan Type: ${leadData.loanType}
- Loan Amount: $${leadData.loanAmount || 'Not specified'}
- Source: ${leadData.source}
- Data Completeness: ${leadData.dataCompleteness}%

Scoring Criteria:
1. Data Completeness (20 points) - All key fields present
2. Contact Quality (30 points) - Valid phone and email
3. Loan Parameters (25 points) - Clear loan type and reasonable amount
4. Lead Freshness (15 points) - Recent leads score higher
5. Geographic Fit (10 points) - Target areas score higher

Please provide:
1. Overall score (0-100)
2. Key factors affecting the score
3. Recommendation (accept/review/reject)

Format your response as:
Score: [number]
Factors:
- [factor]: [contribution]%
Recommendation: [text]
    `;
  }

  /**
   * Extract factors from text
   */
  private extractFactorsFromText(text: string): any[] {
    const factors = [];
    const lines = text.split('\n');

    for (const line of lines) {
      const match = line.match(/([^:]+):\s*(\d+)%/);
      if (match) {
        factors.push({
          name: match[1].trim(),
          weight: 1,
          contribution: parseInt(match[2]),
        });
      }
    }

    return factors;
  }

  /**
   * Calculate data completeness
   */
  private calculateDataCompleteness(lead: Lead): number {
    let complete = 0;
    const total = 8;

    if (lead.firstName) complete++;
    if (lead.lastName) complete++;
    if (lead.phoneNumber) complete++;
    if (lead.email) complete++;
    if (lead.city) complete++;
    if (lead.state) complete++;
    if (lead.loanType) complete++;
    if (lead.loanAmount) complete++;

    return Math.round((complete / total) * 100);
  }

  /**
   * Extract factors
   */
  private extractFactors(aiScore: any): any[] {
    return aiScore.factors || [];
  }

  /**
   * Calculate confidence
   */
  private calculateConfidence(aiScore: any): number {
    // Confidence based on factors count and data completeness
    return Math.min(100, 70 + (aiScore.factors?.length || 0) * 5);
  }

  /**
   * Generate recommendation
   */
  private generateRecommendation(aiScore: any): string {
    if (aiScore.score >= 80) {
      return 'Highly Qualified - Distribute immediately';
    } else if (aiScore.score >= 60) {
      return 'Qualified - Ready for distribution';
    } else if (aiScore.score >= 40) {
      return 'Needs Review - Verify information';
    } else {
      return 'Low Quality - Hold for review';
    }
  }

  /**
   * Map score to status
   */
  private mapScoreToStatus(score: number): string {
    if (score >= 80) return 'QUALIFIED';
    if (score >= 60) return 'VERIFICATION_PENDING';
    return 'NEW';
  }

  /**
   * Fallback scoring (rule-based)
   */
  private fallbackScoring(lead: Lead): AIScoreResult {
    let score = 0;
    const factors = [];

    // Name (20)
    if (lead.firstName?.length >= 2 && lead.lastName?.length >= 2) {
      score += 20;
      factors.push({ name: 'Name Quality', weight: 1, contribution: 20 });
    }

    // Contact (30)
    const hasPhone = lead.phoneNumber?.length >= 10;
    const hasEmail = lead.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email);
    if (hasPhone && hasEmail) {
      score += 30;
      factors.push({ name: 'Contact Quality', weight: 1, contribution: 30 });
    }

    // Location (15)
    if (lead.city && lead.state) {
      score += 15;
      factors.push({ name: 'Location Provided', weight: 1, contribution: 15 });
    }

    // Loan Details (25)
    if (lead.loanType && lead.loanAmount && lead.loanAmount > 0) {
      score += 25;
      factors.push({ name: 'Loan Details', weight: 1, contribution: 25 });
    }

    // Freshness (10)
    const daysSinceCreated = Math.floor((Date.now() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceCreated <= 7) {
      score += 10;
      factors.push({ name: 'Freshness', weight: 1, contribution: 10 });
    }

    return {
      leadId: lead.id,
      aiScore: Math.min(100, score),
      predictedStatus: this.mapScoreToStatus(score),
      factors,
      confidence: 65,
      recommendation: this.generateRecommendation({ score }),
    };
  }

  /**
   * Bulk AI score leads
   */
  async bulkAIScore(userId: string): Promise<{
    processed: number;
    updated: number;
    avgScore: number;
  }> {
    const leads = await this.prisma.lead.findMany({
      where: { userId },
      take: 100,
    });

    let updated = 0;
    let totalScore = 0;

    for (const lead of leads) {
      try {
        const result = await this.scoreLeadWithAI(lead.id);
        totalScore += result.aiScore;
        updated++;
      } catch (error) {
        console.error(`AI scoring failed for lead ${lead.id}:`, error);
      }
    }

    const avgScore = leads.length > 0 ? Math.round(totalScore / leads.length) : 0;

    return {
      processed: leads.length,
      updated,
      avgScore,
    };
  }

  /**
   * Get AI scoring statistics
   */
  async getAIScoringStats(userId: string): Promise<{
    totalScored: number;
    avgAIScore: number;
    highQuality: number;
    mediumQuality: number;
    lowQuality: number;
  }> {
    const leads = await this.prisma.lead.findMany({
      where: { userId },
      select: { qualificationScore: true },
    });

    const scores = leads.map((l) => l.qualificationScore);
    const total = scores.length;

    if (total === 0) {
      return {
        totalScored: 0,
        avgAIScore: 0,
        highQuality: 0,
        mediumQuality: 0,
        lowQuality: 0,
      };
    }

    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / total);
    const highQuality = scores.filter((s) => s >= 80).length;
    const mediumQuality = scores.filter((s) => s >= 60 && s < 80).length;
    const lowQuality = scores.filter((s) => s < 60).length;

    return {
      totalScored: total,
      avgAIScore: avgScore,
      highQuality,
      mediumQuality,
      lowQuality,
    };
  }
}
