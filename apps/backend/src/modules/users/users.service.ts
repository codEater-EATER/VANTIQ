import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        theme: true,
        accentColor: true,
        creditBalance: true,
      },
    });
  }

  async updateUserProfile(userId: string, data: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}
