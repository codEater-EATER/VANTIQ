import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class BuyersService {
  constructor(private prisma: PrismaService) {}

  async getBuyers() {
    return this.prisma.buyer.findMany({
      include: { products: true },
    });
  }

  async createBuyer(data: any) {
    return this.prisma.buyer.create({ data });
  }
}
