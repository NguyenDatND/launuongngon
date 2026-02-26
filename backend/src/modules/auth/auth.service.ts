import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';

const INVALID_CREDENTIALS_MSG = 'Invalid email or password.';
const ACCESS_TOKEN_TTL_SEC = 900; // 15 min
const REFRESH_TOKEN_DAYS = 7;

export interface LoginUserPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  branchId: string;
}

export interface TokenResult {
  accessToken: string;
  expiresIn: number;
  user: LoginUserPayload;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<LoginUserPayload | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { branch: true },
    });
    if (!user || !user.isActive) return null;
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      branchId: user.branchId,
    };
  }

  async login(email: string, password: string): Promise<{ result: TokenResult; refreshToken: string }> {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: INVALID_CREDENTIALS_MSG,
      });
    }
    const { accessToken, refreshToken } = await this.issueTokens(user);
    return {
      result: {
        accessToken,
        expiresIn: ACCESS_TOKEN_TTL_SEC,
        user,
      },
      refreshToken,
    };
  }

  private async issueTokens(user: LoginUserPayload): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role, branchId: user.branchId },
      { expiresIn: ACCESS_TOKEN_TTL_SEC },
    );
    const rawRefresh = randomUUID();
    const tokenHash = createHash('sha256').update(rawRefresh).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);
    await this.prisma.refreshToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });
    return { accessToken, refreshToken: rawRefresh };
  }

  async refresh(refreshTokenFromCookie: string | undefined): Promise<{ result: TokenResult; newRefreshToken: string } | null> {
    if (!refreshTokenFromCookie) return null;
    const tokenHash = createHash('sha256').update(refreshTokenFromCookie).digest('hex');
    const token = await this.prisma.refreshToken.findFirst({
      where: { tokenHash },
      include: { user: true },
    });
    if (!token || token.revokedAt || token.expiresAt <= new Date()) return null;
    const user: LoginUserPayload = {
      id: token.user.id,
      email: token.user.email,
      name: token.user.name,
      role: token.user.role,
      branchId: token.user.branchId,
    };
    if (!token.user.isActive) return null;
    await this.revokeRefreshToken(token.id);
    const { accessToken, refreshToken } = await this.issueTokens(user);
    return {
      result: {
        accessToken,
        expiresIn: ACCESS_TOKEN_TTL_SEC,
        user,
      },
      newRefreshToken: refreshToken,
    };
  }

  async revokeRefreshToken(tokenId: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id: tokenId },
      data: { revokedAt: new Date() },
    });
  }

  async revokeRefreshTokenByValue(rawToken: string): Promise<void> {
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  }
}
