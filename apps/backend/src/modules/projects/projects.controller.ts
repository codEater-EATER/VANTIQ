import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';

@ApiTags('Projects')
@Controller('api/v1/projects')
@UseGuards(JwtAuthGuard)
@ApiSecurity('bearer')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  async getProjects(@Request() req) {
    return this.projectsService.getProjects(req.user.sub);
  }

  @Post()
  async createProject(@Request() req, @Body() body: any) {
    return this.projectsService.createProject(req.user.sub, body);
  }
}
