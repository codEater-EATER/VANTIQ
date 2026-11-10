import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadImportService } from './leads.import.service';
import { LeadQualificationService } from './leads.qualification.service';
import { LeadVerificationService } from './leads.verification.service';
import { LeadAIService } from './leads.ai.service';
import { LeadsController } from './leads.controller';
import { DatabaseModule } from '@/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [
    LeadsService,
    LeadImportService,
    LeadQualificationService,
    LeadVerificationService,
    LeadAIService,
  ],
  controllers: [LeadsController],
  exports: [
    LeadsService,
    LeadImportService,
    LeadQualificationService,
    LeadVerificationService,
    LeadAIService,
  ],
})
export class LeadsModule {}
