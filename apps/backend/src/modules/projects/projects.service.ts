import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async getProjects(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      include: { conversations: true, files: true },
    });
  }

  async createProject(userId: string, data: any) {
    return this.prisma.project.create({
      data: {
        userId,
        ...data,
      },
    });
  }
}
