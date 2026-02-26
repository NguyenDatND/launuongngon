import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { RedisService } from '../src/common/redis/redis.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testBranchId: string;
  let testUserId: string;

  const mockRedisService = {
    onModuleInit: jest.fn().mockResolvedValue(undefined),
    onModuleDestroy: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(RedisService)
      .useValue(mockRedisService)
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    const branch = await prisma.branch.create({
      data: { name: 'Test Branch', address: 'Addr', phone: '123' },
    });
    testBranchId = branch.id;
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'staff@test.com',
        passwordHash,
        name: 'Staff User',
        role: 'staff',
        branchId: testBranchId,
        isActive: true,
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { email: 'staff@test.com' } });
    await prisma.branch.deleteMany({ where: { id: testBranchId } });
    await app.close();
  });

  describe('POST /api/auth/login', () => {
    it('returns 401 INVALID_CREDENTIALS with message "Invalid email or password." for wrong password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'staff@test.com', password: 'wrong' })
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'Invalid email or password.',
              details: {},
            },
          });
        });
    });

    it('returns 401 INVALID_CREDENTIALS for inactive user', async () => {
      const branch = await prisma.branch.create({
        data: { name: 'Inactive Branch', address: 'A', phone: '1' },
      });
      const hash = await bcrypt.hash('pass', 10);
      await prisma.user.create({
        data: {
          email: 'inactive@test.com',
          passwordHash: hash,
          name: 'Inactive',
          role: 'staff',
          branchId: branch.id,
          isActive: false,
        },
      });
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'inactive@test.com', password: 'pass' })
        .expect(401)
        .expect((res) => {
          expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
          expect(res.body.error.message).toBe('Invalid email or password.');
        });
      await prisma.user.deleteMany({ where: { email: 'inactive@test.com' } });
      await prisma.branch.delete({ where: { id: branch.id } });
    });

    it('returns 401 INVALID_CREDENTIALS for non-existent email (same message to prevent enumeration)', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'any' })
        .expect(401)
        .expect((res) => {
          expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
          expect(res.body.error.message).toBe('Invalid email or password.');
        });
    });

    it('returns 200 and { data: { accessToken, expiresIn, user } } and sets refreshToken cookie for valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'staff@test.com', password: 'password123' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toMatchObject({
            accessToken: expect.any(String),
            expiresIn: 900,
            user: {
              id: testUserId,
              email: 'staff@test.com',
              name: 'Staff User',
              role: 'staff',
              branchId: testBranchId,
            },
          });
          expect(res.body.data.user).not.toHaveProperty('passwordHash');
          const setCookie = res.headers['set-cookie'];
          expect(setCookie).toBeDefined();
          const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
          expect(cookies.some((c: string) => c.startsWith('refreshToken='))).toBe(true);
        });
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('returns 401 REFRESH_TOKEN_INVALID when cookie is missing', () => {
      return request(app.getHttpServer())
        .post('/api/auth/refresh')
        .expect(401)
        .expect((res) => {
          expect(res.body.error.code).toBe('REFRESH_TOKEN_INVALID');
        });
    });

    it('returns 200 and new accessToken when valid refresh cookie is sent', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'staff@test.com', password: 'password123' });
      const cookies = loginRes.headers['set-cookie'];
      const res = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', Array.isArray(cookies) ? cookies : [cookies])
        .expect(200);
      expect(res.body.data).toMatchObject({
        accessToken: expect.any(String),
        expiresIn: 900,
        user: { id: testUserId, email: 'staff@test.com', name: 'Staff User', role: 'staff', branchId: testBranchId },
      });
    });
  });

  describe('POST /api/auth/logout', () => {
    it('returns 200 and { data: { success: true } } and clears refreshToken cookie', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'staff@test.com', password: 'password123' });
      const cookies = loginRes.headers['set-cookie'];
      const res = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Cookie', Array.isArray(cookies) ? cookies : [cookies])
        .expect(200);
      expect(res.body).toEqual({ data: { success: true } });
      const setCookie = res.headers['set-cookie'];
      if (setCookie) {
        const arr = Array.isArray(setCookie) ? setCookie : [setCookie];
        const clear = arr.find((c: string) => c.includes('refreshToken='));
        expect(clear).toMatch(/refreshToken=;/);
      }
    });
  });
});
