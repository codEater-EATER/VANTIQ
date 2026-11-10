import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('api/v1/files')
@UseGuards(JwtAuthGuard)
@ApiSecurity('bearer')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Get()
  async getFiles(@Request() req) {
    return this.filesService.getFiles(req.user.sub);
  }

  @Post('upload')
  async uploadFile(@Request() req, @Body() body: any) {
    return this.filesService.uploadFile(req.user.sub, body);
  }
}
