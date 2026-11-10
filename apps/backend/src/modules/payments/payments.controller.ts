import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('api/v1/payments')
@UseGuards(JwtAuthGuard)
@ApiSecurity('bearer')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('payment-methods/add')
  async addPaymentMethod(@Request() req, @Body() body: any) {
    return this.paymentsService.addPaymentMethod(req.user.sub, body);
  }

  @Post('process/:commissionId')
  async processPayment(@Param('commissionId') commissionId: string) {
    return this.paymentsService.processPayment(commissionId);
  }

  @Post('batch/:buyerId')
  async processBatchPayment(@Param('buyerId') buyerId: string, @Query('daysThreshold') daysThreshold: number = 30) {
    return this.paymentsService.processBatchPayment(buyerId, daysThreshold);
  }

  @Get('history/:buyerId')
  async getPaymentHistory(@Param('buyerId') buyerId: string, @Query('limit') limit: number = 50) {
    return this.paymentsService.getPaymentHistory(buyerId, limit);
  }

  @Get('stats/:buyerId')
  async getPaymentStats(@Param('buyerId') buyerId: string) {
    return this.paymentsService.getPaymentStats(buyerId);
  }

  @Get('report/:buyerId')
  async generateReport(
    @Param('buyerId') buyerId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.paymentsService.generatePaymentReport(
      buyerId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
