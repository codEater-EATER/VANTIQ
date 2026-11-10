import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
@ApiSecurity('bearer')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.getUserProfile(req.user.sub);
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() body: any) {
    return this.usersService.updateUserProfile(req.user.sub, body);
  }
}
