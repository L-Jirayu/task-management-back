// auth.controller.ts
import { Controller, Post, UseGuards, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const { access_token } = await this.authService.login(req.user);

    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('access_token', access_token, {
      httpOnly: true,
      sameSite: 'none',        // <<< cross-site ต้อง 'none'
      secure: !isProd ? true : true, // แนะนำให้ true ไว้เลย (Chrome ต้องมี Secure เมื่อ SameSite=None)
      path: '/',
      // domain: ไม่ต้องเซ็ตสำหรับ localhost
    });

    return { message: 'Successfully logged in' };
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      path: '/',
      sameSite: 'none',
      secure: true,
    });
    return { message: 'Logged out' };
  }
}
