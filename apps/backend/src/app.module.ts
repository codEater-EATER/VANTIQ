import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { LeadsModule } from './modules/leads/leads.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { BuyersModule } from './modules/buyers/buyers.module';
import { DistributionsModule } from './modules/distributions/distributions.module';
import { CommissionsModule } from './modules/commissions/commissions.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { AIModule } from './modules/ai/ai.module';
import { FilesModule } from './modules/files/files.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ConversationsModule } from './modules/conversations/conversations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    DashboardModule,
    LeadsModule,
    CampaignsModule,
    BuyersModule,
    DistributionsModule,
    CommissionsModule,
    IntegrationsModule,
    AIModule,
    FilesModule,
    ProjectsModule,
    ConversationsModule,
  ],
})
export class AppModule {}
