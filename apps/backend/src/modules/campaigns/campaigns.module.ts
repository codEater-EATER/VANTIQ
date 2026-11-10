import { Module } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignsAdvancedService } from './campaigns.advanced.service';
import { CampaignsController } from './campaigns.controller';
import { DatabaseModule } from '@/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [CampaignsService, CampaignsAdvancedService],
  controllers: [CampaignsController],
})
export class CampaignsModule {}
