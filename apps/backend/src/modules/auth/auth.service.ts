import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/database/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateOrCreateUser(clerkId: string, email: string, name?: string) {
    let user = await this.prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          clerkId,
          email,
          name: name || email.split('@')[0],
          role: Role.LEAD_MANAGER,
        },
      });
    }

    return user;
  }

  generateToken(userId: string, email: string) {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }

  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async checkAuthorization(userId: string, role: Role) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.role !== role && user.role !== Role.SUPER_ADMIN) {
      throw new UnauthorizedException('Insufficient permissions');
    }

    return user;
  }
}
