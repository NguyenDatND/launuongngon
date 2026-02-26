import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiCookieAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function cookieOptions(): { httpOnly: boolean; sameSite: 'strict'; secure: boolean; path: string; maxAge: number } {
  return {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Staff login — returns access token + sets httpOnly refresh cookie' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful. Access token in body; refresh token in Set-Cookie.' })
  @ApiResponse({ status: 401, description: 'INVALID_CREDENTIALS — wrong password, inactive account, or unknown email.' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { result, refreshToken } = await this.authService.login(dto.email, dto.password);
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions());
    return { data: result };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('refresh-cookie')
  @ApiOperation({ summary: 'Rotate refresh token — requires httpOnly refreshToken cookie' })
  @ApiResponse({ status: 200, description: 'New access token issued; new refresh cookie set.' })
  @ApiResponse({ status: 401, description: 'REFRESH_TOKEN_INVALID — missing, revoked, or expired cookie.' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookie = req.cookies?.[REFRESH_COOKIE_NAME];
    const out = await this.authService.refresh(cookie);
    if (!out) {
      throw new UnauthorizedException({
        code: 'REFRESH_TOKEN_INVALID',
        message: 'Refresh token invalid or expired',
      });
    }
    res.cookie(REFRESH_COOKIE_NAME, out.newRefreshToken, cookieOptions());
    return { data: out.result };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('refresh-cookie')
  @ApiOperation({ summary: 'Logout — revokes refresh token and clears cookie' })
  @ApiResponse({ status: 200, description: '{ data: { success: true } }' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookie = req.cookies?.[REFRESH_COOKIE_NAME];
    if (cookie) await this.authService.revokeRefreshTokenByValue(cookie);
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/', httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
    return { data: { success: true } };
  }
}
