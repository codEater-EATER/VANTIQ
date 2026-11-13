import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('validate')
  async validateUser(
    @Body()
    body: {
      clerkId: string;
      email: string;
      name?: string;
    },
  ) {
    const user = await this.authService.validateOrCreateUser(
      body.clerkId,
      body.email,
      body.name,
    );

    const token = this.authService.generateToken(user.id, user.email);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiSecurity('bearer')
  async getMe(@Request() req: any) {
    return {
      id: req.user.sub,
      email: req.user.email,
    };
  }
}
