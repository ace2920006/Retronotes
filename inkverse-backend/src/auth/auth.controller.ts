import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    if (process.env.RECAPTCHA_SECRET_KEY && !body.captchaToken) {
      throw new UnauthorizedException('CAPTCHA token is required');
    }
    
    if (body.captchaToken) {
      const isCaptchaValid = await this.authService.verifyCaptcha(body.captchaToken);
      if (!isCaptchaValid) {
        throw new UnauthorizedException('CAPTCHA verification failed');
      }
    }

    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('google')
  async googleAuth(@Body() body: any) {
    if (!body.email || !body.name) {
      throw new UnauthorizedException('Missing required fields from Google profile');
    }
    return this.authService.googleLogin(body.email, body.name, body.image);
  }

  @Post('register')
  async register(@Body() body: any) {
    if (!body.email || !body.password || !body.name) {
      throw new UnauthorizedException('Missing required fields: email, password, name');
    }
    return this.authService.register(body.email, body.name, body.password);
  }
}
