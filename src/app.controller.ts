import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { Controller, Get, UseGuards, Post, Request } from '@nestjs/common';

import { AuthService } from './auth/auth.service';

import { LocalAuthGuard } from './auth/guards/local-auth.guard';

@Controller()
export class AppController {
  constructor(
    private authService: AuthService,
  ) {}

  @Get('/about')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  getAbout() {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
