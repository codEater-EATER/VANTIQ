import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class QwenService {
  private client: OpenAI;
  private aiProvider: string;

  constructor(private configService: ConfigService) {
    this.aiProvider = this.configService.get('AI_PROVIDER') || 'dashscope';

    if (this.aiProvider === 'ollama') {
      // Local Ollama setup
      this.client = new OpenAI({
        apiKey: 'ollama',
        baseURL: this.configService.get('OLLAMA_API_URL') || 'http://localhost:11434/v1',
      });
    } else {
      // DashScope cloud setup
      this.client = new OpenAI({
        apiKey: this.configService.get('DASHSCOPE_API_KEY'),
        baseURL: 'https://ap-southeast-1.maas.qwencloudapi.com/compatible-mode/v1',
      });
    }
  }

  /**
   * Score a lead using Qwen AI with thinking mode
   */
  async scoreLead(leadData: string): Promise<{
    score: number;
    reasoning: string;
    answer: string;
  }> {
    try {
      const model = this.aiProvider === 'ollama' 
        ? (this.configService.get('OLLAMA_MODEL') || 'qwen2:4b')
        : 'qwen-max';

      const response = await this.client.messages.create({
        model: model,
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `You are a lead qualification expert. Analyze this lead data and provide a score from 0-100 for lead quality. Consider factors like completeness, relevance, and conversion potential.\n\nLead Data:\n${leadData}\n\nProvide: 1) A score (0-100), 2) Brief reasoning, 3) Key factors.`,
          },
        ],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return {
          score: this.extractScore(content.text),
          reasoning: content.text.substring(0, 500),
          answer: content.text,
        };
      }

      return {
        score: 0,
        reasoning: 'Unable to score',
        answer: '',
      };
    } catch (error) {
      console.error('AI API error:', error);
      throw new Error('Failed to score lead with AI');
    }
  }

  /**
   * Generate lead qualification explanation
   */
  async explainQualification(leadData: string): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: 'qwen-max',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: `Explain why this lead is qualified or not, considering industry standards:\n\n${leadData}`,
          },
        ],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return content.text;
      }

      return 'Unable to generate explanation';
    } catch (error) {
      console.error('Qwen API error:', error);
      throw new Error('Failed to generate explanation');
    }
  }

  /**
   * Generate campaign optimization suggestions
   */
  async optimizeCampaign(campaignData: string): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: 'qwen-max',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `As a marketing optimization expert, provide specific recommendations to improve this campaign:\n\n${campaignData}`,
          },
        ],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return content.text;
      }

      return 'Unable to generate recommendations';
    } catch (error) {
      console.error('Qwen API error:', error);
      throw new Error('Failed to optimize campaign');
    }
  }

  private extractScore(text: string): number {
    const scoreMatch = text.match(/(\d+)\s*\/\s*100|score[:\s]+(\d+)/i);
    if (scoreMatch) {
      const score = parseInt(scoreMatch[1] || scoreMatch[2], 10);
      return Math.min(100, Math.max(0, score));
    }
    return 50; // Default score
  }
}
