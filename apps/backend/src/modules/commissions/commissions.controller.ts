import { Controller, Get, Put, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';

@ApiTags('Commissions')
@Controller('api/v1/commissions')
@UseGuards(JwtAuthGuard)
@ApiSecurity('bearer')
export class CommissionsController {
  constructor(private commissionsService: CommissionsService) {}

  @Get('ledger/:buyerId')
  async getCommissionLedger(@Param('buyerId') buyerId: string) {
    return this.commissionsService.getCommissionLedger(buyerId);
  }

  @Get('stats/:buyerId')
  async getStats(@Param('buyerId') buyerId: string) {
    return this.commissionsService.getCommissionStats(buyerId);
  }

  @Get('payment-schedule/:buyerId')
  async getPaymentSchedule(@Param('buyerId') buyerId: string) {
    return this.commissionsService.generatePaymentSchedule(buyerId);
  }

  @Get('total')
  async getTotalUserCommission(@Request() req: any) {
    return this.commissionsService.getTotalUserCommission(req.user.sub);
  }

  @Put(':id/approve')
  async approveCommission(@Param('id') id: string) {
    return this.commissionsService.approveCommission(id);
  }

  @Put(':id/mark-received')
  async markAsReceived(@Param('id') id: string) {
    return this.commissionsService.markAsReceived(id);
  }

  @Put(':id/mark-paid')
  async markAsPaid(@Param('id') id: string, @Body() body: any) {
    return this.commissionsService.markAsPaid(id, body.paymentReference);
  }

  @Put(':id/dispute')
  async disputeCommission(@Param('id') id: string, @Body() body: any) {
    return this.commissionsService.disputeCommission(id, body.reason);
  }

  @Get('report')
  async generateReport(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.commissionsService.generateCommissionReport(
      req.user.sub,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
