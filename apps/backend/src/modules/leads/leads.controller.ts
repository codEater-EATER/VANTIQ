import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LeadsService } from './leads.service';
import { LeadImportService } from './leads.import.service';
import { LeadQualificationService } from './leads.qualification.service';
import { LeadVerificationService } from './leads.verification.service';
import { LeadAIService } from './leads.ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';

@ApiTags('Leads')
@Controller('api/v1/leads')
@UseGuards(JwtAuthGuard)
@ApiSecurity('bearer')
export class LeadsController {
  constructor(
    private leadsService: LeadsService,
    private importService: LeadImportService,
    private qualificationService: LeadQualificationService,
    private verificationService: LeadVerificationService,
    private aiService: LeadAIService,
  ) {}

  @Post()
  async createLead(@Request() req, @Body() body: any) {
    return this.leadsService.createLead(req.user.sub, body);
  }

  @Get()
  async getLeads(@Request() req, @Query() query: any) {
    return this.leadsService.getLeads(req.user.sub, query);
  }

  @Get(':id')
  async getLead(@Param('id') id: string) {
    return this.leadsService.getLead(id);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: any) {
    return this.leadsService.updateLeadStatus(id, body.status, body.reason);
  }

  @Post('import/file')
  @UseInterceptors(FileInterceptor('file'))
  async importLeads(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Query('campaignId') campaignId?: string,
  ) {
    return this.importService.importLeads(
      req.user.sub,
      file.buffer,
      file.originalname,
      campaignId,
    );
  }

  @Get('import/stats')
  async getImportStats(@Request() req) {
    return this.importService.getImportStats(req.user.sub);
  }

  @Post('qualify/bulk')
  async bulkQualify(@Request() req, @Body() body: any) {
    return this.qualificationService.bulkQualify(req.user.sub, body.rules);
  }

  @Get('qualify/stats')
  async getQualificationStats(@Request() req) {
    return this.qualificationService.getQualificationStats(req.user.sub);
  }

  @Get('qualify/:id/score')
  async getQualificationScore(@Param('id') id: string) {
    return this.qualificationService.calculateScore(id);
  }

  @Get('qualify/tiers')
  async getLeadsByTier(@Request() req) {
    return this.qualificationService.getLeadsByTier(req.user.sub);
  }

  @Post('verify/:id')
  async verifyLead(@Param('id') id: string) {
    return this.verificationService.verifyLead(id);
  }

  @Post('verify/bulk')
  async bulkVerifyLeads(@Request() req) {
    return this.verificationService.bulkVerifyLeads(req.user.sub);
  }

  @Get('verify/stats')
  async getVerificationStats(@Request() req) {
    return this.verificationService.getVerificationStats(req.user.sub);
  }

  @Post('verify/:id/send-otp')
  async sendPhoneOTP(@Param('id') id: string) {
    return this.verificationService.sendPhoneOTP(id);
  }

  @Post('ai/score/:id')
  async scoreLeadWithAI(@Param('id') id: string) {
    return this.aiService.scoreLeadWithAI(id);
  }

  @Post('ai/score/bulk')
  async bulkAIScore(@Request() req) {
    return this.aiService.bulkAIScore(req.user.sub);
  }

  @Get('ai/stats')
  async getAIScoringStats(@Request() req) {
    return this.aiService.getAIScoringStats(req.user.sub);
  }
}
