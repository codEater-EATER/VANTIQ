import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  async getFiles(userId: string) {
    return this.prisma.file.findMany({
      where: { userId },
    });
  }

  async uploadFile(userId: string, data: any) {
    return this.prisma.file.create({
      data: {
        userId,
        ...data,
      },
    });
  }
}
