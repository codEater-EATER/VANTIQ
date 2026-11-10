import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { BuyersService } from './buyers.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';

@ApiTags('Buyers')
@Controller('api/v1/buyers')
@UseGuards(JwtAuthGuard)
@ApiSecurity('bearer')
export class BuyersController {
  constructor(private buyersService: BuyersService) {}

  @Get()
  async getBuyers() {
    return this.buyersService.getBuyers();
  }

  @Post()
  async createBuyer(@Body() body: any) {
    return this.buyersService.createBuyer(body);
  }
}
